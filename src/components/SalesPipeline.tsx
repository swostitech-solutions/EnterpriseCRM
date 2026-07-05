/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Plus, 
  X, 
  Search, 
  Edit3, 
  Trash2, 
  Mail, 
  Phone, 
  Building2, 
  ArrowRight, 
  ArrowLeft, 
  DollarSign, 
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { Lead, PipelineStage, User as TeamUser } from '../types';

interface SalesPipelineProps {
  leads: Lead[];
  teamMembers: TeamUser[];
  onAddLead: (lead: Omit<Lead, 'id' | 'updatedAt'>) => void;
  onEditLead: (lead: Lead) => void;
  onMoveLead: (id: string, stage: PipelineStage) => void;
  onDeleteLead: (id: string) => void;
}

const STAGES: PipelineStage[] = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal',
  'Negotiation',
  'Won',
  'Lost'
];

export default function SalesPipeline({
  leads,
  teamMembers,
  onAddLead,
  onEditLead,
  onMoveLead,
  onDeleteLead
}: SalesPipelineProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [formId, setFormId] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [value, setValue] = useState<number>(0);
  const [stage, setStage] = useState<PipelineStage>('New');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [assigneeId, setAssigneeId] = useState('');

  // Search filter
  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Move helpers
  const handleMoveStage = (leadId: string, currentStage: PipelineStage, direction: 'next' | 'prev') => {
    const currentIndex = STAGES.indexOf(currentStage);
    if (direction === 'next' && currentIndex < STAGES.length - 1) {
      onMoveLead(leadId, STAGES[currentIndex + 1]);
    } else if (direction === 'prev' && currentIndex > 0) {
      onMoveLead(leadId, STAGES[currentIndex - 1]);
    }
  };

  const openAddForm = () => {
    setIsEditing(false);
    setFormId('');
    setName('');
    setCompany('');
    setValue(5000);
    setStage('New');
    setEmail('');
    setPhone('');
    setNotes('');
    setAssigneeId('');
    setIsFormOpen(true);
  };

  const openEditForm = (lead: Lead) => {
    setIsEditing(true);
    setFormId(lead.id);
    setName(lead.name);
    setCompany(lead.company);
    setValue(lead.value);
    setStage(lead.stage);
    setEmail(lead.email);
    setPhone(lead.phone);
    setNotes(lead.notes);
    setAssigneeId(lead.assigneeId);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !company.trim()) return;

    const selectedAssignee = teamMembers.find(t => t.id === assigneeId);

    const leadData = {
      name,
      company,
      value: Number(value),
      stage,
      email,
      phone,
      notes,
      assigneeId,
      assigneeName: selectedAssignee ? selectedAssignee.name : 'Unassigned'
    };

    if (isEditing) {
      onEditLead({
        ...leadData,
        id: formId,
        updatedAt: new Date().toISOString().split('T')[0]
      });
    } else {
      onAddLead(leadData);
    }
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6" id="sales-pipeline-view">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs" id="pipeline-header-card">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" /> Sales Pipeline & Lead Board
          </h2>
          <p className="text-xs text-slate-500 mt-1">Nurture high-value contacts, assign lead ownership, and progress stages to close deals.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              id="pipeline-search"
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 w-44 sm:w-60"
            />
          </div>
          <button
            id="add-lead-btn"
            onClick={openAddForm}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Lead
          </button>
        </div>
      </div>

      {/* Horizontal Kanban Board Scroll Wrapper */}
      <div className="overflow-x-auto pb-4" id="kanban-scroller">
        <div className="flex gap-4 min-w-[1200px]" id="kanban-columns-container">
          {STAGES.map((currentStage) => {
            const stageLeads = filteredLeads.filter(l => l.stage === currentStage);
            const stageValueSum = stageLeads.reduce((s, l) => s + l.value, 0);

            return (
              <div
                key={currentStage}
                id={`kanban-column-${currentStage}`}
                className="w-80 bg-slate-50/50 rounded-xl border border-slate-200 p-3 flex flex-col min-h-[500px]"
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                  <div>
                    <span className="text-xs font-bold text-slate-950 uppercase tracking-wide">{currentStage}</span>
                    <span className="ml-1.5 text-xs bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-bold">
                      {stageLeads.length}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-700 font-mono">
                    ${stageValueSum.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>

                {/* Stage Lead Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[480px] pr-0.5" id={`kanban-leads-list-${currentStage}`}>
                  {stageLeads.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg bg-white/45">
                      No leads here
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        id={`lead-card-${lead.id}`}
                        className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs hover:border-indigo-300 transition group space-y-3"
                      >
                        {/* Title & Deal Price */}
                        <div>
                          <div className="flex items-start justify-between gap-1.5">
                            <h4 className="text-xs font-bold text-indigo-600 font-mono uppercase tracking-wider truncate" title={lead.company}>
                              {lead.company}
                            </h4>
                            <span className="text-xs font-bold text-slate-900 font-mono">
                              ${lead.value.toLocaleString()}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 mt-0.5">{lead.name}</h3>
                        </div>

                        {/* Contact details */}
                        <div className="text-[11px] text-slate-500 space-y-1 bg-slate-50 p-2 rounded border border-slate-100 font-mono">
                          <div className="flex items-center gap-1.5 truncate">
                            <Mail className="w-3 h-3 text-slate-400" /> {lead.email}
                          </div>
                          {lead.phone && (
                            <div className="flex items-center gap-1.5 truncate">
                              <Phone className="w-3 h-3 text-slate-400" /> {lead.phone}
                            </div>
                          )}
                        </div>

                        {/* Representative Assignment */}
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" /> Assigned Rep: <strong className="text-slate-800">{lead.assigneeName}</strong>
                        </div>

                        {/* Progress Status Buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-1">
                            <button
                              id={`lead-edit-btn-${lead.id}`}
                              onClick={() => openEditForm(lead)}
                              className="p-1 hover:bg-slate-100 text-slate-500 hover:text-indigo-600 rounded transition"
                              title="Edit Deal"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              id={`lead-delete-btn-${lead.id}`}
                              onClick={() => onDeleteLead(lead.id)}
                              className="p-1 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded transition"
                              title="Delete Deal"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex gap-1">
                            {STAGES.indexOf(currentStage) > 0 && (
                              <button
                                id={`lead-move-prev-${lead.id}`}
                                onClick={() => handleMoveStage(lead.id, currentStage, 'prev')}
                                className="p-1 hover:bg-slate-100 text-slate-600 rounded border border-slate-200 transition cursor-pointer"
                                title="Move Backward"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                            )}
                            {STAGES.indexOf(currentStage) < STAGES.length - 1 && (
                              <button
                                id={`lead-move-next-${lead.id}`}
                                onClick={() => handleMoveStage(lead.id, currentStage, 'next')}
                                className="p-1 hover:bg-slate-100 text-slate-600 rounded border border-slate-200 transition cursor-pointer flex items-center gap-0.5"
                                title="Advance Stage"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Lead Dialog */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50" id="lead-form-modal">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-md font-bold text-slate-900">
                  {isEditing ? 'Modify Lead Information' : 'Register New Pipeline Lead'}
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Corporate Lead Entity *</label>
                    <input
                      type="text"
                      required
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Wayne Enterprises"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Primary Contact Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Bruce Wayne"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Est. Deal Value ($) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={value}
                      onChange={(e) => setValue(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Initial Stage *</label>
                    <select
                      value={stage}
                      onChange={(e) => setStage(e.target.value as PipelineStage)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:border-indigo-500"
                    >
                      {STAGES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. email@company.com"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +1 (555) 999-1111"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Assign Deal Rep *</label>
                  <select
                    required
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="">-- Assign Sales Rep --</option>
                    {teamMembers.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Pipeline Notes / Background</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Provide details on client's specific requirements or support expectations."
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 resize-none"
                  ></textarea>
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
                    {isEditing ? 'Update Lead' : 'Launch Lead'}
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
