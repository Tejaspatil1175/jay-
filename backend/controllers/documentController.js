const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const { v4: uuidv4 } = require('uuid');
const XLSX = require('xlsx');
const pdfParse = require('pdf-parse');
const csv = require('csv-parser');
const Document = require('../models/Document');
const User = require('../models/User');
const groqService = require('../utils/groq');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'image/jpeg',
    'image/png',
    'image/jpg'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, Excel, CSV, and images are allowed.'));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB limit
  },
  fileFilter
});

/**
 * Extract text from document based on file type
 */
async function extractTextFromDocument(filePath, mimeType) {
  try {
    console.log('📄 Extracting text from:', path.basename(filePath), 'Type:', mimeType);

    // PDF files
    if (mimeType === 'application/pdf') {
      const dataBuffer = await fs.readFile(filePath);
      const pdfData = await pdfParse(dataBuffer);
      console.log('✅ PDF extracted:', pdfData.text.length, 'characters');
      return pdfData.text;
    }

    // Excel files (.xlsx, .xls)
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
      const workbook = XLSX.readFile(filePath);
      let extractedText = '';
      
      workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const sheetText = XLSX.utils.sheet_to_csv(sheet);
        extractedText += `\n=== Sheet: ${sheetName} ===\n${sheetText}\n`;
      });
      
      console.log('✅ Excel extracted:', extractedText.length, 'characters');
      return extractedText;
    }

    // CSV files
    if (mimeType === 'text/csv') {
      return new Promise((resolve, reject) => {
        const results = [];
        fsSync.createReadStream(filePath)
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', () => {
            const text = results.map(row => Object.values(row).join(', ')).join('\n');
            console.log('✅ CSV extracted:', text.length, 'characters');
            resolve(text);
          })
          .on('error', reject);
      });
    }

    // Image files - return a placeholder (OCR would require additional setup)
    if (mimeType.includes('image')) {
      console.log('⚠️ Image file detected - OCR not implemented');
      return 'Image file uploaded. OCR extraction not yet implemented.';
    }

    throw new Error('Unsupported file type for text extraction');
  } catch (error) {
    console.error('❌ Text extraction error:', error.message);
    throw new Error('Failed to extract text from document: ' + error.message);
  }
}

/**
 * Analyze document with Groq AI
 */
async function analyzeDocumentWithGroq(extractedText, category) {
  try {
    let prompt = '';

    if (category === 'BANK_STATEMENT') {
      prompt = `
Analyze this bank statement and extract key financial information.

Bank Statement Text:
${extractedText.substring(0, 15000)}

Return a JSON response with:
{
  "summary": "Brief summary of the account activity",
  "keyFindings": ["finding1", "finding2"],
  "financialMetrics": {
    "totalIncome": number,
    "totalExpenses": number,
    "averageBalance": number,
    "largestTransaction": number,
    "transactionCount": number
  },
  "insights": {
    "spendingPattern": "description",
    "savingsRate": number,
    "cashFlow": "positive/negative"
  },
  "chartData": {
    "monthlySpending": {
      "labels": ["Jan", "Feb", "Mar"],
      "values": [1000, 1200, 900]
    },
    "categoryBreakdown": {
      "labels": ["Food", "Rent", "Transport"],
      "values": [500, 1500, 300]
    }
  },
  "risks": ["risk1", "risk2"],
  "opportunities": ["opportunity1", "opportunity2"]
}

Provide only the JSON response, no additional text.
`;
    } else if (category === 'COMPANY_REPORT') {
      prompt = `
Analyze this company financial report and extract key information.

Report Text:
${extractedText.substring(0, 15000)}

Return a JSON response with:
{
  "summary": "Brief summary of company performance",
  "keyFindings": ["finding1", "finding2"],
  "financialMetrics": {
    "revenue": number,
    "netIncome": number,
    "profitMargin": number,
    "growth": number,
    "cashFlow": number
  },
  "insights": {
    "performance": "description",
    "competitivePosition": "description",
    "futureOutlook": "description"
  },
  "chartData": {
    "revenueGrowth": {
      "labels": ["2021", "2022", "2023"],
      "values": [100, 120, 150]
    },
    "profitability": {
      "labels": ["Q1", "Q2", "Q3", "Q4"],
      "values": [10, 12, 15, 18]
    }
  },
  "risks": ["risk1", "risk2"],
  "opportunities": ["opportunity1", "opportunity2"]
}

Provide only the JSON response, no additional text.
`;
    } else {
      prompt = `
Analyze this financial document and extract key information.

Document Text:
${extractedText.substring(0, 15000)}

Return a JSON response with:
{
  "summary": "Brief summary",
  "keyFindings": ["finding1", "finding2"],
  "financialMetrics": {},
  "insights": {},
  "chartData": {},
  "risks": [],
  "opportunities": []
}

Provide only the JSON response, no additional text.
`;
    }

    console.log('🤖 Sending to Groq for analysis...');
    const analysisText = await groqService.generateText(prompt);
    console.log('✅ Groq analysis received');
    
    // Parse JSON from response
    try {
      // Remove markdown code blocks if present
      const cleanText = analysisText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      const analysis = JSON.parse(cleanText);
      return analysis;
    } catch (parseError) {
      console.error('❌ Failed to parse Groq JSON response:', parseError.message);
      // Fallback structure
      return { 
        summary: analysisText, 
        keyFindings: [],
        financialMetrics: {},
        insights: {},
        chartData: {},
        risks: [],
        opportunities: []
      };
    }
  } catch (error) {
    console.error('❌ Groq analysis error:', error.message);
    return { 
      summary: 'Analysis failed: ' + error.message,
      error: error.message 
    };
  }
}

