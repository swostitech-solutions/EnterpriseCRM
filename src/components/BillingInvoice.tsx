/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Plus, 
  Search, 
  X, 
  CheckCircle, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Printer, 
  Trash2, 
  User, 
  PlusCircle, 
  AlertCircle,
  FolderMinus,
  Briefcase
} from 'lucide-react';
import { Invoice, Client, InventoryItem, InvoiceItem } from '../types';

interface BillingInvoiceProps {
  invoices: Invoice[];
  clients: Client[];
  inventory: InventoryItem[];
  onAddInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => void;
  onUpdateInvoiceStatus: (id: string, status: 'Paid' | 'Unpaid' | 'Overdue') => void;
  onDeleteInvoice: (id: string) => void;
}

export default function BillingInvoice({
  invoices,
  clients,
  inventory,
  onAddInvoice,
  onUpdateInvoiceStatus,
  onDeleteInvoice
}: BillingInvoiceProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form states
  const [clientId, setClientId] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [taxRate, setTaxRate] = useState<number>(8); // default 8%
  const [notes, setNotes] = useState('');
  const [invoiceItems, setInvoiceItems] = useState<Omit<InvoiceItem, 'id'>[]>([
    { description: '', quantity: 1, price: 0 }
  ]);

  // Inventory item helper picker
  const [selectedAssetId, setSelectedAssetId] = useState('');

  // Calculations for KPI summaries
  const totalReceivables = invoices
    .filter(inv => inv.status !== 'Paid')
    .reduce((sum, inv) => sum + inv.total, 0);

  const totalPaid = invoices
    .filter(inv => inv.status === 'Paid')
    .reduce((sum, inv) => sum + inv.total, 0);

  const overdueCount = invoices.filter(inv => inv.status === 'Overdue').length;

  // Filter logic
  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(invoice => statusFilter === 'all' || invoice.status === statusFilter);

  // Line item helpers
  const handleAddLineItem = () => {
    setInvoiceItems([...invoiceItems, { description: '', quantity: 1, price: 0 }]);
  };

  const handlePickAsset = (assetId: string, lineIndex: number) => {
    const asset = inventory.find(i => i.id === assetId);
    if (!asset) return;

    const updated = [...invoiceItems];
    updated[lineIndex] = {
      description: `${asset.name} (SKU: ${asset.sku})`,
      quantity: 1,
      price: asset.price
    };
    setInvoiceItems(updated);
  };

  const handleUpdateLineItem = (index: number, field: keyof Omit<InvoiceItem, 'id'>, value: any) => {
    const updated = [...invoiceItems];
    updated[index] = {
      ...updated[index],
      [field]: field === 'quantity' || field === 'price' ? Number(value) : value
    };
    setInvoiceItems(updated);
  };

  const handleRemoveLineItem = (index: number) => {
    if (invoiceItems.length === 1) return;
    setInvoiceItems(invoiceItems.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !issueDate || !dueDate || invoiceItems.some(i => !i.description.trim())) return;

    const selectedClient = clients.find(c => c.id === clientId);

    const subtotal = invoiceItems.reduce((sum, i) => sum + (i.quantity * i.price), 0);
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    // Map items with dummy IDs
    const finalItems = invoiceItems.map((item, idx) => ({
      ...item,
      id: `line-${idx}-${Date.now()}`
    }));

    onAddInvoice({
      clientId,
      clientName: selectedClient ? `${selectedClient.name} (${selectedClient.company || 'Individual'})` : 'Unknown Client',
      issueDate,
      dueDate,
      items: finalItems,
      subtotal,
      taxRate,
      total,
      status: 'Unpaid',
      notes
    });

    setIsFormOpen(false);
    // Reset
    setClientId('');
    setIssueDate('');
    setDueDate('');
    setTaxRate(8);
    setNotes('');
    setInvoiceItems([{ description: '', quantity: 1, price: 0 }]);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6" id="billing-invoices-view">
      {/* Billing KPIs widget bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="billing-stats-grid">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Received Capital</p>
            <p className="text-xl font-extrabold text-slate-950 font-mono">${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Accounts Receivables</p>
            <p className="text-xl font-extrabold text-slate-950 font-mono">${totalReceivables.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overdue Slips Count</p>
            <p className="text-xl font-extrabold text-slate-950 font-mono">
              {overdueCount} <span className="text-xs text-slate-400 font-normal">invoices</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="billing-workspace">
        {/* Invoices List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden" id="invoices-list-card">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 bg-slate-50/20" id="invoices-list-toolbar">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                id="billing-search-input"
                type="text"
                placeholder="Search by invoice number or customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-hidden"
              />
            </div>
            <select
              id="billing-status-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-hidden"
            >
              <option value="all">All Invoices</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Overdue">Overdue</option>
            </select>
            <button
              id="add-invoice-btn"
              onClick={() => setIsFormOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Draft Invoice
            </button>
          </div>

          <div className="overflow-x-auto" id="invoices-table-container">
            <table className="w-full text-left border-collapse" id="invoices-table">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Invoice Slip ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Total Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-slate-400 text-xs">
                      No invoices currently matched.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      id={`invoice-row-${invoice.id}`}
                      onClick={() => setSelectedInvoice(invoice)}
                      className={`hover:bg-slate-50 cursor-pointer transition ${selectedInvoice?.id === invoice.id ? 'bg-indigo-50/30 font-semibold' : ''}`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{invoice.invoiceNumber}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 truncate max-w-[180px]" title={invoice.clientName}>
                        {invoice.clientName}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600">{invoice.dueDate}</td>
                      <td className="py-3.5 px-4 font-mono font-extrabold text-slate-950">${invoice.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          invoice.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          invoice.status === 'Unpaid' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-1">
                          {invoice.status !== 'Paid' && (
                            <button
                              id={`invoice-pay-btn-${invoice.id}`}
                              onClick={() => onUpdateInvoiceStatus(invoice.id, 'Paid')}
                              className="px-2 py-1 text-[10px] font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white rounded transition cursor-pointer"
                            >
                              Pay
                            </button>
                          )}
                          <button
                            id={`invoice-delete-btn-${invoice.id}`}
                            onClick={() => onDeleteInvoice(invoice.id)}
                            className="p-1 hover:bg-rose-50 text-rose-600 rounded transition"
                            title="Remove draft"
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

        {/* Invoice PDF Slip Review */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between" id="invoice-bill-slip-review">
          {selectedInvoice ? (
            <div className="space-y-6 flex flex-col justify-between h-full" id="invoice-slip-active">
              {/* Slip content */}
              <div className="space-y-4 border border-slate-100 p-4 rounded-xl bg-slate-50/50" id="print-area">
                <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Enterprise Slip</h3>
                    <p className="text-[10px] text-slate-400 font-mono">Invoice Node #{selectedInvoice.invoiceNumber}</p>
                  </div>
                  <Printer
                    onClick={handlePrint}
                    className="w-4 h-4 text-slate-500 hover:text-slate-900 cursor-pointer print:hidden"
                    title="Print Document"
                  />
                </div>

                {/* Sender/Receiver details */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 border-b border-slate-100 pb-3">
                  <div>
                    <p className="font-bold text-slate-800 uppercase tracking-wider text-[9px] mb-0.5">Billing From</p>
                    <p className="font-semibold text-slate-900">Enterprise CRM Inc.</p>
                    <p className="text-[10px]">Cloud Infrastructure billing</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 uppercase tracking-wider text-[9px] mb-0.5">Billing To</p>
                    <p className="font-semibold text-slate-900 truncate">{selectedInvoice.clientName}</p>
                  </div>
                </div>

                {/* Timing */}
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 font-mono">
                  <div>Issued: <span className="font-semibold text-slate-900">{selectedInvoice.issueDate}</span></div>
                  <div className="text-right">Due: <span className="font-semibold text-slate-900">{selectedInvoice.dueDate}</span></div>
                </div>

                {/* Line items list */}
                <div className="border-t border-b border-slate-200/60 py-2.5 space-y-1.5" id="line-items-slip">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                    <span>Item & Qty</span>
                    <span>Total</span>
                  </div>
                  {selectedInvoice.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-slate-700">
                      <span className="truncate max-w-[150px]">{it.description} <span className="text-slate-400 font-mono">x{it.quantity}</span></span>
                      <span className="font-mono">${(it.quantity * it.price).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Summary calculation */}
                <div className="space-y-1 pt-1.5 text-xs font-medium text-slate-600 border-b border-slate-100 pb-3 font-mono">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${selectedInvoice.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({selectedInvoice.taxRate}%):</span>
                    <span>${(selectedInvoice.total - selectedInvoice.subtotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-slate-950 pt-1 border-t border-dashed border-slate-200">
                    <span>Grand Total:</span>
                    <span>${selectedInvoice.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {selectedInvoice.notes && (
                  <div className="text-[10px] text-slate-400 italic">
                    Note: "{selectedInvoice.notes}"
                  </div>
                )}
              </div>

              {/* Status updater bottom */}
              <div className="pt-4 border-t border-slate-100 flex justify-between gap-2">
                <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                  Current: 
                  <span className={`font-bold px-2 py-0.5 rounded font-mono ${
                    selectedInvoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedInvoice.status}
                  </span>
                </span>
                {selectedInvoice.status !== 'Paid' ? (
                  <button
                    id="mark-paid-slip-btn"
                    onClick={() => {
                      onUpdateInvoiceStatus(selectedInvoice.id, 'Paid');
                      setSelectedInvoice({ ...selectedInvoice, status: 'Paid' });
                    }}
                    className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Force Paid
                  </button>
                ) : (
                  <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Reconciled & Approved
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400 flex flex-col items-center justify-center h-full" id="invoice-slip-empty">
              <FileText className="w-12 h-12 text-slate-300 mb-2" />
              <p className="text-sm font-medium">No Invoice Selected</p>
              <p className="text-xs max-w-xs mt-1">Select an active invoice slip from the list to display the official receipt blueprint, print, and audit.</p>
            </div>
          )}
        </div>
      </div>

      {/* Draft Invoice Modal Form */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50" id="draft-invoice-modal">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-md font-bold text-slate-900">
                  Compile Invoice Draft
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Target Client *</label>
                  <select
                    required
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-hidden"
                  >
                    <option value="">-- Select Corporate Profile --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.company || 'Individual'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Issue Date *</label>
                    <input
                      type="date"
                      required
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Due Date *</label>
                    <input
                      type="date"
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Tax Rate (%)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={taxRate}
                      onChange={(e) => setTaxRate(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden font-mono"
                    />
                  </div>
                </div>

                {/* Line Items Builder Section */}
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Line Items (Itemized Specs)</span>
                    <button
                      type="button"
                      onClick={handleAddLineItem}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" /> Custom Line
                    </button>
                  </div>

                  {/* Dynamic picker linked to Inventory Catalog */}
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-4 gap-2 items-center text-xs">
                    <span className="font-semibold text-slate-700 col-span-2">Select from Stock Catalog:</span>
                    <select
                      id="inventory-picker"
                      value={selectedAssetId}
                      onChange={(e) => setSelectedAssetId(e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-200 rounded bg-white"
                    >
                      <option value="">-- Pick Catalog --</option>
                      {inventory.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.name} (${item.price})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        if (!selectedAssetId) return;
                        // Add this catalog item directly as a line item
                        const item = inventory.find(i => i.id === selectedAssetId);
                        if (item) {
                          setInvoiceItems([...invoiceItems, {
                            description: `${item.name} (SKU: ${item.sku})`,
                            quantity: 1,
                            price: item.price
                          }]);
                        }
                        setSelectedAssetId('');
                      }}
                      className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold transition cursor-pointer"
                    >
                      Import
                    </button>
                  </div>

                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {invoiceItems.map((item, idx) => (
                      <div key={idx} className="flex gap-2 items-center text-xs">
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) => handleUpdateLineItem(idx, 'description', e.target.value)}
                          placeholder="Line item description / SKU specs"
                          className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg"
                        />
                        <input
                          type="number"
                          required
                          min={1}
                          value={item.quantity}
                          onChange={(e) => handleUpdateLineItem(idx, 'quantity', e.target.value)}
                          placeholder="Qty"
                          className="w-14 px-2 py-1.5 border border-slate-200 rounded-lg font-mono text-center"
                        />
                        <input
                          type="number"
                          required
                          min={0}
                          value={item.price}
                          onChange={(e) => handleUpdateLineItem(idx, 'price', e.target.value)}
                          placeholder="Price"
                          className="w-20 px-2 py-1.5 border border-slate-200 rounded-lg font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(idx)}
                          className="p-1 hover:bg-rose-50 text-rose-600 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Payment Instructions / Notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Provide routing codes, payment terms, or wire codes."
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
                    Create Bill Draft
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
