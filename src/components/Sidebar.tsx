/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Users, 
  Calendar, 
  Package, 
  TrendingUp, 
  FileText, 
  ShieldAlert, 
  BarChart, 
  LayoutDashboard, 
  Menu, 
  X, 
  FileCode2,
  BookOpen,
  LogOut,
  Sparkles
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: User;
  isMobileOpen: boolean;
  onToggleMobile: () => void;
  onLogout?: () => void;
  onUpgradeClick?: () => void;
}

export default function Sidebar({
  activeTab,
  onSelectTab,
  currentUser,
  isMobileOpen,
  onToggleMobile,
  onLogout,
  onUpgradeClick
}: SidebarProps) {
  
  const navItems = [
    { id: 'overview', label: 'Command Center', icon: LayoutDashboard },
    { id: 'clients', label: 'Clients & Customers', icon: Users },
    { id: 'appointments', label: 'Calendar Meetings', icon: Calendar },
    { id: 'inventory', label: 'Stock & Inventory', icon: Package },
    { id: 'leads', label: 'Sales Board', icon: TrendingUp },
    { id: 'billing', label: 'Invoicing & Billing', icon: FileText },
    { id: 'analytics', label: 'Reports & Analytics', icon: BarChart },
    { id: 'roles', label: 'Staff Roles', icon: ShieldAlert },
    { id: 'documentation', label: 'System Manual', icon: BookOpen },
  ];

  return (
    <>
      {/* Mobile Header bar */}
      <header className="lg:hidden bg-slate-100 border-b border-slate-200 text-slate-800 h-16 px-4 flex items-center justify-between sticky top-0 z-40 w-full" id="mobile-navigation-header">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-indigo-600" />
          <span className="font-extrabold text-sm tracking-tight font-sans uppercase">Enterprise CRM</span>
          <button
            onClick={onUpgradeClick}
            className="ml-2 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition shadow-xs cursor-pointer flex items-center gap-1"
            id="mobile-upgrade-btn"
          >
            <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" /> Upgrade
          </button>
        </div>
        <button
          onClick={onToggleMobile}
          className="p-2 text-slate-600 hover:text-slate-900 rounded-lg focus:outline-hidden cursor-pointer"
          id="mobile-menu-toggle"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar Panel Drawer */}
      <aside
        id="sidebar-navigation-panel"
        className={`fixed inset-y-0 left-0 lg:sticky lg:top-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col justify-between text-slate-700 transform transition-transform duration-300 lg:transform-none lg:h-screen ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1" id="sidebar-inner-content">
          {/* Brand Identity Panel */}
          <div className="h-16 flex items-center gap-2.5 px-6 border-b border-slate-200 shrink-0 select-none">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            <span className="font-extrabold text-lg text-slate-800 tracking-tight font-sans">
              ENTERPRISE <span className="text-indigo-600">CRM</span>
            </span>
          </div>

          {/* Upgrade Plan Action Banner - prominent and high contrast top-left placement */}
          <div className="mx-4 my-3 p-3 bg-indigo-50/80 border border-indigo-100 rounded-xl flex flex-col gap-1.5 shrink-0" id="sidebar-upgrade-promo">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Free Tier
              </span>
              <span className="text-[9px] font-mono font-bold text-indigo-600 bg-indigo-100 px-1.5 py-0.2 rounded-full">v3.5</span>
            </div>
            <p className="text-[11px] text-slate-600 font-semibold leading-tight">Unlock higher limits & analytics.</p>
            <button
              onClick={onUpgradeClick}
              className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-black tracking-wider uppercase transition-all duration-150 cursor-pointer flex items-center justify-center gap-1 shadow-sm active:scale-[0.98]"
              id="sidebar-upgrade-cta"
            >
              Upgrade Node
            </button>
          </div>

          {/* Navigation links */}
          <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto" id="sidebar-navigation-links">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  id={`sidebar-link-${item.id}`}
                  onClick={() => {
                    onSelectTab(item.id);
                    if (isMobileOpen) onToggleMobile();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600 font-extrabold'
                      : 'hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Current Active Testing User Profile Badge & Logout at footer of sidebar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col gap-3 shrink-0" id="sidebar-footer-profile">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-9 h-9 rounded-full object-cover border border-slate-300"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate leading-tight">{currentUser.name}</p>
              <span className="inline-block text-[9px] font-bold font-mono uppercase tracking-wider text-indigo-600 mt-0.5">
                {currentUser.role} Account
              </span>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 rounded-lg text-[11px] font-bold tracking-wider uppercase transition cursor-pointer"
              id="sidebar-logout-btn"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out Session
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
