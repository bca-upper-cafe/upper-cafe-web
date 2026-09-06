import { TeacherAbsence, CheckInRecord, CafeStats, CheckInScenario } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Fallback in-memory / local storage when standalone
let fallbackAbsences: TeacherAbsence[] = [
  {
    id: 'abs-1',
    teacherName: 'Dr. Robert DeFalco',
    department: 'Science & Physics',
    date: new Date().toISOString().split('T')[0],
    periods: [2, 3, 7],
    room: 'Room 234',
    notes: 'AP Physics C - report to Upper Cafe for independent study hall',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'abs-2',
    teacherName: 'Ms. Elena Respass',
    department: 'Mathematics',
    date: new Date().toISOString().split('T')[0],
    periods: [4, 5],
    room: 'Room 118',
    notes: 'Pre-Calculus Honors - coverage in Upper Cafe',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'abs-3',
    teacherName: 'Mr. David Zhang',
    department: 'Computer Science & ATCS',
    date: new Date().toISOString().split('T')[0],
    periods: [1, 8, 9],
    room: 'Room 160',
    notes: 'Data Structures - working on lab projects in Upper Cafe',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'abs-4',
    teacherName: 'Dr. Janice Kaplan',
    department: 'Humanities & History',
    date: new Date().toISOString().split('T')[0],
    periods: [6, 7],
    room: 'Room 205',
    notes: 'US History II - check in at Upper Cafe desk',
    createdAt: new Date().toISOString(),
  },
];

let fallbackCheckins: CheckInRecord[] = [
  {
    id: 'chk-101',
    studentName: 'Aidan Chen',
    studentEmail: 'aidche26@bergen.org',
    studentId: '260492',
    academy: 'ATCS',
    grade: '11',
    period: 4,
    scenario: 'TEACHER_ABSENT',
    absentTeacherId: 'abs-2',
    absentTeacherName: 'Ms. Elena Respass',
    tableNumber: 'Table 4',
    checkInTime: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
    status: 'ACTIVE',
  },
  {
    id: 'chk-102',
    studentName: 'Maya Patel',
    studentEmail: 'maypat25@bergen.org',
    studentId: '250118',
    academy: 'AAST',
    grade: '12',
    period: 4,
    scenario: 'DEFAULT_STUDY_HALL',
    tableNumber: 'Table 9',
    checkInTime: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    status: 'ACTIVE',
  },
];

export async function fetchAbsences(period?: number): Promise<TeacherAbsence[]> {
  try {
    const url = new URL(`${API_BASE}/absences`);
    if (period) url.searchParams.set('period', period.toString());
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) throw new Error('API error');
    const json = await res.json();
    return json.data;
  } catch (_e) {
    if (period) {
      return fallbackAbsences.filter((a) => a.periods.includes(period));
    }
    return fallbackAbsences;
  }
}

export async function createAbsence(data: Omit<TeacherAbsence, 'id' | 'createdAt'>): Promise<TeacherAbsence> {
  try {
    const res = await fetch(`${API_BASE}/absences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('API error');
    const json = await res.json();
    return json.data;
  } catch (_e) {
    const newRecord: TeacherAbsence = {
      ...data,
      id: `abs-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    fallbackAbsences.unshift(newRecord);
    return newRecord;
  }
}

export async function deleteAbsence(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/absences/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('API error');
    return true;
  } catch (_e) {
    fallbackAbsences = fallbackAbsences.filter((a) => a.id !== id);
    return true;
  }
}

