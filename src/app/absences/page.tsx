'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TeacherAbsence } from '@/types';
import { fetchAbsences } from '@/lib/api';
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
    const q = query.toLowerCase();
    const matchesQuery =
      a.teacherName.toLowerCase().includes(q) ||
      a.department.toLowerCase().includes(q) ||
      (a.notes && a.notes.toLowerCase().includes(q));
    return matchesPeriod && matchesQuery;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-10 w-full flex-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Today's Teacher Absences
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Classes with absent teachers report to Upper Cafe for study hall.
          </p>
        </div>

        <Link
          href="/"
          className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs py-2 px-3.5 rounded-lg text-center transition-colors"
        >
          Check In to Upper Cafe
        </Link>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 mb-5 space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedPeriod('ALL')}
            className={clsx(
              'px-2.5 py-1 rounded text-xs font-semibold shrink-0 transition-colors cursor-pointer',
              selectedPeriod === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            All Periods
          </button>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPeriod(p)}
              className={clsx(
                'px-2.5 py-1 rounded text-xs font-semibold shrink-0 transition-colors cursor-pointer',
                selectedPeriod === p
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              Period {p}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by teacher name, department, or keywords..."
          className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400"
        />
      </div>

      {/* Absence Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-4">Teacher</th>
              <th className="py-2.5 px-4">Department</th>
              <th className="py-2.5 px-4">Periods</th>
              <th className="py-2.5 px-4">Room</th>
              <th className="py-2.5 px-4">Coverage Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  Loading absences...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  No teacher absences matching this filter.
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-semibold text-slate-900">{t.teacherName}</td>
                  <td className="py-3 px-4 text-slate-600">{t.department}</td>
                  <td className="py-3 px-4 font-mono font-medium text-slate-900">
                    {t.periods.map((p) => `P${p}`).join(', ')}
                  </td>
                  <td className="py-3 px-4 text-slate-500">{t.room || '—'}</td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs">{t.notes || 'Report to Upper Cafe'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
