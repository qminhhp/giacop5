import { DaySchedule, MemberWorkSchedule } from '@/types/workSchedule';
import {
  getMemberDayScheduleSupabase,
  saveMemberDayScheduleSupabase,
  getWeeklyScheduleSupabase,
  getMemberSchedulesForWeekSupabase
} from './workScheduleSupabase';

const WORK_SCHEDULE_KEY = 'church_work_schedules';

// Get all work schedules from localStorage
const getAllSchedules = (): MemberWorkSchedule[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(WORK_SCHEDULE_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Save all schedules to localStorage
const saveAllSchedules = (schedules: MemberWorkSchedule[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(WORK_SCHEDULE_KEY, JSON.stringify(schedules));
};

// Get work schedule for a specific member and date
export const getMemberDaySchedule = async (
  memberId: string,
  date: string
): Promise<DaySchedule | null> => {
  // Use localStorage only for now
  const allSchedules = getAllSchedules();
  const memberSchedule = allSchedules.find(s => s.memberId === memberId);
  const localSchedule = memberSchedule?.schedules.find(s => s.date === date) || null;

  return localSchedule;
};

// Get all schedules for a member within a date range
export const getMemberSchedulesForWeek = async (
  memberId: string,
  startDate: string,
  endDate: string
): Promise<DaySchedule[]> => {
  const allSchedules = getAllSchedules();
  const memberSchedule = allSchedules.find(s => s.memberId === memberId);

  if (!memberSchedule) return [];

  return memberSchedule.schedules.filter(s =>
    s.date >= startDate && s.date <= endDate
  );
};

// Save a day schedule for a member
export const saveMemberDaySchedule = async (
  memberId: string,
  schedule: DaySchedule
): Promise<void> => {
  // Save to localStorage immediately
  const allSchedules = getAllSchedules();
  let memberSchedule = allSchedules.find(s => s.memberId === memberId);

  if (!memberSchedule) {
    memberSchedule = {
      memberId,
      schedules: []
    };
    allSchedules.push(memberSchedule);
  }

  // Update or add the day schedule
  const existingIndex = memberSchedule.schedules.findIndex(s => s.date === schedule.date);

  if (existingIndex >= 0) {
    // Update existing schedule
    memberSchedule.schedules[existingIndex] = schedule;
  } else {
    // Add new schedule
    memberSchedule.schedules.push(schedule);
  }

  // Sort schedules by date
  memberSchedule.schedules.sort((a, b) => a.date.localeCompare(b.date));

  saveAllSchedules(allSchedules);
};

// Get weekly schedule for a member (Sunday to Saturday)
export const getWeeklySchedule = async (
  memberId: string,
  anyDateInWeek: string
): Promise<DaySchedule[]> => {
  // Calculate date range
  const date = new Date(anyDateInWeek);
  const dayOfWeek = date.getDay();

  // Calculate Sunday (start of week)
  const sunday = new Date(date);
  sunday.setDate(date.getDate() - dayOfWeek);

  // Calculate Saturday (end of week)
  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);

  const startDate = sunday.toISOString().split('T')[0];
  const endDate = saturday.toISOString().split('T')[0];

  // Get from localStorage
  return getMemberSchedulesForWeek(memberId, startDate, endDate);
};