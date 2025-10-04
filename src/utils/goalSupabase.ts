import { MemberGoal, ActivityTarget } from '@/types/goal';
import { supabase } from '@/lib/supabase';

// Get goal for a specific member and month
export const getMemberGoalSupabase = async (
  memberId: string,
  month: string
): Promise<MemberGoal | null> => {
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('member_id', memberId)
      .eq('month', month)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw error;
    }

    if (!data) return null;

    return {
      memberId: data.member_id,
      month: data.month,
      activityTargets: data.activity_targets || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Error fetching goal from Supabase:', error);
    return null;
  }
};

// Get all goals for a specific member
export const getMemberGoalsSupabase = async (
  memberId: string
): Promise<MemberGoal[]> => {
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('member_id', memberId)
      .order('month', { ascending: false });

    if (error) throw error;

    return (data || []).map(goal => ({
      memberId: goal.member_id,
      month: goal.month,
      activityTargets: goal.activity_targets || [],
      createdAt: goal.created_at,
      updatedAt: goal.updated_at
    }));
  } catch (error) {
    console.error('Error fetching member goals from Supabase:', error);
    return [];
  }
};

// Get all goals for a specific month (all members)
export const getMonthGoalsSupabase = async (
  month: string
): Promise<MemberGoal[]> => {
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('month', month);

    if (error) throw error;

    return (data || []).map(goal => ({
      memberId: goal.member_id,
      month: goal.month,
      activityTargets: goal.activity_targets || [],
      createdAt: goal.created_at,
      updatedAt: goal.updated_at
    }));
  } catch (error) {
    console.error('Error fetching month goals from Supabase:', error);
    return [];
  }
};

// Save or update a goal
export const saveMemberGoalSupabase = async (
  goal: MemberGoal
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('goals')
      .upsert({
        member_id: goal.memberId,
        month: goal.month,
        activity_targets: goal.activityTargets,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'member_id,month'
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error saving goal to Supabase:', error);
    throw error;
  }
};

// Delete a goal
export const deleteMemberGoalSupabase = async (
  memberId: string,
  month: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('member_id', memberId)
      .eq('month', month);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting goal from Supabase:', error);
    throw error;
  }
};
