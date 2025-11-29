import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, PlusCircle, Library, LogOut, Users, ChevronDown, Settings, FileText, Layers, History } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const { user, currentTeam, logout, switchTeam } = useAuth();
  const { showSuccess, showError } = useToast();
  const [showTeamMenu, setShowTeamMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, path: '/' },
    { id: 'builder', label: 'Workflow', icon: PlusCircle, path: '/builder' },
    { id: 'library', label: 'Library', icon: Library, path: '/library' },
    { id: 'frameworks', label: 'Frameworks', icon: Layers, path: '/frameworks' },
    { id: 'history', label: 'History', icon: History, path: '/history' },
    { id: 'outputs', label: 'Outputs', icon: FileText, path: '/outputs' },
    { id: 'configuration', label: 'Settings', icon: Settings, path: '/configuration' },
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    setActiveTab(item.id);
    navigate(item.path);
  };

  const handleTeamSwitch = async (teamId: string) => {
    await switchTeam(teamId);
    setShowTeamMenu(false);
    window.location.reload(); // Refresh to load new team's data
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleCreateInvite = async () => {
    if (!currentTeam) return;
    try {
      const response = await api.createInvite(currentTeam.id);
      if (response.success) {
        const inviteUrl = `${window.location.origin}/login?code=${response.invite_code}`;
        navigator.clipboard.writeText(inviteUrl);
        showSuccess('Invite link copied to clipboard! Share it with your team members.');
      }
    } catch (error) {
      showError('Failed to create invite code');
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside className="w-20 lg:w-64 h-screen border-r border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#020617] flex flex-col justify-between transition-all duration-300 z-50 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
      <div>
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-100 dark:border-slate-800/40">
          <div className="relative group cursor-pointer flex items-center justify-center">
            <div className="absolute -inset-2 bg-blue-500/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Logo Container */}
            <div className="relative w-8 h-8 flex items-center justify-center">
              {/* Outer Rotated Square */}
              <div className="absolute inset-0 border-[2.5px] border-blue-600 dark:border-blue-500 rounded-[6px] transform rotate-45 group-hover:rotate-12 transition-transform duration-500 ease-out shadow-sm"></div>
              
              {/* Inner Element */}
              <div className="w-3 h-3 bg-blue-600 dark:bg-blue-500 rounded-[2px] transform rotate-45 group-hover:scale-110 transition-transform duration-500"></div>
            </div>
          </div>
          <span className="hidden lg:block ml-4 font-serif font-bold text-xl tracking-tight text-slate-900 dark:text-white">
            Framework
          </span>
        </div>

        <nav className="mt-8 flex flex-col gap-1 px-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`flex items-center p-3 rounded-lg transition-all duration-200 group
                ${activeTab === item.id 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'stroke-[2px]' : 'stroke-[1.5px] opacity-70'}`} />
              <span className={`hidden lg:block ml-3 font-medium text-sm ${activeTab === item.id ? 'font-semibold' : ''}`}>{item.label}</span>
              {activeTab === item.id && (
                <div className="hidden lg:block ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              )}
            </button>
          ))}
        </nav>

        {/* Team Switcher */}
        {user && user.teams && user.teams.length > 0 && (
          <div className="px-3 mt-4">
            <div className="relative">
              <button
                onClick={() => setShowTeamMenu(!showTeamMenu)}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate hidden lg:block">
                    {currentTeam?.name || 'Select Team'}
                  </span>
                </div>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showTeamMenu ? 'rotate-180' : ''}`} />
              </button>
              {showTeamMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                  {user.teams.map((team) => (
                    <button
                      key={team.id}
                      onClick={() => handleTeamSwitch(team.id)}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                        currentTeam?.id === team.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {team.name}
                    </button>
                  ))}
                  <div className="border-t border-slate-200 dark:border-slate-800">
                    <button
                      onClick={handleCreateInvite}
                      className="w-full text-left px-3 py-2 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      + Invite Team Members
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800/40">
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-transparent dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-colors group"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-slate-100 dark:from-blue-900/40 dark:to-slate-800 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs ring-2 ring-white dark:ring-slate-950 group-hover:scale-105 transition-transform flex-shrink-0">
              {user ? getUserInitials(user.name) : 'U'}
            </div>
            <div className="hidden lg:block overflow-hidden flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user?.email || ''}</p>
            </div>
            <LogOut className="w-4 h-4 text-slate-400 hidden lg:block" />
          </button>
          {showUserMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg z-50">
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
              >
                <LogOut className="w-3 h-3" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};