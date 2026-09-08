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
      <main className="max-w-[580px] mx-auto px-6 py-20">
        <p className="text-sm text-[#666666]">Loading schedule...</p>
      </main>
    );
  }

  const canCheckIn = effective.status === 'in_session';
  const canViewAttendance = effective.status !== 'no_school' && effective.status !== 'ended';

  return (
    <main className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-14 space-y-8">
      <header className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111]">
          {greeting} 👋 {user?.name || 'Student'}
        </h1>
        <p className="text-sm sm:text-base text-[#666666]">
          {effective.status === 'in_session' && effective.period && (
            <span>School is in session &middot; Period {effective.period}</span>
          )}
          {effective.status !== 'in_session' && (
            <span>{effective.message}</span>
          )}
        </p>
      </header>

      <hr className="border-none border-t border-[#eaeaea]" />

      {/* Active Check-In Banner */}
      {activeCheckIn && (
        <div className="p-4 rounded-lg border border-[#111111] bg-[#fafafa] space-y-2">
          <div className="text-xs uppercase tracking-wider font-semibold text-[#111111]">
            Active Sign-In
          </div>
          <p className="text-sm text-[#111111]">
            You are signed into Upper Cafe for <strong>Period {activeCheckIn.period}</strong> ({activeCheckIn.reason === 'TEACHER_ABSENT' ? `Absent Teacher: ${activeCheckIn.teacherName}` : 'Study Hall'}).
          </p>
          <div>
            <Link
              href="/check-out"
              className="text-xs font-semibold text-[#111111] underline underline-offset-3"
            >
              Go to Check Out &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <section className="space-y-3">
        <div className="text-xs uppercase tracking-wider text-[#666666] font-semibold">
          Actions
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          {canCheckIn ? (
            <Link
              href="/check-in/code"
              className="btn-minimal-primary py-2.5 px-5 text-sm flex-1 text-center"
            >
              Sign-In to Upper Cafe &rarr;
            </Link>
          ) : (
            <button
              disabled
              className="btn-minimal-disabled py-2.5 px-5 text-sm flex-1"
            >
              Sign-In to Upper Cafe
            </button>
          )}

          {canViewAttendance ? (
            <Link
              href="/absences"
              className="btn-minimal-secondary py-2.5 px-5 text-sm flex-1 text-center"
            >
              Teacher Attendance &rarr;
            </Link>
          ) : (
            <button
              disabled
              className="btn-minimal-disabled py-2.5 px-5 text-sm flex-1"
            >
              Teacher Attendance
            </button>
          )}
        </div>
      </section>

      <hr className="border-none border-t border-[#eaeaea]" />

      {/* About & Instructions */}
      <section className="space-y-2 text-sm text-[#666666] leading-relaxed">
        <div className="text-xs uppercase tracking-wider text-[#666666] font-semibold">
          About
        </div>
        <p>
          Students assigned to Upper Cafe for study hall or due to teacher absences must sign in using the 6-character Cafe Code displayed in the room.
        </p>
      </section>

      {/* Minimal simulation controls */}
      <div className="pt-4 border-t border-[#eaeaea]">
        <details className="text-xs text-[#888888]">
          <summary className="cursor-pointer hover:text-[#111111]">
            Schedule Tester Controls
          </summary>
          <div className="pt-2 flex flex-wrap gap-2">
            {[
              { id: 'auto', label: 'Auto' },
              { id: 'in_session', label: 'In Session' },
              { id: 'not_started', label: 'Before School' },
              { id: 'ended', label: 'After School' },
              { id: 'no_school', label: 'No School' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setSimState(id)}
                className={`px-2 py-1 text-xs rounded border ${
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
