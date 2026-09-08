'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { localStore } from '@/lib/supabase';
import { CheckInRecord, TeacherAbsence, TeacherPronoun } from '@/types';
import { fetchActiveCafeCode } from '@/lib/schedule';

const PERIOD_LIST = ['1', 'IGS', '2', '3', '4', '5', '6', '7', '8', '9'];

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'roster' | 'absences' | 'logs'>('roster');

  const [activeCode, setActiveCode] = useState<{ code: string | null; period: string | null; isValid: boolean }>({
    code: null,
    period: null,
    isValid: false
  });

  const [checkIns, setCheckIns] = useState<CheckInRecord[]>([]);
  const [absences, setAbsences] = useState<TeacherAbsence[]>([]);
  const [searchLogs, setSearchLogs] = useState('');

  // Absence Form State
  const [pronoun, setPronoun] = useState<TeacherPronoun>('Dr.');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isAllDay, setIsAllDay] = useState(true);
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>(PERIOD_LIST);
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    const update = () => {
      setCheckIns(localStore.getCheckIns());
      setAbsences(localStore.getAbsences());
    };
    update();
    const unsub = localStore.subscribe(update);

    async function loadCode() {
      const info = await fetchActiveCafeCode();
      setActiveCode(info);
    }
    loadCode();

    return () => unsub();
  }, []);

  const handlePeriodCheckbox = (p: string, checked: boolean) => {
    if (checked) {
      setSelectedPeriods([...selectedPeriods, p]);
    } else {
      setSelectedPeriods(selectedPeriods.filter((item) => item !== p));
    }
  };

  const handleAllDayToggle = (checked: boolean) => {
    setIsAllDay(checked);
    if (checked) {
      setSelectedPeriods(PERIOD_LIST);
    }
  };

  const handleAddAbsence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lastName.trim() || !firstName.trim()) return;

    localStore.addAbsence({
      pronoun,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      department: '',
      date: new Date().toISOString().split('T')[0],
      periods: isAllDay ? PERIOD_LIST : selectedPeriods,
      isAllDay
    });

    setFirstName('');
    setLastName('');
    setIsAllDay(true);
    setSelectedPeriods(PERIOD_LIST);
    setFormSuccess('Teacher absence logged.');
    setTimeout(() => setFormSuccess(''), 2500);
  };

  const handleDeleteAbsence = (id: string) => {
    localStore.deleteAbsence(id);
  };

  const handleCheckOut = (recordId: string) => {
    localStore.checkOut(recordId);
  };

  const activeStudents = checkIns.filter((c) => c.status === 'ACTIVE');
  const pastLogs = checkIns.filter((c) => {
    const q = searchLogs.toLowerCase();
    return (
      c.studentName.toLowerCase().includes(q) ||
      c.period.toLowerCase().includes(q) ||
      (c.teacherName || '').toLowerCase().includes(q)
    );
  });

  return (
    <main className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-12 space-y-8">
      <header className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111]">
          Upper Cafe Admin Desk
        </h1>
        <p className="text-sm sm:text-base text-[#666666]">
          Logged in as {user?.name || 'Staff'}. Manage check-in rosters and teacher absences.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-[#eaeaea] text-sm">
        <button
          onClick={() => setActiveTab('roster')}
          className={`pb-3 font-medium transition-colors select-none ${
            activeTab === 'roster'
              ? 'border-b-2 border-[#111111] text-[#111111] font-semibold'
              : 'text-[#666666] hover:text-[#111111]'
          }`}
        >
          Active Roster ({activeStudents.length})
        </button>
        <button
          onClick={() => setActiveTab('absences')}
          className={`pb-3 font-medium transition-colors select-none ${
            activeTab === 'absences'
              ? 'border-b-2 border-[#111111] text-[#111111] font-semibold'
              : 'text-[#666666] hover:text-[#111111]'
          }`}
        >
          Teacher Absences ({absences.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 font-medium transition-colors select-none ${
            activeTab === 'logs'
              ? 'border-b-2 border-[#111111] text-[#111111] font-semibold'
              : 'text-[#666666] hover:text-[#111111]'
          }`}
        >
          Attendance Logs ({checkIns.length})
        </button>
      </div>

      {/* TAB 1: ACTIVE ROSTER & CAFE CODE */}
      {activeTab === 'roster' && (
        <div className="space-y-6">
          {/* Cafe Code Banner */}
          <section className="p-4 rounded-lg border border-[#eaeaea] bg-[#fafafa] flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider font-semibold text-[#666666]">
                Active Cafe Code
              </div>
              <div className="text-xs text-[#666666] mt-0.5">
                {activeCode.period ? `Period ${activeCode.period}` : 'No school period in session'}
              </div>
            </div>
            <div className="font-mono text-xl font-bold tracking-widest text-[#111111]">
              {activeCode.code || '------'}
            </div>
          </section>

          {/* Currently Checked In List */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wider font-semibold text-[#666666]">
                Students Currently in Upper Cafe
              </div>
              <span className="text-xs text-[#888888]">Live Sync</span>
            </div>

            {activeStudents.length === 0 ? (
              <div className="p-8 text-center border border-[#eaeaea] rounded-lg text-sm text-[#666666]">
                No students are currently checked into Upper Cafe.
              </div>
            ) : (
              <div className="divide-y divide-[#eaeaea] border-y border-[#eaeaea]">
                {activeStudents.map((rec) => {
                  const inTime = new Date(rec.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={rec.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                      <div>
                        <span className="font-semibold text-[#111111]">{rec.studentName}</span>
                        <span className="text-[#666666] ml-2">Period {rec.period}</span>
                        <span className="text-[#888888] ml-2">
                          ({rec.reason === 'TEACHER_ABSENT' ? rec.teacherName : 'Study Hall'} &middot; in at {inTime})
                        </span>
                      </div>
                      <button
                        onClick={() => handleCheckOut(rec.id)}
                        className="text-xs text-[#b91c1c] underline underline-offset-2 hover:text-[#7f1d1d] cursor-pointer"
                      >
                        Check Out
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB 2: TEACHER ABSENCES */}
      {activeTab === 'absences' && (
        <div className="space-y-8">
          {/* Add Teacher Absence Form */}
          <section className="space-y-4">
            <div className="text-xs uppercase tracking-wider font-semibold text-[#666666]">
              Add Teacher Absence
            </div>

            <form onSubmit={handleAddAbsence} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-[#666666] mb-1">Pronoun</label>
                  <select
                    value={pronoun}
                    onChange={(e) => setPronoun(e.target.value as TeacherPronoun)}
                    className="w-full h-9 px-3 rounded-lg border border-[#eaeaea] bg-white text-sm"
                  >
                    <option value="Dr.">Dr.</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Mrs.">Mrs.</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-[#666666] mb-1">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    required
                    className="w-full h-9 px-3 rounded-lg border border-[#eaeaea] bg-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#666666] mb-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    required
                    className="w-full h-9 px-3 rounded-lg border border-[#eaeaea] bg-white text-sm"
                  />
                </div>
              </div>

              {/* Checkbox Period Selection */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="allDayCheck"
                    checked={isAllDay}
                    onChange={(e) => handleAllDayToggle(e.target.checked)}
                    className="w-4 h-4 rounded border-[#eaeaea]"
                  />
                  <label htmlFor="allDayCheck" className="text-sm font-medium text-[#111111] cursor-pointer">
                    All Day (Periods 1–9 &amp; IGS)
                  </label>
                </div>

                {!isAllDay && (
                  <div className="pt-2">
                    <div className="text-xs text-[#666666] mb-2">Select periods:</div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      {PERIOD_LIST.map((p) => {
                        const isChecked = selectedPeriods.includes(p);
                        return (
                          <label
                            key={p}
                            className="flex items-center gap-2 text-sm text-[#111111] cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => handlePeriodCheckbox(p, e.target.checked)}
                              className="w-4 h-4 rounded border-[#eaeaea]"
                            />
                            <span>{p === 'IGS' ? 'IGS' : `Period ${p}`}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {formSuccess && (
                <p className="text-xs text-[#059669]">{formSuccess}</p>
              )}

              <div>
                <button
                  type="submit"
                  className="btn-minimal-primary py-2 px-5 text-sm"
                >
                  Save Absence
                </button>
              </div>
            </form>
          </section>

          <hr className="border-none border-t border-[#eaeaea]" />

          {/* Current Logged Absences */}
          <section className="space-y-3">
            <div className="text-xs uppercase tracking-wider font-semibold text-[#666666]">
              Logged Teacher Absences ({absences.length})
            </div>

            {absences.length === 0 ? (
              <p className="text-sm text-[#666666]">No absences logged for today.</p>
            ) : (
              <div className="divide-y divide-[#eaeaea] border-y border-[#eaeaea]">
                {absences.map((t) => (
                  <div key={t.id} className="py-3 flex items-center justify-between text-sm">
                    <div>
                      <span className="font-semibold text-[#111111]">{t.pronoun} {t.firstName} {t.lastName}</span>
                      <span className="text-[#666666] ml-3 text-xs">
                        {t.isAllDay ? 'All Day' : `Periods: ${t.periods.join(', ')}`}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteAbsence(t.id)}
                      className="text-xs text-[#999999] hover:text-[#b91c1c] underline underline-offset-2 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB 3: ATTENDANCE LOGS */}
      {activeTab === 'logs' && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs uppercase tracking-wider font-semibold text-[#666666]">
              Permanent Attendance Logs ({checkIns.length})
            </div>
            <input
              type="text"
              value={searchLogs}
              onChange={(e) => setSearchLogs(e.target.value)}
              placeholder="Search logs..."
              className="px-3 py-1.5 text-sm border border-[#eaeaea] rounded-lg bg-[#f9f9f9] w-full sm:w-64"
            />
          </div>

          <div className="border border-[#eaeaea] rounded-lg overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#fafafa] border-b border-[#eaeaea] text-[#666666] text-[11px]">
                <tr>
                  <th className="p-3">Student</th>
                  <th className="p-3">Period</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Teacher</th>
                  <th className="p-3">In</th>
                  <th className="p-3">Out</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaeaea]">
                {pastLogs.map((log) => {
                  const inTime = new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const outTime = log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
                  return (
                    <tr key={log.id} className="hover:bg-[#fafafa]">
                      <td className="p-3 font-medium text-[#111111]">{log.studentName}</td>
                      <td className="p-3">P{log.period}</td>
                      <td className="p-3 text-[#666666]">{log.reason === 'TEACHER_ABSENT' ? 'Teacher Absent' : 'Study Hall'}</td>
                      <td className="p-3 text-[#666666]">{log.teacherName || '—'}</td>
                      <td className="p-3 font-mono text-[#666666]">{inTime}</td>
                      <td className="p-3 font-mono text-[#666666]">{outTime}</td>
                      <td className="p-3">
                        {log.status === 'ACTIVE' ? (
                          <span className="font-semibold text-[#059669]">Active</span>
                        ) : (
                          <span className="text-[#888888]">Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
