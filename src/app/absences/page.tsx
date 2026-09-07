'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Calendar, Clock, UserX, AlertCircle } from 'lucide-react';
import { localStore } from '@/lib/supabase';
import { TeacherAbsence } from '@/types';
import { fetchScheduleStatus } from '@/lib/schedule';

const PERIOD_PILLS = ['All', '1', 'IGS', '2', '3', '4', '5', '6', '7', '8', '9'];

export default function AbsencesPage() {
  const [absences, setAbsences] = useState<TeacherAbsence[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPeriod, setCurrentPeriod] = useState<string | null>(null);

  useEffect(() => {
    const list = localStore.getAbsences();
    setAbsences(list);

    const unsub = localStore.subscribe(() => {
      setAbsences(localStore.getAbsences());
    });

    async function loadCurrentPeriod() {
      const status = await fetchScheduleStatus();
      if (status.status === 'in_session' && status.period) {
        setCurrentPeriod(status.period);
        // Default to current period if in session
        setSelectedFilter(status.period);
      }
    }
    loadCurrentPeriod();

    return () => unsub();
  }, []);

  // Filter teachers:
  // Teachers marked absent all day show under EVERY period!
  const filteredTeachers = absences.filter((t) => {
    // Search query filter
    const fullName = `${t.pronoun} ${t.firstName} ${t.lastName}`.toLowerCase();
    const dept = (t.department || '').toLowerCase();
    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) || dept.includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Period filter
    if (selectedFilter === 'All') return true;
    if (t.isAllDay) return true; // All-day teachers show under every period

    return t.periods.includes(selectedFilter) || t.periods.includes('ALL_DAY');
  });

  return (
    <main className="max-w-[680px] mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#666666] hover:text-[#111111] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#111111]">
              Teacher Attendance
            </h1>
            <p className="text-xs text-[#666666] mt-0.5">
              Live roster of absent teachers and Upper Cafe study hall assignments.
            </p>
          </div>

          {currentPeriod && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
              <span>Current: Period {currentPeriod}</span>
            </div>
          )}
        </div>
      </div>

      {/* Period Filter Pills */}
      <div className="space-y-2">
        <div className="text-[11px] font-semibold text-[#666666] uppercase tracking-wider">
          Filter by Period
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {PERIOD_PILLS.map((p) => {
            const isSelected = selectedFilter === p;
            const isCurrent = currentPeriod === p;
            return (
              <button
                key={p}
                onClick={() => setSelectedFilter(p)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 select-none ${
                  isSelected
                    ? 'btn-duo-purple text-white shadow-xs'
                    : 'bg-white border-2 border-[#E5E7EB] text-[#4B5563] hover:border-[#CBD5E1]'
                }`}
              >
                <span>{p === 'All' ? 'All Day' : p === 'IGS' ? 'IGS' : `P${p}`}</span>
                {isCurrent && p !== 'All' && (
                  <span className="ml-1.5 text-[9px] px-1 py-0.2 rounded bg-emerald-400 text-white font-black">
                    NOW
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by teacher name or department..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-xs text-[#111111] focus:outline-none focus:border-[#6355D8] transition-all placeholder:text-[#9CA3AF]"
        />
      </div>

      {/* Teacher Cards List */}
      <div className="space-y-3">
        {filteredTeachers.length === 0 ? (
          <div className="p-10 rounded-2xl border border-dashed border-[#E5E7EB] text-center space-y-2">
            <p className="text-sm font-semibold text-[#111111]">
              No absent teachers found
            </p>
            <p className="text-xs text-[#666666]">
              {selectedFilter === 'All'
                ? 'No teachers are reported absent for today.'
                : `No teachers are absent during Period ${selectedFilter}.`}
            </p>
          </div>
        ) : (
          filteredTeachers.map((t) => {
            const fullName = `${t.pronoun} ${t.firstName} ${t.lastName}`;
            return (
              <div
                key={t.id}
                className="p-4 rounded-2xl border-2 border-[#E5E7EB] bg-white hover:border-[#CBD5E1] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#F4F2FF] border border-[#DDD6FE] text-[#6355D8] flex items-center justify-center font-bold text-sm shrink-0">
                    {t.lastName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#111111]">
                      {fullName}
                    </h3>
                    <p className="text-xs text-[#666666] mt-0.5">
                      {t.department || 'BCA Faculty'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {t.isAllDay ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F5F3FF] text-[#6355D8] border border-[#DDD6FE]">
                      Absent All Day (P1&ndash;P9 + IGS)
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F9FAFB] text-[#4B5563] border border-[#E5E7EB]">
                      Periods: {t.periods.join(', ')}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
