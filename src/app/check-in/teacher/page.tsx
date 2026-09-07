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
    <main className="max-w-3xl mx-auto px-6 sm:px-8 py-12 space-y-6">
      <Link
        href={`/check-in/reason?period=${period}`}
        className="text-xs text-[#666666] hover:text-[#111111] transition-colors"
      >
        &larr; Back
      </Link>

      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-[#111111]">
          Select Absent Teacher
        </h1>
        <p className="text-sm text-[#666666]">
          Period {period} &middot; Select your teacher to complete sign-in.
        </p>
      </header>

      <hr className="border-none border-t border-[#eaeaea]" />

      <div className="space-y-2">
        {absences.length === 0 ? (
          <div className="p-6 rounded-lg border border-[#eaeaea] text-center space-y-2">
            <p className="text-sm text-[#666666]">
              No absent teachers logged for Period {period}.
            </p>
            <button
              onClick={handleSelectOther}
              className="text-xs font-semibold text-[#111111] underline underline-offset-3"
            >
              Sign in with Unlisted Teacher &rarr;
            </button>
          </div>
        ) : (
          absences.map((t) => {
            const fullName = `${t.pronoun} ${t.firstName} ${t.lastName}`;
            return (
              <div
                key={t.id}
                onClick={() => !submitting && handleSelect(t)}
                className="p-3.5 rounded-lg border border-[#eaeaea] bg-white hover:border-[#111111] transition-colors cursor-pointer flex items-center justify-between select-none"
              >
                <div>
                  <div className="text-sm font-medium text-[#111111]">
                    {fullName}
                  </div>
                  <div className="text-xs text-[#666666]">
                    {t.department} &middot; {t.isAllDay ? 'All Day' : `Period ${period}`}
                  </div>
                </div>
                <span className="text-xs text-[#111111] font-medium">
                  Select &rarr;
                </span>
              </div>
            );
          })
        )}

        <div className="pt-2">
          <button
            onClick={handleSelectOther}
            disabled={submitting}
            className="text-xs text-[#666666] hover:text-[#111111] underline underline-offset-3"
          >
            Teacher not listed? Sign in with Unlisted Teacher &rarr;
          </button>
        </div>
      </div>
    </main>
  );
}

export default function TeacherSelectionPage() {
  return (
    <Suspense fallback={<div className="max-w-[580px] mx-auto p-12 text-sm text-[#666666]">Loading...</div>}>
      <TeacherSelectionContent />
    </Suspense>
  );
}
