export type Academy =
  | 'AAST'
  | 'AEDT'
  | 'AMST'
  | 'ABF'
  | 'ATCS'
  | 'ACAHA'
  | 'AVPA-M'
  | 'AVPA-T'
  | 'AVPA-V';

export type UserRole = 'student' | 'staff';

export interface UserProfile {
  id: string;
  email: string;
  name: string; // From Outlook, immutable
  role: UserRole;
}

export type TeacherPronoun = 'Mr.' | 'Ms.' | 'Mrs.' | 'Dr.';

export interface TeacherAbsence {
  id: string;
  pronoun: TeacherPronoun;
  firstName: string;
  lastName: string;
  department?: string;
  date: string;
  periods: string[]; // e.g. ['1', 'IGS', '2', ...] or ['ALL_DAY']
  isAllDay: boolean;
  notes?: string;
  createdAt: string;
}

export type CheckInReason = 'TEACHER_ABSENT' | 'STUDY_HALL';

export interface CheckInRecord {
  id: string;
  studentName: string; // Permanent Outlook name
  studentEmail: string;
  period: string;      // '1'-'9' or 'IGS'
  reason: CheckInReason;
  teacherName?: string;
  teacherId?: string;
  checkInTime: string;  // ISO timestamp
  checkOutTime?: string; // ISO timestamp when checked out
  status: 'ACTIVE' | 'CHECKED_OUT';
}

export interface ScheduleStatus {
  hasSchool: boolean;
  status: 'no_school' | 'not_started' | 'in_session' | 'ended';
  scheduleType: string | null;
  period: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  nextPeriod: string | null;
  message: string;
  date: string;
  time: string;
}
