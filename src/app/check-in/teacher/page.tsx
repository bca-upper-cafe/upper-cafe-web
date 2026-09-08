'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { localStore } from '@/lib/supabase';
import { TeacherAbsence } from '@/types';

function TeacherSelectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const period = searchParams.get('period') || '4';
  const { submitCheckIn } = useAuth();

  const [absences, setAbsences] = useState<TeacherAbsence[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const list = localStore.getAbsences();
    const matching = list.filter((t) => {
      if (t.isAllDay) return true;
      return t.periods.includes(period) || t.periods.includes('ALL_DAY');
    });
    setAbsences(matching);
  }, [period]);

  const handleSelect = async (teacher: TeacherAbsence) => {
    setSubmitting(true);
    const fullName = `${teacher.pronoun} ${teacher.firstName} ${teacher.lastName}`.trim();
    try {
      await submitCheckIn(period, 'TEACHER_ABSENT', fullName, teacher.id);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectOther = async () => {
    setSubmitting(true);
    try {
      await submitCheckIn(period, 'TEACHER_ABSENT', 'Unlisted Teacher', 'other');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="w-full max-w-4xl mx-auto px-6 sm:px-10 py-16 space-y-8">
      <div>
        <Link
          href={`/check-in/reason?period=${period}`}
          className="text-xs text-[#666666] hover:text-[#111111] transition-colors"
        >
          &larr; Back to Reason
        </Link>
      </div>

      <header className="space-y-2 border-b border-[#eaeaea] pb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111]">
          Select Absent Teacher
        </h1>
        <p className="text-sm sm:text-base text-[#666666]">
          Period {period} &middot; Select the teacher whose absent class you are reporting to Upper Cafe for.
        </p>
      </header>

      {absences.length === 0 ? (
        <div className="p-8 rounded-xl border border-[#eaeaea] text-center space-y-3 bg-[#fafafa]">
          <p className="text-sm text-[#666666]">
            No absent teachers are currently logged for Period {period}.
          </p>
          <button
            onClick={handleSelectOther}
            className="text-sm font-semibold text-[#111111] underline underline-offset-3 cursor-pointer"
          >
            Sign in with Unlisted Teacher &rarr;
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {absences.map((t) => {
            const fullName = `${t.pronoun} ${t.firstName} ${t.lastName}`;
            return (
              <div
                key={t.id}
                onClick={() => !submitting && handleSelect(t)}
                className="p-5 rounded-xl border border-[#eaeaea] bg-white hover:border-[#111111] transition-all cursor-pointer flex items-center justify-between gap-3 select-none shadow-xs"
              >
                <div>
                  <div className="text-base font-semibold text-[#111111]">
                    {fullName}
                  </div>
                  <div className="text-xs text-[#666666] mt-0.5">
                    {t.isAllDay ? 'Absent All Day' : `Period ${period}`}
                  </div>
                </div>
                <span className="text-xs text-[#111111] font-semibold">
                  Select &rarr;
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="pt-2">
        <button
          onClick={handleSelectOther}
          disabled={submitting}
          className="text-xs sm:text-sm text-[#666666] hover:text-[#111111] underline underline-offset-3 cursor-pointer"
        >
          Teacher not on this list? Sign in with Unlisted Teacher &rarr;
        </button>
      </div>
    </main>
  );
}

export default function TeacherSelectionPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto p-12 text-sm text-[#666666]">Loading...</div>}>
      <TeacherSelectionContent />
    </Suspense>
  );
}
