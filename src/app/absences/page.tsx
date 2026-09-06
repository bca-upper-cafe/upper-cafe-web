'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TeacherAbsence } from '@/types';
import { fetchAbsences } from '@/lib/api';
import { Search, Users, Calendar, MapPin, ClipboardCheck, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

export default function AbsencesPage() {
  const [absences, setAbsences] = useState<TeacherAbsence[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<number | 'ALL'>('ALL');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAbsences().then((data) => {
      setAbsences(data);
      setLoading(false);
    });
  }, []);

  const filtered = absences.filter((a) => {
    const matchesPeriod = selectedPeriod === 'ALL' || a.periods.includes(selectedPeriod);
    const matchesQuery =
      a.teacherName.toLowerCase().includes(query.toLowerCase()) ||
      a.department.toLowerCase().includes(query.toLowerCase()) ||
      (a.notes && a.notes.toLowerCase().includes(query.toLowerCase()));
    return matchesPeriod && matchesQuery;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-10 w-full flex-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C5B358]" />
            <span className="text-xs font-black uppercase tracking-wider text-[#C5B358]">
              Daily Coverage Board
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#F0F6FC] tracking-tight">
            Today's Teacher Absences
          </h1>
          <p className="text-sm text-[#8B949E] mt-1">
            If your teacher is absent, report to Upper Cafe for study hall.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-[#C5B358] text-[#0B0E14] border-b-[4px] border-[#7A6B25] active:translate-y-[2px] active:border-b-0 hover:bg-[#D4C36A] transition-all"
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>Check In Now</span>
        </Link>
      </div>

      {/* Period Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-6">
        <button
          onClick={() => setSelectedPeriod('ALL')}
          className={clsx(
            'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 select-none border',
            selectedPeriod === 'ALL'
              ? 'bg-[#C5B358] text-[#0B0E14] border-[#7A6B25]'
              : 'bg-[#151B23] text-[#8B949E] border-[#2C3442] hover:text-[#F0F6FC]'
          )}
        >
          All Periods
        </button>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((p) => {
          const isSelected = selectedPeriod === p;
          return (
            <button
              key={p}
              onClick={() => setSelectedPeriod(p)}
              className={clsx(
                'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 select-none border',
                isSelected
                  ? 'bg-[#C5B358] text-[#0B0E14] border-[#7A6B25]'
                  : 'bg-[#151B23] text-[#8B949E] border-[#2C3442] hover:text-[#F0F6FC]'
              )}
            >
              Period {p}
            </button>
          );
        })}
      </div>

      {/* Search Box */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B949E]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by teacher name, department, or subject..."
          className="w-full bg-[#151B23] border border-[#2C3442] focus:border-[#C5B358] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F0F6FC] outline-none transition-colors"
        />
      </div>

      {/* Absence Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-sm text-[#8B949E]">
          Loading today's absences...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-[#151B23]/40 rounded-2xl border border-dashed border-[#2C3442]">
          <AlertCircle className="w-8 h-8 text-[#8B949E] mx-auto mb-2" />
          <p className="text-base font-bold text-[#F0F6FC]">No absences matching this filter</p>
          <p className="text-xs text-[#8B949E] mt-1">Check back later or view all periods.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="p-5 rounded-2xl bg-[#151B23] border border-[#2C3442] border-b-[4px] border-b-[#1C232E] hover:border-[#3D485A] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="font-extrabold text-base text-[#F0F6FC]">{t.teacherName}</h3>
                    <p className="text-xs font-semibold text-[#C5B358]">{t.department}</p>
                  </div>
                  {t.room && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#8B949E] bg-[#0B0E14] px-2 py-1 rounded-lg border border-[#2C3442]">
                      <MapPin className="w-3 h-3" />
                      {t.room}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 my-3">
                  {t.periods.map((p) => (
                    <span
                      key={p}
                      className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#1F2631] text-[#E5D68A] border border-[#C5B358]/30"
                    >
                      Period {p}
                    </span>
                  ))}
                </div>

                {t.notes && (
                  <p className="text-xs text-[#8B949E] leading-relaxed bg-[#0B0E14]/60 p-2.5 rounded-xl border border-[#2C3442]">
                    {t.notes}
                  </p>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-[#2C3442]/60 flex items-center justify-between">
                <span className="text-[11px] text-[#8B949E]">Upper Cafe Study Hall</span>
                <Link
                  href={`/?period=${t.periods[0]}&teacher=${encodeURIComponent(t.teacherName)}`}
                  className="text-xs font-bold text-[#C5B358] hover:underline"
                >
                  Check In →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
