import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { api } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  default_team_id?: string;
  teams: Team[];
}

interface Team {
  id: string;
  name: string;
  organization_id: string;
}

interface AuthContextType {
  user: User | null;
  currentTeam: Team | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string, organizationName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchTeam: (teamId: string) => Promise<{ success: boolean; error?: string }>;
  joinTeam: (inviteCode: string) => Promise<{ success: boolean; error?: string }>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.getCurrentUser();
      if (response.success) {
        setUser(response.user);
        if (response.user.default_team_id) {
          const team = response.user.teams.find((t: Team) => t.id === response.user.default_team_id);
          setCurrentTeam(team || response.user.teams[0] || null);
        } else if (response.user.teams && response.user.teams.length > 0) {
          setCurrentTeam(response.user.teams[0]);
        }
      }
    } catch (error) {
      console.log('Not authenticated');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.login(email, password);
      if (response.success) {
        setUser(response.user);
        if (response.user.default_team_id) {
          const team = response.user.teams.find((t: Team) => t.id === response.user.default_team_id);
          setCurrentTeam(team || response.user.teams[0] || null);
        } else if (response.user.teams && response.user.teams.length > 0) {
          setCurrentTeam(response.user.teams[0]);
        }
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const register = async (email: string, password: string, name: string, organizationName?: string) => {
    try {
      const response = await api.register(email, password, name, organizationName);
      if (response.success) {
        setUser(response.user);
        if (response.user.teams && response.user.teams.length > 0) {
          setCurrentTeam(response.user.teams[0]);
        }
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setCurrentTeam(null);
    }
  };

  const switchTeam = async (teamId: string) => {
    try {
      const response = await api.switchTeam(teamId);
      if (response.success && user) {
        const team = user.teams.find((t: Team) => t.id === teamId);
        setCurrentTeam(team || null);
        setUser({ ...user, default_team_id: teamId });
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to switch team' };
    }
  };

  const joinTeam = async (inviteCode: string) => {
    try {
      const response = await api.joinTeam(inviteCode);
      if (response.success) {
        // Refresh user data to get updated teams
        await checkAuth();
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to join team' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentTeam,
        loading,
        login,
        register,
        logout,
        switchTeam,
        joinTeam,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

