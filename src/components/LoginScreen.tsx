/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Lock, 
  User, 
  Mail, 
  Shield, 
  UserPlus, 
  LogIn, 
  Eye, 
  EyeOff, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { User as UserType, UserRole } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (user: UserType) => void;
  registeredUsers: UserType[];
  onRegisterUser: (newUser: UserType) => void;
}

export default function LoginScreen({
  onLoginSuccess,
  registeredUsers,
  onRegisterUser
}: LoginScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Sign up state
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpRole, setSignUpRole] = useState<UserRole>('Agent');

  // Feedback states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username.trim() || !password.trim()) {
      setError('Please fill out all credentials.');
      return;
    }

    // Match by username or email
    const matchedUser = registeredUsers.find(
      (u) => 
        (u.username && u.username.toLowerCase() === username.trim().toLowerCase()) ||
        (u.email.toLowerCase() === username.trim().toLowerCase())
    );

    if (!matchedUser) {
      setError('Invalid username or password.');
      return;
    }

    if (matchedUser.password && matchedUser.password !== password) {
      setError('Invalid username or password.');
      return;
    }

    if (!matchedUser.active) {
      setError('Your account is currently suspended. Please contact Admin.');
      return;
    }

    setSuccess(`Welcome back, ${matchedUser.name}!`);
    setTimeout(() => {
      onLoginSuccess(matchedUser);
    }, 800);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!signUpName.trim() || !signUpEmail.trim() || !signUpUsername.trim() || !signUpPassword.trim()) {
      setError('Please fill in all registration fields.');
      return;
    }

    const emailTaken = registeredUsers.some((u) => u.email.toLowerCase() === signUpEmail.trim().toLowerCase());
    const usernameTaken = registeredUsers.some(
      (u) => u.username && u.username.toLowerCase() === signUpUsername.trim().toLowerCase()
    );

    if (emailTaken) {
      setError('This email is already registered.');
      return;
    }

    if (usernameTaken) {
      setError('This username is already taken.');
      return;
    }

    const newRegisteredUser: UserType = {
      id: `u-${Date.now()}`,
      name: signUpName.trim(),
      email: signUpEmail.trim(),
      role: signUpRole,
      avatar: `https://images.unsplash.com/photo-${['1535713875002-d1d0cf377fde', '1494790108377-be9c29b29330', '1573496359142-b8d87734a5a2', '1507003211169-0a1dd7228f2d'][Math.floor(Math.random() * 4)]}?w=150&auto=format&fit=crop&q=80`,
      active: true,
      username: signUpUsername.trim(),
      password: signUpPassword
    };

    onRegisterUser(newRegisteredUser);
    setSuccess('Registration successful! You can now sign in.');
    
    // Clear registration states & switch to login
    setUsername(signUpUsername.trim());
    setPassword(signUpPassword);
    setIsSignUp(false);
    
    // Reset Sign up inputs
    setSignUpName('');
    setSignUpEmail('');
    setSignUpUsername('');
    setSignUpPassword('');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans" id="login-screen-view">
      
      {/* Decorative ambient subtle grids or neon stars */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.04)_0,transparent_60%)] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Form Container */}
      <div className="w-full max-w-md z-10" id="login-container-card">
        
        {/* CRM Identity Header */}
        <div className="text-center mb-8" id="login-logo-header">
          <div className="inline-flex items-center justify-center p-3 bg-white border border-slate-200 rounded-2xl mb-4 text-indigo-600 shadow-md">
            <TrendingUp className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-black tracking-widest uppercase font-sans text-slate-800">
            Enterprise <span className="text-indigo-600">CRM</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium tracking-wide mt-1">
            Global High-Volume Client Operations Suite
          </p>
        </div>

        {/* Content Box with modern light borders */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl relative" id="login-forms-box">
          <AnimatePresence mode="wait">
            {!isSignUp ? (
              // Sign In Form View
              <motion.div
                key="signin"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
                id="signin-view"
              >
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-1.5">
                    <LogIn className="w-5 h-5 text-indigo-600" /> Sign In to Command Node
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Access your secure CRM dashboard and active clients databases.
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-800 flex items-start gap-2" id="signin-error">
                    <span className="shrink-0 mt-0.5">⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-start gap-2" id="signin-success">
                    <span className="shrink-0 mt-0.5">✓</span>
                    <span>{success}</span>
                  </div>
                )}

                <form onSubmit={handleSignInSubmit} className="space-y-4" id="signin-form">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                      Username or Email
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400">
                        <User className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="test"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-600 text-slate-900 px-10 py-2 rounded-lg text-sm transition focus:outline-none focus:ring-1 focus:ring-indigo-600 placeholder-slate-400"
                        id="signin-username-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                        Password
                      </label>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="test"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-600 text-slate-900 px-10 py-2 rounded-lg text-sm transition focus:outline-none focus:ring-1 focus:ring-indigo-600 placeholder-slate-400"
                        id="signin-password-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 transition"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-black tracking-wide uppercase transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98]"
                    id="signin-btn-submit"
                  >
                    Authenticate Node <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <div className="border-t border-slate-100 pt-4 text-center">
                  <p className="text-xs text-slate-500">
                    Don't have a workspace user?{' '}
                    <button
                      onClick={() => {
                        setError('');
                        setSuccess('');
                        setIsSignUp(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline transition"
                      id="toggle-signup-btn"
                    >
                      Register Profile
                    </button>
                  </p>
                </div>
              </motion.div>
            ) : (
              // Sign Up Form View
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
                id="signup-view"
              >
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-1.5">
                    <UserPlus className="w-5 h-5 text-indigo-600" /> Register Corporate Profile
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Set up your system-gated clearance credentials.
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-800 flex items-start gap-2" id="signup-error">
                    <span className="shrink-0 mt-0.5">⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSignUpSubmit} className="space-y-3" id="signup-form">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Liam Sterling"
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-600 text-slate-900 px-3.5 py-1.5 rounded-lg text-xs transition focus:outline-none focus:ring-1 focus:ring-indigo-600"
                      id="signup-fullname-input"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-400">
                        <Mail className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type="email"
                        required
                        placeholder="liam@enterprise-crm.com"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-600 text-slate-900 pl-9 pr-3.5 py-1.5 rounded-lg text-xs transition focus:outline-none focus:ring-1 focus:ring-indigo-600"
                        id="signup-email-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                        Username
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="liam"
                        value={signUpUsername}
                        onChange={(e) => setSignUpUsername(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-600 text-slate-900 px-3 py-1.5 rounded-lg text-xs transition focus:outline-none focus:ring-1 focus:ring-indigo-600"
                        id="signup-username-input"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                        Password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-600 text-slate-900 px-3 py-1.5 rounded-lg text-xs transition focus:outline-none focus:ring-1 focus:ring-indigo-600"
                        id="signup-password-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1">
                      <Shield className="w-3 h-3 text-indigo-600" /> Access Clearance Role
                    </label>
                    <select
                      value={signUpRole}
                      onChange={(e) => setSignUpRole(e.target.value as UserRole)}
                      className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-600 text-slate-900 px-3 py-1.5 rounded-lg text-xs transition focus:outline-none focus:ring-1 focus:ring-indigo-600 font-semibold cursor-pointer"
                      id="signup-role-select"
                    >
                      <option value="Admin">Admin (Full System Access)</option>
                      <option value="Manager">Manager (Regional Supervisor)</option>
                      <option value="Agent">Agent (Client-Facing Rep)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold tracking-wide uppercase transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98]"
                    id="signup-btn-submit"
                  >
                    Register System Profile <UserPlus className="w-4 h-4" />
                  </button>
                </form>

                <div className="border-t border-slate-100 pt-3 text-center">
                  <p className="text-xs text-slate-500">
                    Already registered?{' '}
                    <button
                      onClick={() => {
                        setError('');
                        setSuccess('');
                        setIsSignUp(false);
                      }}
                      className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline transition"
                      id="toggle-signin-btn"
                    >
                      Sign In here
                    </button>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Demo Credentials Helper Box - pure light grey modern UI */}
        <div className="mt-6 p-4 bg-white border border-slate-200 rounded-xl text-center space-y-1.5" id="demo-credentials-helper">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quick-Access Test Profile
          </p>
          <div className="flex justify-center items-center gap-4 text-xs">
            <span className="text-slate-500 font-medium">Username: <strong className="text-slate-800 font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">test</strong></span>
            <span className="text-slate-500 font-medium">Password: <strong className="text-slate-800 font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">test</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
