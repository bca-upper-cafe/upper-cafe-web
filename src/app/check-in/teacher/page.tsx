'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, UserX, Check, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { localStore } from '@/lib/supabase';
import { TeacherAbsence } from '@/types';

function TeacherSelectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const period = searchParams.get('period') || '4';
  const { submitCheckIn } = useAuth();

  const [absences, setAbsences] = useState<TeacherAbsence[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const list = localStore.getAbsences();
    // Filter to teachers absent this period or absent all day
    const matching = list.filter(t => {
      if (t.isAllDay) return true;
      return t.periods.includes(period) || t.periods.includes('ALL_DAY');
    });
    setAbsences(matching);
  }, [period]);

  const handleSelectTeacher = async (teacher: TeacherAbsence) => {
    setSelectedTeacherId(teacher.id);
    setSubmitting(true);
    const fullName = `${teacher.pronoun} ${teacher.firstName} ${teacher.lastName}`.trim();
    try {
      await submitCheckIn(period, 'TEACHER_ABSENT', fullName, teacher.id);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectOther = async () => {
    setSelectedTeacherId('other');
    setSubmitting(true);
    try {
      await submitCheckIn(period, 'TEACHER_ABSENT', 'Other / Unlisted Teacher', 'other');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-[80vh] max-w-[540px] mx-auto px-6 py-8 space-y-8">
      {/* Top Header */}
      <div className="space-y-4">
        <Link
          href={`/check-in/reason?period=${period}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#666666] hover:text-[#111111] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Link>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111]">
            Select Absent Teacher
          </h1>
          <p className="text-sm text-[#666666]">
            Period {period} &middot; Tap the teacher whose class is taking study hall in Upper Cafe.
          </p>
        </div>
      </div>

      {/* Duolingo-style Teacher Cards */}
      <div className="space-y-3">
        {absences.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-[#CBD5E1] text-center space-y-3">
            <p className="text-sm text-[#666666]">
              No absent teachers logged for Period {period} today.
            </p>
            <button
              onClick={handleSelectOther}
              className="btn-duo-secondary py-3 px-5 text-xs"
            >
              Check in with Unlisted Teacher &rarr;
            </button>
          </div>
        ) : (
          absences.map((t) => {
            const isSelected = selectedTeacherId === t.id;
            const fullName = `${t.pronoun} ${t.firstName} ${t.lastName}`;
            return (
              <div
                key={t.id}
                onClick={() => !submitting && handleSelectTeacher(t)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-4 select-none ${
                  isSelected
                    ? 'border-[#6355D8] bg-[#F5F3FF]'
                    : 'border-[#E2E8F0] hover:border-[#CBD5E1] bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F4F2FF] border border-[#DDD6FE] text-[#6355D8] flex items-center justify-center font-bold text-sm">
                    {t.lastName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#111111]">
                      {fullName}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-[#666666]">
                      {t.department && <span>{t.department}</span>}
                      <span>&middot;</span>
                      <span className="font-medium text-[#6355D8]">
                        {t.isAllDay ? 'All Day' : `Period ${period}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-[#6355D8] text-white flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                  ) : (
                    <ChevronRight className="w-5 h-5 text-[#94A3B8]" />
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Unlisted Teacher Option */}
        <div
          onClick={() => !submitting && handleSelectOther()}
          className="p-4 rounded-2xl border-2 border-[#E2E8F0] hover:border-[#CBD5E1] bg-white cursor-pointer transition-all flex items-center justify-between text-xs text-[#666666] select-none"
        >
          <span>Teacher not on this list? Check in with Unlisted Teacher</span>
          <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
        </div>
      </div>
    </main>
  );
}

export default function TeacherSelectionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <TeacherSelectionContent />
    </Suspense>
  );
}
