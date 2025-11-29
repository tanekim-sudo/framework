import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { 
  FileText, Download, Eye, Trash2, RefreshCw, 
  Upload, X, AlertCircle, CheckCircle 
} from 'lucide-react';
// Fixed: Using RefreshCw instead of Refresh (which doesn't exist in lucide-react)

interface Output {
  name: string;
  size: number;
  modified: string;
}

export const Outputs: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [outputs, setOutputs] = useState<Output[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState('notes');

  useEffect(() => {
    loadOutputs();
  }, []);

  const loadOutputs = async () => {
    setLoading(true);
    try {
      const data = await api.listOutputs();
      setOutputs(data.outputs || []);
    } catch (error) {
      console.error('Error loading outputs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (filename: string) => {
    try {
      const data = await api.getOutput(filename);
      setSelectedFile(filename);
      setFileContent(data.content);
      setViewDialogOpen(true);
    } catch (error) {
      console.error('Error loading file:', error);
      showError('Failed to load file');
    }
  };

  const handleDownload = (filename: string) => {
    api.downloadOutput(filename);
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to delete all outputs?')) return;
    try {
      await api.clearOutputs();
      showSuccess('All outputs cleared successfully!');
      loadOutputs();
    } catch (error) {
      console.error('Error clearing outputs:', error);
      showError('Failed to clear outputs');
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    try {
      await api.uploadInput(uploadFile, uploadType);
      setUploadDialogOpen(false);
      setUploadFile(null);
      showSuccess('File uploaded successfully!');
      loadOutputs();
    } catch (error) {
      console.error('Error uploading file:', error);
      showError('Failed to upload file');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const totalSize = outputs.reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="p-8 h-full overflow-y-auto pb-20 scrollbar-hide">
      <header className="mb-10 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-2">
              Outputs
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              View and download generated workflow outputs
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadOutputs}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button
              onClick={() => setUploadDialogOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
            >
              <Upload size={16} />
              Upload Input
            </button>
            <button
              onClick={handleClearAll}
              disabled={outputs.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-medium text-red-600 dark:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={16} />
              Clear All
            </button>
          </div>
        </div>
      </header>

      {/* Outputs List */}
      <div className="glass-panel p-6 rounded-xl animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Generated Files ({outputs.length})
          </h3>
          {outputs.length > 0 && (
            <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-700 dark:text-blue-300">
              Total: {formatFileSize(totalSize)}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : outputs.length === 0 ? (
          <div className="glass-panel p-8 rounded-xl text-center bg-slate-50 dark:bg-slate-900/40">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">
              No outputs yet. Run the workflow to generate outputs.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {outputs.map((output) => (
              <div
                key={output.name}
                className="glass-panel p-4 rounded-xl hover:shadow-lg transition-all border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {output.name}
                      </h4>
                      <div className="flex gap-4 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <span>{formatFileSize(output.size)}</span>
                        <span>Modified: {new Date(output.modified).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleView(output.name)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleDownload(output.name)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Dialog */}
      {viewDialogOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#0B101B] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slide-up flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h3 className="font-serif font-semibold text-xl text-slate-900 dark:text-white">
                  {selectedFile}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => selectedFile && handleDownload(selectedFile)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download size={18} />
                </button>
                <button
                  onClick={() => setViewDialogOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap font-mono text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                  {fileContent}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Dialog */}
      {uploadDialogOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#0B101B] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-serif font-semibold text-xl text-slate-900 dark:text-white">
                Upload Input File
              </h3>
              <button
                onClick={() => setUploadDialogOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Upload additional input files for the workflow
              </p>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  File
                </label>
                <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  />
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {uploadFile ? uploadFile.name : 'Choose File'}
                    </p>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  File Type
                </label>
                <div className="flex gap-2">
                  {['notes', 'transcripts', 'org_data'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setUploadType(type)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        uploadType === type
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setUploadDialogOpen(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!uploadFile}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Upload size={16} />
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

