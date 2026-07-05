/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Client, 
  Appointment, 
  InventoryItem, 
  Lead, 
  Invoice, 
  ActivityLog, 
  User, 
  UserRole,
  SEED_USERS,
  SEED_CLIENTS,
  SEED_INVENTORY,
  SEED_LEADS,
  SEED_APPOINTMENTS,
  SEED_INVOICES,
  SEED_LOGS
} from './types';

// Component imports
import Sidebar from './components/Sidebar';
import DashboardOverview from './components/DashboardOverview';
import ClientManager from './components/ClientManager';
import CalendarScheduler from './components/CalendarScheduler';
import InventoryManager from './components/InventoryManager';
import SalesPipeline from './components/SalesPipeline';
import BillingInvoice from './components/BillingInvoice';
import RoleManagement from './components/RoleManagement';
import AnalyticsReports from './components/AnalyticsReports';
import DocumentationView from './components/DocumentationView';
import LoginScreen from './components/LoginScreen';

// UI icons for notification center
import { Bell, ShieldCheck, AlertCircle, X, CircleCheck, Check, Sparkles, Zap, Shield, HelpCircle, Building2, Mail, Phone, Globe, Users, ArrowLeft } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('annually');

  // Pricing Contact Form States.
  const [selectedPlanForContact, setSelectedPlanForContact] = useState<{ name: string; price: string } | null>(null);
  const [pricingContactName, setPricingContactName] = useState('');
  const [pricingContactCompany, setPricingContactCompany] = useState('');
  const [pricingContactEmail, setPricingContactEmail] = useState('');
  const [pricingContactPhone, setPricingContactPhone] = useState('');
  const [pricingContactRegion, setPricingContactRegion] = useState('North America');
  const [pricingContactTeamSize, setPricingContactTeamSize] = useState('1-10');
  const [pricingContactNotes, setPricingContactNotes] = useState('');

  // Core CRM States
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  
  // UI Toast State
  const [toasts, setToasts] = useState<Toast[]>([]);

  // 1. Initial Storage Load & Seeding
  useEffect(() => {
    const localUsers = localStorage.getItem('crm_users');
    const localClients = localStorage.getItem('crm_clients');
    const localAppointments = localStorage.getItem('crm_appointments');
    const localInventory = localStorage.getItem('crm_inventory');
    const localLeads = localStorage.getItem('crm_leads');
    const localInvoices = localStorage.getItem('crm_invoices');
    const localLogs = localStorage.getItem('crm_logs');
    const localCurrentUser = localStorage.getItem('crm_current_user');

    let loadedUsers: User[] = [];
    if (localUsers) {
      loadedUsers = JSON.parse(localUsers);
      // Ensure the 'test' user is always available
      const hasTest = loadedUsers.some(u => u.username === 'test');
      if (!hasTest) {
        const testUser = SEED_USERS.find(u => u.username === 'test');
        if (testUser) {
          loadedUsers = [testUser, ...loadedUsers];
          localStorage.setItem('crm_users', JSON.stringify(loadedUsers));
        }
      }
      setUsers(loadedUsers);
    } else {
      loadedUsers = SEED_USERS;
      setUsers(SEED_USERS);
      localStorage.setItem('crm_users', JSON.stringify(SEED_USERS));
    }

    if (localClients) setClients(JSON.parse(localClients));
    else {
      setClients(SEED_CLIENTS);
      localStorage.setItem('crm_clients', JSON.stringify(SEED_CLIENTS));
    }

    if (localAppointments) setAppointments(JSON.parse(localAppointments));
    else {
      setAppointments(SEED_APPOINTMENTS);
      localStorage.setItem('crm_appointments', JSON.stringify(SEED_APPOINTMENTS));
    }

    if (localInventory) setInventory(JSON.parse(localInventory));
    else {
      setInventory(SEED_INVENTORY);
      localStorage.setItem('crm_inventory', JSON.stringify(SEED_INVENTORY));
    }

    if (localLeads) setLeads(JSON.parse(localLeads));
    else {
      setLeads(SEED_LEADS);
      localStorage.setItem('crm_leads', JSON.stringify(SEED_LEADS));
    }

    if (localInvoices) setInvoices(JSON.parse(localInvoices));
    else {
      setInvoices(SEED_INVOICES);
      localStorage.setItem('crm_invoices', JSON.stringify(SEED_INVOICES));
    }

    if (localLogs) setLogs(JSON.parse(localLogs));
    else {
      setLogs(SEED_LOGS);
      localStorage.setItem('crm_logs', JSON.stringify(SEED_LOGS));
    }

    if (localCurrentUser) {
      setCurrentUser(JSON.parse(localCurrentUser));
    } else {
      // Start with Login screen (currentUser = null)
      setCurrentUser(null);
    }
    setIsLoaded(true);
  }, []);

  // Sync to local storage on edits
  const syncState = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('crm_current_user', JSON.stringify(user));
    addToast('success', `Access granted. Welcome back, agent ${user.name}.`);
    
    // Log sign-in action
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      role: user.role,
      action: 'User Authentication',
      details: `Successful sign-in from username/email profile.`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setLogs((prev) => {
      const updated = [newLog, ...prev];
      syncState('crm_logs', updated);
      return updated;
    });
  };

  const handleRegisterUser = (newUser: User) => {
    setUsers((prev) => {
      const updated = [...prev, newUser];
      syncState('crm_users', updated);
      return updated;
    });
    
    // Log user registration
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      userId: newUser.id,
      userName: newUser.name,
      role: newUser.role,
      action: 'Account Registration',
      details: `New user registration. Assigned clearance: ${newUser.role}.`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setLogs((prev) => {
      const updated = [newLog, ...prev];
      syncState('crm_logs', updated);
      return updated;
    });
    addToast('success', `Successfully registered profile for ${newUser.name}.`);
  };

  const handleLogout = () => {
    if (currentUser) {
      const newLog: ActivityLog = {
        id: `log-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        role: currentUser.role,
        action: 'User Logout',
        details: `Profile session closed securely.`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      setLogs((prev) => {
        const updated = [newLog, ...prev];
        syncState('crm_logs', updated);
        return updated;
      });
    }
    
    setCurrentUser(null);
    localStorage.removeItem('crm_current_user');
    addToast('info', 'Secure session terminated. Profile logged out.');
  };

  // Helper: Toast Notifications
  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Helper: Action Log Logger
  const appendLog = (action: string, details: string) => {
    if (!currentUser) return;
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      role: currentUser.role,
      action,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    
    setLogs((prev) => {
      const updated = [newLog, ...prev];
      syncState('crm_logs', updated);
      return updated;
    });
  };

  // 2. GATED CRM STATE ACTIONS

  // --- CLIENT ACTIONS ---
  const handleAddClient = (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    if (!currentUser) return;
    if (currentUser.role === 'Agent') {
      addToast('error', 'Operation Denied: Sales Agents cannot create core client profiles.');
      return;
    }

    const newClient: Client = {
      ...clientData,
      id: `client-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setClients((prev) => {
      const updated = [newClient, ...prev];
      syncState('crm_clients', updated);
      return updated;
    });

    appendLog('Client Registered', `Created client profile for ${newClient.name} at ${newClient.company || 'Individual'}.`);
    addToast('success', `Stakeholder ${newClient.name} successfully registered.`);
  };

  const handleEditClient = (updatedClient: Client) => {
    if (!currentUser) return;
    if (currentUser.role === 'Agent') {
      addToast('error', 'Operation Denied: Sales Agents cannot modify client profiles.');
      return;
    }

    setClients((prev) => {
      const updated = prev.map((c) => (c.id === updatedClient.id ? updatedClient : c));
      syncState('crm_clients', updated);
      return updated;
    });

    appendLog('Client Profile Updated', `Modified credentials/tags for ${updatedClient.name}.`);
    addToast('success', `Stakeholder ${updatedClient.name} updated.`);
  };

  const handleDeleteClient = (id: string) => {
    if (!currentUser) return;
    if (currentUser.role === 'Agent') {
      addToast('error', 'Operation Denied: Sales Agents cannot delete customer profiles.');
      return;
    }

    const target = clients.find((c) => c.id === id);
    if (!target) return;

    setClients((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      syncState('crm_clients', updated);
      return updated;
    });

    appendLog('Client Profile Removed', `Deleted customer record for ${target.name}.`);
    addToast('info', `Stakeholder profile removed.`);
  };

  // --- APPOINTMENTS ACTIONS ---
  const handleAddAppointment = (appData: Omit<Appointment, 'id'>) => {
    if (!currentUser) return;
    
    // Agent limits: Agents can only assign to themselves
    if (currentUser.role === 'Agent' && appData.assigneeId !== currentUser.id) {
      addToast('error', 'Operation Restricted: Agents can only schedule syncs assigned to themselves.');
      return;
    }

    const newApp: Appointment = {
      ...appData,
      id: `app-${Date.now()}`
    };

    setAppointments((prev) => {
      const updated = [...prev, newApp];
      syncState('crm_appointments', updated);
      return updated;
    });

    appendLog('Meeting Scheduled', `Booked "${newApp.title}" on ${newApp.date} with client ${newApp.clientName}.`);
    addToast('success', `Appointment successfully scheduled.`);
  };

  const handleUpdateAppointmentStatus = (id: string, status: 'Scheduled' | 'Completed' | 'Cancelled') => {
    if (!currentUser) return;

    const target = appointments.find((a) => a.id === id);
    if (!target) return;

    // Agent limits: Agents can only update status of their own appointments
    if (currentUser.role === 'Agent' && target.assigneeId !== currentUser.id) {
      addToast('error', 'Access Restricted: You are not authorized to check-in other reps appointments.');
      return;
    }

    setAppointments((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, status } : a));
      syncState('crm_appointments', updated);
      return updated;
    });

    appendLog('Meeting Status Modified', `Set "${target.title}" status to ${status}.`);
    addToast('info', `Meeting marked as ${status}.`);
  };

  const handleDeleteAppointment = (id: string) => {
    if (!currentUser) return;
    if (currentUser.role === 'Agent') {
      addToast('error', 'Operation Denied: Only Managers and Admins can delete calendar logs.');
      return;
    }

    const target = appointments.find((a) => a.id === id);
    if (!target) return;

    setAppointments((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      syncState('crm_appointments', updated);
      return updated;
    });

    appendLog('Meeting Canceled/Removed', `Deleted schedule log for "${target.title}".`);
    addToast('info', 'Appointment deleted.');
  };

  // --- INVENTORY / STOCK ACTIONS ---
  const handleAddInventoryItem = (itemData: Omit<InventoryItem, 'id' | 'status'>) => {
    if (!currentUser) return;
    if (currentUser.role === 'Agent') {
      addToast('error', 'Operation Denied: Sales Agents cannot create stock catalog items.');
      return;
    }

    let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
    if (itemData.stock === 0) status = 'Out of Stock';
    else if (itemData.stock <= itemData.minStock) status = 'Low Stock';

    const newItem: InventoryItem = {
      ...itemData,
      id: `item-${Date.now()}`,
      status
    };

    setInventory((prev) => {
      const updated = [newItem, ...prev];
      syncState('crm_inventory', updated);
      return updated;
    });

    appendLog('Asset Cataloged', `Added new inventory asset: ${newItem.name} (SKU: ${newItem.sku})`);
    addToast('success', `Product ${newItem.name} cataloged.`);
  };

  const handleEditInventoryItem = (updatedItem: InventoryItem) => {
    if (!currentUser) return;
    if (currentUser.role === 'Agent') {
      addToast('error', 'Operation Denied: Sales Agents cannot modify stock catalogs.');
      return;
    }

    setInventory((prev) => {
      const updated = prev.map((i) => (i.id === updatedItem.id ? updatedItem : i));
      syncState('crm_inventory', updated);
      return updated;
    });

    appendLog('Asset Details Edited', `Modified parameters of catalog ${updatedItem.name}.`);
    addToast('success', `Product ${updatedItem.name} updated.`);
  };

  const handleAdjustStock = (id: string, amount: number) => {
    // Agents, managers, and admins can checkout/restock
    const target = inventory.find((i) => i.id === id);
    if (!target) return;

    const newStock = Math.max(0, target.stock + amount);
    let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
    if (newStock === 0) status = 'Out of Stock';
    else if (newStock <= target.minStock) status = 'Low Stock';

    setInventory((prev) => {
      const updated = prev.map((i) => (i.id === id ? { ...i, stock: newStock, status } : i));
      syncState('crm_inventory', updated);
      return updated;
    });

    appendLog('Stock Level Altered', `Adjusted ${target.name} stock level by ${amount}. (New Stock: ${newStock})`);
    addToast('info', `Stock of ${target.name} adjusted.`);
  };

  const handleDeleteInventoryItem = (id: string) => {
    if (!currentUser) return;
    if (currentUser.role === 'Agent') {
      addToast('error', 'Operation Denied: Only Admins/Managers can delete catalogs.');
      return;
    }

    const target = inventory.find((i) => i.id === id);
    if (!target) return;

    setInventory((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      syncState('crm_inventory', updated);
      return updated;
    });

    appendLog('Asset Removed', `Removed ${target.name} from stock catalog databases.`);
    addToast('info', 'Asset catalog removed.');
  };

  // --- SALES PIPELINE / LEADS ACTIONS ---
  const handleAddLead = (leadData: Omit<Lead, 'id' | 'updatedAt'>) => {
    // All roles can create leads
    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setLeads((prev) => {
      const updated = [newLead, ...prev];
      syncState('crm_leads', updated);
      return updated;
    });

    appendLog('Lead Formulated', `Launched pipeline lead ${newLead.name} (${newLead.company}) valued at $${newLead.value}.`);
    addToast('success', `New lead ${newLead.name} launched.`);
  };

  const handleEditLead = (updatedLead: Lead) => {
    if (!currentUser) return;
    
    // Agent limit: Agents can only edit leads assigned to themselves
    const original = leads.find((l) => l.id === updatedLead.id);
    if (!original) return;

    if (currentUser.role === 'Agent' && original.assigneeId !== currentUser.id) {
      addToast('error', 'Access Restricted: Agents can only edit sales leads assigned to them.');
      return;
    }

    setLeads((prev) => {
      const updated = prev.map((l) => (l.id === updatedLead.id ? updatedLead : l));
      syncState('crm_leads', updated);
      return updated;
    });

    appendLog('Lead Updated', `Edited details on lead deal ${updatedLead.name}.`);
    addToast('success', `Lead ${updatedLead.name} updated.`);
  };

  const handleMoveLead = (id: string, stage: typeof leads[0]['stage']) => {
    if (!currentUser) return;

    const target = leads.find((l) => l.id === id);
    if (!target) return;

    // Agent limits: Agents can only move their own leads
    if (currentUser.role === 'Agent' && target.assigneeId !== currentUser.id) {
      addToast('error', 'Access Restricted: Agents can only progress their own assigned leads.');
      return;
    }

    setLeads((prev) => {
      const updated = prev.map((l) => (l.id === id ? { ...l, stage, updatedAt: new Date().toISOString().split('T')[0] } : l));
      syncState('crm_leads', updated);
      return updated;
    });

    appendLog('Lead Board Transition', `Moved ${target.name} deal to "${stage}" phase.`);
    addToast('info', `Moved ${target.name} to ${stage}.`);
  };

  const handleDeleteLead = (id: string) => {
    if (!currentUser) return;
    if (currentUser.role === 'Agent') {
      addToast('error', 'Operation Denied: Only Admins/Managers can remove leads.');
      return;
    }

    const target = leads.find((l) => l.id === id);
    if (!target) return;

    setLeads((prev) => {
      const updated = prev.filter((l) => l.id !== id);
      syncState('crm_leads', updated);
      return updated;
    });

    appendLog('Lead Board Removal', `Removed lead card of ${target.name}.`);
    addToast('info', 'Lead removed from board.');
  };

  // --- BILLING / INVOICE ACTIONS ---
  const handleAddInvoice = (invData: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    if (!currentUser) return;
    if (currentUser.role === 'Agent') {
      addToast('error', 'Operation Denied: Sales Agents cannot generate billing invoice drafts.');
      return;
    }

    // Determine invoice numbering count
    const invoiceNumStr = `INV-2026-00${invoices.length + 1}`;

    const newInvoice: Invoice = {
      ...invData,
      id: `invoice-${Date.now()}`,
      invoiceNumber: invoiceNumStr
    };

    setInvoices((prev) => {
      const updated = [newInvoice, ...prev];
      syncState('crm_invoices', updated);
      return updated;
    });

    appendLog('Billing Invoiced', `Generated invoice slip ${invoiceNumStr} for ${newInvoice.clientName} totaling $${newInvoice.total.toLocaleString()}.`);
    addToast('success', `Billing slip ${invoiceNumStr} successfully generated.`);
  };

  const handleUpdateInvoiceStatus = (id: string, status: 'Paid' | 'Unpaid' | 'Overdue') => {
    if (!currentUser) return;
    if (currentUser.role === 'Agent') {
      addToast('error', 'Access Restricted: Sales Agents cannot alter transaction reconciliation states.');
      return;
    }

    const target = invoices.find((inv) => inv.id === id);
    if (!target) return;

    setInvoices((prev) => {
      const updated = prev.map((inv) => (inv.id === id ? { ...inv, status } : inv));
      syncState('crm_invoices', updated);
      return updated;
    });

    appendLog('Invoice Slip Reconciled', `Marked ${target.invoiceNumber} invoice ledger status as ${status}.`);
    addToast('success', `Ledger slip ${target.invoiceNumber} status set to ${status}.`);
  };

  const handleDeleteInvoice = (id: string) => {
    if (!currentUser) return;
    if (currentUser.role === 'Admin') {
      // Admin only delete invoices
      const target = invoices.find((inv) => inv.id === id);
      if (!target) return;

      setInvoices((prev) => {
        const updated = prev.filter((inv) => inv.id !== id);
        syncState('crm_invoices', updated);
        return updated;
      });

      appendLog('Invoice Removed', `Deleted billing record of ${target.invoiceNumber}.`);
      addToast('info', 'Invoice sheet removed.');
    } else {
      addToast('error', 'Operation Denied: Deleting legal billing receipts requires Admin clearance.');
    }
  };

  // --- STAFF ACTIONS (Admin only) ---
  const handleAddUser = (userData: Omit<User, 'id' | 'active'>) => {
    if (currentUser?.role !== 'Admin') {
      addToast('error', 'Access Denied: Only Administrator accounts can expand personnel registries.');
      return;
    }

    const newUser: User = {
      ...userData,
      id: `u-${Date.now()}`,
      active: true
    };

    setUsers((prev) => {
      const updated = [...prev, newUser];
      syncState('crm_users', updated);
      return updated;
    });

    appendLog('Personnel Registered', `Added staff personnel ${newUser.name} with ${newUser.role} clearances.`);
    addToast('success', `Team member ${newUser.name} registered.`);
  };

  const handleUpdateUserRole = (userId: string, role: UserRole) => {
    if (currentUser?.role !== 'Admin') {
      addToast('error', 'Access Denied: Only Administrators can alter credential profiles.');
      return;
    }

    const target = users.find((u) => u.id === userId);
    if (!target) return;

    setUsers((prev) => {
      const updated = prev.map((u) => (u.id === userId ? { ...u, role } : u));
      syncState('crm_users', updated);
      return updated;
    });

    appendLog('Credentials Modified', `Altered clearance of ${target.name} to ${role}.`);
    addToast('info', `Set ${target.name}'s clearance status to ${role}.`);
  };

  const handleToggleUserActive = (userId: string) => {
    if (currentUser?.role !== 'Admin') {
      addToast('error', 'Access Denied: Suspending personnel requires Administrator clearance.');
      return;
    }

    const target = users.find((u) => u.id === userId);
    if (!target) return;

    const newActive = !target.active;

    setUsers((prev) => {
      const updated = prev.map((u) => (u.id === userId ? { ...u, active: newActive } : u));
      syncState('crm_users', updated);
      return updated;
    });

    appendLog('Personnel Suspension Altered', `${newActive ? 'Reinstated' : 'Suspended'} corporate credentials of ${target.name}.`);
    addToast('info', `${target.name} account credentials ${newActive ? 'restored' : 'suspended'}.`);
  };

  // Switch Active user tester profile
  const handleSwitchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    
    if (!target.active) {
      addToast('error', `Cannot switch profile: ${target.name}'s credentials are currently suspended.`);
      return;
    }

    setCurrentUser(target);
    localStorage.setItem('crm_current_user', JSON.stringify(target));
    appendLog('User Profile Switched', `Logged into testing node as ${target.name} (${target.role}).`);
    addToast('info', `Test drive profile set to: ${target.name} (${target.role})`);
  };

  // Pricing Plan selector callback - now opens the details/contact registration form
  const handleSelectPlan = (planName: string, price: string) => {
    setSelectedPlanForContact({ name: planName, price });
    
    // Pre-populate with current user details if available
    if (currentUser) {
      setPricingContactName(currentUser.name || '');
      setPricingContactEmail(currentUser.email || '');
    } else {
      setPricingContactName('');
      setPricingContactEmail('');
    }
    setPricingContactCompany('');
    setPricingContactPhone('');
    setPricingContactRegion('North America');
    setPricingContactTeamSize('1-10');
    setPricingContactNotes('');
  };

  // Submit callback for the pricing upgrade contact form
  const handleSubmitPricingContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForContact) return;

    if (!pricingContactName.trim()) {
      addToast('error', 'Contact name is required.');
      return;
    }
    if (!pricingContactEmail.trim()) {
      addToast('error', 'Contact email is required.');
      return;
    }
    if (!pricingContactCompany.trim()) {
      addToast('error', 'Company / Organization name is required.');
      return;
    }
    if (!pricingContactPhone.trim()) {
      addToast('error', 'Phone number is required.');
      return;
    }

    // Success transaction actions
    const planLabel = `${selectedPlanForContact.name} (${billingCycle === 'annually' ? 'Annual' : 'Monthly'} cycle, ${selectedPlanForContact.price})`;
    
    // 1. Log detailed upgrade transaction in logs list
    appendLog(
      'Plan Workspace Activated', 
      `Activated ${planLabel} workspace node for client "${pricingContactName}" at "${pricingContactCompany}" (${pricingContactEmail}, ${pricingContactPhone}). Region: ${pricingContactRegion}, Team Size: ${pricingContactTeamSize}.`
    );

    // 2. Automatically seed as a new Active client or Lead to make it persistent and keep client's detailed info in state!
    const newClient: Client = {
      id: `client-${Date.now()}`,
      name: pricingContactName,
      company: pricingContactCompany,
      email: pricingContactEmail,
      phone: pricingContactPhone,
      status: 'Active',
      address: `Workspace billing node (${pricingContactRegion})`,
      notes: `Activated on ${selectedPlanForContact.name} Plan via workspace pricing flow. Team: ${pricingContactTeamSize}. Custom requirement notes: ${pricingContactNotes || 'None'}`,
      tags: ['SaaS-Customer', selectedPlanForContact.name],
      createdAt: new Date().toISOString().split('T')[0]
    };

    setClients((prev) => {
      const updated = [newClient, ...prev];
      localStorage.setItem('crm_clients', JSON.stringify(updated));
      return updated;
    });

    // 3. Clear modal states
    setIsPricingOpen(false);
    setSelectedPlanForContact(null);

    // 4. Toast notification
    const newToast: Toast = {
      id: `toast-${Date.now()}`,
      type: 'success',
      message: `System node successfully activated under ${pricingContactCompany}! All detailed profile records saved.`
    };
    setToasts((prev) => [newToast, ...prev]);
  };

  // Navigations tab dispatcher
  const renderTabContent = () => {
    if (!currentUser) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <DashboardOverview
            clients={clients}
            appointments={appointments}
            inventory={inventory}
            leads={leads}
            invoices={invoices}
            logs={logs}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );
      case 'clients':
        return (
          <ClientManager
            clients={clients}
            onAddClient={handleAddClient}
            onEditClient={handleEditClient}
            onDeleteClient={handleDeleteClient}
          />
        );
      case 'appointments':
        return (
          <CalendarScheduler
            appointments={appointments}
            clients={clients}
            teamMembers={users.filter(u => u.active)}
            onAddAppointment={handleAddAppointment}
            onUpdateStatus={handleUpdateAppointmentStatus}
            onDeleteAppointment={handleDeleteAppointment}
          />
        );
      case 'inventory':
        return (
          <InventoryManager
            inventory={inventory}
            onAddItem={handleAddInventoryItem}
            onEditItem={handleEditInventoryItem}
            onAdjustStock={handleAdjustStock}
            onDeleteItem={handleDeleteInventoryItem}
          />
        );
      case 'leads':
        return (
          <SalesPipeline
            leads={leads}
            teamMembers={users.filter(u => u.active)}
            onAddLead={handleAddLead}
            onEditLead={handleEditLead}
            onMoveLead={handleMoveLead}
            onDeleteLead={handleDeleteLead}
          />
        );
      case 'billing':
        return (
          <BillingInvoice
            invoices={invoices}
            clients={clients}
            inventory={inventory}
            onAddInvoice={handleAddInvoice}
            onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
            onDeleteInvoice={handleDeleteInvoice}
          />
        );
      case 'analytics':
        return (
          <AnalyticsReports
            clients={clients}
            leads={leads}
            invoices={invoices}
            inventory={inventory}
          />
        );
      case 'roles':
        return (
          <RoleManagement
            users={users}
            currentUser={currentUser}
            onSwitchUser={handleSwitchUser}
            onAddUser={handleAddUser}
            onUpdateRole={handleUpdateUserRole}
            onToggleUserActive={handleToggleUserActive}
          />
        );
      case 'documentation':
        return <DocumentationView />;
      default:
        return <div>Error displaying workspace.</div>;
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white font-mono text-xs uppercase tracking-widest">
        <div className="flex flex-col items-center gap-3">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Booting Secure CRM Node...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        registeredUsers={users}
        onRegisterUser={handleRegisterUser}
      />
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-100 text-slate-900 antialiased font-sans" id="application-root">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentUser={currentUser}
        isMobileOpen={isMobileOpen}
        onToggleMobile={() => setIsMobileOpen(!isMobileOpen)}
        onLogout={handleLogout}
        onUpgradeClick={() => setIsPricingOpen(true)}
      />

      {/* Main Panel Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-6" id="main-content-panel">
        {/* Dynamic header row containing breadcrumb and Active Tester Clearance tag */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200" id="main-header-row">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 font-sans uppercase">
              {activeTab === 'overview' ? 'Operational Hub' : activeTab}
            </h1>
            <p className="text-xs text-slate-500 font-medium">Enterprise Management Platform / CRM Suite</p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Live indicator showing clearance role */}
            <span className="text-[10px] uppercase font-bold tracking-wider font-mono px-2.5 py-1 rounded bg-white text-slate-700 border border-slate-200 flex items-center gap-1 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Active Profile: {currentUser.name.split(' ')[0]} ({currentUser.role})
            </span>
          </div>
        </div>

        {/* Tab content wrapper */}
        <div className="min-h-[70vh]" id="content-container-tab">
          {renderTabContent()}
        </div>
      </main>

      {/* Floating Notifications / Toast Deck */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none" id="toast-deck">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            id={toast.id}
            className={`p-4 rounded-xl shadow-lg border text-xs font-semibold flex items-start gap-3 w-80 max-w-full pointer-events-auto bg-white transition duration-200 ${
              toast.type === 'success' ? 'border-emerald-200 bg-white text-emerald-800' :
              toast.type === 'error' ? 'border-rose-200 bg-white text-rose-800' :
              'border-slate-200 bg-white text-slate-800'
            }`}
          >
            {toast.type === 'success' ? (
              <CircleCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            ) : (
              <Bell className="w-5 h-5 text-indigo-600 shrink-0" />
            )}
            <div className="flex-1">{toast.message}</div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="p-0.5 hover:bg-slate-100 rounded transition cursor-pointer"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        ))}
      </div>

      {/* Pricing and Upgrades Modal */}
      {isPricingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-xs" id="upgrade-pricing-modal">
          <div className="relative w-full max-w-5xl bg-slate-50 rounded-2xl border border-slate-200 shadow-2xl p-6 sm:p-8 overflow-hidden max-h-[90vh] flex flex-col" id="pricing-modal-container">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-200 shrink-0" id="pricing-header">
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-mono font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {selectedPlanForContact ? 'Tenant Configuration' : 'Scalable Node Clearing'}
                </span>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight mt-1 font-sans">
                  {selectedPlanForContact 
                    ? `Register Your ${selectedPlanForContact.name} Workspace` 
                    : 'Upgrade Your Enterprise CRM Workspace'}
                </h2>
                <p className="text-xs text-slate-500 font-semibold">
                  {selectedPlanForContact 
                    ? 'Please provide contact and organizational billing details to activate this computational node.' 
                    : "Select the computational profile that matches your organization's daily operation volume."}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsPricingOpen(false);
                  setSelectedPlanForContact(null);
                }}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition cursor-pointer"
                id="close-pricing-modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Scrollable Content Container */}
            <div className="flex-1 overflow-y-auto py-6 space-y-6" id="pricing-scrollable-body">
              
              {selectedPlanForContact ? (
                /* ---------------------------------------------------- */
                /* DETAILED CLIENT REGISTRATION AND CONTACT FORM        */
                /* ---------------------------------------------------- */
                <form onSubmit={handleSubmitPricingContact} className="space-y-6" id="pricing-contact-form">
                  
                  {/* Selected Plan Summary Card */}
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-600 rounded-lg text-white">
                        <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-700">Selected Option</span>
                        <h3 className="text-base font-black text-slate-800">{selectedPlanForContact.name} Workspace Profile</h3>
                        <p className="text-xs text-slate-500 font-medium">Billed {billingCycle === 'annually' ? 'Annually (Save 20%)' : 'Monthly'}</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-3xl font-black text-indigo-700">{selectedPlanForContact.price}</span>
                      <p className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                        {billingCycle === 'annually' ? 'Annual commitment' : 'Monthly rolling'}
                      </p>
                    </div>
                  </div>

                  {/* Fields Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Authorized Agent / Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={pricingContactName}
                        onChange={(e) => setPricingContactName(e.target.value)}
                        placeholder="e.g. David Chen"
                        className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-slate-800 placeholder-slate-400"
                        id="pricing-input-name"
                      />
                    </div>

                    {/* Company Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Company / Organization Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={pricingContactCompany}
                        onChange={(e) => setPricingContactCompany(e.target.value)}
                        placeholder="e.g. Apex Tech Solutions"
                        className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-slate-800 placeholder-slate-400"
                        id="pricing-input-company"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Work Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={pricingContactEmail}
                        onChange={(e) => setPricingContactEmail(e.target.value)}
                        placeholder="e.g. support@apextech.com"
                        className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-slate-800 placeholder-slate-400"
                        id="pricing-input-email"
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Contact Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={pricingContactPhone}
                        onChange={(e) => setPricingContactPhone(e.target.value)}
                        placeholder="e.g. +1 (555) 234-5678"
                        className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-slate-800 placeholder-slate-400"
                        id="pricing-input-phone"
                      />
                    </div>

                    {/* Region */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Deployment Geographic Region
                      </label>
                      <select
                        value={pricingContactRegion}
                        onChange={(e) => setPricingContactRegion(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-slate-800"
                        id="pricing-input-region"
                      >
                        <option value="North America">North America (US-East / US-West)</option>
                        <option value="Europe / EMEA">Europe (Frankfurt / Dublin)</option>
                        <option value="Asia Pacific / APAC">Asia Pacific (Singapore / Tokyo)</option>
                        <option value="Latin America / LATAM">Latin America (São Paulo)</option>
                      </select>
                    </div>

                    {/* Estimated Team Size */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Estimated CRM Team Size
                      </label>
                      <select
                        value={pricingContactTeamSize}
                        onChange={(e) => setPricingContactTeamSize(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-slate-800"
                        id="pricing-input-teamsize"
                      >
                        <option value="1-10">1 - 10 active agents</option>
                        <option value="11-50">11 - 50 active agents</option>
                        <option value="51-200">51 - 200 active agents</option>
                        <option value="200+">200+ enterprise agents</option>
                      </select>
                    </div>

                    {/* Special Provisioning Instructions */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Provisioning Notes & Custom Instructions (Optional)
                      </label>
                      <textarea
                        value={pricingContactNotes}
                        onChange={(e) => setPricingContactNotes(e.target.value)}
                        placeholder="e.g. Please pre-configure standard tags, enable advanced invoice taxes calculator, and pre-load database entries."
                        rows={3}
                        className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-slate-800 placeholder-slate-400"
                        id="pricing-input-notes"
                      />
                    </div>
                  </div>

                  {/* Form Submission and Back actions */}
                  <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setSelectedPlanForContact(null)}
                      className="px-4 py-2 text-xs font-extrabold text-slate-600 hover:text-indigo-600 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" /> Change Plan Selection
                    </button>

                    <button
                      type="submit"
                      className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black tracking-wider uppercase transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                      Submit & Activate {selectedPlanForContact.name} Node
                    </button>
                  </div>
                </form>
              ) : (
                /* ---------------------------------------------------- */
                /* DEFAULT VIEW - BILLING TOGGLE AND PRICING PLANS GRID */
                /* ---------------------------------------------------- */
                <>
                  {/* Annual/Monthly Billing Toggle Switcher */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200" id="billing-toggle-container">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-50 rounded-lg text-amber-600 border border-amber-100">
                        <Zap className="w-5 h-5 fill-amber-500" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">Choose billing frequency</h3>
                        <p className="text-xs text-slate-500 font-medium">Commit annually to unlock an instant 20% database subscription discount.</p>
                      </div>
                    </div>

                    <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
                      <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-4 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${
                          billingCycle === 'monthly'
                            ? 'bg-white text-slate-800 shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Monthly
                      </button>
                      <button
                        onClick={() => setBillingCycle('annually')}
                        className={`px-4 py-1.5 text-xs font-bold rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                          billingCycle === 'annually'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Annually
                        <span className="text-[9px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full font-black uppercase tracking-wider">
                          Save 20%
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Pricing Cards Grid - Startup, SMB, Enterprise */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="pricing-cards-grid">
                    
                    {/* 1. Startup Plan */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition relative overflow-hidden" id="plan-card-startup">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
                            Startup Plan
                          </span>
                          <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            Lower features
                          </span>
                        </div>

                        <div className="flex items-baseline">
                          <span className="text-4xl font-black text-slate-800">
                            {billingCycle === 'annually' ? '$15' : '$19'}
                          </span>
                          <span className="text-slate-500 text-xs font-semibold ml-1">/ mo</span>
                        </div>
                        {billingCycle === 'annually' && (
                          <span className="block text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded w-max">
                            Billed as $180/year
                          </span>
                        )}
                        <p className="text-xs text-slate-500 leading-relaxed font-medium border-b border-slate-100 pb-4">
                          Perfect for light workloads, micro-businesses, and initial CRM testing.
                        </p>

                        <ul className="space-y-3 pt-2 text-xs">
                          <li className="flex items-start gap-2.5">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="text-slate-600">Up to <strong>100 clients</strong></span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="text-slate-600">Standard sales pipeline board</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="text-slate-600">Invoicing & Billing (max 10/mo)</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="text-slate-600">Single active staff login</span>
                          </li>
                          <li className="flex items-start gap-2.5 text-slate-400">
                            <span className="shrink-0 text-slate-300 mt-0.5">✕</span>
                            <span className="line-through">Real-time reports & analytics</span>
                          </li>
                          <li className="flex items-start gap-2.5 text-slate-400">
                            <span className="shrink-0 text-slate-300 mt-0.5">✕</span>
                            <span className="line-through">Custom staff roles configuration</span>
                          </li>
                        </ul>
                      </div>

                      <button
                        onClick={() => handleSelectPlan('Startup', billingCycle === 'annually' ? '$15/mo' : '$19/mo')}
                        className="mt-8 w-full py-2.5 border border-slate-200 hover:border-indigo-600 bg-white hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-600 rounded-xl text-xs font-black tracking-wider uppercase transition cursor-pointer"
                      >
                        Select Startup Node
                      </button>
                    </div>

                    {/* 2. SMB Plan */}
                    <div className="bg-white rounded-2xl border-2 border-indigo-600 shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition relative overflow-hidden" id="plan-card-smb">
                      {/* "Most Popular" Banner tag */}
                      <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow-xs">
                        Popular Option
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600">
                            SMB Plan
                          </span>
                          <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                            Mid-tier features
                          </span>
                        </div>

                        <div className="flex items-baseline">
                          <span className="text-4xl font-black text-slate-800">
                            {billingCycle === 'annually' ? '$39' : '$49'}
                          </span>
                          <span className="text-slate-500 text-xs font-semibold ml-1">/ mo</span>
                        </div>
                        {billingCycle === 'annually' && (
                          <span className="block text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded w-max">
                            Billed as $468/year
                          </span>
                        )}
                        <p className="text-xs text-slate-500 leading-relaxed font-medium border-b border-slate-100 pb-4">
                          Perfect for growing businesses requiring multiple role permissions and analytics.
                        </p>

                        <ul className="space-y-3 pt-2 text-xs">
                          <li className="flex items-start gap-2.5">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="text-slate-600">Up to <strong>1,000 clients</strong></span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="text-slate-600">Multi-stage sales board</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="text-slate-600">Unlimited Invoicing & Billing</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="text-slate-600">Up to <strong>5 staff profiles</strong></span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="text-slate-600">Basic reports & dashboard charts</span>
                          </li>
                          <li className="flex items-start gap-2.5 text-slate-400">
                            <span className="shrink-0 text-slate-300 mt-0.5">✕</span>
                            <span className="line-through">Custom roles configuration</span>
                          </li>
                        </ul>
                      </div>

                      <button
                        onClick={() => handleSelectPlan('SMB', billingCycle === 'annually' ? '$39/mo' : '$49/mo')}
                        className="mt-8 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black tracking-wider uppercase transition shadow-md hover:shadow-lg cursor-pointer"
                      >
                        Select SMB Node
                      </button>
                    </div>

                    {/* 3. Enterprise Plan */}
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition relative overflow-hidden text-white" id="plan-card-enterprise">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">
                            Enterprise Plan
                          </span>
                          <span className="text-[9px] font-bold text-indigo-400 bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-900/40">
                            All features
                          </span>
                        </div>

                        <div className="flex items-baseline">
                          <span className="text-4xl font-black text-white">
                            {billingCycle === 'annually' ? '$79' : '$99'}
                          </span>
                          <span className="text-slate-400 text-xs font-semibold ml-1">/ mo</span>
                        </div>
                        {billingCycle === 'annually' && (
                          <span className="block text-[10px] text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-900/30 px-2 py-0.5 rounded w-max">
                            Billed as $948/year
                          </span>
                        )}
                        <p className="text-xs text-slate-400 leading-relaxed font-medium border-b border-slate-800 pb-4">
                          Ultimate capabilities for high-volume enterprise pipelines and advanced inventory.
                        </p>

                        <ul className="space-y-3 pt-2 text-xs">
                          <li className="flex items-start gap-2.5">
                            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span className="text-slate-200"><strong>Unlimited</strong> clients & leads</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span className="text-slate-200">Custom sales automation pipelines</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span className="text-slate-200">Advanced Inventory & warehouse logs</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span className="text-slate-200">Custom clearance & role setup</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span className="text-slate-200">Full Reports & Real-time analytics</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span className="text-slate-200">Dedicated Success Manager (24/7)</span>
                          </li>
                        </ul>
                      </div>

                      <button
                        onClick={() => handleSelectPlan('Enterprise', billingCycle === 'annually' ? '$79/mo' : '$99/mo')}
                        className="mt-8 w-full py-2.5 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-black tracking-wider uppercase transition cursor-pointer"
                      >
                        Select Enterprise Node
                      </button>
                    </div>

                  </div>

                  {/* Enterprise CRM SLA Guarantee & Trust Banner */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center gap-4 justify-between" id="pricing-trust-banner">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800">ISO-27001 & SOC-2 Certified Nodes</h4>
                        <p className="text-[11px] text-slate-500 font-medium">Every CRM tenant is strictly sandboxed with bank-level encryption, multi-region database redundancy, and a 99.99% active SLA uptime guarantee.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-extrabold shrink-0">
                      <HelpCircle className="w-4 h-4" /> Need a Custom Tier?
                    </div>
                  </div>
                </>
              )}

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 shrink-0 text-xs font-semibold text-slate-500" id="pricing-footer">
              <span>* Upgrade takes effect immediately. Cancel or switch anytime.</span>
              <button
                onClick={() => {
                  setIsPricingOpen(false);
                  setSelectedPlanForContact(null);
                }}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition cursor-pointer"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
