import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Badge } from '../components/ui/Badge';
import { 
  Search, Plus, Edit, Trash2, X, Save, Copy, 
  ShieldCheck, Layers, Tag, FileText, AlertCircle, Users
} from 'lucide-react';

interface Block {
  id: string;
  name: string;
  description?: string;
  category: string;
  prompt_text?: string;
  input_variables?: string[];
  tags?: string[];
  usage_count?: number;
  is_template?: boolean;
  created_by?: string;
  is_personal?: boolean;
}

export const Library: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTeamMember, setSelectedTeamMember] = useState<string>('');
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [libraryTab, setLibraryTab] = useState<'firm' | 'project'>('firm');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Discovery',
    prompt_text: '',
    input_variables: [] as string[],
    tags: [] as string[],
  });

  useEffect(() => {
    loadBlocks();
    loadCategories();
    if (libraryTab === 'project') {
      loadTeamMembers();
    }
  }, [searchTerm, selectedCategory, libraryTab, selectedTeamMember]);

  const loadBlocks = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (searchTerm) filters.search = searchTerm;
      if (selectedCategory) filters.category = selectedCategory;
      if (selectedTeamMember) filters.created_by = selectedTeamMember;
      
      // Filter by template status based on tab
      if (libraryTab === 'firm') {
        filters.is_template = true;
      } else {
        filters.is_template = false;
      }
      
      const response = await api.listBlocks(filters);
      if (response && response.success) {
        setBlocks(response.blocks || []);
      } else {
        console.error('Failed to load blocks:', response?.error || 'Unknown error');
        setBlocks([]);
      }
    } catch (error) {
      console.error('Error loading blocks:', error);
      setBlocks([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.getBlockCategories();
      if (response.success) {
        setCategories(response.categories || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadTeamMembers = async () => {
    try {
      const response = await api.getTeamMembers();
      if (response.success) {
        setTeamMembers(response.members || []);
      }
    } catch (error) {
      console.error('Error loading team members:', error);
    }
  };

  const handleCopyToPersonal = async (blockId: string) => {
    try {
      await api.copyBlockToPersonal(blockId);
      showSuccess('Block copied to your personal library!');
      loadBlocks();
    } catch (error: any) {
      showError(error.response?.data?.error || 'Failed to copy block');
    }
  };

  const handleUploadToTeam = async (blockId: string) => {
    try {
      await api.uploadBlockToTeam(blockId);
      showSuccess('Block uploaded to team library!');
      loadBlocks();
    } catch (error: any) {
      showError(error.response?.data?.error || 'Failed to upload block');
    }
  };

  const handleOpenDialog = async (block: Block | null = null) => {
    if (block) {
      setEditingBlock(block);
      // Load full block data
      try {
        const response = await api.getBlock(block.id);
        if (response.success) {
          const fullBlock = response.block;
          setFormData({
            name: fullBlock.name || '',
            description: fullBlock.description || '',
            category: fullBlock.category || 'Discovery',
            prompt_text: fullBlock.prompt_text || '',
            input_variables: fullBlock.input_variables || [],
            tags: fullBlock.tags || [],
          });
        }
      } catch (error) {
        console.error('Error loading block:', error);
        setFormData({
          name: block.name || '',
          description: block.description || '',
          category: block.category || 'Discovery',
          prompt_text: '',
          input_variables: [],
          tags: [],
        });
      }
    } else {
      setEditingBlock(null);
      setFormData({
        name: '',
        description: '',
        category: 'Discovery',
        prompt_text: '',
        input_variables: [],
        tags: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBlock(null);
  };

  const handleSave = async (saveAsCopy = false) => {
    try {
      if (editingBlock) {
        const isOwner = editingBlock.created_by === user?.id;
        const isTeamBlock = !editingBlock.is_personal;
        
        if ((!isOwner && isTeamBlock) || saveAsCopy) {
          await api.saveBlockAsCopy(editingBlock.id, {
            ...formData,
            is_personal: true,
          });
          showSuccess('Block saved as copy to your personal library!');
        } else {
          await api.updateBlock(editingBlock.id, formData);
          showSuccess('Block updated!');
        }
      } else {
        await api.createBlock({
          ...formData,
          is_template: false,
          is_personal: true,
        });
        showSuccess('Block created!');
      }
      handleCloseDialog();
      loadBlocks();
    } catch (error: any) {
      console.error('Error saving block:', error);
      if (error.response?.data?.requires_copy) {
        showError('You do not own this block. Please use "Save as Copy" instead.');
      } else {
        showError(error.response?.data?.error || 'Error saving block. Please try again.');
      }
    }
  };

  const handleDelete = async (blockId: string) => {
    if (!window.confirm('Are you sure you want to delete this block?')) return;
    
    try {
      await api.deleteBlock(blockId);
      showSuccess('Block deleted successfully!');
      loadBlocks();
    } catch (error) {
      console.error('Error deleting block:', error);
      showError('Error deleting block. Please try again.');
    }
  };

  const addInputVariable = () => {
    setFormData(prev => ({
      ...prev,
      input_variables: [...prev.input_variables, ''],
    }));
  };

  const updateInputVariable = (index: number, value: string) => {
    setFormData(prev => {
      const newVars = [...prev.input_variables];
      newVars[index] = value;
      return { ...prev, input_variables: newVars };
    });
  };

  const removeInputVariable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      input_variables: prev.input_variables.filter((_, i) => i !== index),
    }));
  };

  const filteredBlocks = blocks.filter(block => {
    const matchesSearch = !searchTerm || 
      block.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || block.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const CATEGORIES: { [key: string]: string } = {
    Discovery: 'bg-blue-500',
    Analysis: 'bg-cyan-500',
    Recommendations: 'bg-indigo-500',
    Implementation: 'bg-slate-500',
    Evaluation: 'bg-teal-500',
  };

  return (
    <div className="p-8 h-full overflow-y-auto pb-20 scrollbar-hide">
      <header className="mb-10 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-2">
              Block Library
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Create, manage, and reuse prompt blocks across your workflows
            </p>
          </div>
          <button
            onClick={() => handleOpenDialog(null)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg hover:shadow-blue-500/20 transition-all font-semibold"
          >
            <Plus size={18} />
            New Block
          </button>
        </div>

        {/* Library Scope Tabs */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-lg mb-4 w-fit">
          <button 
            onClick={() => setLibraryTab('firm')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all
            ${libraryTab === 'firm' 
              ? 'bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white shadow-sm' 
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <ShieldCheck size={14} /> Firm Verified
          </button>
          <button 
            onClick={() => setLibraryTab('project')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all
            ${libraryTab === 'project' 
              ? 'bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white shadow-sm' 
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <Layers size={14} /> Project Custom
          </button>
        </div>

        {/* Filters */}
        <div className="glass-panel p-4 rounded-xl mb-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search blocks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {libraryTab === 'project' && teamMembers.length > 0 && (
              <select
                value={selectedTeamMember}
                onChange={(e) => setSelectedTeamMember(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              >
                <option value="">All Team Members</option>
                {teamMembers.map(member => (
                  <option key={member.user_id} value={member.user_id}>
                    {member.user_id} ({member.block_count} blocks)
                  </option>
                ))}
              </select>
            )}
            {(searchTerm || selectedCategory || selectedTeamMember) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setSelectedTeamMember('');
                }}
                className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Blocks Grid */}
      {loading ? (
        <div className="flex justify-center items-center p-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredBlocks.length === 0 ? (
        <div className="glass-panel p-8 rounded-xl text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">
            No blocks found. {libraryTab === 'firm' ? 'Firm verified blocks will appear here.' : 'Create your first prompt block to get started!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlocks.map((block) => (
            <div
              key={block.id}
              className="glass-panel p-6 rounded-xl hover:shadow-xl transition-all cursor-pointer group border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {block.name}
                </h3>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!block.is_template && !block.is_personal && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyToPersonal(block.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                      title="Copy to Personal"
                    >
                      <Copy size={16} />
                    </button>
                  )}
                  {!block.is_template && block.is_personal && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUploadToTeam(block.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Upload to Team"
                    >
                      <Users size={16} />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDialog(block);
                    }}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  {!block.is_template && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(block.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                {block.description || 'No description'}
              </p>
              
              <div className="flex gap-2 flex-wrap mb-4">
                <Badge variant="neutral" className={`text-[9px] uppercase tracking-widest ${CATEGORIES[block.category]?.replace('bg-', 'bg-opacity-10 text-') || 'bg-slate-500/10 text-slate-500'} bg-current border-none`}>
                  {block.category}
                </Badge>
                {block.tags?.map((tag, idx) => (
                  <Badge key={idx} variant="neutral" className="text-[9px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <FileText size={12} />
                  Used {block.usage_count || 0} times
                </span>
                {block.is_template && (
                  <ShieldCheck size={12} className="text-blue-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      {openDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#0B101B] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-up flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-serif font-semibold text-xl text-slate-900 dark:text-white">
                {editingBlock ? 'Edit Prompt Block' : 'Create New Prompt Block'}
              </h3>
              <button
                onClick={handleCloseDialog}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  Block Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white"
                  placeholder="Enter block name"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white resize-none"
                  rows={2}
                  placeholder="Brief description of what this block does"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  Prompt Text
                </label>
                <textarea
                  value={formData.prompt_text}
                  onChange={(e) => setFormData({ ...formData, prompt_text: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white font-mono text-sm resize-none"
                  rows={8}
                  placeholder="Enter your prompt template. Use {variable_name} for dynamic inputs."
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Input Variables
                  </label>
                  <button
                    onClick={addInputVariable}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    + Add Variable
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.input_variables.map((varName, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={varName}
                        onChange={(e) => updateInputVariable(index, e.target.value)}
                        className="flex-1 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white text-sm"
                        placeholder="variable_name"
                      />
                      <button
                        onClick={() => removeInputVariable(index)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button
                onClick={handleCloseDialog}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              {editingBlock && (() => {
                const isOwner = editingBlock.created_by === user?.id;
                const isTeamBlock = !editingBlock.is_personal;
                const showSaveAsCopy = !isOwner && isTeamBlock;
                
                if (showSaveAsCopy) {
                  return (
                    <button
                      onClick={() => handleSave(true)}
                      disabled={!formData.name || !formData.prompt_text}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Copy size={16} />
                      Save as Copy
                    </button>
                  );
                } else {
                  return (
                    <button
                      onClick={() => handleSave(false)}
                      disabled={!formData.name || !formData.prompt_text}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Save size={16} />
                      Save
                    </button>
                  );
                }
              })()}
              {!editingBlock && (
                <button
                  onClick={() => handleSave(false)}
                  disabled={!formData.name || !formData.prompt_text}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Plus size={16} />
                  Create
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

