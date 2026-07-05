/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  TrendingUp, 
  Package, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  FileText
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Client, Appointment, InventoryItem, Lead, Invoice, ActivityLog } from '../types';

interface DashboardOverviewProps {
  clients: Client[];
  appointments: Appointment[];
  inventory: InventoryItem[];
  leads: Lead[];
  invoices: Invoice[];
  logs: ActivityLog[];
  onNavigate: (tab: string) => void;
}

export default function DashboardOverview({
  clients,
  appointments,
  inventory,
  leads,
  invoices,
  logs,
  onNavigate
}: DashboardOverviewProps) {
  // 1. Calculations for KPIs
  const totalInvoicedPaid = invoices
    .filter(inv => inv.status === 'Paid')
    .reduce((sum, inv) => sum + inv.total, 0);

  const pendingInvoiceAmount = invoices
    .filter(inv => inv.status === 'Unpaid')
    .reduce((sum, inv) => sum + inv.total, 0);

  const activeClients = clients.filter(c => c.status === 'Active').length;
  const leadValue = leads.reduce((sum, l) => sum + l.value, 0);
  const lowStockCount = inventory.filter(i => i.stock <= i.minStock).length;
  
  const upcomingAppointments = appointments.filter(
    app => app.status === 'Scheduled'
  ).length;

  // 2. Data for Charts
  // Pipeline Stage Distribution
  const stageCounts = leads.reduce((acc, lead) => {
    acc[lead.stage] = (acc[lead.stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pipelineData = Object.entries(stageCounts).map(([stage, count]) => ({
    name: stage,
    count,
    value: leads.filter(l => l.stage === stage).reduce((s, l) => s + l.value, 0)
  }));

  // Invoice Revenue by Status
  const invoiceData = [
    { name: 'Paid', value: totalInvoicedPaid, color: '#10B981' },
    { name: 'Unpaid / Draft', value: pendingInvoiceAmount, color: '#F59E0B' },
    { 
      name: 'Overdue', 
      value: invoices.filter(inv => inv.status === 'Overdue').reduce((sum, inv) => sum + inv.total, 0),
      color: '#EF4444' 
    }
  ];

  // Stock categories for Pie chart
  const categoryStock = inventory.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.stock;
    return acc;
  }, {} as Record<string, number>);

  const stockData = Object.entries(categoryStock).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#6366F1', '#3B82F6', '#10B981', '#EC4899', '#F59E0B'];

  return (
    <div className="space-y-6" id="dashboard-overview-container">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-xl border border-slate-800" id="welcome-banner">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white mb-1">CRM Command Center</h2>
          <p className="text-slate-300 text-sm max-w-xl">
            Welcome back. Monitor corporate assets, coordinate client lifecycles, run analytics charts, and authorize billing drafts.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            id="nav-leads-btn"
            onClick={() => onNavigate('leads')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition duration-200"
          >
            Manage Pipeline
          </button>
          <button 
            id="nav-billing-btn"
            onClick={() => onNavigate('billing')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium border border-slate-700 transition duration-200"
          >
            Create Invoice
          </button>
        </div>
      </div>

      {/* KPI Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-grid">
        {/* KPI 1 */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 flex items-center gap-4"
          id="kpi-card-revenue"
        >
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Collected Revenue</p>
            <p className="text-2xl font-bold text-slate-900 font-mono">${totalInvoicedPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Pending: <span className="font-semibold text-amber-600">${pendingInvoiceAmount.toLocaleString()}</span>
            </p>
          </div>
        </motion.div>

        {/* KPI 2 */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 flex items-center gap-4"
          id="kpi-card-clients"
        >
          <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Clients</p>
            <p className="text-2xl font-bold text-slate-900 font-mono">{activeClients}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Total base: <span className="font-semibold">{clients.length} profiles</span>
            </p>
          </div>
        </motion.div>

        {/* KPI 3 */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 flex items-center gap-4"
          id="kpi-card-pipeline"
        >
          <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pipeline Value</p>
            <p className="text-2xl font-bold text-slate-900 font-mono">${leadValue.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Across <span className="font-semibold">{leads.length} major deals</span>
            </p>
          </div>
        </motion.div>

        {/* KPI 4 */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 flex items-center gap-4"
          id="kpi-card-appointments"
        >
          <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Scheduled Meetings</p>
            <p className="text-2xl font-bold text-slate-900 font-mono">{upcomingAppointments}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {lowStockCount > 0 ? (
                <span className="text-rose-600 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {lowStockCount} inventory alerts
                </span>
              ) : (
                <span className="text-emerald-600 font-semibold">Stock in perfect health</span>
              )}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Analytics Charts & Leads Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-charts-grid">
        {/* Sales Pipeline Distribution */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between" id="chart-pipeline-container">
          <div>
            <h3 className="text-lg font-semibold text-slate-950 font-sans tracking-tight mb-1">Sales Leads & Value Distribution</h3>
            <p className="text-xs text-slate-500 mb-4">Total worth of current deal phases in active negotiation pipelines.</p>
          </div>
          <div className="h-64 w-full" id="bar-chart-responsive">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  formatter={(value: any, name: string) => {
                    if (name === 'value') return [`$${value.toLocaleString()}`, 'Total Worth'];
                    return [value, 'Deals Count'];
                  }}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff' }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} name="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Invoice Collections Status */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between" id="chart-invoices-container">
          <div>
            <h3 className="text-lg font-semibold text-slate-950 font-sans tracking-tight mb-1">Invoices Distribution</h3>
            <p className="text-xs text-slate-500 mb-4">Collected billing capital vs receivables pending.</p>
          </div>
          <div className="h-48 flex items-center justify-center relative" id="pie-chart-responsive">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={invoiceData.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {invoiceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Value']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center flex flex-col items-center">
              <span className="text-xs text-slate-500 font-medium">Total Billing</span>
              <span className="text-lg font-bold text-slate-900 font-mono">
                ${invoices.reduce((s, i) => s + i.total, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1 mt-2 text-center text-xs font-semibold" id="pie-legend">
            {invoiceData.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span className="w-2.5 h-2.5 rounded-full inline-block mb-1" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-600 block truncate w-full">{item.name}</span>
                <span className="text-slate-900 block font-mono font-bold">${item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low Stock and High Priority Tasks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-lower-grid">
        {/* Today's Meetings */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200" id="meetings-feed-container">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-md font-semibold text-slate-950 tracking-tight">Scheduled Meetings</h3>
              <p className="text-xs text-slate-500">Upcoming client synchronization calls.</p>
            </div>
            <button 
              id="view-calendar-btn"
              onClick={() => onNavigate('appointments')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              Full Calendar
            </button>
          </div>
          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1" id="appointments-mini-list">
            {appointments.filter(a => a.status === 'Scheduled').length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                <CheckCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                No pending meetings scheduled.
              </div>
            ) : (
              appointments
                .filter(a => a.status === 'Scheduled')
                .slice(0, 4)
                .map((app) => (
                  <div key={app.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-3 hover:bg-slate-100/50 transition">
                    <div className="p-2 rounded bg-indigo-50 text-indigo-600 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-900 truncate">{app.title}</p>
                      <p className="text-xs text-slate-600 font-medium">With: {app.clientName}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-mono">
                        <span>{app.date}</span>
                        <span>•</span>
                        <span>{app.time} ({app.duration} min)</span>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Inventory Notifications / Status */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200" id="inventory-feed-container">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-md font-semibold text-slate-950 tracking-tight">Stock Alerts</h3>
              <p className="text-xs text-slate-500">Items that require urgent restocking.</p>
            </div>
            <button 
              id="view-inventory-btn"
              onClick={() => onNavigate('inventory')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              All Assets
            </button>
          </div>
          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1" id="inventory-alerts-list">
            {inventory.filter(i => i.stock <= i.minStock).length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                <CheckCircle className="w-8 h-8 text-emerald-300 mx-auto mb-2" />
                All product stock levels are healthy.
              </div>
            ) : (
              inventory
                .filter(i => i.stock <= i.minStock)
                .slice(0, 4)
                .map((item) => (
                  <div key={item.id} className="p-3 bg-rose-50/50 rounded-lg border border-rose-100 flex items-start gap-3 hover:bg-rose-50 transition">
                    <div className="p-2 rounded bg-rose-100 text-rose-600 mt-0.5">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-semibold text-slate-900 truncate">{item.name}</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-rose-100 text-rose-700 font-mono uppercase">{item.stock === 0 ? 'Out' : 'Low'}</span>
                      </div>
                      <p className="text-xs text-slate-600 font-mono">SKU: {item.sku} | Location: {item.location}</p>
                      <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                        <span>Current Stock: <strong className="text-slate-900 font-mono">{item.stock}</strong></span>
                        <span>Threshold Limit: <strong className="text-slate-700 font-mono">{item.minStock}</strong></span>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Real-time Activity Log */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 flex flex-col" id="activity-feed-container">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-md font-semibold text-slate-950 tracking-tight">Real-time Activity Logs</h3>
              <p className="text-xs text-slate-500">Authorized actions executed on the node cluster.</p>
            </div>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[280px] pr-1" id="activity-logs-list">
            {logs.slice(0, 5).map((log) => (
              <div key={log.id} className="text-xs border-b border-slate-100 pb-2.5 last:border-b-0 last:pb-0" id={`activity-log-item-${log.id}`}>
                <div className="flex items-center justify-between gap-1 text-[10px] text-slate-400 font-mono">
                  <span>{log.userName} ({log.role})</span>
                  <span>{log.timestamp.split(' ')[1] || log.timestamp}</span>
                </div>
                <p className="font-semibold text-slate-900 mt-0.5">{log.action}</p>
                <p className="text-slate-600">{log.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
