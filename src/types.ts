/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Admin' | 'Manager' | 'Agent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  active: boolean;
  username?: string;
  password?: string;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'Active' | 'Lead' | 'Inactive';
  address: string;
  notes: string;
  tags: string[];
  createdAt: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // minutes
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  notes: string;
  assigneeId: string;
  assigneeName: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  description: string;
  location: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export type PipelineStage = 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';

export interface Lead {
  id: string;
  name: string;
  company: string;
  value: number;
  stage: PipelineStage;
  email: string;
  phone: string;
  notes: string;
  assigneeId: string;
  assigneeName: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number; // percentage, e.g. 8
  total: number;
  status: 'Paid' | 'Unpaid' | 'Overdue';
  notes: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  details: string;
  timestamp: string; // YYYY-MM-DD HH:mm:ss
}

// Initial realistic seed data for the CRM
export const SEED_USERS: User[] = [
  { id: 'u0', name: 'Demo User', email: 'demo@enterprise-crm.com', role: 'Admin', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80', active: true, username: 'test', password: 'test' },
  { id: 'u1', name: 'Alexander Wright', email: 'alex@enterprise-crm.com', role: 'Admin', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', active: true, username: 'alex', password: 'password' },
  { id: 'u2', name: 'Sarah Jenkins', email: 'sarah@enterprise-crm.com', role: 'Manager', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', active: true, username: 'sarah', password: 'password' },
  { id: 'u3', name: 'Marcus Sterling', email: 'marcus@enterprise-crm.com', role: 'Agent', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', active: true, username: 'marcus', password: 'password' },
  { id: 'u4', name: 'Elena Rostova', email: 'elena@enterprise-crm.com', role: 'Agent', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', active: true, username: 'elena', password: 'password' }
];

export const SEED_CLIENTS: Client[] = [
  { id: 'c1', name: 'David Chen', company: 'Apex Tech Solutions', email: 'dchen@apextech.com', phone: '+1 (555) 234-5678', status: 'Active', address: '100 Silicon Valley Blvd, San Jose, CA', notes: 'Interested in premium support renewals.', tags: ['Enterprise', 'Tech'], createdAt: '2026-01-15' },
  { id: 'c2', name: 'Miranda Lawson', company: 'Cerberus Media', email: 'mlawson@cerberus.co', phone: '+1 (555) 876-5432', status: 'Active', address: '452 Broadway, New York, NY', notes: 'Regular buyer for campaign advertising slots.', tags: ['Premium', 'Media'], createdAt: '2026-02-10' },
  { id: 'c3', name: 'Bruce Wayne', company: 'Wayne Enterprises', email: 'bruce@waynecorp.com', phone: '+1 (555) 999-1111', status: 'Active', address: '1007 Mountain Drive, Gotham', notes: 'High-value account. Prefers customized tech hardware orders.', tags: ['VIP', 'Industrial'], createdAt: '2026-03-01' },
  { id: 'c4', name: 'Clara Oswald', company: 'Time Jumpers Ltd', email: 'clara@timejumpers.io', phone: '+1 (555) 432-1098', status: 'Lead', address: '77 Baker St, London, UK', notes: 'Evaluating our consulting services list.', tags: ['Consulting', 'SME'], createdAt: '2026-05-18' },
  { id: 'c5', name: 'Arthur Dent', company: 'Guide Books Corp', email: 'arthur@hitchhike.org', phone: '+1 (555) 424-2424', status: 'Inactive', address: '15 Cottington Lane, Islington, UK', notes: 'Lost touch. Relocated to another planet.', tags: ['SME', 'Publishing'], createdAt: '2026-04-12' }
];

export const SEED_INVENTORY: InventoryItem[] = [
  { id: 'i1', name: 'Enterprise Core License', sku: 'LIC-ENT-01', category: 'Software', price: 1200, stock: 150, minStock: 20, description: 'Annual server subscription node license.', location: 'Cloud DB Server', status: 'In Stock' },
  { id: 'i2', name: 'CRM Integration Adapter', sku: 'ADP-CRM-12', category: 'Software', price: 350, stock: 500, minStock: 50, description: 'Direct integration module for legacy ERPs.', location: 'Cloud CDN', status: 'In Stock' },
  { id: 'i3', name: 'High-Performance Terminal v4', sku: 'HW-TERM-V4', category: 'Hardware', price: 899, stock: 12, minStock: 15, description: 'Direct checkout touch terminal and display.', location: 'Warehouse A', status: 'Low Stock' },
  { id: 'i4', name: 'Smart Card Security Key', sku: 'SEC-KEY-99', category: 'Hardware', price: 45, stock: 0, minStock: 30, description: 'FIDO2 certified hardware authentication key.', location: 'Warehouse B', status: 'Out of Stock' },
  { id: 'i5', name: 'VIP Consulting Day Pass', sku: 'SVC-CONS-01', category: 'Services', price: 2500, stock: 999, minStock: 10, description: '8 hours of expert-led business intelligence consulting.', location: 'Remote / On-site', status: 'In Stock' }
];

export const SEED_LEADS: Lead[] = [
  { id: 'l1', name: 'Gregory House', company: 'Plainsboro Diagnostics', value: 45000, stage: 'Proposal', email: 'house@plainsboro.org', phone: '+1 (555) 911-3434', notes: 'Requested quotation for enterprise licensing for 200 medical terminals.', assigneeId: 'u2', assigneeName: 'Sarah Jenkins', updatedAt: '2026-07-01' },
  { id: 'l2', name: 'Selina Kyle', company: 'Gotham Jewelers', value: 12500, stage: 'Negotiation', email: 'selina@gothamjewels.com', phone: '+1 (555) 321-4567', notes: 'Negotiating price list for bespoke inventory tracking software setup.', assigneeId: 'u3', assigneeName: 'Marcus Sterling', updatedAt: '2026-07-03' },
  { id: 'l3', name: 'Tony Stark', company: 'Stark Industries', value: 180000, stage: 'Qualified', email: 'tony@stark.com', phone: '+1 (555) 300-3000', notes: 'Huge interest in multi-platform billing suite integration.', assigneeId: 'u4', assigneeName: 'Elena Rostova', updatedAt: '2026-06-28' },
  { id: 'l4', name: 'Peter Parker', company: 'Daily Bugle', value: 3500, stage: 'Contacted', email: 'peter@dailybugle.net', phone: '+1 (555) 123-0987', notes: 'Inquired about photography equipment stock tracking software.', assigneeId: 'u3', assigneeName: 'Marcus Sterling', updatedAt: '2026-07-04' },
  { id: 'l5', name: 'Diana Prince', company: 'The Louvre Museum', value: 65000, stage: 'Won', email: 'diana@louvre.fr', phone: '+1 (555) 888-0000', notes: 'Signed agreement. Handing over to installation agent.', assigneeId: 'u2', assigneeName: 'Sarah Jenkins', updatedAt: '2026-06-30' }
];

export const SEED_APPOINTMENTS: Appointment[] = [
  { id: 'a1', clientId: 'c1', clientName: 'David Chen', title: 'Support Renewal Review', date: '2026-07-05', time: '10:00', duration: 45, status: 'Scheduled', notes: 'Review current support SLAs and draft new core contract.', assigneeId: 'u2', assigneeName: 'Sarah Jenkins' },
  { id: 'a2', clientId: 'c3', clientName: 'Bruce Wayne', title: 'Wayne Corp Hardware Demo', date: '2026-07-06', time: '14:00', duration: 60, status: 'Scheduled', notes: 'Present v4 terminals hardware capabilities. Heavy security focus.', assigneeId: 'u3', assigneeName: 'Marcus Sterling' },
  { id: 'a3', clientId: 'c2', clientName: 'Miranda Lawson', title: 'Q3 Marketing Strategy Session', date: '2026-07-04', time: '11:00', duration: 90, status: 'Completed', notes: 'Reviewed ad spaces and generated initial invoicing draft.', assigneeId: 'u4', assigneeName: 'Elena Rostova' },
  { id: 'a4', clientId: 'c4', clientName: 'Clara Oswald', title: 'Introductory Discovery Call', date: '2026-07-08', time: '15:30', duration: 30, status: 'Scheduled', notes: 'Discuss consulting scopes for the UK regional offices.', assigneeId: 'u4', assigneeName: 'Elena Rostova' }
];

export const SEED_INVOICES: Invoice[] = [
  {
    id: 'inv1',
    invoiceNumber: 'INV-2026-001',
    clientId: 'c1',
    clientName: 'David Chen (Apex Tech Solutions)',
    issueDate: '2026-06-15',
    dueDate: '2026-07-15',
    items: [
      { id: 'it1', description: 'Enterprise Core License Subscription', quantity: 2, price: 1200 },
      { id: 'it2', description: 'CRM Integration Adapter Installation Support', quantity: 1, price: 350 }
    ],
    subtotal: 2750,
    taxRate: 8,
    total: 2970,
    status: 'Paid',
    notes: 'Payment processed via electronic wire transfer. Thank you!'
  },
  {
    id: 'inv2',
    invoiceNumber: 'INV-2026-002',
    clientId: 'c3',
    clientName: 'Bruce Wayne (Wayne Enterprises)',
    issueDate: '2026-07-01',
    dueDate: '2026-08-01',
    items: [
      { id: 'it3', description: 'High-Performance Terminal v4 Devices', quantity: 5, price: 899 },
      { id: 'it4', description: 'VIP Consulting Day Pass - Security Audit', quantity: 2, price: 2500 }
    ],
    subtotal: 9495,
    taxRate: 8,
    total: 10254.6,
    status: 'Unpaid',
    notes: 'Awaiting purchase order department validation.'
  },
  {
    id: 'inv3',
    invoiceNumber: 'INV-2026-003',
    clientId: 'c5',
    clientName: 'Arthur Dent (Guide Books Corp)',
    issueDate: '2026-05-10',
    dueDate: '2026-06-10',
    items: [
      { id: 'it5', description: 'CRM Integration Adapter Subscription', quantity: 1, price: 350 }
    ],
    subtotal: 350,
    taxRate: 5,
    total: 367.5,
    status: 'Overdue',
    notes: 'Sent repeated payment reminders. Account currently on hold.'
  }
];

export const SEED_LOGS: ActivityLog[] = [
  { id: 'log1', userId: 'u1', userName: 'Alexander Wright', role: 'Admin', action: 'System Initialized', details: 'CRM environment deployed and initial seed data generated successfully.', timestamp: '2026-07-04 18:00:00' },
  { id: 'log2', userId: 'u2', userName: 'Sarah Jenkins', role: 'Manager', action: 'Client Created', details: 'Added new client lead Clara Oswald (Time Jumpers Ltd).', timestamp: '2026-07-04 19:15:30' },
  { id: 'log3', userId: 'u3', userName: 'Marcus Sterling', role: 'Agent', action: 'Lead Stage Transition', details: 'Moved Selina Kyle lead to "Negotiation" status.', timestamp: '2026-07-04 20:05:10' },
  { id: 'log4', userId: 'u4', userName: 'Elena Rostova', role: 'Agent', action: 'Appointment Completed', details: 'Completed "Q3 Marketing Strategy Session" with Miranda Lawson.', timestamp: '2026-07-04 20:45:00' }
];