export async function importGoogleDocAbsences(rawText: string, autoCommit: boolean = true) {
  try {
    const res = await fetch(`${API_BASE}/absences/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText, autoCommit }),
    });
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch (_e) {
    // Client-side parser fallback
    const lines = rawText.split('\n').filter((l) => l.trim().length > 0);
    const parsed = lines.map((line, idx) => ({
      teacherName: line.split(/[-–:]/)[0]?.trim() || `Teacher ${idx + 1}`,
      department: 'General',
      periods: [3, 4],
      notes: line,
      confidence: 'MEDIUM' as const,
    }));
    return {
      success: true,
      parsedCount: parsed.length,
      entries: parsed,
    };
  }
}

export async function fetchCheckins(status?: 'ACTIVE' | 'COMPLETED', period?: number): Promise<CheckInRecord[]> {
  try {
    const url = new URL(`${API_BASE}/checkins`);
    if (status) url.searchParams.set('status', status);
    if (period) url.searchParams.set('period', period.toString());
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) throw new Error('API error');
    const json = await res.json();
    return json.data;
  } catch (_e) {
    let list = fallbackCheckins;
    if (status) list = list.filter((c) => c.status === status);
    if (period) list = list.filter((c) => c.period === period);
    return list;
  }
}

export async function createCheckIn(data: {
  studentName: string;
  studentEmail?: string;
  studentId?: string;
  academy?: string;
  grade?: string;
  period: number;
  scenario: CheckInScenario;
  absentTeacherId?: string;
  absentTeacherName?: string;
  tableNumber?: string;
}): Promise<CheckInRecord> {
  try {
    const res = await fetch(`${API_BASE}/checkins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('API error');
    const json = await res.json();
    return json.data;
  } catch (_e) {
    const record: CheckInRecord = {
      id: `chk-${Date.now()}`,
      studentName: data.studentName,
      studentEmail: data.studentEmail || `${data.studentName.toLowerCase().replace(/\s+/g, '')}@bergen.org`,
      studentId: data.studentId || '260000',
      academy: (data.academy as any) || 'ATCS',
      grade: (data.grade as any) || '11',
      period: data.period,
      scenario: data.scenario,
      absentTeacherId: data.absentTeacherId,
      absentTeacherName: data.absentTeacherName,
      tableNumber: data.tableNumber || `Table ${Math.floor(1 + Math.random() * 12)}`,
      checkInTime: new Date().toISOString(),
      status: 'ACTIVE',
    };
    fallbackCheckins.unshift(record);
    return record;
  }
}

export async function checkOutStudent(id: string): Promise<CheckInRecord | null> {
  try {
    const res = await fetch(`${API_BASE}/checkins/${id}/checkout`, { method: 'POST' });
    if (!res.ok) throw new Error('API error');
    const json = await res.json();
    return json.data;
  } catch (_e) {
    const record = fallbackCheckins.find((c) => c.id === id);
    if (record) {
      record.status = 'COMPLETED';
      record.checkOutTime = new Date().toISOString();
    }
    return record || null;
  }
}

export async function checkOutAll(): Promise<number> {
  try {
    const res = await fetch(`${API_BASE}/checkins/checkout-all`, { method: 'POST' });
    if (!res.ok) throw new Error('API error');
    const json = await res.json();
    return json.count;
  } catch (_e) {
    let count = 0;
    fallbackCheckins.forEach((c) => {
      if (c.status === 'ACTIVE') {
        c.status = 'COMPLETED';
        c.checkOutTime = new Date().toISOString();
        count++;
      }
    });
    return count;
  }
}

export async function fetchStats(): Promise<CafeStats> {
  try {
    const res = await fetch(`${API_BASE}/stats`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API error');
    const json = await res.json();
    return json.data;
  } catch (_e) {
    const active = fallbackCheckins.filter((c) => c.status === 'ACTIVE').length;
    return {
      currentPeriod: 4,
      activeStudentsCount: active,
      maxCapacity: 120,
      capacityPercentage: Math.round((active / 120) * 100),
      todayAbsencesCount: fallbackAbsences.length,
      defaultStudyHallCount: fallbackCheckins.filter((c) => c.scenario === 'DEFAULT_STUDY_HALL' && c.status === 'ACTIVE').length,
      teacherAbsentCount: fallbackCheckins.filter((c) => c.scenario === 'TEACHER_ABSENT' && c.status === 'ACTIVE').length,
    };
  }
}
