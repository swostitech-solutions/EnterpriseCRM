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
import { Bell, ShieldCheck, AlertCircle, X, CircleCheck } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

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
    </div>
  );
}
