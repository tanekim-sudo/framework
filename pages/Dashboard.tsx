import React from 'react';
import { MOCK_WORKFLOWS } from '../constants';
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

export const Dashboard: React.FC = () => {
  return (
    <div className="p-8 h-full overflow-y-auto pb-20 scrollbar-hide">
      <header className="mb-10 animate-fade-in">
        <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-2">Good morning, John</h1>
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
            <h2 className="text-4xl font-light text-slate-900 dark:text-white tracking-tight">12</h2>
            <span className="text-emerald-500 text-xs font-semibold flex items-center mb-1.5 bg-emerald-500/10 px-1.5 py-0.5 rounded">+2 <ArrowUpRight size={10} className="ml-1"/></span>
          </div>
        </div>
        
        <div className="glass-panel p-6 rounded-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-10 transition-opacity">
            <Clock size={80} />
          </div>
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Hours Saved (AI)</p>
          <div className="flex items-end gap-3">
            <h2 className="text-4xl font-light text-slate-900 dark:text-white tracking-tight">48.5</h2>
            <span className="text-blue-500 text-xs font-semibold mb-1.5 bg-blue-500/10 px-1.5 py-0.5 rounded">Est. $12k value</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-10 transition-opacity">
            <FileText size={80} />
          </div>
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Generated Insights</p>
          <div className="flex items-end gap-3">
            <h2 className="text-4xl font-light text-slate-900 dark:text-white tracking-tight">1,024</h2>
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
              <BarChart data={data}>
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
            <button className="text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-wider">View All</button>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto pr-2">
            {MOCK_WORKFLOWS.map((wf) => (
              <div key={wf.id} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group">
                <div className="flex justify-between items-start mb-1.5">
                  <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 group-hover:text-blue-500 transition-colors">{wf.name}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">{wf.lastModified.toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-3">{wf.description}</p>
                <div className="flex gap-1.5">
                  {wf.tags.map(tag => (
                    <Badge key={tag} variant="neutral" className="text-[9px] px-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">{tag}</Badge>
                  ))}
                </div>
              </div>
            ))}
            <div className="p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-center text-xs text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-colors cursor-pointer h-24 bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/10">
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