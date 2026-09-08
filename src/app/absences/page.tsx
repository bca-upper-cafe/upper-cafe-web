'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { localStore } from '@/lib/supabase';
import { TeacherAbsence } from '@/types';
import { fetchScheduleStatus } from '@/lib/schedule';

const PERIOD_PILLS = ['All', '1', 'IGS', '2', '3', '4', '5', '6', '7', '8', '9'];

export default function AbsencesPage() {
  const [absences, setAbsences] = useState<TeacherAbsence[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [scheduleStatus, setScheduleStatus] = useState<import('@/types').ScheduleStatus | null>(null);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(true);

  useEffect(() => {
    setAbsences(localStore.getAbsences());
    const unsub = localStore.subscribe(() => {
      setAbsences(localStore.getAbsences());
    });

    async function loadSchedule() {
      setIsLoadingSchedule(true);
      const status = await fetchScheduleStatus();
      setScheduleStatus(status);
      if (status.status === 'in_session' && status.period) {
        setSelectedFilter(status.period);
      }
      setIsLoadingSchedule(false);
    }
    loadSchedule();

    return () => unsub();
  }, []);

  const currentPeriod = scheduleStatus?.status === 'in_session' ? scheduleStatus.period : null;

  const filteredTeachers = absences.filter((t) => {
    const fullName = `${t.pronoun} ${t.firstName} ${t.lastName}`.toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || fullName.includes(q);
    if (!matchesSearch) return false;

    if (selectedFilter === 'All') return true;
    if (t.isAllDay) return true;

    return t.periods.includes(selectedFilter) || t.periods.includes('ALL_DAY');
  });

  return (
    <main className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-10 space-y-8">
      {/* Back Link */}
      <div>
        <Link
          href="/"
          className="text-xs text-[#666666] hover:text-[#111111] transition-colors"
        >
          &larr; Back to Home
        </Link>
      </div>

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#eaeaea] pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111]">
            Teacher Attendance
          </h1>
          <p className="text-sm text-[#666666]">
            {currentPeriod ? `Currently Period ${currentPeriod} · ` : ''}
            Live directory of absent teachers for today.
          </p>
        </div>
        {scheduleStatus?.status === 'in_session' && (
          <div className="text-xs text-[#888888] font-medium">
            {filteredTeachers.length} {filteredTeachers.length === 1 ? 'absence' : 'absences'} listed
          </div>
        )}
      </header>

      {/* Out of Session Message: replaces the list and filters entirely */}
      {!isLoadingSchedule && scheduleStatus && scheduleStatus.status !== 'in_session' ? (
        <div className="py-24 text-center max-w-lg mx-auto space-y-3">
          <h2 className="text-lg font-semibold text-[#111111]">
            School is not currently in session
          </h2>
          <p className="text-sm text-[#666666] leading-relaxed">
            {scheduleStatus.status === 'no_school' && 'No school is scheduled for today.'}
            {scheduleStatus.status === 'not_started' && 'School has not started yet today. First period begins at 8:00 AM.'}
            {scheduleStatus.status === 'ended' && 'School hours have concluded for today.'}
          </p>
          <p className="text-xs text-[#888888] pt-2">
            Teacher attendance and Upper Cafe sign-ins resume during regular school hours.
          </p>
        </div>
      ) : (
        <>
          {/* Controls Bar: Search & Filter Tabs */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search teachers by name..."
                className="w-full sm:max-w-md h-11 px-4 rounded-lg border border-[#eaeaea] bg-[#f9f9f9] text-sm text-[#111111] focus:bg-white focus:outline-none focus:border-[#111111] transition-colors placeholder:text-[#999999]"
              />
            </div>

            {/* Period Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[#eaeaea]">
              {PERIOD_PILLS.map((p) => {
                const isSelected = selectedFilter === p;
                return (
                  <button
                    key={p}
                    onClick={() => setSelectedFilter(p)}
                    className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-colors select-none whitespace-nowrap rounded-md ${
                      isSelected
                        ? 'bg-[#111111] text-white'
                        : 'bg-[#f5f5f5] text-[#666666] hover:text-[#111111] hover:bg-[#eaeaea]'
                    }`}
                  >
                    {p === 'All' ? 'All Periods' : p === 'IGS' ? 'IGS' : `Period ${p}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Responsive Cards Grid */}
          {filteredTeachers.length === 0 ? (
            <div className="py-20 text-center text-sm text-[#666666] border border-[#eaeaea] rounded-xl bg-[#fafafa]">
              No absent teachers found for this selection.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTeachers.map((t) => {
                const fullName = `${t.pronoun} ${t.firstName} ${t.lastName}`;
                return (
                  <div
                    key={t.id}
                    className="p-5 rounded-xl border border-[#eaeaea] bg-white hover:border-[#111111] transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="text-base font-semibold text-[#111111]">
                      {fullName}
                    </div>

                    <div className="shrink-0 text-xs font-medium text-[#666666]">
                      {t.isAllDay ? 'All Day' : `Periods ${t.periods.join(', ')}`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </main>
  );
}
