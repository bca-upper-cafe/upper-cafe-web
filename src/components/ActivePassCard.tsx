'use client';

import React, { useEffect, useState } from 'react';
import { CheckInRecord } from '../types';
import { DuolingoButton } from './DuolingoButton';
import { CheckCircle, Clock, MapPin, Sparkles, UserCheck, LogOut } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ActivePassCardProps {
  pass: CheckInRecord;
  onCheckOut: (id: string) => Promise<void>;
}

export const ActivePassCard: React.FC<ActivePassCardProps> = ({ pass, onCheckOut }) => {
  const [elapsed, setElapsed] = useState('00:00');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const start = new Date(pass.checkInTime).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((now - start) / 1000));
      const mins = Math.floor(diffSec / 60)
        .toString()
        .padStart(2, '0');
      const secs = (diffSec % 60).toString().padStart(2, '0');
      setElapsed(`${mins}:${secs}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [pass.checkInTime]);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      await onCheckOut(pass.id);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#C5B358', '#E5D68A', '#10B981', '#ffffff'],
        });
      } catch (_e) {}
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#1F2631] to-[#151B23] border-2 border-[#C5B358] border-b-[6px] border-b-[#7A6B25] p-6 sm:p-8 shadow-2xl">
      {/* Background glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#C5B358]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header status */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
            Study Hall Pass Active
          </span>
        </div>
        <div className="px-3 py-1 rounded-full text-xs font-bold bg-[#C5B358]/15 text-[#E5D68A] border border-[#C5B358]/30">
          Period {pass.period}
        </div>
      </div>

      {/* Pass Hero */}
      <div className="text-center py-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#C5B358] text-[#0B0E14] mb-3 shadow-lg shadow-[#C5B358]/20">
          <UserCheck className="w-8 h-8 stroke-[2.5]" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#F0F6FC] tracking-tight">
          {pass.studentName}
        </h2>
        <p className="text-sm font-semibold text-[#C5B358] mt-1">
          {pass.academy} • Grade {pass.grade} • ID #{pass.studentId}
        </p>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 gap-3 my-6 p-4 rounded-2xl bg-[#0B0E14]/60 border border-[#2C3442]">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B949E] block mb-0.5">
            Scenario
          </span>
          <p className="text-xs sm:text-sm font-extrabold text-[#F0F6FC]">
            {pass.scenario === 'DEFAULT_STUDY_HALL'
              ? 'Scheduled Study Hall'
              : `Absent: ${pass.absentTeacherName || 'Class'}`}
          </p>
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B949E] block mb-0.5">
            Location / Table
          </span>
          <div className="flex items-center gap-1 text-xs sm:text-sm font-extrabold text-[#C5B358]">
            <MapPin className="w-3.5 h-3.5" />
            <span>{pass.tableNumber || 'Upper Cafe'}</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B949E] block mb-0.5">
            Checked In At
          </span>
          <p className="text-xs sm:text-sm font-bold text-[#F0F6FC]">
            {new Date(pass.checkInTime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B949E] block mb-0.5">
            Duration In Cafe
          </span>
          <div className="flex items-center gap-1 text-xs sm:text-sm font-black text-emerald-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{elapsed}</span>
          </div>
        </div>
      </div>

      {/* Duolingo tactile checkout button */}
      <DuolingoButton
        variant="danger"
        size="lg"
        fullWidth
        disabled={loading}
        onClick={handleCheckout}
        className="flex items-center justify-center gap-2"
      >
        <LogOut className="w-5 h-5" />
        <span>{loading ? 'Checking Out...' : 'Check Out Of Upper Cafe'}</span>
      </DuolingoButton>

      <p className="text-center text-xs text-[#8B949E] mt-3 font-medium">
        Remember to check out before leaving to your next period class.
      </p>
    </div>
  );
};
