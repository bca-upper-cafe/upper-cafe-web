'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, UserX, BookOpen, Check } from 'lucide-react';
import { useAuth } from '@/lib/auth';

function ReasonSelectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const period = searchParams.get('period') || '4';
  const { submitCheckIn } = useAuth();

  const [selectedReason, setSelectedReason] = useState<'TEACHER_ABSENT' | 'STUDY_HALL' | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleContinue = async () => {
    if (!selectedReason) return;

    if (selectedReason === 'TEACHER_ABSENT') {
      // Go to teacher selection list
      router.push(`/check-in/teacher?period=${period}`);
    } else {
      // Direct check-in for Study Hall
      setSubmitting(true);
      try {
        await submitCheckIn(period, 'STUDY_HALL');
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <main className="min-h-[80vh] max-w-[480px] mx-auto px-6 py-8 flex flex-col justify-between">
      {/* Top Section */}
      <div className="space-y-8">
        {/* Back Link */}
        <Link
          href="/check-in/code"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#666666] hover:text-[#111111] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Link>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111]">
            Why are you in Upper Cafe?
          </h1>
          <p className="text-sm text-[#666666]">
            Period {period} &middot; Select your reason for attendance today.
          </p>
        </div>

        {/* Dual Stacked Selection Tiles matching duoDualSelection.avif */}
        <div className="space-y-4">
          {/* Option 1: Teacher Is Absent */}
          <div
            onClick={() => setSelectedReason('TEACHER_ABSENT')}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 select-none ${
              selectedReason === 'TEACHER_ABSENT'
                ? 'border-[#6355D8] bg-[#F5F3FF] shadow-sm'
                : 'border-[#E2E8F0] hover:border-[#CBD5E1] bg-white'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                selectedReason === 'TEACHER_ABSENT'
                  ? 'bg-[#6355D8] text-white border-[#4A36B8]'
                  : 'bg-[#F8FAFC] text-[#6355D8] border-[#E2E8F0]'
              }`}
            >
              <UserX className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#111111]">
                  My Teacher Is Absent
                </h3>
                {selectedReason === 'TEACHER_ABSENT' && (
                  <div className="w-5 h-5 rounded-full bg-[#6355D8] text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
              <p className="text-xs text-[#666666] mt-1 leading-relaxed">
                Your assigned teacher is absent during this period and you were instructed to report to Upper Cafe.
              </p>
            </div>
          </div>

          {/* Option 2: Study Hall */}
          <div
            onClick={() => setSelectedReason('STUDY_HALL')}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 select-none ${
              selectedReason === 'STUDY_HALL'
                ? 'border-[#6355D8] bg-[#F5F3FF] shadow-sm'
                : 'border-[#E2E8F0] hover:border-[#CBD5E1] bg-white'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                selectedReason === 'STUDY_HALL'
                  ? 'bg-[#6355D8] text-white border-[#4A36B8]'
                  : 'bg-[#F8FAFC] text-[#6355D8] border-[#E2E8F0]'
              }`}
            >
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#111111]">
                  I Am Here for Study Hall
                </h3>
                {selectedReason === 'STUDY_HALL' && (
                  <div className="w-5 h-5 rounded-full bg-[#6355D8] text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
              <p className="text-xs text-[#666666] mt-1 leading-relaxed">
                You have an official scheduled study hall or free period in your schedule today.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Button matching duoDualSelection.avif */}
      <div className="pt-8 pb-4">
        <button
          onClick={handleContinue}
          disabled={!selectedReason || submitting}
          className={`w-full py-4 text-base ${
            selectedReason && !submitting
              ? 'btn-duo-purple'
              : 'btn-duo-disabled'
          }`}
        >
          {submitting ? 'CHECKING IN...' : 'CONTINUE'}
        </button>
      </div>
    </main>
  );
}

export default function ReasonSelectionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <ReasonSelectionContent />
    </Suspense>
  );
}
