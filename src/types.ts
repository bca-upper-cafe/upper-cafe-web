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

export type CheckInScenario = 'DEFAULT_STUDY_HALL' | 'TEACHER_ABSENT';

export interface TeacherAbsence {
  id: string;
  teacherName: string;
  department: string;
  date: string;
  periods: number[];
  room?: string;
  notes?: string;
  createdAt: string;
}

export interface CheckInRecord {
  id: string;
  studentName: string;
  studentEmail: string;
  studentId: string;
  academy: Academy | string;
  grade: '9' | '10' | '11' | '12';
  period: number;
  scenario: CheckInScenario;
  absentTeacherId?: string;
  absentTeacherName?: string;
  tableNumber?: string;
  checkInTime: string;
  checkOutTime?: string;
  status: 'ACTIVE' | 'COMPLETED';
}

export interface CafeStats {
  currentPeriod: number;
  activeStudentsCount: number;
  maxCapacity: number;
  capacityPercentage: number;
  todayAbsencesCount: number;
  defaultStudyHallCount: number;
  teacherAbsentCount: number;
}
