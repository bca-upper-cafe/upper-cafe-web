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
  const [currentPeriod, setCurrentPeriod] = useState<string | null>(null);

  useEffect(() => {
    setAbsences(localStore.getAbsences());
    const unsub = localStore.subscribe(() => {
      setAbsences(localStore.getAbsences());
    });

    async function loadCurrent() {
      const status = await fetchScheduleStatus();
      if (status.status === 'in_session' && status.period) {
        setCurrentPeriod(status.period);
        setSelectedFilter(status.period);
      }
    }
    loadCurrent();

    return () => unsub();
  }, []);

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
    <main className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-12 space-y-8">
      <Link
        href="/"
        className="text-xs text-[#666666] hover:text-[#111111] transition-colors"
      >
        &larr; Back to Home
      </Link>

      <header className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111]">
          Teacher Attendance
        </h1>
        <p className="text-sm text-[#666666]">
          {currentPeriod ? `Currently Period ${currentPeriod} · ` : ''}
          Live list of absent teachers.
        </p>
      </header>

      {/* Search Bar */}
      <div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search teachers..."
          className="w-full px-3.5 py-2.5 rounded-lg border border-[#eaeaea] bg-[#f9f9f9] text-sm text-[#111111] focus:bg-white focus:outline-none focus:border-[#111111] transition-colors placeholder:text-[#999999]"
        />
      </div>

      {/* Segmented Control / Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-[#eaeaea]">
        {PERIOD_PILLS.map((p) => {
          const isSelected = selectedFilter === p;
          return (
            <button
              key={p}
              onClick={() => setSelectedFilter(p)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors select-none whitespace-nowrap ${
                isSelected
                  ? 'border-b-2 border-[#111111] text-[#111111] font-semibold'
                  : 'text-[#666666] hover:text-[#111111]'
              }`}
            >
              {p === 'All' ? 'All' : p === 'IGS' ? 'IGS' : `P${p}`}
            </button>
          );
        })}
      </div>

      {/* List of Teachers with Hairline Dividers */}
      <div className="divide-y divide-[#eaeaea]">
        {filteredTeachers.length === 0 ? (
          <div className="py-12 text-center text-sm text-[#666666]">
            No absent teachers reported.
          </div>
        ) : (
          filteredTeachers.map((t) => {
            const fullName = `${t.pronoun} ${t.firstName} ${t.lastName}`;
            return (
              <div key={t.id} className="py-3.5 flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-[#111111]">
                  {fullName}
                </div>

                <div className="shrink-0">
                  <span className="text-xs font-medium px-2.5 py-1 rounded bg-[#f5f5f5] text-[#111111]">
                    {t.isAllDay ? 'All Day' : `P${t.periods.join(', ')}`}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );

}
