import { useState, useEffect } from 'react';
import { documentService } from '../services/documentService';
import {
  Upload,
  FileText,
  RefreshCw,
  Trash2,
  Download,
  Eye,
  Loader,
  CheckCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import BarChart from '../components/Charts/BarChart';
import PieChart from '../components/Charts/PieChart';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchDocuments();
    // Poll for processing updates every 5 seconds
    const interval = setInterval(() => {
      fetchDocuments(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [filter]);

  const fetchDocuments = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const params = filter !== 'ALL' ? { category: filter } : {};
      const response = await documentService.getDocuments(params);
      if (response.ok) {
        setDocuments(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (25MB limit)
    if (file.size > 25 * 1024 * 1024) {
      alert('File size must be less than 25MB');
      return;
    }

    const category = prompt(
      'Enter document category:\n' +
      '1. BANK_STATEMENT\n' +
      '2. COMPANY_REPORT\n' +
      '3. INCOME_STATEMENT\n' +
      '4. TAX_DOCUMENT\n' +
      '5. OTHER'
    )?.toUpperCase() || 'OTHER';

    setUploading(true);
    try {
      const response = await documentService.uploadDocument(file, category);
      if (response.ok) {
        alert('Document uploaded successfully! Processing started...');
        fetchDocuments();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to upload document');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (docId) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const response = await documentService.deleteDocument(docId);
      if (response.ok) {
        alert('Document deleted successfully');
        fetchDocuments();
        if (selectedDoc?._id === docId) setSelectedDoc(null);
      }
    } catch (error) {
      alert('Failed to delete document');
    }
  };

  const handleView = async (docId) => {
    try {
      const response = await documentService.getDocument(docId);
      if (response.ok) {
        setSelectedDoc(response.data);
      }
    } catch (error) {
      alert('Failed to load document details');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-400 bg-green-500/20';
      case 'PROCESSING':
      case 'ANALYZING':
      case 'EXTRACTING':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'FAILED':
        return 'text-red-400 bg-red-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle size={16} />;
      case 'PROCESSING':
      case 'ANALYZING':
      case 'EXTRACTING':
        return <Loader size={16} className="animate-spin" />;
      case 'FAILED':
        return <AlertCircle size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  // Prepare chart data from selected document
  const getChartData = () => {
    if (!selectedDoc?.analysis?.chartData) return null;

    const { chartData } = selectedDoc.analysis;
    
    if (chartData.type === 'bar' && chartData.labels && chartData.values) {
      return {
        type: 'bar',
        data: chartData.labels.map((label, i) => ({
          name: label,
          value: chartData.values[i]
        }))
      };
    }

    if (chartData.type === 'pie' && chartData.labels && chartData.values) {
      return {
        type: 'pie',
        data: chartData.labels.map((label, i) => ({
          name: label,
          value: chartData.values[i]
        }))
      };
    }

    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const chartData = getChartData();

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">Documents</h1>
            <p className="text-gray-400 mt-2">Upload and analyze financial documents with AI</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => fetchDocuments()}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <RefreshCw size={20} />
              Refresh
            </button>
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer">
              <Upload size={20} />
              {uploading ? 'Uploading...' : 'Upload Document'}
              <input
                type="file"
                onChange={handleUpload}
                accept=".pdf,.xlsx,.xls,.csv,.jpg,.jpeg,.png"
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          {['ALL', 'BANK_STATEMENT', 'COMPANY_REPORT', 'INCOME_STATEMENT', 'TAX_DOCUMENT', 'OTHER'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Documents List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-bold mb-4">Your Documents ({documents.length})</h2>
            
            {documents.length === 0 ? (
              <div className="bg-slate-800 rounded-xl p-12 border border-slate-700 text-center">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">No documents yet</p>
                <p className="text-gray-500 text-sm">Upload your first document to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc._id}
                    className={`bg-slate-800 rounded-lg p-4 border transition-all cursor-pointer ${
                      selectedDoc?._id === doc._id
                        ? 'border-blue-500'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                    onClick={() => handleView(doc._id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm truncate">{doc.fileName}</h3>
                        <p className="text-xs text-gray-400 mt-1">{doc.fileType}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(doc._id);
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 ${getStatusColor(doc.processingStatus)}`}>
                        {getStatusIcon(doc.processingStatus)}
                        {doc.processingStatus}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Document Details */}
          <div className="lg:col-span-2">
            {selectedDoc ? (
              <div className="space-y-6">
                {/* Document Info */}
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">{selectedDoc.fileName}</h2>
                    <span className={`px-3 py-1 rounded-lg text-sm font-semibold flex items-center gap-2 ${getStatusColor(selectedDoc.processingStatus)}`}>
                      {getStatusIcon(selectedDoc.processingStatus)}
                      {selectedDoc.processingStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-400 text-sm">File Type</span>
                      <p className="font-semibold">{selectedDoc.fileType}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Category</span>
                      <p className="font-semibold">{selectedDoc.category}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">File Size</span>
                      <p className="font-semibold">
                        {(selectedDoc.fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Uploaded</span>
                      <p className="font-semibold">
                        {new Date(selectedDoc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Analysis Results */}
                {selectedDoc.analysis && selectedDoc.processingStatus === 'COMPLETED' && (
                  <>
                    {/* Summary */}
                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                      <h3 className="text-xl font-bold mb-4">AI Analysis Summary</h3>
                      <p className="text-gray-300 leading-relaxed">
                        {selectedDoc.analysis.summary}
                      </p>
                    </div>

                    {/* Key Findings */}
                    {selectedDoc.analysis.keyFindings && selectedDoc.analysis.keyFindings.length > 0 && (
                      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                        <h3 className="text-xl font-bold mb-4">Key Findings</h3>
                        <div className="space-y-3">
                          {selectedDoc.analysis.keyFindings.map((finding, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <CheckCircle className="text-green-400 mt-1 flex-shrink-0" size={20} />
                              <p className="text-gray-300">{finding}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Financial Metrics */}
                    {selectedDoc.analysis.financialMetrics && (
                      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                        <h3 className="text-xl font-bold mb-4">Financial Metrics</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(selectedDoc.analysis.financialMetrics).map(([key, value]) => (
                            <div key={key} className="bg-slate-700/30 rounded-lg p-4">
                              <span className="text-gray-400 text-sm capitalize">
                                {key.replace(/([A-Z])/g, ' $1')}
                              </span>
                              <p className="text-xl font-bold mt-1">
                                {typeof value === 'number' ? `$${value.toLocaleString()}` : value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Charts */}
                    {chartData && (
                      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                        {chartData.type === 'bar' && (
                          <BarChart
                            data={chartData.data}
                            dataKeys={['value']}
                            colors={['#3b82f6']}
                            title="Financial Data Visualization"
                            height={300}
                          />
                        )}
                        {chartData.type === 'pie' && (
                          <PieChart
                            data={chartData.data}
                            title="Financial Distribution"
                            height={300}
                          />
                        )}
                      </div>
                    )}

                    {/* Risks */}
                    {selectedDoc.analysis.risks && selectedDoc.analysis.risks.length > 0 && (
                      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                        <h3 className="text-xl font-bold mb-4 text-red-400">Identified Risks</h3>
                        <div className="space-y-3">
                          {selectedDoc.analysis.risks.map((risk, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <AlertCircle className="text-red-400 mt-1 flex-shrink-0" size={20} />
                              <p className="text-gray-300">{risk}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Opportunities */}
                    {selectedDoc.analysis.opportunities && selectedDoc.analysis.opportunities.length > 0 && (
                      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                        <h3 className="text-xl font-bold mb-4 text-green-400">Opportunities</h3>
                        <div className="space-y-3">
                          {selectedDoc.analysis.opportunities.map((opp, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <CheckCircle className="text-green-400 mt-1 flex-shrink-0" size={20} />
                              <p className="text-gray-300">{opp}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Processing Status */}
                {selectedDoc.processingStatus !== 'COMPLETED' && selectedDoc.processingStatus !== 'FAILED' && (
                  <div className="bg-slate-800 rounded-xl p-12 border border-slate-700 text-center">
                    <Loader className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-spin" />
                    <h3 className="text-xl font-bold mb-2">Processing Document...</h3>
                    <p className="text-gray-400">
                      This may take a few moments. The page will update automatically.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">Status: {selectedDoc.processingStatus}</p>
                  </div>
                )}

                {/* Failed Status */}
                {selectedDoc.processingStatus === 'FAILED' && (
                  <div className="bg-slate-800 rounded-xl p-12 border border-red-500/30 text-center">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Processing Failed</h3>
                    <p className="text-gray-400">
                      Failed to process this document. Please try uploading again.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-800 rounded-xl p-12 border border-slate-700 text-center h-full flex items-center justify-center">
                <div>
                  <Eye className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Select a document to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents;
