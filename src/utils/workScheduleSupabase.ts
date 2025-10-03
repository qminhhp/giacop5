import { DaySchedule } from '@/types/workSchedule';
import { supabase } from '@/lib/supabase';

// Get work schedule for a specific member and date
export const getMemberDayScheduleSupabase = async (
  memberId: string,
  date: string
): Promise<DaySchedule | null> => {
  try {
    const { data, error } = await supabase
      .from('work_schedules')
      .select('*')
      .eq('member_id', memberId)
      .eq('date', date)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw error;
    }

    if (!data) return null;

    return {
      date: data.date,
      morning: data.morning || undefined,
      afternoon: data.afternoon || undefined,
      evening: data.evening || undefined
    };
  } catch (error) {
    console.error('Error fetching work schedule from Supabase:', error);
    return null;
  }
};

// Get all schedules for a member within a date range
export const getMemberSchedulesForWeekSupabase = async (
  memberId: string,
  startDate: string,
  endDate: string
): Promise<DaySchedule[]> => {
  try {
    const { data, error } = await supabase
      .from('work_schedules')
      .select('*')
      .eq('member_id', memberId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) throw error;

    return (data || []).map(schedule => ({
      date: schedule.date,
      morning: schedule.morning || undefined,
      afternoon: schedule.afternoon || undefined,
      evening: schedule.evening || undefined
    }));
  } catch (error) {
    console.error('Error fetching weekly schedules from Supabase:', error);
    return [];
  }
};

// Save a day schedule for a member
export const saveMemberDayScheduleSupabase = async (
  memberId: string,
  schedule: DaySchedule
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('work_schedules')
      .upsert({
        member_id: memberId,
        date: schedule.date,
        morning: schedule.morning || null,
        afternoon: schedule.afternoon || null,
        evening: schedule.evening || null
      }, {
        onConflict: 'member_id,date'
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error saving work schedule to Supabase:', error);
    throw error;
  }
};

// Get weekly schedule for a member (Sunday to Saturday)
export const getWeeklyScheduleSupabase = async (
  memberId: string,
  anyDateInWeek: string
): Promise<DaySchedule[]> => {
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

  return getMemberSchedulesForWeekSupabase(memberId, startDate, endDate);
};