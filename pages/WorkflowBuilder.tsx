import React, { useState, useEffect, useRef } from 'react';
import { MOCK_LIBRARY, CATEGORIES } from '../constants';
import { PromptBlock, WorkflowStep, BlockCategory } from '../types';
import * as LucideIcons from 'lucide-react';
import { 
  X, Play, Save, Wand2, Plus, Loader2, 
  CheckCircle, Search, FileText, Database, 
  Cpu, ChevronDown, Layers, Box, Terminal, Edit3,
  GripVertical, Lock, ShieldCheck, Share2, 
  FileSpreadsheet, FileJson, Presentation, Globe
} from 'lucide-react';
import { backendAIService } from '../services/backendAIService';
import { api } from '../services/api';
import { Badge } from '../components/ui/Badge';

// --- Types for Local UI State ---
type ModalType = 'none' | 'dataSource' | 'export';

interface DataSource {
  id: string;
  name: string;
  type: 'pdf' | 'csv' | 'drive' | 'salesforce';
  icon: any;
}

// --- Icons Helper ---
const DynamicIcon = ({ name, className }: { name: string, className?: string }) => {
  const Icon = (LucideIcons as any)[name] || LucideIcons.Box;
  return <Icon className={className} />;
};

export const WorkflowBuilder: React.FC = () => {
  // --- Core State ---
  const [workflowName, setWorkflowName] = useState('Untitled Engagement');
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  
  // --- Library State ---
  const [isLibraryOpen, setIsLibraryOpen] = useState(true);
  const [libraryTab, setLibraryTab] = useState<'firm' | 'project'>('firm');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSmartGenerating, setIsSmartGenerating] = useState(false);
  const [smartPrompt, setSmartPrompt] = useState('');

  // --- Execution State ---
  const [executionState, setExecutionState] = useState<'idle' | 'running' | 'completed'>('idle');
  const [activeExecutionStepId, setActiveExecutionStepId] = useState<string | null>(null);

  // --- Modal State ---
  const [activeModal, setActiveModal] = useState<ModalType>('none');
  const [activeStepIdForModal, setActiveStepIdForModal] = useState<string | null>(null);
  
  // --- Flowise & Save State ---
  const [flowiseStatus, setFlowiseStatus] = useState<any>(null);
  const [savedWorkflows, setSavedWorkflows] = useState<any[]>([]);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // --- Refs ---
  const stepsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    stepsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [steps.length]);

  useEffect(() => {
    checkFlowiseStatus();
    loadSavedWorkflows();
  }, []);

  const checkFlowiseStatus = async () => {
    try {
      const response = await api.getFlowiseStatus();
      setFlowiseStatus(response);
    } catch (error) {
      console.error('Error checking Flowise status:', error);
    }
  };

  const loadSavedWorkflows = async () => {
    try {
      const response = await api.listWorkflows();
      if (response.success) {
        setSavedWorkflows(response.workflows || []);
      }
    } catch (error) {
      console.error('Error loading workflows:', error);
    }
  };

  const handleSaveWorkflow = async () => {
    if (steps.length === 0) {
      alert('Cannot save empty workflow');
      return;
    }
    
    setSaving(true);
    try {
      const workflowData = {
        name: workflowName,
        description: `Workflow with ${steps.length} steps`,
        steps: steps.map(step => ({
          block_id: step.blockId,
          custom_prompt: step.customPrompt,
          input_context: step.inputContext,
          order: steps.indexOf(step),
        })),
      };
      
      await api.createWorkflow(workflowData);
      alert('Workflow saved successfully!');
      loadSavedWorkflows();
    } catch (error: any) {
      console.error('Error saving workflow:', error);
      alert(error.response?.data?.error || 'Failed to save workflow');
    } finally {
      setSaving(false);
    }
  };

  const handleLoadWorkflow = async (workflowId: string) => {
    try {
      const response = await api.getWorkflow(workflowId);
      if (response.success && response.workflow) {
        const workflow = response.workflow;
        setWorkflowName(workflow.name || 'Untitled Engagement');
        
        // Convert workflow steps to WorkflowStep format
        const loadedSteps: WorkflowStep[] = (workflow.steps || []).map((step: any, index: number) => {
          const block = getBlockById(step.block_id) || MOCK_LIBRARY[0]; // Fallback to first block
          return {
            id: `step_${Date.now()}_${index}`,
            blockId: step.block_id || block.id,
            status: 'pending' as const,
            inputContext: step.input_context || [],
            isExpanded: true,
            customPrompt: step.custom_prompt || block.defaultPrompt,
          };
        });
        
        setSteps(loadedSteps);
        setLoadDialogOpen(false);
        alert('Workflow loaded successfully!');
      }
    } catch (error: any) {
      console.error('Error loading workflow:', error);
      alert(error.response?.data?.error || 'Failed to load workflow');
    }
  };

  // --- Computed ---
  const filteredLibrary = MOCK_LIBRARY.filter(block => {
    const matchesSearch = block.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          block.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? block.category === selectedCategory : true;
    // Mock filtering by tab - in a real app, blocks would have an 'owner' or 'scope' field
    const matchesTab = libraryTab === 'firm' ? true : block.id.startsWith('ai_'); 
    return matchesSearch && matchesCategory;
  });

  // --- Handlers ---

  const handleSmartGenerate = async () => {
    if (!smartPrompt.trim()) return;
    setIsSmartGenerating(true);
    const newBlock = await backendAIService.generateSmartBlock(smartPrompt);
    setIsSmartGenerating(false);

    if (newBlock) {
      const tempBlockId = `ai_${Date.now()}`;
      (newBlock as any).id = tempBlockId;
      MOCK_LIBRARY.push(newBlock as PromptBlock); // Add to session library
      setLibraryTab('project'); // Switch to project tab to show new block
      addBlockToCanvas(newBlock as PromptBlock);
      setSmartPrompt('');
    }
  };

  const addBlockToCanvas = (block: PromptBlock) => {
    const newStep: WorkflowStep = {
      id: `step_${Date.now()}`,
      blockId: block.id,
      status: 'pending',
      inputContext: block.inputRequirements ? block.inputRequirements.map(req => `Pending: ${req}`) : [],
      isExpanded: true,
      customPrompt: block.defaultPrompt 
    };
    setSteps(prev => [...prev, newStep]);
  };

  const removeStep = (stepId: string) => {
    setSteps(prev => prev.filter(s => s.id !== stepId));
  };

  const toggleStepExpansion = (stepId: string) => {
    setSteps(prev => prev.map(s => s.id === stepId ? { ...s, isExpanded: !s.isExpanded } : s));
  };

  const updateStepPrompt = (stepId: string, newPrompt: string) => {
    setSteps(prev => prev.map(s => s.id === stepId ? { ...s, customPrompt: newPrompt } : s));
  };

  const handleAddDataSource = (stepId: string) => {
    setActiveStepIdForModal(stepId);
    setActiveModal('dataSource');
  };

  const handleAttachSource = (sourceName: string) => {
    if (activeStepIdForModal) {
      setSteps(prev => prev.map(s => 
        s.id === activeStepIdForModal 
          ? { ...s, inputContext: [...(s.inputContext || []), sourceName] }
          : s
      ));
    }
    setActiveModal('none');
    setActiveStepIdForModal(null);
  };

  const handleExportClick = () => {
    setActiveModal('export');
  };

  // Direct execution using Backend Claude (fallback when Flowise not available)
  const runWorkflow = async () => {
    if (steps.length === 0) return;
    setExecutionState('running');
    
    // Reset statuses
    const resetSteps = steps.map(s => ({ 
      ...s, 
      status: 'pending' as const, 
      output: undefined, 
      reasoningTrace: undefined,
      isExpanded: true 
    }));
    setSteps(resetSteps);

    // Sequential Execution
    for (let i = 0; i < resetSteps.length; i++) {
      const currentStep = resetSteps[i];
      const block = getBlockById(currentStep.blockId);
      if (!block) continue;

      setActiveExecutionStepId(currentStep.id);
      
      // Update status to running
      setSteps(prev => prev.map(s => s.id === currentStep.id ? { ...s, status: 'running' } : s));

      // Simulate inputs being fed
      await new Promise(r => setTimeout(r, 600));

      // Execute via Backend Claude
      const prompt = currentStep.customPrompt || block.defaultPrompt || "";
      const previousOutput = i > 0 ? resetSteps[i-1].output : ""; 
      
      const { reasoning, output } = await backendAIService.executeStepWithReasoning(prompt, previousOutput);

      // Update status to completed with output
      setSteps(prev => prev.map(s => s.id === currentStep.id ? { 
        ...s, 
        status: 'completed', 
        reasoningTrace: reasoning,
        output: output 
      } : s));
      
      // Pause before next step
      await new Promise(r => setTimeout(r, 800));
    }

    setExecutionState('completed');
    setActiveExecutionStepId(null);
  };

  const getBlockById = (id: string) => MOCK_LIBRARY.find(b => b.id === id);

  // --- Sub-components ---

  const DataSourceModal = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#0B101B] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-serif font-medium text-lg text-slate-900 dark:text-white">Connect Data Source</h3>
          <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={18}/></button>
        </div>
        <div className="p-2 space-y-1">
          {[
            { id: 'ds1', name: 'Client_Transcripts_Q3.pdf', type: 'pdf', icon: FileText, sub: 'Uploaded 2m ago' },
            { id: 'ds2', name: 'Financial_Model_v2.csv', type: 'csv', icon: FileSpreadsheet, sub: 'Google Drive' },
            { id: 'ds3', name: 'Salesforce_Oppty_Export', type: 'salesforce', icon: Database, sub: 'CRM Integration' },
          ].map(ds => (
            <button 
              key={ds.id}
              onClick={() => handleAttachSource(ds.name)}
              className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ds.icon size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{ds.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{ds.sub}</p>
              </div>
              <Plus size={16} className="ml-auto text-slate-300 group-hover:text-blue-500" />
            </button>
          ))}
           <div className="p-3">
            <button className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-colors">
              + Upload New File
            </button>
           </div>
        </div>
      </div>
    </div>
  );

  const ExportModal = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#0B101B] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
           <h3 className="font-serif font-bold text-2xl text-slate-900 dark:text-white mb-2">Synthesize Deliverable</h3>
           <p className="text-sm text-slate-500 dark:text-slate-400">Choose a format to export your reasoning chain.</p>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          <button className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group flex flex-col items-center text-center gap-3" onClick={() => setActiveModal('none')}>
            <Presentation size={32} className="text-slate-400 group-hover:text-blue-500 transition-colors"/>
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-white">Slide Deck</p>
              <p className="text-xs text-slate-500">PowerPoint (.pptx)</p>
            </div>
          </button>
          <button className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all group flex flex-col items-center text-center gap-3" onClick={() => setActiveModal('none')}>
            <FileText size={32} className="text-slate-400 group-hover:text-emerald-500 transition-colors"/>
             <div>
              <p className="font-bold text-sm text-slate-900 dark:text-white">Blueprint</p>
              <p className="text-xs text-slate-500">Technical Spec (.pdf)</p>
            </div>
          </button>
           <button className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all group flex flex-col items-center text-center gap-3" onClick={() => setActiveModal('none')}>
            <FileJson size={32} className="text-slate-400 group-hover:text-amber-500 transition-colors"/>
             <div>
              <p className="font-bold text-sm text-slate-900 dark:text-white">Raw Data</p>
              <p className="text-xs text-slate-500">JSON / CSV</p>
            </div>
          </button>
           <button className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all group flex flex-col items-center text-center gap-3" onClick={() => setActiveModal('none')}>
            <Globe size={32} className="text-slate-400 group-hover:text-purple-500 transition-colors"/>
             <div>
              <p className="font-bold text-sm text-slate-900 dark:text-white">Notion Page</p>
              <p className="text-xs text-slate-500">Integration</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-full overflow-hidden relative bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans">
      
      {/* --- Modals --- */}
      {activeModal === 'dataSource' && <DataSourceModal />}
      {activeModal === 'export' && <ExportModal />}
      
      {/* Load Workflow Dialog */}
      {loadDialogOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#0B101B] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden animate-slide-up flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-serif font-semibold text-xl text-slate-900 dark:text-white">
                Load Saved Workflow
              </h3>
              <button
                onClick={() => setLoadDialogOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {savedWorkflows.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">No saved workflows found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedWorkflows.map((workflow) => (
                    <button
                      key={workflow.id}
                      onClick={() => handleLoadWorkflow(workflow.id)}
                      className="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all"
                    >
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                        {workflow.name || 'Untitled Workflow'}
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {workflow.description || 'No description'}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        <span>{workflow.steps?.length || 0} steps</span>
                        {workflow.updated_at && (
                          <span>Updated {new Date(workflow.updated_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- LEFT SIDEBAR: LIBRARY --- */}
      <div className={`
        flex-shrink-0 w-80 lg:w-96 bg-white dark:bg-[#050b1a] border-r border-slate-200 dark:border-slate-800/60 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] absolute z-30 h-full lg:static shadow-2xl lg:shadow-none
        ${isLibraryOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0 lg:overflow-hidden'}
      `}>
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/60 backdrop-blur-sm sticky top-0 bg-white/80 dark:bg-[#050b1a]/80 z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif font-semibold text-lg tracking-tight">Block Library</h2>
            <div className="flex items-center gap-2">
               <button onClick={() => setIsLibraryOpen(false)} className="lg:hidden p-1 text-slate-400"><X size={16}/></button>
            </div>
          </div>

          {/* Library Scope Tabs */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-lg mb-4">
            <button 
              onClick={() => setLibraryTab('firm')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-2
              ${libraryTab === 'firm' 
                ? 'bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <ShieldCheck size={12} /> Firm Verified
            </button>
            <button 
              onClick={() => setLibraryTab('project')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-2
              ${libraryTab === 'project' 
                ? 'bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <Layers size={12} /> Project Custom
            </button>
          </div>
          
          {/* Search */}
          <div className="relative mb-3 group">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search frameworks..."
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setSelectedCategory(null)}
              className={`text-[10px] px-2.5 py-1 rounded border transition-all ${!selectedCategory ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent' : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300'}`}
            >
              All
            </button>
            {Object.keys(CATEGORIES).map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                className={`text-[10px] px-2.5 py-1 rounded border transition-all ${selectedCategory === cat ? 'bg-blue-600 text-white border-transparent' : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          
          {/* Smart Creator */}
          <div className="mb-6 animate-fade-in">
             <div className="flex items-center gap-2 mb-2 px-1">
                <Wand2 className="w-3 h-3 text-blue-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">AI Block Creator</span>
              </div>
            <div className="relative group">
               <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg opacity-20 group-hover:opacity-40 transition duration-500 blur-[2px]"></div>
               <div className="relative flex items-center bg-white dark:bg-[#0B101B] rounded-lg border border-slate-200 dark:border-slate-800 focus-within:border-blue-500 dark:focus-within:border-blue-500 transition-colors">
                  <input
                    value={smartPrompt}
                    onChange={(e) => setSmartPrompt(e.target.value)}
                    placeholder="Describe custom logic..."
                    className="w-full bg-transparent text-xs py-2.5 pl-3 pr-9 focus:outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                    onKeyDown={(e) => e.key === 'Enter' && handleSmartGenerate()}
                  />
                  <button 
                    onClick={handleSmartGenerate}
                    disabled={isSmartGenerating || !smartPrompt}
                    className="absolute right-1.5 p-1.5 rounded-md text-slate-400 hover:text-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 transition-all"
                  >
                    {isSmartGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  </button>
               </div>
            </div>
          </div>

          {/* Block Grid */}
          <div className="space-y-4">
            {Object.keys(CATEGORIES).filter(cat => !selectedCategory || selectedCategory === cat).map(cat => {
              const blocks = filteredLibrary.filter(b => b.category === cat);
              if (blocks.length === 0) return null;
              
              return (
                <div key={cat} className="animate-fade-in">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 pl-1 flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${CATEGORIES[cat]}`}></span>
                    {cat}
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {blocks.map(block => (
                      <div 
                        key={block.id}
                        onClick={() => addBlockToCanvas(block)}
                        className="group relative flex flex-col p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B101B] hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer transition-all hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-0.5"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className={`p-2 rounded-lg ${CATEGORIES[block.category].replace('bg-', 'bg-opacity-10 text-')} bg-current`}>
                            <DynamicIcon name={block.iconName} className="w-4 h-4" />
                          </div>
                          {libraryTab === 'firm' && <ShieldCheck size={14} className="text-slate-300 dark:text-slate-700" />}
                        </div>
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{block.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{block.description}</p>
                        
                        {/* Add Button Overlay */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-md">
                            <Plus size={14} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* --- MAIN CANVAS --- */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F1F5F9] dark:bg-[#020617] relative">
        
        {/* Top Navigation Bar */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#020617]/90 backdrop-blur-md flex items-center justify-between px-6 z-20">
          <div className="flex items-center gap-4">
            {!isLibraryOpen && (
              <button onClick={() => setIsLibraryOpen(true)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                <Layers size={20} />
              </button>
            )}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <input 
                  value={workflowName} 
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className="bg-transparent text-lg font-serif font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-0 placeholder-transparent min-w-[200px]" 
                />
                <Badge variant="outline" className="hidden sm:inline-flex items-center gap-1 border-slate-300 dark:border-slate-700 text-slate-500"><Lock size={8}/> Encrypted Workspace</Badge>
              </div>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">LAST EDITED 2 MINS AGO</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLoadDialogOpen(true)}
              className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg transition-all"
              title="Load Workflow"
            >
              <FileText size={20} />
            </button>
            <button
              onClick={handleSaveWorkflow}
              disabled={saving || steps.length === 0}
              className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg transition-all disabled:opacity-50"
              title="Save Workflow"
            >
              {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            </button>
            {flowiseStatus?.configured && flowiseStatus?.reachable && (
              <Badge variant="neutral" className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                Flowise Connected
              </Badge>
            )}
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
            <button 
              onClick={handleExportClick}
              disabled={steps.length === 0}
              className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg transition-all"
              title="Export Deliverable"
            >
              <Share2 size={20} />
            </button>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
            <button 
              onClick={runWorkflow}
              disabled={executionState === 'running' || steps.length === 0}
              className={`
                flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white rounded-full shadow-lg transition-all duration-300
                ${executionState === 'running' 
                  ? 'bg-slate-800 cursor-wait ring-2 ring-blue-500/50' 
                  : 'bg-blue-600 hover:bg-blue-500 hover:shadow-blue-500/20 active:scale-95'
                }
              `}
            >
              {executionState === 'running' ? <Loader2 className="w-4 h-4 animate-spin text-blue-300" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{executionState === 'running' ? 'Executing Chain...' : 'Run Analysis'}</span>
            </button>
          </div>
        </header>

        {/* Canvas Area */}
        <div className="flex-1 overflow-y-auto relative p-6 lg:p-12 scroll-smooth">
          {/* Technical Grid Background */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none" 
            style={{ 
              backgroundImage: `linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)`, 
              backgroundSize: '40px 40px' 
            }} 
          />

          <div className="max-w-4xl mx-auto space-y-12 pb-32 relative z-10">
            {steps.length === 0 ? (
              <div className="flex flex-col items-center justify-center mt-32 animate-fade-in opacity-0 fill-mode-forwards" style={{ animationDelay: '0.1s' }}>
                <div className="w-24 h-24 bg-gradient-to-tr from-slate-100 to-white dark:from-slate-900 dark:to-[#0B101B] rounded-2xl flex items-center justify-center mb-8 shadow-inner border border-slate-200 dark:border-slate-800 rotate-45 transform">
                  <Box className="w-10 h-10 text-slate-300 dark:text-slate-600 -rotate-45" />
                </div>
                <h3 className="text-3xl font-serif font-medium text-slate-900 dark:text-white mb-4">Start Reasoning</h3>
                <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-8 leading-relaxed font-light">
                  Drag logic blocks from the library to construct a transparent, auditable consulting workflow.
                </p>
                <button onClick={() => setIsLibraryOpen(true)} className="px-8 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-sm font-semibold hover:border-blue-500 dark:hover:border-blue-500 transition-colors shadow-sm text-slate-700 dark:text-slate-300">
                  Open Block Library
                </button>
              </div>
            ) : (
              steps.map((step, index) => {
                const block = getBlockById(step.blockId);
                const isActive = activeExecutionStepId === step.id;
                const isCompleted = step.status === 'completed';
                const isPending = step.status === 'pending';
                
                return (
                  <div key={step.id} className="group relative animate-slide-up">
                    {/* Visual Connector Logic */}
                    {index < steps.length - 1 && (
                      <div className="absolute left-[39px] top-16 bottom-[-48px] w-[2px] bg-slate-200 dark:bg-slate-800 -z-10 overflow-hidden rounded-full">
                         {isCompleted && <div className="w-full h-full bg-blue-500/30 shadow-[0_0_8px_rgba(59,130,246,0.3)]"></div>}
                      </div>
                    )}

                    <div className={`
                      relative rounded-2xl border transition-all duration-500 overflow-hidden
                      ${isActive 
                        ? 'bg-white dark:bg-[#0B101B] border-blue-500 shadow-2xl shadow-blue-500/10 ring-1 ring-blue-500/50' 
                        : 'bg-white dark:bg-[#050b1a] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                      }
                    `}>
                      {/* Step Header */}
                      <div 
                        className="flex items-center gap-4 p-5 cursor-pointer select-none"
                        onClick={() => toggleStepExpansion(step.id)}
                      >
                         {/* Drag Handle (Visual Only for now) */}
                         <div className="text-slate-300 dark:text-slate-700 cursor-grab hover:text-slate-500 dark:hover:text-slate-500 transition-colors">
                            <GripVertical size={16} />
                         </div>

                        {/* Status Icon */}
                        <div className={`
                          w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 z-10 shrink-0
                          ${isActive 
                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30' 
                            : isCompleted 
                              ? 'bg-emerald-500 border-emerald-400 text-white'
                              : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                          }
                        `}>
                          {isActive ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                           isCompleted ? <CheckCircle className="w-5 h-5" /> :
                           <span className="font-mono text-sm font-bold">{index + 1}</span>
                          }
                        </div>

                        {/* Title & Meta */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white truncate tracking-tight">{block?.title}</h3>
                            <Badge variant="neutral" className={`text-[9px] uppercase tracking-widest ${CATEGORIES[block?.category || 'Discovery'].replace('bg-', 'bg-opacity-10 text-')} bg-current border-none`}>
                              {block?.category}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-light">{block?.description}</p>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2">
                          {isPending && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); removeStep(step.id); }}
                              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                              <X size={16} />
                            </button>
                          )}
                          <div className={`transform transition-transform duration-300 text-slate-400 ${step.isExpanded ? 'rotate-180' : ''}`}>
                            <ChevronDown size={18} />
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      <div className={`
                        transition-all duration-500 ease-in-out overflow-hidden bg-slate-50/50 dark:bg-black/20
                        ${step.isExpanded ? 'max-h-[1200px] opacity-100 border-t border-slate-100 dark:border-slate-800' : 'max-h-0 opacity-0'}
                      `}>
                        <div className="p-6 space-y-8">
                          
                          {/* 1. INPUTS SECTION */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              <Database className="w-3 h-3" />
                              Input Data Context
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {/* Attached Files */}
                              {step.inputContext?.filter(c => !c.startsWith('Pending:')).map((ctx, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-300 group hover:border-blue-400 dark:hover:border-blue-600 transition-colors shadow-sm">
                                  <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-md">
                                    <FileText className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="truncate flex-1 font-medium">{ctx}</span>
                                  {isCompleted && <CheckCircle className="w-3 h-3 text-emerald-500" />}
                                </div>
                              ))}
                              
                              {/* Pending Requirements */}
                              {step.inputContext?.filter(c => c.startsWith('Pending:')).map((ctx, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-400">
                                   <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></div>
                                   <span className="italic">{ctx.replace('Pending:', 'Required:')}</span>
                                </div>
                              ))}

                              {/* Add Button */}
                              {isPending && (
                                <button 
                                  onClick={() => handleAddDataSource(step.id)}
                                  className="flex items-center justify-center gap-2 p-3 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-colors bg-white/50 dark:bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/10"
                                >
                                  <Plus className="w-4 h-4" /> Add Data Source
                                </button>
                              )}
                            </div>
                          </div>

                          {/* 2. PROMPT CONFIGURATION (Editable) */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              <div className="flex items-center gap-2">
                                <Edit3 className="w-3 h-3" />
                                Reasoning Logic (Prompt)
                              </div>
                              <span className="text-blue-500 text-[9px] cursor-pointer hover:underline" onClick={() => updateStepPrompt(step.id, block?.defaultPrompt || '')}>Reset to Default</span>
                            </div>
                            <div className="relative">
                              <textarea 
                                value={step.customPrompt}
                                onChange={(e) => updateStepPrompt(step.id, e.target.value)}
                                disabled={!isPending}
                                className={`
                                  w-full min-h-[100px] p-4 rounded-xl text-sm font-mono leading-relaxed resize-y focus:outline-none transition-all
                                  ${isPending 
                                    ? 'bg-white dark:bg-[#0F1623] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20' 
                                    : 'bg-slate-50 dark:bg-slate-900/50 border border-transparent text-slate-500 cursor-not-allowed'
                                  }
                                `}
                              />
                            </div>
                          </div>

                          {/* 3. REASONING TRACE */}
                          <div className="space-y-3 animate-fade-in">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              <Cpu className="w-3 h-3" />
                              Reasoning Trace
                            </div>
                            <div className={`
                              rounded-xl p-5 font-mono text-xs leading-relaxed overflow-hidden relative border transition-colors
                              ${isActive || step.reasoningTrace ? 'bg-[#0a0f1e] border-slate-800' : 'bg-slate-100 dark:bg-slate-900/50 border-transparent'}
                            `}>
                              {isActive && <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-shimmer" />}
                              
                              {isActive ? (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 text-blue-300"><Loader2 className="w-3 h-3 animate-spin"/> Initializing context analysis...</div>
                                  <div className="flex items-center gap-2 text-slate-400 opacity-80 pl-5">Applying framework: {block?.title}...</div>
                                  <div className="flex items-center gap-2 text-slate-500 opacity-60 pl-5">Synthesizing intermediate steps...</div>
                                  <div className="h-4 w-2 bg-blue-500 animate-pulse mt-2 ml-1"></div>
                                </div>
                              ) : step.reasoningTrace ? (
                                <div className="text-blue-100 whitespace-pre-wrap">{step.reasoningTrace}</div>
                              ) : (
                                <div className="text-slate-400 italic flex items-center gap-2">
                                  <Terminal className="w-4 h-4" />
                                  Reasoning will appear here during execution...
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 4. FINAL OUTPUT */}
                          {isCompleted && (
                            <div className="space-y-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                               <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <div className="flex items-center gap-2">
                                  <Box className="w-3 h-3" />
                                  Output Deliverable
                                </div>
                                <div className="flex gap-2">
                                  <button onClick={handleExportClick} className="text-blue-500 hover:text-blue-400 flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded text-[10px] font-medium transition-colors"><Save size={12}/> Save to Knowledge Base</button>
                                </div>
                              </div>
                              <div className="p-5 bg-white dark:bg-[#0F1623] border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap shadow-sm font-serif">
                                {step.output}
                              </div>
                            </div>
                          )}

                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={stepsEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};