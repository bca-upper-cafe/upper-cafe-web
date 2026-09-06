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
import { DuolingoButton } from '@/components/DuolingoButton';
import {
  Shield,
  Plus,
  Trash2,
  FileSpreadsheet,
  Users,
  LogOut,
  RefreshCw,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { clsx } from 'clsx';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'ROSTER' | 'ABSENCES' | 'IMPORT'>('ROSTER');
  const [stats, setStats] = useState<CafeStats | null>(null);
  const [checkins, setCheckins] = useState<CheckInRecord[]>([]);
  const [absences, setAbsences] = useState<TeacherAbsence[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for manual absence creation
  const [newTeacher, setNewTeacher] = useState('');
  const [newDept, setNewDept] = useState('Mathematics');
  const [newPeriods, setNewPeriods] = useState<number[]>([2, 3]);
  const [newRoom, setNewRoom] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Google Doc paste state
  const [docText, setDocText] = useState(
    `Dr. Robert DeFalco - Physics - Periods 2, 3, 7 - Room 234\nMs. Elena Respass - Mathematics - Periods 4, 5 - Room 118\nMr. David Zhang\tComputer Science\tP1, 8, 9\tUpper Cafe lab\nDr. Janice Kaplan - History - Periods 6, 7 - Room 205`
  );
  const [importResult, setImportResult] = useState<any>(null);

  // Search filter
  const [rosterSearch, setRosterSearch] = useState('');

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
    if (!confirm('Are you sure you want to remove this absence record?')) return;
    await deleteAbsence(id);
    loadData();
  };

  const handleImportDoc = async () => {
    if (!docText.trim()) return;
    const res = await importGoogleDocAbsences(docText, true);
    setImportResult(res);
    loadData();
  };

  const handleCheckOutStudent = async (id: string) => {
    await checkOutStudent(id);
    loadData();
  };

  const handleCheckOutAll = async () => {
    if (!confirm('Check out all active students currently in Upper Cafe?')) return;
    await checkOutAll();
    loadData();
  };

  const togglePeriod = (p: number) => {
    setNewPeriods((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const filteredCheckins = checkins.filter((c) => {
    const q = rosterSearch.toLowerCase();
    return (
      c.studentName.toLowerCase().includes(q) ||
      c.studentEmail.toLowerCase().includes(q) ||
      c.academy.toLowerCase().includes(q) ||
      c.period.toString().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10 w-full flex-1">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-[#C5B358]" />
            <span className="text-xs font-black uppercase tracking-wider text-[#C5B358]">
              Staff & Study Hall Monitor Desk
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#F0F6FC] tracking-tight">
            Upper Cafe Administration
          </h1>
          <p className="text-sm text-[#8B949E] mt-1">
            Manage teacher absences, Google Doc imports, and student occupancy in real-time.
          </p>
        </div>

        <button
          onClick={loadData}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#151B23] border border-[#2C3442] text-[#8B949E] hover:text-[#F0F6FC] hover:border-[#C5B358] transition-all"
        >
          <RefreshCw className={clsx('w-3.5 h-3.5', loading && 'animate-spin')} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Realtime Stats Bento */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <div className="p-4 rounded-2xl bg-[#151B23] border border-[#2C3442] border-b-[4px] border-b-[#1C232E]">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#8B949E]">
              Current Occupancy
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-[#C5B358]">
                {stats.activeStudentsCount}
              </span>
              <span className="text-xs text-[#8B949E]">/ {stats.maxCapacity} students</span>
            </div>
            <div className="w-full bg-[#1F2631] h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-[#C5B358] rounded-full"
                style={{ width: `${stats.capacityPercentage}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#151B23] border border-[#2C3442] border-b-[4px] border-b-[#1C232E]">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#8B949E]">
              Active Period
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-[#F0F6FC]">
                Period {stats.currentPeriod}
              </span>
            </div>
            <span className="text-[11px] text-[#8B949E] mt-1 block">Upper Cafe open</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#151B23] border border-[#2C3442] border-b-[4px] border-b-[#1C232E]">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#8B949E]">
              Today's Absences
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-amber-400">
                {stats.todayAbsencesCount}
              </span>
              <span className="text-xs text-[#8B949E]">teachers</span>
            </div>
            <span className="text-[11px] text-[#8B949E] mt-1 block">Scheduled for study hall</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#151B23] border border-[#2C3442] border-b-[4px] border-b-[#1C232E]">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#8B949E]">
              Absence vs Scheduled
            </span>
            <div className="flex items-baseline gap-2 mt-1 text-sm font-black">
              <span className="text-[#C5B358]">{stats.teacherAbsentCount} Absent</span>
              <span className="text-[#8B949E]">•</span>
              <span className="text-emerald-400">{stats.defaultStudyHallCount} Sched</span>
            </div>
            <span className="text-[11px] text-[#8B949E] mt-1 block">Dual check-in breakdown</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#2C3442] pb-3 mb-6">
        <button
          onClick={() => setActiveTab('ROSTER')}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-extrabold transition-all border',
            activeTab === 'ROSTER'
              ? 'bg-[#1F2631] text-[#C5B358] border-[#C5B358]/40 shadow-sm'
              : 'text-[#8B949E] border-transparent hover:text-[#F0F6FC] hover:bg-[#151B23]'
          )}
        >
          <Users className="w-4 h-4" />
          <span>Live Cafe Roster ({checkins.filter((c) => c.status === 'ACTIVE').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ABSENCES')}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-extrabold transition-all border',
            activeTab === 'ABSENCES'
              ? 'bg-[#1F2631] text-[#C5B358] border-[#C5B358]/40 shadow-sm'
              : 'text-[#8B949E] border-transparent hover:text-[#F0F6FC] hover:bg-[#151B23]'
          )}
        >
          <Plus className="w-4 h-4" />
          <span>Manage Absences ({absences.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('IMPORT')}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-extrabold transition-all border',
            activeTab === 'IMPORT'
              ? 'bg-[#1F2631] text-[#C5B358] border-[#C5B358]/40 shadow-sm'
              : 'text-[#8B949E] border-transparent hover:text-[#F0F6FC] hover:bg-[#151B23]'
          )}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Google Doc Importer</span>
        </button>
      </div>

      {/* TAB 1: Live Student Check-in Roster */}
      {activeTab === 'ROSTER' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B949E]" />
              <input
                type="text"
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
                placeholder="Search checked-in students..."
                className="w-full bg-[#151B23] border border-[#2C3442] focus:border-[#C5B358] rounded-xl pl-9 pr-4 py-2 text-xs text-[#F0F6FC] outline-none"
              />
            </div>

            <DuolingoButton
              variant="danger"
              size="sm"
              onClick={handleCheckOutAll}
              className="flex items-center gap-1.5 self-end sm:self-auto"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Check Out All Students</span>
            </DuolingoButton>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#2C3442] bg-[#151B23]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B0E14] text-[#8B949E] uppercase font-black tracking-wider border-b border-[#2C3442]">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Academy / Grade</th>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4">Reason / Teacher</th>
                  <th className="py-3 px-4">Table</th>
                  <th className="py-3 px-4">Status / Time</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2C3442]">
                {filteredCheckins.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#8B949E]">
                      No students currently checked in.
                    </td>
                  </tr>
                ) : (
                  filteredCheckins.map((c) => (
                    <tr key={c.id} className="hover:bg-[#1A222D] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#F0F6FC]">
                        <div>{c.studentName}</div>
                        <div className="text-[10px] text-[#8B949E] font-normal font-mono">
                          {c.studentEmail}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#8B949E]">
                        <span className="text-[#C5B358]">{c.academy}</span> • Gr {c.grade}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full font-black text-[11px] bg-[#1F2631] text-[#E5D68A] border border-[#C5B358]/30">
                          P{c.period}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium">
                        {c.scenario === 'DEFAULT_STUDY_HALL' ? (
                          <span className="text-emerald-400 font-semibold">Scheduled Study</span>
                        ) : (
                          <span className="text-amber-300 font-semibold">
                            Absence: {c.absentTeacherName || 'Class'}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#8B949E]">
                        {c.tableNumber || 'Cafe'}
                      </td>
                      <td className="py-3.5 px-4">
                        {c.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Active (
                            {new Date(c.checkInTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                            )
                          </span>
                        ) : (
                          <span className="text-[#8B949E]">
                            Checked out ({new Date(c.checkOutTime || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {c.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleCheckOutStudent(c.id)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-950/60 border border-red-800 text-red-300 hover:bg-red-900 transition-colors"
                          >
                            Check Out
                          </button>
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

      {/* TAB 2: Manual Absence Management */}
      {activeTab === 'ABSENCES' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-1 p-5 rounded-2xl bg-[#151B23] border border-[#2C3442] border-b-[4px] border-b-[#1C232E]">
            <h2 className="text-base font-black text-[#F0F6FC] mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#C5B358]" />
              <span>Add Absent Teacher</span>
            </h2>

            <form onSubmit={handleAddAbsence} className="space-y-4 text-xs">
              <div>
                <label className="block font-black uppercase text-[#8B949E] mb-1">
                  Teacher Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTeacher}
                  onChange={(e) => setNewTeacher(e.target.value)}
                  placeholder="e.g. Dr. Robert DeFalco"
                  className="w-full bg-[#0B0E14] border border-[#2C3442] rounded-xl px-3 py-2 text-xs text-[#F0F6FC] outline-none focus:border-[#C5B358]"
                />
              </div>

              <div>
                <label className="block font-black uppercase text-[#8B949E] mb-1">
                  Department
                </label>
                <select
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-[#2C3442] rounded-xl px-3 py-2 text-xs text-[#F0F6FC] outline-none focus:border-[#C5B358]"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science & Physics">Science & Physics</option>
                  <option value="Humanities & History">Humanities & History</option>
                  <option value="Computer Science & ATCS">Computer Science & ATCS</option>
                  <option value="Engineering & Technology">Engineering & Technology</option>
                  <option value="World Languages">World Languages</option>
                  <option value="Visual & Performing Arts">Visual & Performing Arts</option>
                </select>
              </div>

              <div>
                <label className="block font-black uppercase text-[#8B949E] mb-1">
                  Periods Absent (Select all that apply)
                </label>
                <div className="grid grid-cols-5 gap-1.5 pt-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((p) => {
                    const sel = newPeriods.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePeriod(p)}
                        className={clsx(
                          'py-1.5 rounded-lg font-black text-xs border transition-all',
                          sel
                            ? 'bg-[#C5B358] text-[#0B0E14] border-[#7A6B25]'
                            : 'bg-[#0B0E14] text-[#8B949E] border-[#2C3442]'
                        )}
                      >
                        P{p}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-black uppercase text-[#8B949E] mb-1">
                  Room
                </label>
                <input
                  type="text"
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                  placeholder="e.g. Room 234"
                  className="w-full bg-[#0B0E14] border border-[#2C3442] rounded-xl px-3 py-2 text-xs text-[#F0F6FC] outline-none focus:border-[#C5B358]"
                />
              </div>

              <div>
                <label className="block font-black uppercase text-[#8B949E] mb-1">
                  Instructions / Notes
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Report to Upper Cafe. Schoology assignment posted."
                  className="w-full bg-[#0B0E14] border border-[#2C3442] rounded-xl px-3 py-2 text-xs text-[#F0F6FC] outline-none focus:border-[#C5B358]"
                />
              </div>

              <DuolingoButton variant="primary" size="md" fullWidth type="submit">
                Add To Absence Board
              </DuolingoButton>
            </form>
          </div>

          {/* List */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-base font-black text-[#F0F6FC] flex items-center justify-between">
              <span>Active Teacher Absences Today</span>
              <span className="text-xs font-normal text-[#8B949E]">{absences.length} listed</span>
            </h2>

            <div className="space-y-2.5">
              {absences.map((a) => (
                <div
                  key={a.id}
                  className="p-4 rounded-xl bg-[#151B23] border border-[#2C3442] flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm text-[#F0F6FC]">{a.teacherName}</h3>
                      <span className="text-xs text-[#C5B358]">({a.department})</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-bold text-[#E5D68A]">
                        Periods: {a.periods.map((p) => `P${p}`).join(', ')}
                      </span>
                      {a.room && (
                        <span className="text-[11px] text-[#8B949E]">• {a.room}</span>
                      )}
                    </div>
                    {a.notes && (
                      <p className="text-xs text-[#8B949E] mt-1.5">{a.notes}</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteAbsence(a.id)}
                    className="p-2 text-[#8B949E] hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Google Doc Bulk Importer */}
      {activeTab === 'IMPORT' && (
        <div className="p-6 rounded-2xl bg-[#151B23] border border-[#2C3442] border-b-[4px] border-b-[#1C232E] space-y-5">
          <div>
            <h2 className="text-lg font-black text-[#F0F6FC] flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#C5B358]" />
              <span>Google Doc Quick Importer</span>
            </h2>
            <p className="text-xs text-[#8B949E] mt-1 leading-relaxed">
              Eliminate manual data entry! Copy the daily absences straight from the BCA Google Doc
              or Google Sheets table and paste it below. The system will automatically detect teacher names,
              periods (e.g. "P2, P4", "Periods 3-5"), rooms, and notes.
            </p>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-[#8B949E] mb-2">
              Paste Raw Text from Google Doc / Email:
            </label>
            <textarea
              rows={8}
              value={docText}
              onChange={(e) => setDocText(e.target.value)}
              placeholder="Paste rows here..."
              className="w-full bg-[#0B0E14] border-2 border-[#2C3442] rounded-xl p-3 text-xs text-[#F0F6FC] font-mono outline-none focus:border-[#C5B358]"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8B949E]">
              Supports dashes, colons, tabs, period ranges, and room numbers.
            </span>
            <DuolingoButton
              variant="primary"
              size="md"
              onClick={handleImportDoc}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Parse & Import to Upper Cafe</span>
            </DuolingoButton>
          </div>

          {importResult && (
            <div className="mt-4 p-4 rounded-xl bg-[#0B0E14] border border-[#C5B358]/40 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <CheckCircle className="w-4 h-4" />
                <span>
                  Successfully parsed & imported {importResult.parsedCount} absent teachers!
                </span>
              </div>
              <div className="text-xs space-y-1 font-mono text-[#8B949E]">
                {importResult.entries?.map((e: any, idx: number) => (
                  <div key={idx}>
                    ✓ <strong className="text-[#F0F6FC]">{e.teacherName}</strong> — Periods:{' '}
                    <span className="text-[#C5B358]">{e.periods?.join(', ')}</span> ({e.department})
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
