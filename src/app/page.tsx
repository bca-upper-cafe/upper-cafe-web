'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { ScheduleStatus } from '@/types';
import { fetchScheduleStatus, calculateLocalScheduleStatus } from '@/lib/schedule';
import { Calendar, Clock, ArrowRight, BookOpen, CheckCircle, Sliders } from 'lucide-react';

export default function HomePage() {
  const { user, activeCheckIn, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [schedule, setSchedule] = useState<ScheduleStatus | null>(null);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [greeting, setGreeting] = useState<'Good morning' | 'Good afternoon'>('Good morning');

  // Simulation state for testing states
  const [simulatedState, setSimulatedState] = useState<string>('auto');

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? 'Good morning' : 'Good afternoon');

    async function loadSchedule() {
      setLoadingSchedule(true);
      const status = await fetchScheduleStatus();
      setSchedule(status);
      setLoadingSchedule(false);
    }
    loadSchedule();

    const interval = setInterval(loadSchedule, 60000);
    return () => clearInterval(interval);
  }, []);

  // Compute effective schedule based on simulatedState or real status
  const effectiveStatus = React.useMemo(() => {
    if (!schedule) return null;
    if (simulatedState === 'auto') return schedule;

    if (simulatedState === 'in_session') {
      return {
        ...schedule,
        hasSchool: true,
        status: 'in_session' as const,
        period: schedule.period || '4',
        periodStart: '11:08:00',
        periodEnd: '11:51:00',
        message: 'Current: Period 4'
      };
    }
    if (simulatedState === 'not_started') {
      return {
        ...schedule,
        hasSchool: true,
        status: 'not_started' as const,
        period: null,
        message: "School hasn't started yet!"
      };
    }
    if (simulatedState === 'ended') {
      return {
        ...schedule,
        hasSchool: true,
        status: 'ended' as const,
        period: null,
        message: 'No school for the rest of the day!'
      };
    }
    if (simulatedState === 'no_school') {
      return {
        ...schedule,
        hasSchool: false,
        status: 'no_school' as const,
        period: null,
        message: 'No school today!'
      };
    }
    return schedule;
  }, [schedule, simulatedState]);

  if (authLoading || loadingSchedule || !effectiveStatus) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 rounded-full border-2 border-[#6355D8] border-t-transparent" />
      </div>
    );
  }

  // Determine button availability per user specifications
  // In session: both enabled
  // No school today: both disabled ("No school today!")
  // Before school: check-in disabled ("School hasn't started yet!"), teacher attendance enabled
  // After school: both disabled ("No school for the rest of the day!")
  const canCheckIn = effectiveStatus.status === 'in_session';
  const canViewAttendance = effectiveStatus.status !== 'no_school' && effectiveStatus.status !== 'ended';

  return (
    <main className="max-w-[680px] mx-auto px-6 py-12 space-y-10">
      {/* Header Greeting */}
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111]">
          {greeting} 👋 {user?.name || 'Student'}
        </h1>
        <p className="text-[#666666] text-sm">
          Welcome to BCA Upper Cafe attendance tracking and teacher absence directory.
        </p>
      </header>

      {/* Period / School Status Display */}
      <section className="p-6 rounded-2xl border border-[#eaeaea] bg-white space-y-4">
        <div className="flex items-center justify-between text-xs text-[#666666]">
          <span className="uppercase tracking-wider font-semibold">Today&apos;s Schedule</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {effectiveStatus.date}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            {effectiveStatus.status === 'in_session' && effectiveStatus.period && (
              <div className="space-y-1">
                <div className="text-xl font-bold text-[#111111] flex items-center gap-2">
                  <span>Period {effectiveStatus.period}</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                    In Session
                  </span>
                </div>
                {effectiveStatus.periodStart && effectiveStatus.periodEnd && (
                  <p className="text-xs text-[#666666] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {effectiveStatus.periodStart.slice(0, 5)} &ndash; {effectiveStatus.periodEnd.slice(0, 5)}
                  </p>
                )}
              </div>
            )}

            {effectiveStatus.status !== 'in_session' && (
              <div className="space-y-1">
                <div className="text-lg font-bold text-[#111111]">
                  {effectiveStatus.message}
                </div>
                <p className="text-xs text-[#666666]">
                  {effectiveStatus.status === 'no_school' && 'Enjoy your day off! Upper Cafe check-in is closed.'}
                  {effectiveStatus.status === 'not_started' && 'Check-in opens when Period 1 begins at 08:00 AM.'}
                  {effectiveStatus.status === 'ended' && 'All periods have completed for today.'}
                </p>
              </div>
            )}
          </div>

          {effectiveStatus.scheduleType && (
            <div className="text-xs px-3 py-1.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-[#4B5563] self-start sm:self-auto">
              Schedule: <span className="font-semibold">{effectiveStatus.scheduleType}</span>
            </div>
          )}
        </div>
      </section>

      {/* Main Action Buttons (Duolingo 3D Button Style) */}
      <section className="space-y-4">
        {/* Check-In Button */}
        {canCheckIn ? (
          <Link
            href="/check-in/code"
            className="w-full btn-duo-purple py-4 px-6 text-base shadow-sm"
          >
            <span>Check-In to Upper Cafe</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        ) : (
          <button
            disabled
            className="w-full btn-duo-disabled py-4 px-6 text-base"
          >
            <span>Check-In to Upper Cafe</span>
          </button>
        )}

        {/* Teacher Attendance Button */}
        {canViewAttendance ? (
          <Link
            href="/absences"
            className="w-full btn-duo-secondary py-4 px-6 text-base"
          >
            <BookOpen className="w-5 h-5 mr-2 text-[#6355D8]" />
            <span>Teacher Attendance</span>
          </Link>
        ) : (
          <button
            disabled
            className="w-full btn-duo-disabled py-4 px-6 text-base"
          >
            <BookOpen className="w-5 h-5 mr-2 text-[#9CA3AF]" />
            <span>Teacher Attendance</span>
          </button>
        )}
      </section>

      {/* Active Check-In Banner if student is already checked in */}
      {activeCheckIn && (
        <section className="p-5 rounded-2xl border-2 border-[#6355D8] bg-[#F5F3FF] flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#6355D8]" />
              <span className="font-bold text-sm text-[#2E1065]">
                You are currently checked in for Period {activeCheckIn.period}
              </span>
            </div>
            <p className="text-xs text-[#5B21B6]">
              {activeCheckIn.reason === 'TEACHER_ABSENT'
                ? `Teacher Absent: ${activeCheckIn.teacherName || 'Assigned Proctor'}`
                : 'Study Hall'}
            </p>
          </div>
          <Link
            href="/check-out"
            className="btn-duo-purple py-2 px-4 text-xs shrink-0"
          >
            Check Out &rarr;
          </Link>
        </section>
      )}

      {/* Quick Schedule Simulation Switcher (for demonstration/testing) */}
      <section className="pt-6 border-t border-[#eaeaea]">
        <details className="text-xs text-[#666666]">
          <summary className="cursor-pointer font-medium hover:text-[#111111] flex items-center gap-1.5 select-none">
            <Sliders className="w-3.5 h-3.5" />
            <span>Schedule Tester & Controls (Toggle School States)</span>
          </summary>
          <div className="pt-3 pb-1 flex flex-wrap items-center gap-2">
            {[
              { id: 'auto', label: 'Live Auto Schedule' },
              { id: 'in_session', label: 'Simulate In Session (Period 4)' },
              { id: 'not_started', label: 'Simulate Before School' },
              { id: 'ended', label: 'Simulate After School' },
              { id: 'no_school', label: 'Simulate No School Today' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setSimulatedState(id)}
                className={`px-3 py-1 rounded-lg font-medium border text-xs transition-all ${
                  simulatedState === id
                    ? 'bg-[#6355D8] text-white border-[#4A36B8]'
                    : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:border-[#6355D8]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </details>
      </section>
    </main>
  );
}
