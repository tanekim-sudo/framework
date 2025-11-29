import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn, UserPlus, Mail, Lock, Shield } from 'lucide-react';

export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, joinTeam } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check for invite code in URL
    const code = searchParams.get('code');
    if (code) {
      setInviteCode(code);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(email, password);
      } else {
        result = await register(email, password, name, organizationName);
      }

      if (result.success) {
        // If there's an invite code, try to join the team
        if (inviteCode) {
          try {
            await joinTeam(inviteCode);
          } catch (err) {
            console.error('Failed to join team:', err);
            // Continue anyway - user is logged in
          }
        }
        navigate('/');
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-[#020617] dark:via-[#0a1629] dark:to-[#020617] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 border-[2.5px] border-blue-600 dark:border-blue-500 rounded-[6px] transform rotate-45"></div>
              <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 rounded-[2px] transform rotate-45 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white -rotate-45" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-2">Framework</h1>
          <p className="text-slate-500 dark:text-slate-400">Transparent Reasoning Platform</p>
        </div>

        {/* Form Card */}
        <div className="glass-panel rounded-2xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                isLogin
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <LogIn className="w-4 h-4 inline mr-2" />
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                !isLogin
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <UserPlus className="w-4 h-4 inline mr-2" />
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserPlus className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={!isLogin}
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                    Organization Name (Optional)
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white"
                      placeholder="Acme Corp"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {inviteCode && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  Team Invitation Code
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="w-full px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white"
                  placeholder="Enter invite code"
                />
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">
          Secure workspace • Enterprise-grade encryption
        </p>
      </div>
    </div>
  );
};

