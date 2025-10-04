import { MemberGoal } from '@/types/goal';
import {
  getMemberGoalSupabase,
  getMemberGoalsSupabase,
  getMonthGoalsSupabase,
  saveMemberGoalSupabase,
  deleteMemberGoalSupabase
} from './goalSupabase';

const GOALS_KEY = 'church_member_goals';

// Get all goals from localStorage
const getAllGoalsLocal = (): MemberGoal[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(GOALS_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Save all goals to localStorage
const saveAllGoalsLocal = (goals: MemberGoal[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
};

// Get goal for a specific member and month
export const getMemberGoal = async (
  memberId: string,
  month: string
): Promise<MemberGoal | null> => {
  // Try Supabase first
  try {
    const supabaseGoal = await getMemberGoalSupabase(memberId, month);
    if (supabaseGoal) {
      // Update localStorage with Supabase data
      const allGoals = getAllGoalsLocal();
      const existingIndex = allGoals.findIndex(
        g => g.memberId === memberId && g.month === month
      );

      if (existingIndex >= 0) {
        allGoals[existingIndex] = supabaseGoal;
      } else {
        allGoals.push(supabaseGoal);
      }

      saveAllGoalsLocal(allGoals);
      return supabaseGoal;
    }
  } catch (error) {
    console.log('Supabase fetch failed, using localStorage');
  }

  // Fallback to localStorage
  const allGoals = getAllGoalsLocal();
  return allGoals.find(g => g.memberId === memberId && g.month === month) || null;
};

// Get all goals for a specific member
export const getMemberGoals = async (
  memberId: string
): Promise<MemberGoal[]> => {
  // Try Supabase first
  try {
    const supabaseGoals = await getMemberGoalsSupabase(memberId);
    if (supabaseGoals.length > 0) {
      // Merge with localStorage
      const allGoals = getAllGoalsLocal();
      supabaseGoals.forEach(supabaseGoal => {
        const existingIndex = allGoals.findIndex(
          g => g.memberId === supabaseGoal.memberId && g.month === supabaseGoal.month
        );
        if (existingIndex >= 0) {
          allGoals[existingIndex] = supabaseGoal;
        } else {
          allGoals.push(supabaseGoal);
        }
      });
      saveAllGoalsLocal(allGoals);
      return supabaseGoals;
    }
  } catch (error) {
    console.log('Supabase fetch failed, using localStorage');
  }

  // Fallback to localStorage
  const allGoals = getAllGoalsLocal();
  return allGoals.filter(g => g.memberId === memberId);
};

// Get all goals for a specific month (all members)
export const getMonthGoals = async (
  month: string
): Promise<MemberGoal[]> => {
  // Try Supabase first
  try {
    const supabaseGoals = await getMonthGoalsSupabase(month);
    if (supabaseGoals.length > 0) {
      // Merge with localStorage
      const allGoals = getAllGoalsLocal();
      supabaseGoals.forEach(supabaseGoal => {
        const existingIndex = allGoals.findIndex(
          g => g.memberId === supabaseGoal.memberId && g.month === supabaseGoal.month
        );
        if (existingIndex >= 0) {
          allGoals[existingIndex] = supabaseGoal;
        } else {
          allGoals.push(supabaseGoal);
        }
      });
      saveAllGoalsLocal(allGoals);
      return supabaseGoals;
    }
  } catch (error) {
    console.log('Supabase fetch failed, using localStorage');
  }

  // Fallback to localStorage
  const allGoals = getAllGoalsLocal();
  return allGoals.filter(g => g.month === month);
};

// Save or update a goal
export const saveMemberGoal = async (
  goal: MemberGoal
): Promise<void> => {
  // Save to localStorage immediately
  const allGoals = getAllGoalsLocal();
  const existingIndex = allGoals.findIndex(
    g => g.memberId === goal.memberId && g.month === goal.month
  );

  const goalWithTimestamp = {
    ...goal,
    updatedAt: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    allGoals[existingIndex] = goalWithTimestamp;
  } else {
    allGoals.push({
      ...goalWithTimestamp,
      createdAt: new Date().toISOString()
    });
  }

  saveAllGoalsLocal(allGoals);

  // Also save to Supabase
  try {
    await saveMemberGoalSupabase(goalWithTimestamp);
  } catch (error) {
    console.error('Failed to save goal to Supabase:', error);
    // Continue even if Supabase fails - localStorage is saved
  }
};

// Delete a goal
export const deleteMemberGoal = async (
  memberId: string,
  month: string
): Promise<void> => {
  // Remove from localStorage
  const allGoals = getAllGoalsLocal();
  const filtered = allGoals.filter(
    g => !(g.memberId === memberId && g.month === month)
  );
  saveAllGoalsLocal(filtered);

  // Also delete from Supabase
  try {
    await deleteMemberGoalSupabase(memberId, month);
  } catch (error) {
    console.error('Failed to delete goal from Supabase:', error);
  }
};
