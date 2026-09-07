import { TeacherAbsence, CheckInRecord } from '../types';
import { localStore } from './supabase';
import { fetchScheduleStatus } from './schedule';

export async function getTeacherAbsences(): Promise<TeacherAbsence[]> {
  return localStore.getAbsences();
}

export async function getCheckInRecords(): Promise<CheckInRecord[]> {
  return localStore.getCheckIns();
}

export async function getSchedule() {
  return fetchScheduleStatus();
}
