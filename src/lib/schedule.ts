import { ScheduleStatus } from '@/types';

const SCHEDULE_API_BASE = process.env.NEXT_PUBLIC_SCHEDULE_API_URL || 'http://localhost:4001';

// Full Day periods (default)
const FULL_DAY_PERIODS = [
  { period: '1', start: '08:00:00', end: '08:43:00' },
  { period: 'IGS', start: '08:47:00', end: '09:30:00' },
  { period: '2', start: '09:34:00', end: '10:17:00' },
  { period: '3', start: '10:21:00', end: '11:04:00' },
  { period: '4', start: '11:08:00', end: '11:51:00' },
  { period: '5', start: '11:55:00', end: '12:38:00' },
  { period: '6', start: '12:42:00', end: '13:25:00' },
  { period: '7', start: '13:29:00', end: '14:12:00' },
  { period: '8', start: '14:16:00', end: '14:59:00' },
  { period: '9', start: '15:03:00', end: '15:46:00' }
];

function timeToSec(timeStr: string): number {
  const [h, m, s] = timeStr.split(':').map(Number);
  return h * 3600 + m * 60 + (s || 0);
}

export function calculateLocalScheduleStatus(now: Date = new Date()): ScheduleStatus {
  const dayOfWeek = now.getDay(); // 0 = Sun, 6 = Sat
  const pad = (n: number) => String(n).padStart(2, '0');
  const dateStr = `${pad(now.getMonth() + 1)}/${pad(now.getDate())}/${now.getFullYear()}`;
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const currentSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  // Weekends
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return {
      hasSchool: false,
      status: 'no_school',
      scheduleType: null,
      period: null,
      periodStart: null,
      periodEnd: null,
      nextPeriod: null,
      message: 'No school today!',
      date: dateStr,
      time: timeStr
    };
  }

  const schoolStart = timeToSec('08:00:00');
  const schoolEnd = timeToSec('15:46:00');

  if (currentSec < schoolStart) {
    return {
      hasSchool: true,
      status: 'not_started',
      scheduleType: 'fullDays',
      period: null,
      periodStart: null,
      periodEnd: null,
      nextPeriod: '1',
      message: "School hasn't started yet!",
      date: dateStr,
      time: timeStr
    };
  }

  if (currentSec > schoolEnd) {
    return {
      hasSchool: true,
      status: 'ended',
      scheduleType: 'fullDays',
      period: null,
      periodStart: null,
      periodEnd: null,
      nextPeriod: null,
      message: 'No school for the rest of the day!',
      date: dateStr,
      time: timeStr
    };
  }

  for (let i = 0; i < FULL_DAY_PERIODS.length; i++) {
    const p = FULL_DAY_PERIODS[i];
    const pStart = timeToSec(p.start);
    const pEnd = timeToSec(p.end);

    if (currentSec >= pStart && currentSec <= pEnd) {
      return {
        hasSchool: true,
        status: 'in_session',
        scheduleType: 'fullDays',
        period: p.period,
        periodStart: p.start,
        periodEnd: p.end,
        nextPeriod: i < FULL_DAY_PERIODS.length - 1 ? FULL_DAY_PERIODS[i + 1].period : null,
        message: `Current: Period ${p.period}`,
        date: dateStr,
        time: timeStr
      };
    }

    if (i < FULL_DAY_PERIODS.length - 1) {
      const nextP = FULL_DAY_PERIODS[i + 1];
      const nextStart = timeToSec(nextP.start);
      if (currentSec > pEnd && currentSec < nextStart) {
        return {
          hasSchool: true,
          status: 'in_session',
          scheduleType: 'fullDays',
          period: p.period,
          periodStart: p.start,
          periodEnd: nextP.start,
          nextPeriod: nextP.period,
          message: `Passing period to Period ${nextP.period}`,
          date: dateStr,
          time: timeStr
        };
      }
    }
  }

  return {
    hasSchool: true,
    status: 'in_session',
    scheduleType: 'fullDays',
    period: '1',
    periodStart: '08:00:00',
    periodEnd: '08:43:00',
    nextPeriod: null,
    message: 'Current: Period 1',
    date: dateStr,
    time: timeStr
  };
}

export async function fetchScheduleStatus(): Promise<ScheduleStatus> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${SCHEDULE_API_BASE}/api/schedule/current`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // API server offline or unreachable; fall back to local calculation
  }
  return calculateLocalScheduleStatus();
}

export async function fetchActiveCafeCode(): Promise<{ code: string | null; period: string | null; isValid: boolean }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${SCHEDULE_API_BASE}/api/code/current`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  // Fallback generation matching microservice algorithm
  const status = calculateLocalScheduleStatus();
  if (status.status !== 'in_session' || !status.period) {
    return { code: null, period: null, isValid: false };
  }

  // Simple deterministic client fallback code
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let hash = 0;
  const str = `BCA-UPPER-CAFE-${status.date}-${status.period}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[(hash + i * 7) % chars.length];
  }
  return { code, period: status.period, isValid: true };
}

export async function verifyCafeCodeApi(inputCode: string): Promise<{ valid: boolean; period: string | null; message: string }> {
  if (!inputCode) return { valid: false, period: null, message: 'Please enter a code' };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${SCHEDULE_API_BASE}/api/code/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: inputCode }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  const active = await fetchActiveCafeCode();
  if (!active.isValid || !active.code) {
    return { valid: false, period: null, message: 'No active Cafe Code at this time' };
  }

  const normalized = inputCode.trim().toUpperCase();
  if (normalized === active.code) {
    return { valid: true, period: active.period, message: `Code verified for Period ${active.period}` };
  }

  return { valid: false, period: active.period, message: 'Incorrect Cafe Code. Please check the code in Upper Cafe.' };
}
