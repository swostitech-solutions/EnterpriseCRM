/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  AlertTriangle, 
  TrendingUp, 
  Tag, 
  Layers, 
  MapPin, 
  PlusCircle, 
  MinusCircle,
  FolderLock
} from 'lucide-react';
import { InventoryItem } from '../types';

interface InventoryManagerProps {
  inventory: InventoryItem[];
  onAddItem: (item: Omit<InventoryItem, 'id' | 'status'>) => void;
  onEditItem: (item: InventoryItem) => void;
  onAdjustStock: (id: string, amount: number) => void;
  onDeleteItem: (id: string) => void;
}

export default function InventoryManager({
  inventory,
  onAddItem,
  onEditItem,
  onAdjustStock,
  onDeleteItem
}: InventoryManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [formId, setFormId] = useState('');
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Software');
  const [price, setPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [minStock, setMinStock] = useState<number>(10);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  // Auto SKU generator helper
  const handleAutoGenerateSku = () => {
    const catPrefix = category.slice(0, 3).toUpperCase();
    const randomNum = Math.floor(100 + Math.random() * 900);
    setSku(`${catPrefix}-${Date.now().toString().slice(-4)}-${randomNum}`);
  };

  // Search & Filter Logic
  const categories = Array.from(new Set(inventory.map(i => i.category)));

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    let matchesStatus = true;
    if (statusFilter === 'In Stock') matchesStatus = item.stock > item.minStock;
    if (statusFilter === 'Low Stock') matchesStatus = item.stock > 0 && item.stock <= item.minStock;
    if (statusFilter === 'Out of Stock') matchesStatus = item.stock === 0;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const openAddForm = () => {
    setIsEditing(false);
    setFormId('');
    setName('');
    setSku('');
    setCategory('Software');
    setPrice(0);
    setStock(0);
    setMinStock(10);
    setDescription('');
    setLocation('');
    setIsFormOpen(true);
  };

  const openEditForm = (item: InventoryItem) => {
    setIsEditing(true);
    setFormId(item.id);
    setName(item.name);
    setSku(item.sku);
    setCategory(item.category);
    setPrice(item.price);
    setStock(item.stock);
    setMinStock(item.minStock);
    setDescription(item.description);
    setLocation(item.location);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) return;

    const itemData = {
      name,
      sku,
      category,
      price: Number(price),
      stock: Number(stock),
      minStock: Number(minStock),
      description,
      location
    };

    if (isEditing) {
      // Calculate status based on updated stock
      let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
      if (itemData.stock === 0) status = 'Out of Stock';
      else if (itemData.stock <= itemData.minStock) status = 'Low Stock';

      onEditItem({
        ...itemData,
        id: formId,
        status
      });
    } else {
      onAddItem(itemData);
    }
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6" id="inventory-manager-view">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs" id="inventory-header">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600" /> Stock & Inventory Assets
          </h2>
          <p className="text-xs text-slate-500 mt-1">Audit software licenses, warehouse checkouts, hardware terminals, and service consulting tokens.</p>
        </div>
        <button
          id="add-item-btn"
          onClick={openAddForm}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Asset / Item
        </button>
      </div>

      {/* Directory Filters & Listing */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden" id="inventory-workspace">
        {/* Controls Bar */}
        <div className="p-4 border-b border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50/20" id="inventory-controls-bar">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              id="inventory-search-input"
              type="text"
              placeholder="Search by name, SKU, warehouse location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
            />
          </div>
          <select
            id="inventory-category-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c, idx) => (
              <option key={idx} value={c}>{c}</option>
            ))}
          </select>
          <select
            id="inventory-status-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
          >
            <option value="all">All Stock Statuses</option>
            <option value="In Stock">In Stock (Healthy)</option>
            <option value="Low Stock">Low Stock Alert</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>

        {/* Inventory List Table */}
        <div className="overflow-x-auto" id="inventory-table-wrapper">
          <table className="w-full text-left border-collapse" id="inventory-table">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Asset Detail</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Unit Price</th>
                <th className="py-3 px-4">In Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Stock Adjustments</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400 text-xs">
                    No inventory catalog items match your search.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const isLow = item.stock > 0 && item.stock <= item.minStock;
                  const isOut = item.stock === 0;

                  return (
                    <tr key={item.id} id={`inventory-item-row-${item.id}`} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{item.name}</div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 font-mono">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold">{item.sku}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-indigo-600"><Layers className="w-3 h-3" /> {item.category}</span>
                        </div>
                        {item.description && (
                          <div className="text-[11px] text-slate-400 mt-1 italic line-clamp-1">{item.description}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-600">
                        <span className="flex items-center gap-1 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" /> {item.location || 'Distributed'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {item.stock}
                        <span className="text-xs text-slate-400 font-normal"> / limit {item.minStock}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isOut ? 'bg-rose-100 text-rose-800' :
                          isLow ? 'bg-amber-100 text-amber-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isOut && <AlertTriangle className="w-3 h-3" />}
                          {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center justify-end gap-1">
                          <button
                            id={`stock-deduct-btn-${item.id}`}
                            onClick={() => onAdjustStock(item.id, -1)}
                            disabled={item.stock === 0}
                            className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-35 transition cursor-pointer"
                            title="Sell / Deduct 1 item"
                          >
                            <MinusCircle className="w-5 h-5" />
                          </button>
                          <button
                            id={`stock-add-btn-${item.id}`}
                            onClick={() => onAdjustStock(item.id, 1)}
                            className="p-1 text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                            title="Restock / Add 1 item"
                          >
                            <PlusCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center justify-end gap-1">
                          <button
                            id={`inventory-edit-btn-${item.id}`}
                            onClick={() => openEditForm(item)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-md transition"
                            title="Edit Item details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            id={`inventory-delete-btn-${item.id}`}
                            onClick={() => onDeleteItem(item.id)}
                            className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-md transition"
                            title="Remove catalog"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Asset Modal Form */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50" id="inventory-form-modal">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-md font-bold text-slate-900">
                  {isEditing ? 'Modify Corporate Asset Details' : 'Catalog New Corporate Asset'}
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
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Asset Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Oracle License, iPad POS Terminal"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Asset SKU *</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        placeholder="e.g. HW-TERM-02"
                        className="w-full pl-3 pr-10 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleAutoGenerateSku}
                        className="absolute right-1 top-1 text-[10px] px-1.5 py-1 text-indigo-600 bg-indigo-50 rounded hover:bg-indigo-100 font-bold transition"
                        title="Auto Generate SKU"
                      >
                        Gen
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Category *</label>
                    <select
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:border-indigo-500"
                    >
                      <option value="Software">Software Licenses</option>
                      <option value="Hardware">Hardware Devices</option>
                      <option value="Services">Consulting Services</option>
                      <option value="Other">Other Office Assets</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Price ($) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      step="any"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">In Stock *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={stock}
                      onChange={(e) => setStock(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Min. Stock *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={minStock}
                      onChange={(e) => setMinStock(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Storage Location / CDN Path</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Warehouse Zone C, Cloud Server Node"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Asset Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide technical metadata or parameters."
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
                    {isEditing ? 'Save Asset' : 'Catalog Asset'}
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
