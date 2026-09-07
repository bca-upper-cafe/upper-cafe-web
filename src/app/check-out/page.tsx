'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { CheckCircle2, Clock, BookOpen, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CheckOutPage() {
  const { user, activeCheckIn, submitCheckOut } = useAuth();
  const router = useRouter();

  const [checkingOut, setCheckingOut] = useState(false);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [justCheckedOut, setJustCheckedOut] = useState(false);

  // Calculate elapsed time
  useEffect(() => {
    if (!activeCheckIn) {
      // If student was checked out by admin while viewing this screen
      setJustCheckedOut(true);
      const timer = setTimeout(() => {
        router.replace('/');
      }, 1800);
      return () => clearTimeout(timer);
    }

    const calcElapsed = () => {
      const inTime = new Date(activeCheckIn.checkInTime).getTime();
      const now = Date.now();
      const mins = Math.max(0, Math.floor((now - inTime) / 60000));
      setElapsedMinutes(mins);
    };

    calcElapsed();
    const interval = setInterval(calcElapsed, 30000);
    return () => clearInterval(interval);
  }, [activeCheckIn, router]);

  const handleCheckOut = async () => {
    setCheckingOut(true);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
      await submitCheckOut();
      setJustCheckedOut(true);
      setTimeout(() => {
        router.replace('/');
      }, 1500);
    } finally {
      setCheckingOut(false);
    }
  };

  if (justCheckedOut || !activeCheckIn) {
    return (
      <main className="min-h-[75vh] max-w-[480px] mx-auto px-6 py-16 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center text-3xl">
          ✓
        </div>
        <h1 className="text-2xl font-bold text-[#111111]">
          You have checked out!
        </h1>
        <p className="text-sm text-[#666666]">
          Your attendance record has been permanently logged. Returning to home...
        </p>
      </main>
    );
  }

  const checkInTimeFormatted = new Date(activeCheckIn.checkInTime).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <main className="min-h-[80vh] max-w-[500px] mx-auto px-6 py-10 flex flex-col justify-between">
      <div className="space-y-8">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
          <span className="w-2 h-2 rounded-full bg-[#059669] animate-ping" />
          <span>Active in Upper Cafe &middot; Period {activeCheckIn.period}</span>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111]">
            Currently Checked In
          </h1>
          <p className="text-sm text-[#666666]">
            You are signed in to Upper Cafe. When the bell rings or you leave the cafe, please tap Check Out below.
          </p>
        </div>

        {/* Details Card */}
        <div className="p-6 rounded-2xl border border-[#eaeaea] bg-white space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#eaeaea]">
            <span className="text-xs text-[#666666] font-medium">Student</span>
            <span className="text-sm font-bold text-[#111111]">{activeCheckIn.studentName}</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-[#eaeaea]">
            <span className="text-xs text-[#666666] font-medium">Reason</span>
            <span className="text-sm font-semibold text-[#111111]">
              {activeCheckIn.reason === 'TEACHER_ABSENT' ? 'Teacher Absent' : 'Study Hall'}
            </span>
          </div>

          {activeCheckIn.teacherName && (
            <div className="flex items-center justify-between pb-3 border-b border-[#eaeaea]">
              <span className="text-xs text-[#666666] font-medium">Absent Teacher</span>
              <span className="text-sm font-bold text-[#6355D8]">{activeCheckIn.teacherName}</span>
            </div>
          )}

          <div className="flex items-center justify-between pb-3 border-b border-[#eaeaea]">
            <span className="text-xs text-[#666666] font-medium">Checked In At</span>
            <span className="text-sm font-mono text-[#111111] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#888888]" />
              {checkInTimeFormatted} ({elapsedMinutes}m ago)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#92400E] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Per BCA policy, students must remain in Upper Cafe for the entire duration of the period unless excused by a proctor.
            </span>
          </div>
        </div>

        {/* Navigation link to teacher absences (permitted during lockout) */}
        <div className="text-center">
          <Link
            href="/absences"
            className="text-xs text-[#6355D8] hover:underline font-medium inline-flex items-center gap-1"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>View Today&apos;s Teacher Absences &rarr;</span>
          </Link>
        </div>
      </div>

      {/* Bottom Action Button */}
      <div className="pt-8 pb-4">
        <button
          onClick={handleCheckOut}
          disabled={checkingOut}
          className="w-full btn-duo-danger py-4 text-base"
        >
          {checkingOut ? 'CHECKING OUT...' : 'CHECK OUT'}
        </button>
      </div>
    </main>
  );
}
