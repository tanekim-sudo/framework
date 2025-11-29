import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Badge } from '../components/ui/Badge';
import { ArrowUpRight, Clock, FileText, Activity, Layers } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const data = [
  { name: 'Mon', active: 4 },
  { name: 'Tue', active: 7 },
  { name: 'Wed', active: 5 },
  { name: 'Thu', active: 11 },
  { name: 'Fri', active: 9 },
  { name: 'Sat', active: 3 },
  { name: 'Sun', active: 4 },
];

interface Workflow {
  id: string;
  name: string;
  description?: string;
  updated_at?: string;
  created_at?: string;
  workflow_data?: any;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeWorkflows: 0,
    totalExecutions: 0,
    totalBlocks: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load workflows
      const workflowsResponse = await api.listWorkflows({});
      if (workflowsResponse && workflowsResponse.success) {
        const workflowList = workflowsResponse.workflows || [];
        setWorkflows(workflowList);
        setStats({
          activeWorkflows: workflowList.length,
          totalExecutions: workflowList.reduce((sum: number, wf: any) => sum + (wf.execution_count || 0), 0),
          totalBlocks: workflowList.reduce((sum: number, wf: any) => {
            const steps = wf.workflow_data?.nodes?.length || 0;
            return sum + steps;
          }, 0),
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate activity chart data from last 7 days
  const generateActivityData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const data = days.map((day, index) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - index));
      // Count workflows created/updated on this day
      const count = workflows.filter(wf => {
        const wfDate = wf.updated_at ? new Date(wf.updated_at) : new Date(wf.created_at || '');
        return wfDate.toDateString() === date.toDateString();
      }).length;
      return {
        name: day,
        active: count || 0,
      };
    });
    return data;
  };

  const recentWorkflows = workflows
    .sort((a, b) => {
      const aDate = new Date(a.updated_at || a.created_at || 0).getTime();
      const bDate = new Date(b.updated_at || b.created_at || 0).getTime();
      return bDate - aDate;
    })
    .slice(0, 5);

  const activityData = generateActivityData();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="p-8 h-full overflow-y-auto pb-20 scrollbar-hide">
      <header className="mb-10 animate-fade-in">
        <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-2">
          {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Here's what's happening across your engagements today.</p>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 animate-slide-up">
        <div className="glass-panel p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-10 transition-opacity">
            <Layers size={80} />
          </div>
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Active Workflows</p>
          <div className="flex items-end gap-3">
            <h2 className="text-4xl font-light text-slate-900 dark:text-white tracking-tight">
              {loading ? '...' : stats.activeWorkflows}
            </h2>
{stats.activeWorkflows > 0 && (
              <span className="text-emerald-500 text-xs font-semibold flex items-center mb-1.5 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                Active
              </span>
            )}
          </div>
        </div>
        
        <div className="glass-panel p-6 rounded-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-10 transition-opacity">
            <Clock size={80} />
          </div>
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Hours Saved (AI)</p>
          <div className="flex items-end gap-3">
            <h2 className="text-4xl font-light text-slate-900 dark:text-white tracking-tight">
              {loading ? '...' : Math.round(stats.totalExecutions * 2.5)}
            </h2>
            <span className="text-blue-500 text-xs font-semibold mb-1.5 bg-blue-500/10 px-1.5 py-0.5 rounded">Est. $12k value</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-10 transition-opacity">
            <FileText size={80} />
          </div>
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Generated Insights</p>
          <div className="flex items-end gap-3">
            <h2 className="text-4xl font-light text-slate-900 dark:text-white tracking-tight">
              {loading ? '...' : stats.totalBlocks}
            </h2>
            <span className="text-slate-400 text-xs font-semibold mb-1.5 bg-slate-500/10 px-1.5 py-0.5 rounded">All time</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-8">Workflow Activity</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f1f5f9', fontSize: '12px' }}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                />
                <Bar 
                  dataKey="active" 
                  fill="#3b82f6" 
                  radius={[2, 2, 0, 0]} 
                  barSize={40} 
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent List */}
        <div className="glass-panel p-6 rounded-xl flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Recent Workflows</h3>
            <button 
              onClick={() => navigate('/builder')}
              className="text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-wider"
            >
              View All
            </button>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto pr-2">
            {loading ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">Loading workflows...</div>
            ) : recentWorkflows.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">No workflows yet</div>
            ) : (
              recentWorkflows.map((wf) => (
                <div
                  key={wf.id}
                  onClick={() => navigate('/builder')}
                  className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group"
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 group-hover:text-blue-500 transition-colors">
                      {wf.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {wf.updated_at 
                        ? new Date(wf.updated_at).toLocaleDateString()
                        : wf.created_at 
                        ? new Date(wf.created_at).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                  {wf.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-3">
                      {wf.description}
                    </p>
                  )}
                  {wf.workflow_data?.nodes && (
                    <div className="text-xs text-slate-400">
                      {wf.workflow_data.nodes.length} step{wf.workflow_data.nodes.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              ))
            )}
            <div
              onClick={() => navigate('/builder')}
              className="p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-center text-xs text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-colors cursor-pointer h-24 bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/10"
            >
              <span className="flex items-center gap-2 font-medium"><PlusCircle className="w-4 h-4" /> Create New Workflow</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Quick Icon
function PlusCircle(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="16"></line>
      <line x1="8" y1="12" x2="16" y2="12"></line>
    </svg>
  );
}