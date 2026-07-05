/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  Phone, 
  Mail, 
  Building2, 
  MapPin, 
  Tag, 
  FileText,
  UserPlus,
  Check
} from 'lucide-react';
import { Client } from '../types';

interface ClientManagerProps {
  clients: Client[];
  onAddClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
}

export default function ClientManager({
  clients,
  onAddClient,
  onEditClient,
  onDeleteClient
}: ClientManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [formId, setFormId] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'Active' | 'Lead' | 'Inactive'>('Active');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [tagsString, setTagsString] = useState('');

  // Search and filter logic
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const openAddForm = () => {
    setIsEditing(false);
    setFormId('');
    setName('');
    setCompany('');
    setEmail('');
    setPhone('');
    setStatus('Active');
    setAddress('');
    setNotes('');
    setTagsString('');
    setIsFormOpen(true);
  };

  const openEditForm = (client: Client) => {
    setIsEditing(true);
    setFormId(client.id);
    setName(client.name);
    setCompany(client.company);
    setEmail(client.email);
    setPhone(client.phone);
    setStatus(client.status);
    setAddress(client.address);
    setNotes(client.notes);
    setTagsString(client.tags.join(', '));
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const tags = tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const clientData = {
      name,
      company,
      email,
      phone,
      status,
      address,
      notes,
      tags
    };

    if (isEditing) {
      onEditClient({
        ...clientData,
        id: formId,
        createdAt: clients.find(c => c.id === formId)?.createdAt || new Date().toISOString().split('T')[0]
      });
      if (selectedClient?.id === formId) {
        setSelectedClient({
          ...selectedClient,
          ...clientData
        });
      }
    } else {
      onAddClient(clientData);
    }
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6" id="client-manager-view">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs" id="client-controls-card">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" /> Client & Customer Directory
          </h2>
          <p className="text-xs text-slate-500 mt-1">Manage executive stakeholders, register new accounts, and review profiles.</p>
        </div>
        <button
          id="add-client-btn"
          onClick={openAddForm}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition cursor-pointer"
        >
          <UserPlus className="w-4 h-4" /> Add New Client
        </button>
      </div>

      {/* Main Grid: List and Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="client-grid-workspace">
        {/* Left Side: Directory Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden" id="clients-list-container">
          {/* List Search and Filter bar */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3" id="client-search-filter-bar">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                id="client-search-input"
                type="text"
                placeholder="Search by client name, company, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:bg-white transition"
              />
            </div>
            <select
              id="client-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:bg-white transition"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Lead">Lead</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Table list */}
          <div className="overflow-x-auto flex-1" id="clients-table-wrapper">
            <table className="w-full text-left border-collapse" id="clients-table">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Client Detail</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-slate-400 text-xs">
                      No customer profiles match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => (
                    <tr
                      key={client.id}
                      id={`client-row-${client.id}`}
                      onClick={() => setSelectedClient(client)}
                      className={`hover:bg-indigo-50/20 cursor-pointer transition ${selectedClient?.id === client.id ? 'bg-indigo-50/40' : ''}`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{client.name}</div>
                        <div className="text-xs text-slate-500 font-mono">{client.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 text-slate-700">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" /> {client.company || 'Individual'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          client.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          client.status === 'Lead' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-1">
                          <button
                            id={`client-edit-btn-${client.id}`}
                            onClick={() => openEditForm(client)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-md transition"
                            title="Edit Client"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            id={`client-delete-btn-${client.id}`}
                            onClick={() => onDeleteClient(client.id)}
                            className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-md transition"
                            title="Delete Client"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Detail Profile Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between" id="client-detail-container">
          {selectedClient ? (
            <div className="space-y-5" id="client-detail-active">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-950 tracking-tight">{selectedClient.name}</h3>
                  <p className="text-xs text-indigo-600 font-semibold">{selectedClient.company || 'Independent Customer'}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase font-mono ${
                  selectedClient.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                  selectedClient.status === 'Lead' ? 'bg-blue-100 text-blue-800' :
                  'bg-slate-200 text-slate-800'
                }`}>
                  {selectedClient.status}
                </span>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-3.5">
                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="font-mono">{selectedClient.email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="font-mono">{selectedClient.phone || 'No phone recorded'}</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                  <span>{selectedClient.address || 'No physical address added'}</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Category Tags</span>
                {selectedClient.tags.length === 0 ? (
                  <span className="text-xs text-slate-400">No tags assigned.</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedClient.tags.map((t, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                        <Tag className="w-3 h-3 text-slate-400" /> {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 pt-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Administrative Notes</span>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-700 italic whitespace-pre-line leading-relaxed">
                  {selectedClient.notes || 'No administrative annotations recorded.'}
                </div>
              </div>

              <div className="text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-50">
                Created on corporate index: {selectedClient.createdAt}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400 flex flex-col items-center justify-center h-full" id="client-detail-empty">
              <Users className="w-12 h-12 text-slate-300 mb-2" />
              <p className="text-sm font-medium">No Client Selected</p>
              <p className="text-xs max-w-xs mt-1">Select a customer profile from the directory to review their corporate data and notes.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal Form */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50" id="client-form-modal">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-md font-bold text-slate-900">
                  {isEditing ? 'Modify Stakeholder Profile' : 'Register New Stakeholder'}
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. David Chen"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Corporate Entity</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Apex Tech Solutions"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. name@company.com"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +1 (555) 234-5678"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Operational Status</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Active', 'Lead', 'Inactive'] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatus(s)}
                        className={`py-2 px-3 text-xs font-semibold rounded-lg border transition ${
                          status === s 
                            ? 'bg-indigo-600 text-white border-indigo-600' 
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Physical Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street, City, Country"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Category Tags (Comma separated)</label>
                  <input
                    type="text"
                    value={tagsString}
                    onChange={(e) => setTagsString(e.target.value)}
                    placeholder="e.g. Premium, Tech, Enterprise"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Administrative Notes</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Core business needs, follow-ups, and special instructions."
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
                    {isEditing ? 'Save Changes' : 'Register Profile'}
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
