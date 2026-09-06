'use client';

import React, { useState, useEffect } from 'react';
import { CheckInRecord, CheckInScenario, TeacherAbsence, Academy } from '@/types';
import {
  fetchAbsences,
  createCheckIn,
  checkOutStudent,
  fetchCheckins,
} from '@/lib/api';
import { clsx } from 'clsx';

const ACADEMIES: Academy[] = [
  'AAST',
  'AEDT',
  'AMST',
  'ABF',
  'ATCS',
  'ACAHA',
  'AVPA-M',
  'AVPA-T',
  'AVPA-V',
];

export default function StudentCheckInPage() {
  const [scenario, setScenario] = useState<CheckInScenario>('DEFAULT_STUDY_HALL');
  const [selectedPeriod, setSelectedPeriod] = useState<number>(4);
  const [absentTeachers, setAbsentTeachers] = useState<TeacherAbsence[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [teacherSearch, setTeacherSearch] = useState('');

  // Form info
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [academy, setAcademy] = useState<Academy>('ATCS');
  const [grade, setGrade] = useState<'9' | '10' | '11' | '12'>('11');

  // Active pass state
  const [activePass, setActivePass] = useState<CheckInRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  // Load active pass from localStorage if exists
  useEffect(() => {
    const savedPassId = localStorage.getItem('bca_upper_cafe_active_pass_id');
    if (savedPassId) {
      fetchCheckins('ACTIVE').then((activeList) => {
        const found = activeList.find((p) => p.id === savedPassId);
        if (found) {
          setActivePass(found);
        } else {
          localStorage.removeItem('bca_upper_cafe_active_pass_id');
        }
      });
    }
  }, []);

  // Fetch absences
  useEffect(() => {
    fetchAbsences().then((list) => {
      setAbsentTeachers(list);
      if (list.length > 0 && !selectedTeacherId) {
        const match = list.find((t) => t.periods.includes(selectedPeriod)) || list[0];
        if (match) setSelectedTeacherId(match.id);
      }
    });
  }, [selectedPeriod]);

  // Elapsed timer for active pass
  useEffect(() => {
    if (!activePass) return;
    const start = new Date(activePass.checkInTime).getTime();

    const update = () => {
      const now = Date.now();
      const mins = Math.floor((now - start) / 60000);
      setElapsedMinutes(mins);
    };

    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [activePass]);

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }

    const teacher = absentTeachers.find((t) => t.id === selectedTeacherId);
    if (scenario === 'TEACHER_ABSENT' && !teacher) {
      setErrorMsg('Please select an absent teacher');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const pass = await createCheckIn({
        studentName: studentName.trim(),
        studentEmail: studentEmail.trim() || undefined,
        studentId: studentId.trim() || undefined,
        academy,
        grade,
        period: selectedPeriod,
        scenario,
        absentTeacherId: scenario === 'TEACHER_ABSENT' ? teacher?.id : undefined,
        absentTeacherName: scenario === 'TEACHER_ABSENT' ? teacher?.teacherName : undefined,
      });

      setActivePass(pass);
      localStorage.setItem('bca_upper_cafe_active_pass_id', pass.id);
    } catch (_err) {
      setErrorMsg('Failed to check in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    if (!activePass) return;
    setSubmitting(true);
    try {
      await checkOutStudent(activePass.id);
      setActivePass(null);
      localStorage.removeItem('bca_upper_cafe_active_pass_id');
      setStudentName('');
      setStudentEmail('');
      setStudentId('');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTeachers = absentTeachers.filter((t) => {
    const matchesPeriod = t.periods.includes(selectedPeriod);
    const matchesQuery =
      t.teacherName.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      t.department.toLowerCase().includes(teacherSearch.toLowerCase());
    return matchesPeriod && matchesQuery;
  });

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12 w-full">
      {activePass ? (
        // Clean Active Pass View
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                Currently Checked In
              </span>
            </div>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
              Period {activePass.period}
            </span>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {activePass.studentName}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {activePass.academy} • Grade {activePass.grade} {activePass.studentId ? `• ID #${activePass.studentId}` : ''}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2 text-sm mb-6">
            <div className="flex justify-between">
              <span className="text-slate-500">Reason:</span>
              <span className="font-semibold text-slate-800">
                {activePass.scenario === 'DEFAULT_STUDY_HALL'
                  ? 'Scheduled Study Hall'
                  : `Absence: ${activePass.absentTeacherName || 'Class'}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Checked in at:</span>
              <span className="font-semibold text-slate-800">
                {new Date(activePass.checkInTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Duration:</span>
              <span className="font-semibold text-slate-800">{elapsedMinutes} minutes</span>
            </div>
          </div>

          <button
            type="button"
            disabled={submitting}
            onClick={handleCheckOut}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors cursor-pointer"
          >
            {submitting ? 'Checking Out...' : 'Check Out of Upper Cafe'}
          </button>
        </div>
      ) : (
        // Clean Light Check-In Form
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Upper Cafe Study Hall Check-In
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Check in for your scheduled study hall or absent teacher coverage.
            </p>
          </div>

          <form onSubmit={handleCheckInSubmit} className="space-y-5">
            {/* Reason Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                1. Select Reason
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setScenario('DEFAULT_STUDY_HALL')}
                  className={clsx(
                    'p-3 rounded-lg border text-left transition-colors cursor-pointer',
                    scenario === 'DEFAULT_STUDY_HALL'
                      ? 'border-amber-500 bg-amber-50/50 text-slate-900'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  )}
                >
                  <div className="font-semibold text-sm">Scheduled Study Hall</div>
                  <div className="text-xs text-slate-500 mt-0.5">Assigned on Genesis schedule</div>
                </button>

                <button
                  type="button"
                  onClick={() => setScenario('TEACHER_ABSENT')}
                  className={clsx(
                    'p-3 rounded-lg border text-left transition-colors cursor-pointer',
                    scenario === 'TEACHER_ABSENT'
                      ? 'border-amber-500 bg-amber-50/50 text-slate-900'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  )}
                >
                  <div className="font-semibold text-sm">Teacher is Absent</div>
                  <div className="text-xs text-slate-500 mt-0.5">Class covered in Upper Cafe</div>
                </button>
              </div>
            </div>

            {/* Period Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                2. Period
              </label>
              <div className="grid grid-cols-9 gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSelectedPeriod(p)}
                    className={clsx(
                      'py-2 rounded-md font-bold text-xs transition-colors cursor-pointer border',
                      selectedPeriod === p
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    )}
                  >
                    P{p}
                  </button>
                ))}
              </div>
            </div>

            {/* If Teacher Absent, select teacher */}
            {scenario === 'TEACHER_ABSENT' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  3. Select Absent Teacher (Period {selectedPeriod})
                </label>
                {filteredTeachers.length > 0 ? (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-1.5">
                    {filteredTeachers.map((t) => {
                      const isSel = selectedTeacherId === t.id;
                      return (
                        <div
                          key={t.id}
                          onClick={() => setSelectedTeacherId(t.id)}
                          className={clsx(
                            'p-2.5 rounded-md text-xs cursor-pointer flex justify-between items-center transition-colors',
                            isSel
                              ? 'bg-amber-100 text-slate-900 font-semibold'
                              : 'hover:bg-slate-50 text-slate-700'
                          )}
                        >
                          <div>
                            <div>{t.teacherName}</div>
                            <div className="text-[11px] text-slate-500">{t.department}</div>
                          </div>
                          <span className="text-[10px] text-slate-500">Periods {t.periods.join(', ')}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500">
                    No teacher absences listed specifically for Period {selectedPeriod}.
                  </div>
                )}
              </div>
            )}

            {/* Student Details */}
            <div className="space-y-3 pt-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                {scenario === 'TEACHER_ABSENT' ? '4.' : '3.'} Student Details
              </label>

              <div>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Full Name *"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <input
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="BCA Email (@bergen.org)"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400"
                />
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Student ID #"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <select
                  value={academy}
                  onChange={(e) => setAcademy(e.target.value as Academy)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400"
                >
                  {ACADEMIES.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>

                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400"
                >
                  <option value="9">Grade 9</option>
                  <option value="10">Grade 10</option>
                  <option value="11">Grade 11</option>
                  <option value="12">Grade 12</option>
                </select>
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors cursor-pointer"
            >
              {submitting ? 'Checking In...' : 'Confirm Check-In'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
