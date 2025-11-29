import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { WorkflowBuilder } from './pages/WorkflowBuilder';
import { Library } from './pages/Library';
import { Configuration } from './pages/Configuration';
import { Outputs } from './pages/Outputs';
import { Login } from './pages/Login';
import { useAuth } from './contexts/AuthContext';
import { Moon, Sun, Monitor } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    // Sync activeTab with route
    const path = location.pathname;
    if (path === '/') {
      setActiveTab('dashboard');
    } else if (path === '/builder' || path === '/workflow') {
      setActiveTab('builder');
    } else if (path === '/library') {
      setActiveTab('library');
    } else if (path === '/configuration') {
      setActiveTab('configuration');
    } else if (path === '/outputs') {
      setActiveTab('outputs');
    }
  }, [location]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400">Loading Framework...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }


  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route
        path="/*"
        element={
          <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500/30">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            
            <main className="flex-1 flex flex-col min-w-0 relative">
              {/* Top Bar for Theme Toggle */}
              <div className="absolute top-6 right-6 z-50">
                <button 
                  onClick={toggleTheme}
                  className="p-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all shadow-sm hover:shadow-md"
                  aria-label="Toggle Theme"
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </div>

              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/builder" element={<WorkflowBuilder />} />
                <Route path="/workflow" element={<WorkflowBuilder />} />
                <Route path="/library" element={<Library />} />
                <Route path="/configuration" element={<Configuration />} />
                <Route path="/outputs" element={<Outputs />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        }
      />
    </Routes>
  );
};

export default App;
