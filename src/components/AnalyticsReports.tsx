/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  TrendingUp, 
  Download, 
  Calendar, 
  FileSpreadsheet, 
  CheckCircle, 
  Target, 
  Sparkles, 
  DollarSign, 
  Layers 
} from 'lucide-react';
import { Client, Lead, Invoice, InventoryItem } from '../types';

interface AnalyticsReportsProps {
  clients: Client[];
  leads: Lead[];
  invoices: Invoice[];
  inventory: InventoryItem[];
}

export default function AnalyticsReports({
  clients,
  leads,
  invoices,
  inventory
}: AnalyticsReportsProps) {
  const [reportPeriod, setReportPeriod] = useState('YTD');
  const [copiedText, setCopiedText] = useState(false);

  // 1. Core KPIs
  const totalRevenue = invoices
    .filter(i => i.status === 'Paid')
    .reduce((sum, i) => sum + i.total, 0);

  const outstandingReceivables = invoices
    .filter(i => i.status === 'Unpaid')
    .reduce((sum, i) => sum + i.total, 0);

  const avgDealSize = leads.length > 0 
    ? (leads.reduce((sum, l) => sum + l.value, 0) / leads.length) 
    : 0;

  const totalCatalogValue = inventory.reduce((sum, item) => sum + (item.stock * item.price), 0);

  // 2. Chart A: Top Spending Accounts
  const spendingPerClient = invoices.reduce((acc, invoice) => {
    if (invoice.status === 'Paid') {
      acc[invoice.clientName] = (acc[invoice.clientName] || 0) + invoice.total;
    }
    return acc;
  }, {} as Record<string, number>);

  const clientSpendingData = Object.entries(spendingPerClient)
    .map(([name, total]) => ({
      name: name.split(' (')[0], // strip company suffix for chart cleanliness
      total
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // 3. Chart B: Monthly Revenue vs Receivables (Mocked monthly timeline based on seed invoices)
  const monthlyTimelineData = [
    { month: 'Mar', Revenue: 1200, Receivables: 0 },
    { month: 'Apr', Revenue: 2450, Receivables: 350 },
    { month: 'May', Revenue: 350, Receivables: 0 },
    { month: 'Jun', Revenue: 2970, Receivables: 12500 },
    { month: 'Jul', Revenue: totalRevenue, Receivables: outstandingReceivables }
  ];

  // 4. Chart C: Lead Stages Worth
  const leadStageDistribution = leads.reduce((acc, lead) => {
    acc[lead.stage] = (acc[lead.stage] || 0) + lead.value;
    return acc;
  }, {} as Record<string, number>);

  const leadWorthData = Object.entries(leadStageDistribution).map(([stage, total]) => ({
    name: stage,
    value: total
  }));

  const COLORS = ['#6366F1', '#3B82F6', '#10B981', '#EC4899', '#F59E0B', '#EF4444', '#8B5CF6'];

  // 5. Generate and Export Markdown Executive Report
  const handleExportMarkdown = () => {
    const report = `# CRM EXECUTIVE STRATEGY SUMMARY\n` +
      `Date Generated: 2026-07-04 (Coordinated Universal Time)\n` +
      `Report Scope: YTD Corporate Operations\n\n` +
      `## I. CORE OPERATION METRICS\n` +
      `- Total Reconciled Revenue: $${totalRevenue.toLocaleString()}\n` +
      `- Unpaid Accounts Receivables: $${outstandingReceivables.toLocaleString()}\n` +
      `- Average Pipeline Deal Worth: $${avgDealSize.toLocaleString(undefined, { maximumFractionDigits: 0 })}\n` +
      `- Total Catalog Valuation Index: $${totalCatalogValue.toLocaleString()}\n\n` +
      `## II. SALES LEADS IN KANBAN BOARD\n` +
      `Total Deals Active: ${leads.length}\n` +
      `Estimated Gross Pipeline Worth: $${leads.reduce((s, l) => s + l.value, 0).toLocaleString()}\n\n` +
      `--- Confidential corporate output. Author: Enterprise CRM Scheduler Node.`;

    navigator.clipboard.writeText(report);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 3000);
  };

  return (
    <div className="space-y-6" id="reports-analytics-view">
      {/* Filters Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs" id="reports-header">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" /> Executive Reports & Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-1">Audit accounts, evaluate top-performing clients, and track monthly ledger variations.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            id="reports-timeline-select"
            value={reportPeriod}
            onChange={(e) => setReportPeriod(e.target.value)}
            className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-hidden"
          >
            <option value="YTD">Year To Date (YTD)</option>
            <option value="Q3">Q3 Operations</option>
            <option value="Monthly">Monthly Cycle</option>
          </select>
          <button
            id="export-report-btn"
            onClick={handleExportMarkdown}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            {copiedText ? 'Report Copied!' : 'Copy Executive Report'}
          </button>
        </div>
      </div>

      {/* KPI Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="analytics-kpis">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Valued Pipeline Average</p>
          <p className="text-xl font-bold text-slate-900 font-mono">${avgDealSize.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-1">Healthy Conversion Probability</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Asset Inventory Worth</p>
          <p className="text-xl font-bold text-slate-900 font-mono">${totalCatalogValue.toLocaleString()}</p>
          <span className="text-[10px] text-indigo-600 font-semibold block mt-1">Stock Valuation Index</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Accounts Ledger count</p>
          <p className="text-xl font-bold text-slate-900 font-mono">{clients.length} Registered</p>
          <span className="text-[10px] text-slate-500 block mt-1">YTD growth: +40%</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sales Board Capital</p>
          <p className="text-xl font-bold text-slate-900 font-mono">${leads.reduce((s, l) => s + l.value, 0).toLocaleString()}</p>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-1">Gross potential value</span>
        </div>
      </div>

      {/* Analytics Charts Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="charts-dashboard-container">
        {/* Chart 1: Revenue Timeline (2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between" id="chart-timeline-card">
          <div>
            <h3 className="text-md font-bold text-slate-950 font-sans tracking-tight flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-amber-500" /> Ledger Timeline Variation (Receivables vs Paid)
            </h3>
            <p className="text-xs text-slate-400 mb-4">Tracking monthly billings collected against unpaid receivables timeline.</p>
          </div>
          <div className="h-64" id="chart-timeline-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTimelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip 
                  formatter={(value: any) => [`$${value.toLocaleString()}`, undefined]}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Legend verticalAlign="top" height={36} />
                <Line type="monotone" dataKey="Revenue" stroke="#10b981" strokeWidth={3} name="Paid Capital" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="Receivables" stroke="#f59e0b" strokeWidth={2} name="Unpaid Capital" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Top Accounts Spending */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between" id="chart-accounts-card">
          <div>
            <h3 className="text-md font-bold text-slate-950 font-sans tracking-tight">Top Accounts Revenue contribution</h3>
            <p className="text-xs text-slate-400 mb-4">Total payments received from premium clients (YTD).</p>
          </div>
          <div className="h-64" id="chart-accounts-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clientSpendingData} layout="vertical" margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={80} />
                <Tooltip 
                  formatter={(value: any) => [`$${value.toLocaleString()}`, 'Spent']}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }}
                />
                <Bar dataKey="total" fill="#4f46e5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="charts-dashboard-lower">
        {/* Chart 3: Pipeline Distribution Value */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between" id="chart-pipeline-pie-card">
          <div>
            <h3 className="text-md font-bold text-slate-950 font-sans tracking-tight">Pipeline Capital Share</h3>
            <p className="text-xs text-slate-400 mb-4">Proportion of gross capital locked across stages.</p>
          </div>
          <div className="h-56 flex items-center justify-center relative" id="pie-chart-lead-responsive">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leadWorthData.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {leadWorthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Total Worth']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-1 mt-2 text-center text-[10px] font-bold" id="pie-leads-legend">
            {leadWorthData.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span className="w-2 h-2 rounded-full inline-block mb-1" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="text-slate-500 block truncate w-full">{item.name}</span>
                <span className="text-slate-900 font-mono">${item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 4: Asset Inventory value split */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between" id="chart-inventory-categories-card">
          <div>
            <h3 className="text-md font-bold text-slate-950 font-sans tracking-tight">Catalog Asset Category Value</h3>
            <p className="text-xs text-slate-400 mb-4">Worth comparison of active stocks in software, hardware, and services.</p>
          </div>
          <div className="h-56" id="chart-inventory-categories-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventory.map(item => ({
                name: item.name,
                valuation: item.stock * item.price,
                stock: item.stock
              })).sort((a,b)=>b.valuation - a.valuation).slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip 
                  formatter={(value: any, name: string) => {
                    if (name === 'valuation') return [`$${value.toLocaleString()}`, 'Valuation'];
                    return [value, 'Qty'];
                  }}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }}
                />
                <Bar dataKey="valuation" fill="#10b981" radius={[4, 4, 0, 0]} name="valuation" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
