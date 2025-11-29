import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Badge } from '../components/ui/Badge';
import { 
  Search, Plus, Edit, Trash2, X, Save, Copy, 
  Layers, Tag, FileText, AlertCircle, Users, ShieldCheck
} from 'lucide-react';

interface Framework {
  id: string;
  name: string;
  description?: string;
  category?: string;
  block_ids?: string[];
  created_by?: string;
  is_personal?: boolean;
  usage_count?: number;
}

export const Frameworks: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingFramework, setEditingFramework] = useState<Framework | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'General',
    block_ids: [] as string[],
  });
  const [availableBlocks, setAvailableBlocks] = useState<any[]>([]);

  useEffect(() => {
    loadFrameworks();
    loadBlocks();
  }, [searchTerm, selectedCategory]);

  const loadFrameworks = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (searchTerm) filters.search = searchTerm;
      if (selectedCategory) filters.category = selectedCategory;
      
      const response = await api.listFrameworks(filters);
      if (response && response.success) {
        setFrameworks(response.frameworks || []);
      } else {
        console.error('Failed to load frameworks:', response?.error || 'Unknown error');
        setFrameworks([]);
      }
    } catch (error) {
      console.error('Error loading frameworks:', error);
      setFrameworks([]);
    } finally {
      setLoading(false);
    }
  };

  const loadBlocks = async () => {
    try {
      const response = await api.listBlocks({});
      if (response && response.success) {
        setAvailableBlocks(response.blocks || []);
      }
    } catch (error) {
      console.error('Error loading blocks:', error);
    }
  };

  const handleOpenDialog = async (framework: Framework | null = null) => {
    if (framework) {
      setEditingFramework(framework);
      try {
        const response = await api.getFramework(framework.id);
        if (response.success) {
          const fullFramework = response.framework;
          setFormData({
            name: fullFramework.name || '',
            description: fullFramework.description || '',
            category: fullFramework.category || 'General',
            block_ids: fullFramework.block_ids || [],
          });
        }
      } catch (error) {
        console.error('Error loading framework:', error);
      }
    } else {
      setEditingFramework(null);
      setFormData({
        name: '',
        description: '',
        category: 'General',
        block_ids: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingFramework(null);
  };

  const handleSave = async (saveAsCopy = false) => {
    try {
      if (editingFramework) {
        const isOwner = editingFramework.created_by === user?.id;
        
        if ((!isOwner) || saveAsCopy) {
          await api.saveFrameworkAsCopy(editingFramework.id, {
            ...formData,
            is_personal: true,
          });
          showSuccess('Framework saved as copy to your personal library!');
        } else {
          await api.updateFramework(editingFramework.id, formData);
          showSuccess('Framework updated!');
        }
      } else {
        await api.createFramework({
          ...formData,
          is_personal: true,
        });
        showSuccess('Framework created!');
      }
      handleCloseDialog();
      loadFrameworks();
    } catch (error: any) {
      console.error('Error saving framework:', error);
      showError(error.response?.data?.error || 'Error saving framework. Please try again.');
    }
  };

  const handleDelete = async (frameworkId: string) => {
    if (!window.confirm('Are you sure you want to delete this framework?')) return;
    
    try {
      await api.deleteFramework(frameworkId);
      showSuccess('Framework deleted successfully!');
      loadFrameworks();
    } catch (error) {
      console.error('Error deleting framework:', error);
      showError('Error deleting framework. Please try again.');
    }
  };

  const toggleBlockSelection = (blockId: string) => {
    setFormData(prev => ({
      ...prev,
      block_ids: prev.block_ids.includes(blockId)
        ? prev.block_ids.filter(id => id !== blockId)
        : [...prev.block_ids, blockId],
    }));
  };

  const filteredFrameworks = frameworks.filter(framework => {
    const matchesSearch = !searchTerm || 
      framework.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      framework.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || framework.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const CATEGORIES: { [key: string]: string } = {
    General: 'bg-slate-500',
    Analysis: 'bg-cyan-500',
    Discovery: 'bg-blue-500',
    Implementation: 'bg-indigo-500',
  };

  return (
    <div className="p-8 h-full overflow-y-auto pb-20 scrollbar-hide">
      <header className="mb-10 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-2">
              Frameworks
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Create collections of blocks that work together
            </p>
          </div>
          <button
            onClick={() => handleOpenDialog(null)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg hover:shadow-blue-500/20 transition-all font-semibold"
          >
            <Plus size={18} />
            New Framework
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search frameworks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white"
          >
            <option value="">All Categories</option>
            {Object.keys(CATEGORIES).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Frameworks Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500 dark:text-slate-400">Loading frameworks...</p>
          </div>
        </div>
      ) : filteredFrameworks.length === 0 ? (
        <div className="text-center py-20">
          <Layers className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 text-lg mb-2">No frameworks found</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm">Create your first framework to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFrameworks.map((framework) => (
            <div
              key={framework.id}
              className="glass-panel p-6 rounded-xl hover:shadow-xl transition-all cursor-pointer group animate-slide-up"
              onClick={() => handleOpenDialog(framework)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">
                      {framework.name}
                    </h3>
                  </div>
                  {framework.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                      {framework.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDialog(framework);
                    }}
                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(framework.id);
                    }}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {framework.category && (
                  <Badge 
                    className={`${CATEGORIES[framework.category] || 'bg-slate-500'} text-white text-xs`}
                  >
                    {framework.category}
                  </Badge>
                )}
                {framework.block_ids && framework.block_ids.length > 0 && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {framework.block_ids.length} block{framework.block_ids.length !== 1 ? 's' : ''}
                  </span>
                )}
                {framework.usage_count !== undefined && framework.usage_count > 0 && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Used {framework.usage_count} time{framework.usage_count !== 1 ? 's' : ''}
                  </span>
                )}
                {framework.is_personal && (
                  <Badge className="bg-slate-500 text-white text-xs">
                    Personal
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      {openDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">
                {editingFramework ? 'Edit Framework' : 'Create Framework'}
              </h2>
              <button
                onClick={handleCloseDialog}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Framework Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white"
                  placeholder="Enter framework name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white"
                  placeholder="Describe what this framework does"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white"
                >
                  {Object.keys(CATEGORIES).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Select Blocks
                </label>
                <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-2">
                  {availableBlocks.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">No blocks available</p>
                  ) : (
                    availableBlocks.map((block) => (
                      <label
                        key={block.id}
                        className="flex items-center gap-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.block_ids.includes(block.id)}
                          onChange={() => toggleBlockSelection(block.id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {block.name}
                          </div>
                          {block.description && (
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {block.description}
                            </div>
                          )}
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCloseDialog}
                  className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-semibold"
                >
                  Cancel
                </button>
                {editingFramework && editingFramework.created_by !== user?.id && (
                  <button
                    onClick={() => handleSave(true)}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg hover:shadow-blue-500/20 transition-all font-semibold flex items-center justify-center gap-2"
                  >
                    <Copy size={18} />
                    Save as Copy
                  </button>
                )}
                <button
                  onClick={() => handleSave(false)}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg hover:shadow-blue-500/20 transition-all font-semibold flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {editingFramework ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