/**
 * Upload and process document
 */
exports.uploadDocument = [
  upload.single('file'),
  async (req, res) => {
    try {
      const userId = req.userId;
      const { category = 'OTHER' } = req.body;

      if (!req.file) {
        return res.status(400).json({
          ok: false,
          error: 'No file uploaded'
        });
      }

      const fileType = req.file.mimetype.includes('pdf') ? 'PDF' :
                       req.file.mimetype.includes('excel') || req.file.mimetype.includes('spreadsheet') ? 'EXCEL' :
                       req.file.mimetype.includes('csv') ? 'CSV' :
                       req.file.mimetype.includes('image') ? 'IMAGE' : 'OTHER';

      // Create document record
      const document = new Document({
        userId,
        documentId: `DOC-${uuidv4()}`,
        fileName: req.file.originalname,
        fileType,
        category,
        fileSize: req.file.size,
        filePath: req.file.path,
        mimeType: req.file.mimetype,
        processingStatus: 'UPLOADED'
      });

      await document.save();

      // Send immediate response
      res.status(201).json({
        ok: true,
        message: 'Document uploaded successfully. Processing started.',
        data: {
          documentId: document.documentId,
          fileName: document.fileName,
          fileType: document.fileType,
          category: document.category,
          fileSize: document.fileSize,
          processingStatus: document.processingStatus
        }
      });

      // Process document asynchronously
      processDocumentAsync(document);

    } catch (error) {
      console.error('Upload document error:', error);
      
      // Clean up file if upload fails
      if (req.file && req.file.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Failed to delete file:', unlinkError);
        }
      }

      res.status(500).json({
        ok: false,
        error: 'Failed to upload document',
        details: error.message
      });
    }
  }
];

/**
 * Process document asynchronously
 */
async function processDocumentAsync(document) {
  try {
    // Update status to extracting
    document.processingStatus = 'EXTRACTING';
    await document.save();

    // Extract text based on file type
    const extractedText = await extractTextFromDocument(document.filePath, document.mimeType);
    
    document.extractedText = extractedText;
    document.processingStatus = 'EXTRACTED';
    await document.save();

    // Analyze with Groq
    document.processingStatus = 'ANALYZING';
    await document.save();

    const analysis = await analyzeDocumentWithGroq(extractedText, document.category);
    
    document.analysis = {
      ...analysis,
      analyzedAt: new Date(),
      llmModel: 'llama-3.3-70b-versatile',
      llmProvider: 'groq'
    };
    
    document.processingStatus = 'COMPLETED';
    await document.save();

    console.log(`✅ Document ${document.documentId} processed successfully`);
  } catch (error) {
    console.error(`❌ Document processing failed for ${document.documentId}:`, error);
    document.processingStatus = 'FAILED';
    document.processingError = error.message;
    await document.save();
  }
}

/**
 * Get all user documents
 */
exports.getDocuments = async (req, res) => {
  try {
    const userId = req.userId;
    const { category, status } = req.query;

    let query = { userId };
    if (category) query.category = category;
    if (status) query.processingStatus = status;

    const documents = await Document.find(query)
      .select('-extractedText') // Exclude large text field
      .sort({ uploadedAt: -1 });

    res.json({
      ok: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch documents',
      details: error.message
    });
  }
};

/**
 * Get document by ID
 */
exports.getDocumentById = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.userId;

    const document = await Document.findOne({ documentId, userId });

    if (!document) {
      return res.status(404).json({
        ok: false,
        error: 'Document not found'
      });
    }

    res.json({
      ok: true,
      data: document
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch document',
      details: error.message
    });
  }
};

/**
 * Delete document
 */
exports.deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.userId;

    const document = await Document.findOne({ documentId, userId });

    if (!document) {
      return res.status(404).json({
        ok: false,
        error: 'Document not found'
      });
    }

    // Delete file from filesystem
    try {
      await fs.unlink(document.filePath);
    } catch (error) {
      console.error('Failed to delete file:', error);
    }

    await Document.deleteOne({ _id: document._id });

    res.json({
      ok: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to delete document',
      details: error.message
    });
  }
};

module.exports = exports;
