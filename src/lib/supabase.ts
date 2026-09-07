import { createClient } from '@supabase/supabase-js';
import { CheckInRecord, TeacherAbsence, UserProfile } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================
// MOCK & FALLBACK DATA STORE FOR DEV/TESTING
// ==========================================

const INITIAL_ABSENCES: TeacherAbsence[] = [
  {
    id: 't-1',
    pronoun: 'Dr.',
    firstName: 'Robert',
    lastName: 'Degan',
    department: 'Mathematics',
    date: new Date().toISOString().split('T')[0],
    periods: ['1', 'IGS', '2', '3', '4', '5', '6', '7', '8', '9'],
    isAllDay: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 't-2',
    pronoun: 'Mr.',
    firstName: 'Scott',
    lastName: 'Langan',
    department: 'Science',
    date: new Date().toISOString().split('T')[0],
    periods: ['3', '4', '5'],
    isAllDay: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 't-3',
    pronoun: 'Ms.',
    firstName: 'Danielle',
    lastName: 'Esposito',
    department: 'Humanities',
    date: new Date().toISOString().split('T')[0],
    periods: ['4', '5', '6'],
    isAllDay: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 't-4',
    pronoun: 'Mrs.',
    firstName: 'Kathleen',
    lastName: 'Giel',
    department: 'World Languages',
    date: new Date().toISOString().split('T')[0],
    periods: ['1', 'IGS', '2', '3', '4', '5', '6', '7', '8', '9'],
    isAllDay: true,
    createdAt: new Date().toISOString()
  }
];

const INITIAL_CHECKINS: CheckInRecord[] = [
  {
    id: 'rec-1',
    studentName: 'Kabir Sekhon',
    studentEmail: 'kabsek30@bergen.org',
    period: '3',
    reason: 'TEACHER_ABSENT',
    teacherName: 'Dr. Robert Degan',
    teacherId: 't-1',
    checkInTime: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    checkOutTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    status: 'CHECKED_OUT'
  },
  {
    id: 'rec-2',
    studentName: 'Alex Chen',
    studentEmail: 'aleche27@bergen.org',
    period: '4',
    reason: 'STUDY_HALL',
    checkInTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    status: 'ACTIVE'
  }
];

class LocalDataStore {
  private absences: TeacherAbsence[] = INITIAL_ABSENCES;
  private checkIns: CheckInRecord[] = INITIAL_CHECKINS;
  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      const savedAbsences = localStorage.getItem('bca_absences');
      if (savedAbsences) {
        try { this.absences = JSON.parse(savedAbsences); } catch {}
      }
      const savedCheckins = localStorage.getItem('bca_checkins');
      if (savedCheckins) {
        try { this.checkIns = JSON.parse(savedCheckins); } catch {}
      }
    }
  }

  private persist() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bca_absences', JSON.stringify(this.absences));
      localStorage.setItem('bca_checkins', JSON.stringify(this.checkIns));
    }
    this.listeners.forEach(cb => cb());
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Teacher Absences
  getAbsences(): TeacherAbsence[] {
    return [...this.absences];
  }

  addAbsence(absence: Omit<TeacherAbsence, 'id' | 'createdAt'>): TeacherAbsence {
    const newRecord: TeacherAbsence = {
      ...absence,
      id: `t-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.absences.unshift(newRecord);
    this.persist();
    return newRecord;
  }

  deleteAbsence(id: string): void {
    this.absences = this.absences.filter(a => a.id !== id);
    this.persist();
  }

  // Check Ins
  getCheckIns(): CheckInRecord[] {
    return [...this.checkIns];
  }

  getActiveCheckIn(studentEmail: string): CheckInRecord | undefined {
    return this.checkIns.find(c => c.studentEmail.toLowerCase() === studentEmail.toLowerCase() && c.status === 'ACTIVE');
  }

  createCheckIn(record: Omit<CheckInRecord, 'id' | 'checkInTime' | 'status'>): CheckInRecord {
    // Check out any existing active record first
    this.checkIns.forEach(c => {
      if (c.studentEmail.toLowerCase() === record.studentEmail.toLowerCase() && c.status === 'ACTIVE') {
        c.status = 'CHECKED_OUT';
        c.checkOutTime = new Date().toISOString();
      }
    });

    const newRecord: CheckInRecord = {
      ...record,
      id: `rec-${Date.now()}`,
      checkInTime: new Date().toISOString(),
      status: 'ACTIVE'
    };
    this.checkIns.unshift(newRecord);
    this.persist();
    return newRecord;
  }

  checkOut(recordId: string): void {
    const rec = this.checkIns.find(c => c.id === recordId);
    if (rec && rec.status === 'ACTIVE') {
      rec.status = 'CHECKED_OUT';
      rec.checkOutTime = new Date().toISOString();
      this.persist();
    }
  }

  checkOutStudent(studentEmail: string): void {
    let updated = false;
    this.checkIns.forEach(c => {
      if (c.studentEmail.toLowerCase() === studentEmail.toLowerCase() && c.status === 'ACTIVE') {
        c.status = 'CHECKED_OUT';
        c.checkOutTime = new Date().toISOString();
        updated = true;
      }
    });
    if (updated) this.persist();
  }
}

export const localStore = new LocalDataStore();
