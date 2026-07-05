/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  ShieldAlert, 
  UserPlus, 
  X, 
  ToggleLeft, 
  ToggleRight, 
  Shield, 
  Lock, 
  CheckCircle, 
  UserCircle,
  AlertTriangle,
  Fingerprint
} from 'lucide-react';
import { User, UserRole } from '../types';

interface RoleManagementProps {
  users: User[];
  currentUser: User;
  onSwitchUser: (userId: string) => void;
  onAddUser: (user: Omit<User, 'id' | 'active'>) => void;
  onUpdateRole: (userId: string, role: UserRole) => void;
  onToggleUserActive: (userId: string) => void;
}

export default function RoleManagement({
  users,
  currentUser,
  onSwitchUser,
  onAddUser,
  onUpdateRole,
  onToggleUserActive
}: RoleManagementProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Agent');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    // Default avatar
    const avatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    ];
    const avatar = avatars[Math.floor(Math.random() * avatars.length)];

    onAddUser({
      name,
      email,
      role,
      avatar
    });

    setIsFormOpen(false);
    setName('');
    setEmail('');
    setRole('Agent');
  };

  return (
    <div className="space-y-6" id="role-management-view">
      {/* Current User Active Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-5 rounded-xl border border-indigo-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4" id="role-banner">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-14 h-14 rounded-full border-2 border-indigo-400 object-cover"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-md font-bold text-white">{currentUser.name}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold font-mono tracking-wider uppercase bg-indigo-500 text-indigo-50 border border-indigo-400`}>
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-indigo-300 font-mono mt-0.5">{currentUser.email}</p>
          </div>
        </div>

        {/* Dynamic testing switcher */}
        <div className="bg-white/10 p-3 rounded-lg border border-white/10" id="testing-profile-switcher-panel">
          <label className="block text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Fingerprint className="w-3 h-3 text-indigo-400" /> Live Role Testing Switcher
          </label>
          <div className="flex flex-wrap gap-1.5" id="tester-buttons">
            {users.map(u => (
              <button
                key={u.id}
                id={`role-switch-to-${u.id}`}
                onClick={() => onSwitchUser(u.id)}
                className={`px-2.5 py-1 text-xs font-bold rounded transition cursor-pointer ${
                  currentUser.id === u.id 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white/15 hover:bg-white/20 text-indigo-100'
                }`}
              >
                {u.name.split(' ')[0]} ({u.role[0]})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Staff Profiles & Role Matrices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="roles-workspace-grid">
        {/* Left Side: Staff Members Directory */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden" id="staff-members-card">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/20" id="staff-header">
            <div>
              <h3 className="text-md font-bold text-slate-900 tracking-tight">Staff Organization Chart</h3>
              <p className="text-xs text-slate-500">Edit personnel profiles and assign credential limits.</p>
            </div>
            {currentUser.role === 'Admin' ? (
              <button
                id="add-staff-btn"
                onClick={() => setIsFormOpen(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" /> Add Personnel
              </button>
            ) : (
              <span className="text-xs text-amber-600 font-semibold flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Admin Only Add
              </span>
            )}
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[480px]" id="staff-list">
            {users.map((staff) => {
              const isSelf = staff.id === currentUser.id;
              const hasAdminPower = currentUser.role === 'Admin';

              return (
                <div key={staff.id} id={`staff-item-${staff.id}`} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                  <div className="flex items-center gap-3">
                    <img
                      src={staff.avatar}
                      alt={staff.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{staff.name}</span>
                        {isSelf && (
                          <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.2 rounded">Self</span>
                        )}
                        {!staff.active && (
                          <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded">Suspended</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-mono">{staff.email}</p>
                    </div>
                  </div>

                  {/* Actions / Role Modifiers */}
                  <div className="flex items-center gap-4">
                    {/* Role dropdown modifier */}
                    {hasAdminPower && !isSelf ? (
                      <select
                        id={`staff-role-select-${staff.id}`}
                        value={staff.role}
                        onChange={(e) => onUpdateRole(staff.id, e.target.value as UserRole)}
                        className="px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden text-slate-700 font-medium"
                      >
                        <option value="Admin">Admin (Full)</option>
                        <option value="Manager">Manager</option>
                        <option value="Agent">Agent (Limited)</option>
                      </select>
                    ) : (
                      <span className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-2 py-1 rounded-md font-semibold">
                        {staff.role}
                      </span>
                    )}

                    {/* Toggle suspension */}
                    {hasAdminPower && !isSelf && (
                      <button
                        id={`staff-toggle-active-${staff.id}`}
                        onClick={() => onToggleUserActive(staff.id)}
                        className="text-slate-400 hover:text-indigo-600 transition"
                      >
                        {staff.active ? (
                          <ToggleRight className="w-6 h-6 text-indigo-600" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-slate-400" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Permission Matrix Panel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-5" id="roles-matrix-card">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldAlert className="w-5 h-5 text-indigo-600" />
            <h3 className="text-md font-bold text-slate-950 tracking-tight">Role Permission Matrix</h3>
          </div>

          <div className="space-y-4" id="matrix-roles-list">
            {/* Admin Block */}
            <div className="p-3 bg-indigo-50/40 rounded-lg border border-indigo-100">
              <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider block mb-1">🛡️ System Administrator</span>
              <p className="text-xs text-indigo-950 mb-2 leading-relaxed">Ultimate executive control. Permitted to authorize invoicing, update corporate inventory counts, alter internal staff roles, and audit system-wide tracking logs.</p>
              <div className="flex flex-wrap gap-1">
                {['Create Client', 'Update Lead', 'Draft Invoice', 'Manage Staff', 'Clean logs'].map((tag) => (
                  <span key={tag} className="text-[10px] bg-white text-indigo-700 border border-indigo-100 px-1.5 py-0.2 rounded font-semibold font-mono">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Manager Block */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">💼 Operations Manager</span>
              <p className="text-xs text-slate-700 mb-2 leading-relaxed">Mid-level administrative powers. Can register clients, schedule appointments, and move sales pipeline stages. Restricted from modifying staff roles, clearing logs, or deleting invoiced slips.</p>
              <div className="flex flex-wrap gap-1">
                {['Create Client', 'Update Lead', 'View Inventory', 'Adjust Stock'].map((tag) => (
                  <span key={tag} className="text-[10px] bg-white text-slate-600 border border-slate-200 px-1.5 py-0.2 rounded font-semibold font-mono">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Agent Block */}
            <div className="p-3 bg-rose-50/20 rounded-lg border border-rose-100">
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block mb-1">👤 Sales Agent</span>
              <p className="text-xs text-rose-950 mb-2 leading-relaxed">Client-facing rep. Scope limited strictly to booking meetings and managing assigned sales leads. Read-only limits placed on stock valuation indices and corporate invoices.</p>
              <div className="flex flex-wrap gap-1">
                {['Book Call', 'Update Assigned Lead', 'Read Stock'].map((tag) => (
                  <span key={tag} className="text-[10px] bg-white text-rose-700 border border-rose-100 px-1.5 py-0.2 rounded font-semibold font-mono">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Staff Dialog */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50" id="staff-form-modal">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-md font-bold text-slate-900">
                  Register New Staff Member
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Miller"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Corporate Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. john@enterprise-crm.com"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Assigned Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Agent">Agent</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition"
                  >
                    Authorize Staff
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
