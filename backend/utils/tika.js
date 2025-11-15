const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

class TikaService {
  constructor() {
    this.tikaURL = process.env.TIKA_URL || 'http://localhost:9998/tika';
  }

  /**
   * Extract text from PDF/Document
   */
  async extractText(filePath) {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      
      const response = await axios.put(this.tikaURL, fileBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Accept': 'text/plain'
        },
        timeout: 30000
      });

      return response.data;
    } catch (error) {
      console.error('Tika Extract Text Error:', error.message);
      
      // Fallback: return basic error message
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Apache Tika server is not running. Please start it first.');
      }
      
      throw error;
    }
  }

  /**
   * Extract metadata from document
   */
  async extractMetadata(filePath) {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      
      const response = await axios.put(`${this.tikaURL}/meta`, fileBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Accept': 'application/json'
        },
        timeout: 30000
      });

      return response.data;
    } catch (error) {
      console.error('Tika Extract Metadata Error:', error.message);
      throw error;
    }
  }

  /**
   * Extract text from Excel/CSV
   */
  async extractFromSpreadsheet(filePath) {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      
      const response = await axios.put(this.tikaURL, fileBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Accept': 'text/plain'
        },
        timeout: 30000
      });

      return response.data;
    } catch (error) {
      console.error('Tika Extract Spreadsheet Error:', error.message);
      throw error;
    }
  }

  /**
   * Check if Tika server is running
   */
  async isServerRunning() {
    try {
      const response = await axios.get(this.tikaURL, {
        timeout: 5000
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new TikaService();
