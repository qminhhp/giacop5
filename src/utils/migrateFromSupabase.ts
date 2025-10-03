import { supabase } from '@/lib/supabase';
import { MemberScore } from '@/types';

const STORAGE_KEY = 'church_member_scores';

/**
 * Migrate all scores from Supabase to localStorage
 * Call this function once to download all existing data
 */
export const migrateScoresFromSupabase = async (): Promise<void> => {
  try {
    console.log('Starting migration from Supabase to localStorage...');

    // Fetch all scores from Supabase
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching from Supabase:', error);
      return;
    }

    if (!data || data.length === 0) {
      console.log('No data found in Supabase');
      return;
    }

    // Convert to MemberScore format
    const scores: MemberScore[] = data.map(score => ({
      memberId: score.member_id,
      date: score.date,
      activities: score.activities,
      totalPoints: score.total_points
    }));

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
      console.log(`✅ Successfully migrated ${scores.length} records to localStorage`);
      console.log(`Total members with data: ${new Set(scores.map(s => s.memberId)).size}`);
    }
  } catch (error) {
    console.error('Migration failed:', error);
  }
};

/**
 * Check if localStorage has data
 */
export const hasLocalData = (): boolean => {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored !== null && stored !== '[]';
};

/**
 * Get localStorage data count
 */
export const getLocalDataCount = (): number => {
  if (typeof window === 'undefined') return 0;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return 0;
  try {
    const data = JSON.parse(stored);
    return Array.isArray(data) ? data.length : 0;
  } catch {
    return 0;
  }
};