import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Badge } from '../components/ui/Badge';
import { 
  History, Clock, CheckCircle, XCircle, AlertCircle, 
  Loader2, Eye, ArrowRight, Calendar, X
} from 'lucide-react';

interface Execution {
  id: string;
  workflow_id: string;
  workflow_name?: string;
  status: 'running' | 'completed' | 'error';
  started_at: string;
  completed_at?: string;
  error_message?: string;
  blocks?: Array<{
    id: string;
    block_name: string;
    status: string;
    started_at: string;
    completed_at?: string;
  }>;
}

export const ExecutionHistory: React.FC = () => {
  const navigate = useNavigate();
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null);

  useEffect(() => {
    loadExecutions();
  }, []);

  const loadExecutions = async () => {
    setLoading(true);
    try {
      // Note: We'll need to implement listExecutions endpoint in backend
      // For now, try to get executions - this might require backend endpoint
      const response = await api.listExecutions();
      if (response && response.success) {
        setExecutions(response.executions || []);
      } else {
        // If endpoint doesn't exist yet, show empty state with helpful message
        setExecutions([]);
      }
    } catch (error) {
      console.error('Error loading executions:', error);
      setExecutions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewExecution = async (executionId: string) => {
    try {
      const response = await api.getExecution(executionId);
      if (response && response.success) {
        setSelectedExecution(response.execution);
      }
    } catch (error) {
      console.error('Error loading execution:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getDuration = (started: string, completed?: string) => {
    const start = new Date(started);
    const end = completed ? new Date(completed) : new Date();
    const diff = (end.getTime() - start.getTime()) / 1000; // seconds
    if (diff < 60) return `${Math.round(diff)}s`;
    if (diff < 3600) return `${Math.round(diff / 60)}m`;
    return `${Math.round(diff / 3600)}h`;
  };

  const statusConfig = {
    running: { icon: Loader2, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Running' },
    completed: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Completed' },
    error: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Error' },
  };

  return (
    <div className="p-8 h-full overflow-y-auto pb-20 scrollbar-hide">
      <header className="mb-10 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-2">
              Execution History
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              View past workflow executions and their results
            </p>
          </div>
        </div>
      </header>

      {/* Execution List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500 dark:text-slate-400">Loading execution history...</p>
          </div>
        </div>
      ) : executions.length === 0 ? (
        <div className="glass-panel p-12 rounded-xl text-center">
          <History className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No Execution History
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Workflow executions will appear here once you run workflows.
          </p>
          <button
            onClick={() => navigate('/builder')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg hover:shadow-blue-500/20 transition-all font-semibold inline-flex items-center gap-2"
          >
            <ArrowRight size={18} />
            Go to Workflow Builder
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {executions.map((execution) => {
            const StatusIcon = statusConfig[execution.status].icon;
            return (
              <div
                key={execution.id}
                className="glass-panel p-6 rounded-xl hover:shadow-xl transition-all cursor-pointer"
                onClick={() => handleViewExecution(execution.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${statusConfig[execution.status].bg}`}>
                        <StatusIcon 
                          className={`w-5 h-5 ${statusConfig[execution.status].color} ${execution.status === 'running' ? 'animate-spin' : ''}`}
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                          {execution.workflow_name || `Workflow ${execution.workflow_id.slice(0, 8)}`}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                          <Calendar size={12} />
                          {formatDate(execution.started_at)}
                        </p>
                      </div>
                    </div>
                    
                    {execution.blocks && execution.blocks.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {execution.blocks.map((block, idx) => (
                          <Badge 
                            key={block.id} 
                            className={`text-xs ${
                              block.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                              block.status === 'error' ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                              'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            }`}
                          >
                            {block.block_name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 ml-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Clock size={14} />
                        <span>{getDuration(execution.started_at, execution.completed_at)}</span>
                      </div>
                      <Badge 
                        className={`mt-2 ${statusConfig[execution.status].bg} ${statusConfig[execution.status].color} border-0`}
                      >
                        {statusConfig[execution.status].label}
                      </Badge>
                    </div>
                    <Eye className="w-5 h-5 text-slate-400" />
                  </div>
                </div>

                {execution.error_message && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {execution.error_message}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Execution Detail Modal */}
      {selectedExecution && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">
                Execution Details
              </h2>
              <button
                onClick={() => setSelectedExecution(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Status
                </h3>
                <Badge className={statusConfig[selectedExecution.status].bg + ' ' + statusConfig[selectedExecution.status].color}>
                  {statusConfig[selectedExecution.status].label}
                </Badge>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Started
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {formatDate(selectedExecution.started_at)}
                </p>
              </div>

              {selectedExecution.completed_at && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Completed
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {formatDate(selectedExecution.completed_at)}
                  </p>
                </div>
              )}

              {selectedExecution.blocks && selectedExecution.blocks.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                    Block Executions
                  </h3>
                  <div className="space-y-2">
                    {selectedExecution.blocks.map((block) => (
                      <div
                        key={block.id}
                        className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-slate-900 dark:text-white">
                            {block.block_name}
                          </h4>
                          <Badge className={statusConfig[block.status as keyof typeof statusConfig]?.bg || 'bg-slate-500/10'}>
                            {block.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {formatDate(block.started_at)}
                          {block.completed_at && ` → ${formatDate(block.completed_at)}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedExecution.error_message && (
                <div>
                  <h3 className="text-sm font-semibold text-red-700 dark:text-red-300 mb-2">
                    Error
                  </h3>
                  <p className="text-sm text-red-600 dark:text-red-400 p-3 bg-red-500/10 rounded-lg">
                    {selectedExecution.error_message}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

