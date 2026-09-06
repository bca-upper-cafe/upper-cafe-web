'use client';

import React, { useState, useEffect } from 'react';
import { TeacherAbsence, CheckInRecord, CafeStats } from '@/types';
import {
  fetchAbsences,
  createAbsence,
  deleteAbsence,
  importGoogleDocAbsences,
  fetchCheckins,
  checkOutStudent,
  checkOutAll,
  fetchStats,
} from '@/lib/api';
import { clsx } from 'clsx';

export default function AdminAttendanceDeskPage() {
  const [filterTab, setFilterTab] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [activeSubTab, setActiveSubTab] = useState<'ROSTER' | 'IMPORT' | 'ABSENCES'>('ROSTER');
  const [stats, setStats] = useState<CafeStats | null>(null);
  const [checkins, setCheckins] = useState<CheckInRecord[]>([]);
  const [absences, setAbsences] = useState<TeacherAbsence[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Form states for manual absence creation
  const [newTeacher, setNewTeacher] = useState('');
  const [newDept, setNewDept] = useState('Mathematics');
  const [newPeriods, setNewPeriods] = useState<number[]>([2, 3]);
  const [newRoom, setNewRoom] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Google Doc paste state (inspired by One-Click Import in Image 2)
  const [docText, setDocText] = useState(
    `Dr. Robert DeFalco - Physics - Periods 2, 3, 7 - Room 234\nMs. Elena Respass - Mathematics - Periods 4, 5 - Room 118\nMr. David Zhang\tComputer Science\tP1, 8, 9\tUpper Cafe lab\nDr. Janice Kaplan - History - Periods 6, 7 - Room 205`
  );
  const [importNotice, setImportNotice] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, c, a] = await Promise.all([
        fetchStats(),
        fetchCheckins(),
        fetchAbsences(),
      ]);
      setStats(s);
      setCheckins(c);
      setAbsences(a);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTogglePeriod = (p: number) => {
    setNewPeriods((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleAddAbsence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacher.trim() || newPeriods.length === 0) return;

    await createAbsence({
      teacherName: newTeacher.trim(),
      department: newDept,
      date: new Date().toISOString().split('T')[0],
      periods: newPeriods.sort((a, b) => a - b),
      room: newRoom.trim() || undefined,
      notes: newNotes.trim() || 'Report to Upper Cafe for study hall',
    });

    setNewTeacher('');
    setNewRoom('');
    setNewNotes('');
    loadData();
  };

  const handleDeleteAbsence = async (id: string) => {
    if (!confirm('Delete this absence record?')) return;
    await deleteAbsence(id);
    loadData();
  };

  const handleImportDoc = async () => {
    if (!docText.trim()) return;
    const res = await importGoogleDocAbsences(docText, true);
    setImportNotice(`Successfully imported ${res.parsedCount || 0} teachers from Google Doc.`);
    loadData();
  };

  const handleCheckOut = async (id: string) => {
    await checkOutStudent(id);
    loadData();
  };

  const handleCheckOutAll = async () => {
    if (!confirm('Check out all active students?')) return;
    await checkOutAll();
    loadData();
  };

  const filteredCheckins = checkins.filter((c) => {
    if (filterTab === 'ACTIVE' && c.status !== 'ACTIVE') return false;
    if (filterTab === 'COMPLETED' && c.status !== 'COMPLETED') return false;

    const q = search.toLowerCase();
    return (
      c.studentName.toLowerCase().includes(q) ||
      c.studentEmail.toLowerCase().includes(q) ||
      c.academy.toLowerCase().includes(q) ||
      c.studentId.includes(q)
    );
  });

  const activeCount = checkins.filter((c) => c.status === 'ACTIVE').length;
  const completedCount = checkins.filter((c) => c.status === 'COMPLETED').length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 w-full flex-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Upper Cafe Attendance Desk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time student occupancy roster and teacher absence management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            className="text-xs font-semibold px-3 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={handleCheckOutAll}
            className="text-xs font-semibold px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
          >
            Check Out All Active
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white border border-slate-200 rounded-lg p-3">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Active Students</div>
            <div className="text-xl font-bold text-slate-900 mt-1">{stats.activeStudentsCount}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-3">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Current Period</div>
            <div className="text-xl font-bold text-slate-900 mt-1">Period {stats.currentPeriod}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-3">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Today's Absences</div>
            <div className="text-xl font-bold text-slate-900 mt-1">{stats.todayAbsencesCount} Teachers</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-3">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Absence vs Sched</div>
            <div className="text-sm font-bold text-slate-800 mt-1.5">
              {stats.teacherAbsentCount} absent • {stats.defaultStudyHallCount} sched
            </div>
          </div>
        </div>
      )}

      {/* Main Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveSubTab('ROSTER')}
          className={clsx(
            'px-4 py-2 text-xs font-semibold cursor-pointer border-b-2 transition-colors',
            activeSubTab === 'ROSTER'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          )}
        >
          Check-In Roster ({checkins.length})
        </button>
        <button
          onClick={() => setActiveSubTab('IMPORT')}
          className={clsx(
            'px-4 py-2 text-xs font-semibold cursor-pointer border-b-2 transition-colors',
            activeSubTab === 'IMPORT'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          )}
        >
          One-Click Google Doc Import
        </button>
        <button
          onClick={() => setActiveSubTab('ABSENCES')}
          className={clsx(
            'px-4 py-2 text-xs font-semibold cursor-pointer border-b-2 transition-colors',
            activeSubTab === 'ABSENCES'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          )}
        >
          Manage Absences ({absences.length})
        </button>
      </div>

      {/* TAB 1: Roster View inspired by Image 2 */}
      {activeSubTab === 'ROSTER' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Segmented Filter: All | Checked In | Checked Out */}
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFilterTab('ALL')}
                className={clsx(
                  'px-3 py-1.5 rounded-md cursor-pointer transition-colors',
                  filterTab === 'ALL'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                All ({checkins.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('ACTIVE')}
                className={clsx(
                  'px-3 py-1.5 rounded-md cursor-pointer transition-colors',
                  filterTab === 'ACTIVE'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                Checked In ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('COMPLETED')}
                className={clsx(
                  'px-3 py-1.5 rounded-md cursor-pointer transition-colors',
                  filterTab === 'COMPLETED'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                Checked Out ({completedCount})
              </button>
            </div>

            {/* Search */}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, ID..."
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 sm:w-64"
            />
          </div>

          {/* Roster Table */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Student</th>
                  <th className="py-2.5 px-4">Academy / Grade</th>
                  <th className="py-2.5 px-4">Period</th>
                  <th className="py-2.5 px-4">Reason</th>
                  <th className="py-2.5 px-4">Check-In Time</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCheckins.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No records match the current filter.
                    </td>
                  </tr>
                ) : (
                  filteredCheckins.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{c.studentName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{c.studentEmail} {c.studentId ? `• #${c.studentId}` : ''}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {c.academy} • Gr {c.grade}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        P{c.period}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {c.scenario === 'DEFAULT_STUDY_HALL'
                          ? 'Scheduled Study Hall'
                          : `Absence: ${c.absentTeacherName || 'Teacher'}`}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(c.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {c.status === 'ACTIVE' ? (
                          <button
                            type="button"
                            onClick={() => handleCheckOut(c.id)}
                            className="bg-slate-800 hover:bg-slate-900 text-white font-semibold text-[11px] px-3 py-1 rounded cursor-pointer transition-colors"
                          >
                            Check Out
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: One-Click Google Doc Import inspired by Image 2 */}
      {activeSubTab === 'IMPORT' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">One-Click Google Doc Import</h2>
            <p className="text-xs text-slate-500 mt-1">
              Copy and paste rows from the BCA daily absence Google Doc or spreadsheet. The parser will extract teacher names, periods, rooms, and notes.
            </p>
          </div>

          <textarea
            rows={8}
            value={docText}
            onChange={(e) => setDocText(e.target.value)}
            placeholder="Paste Google Doc absence lines here..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-400"
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Parses dashes, tabs, period ranges (e.g. Periods 2-4), and rooms.
            </span>
            <button
              type="button"
              onClick={handleImportDoc}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2 px-4 rounded-lg cursor-pointer transition-colors"
            >
              Parse & Import Absences
            </button>
          </div>

          {importNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-medium">
              {importNotice}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Absence CRUD */}
      {activeSubTab === 'ABSENCES' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Manual Add Form */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-slate-900">Add Teacher Absence</h2>

            <form onSubmit={handleAddAbsence} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Teacher Name *</label>
                <input
                  type="text"
                  required
                  value={newTeacher}
                  onChange={(e) => setNewTeacher(e.target.value)}
                  placeholder="e.g. Dr. Robert DeFalco"
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Department</label>
                <select
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science & Physics">Science & Physics</option>
                  <option value="Humanities & History">Humanities & History</option>
                  <option value="Computer Science & ATCS">Computer Science & ATCS</option>
                  <option value="Engineering & Technology">Engineering & Technology</option>
                  <option value="World Languages">World Languages</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Periods Absent</label>
                <div className="grid grid-cols-5 gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((p) => {
                    const sel = newPeriods.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handleTogglePeriod(p)}
                        className={clsx(
                          'py-1 rounded text-xs font-semibold border cursor-pointer',
                          sel
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        )}
                      >
                        P{p}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Room</label>
                <input
                  type="text"
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                  placeholder="e.g. Room 234"
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Coverage Notes</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Report to Upper Cafe. Schoology assignment posted."
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 rounded text-xs cursor-pointer transition-colors"
              >
                Add Absence
              </button>
            </form>
          </div>

          {/* List of absences */}
          <div className="md:col-span-2 space-y-2">
            <h2 className="text-sm font-bold text-slate-900">Current Absences ({absences.length})</h2>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm divide-y divide-slate-100">
              {absences.map((a) => (
                <div key={a.id} className="p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-900">
                      {a.teacherName} <span className="font-normal text-slate-500">({a.department})</span>
                    </div>
                    <div className="text-slate-500 mt-0.5">
                      Periods: <span className="font-mono font-medium text-slate-800">{a.periods.map((p) => `P${p}`).join(', ')}</span> {a.room ? `• ${a.room}` : ''}
                    </div>
                    {a.notes && <div className="text-slate-600 mt-1">{a.notes}</div>}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteAbsence(a.id)}
                    className="text-xs text-red-600 hover:text-red-800 font-semibold px-2 py-1 rounded cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
