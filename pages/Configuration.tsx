import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Save, Eye, EyeOff, Info, Settings } from 'lucide-react';

interface Config {
  client_name?: string;
  industry?: string;
  notes?: string;
  gdrive_folder_id?: string;
  focus_departments?: string;
  anthropic_api_key?: string;
  fireflies_api_key?: string;
  use_fireflies?: boolean;
  anthropic_model?: string;
  has_anthropic_key?: boolean;
}

export const Configuration: React.FC = () => {
  const [config, setConfig] = useState<Config | null>(null);
  const [formData, setFormData] = useState({
    client_name: '',
    industry: '',
    notes: '',
    gdrive_folder_id: '',
    focus_departments: '',
    anthropic_api_key: '',
    fireflies_api_key: '',
    use_fireflies: false,
    anthropic_model: 'claude-sonnet-4-5-20250929',
  });
  const [showApiKeys, setShowApiKeys] = useState({
    anthropic: false,
    fireflies: false,
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await api.getConfig();
      setConfig(data);
      setFormData({
        client_name: data.client_name || '',
        industry: data.industry || '',
        notes: data.notes || '',
        gdrive_folder_id: data.gdrive_folder_id || '',
        focus_departments: data.focus_departments || '',
        anthropic_api_key: '',
        fireflies_api_key: '',
        use_fireflies: data.use_fireflies || false,
        anthropic_model: data.anthropic_model || 'claude-sonnet-4-5-20250929',
      });
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setSaveError('');

    try {
      await api.updateConfig(formData);
      setSaveSuccess(true);
      setTimeout(() => {
        loadConfig();
        setSaveSuccess(false);
      }, 2000);
    } catch (error: any) {
      setSaveError(error.response?.data?.error || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 h-full overflow-y-auto pb-20 scrollbar-hide">
      <header className="mb-10 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
            <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-2">
              Configuration
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Configure your client information and API credentials
            </p>
          </div>
        </div>
      </header>

      {saveSuccess && (
        <div className="glass-panel p-4 rounded-xl mb-6 mb-6 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
          <p className="text-emerald-700 dark:text-emerald-300 text-sm font-medium">
            Configuration saved successfully!
          </p>
        </div>
      )}

      {saveError && (
        <div className="glass-panel p-4 rounded-xl mb-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <p className="text-red-700 dark:text-red-300 text-sm font-medium">
            {saveError}
          </p>
        </div>
      )}

      {/* Client Information */}
      <div className="glass-panel p-6 rounded-xl mb-6 animate-slide-up">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Client Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
              Client Name *
            </label>
            <input
              type="text"
              value={formData.client_name}
              onChange={handleChange('client_name')}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white"
              placeholder="Enter client name"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Name of the client organization</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
              Industry *
            </label>
            <input
              type="text"
              value={formData.industry}
              onChange={handleChange('industry')}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white"
              placeholder="e.g., Healthcare, Finance, Manufacturing"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Industry sector</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={handleChange('notes')}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white resize-none"
              rows={3}
              placeholder="Any special notes or context about the client"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
              Focus Departments
            </label>
            <input
              type="text"
              value={formData.focus_departments}
              onChange={handleChange('focus_departments')}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white"
              placeholder="Operations, Finance, IT, HR"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Comma-separated list</p>
          </div>
        </div>
      </div>

      {/* Data Sources */}
      <div className="glass-panel p-6 rounded-xl mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Data Sources
        </h3>
        
        <div className="glass-panel p-4 rounded-lg mb-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Use <strong>"test"</strong> as the Google Drive Folder ID to run with sample data from the test-client folder.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
              Google Drive Client Folder ID
            </label>
            <input
              type="text"
              value={formData.gdrive_folder_id}
              onChange={handleChange('gdrive_folder_id')}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white"
              placeholder="test"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">The Google Drive folder ID for this client, or "test" for test mode</p>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.use_fireflies}
                onChange={handleChange('use_fireflies')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                Use Fireflies API for transcripts
              </span>
            </label>
          </div>

          {formData.use_fireflies && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Fireflies API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKeys.fireflies ? 'text' : 'password'}
                  value={formData.fireflies_api_key}
                  onChange={handleChange('fireflies_api_key')}
                  className="w-full px-4 py-2.5 pr-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white"
                  placeholder="Enter Fireflies API key"
                />
                <button
                  onClick={() => setShowApiKeys(prev => ({ ...prev, fireflies: !prev.fireflies }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showApiKeys.fireflies ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Your Fireflies API key for fetching meeting transcripts</p>
            </div>
          )}
        </div>
      </div>

      {/* API Configuration */}
      <div className="glass-panel p-6 rounded-xl mb-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          API Configuration
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
              Anthropic API Key
            </label>
            <div className="relative">
              <input
                type={showApiKeys.anthropic ? 'text' : 'password'}
                value={formData.anthropic_api_key}
                onChange={handleChange('anthropic_api_key')}
                className="w-full px-4 py-2.5 pr-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white"
                placeholder={config?.has_anthropic_key ? '••••••••••••••••' : 'Enter Anthropic API key'}
              />
              <button
                onClick={() => setShowApiKeys(prev => ({ ...prev, anthropic: !prev.anthropic }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showApiKeys.anthropic ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Your Anthropic API key (required for AI generation)</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
              Anthropic Model
            </label>
            <select
              value={formData.anthropic_model}
              onChange={handleChange('anthropic_model')}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white"
            >
              <option value="claude-sonnet-4-5-20250929">Claude Sonnet 4.5</option>
              <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
              <option value="claude-3-opus-20240229">Claude 3 Opus</option>
            </select>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Claude model to use for generation</p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || !formData.client_name || !formData.industry}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg hover:shadow-blue-500/20 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            <>
              <Save size={18} />
              Save Configuration
            </>
          )}
        </button>
      </div>
    </div>
  );
};

