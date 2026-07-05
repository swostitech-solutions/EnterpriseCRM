/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  Search, 
  X, 
  CheckCircle, 
  XCircle, 
  Users,
  ChevronLeft,
  ChevronRight,
  MapPin,
  CalendarDays
} from 'lucide-react';
import { Appointment, Client, User as TeamUser } from '../types';

interface CalendarSchedulerProps {
  appointments: Appointment[];
  clients: Client[];
  teamMembers: TeamUser[];
  onAddAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  onUpdateStatus: (id: string, status: 'Scheduled' | 'Completed' | 'Cancelled') => void;
  onDeleteAppointment: (id: string) => void;
}

export default function CalendarScheduler({
  appointments,
  clients,
  teamMembers,
  onAddAppointment,
  onUpdateStatus,
  onDeleteAppointment
}: CalendarSchedulerProps) {
  const [selectedDateStr, setSelectedDateStr] = useState<string>(''); // empty means show all
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form states
  const [clientId, setClientId] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const [assigneeId, setAssigneeId] = useState('');

  // Local helper for month view (July 2026, based on the current date: 2026-07-04)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(6); // 0-indexed, so 6 is July

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate days for July 2026
  // July 1, 2026 starts on a Wednesday
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay(); // 0 is Sunday, 3 is Wednesday
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  // Filtered Appointments
  const filteredAppointments = appointments.filter(app => {
    const matchesDate = !selectedDateStr || app.date === selectedDateStr;
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesDate && matchesStatus;
  }).sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  const handleDayClick = (day: number) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const fullDate = `${currentYear}-${formattedMonth}-${formattedDay}`;
    
    if (selectedDateStr === fullDate) {
      setSelectedDateStr(''); // Toggle off
    } else {
      setSelectedDateStr(fullDate);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
    setSelectedDateStr('');
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
    setSelectedDateStr('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !title || !date || !time) return;

    const selectedClient = clients.find(c => c.id === clientId);
    const selectedAssignee = teamMembers.find(u => u.id === assigneeId);

    onAddAppointment({
      clientId,
      clientName: selectedClient ? selectedClient.name : 'Unknown Client',
      title,
      date,
      time,
      duration,
      status: 'Scheduled',
      notes,
      assigneeId,
      assigneeName: selectedAssignee ? selectedAssignee.name : 'Unassigned'
    });

    setIsFormOpen(false);
    // Reset form
    setClientId('');
    setTitle('');
    setDate('');
    setTime('');
    setDuration(60);
    setNotes('');
    setAssigneeId('');
  };

  // Helper to check if a calendar date has an appointment
  const hasAppointmentOnDate = (day: number) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const fullDate = `${currentYear}-${formattedMonth}-${formattedDay}`;
    return appointments.some(app => app.date === fullDate);
  };

  return (
    <div className="space-y-6" id="calendar-scheduler-view">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs" id="calendar-header-card">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-indigo-600" /> Appointment & Calendar Scheduler
          </h2>
          <p className="text-xs text-slate-500 mt-1">Book customer syncs, assign sales reps, and adjust meeting outcomes.</p>
        </div>
        <button
          id="schedule-meeting-btn"
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Book Appointment
        </button>
      </div>

      {/* Main Workspace Layout: Calendar Grid and List of Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="scheduler-workspace">
        {/* Left Side: Dynamic Grid Calendar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col" id="calendar-widget-card">
          <div className="flex items-center justify-between mb-4" id="calendar-month-selector">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-sans">
              {months[currentMonth]} {currentYear}
            </h3>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevMonth}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <div>Su</div>
            <div>Mo</div>
            <div>Tu</div>
            <div>We</div>
            <div>Th</div>
            <div>Fr</div>
            <div>Sa</div>
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1 flex-1 text-center text-sm font-medium" id="calendar-days-grid">
            {/* Blank empty slots leading up to the start of month */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-10"></div>
            ))}

            {/* Render actual calendar month days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const formattedMonth = String(currentMonth + 1).padStart(2, '0');
              const formattedDay = String(day).padStart(2, '0');
              const cellDateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
              const isSelected = selectedDateStr === cellDateStr;
              const hasMeeting = hasAppointmentOnDate(day);
              
              // Highlight today if matches system current date: 2026-07-04
              const isToday = cellDateStr === '2026-07-04';

              return (
                <button
                  key={`day-${day}`}
                  onClick={() => handleDayClick(day)}
                  className={`h-10 rounded-lg flex flex-col items-center justify-center relative transition hover:bg-indigo-50/50 cursor-pointer ${
                    isSelected ? 'bg-indigo-600 text-white font-bold hover:bg-indigo-600' :
                    isToday ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold' : 'text-slate-800'
                  }`}
                >
                  <span className="text-xs">{day}</span>
                  {hasMeeting && (
                    <span className={`w-1.5 h-1.5 rounded-full absolute bottom-1.5 ${isSelected ? 'bg-white' : 'bg-indigo-500'}`}></span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-5 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1.5" id="calendar-legend">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>
              <span>Has scheduled events</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block border border-indigo-200"></span>
              <span>Today (July 4, 2026)</span>
            </div>
            <div className="pt-1.5 text-[11px] text-slate-400 italic">
              * Click any date cell to filter meetings. Click again to show all.
            </div>
          </div>
        </div>

        {/* Right Side: Appointment List / Daily Agenda */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col" id="scheduler-agenda-card">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50" id="agenda-controls">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                {selectedDateStr ? `Agenda for: ${selectedDateStr}` : 'Complete Agenda Schedule'}
              </h3>
              <p className="text-xs text-slate-500">Sorted by time schedule.</p>
            </div>
            <select
              id="appointment-status-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden"
            >
              <option value="all">All Outcomes</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* List items */}
          <div className="p-5 overflow-y-auto flex-1 max-h-[480px] space-y-4" id="agenda-list-wrapper">
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                No appointments booked on this selection.
              </div>
            ) : (
              filteredAppointments.map((app) => (
                <div
                  key={app.id}
                  id={`appointment-item-${app.id}`}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-indigo-200 transition"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase font-mono ${
                        app.status === 'Scheduled' ? 'bg-amber-100 text-amber-800' :
                        app.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {app.status}
                      </span>
                      <span className="text-xs font-mono text-slate-400 bg-white border border-slate-150 px-2 py-0.5 rounded">
                        {app.date} @ {app.time}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{app.title}</h4>
                    <p className="text-xs text-slate-600 font-medium">Customer: <strong className="text-indigo-600 font-semibold">{app.clientName}</strong></p>
                    
                    {app.notes && (
                      <p className="text-xs text-slate-500 italic mt-1 bg-white/70 p-2 rounded border border-slate-100">
                        "{app.notes}"
                      </p>
                    )}

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium pt-1">
                      <User className="w-3.5 h-3.5 text-slate-400" /> Assigned Rep: <strong className="text-slate-700">{app.assigneeName}</strong>
                    </div>
                  </div>

                  {/* Status Adjusters / Actions */}
                  <div className="flex sm:flex-col items-end gap-2 text-right w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block hidden sm:block">Status Action</span>
                    <div className="flex gap-1.5 w-full justify-between sm:justify-end">
                      {app.status === 'Scheduled' && (
                        <>
                          <button
                            id={`app-complete-btn-${app.id}`}
                            onClick={() => onUpdateStatus(app.id, 'Completed')}
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Check-in
                          </button>
                          <button
                            id={`app-cancel-btn-${app.id}`}
                            onClick={() => onUpdateStatus(app.id, 'Cancelled')}
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-slate-200 hover:bg-rose-50 hover:text-rose-700 text-slate-700 rounded-md transition cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Cancel
                          </button>
                        </>
                      )}
                      <button
                        id={`app-delete-btn-${app.id}`}
                        onClick={() => onDeleteAppointment(app.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                        title="Delete record"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal Form */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50" id="appointment-modal">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-md font-bold text-slate-900">
                  Book Corporate Sync Meeting
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
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Target Client *</label>
                  <select
                    required
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="">-- Choose Client Profile --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.company || 'Individual'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Meeting Title / Purpose *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Contract Review & Technical Demo"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Date *</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Time *</label>
                    <input
                      type="time"
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Duration (minutes)</label>
                    <input
                      type="number"
                      required
                      min={10}
                      step={5}
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Assigned Agent *</label>
                    <select
                      required
                      value={assigneeId}
                      onChange={(e) => setAssigneeId(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:border-indigo-500"
                    >
                      <option value="">-- Assign Team Rep --</option>
                      {teamMembers.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Agenda / Meeting Notes</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Core goals, dial-in credentials, or background information."
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
                    Confirm Booking
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
