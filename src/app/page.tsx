'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { ScheduleStatus } from '@/types';
import { fetchScheduleStatus } from '@/lib/schedule';

export default function HomePage() {
  const { user, activeCheckIn, isLoading: authLoading } = useAuth();
  const [schedule, setSchedule] = useState<ScheduleStatus | null>(null);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [greeting, setGreeting] = useState<'Good morning' | 'Good afternoon'>('Good morning');
  const [simState, setSimState] = useState<string>('auto');

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? 'Good morning' : 'Good afternoon');

    async function load() {
      setLoadingSchedule(true);
      const res = await fetchScheduleStatus();
      setSchedule(res);
      setLoadingSchedule(false);
    }
    load();
  }, []);

  const effective = useMemo(() => {
    if (!schedule) return null;
    if (simState === 'auto') return schedule;
    if (simState === 'in_session') {
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
    if (simState === 'not_started') {
      return { ...schedule, hasSchool: true, status: 'not_started' as const, period: null, message: "School hasn't started yet!" };
    }
    if (simState === 'ended') {
      return { ...schedule, hasSchool: true, status: 'ended' as const, period: null, message: 'No school for the rest of the day!' };
    }
    if (simState === 'no_school') {
      return { ...schedule, hasSchool: false, status: 'no_school' as const, period: null, message: 'No school today!' };
    }
    return schedule;
  }, [schedule, simState]);

  if (authLoading || loadingSchedule || !effective) {
    return (
      <main className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-20">
        <p className="text-sm text-[#666666]">Loading schedule...</p>
      </main>
    );
  }

  const canCheckIn = effective.status === 'in_session';
  const canViewAttendance = effective.status !== 'no_school' && effective.status !== 'ended';

  return (
    <main className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-12 space-y-10">
      {/* Header */}
      <header className="space-y-2 border-b border-[#eaeaea] pb-6">
        <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#111111]">
          {greeting} 👋 {user?.name || 'Student'}
        </h1>
        <p className="text-sm sm:text-base text-[#666666]">
          Bergen County Academies Upper Cafe attendance tracking and teacher absences directory.
        </p>
      </header>

      {/* Active Check-In Banner */}
      {activeCheckIn && (
        <div className="p-6 rounded-xl border border-[#111111] bg-[#fafafa] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wider font-semibold text-[#111111]">
              Active Upper Cafe Sign-In
            </div>
            <p className="text-sm sm:text-base text-[#111111]">
              You are currently signed into Upper Cafe for <strong>Period {activeCheckIn.period}</strong> ({activeCheckIn.reason === 'TEACHER_ABSENT' ? `Absent Teacher: ${activeCheckIn.teacherName}` : 'Study Hall'}).
            </p>
          </div>
          <Link
            href="/check-out"
            className="btn-minimal-primary py-2.5 px-6 text-sm shrink-0 text-center"
          >
            Go to Check Out &rarr;
          </Link>
        </div>
      )}

      {/* Spacious 2-Column Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Schedule Overview Card */}
        <section className="p-8 rounded-xl border border-[#eaeaea] bg-white space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#666666]">
                Today&apos;s Schedule
              </span>
              <span className="text-xs text-[#888888] font-mono">
                {effective.date}
              </span>
            </div>

            {effective.status === 'in_session' && effective.period ? (
              <div className="space-y-2 pt-2">
                <div className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
                  Period {effective.period}
                </div>
                {effective.periodStart && effective.periodEnd && (
                  <p className="text-sm text-[#666666] font-mono">
                    {effective.periodStart.slice(0, 5)} &ndash; {effective.periodEnd.slice(0, 5)}
                  </p>
                )}
                <div className="pt-2">
                  <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded bg-[#f5f5f5] text-[#111111]">
                    In Session
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                <div className="text-2xl font-bold tracking-tight text-[#111111]">
                  {effective.message}
                </div>
                <p className="text-sm text-[#666666]">
                  {effective.status === 'no_school' && 'Upper Cafe is closed today for holiday/weekend.'}
                  {effective.status === 'not_started' && 'Sign-in opens when Period 1 begins at 08:00 AM.'}
                  {effective.status === 'ended' && 'All scheduled periods have ended for today.'}
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#eaeaea] text-xs text-[#888888] flex items-center justify-between">
            <span>Schedule Type: {effective.scheduleType || 'Standard'}</span>
            <span>Hackensack, NJ</span>
          </div>
        </section>

        {/* Right Column: Actions Card */}
        <section className="p-8 rounded-xl border border-[#eaeaea] bg-white space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="text-xs uppercase tracking-wider font-semibold text-[#666666]">
              Quick Actions
            </div>

            <div className="space-y-3 pt-1">
              {canCheckIn ? (
                <Link
                  href="/check-in/code"
                  className="w-full h-14 btn-minimal-primary text-base flex items-center justify-center gap-2"
                >
                  <span>Sign-In to Upper Cafe</span>
                  <span>&rarr;</span>
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full h-14 btn-minimal-disabled text-base"
                >
                  Sign-In to Upper Cafe
                </button>
              )}

              {canViewAttendance ? (
                <Link
                  href="/absences"
                  className="w-full h-14 btn-minimal-secondary text-base flex items-center justify-center gap-2"
                >
                  <span>Teacher Attendance Directory</span>
                  <span>&rarr;</span>
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full h-14 btn-minimal-disabled text-base"
                >
                  Teacher Attendance Directory
                </button>
              )}
            </div>
          </div>

          <p className="text-xs text-[#888888] leading-relaxed">
            Please make sure you have the 6-character Cafe Code displayed on the room screens before initiating sign-in.
          </p>
        </section>
      </div>

      {/* About Section */}
      <section className="p-8 rounded-xl border border-[#eaeaea] bg-white space-y-3">
        <div className="text-xs uppercase tracking-wider font-semibold text-[#666666]">
          Upper Cafe Attendance Guidelines
        </div>
        <p className="text-sm text-[#666666] leading-relaxed">
          Bergen County Academies requires all students present in Upper Cafe during study hall or teacher absence periods to sign in upon arrival. Check out when the bell rings or if excused by a supervising proctor.
        </p>
      </section>

      {/* Minimal Simulation Controls */}
      <div className="pt-2 border-t border-[#eaeaea]">
        <details className="text-xs text-[#888888]">
          <summary className="cursor-pointer hover:text-[#111111]">
            Schedule Simulation Controls
          </summary>
          <div className="pt-3 flex flex-wrap gap-2">
            {[
              { id: 'auto', label: 'Auto (Live Time)' },
              { id: 'in_session', label: 'Simulate In Session' },
              { id: 'not_started', label: 'Simulate Before School' },
              { id: 'ended', label: 'Simulate After School' },
              { id: 'no_school', label: 'Simulate No School' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setSimState(id)}
                className={`px-3 py-1.5 text-xs rounded-md border ${
                  simState === id
                    ? 'bg-[#111111] text-white border-[#111111]'
                    : 'bg-white text-[#666666] border-[#eaeaea] hover:text-[#111111]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </details>
      </div>
    </main>
  );
}
