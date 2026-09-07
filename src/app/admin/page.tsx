'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { localStore } from '@/lib/supabase';
import { CheckInRecord, TeacherAbsence, TeacherPronoun } from '@/types';
import { fetchActiveCafeCode } from '@/lib/schedule';
import {
  Users,
  Clock,
  UserCheck,
  PlusCircle,
  Trash2,
  KeyRound,
  Shield,
  Search,
  CheckCircle2
} from 'lucide-react';

const PERIOD_LIST = ['1', 'IGS', '2', '3', '4', '5', '6', '7', '8', '9'];

export default function AdminDashboardPage() {
  const { user } = useAuth();

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
  const [department, setDepartment] = useState('');
  const [isAllDay, setIsAllDay] = useState(true);
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>(['1', 'IGS', '2', '3', '4', '5', '6', '7', '8', '9']);
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    const updateData = () => {
      setCheckIns(localStore.getCheckIns());
      setAbsences(localStore.getAbsences());
    };

    updateData();
    const unsub = localStore.subscribe(updateData);

    async function loadCode() {
      const codeInfo = await fetchActiveCafeCode();
      setActiveCode(codeInfo);
    }
    loadCode();
    const interval = setInterval(loadCode, 30000);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  const handlePeriodToggle = (p: string) => {
    if (selectedPeriods.includes(p)) {
      setSelectedPeriods(selectedPeriods.filter((item) => item !== p));
    } else {
      setSelectedPeriods([...selectedPeriods, p]);
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
      department: department.trim() || 'General Faculty',
      date: new Date().toISOString().split('T')[0],
      periods: isAllDay ? PERIOD_LIST : selectedPeriods,
      isAllDay
    });

    setFirstName('');
    setLastName('');
    setDepartment('');
    setIsAllDay(true);
    setSelectedPeriods(PERIOD_LIST);
    setFormSuccess('Teacher absence logged successfully.');
    setTimeout(() => setFormSuccess(''), 3000);
  };

  const handleDeleteAbsence = (id: string) => {
    localStore.deleteAbsence(id);
  };

  const handleManualCheckOut = (recordId: string) => {
    localStore.checkOut(recordId);
  };

  const activeStudents = checkIns.filter((c) => c.status === 'ACTIVE');
  const pastLogs = checkIns.filter((c) => {
    const query = searchLogs.toLowerCase();
    return (
      c.studentName.toLowerCase().includes(query) ||
      c.period.toLowerCase().includes(query) ||
      (c.teacherName || '').toLowerCase().includes(query)
    );
  });

  return (
    <main className="max-w-[800px] mx-auto px-6 py-10 space-y-10">
      {/* Top Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-[#111111]">
            Upper Cafe Attendance Desk
          </h1>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#F4F2FF] text-[#6355D8] border border-[#DDD6FE]">
            Admin
          </span>
        </div>
        <p className="text-xs text-[#666666]">
          Logged in as {user?.name || 'Staff'}. Monitor live Upper Cafe rosters, manage teacher absences, and review logs.
        </p>
      </div>

      {/* 1. Cafe Code Banner */}
      <section className="p-6 rounded-2xl border-2 border-[#6355D8] bg-[#F5F3FF] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[#6355D8]" />
            <h2 className="text-sm font-bold text-[#2E1065] uppercase tracking-wider">
              Active Cafe Code
            </h2>
          </div>
          <p className="text-xs text-[#5B21B6]">
            {activeCode.period ? `Valid for Period ${activeCode.period} Upper Cafe check-in` : 'No active school period right now'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-12 px-5 rounded-xl bg-white border-2 border-[#6355D8] flex items-center justify-center font-mono text-2xl font-black tracking-widest text-[#6355D8] shadow-xs">
            {activeCode.code || '------'}
          </div>
        </div>
      </section>

      {/* 2. Currently Checked-in Students (Live) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#111111]" />
            <h2 className="text-base font-bold text-[#111111]">
              Currently Checked In ({activeStudents.length})
            </h2>
          </div>
          <span className="text-xs text-[#666666]">Updates dynamically</span>
        </div>

        {activeStudents.length === 0 ? (
          <div className="p-6 rounded-2xl border border-[#eaeaea] bg-white text-center text-xs text-[#666666]">
            No students are currently checked into Upper Cafe.
          </div>
        ) : (
          <div className="space-y-2.5">
            {activeStudents.map((rec) => {
              const timeFormatted = new Date(rec.checkInTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              });
              return (
                <div
                  key={rec.id}
                  className="p-4 rounded-2xl border border-[#eaeaea] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#111111]">{rec.studentName}</span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                        P{rec.period}
                      </span>
                    </div>
                    <div className="text-xs text-[#666666] mt-1 flex items-center gap-2">
                      <span>
                        {rec.reason === 'TEACHER_ABSENT'
                          ? `Absent: ${rec.teacherName}`
                          : 'Study Hall'}
                      </span>
                      <span>&middot;</span>
                      <span>In at {timeFormatted}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleManualCheckOut(rec.id)}
                    className="btn-duo-secondary py-1.5 px-3 text-xs text-[#DC2626] border-[#FCA5A5] hover:bg-[#FEF2F2] self-start sm:self-auto"
                  >
                    Check Out Student
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. Add or Update Teacher Absences */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-[#111111]" />
          <h2 className="text-base font-bold text-[#111111]">
            Add Teacher Absence
          </h2>
        </div>

        <form
          onSubmit={handleAddAbsence}
          className="p-6 rounded-2xl border border-[#eaeaea] bg-white space-y-4 shadow-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#666666] mb-1">Pronoun</label>
              <select
                value={pronoun}
                onChange={(e) => setPronoun(e.target.value as TeacherPronoun)}
                className="w-full h-10 px-3 rounded-xl border border-[#E5E7EB] bg-white text-xs font-medium focus:outline-none focus:border-[#6355D8]"
              >
                <option value="Dr.">Dr.</option>
                <option value="Mr.">Mr.</option>
                <option value="Ms.">Ms.</option>
                <option value="Mrs.">Mrs.</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#666666] mb-1">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Robert"
                required
                className="w-full h-10 px-3 rounded-xl border border-[#E5E7EB] bg-white text-xs focus:outline-none focus:border-[#6355D8]"
              >
              </input>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#666666] mb-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Degan"
                required
                className="w-full h-10 px-3 rounded-xl border border-[#E5E7EB] bg-white text-xs focus:outline-none focus:border-[#6355D8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#666666] mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Mathematics"
                className="w-full h-10 px-3 rounded-xl border border-[#E5E7EB] bg-white text-xs focus:outline-none focus:border-[#6355D8]"
              />
            </div>
          </div>

          {/* Periods Selection */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#666666]">Periods Absent</label>
              <label className="inline-flex items-center gap-1.5 text-xs text-[#6355D8] font-bold cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAllDay}
                  onChange={(e) => handleAllDayToggle(e.target.checked)}
                  className="rounded text-[#6355D8] focus:ring-0"
                />
                <span>All Day (Periods 1&ndash;9 &amp; IGS)</span>
              </label>
            </div>

            {!isAllDay && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {PERIOD_LIST.map((p) => {
                  const active = selectedPeriods.includes(p);
                  return (
                    <button
                      type="button"
                      key={p}
                      onClick={() => handlePeriodToggle(p)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                        active
                          ? 'bg-[#6355D8] text-white border-[#4A36B8]'
                          : 'bg-white text-[#4B5563] border-[#E5E7EB]'
                      }`}
                    >
                      {p === 'IGS' ? 'IGS' : `P${p}`}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {formSuccess && (
            <div className="text-xs font-semibold text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0] p-2.5 rounded-xl flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>{formSuccess}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn-duo-purple py-2.5 px-5 text-xs font-bold"
          >
            Save Teacher Absence
          </button>
        </form>

        {/* Existing Absences List */}
        <div className="space-y-2">
          {absences.map((t) => (
            <div
              key={t.id}
              className="p-3.5 rounded-xl border border-[#eaeaea] bg-white flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-[#111111]">
                  {t.pronoun} {t.firstName} {t.lastName}
                </span>
                <span className="text-[#666666] ml-2">
                  ({t.isAllDay ? 'All Day' : `Periods: ${t.periods.join(', ')}`})
                </span>
              </div>
              <button
                onClick={() => handleDeleteAbsence(t.id)}
                className="text-[#9CA3AF] hover:text-[#DC2626] p-1 transition-colors cursor-pointer"
                title="Remove Absence"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Permanent Attendance Logs */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#111111]" />
            <h2 className="text-base font-bold text-[#111111]">
              Permanent Logs ({checkIns.length})
            </h2>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              value={searchLogs}
              onChange={(e) => setSearchLogs(e.target.value)}
              placeholder="Search logs..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#E5E7EB] text-xs bg-white focus:outline-none focus:border-[#6355D8]"
            />
          </div>
        </div>

        <div className="border border-[#eaeaea] rounded-2xl overflow-hidden bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F9FAFB] border-b border-[#eaeaea] text-[#666666] uppercase font-semibold text-[10px]">
                <tr>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-3 py-3">Period</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Teacher</th>
                  <th className="px-3 py-3">Check In</th>
                  <th className="px-3 py-3">Check Out</th>
                  <th className="px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaeaea]">
                {pastLogs.map((log) => {
                  const inTime = new Date(log.checkInTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  const outTime = log.checkOutTime
                    ? new Date(log.checkOutTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : '—';
                  return (
                    <tr key={log.id} className="hover:bg-[#F9FAFB]">
                      <td className="px-4 py-3 font-semibold text-[#111111]">{log.studentName}</td>
                      <td className="px-3 py-3">P{log.period}</td>
                      <td className="px-4 py-3 text-[#666666]">
                        {log.reason === 'TEACHER_ABSENT' ? 'Teacher Absent' : 'Study Hall'}
                      </td>
                      <td className="px-4 py-3 text-[#666666]">{log.teacherName || '—'}</td>
                      <td className="px-3 py-3 font-mono text-[#666666]">{inTime}</td>
                      <td className="px-3 py-3 font-mono text-[#666666]">{outTime}</td>
                      <td className="px-3 py-3">
                        {log.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#059669]">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F3F4F6] text-[#6B7280]">
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
