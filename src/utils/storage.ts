import { MemberScore } from '@/types';
import { supabase } from '@/lib/supabase';

// Keep localStorage as fallback for offline functionality
const STORAGE_KEY = 'church_member_scores';

export const getScores = async (): Promise<MemberScore[]> => {
  try {
    const { data, error } = await supabase
      .from('scores')
      .select('*');
    
    if (error) throw error;
    
    return data.map(score => ({
      memberId: score.member_id,
      date: score.date,
      activities: score.activities,
      totalPoints: score.total_points
    }));
  } catch (error) {
    console.error('Error fetching scores from Supabase:', error);
    // Fallback to localStorage
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }
};

export const saveScore = async (score: MemberScore): Promise<void> => {
  try {
    const { error } = await supabase
      .from('scores')
      .upsert({
        member_id: score.memberId,
        date: score.date,
        activities: score.activities,
        total_points: score.totalPoints
      }, {
        onConflict: 'member_id,date'
      });
    
    if (error) throw error;
    
    // Also save to localStorage as backup
    if (typeof window !== 'undefined') {
      const scores = await getLocalScores();
      const existingIndex = scores.findIndex(
        s => s.memberId === score.memberId && s.date === score.date
      );
      
      if (existingIndex >= 0) {
        scores[existingIndex] = score;
      } else {
        scores.push(score);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
    }
  } catch (error) {
    console.error('Error saving score to Supabase:', error);
    // Fallback to localStorage only
    if (typeof window === 'undefined') return;
    const scores = await getLocalScores();
    const existingIndex = scores.findIndex(
      s => s.memberId === score.memberId && s.date === score.date
    );
    
    if (existingIndex >= 0) {
      scores[existingIndex] = score;
    } else {
      scores.push(score);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  }
};

export const getMemberScore = async (memberId: string, date: string): Promise<MemberScore | null> => {
  // Use localStorage only for now (to avoid 406 errors from Supabase)
  const scores = await getLocalScores();
  return scores.find(s => s.memberId === memberId && s.date === date) || null;
};


export const getMemberActivities = async (memberId: string): Promise<MemberScore[]> => {
  // Use localStorage only for now (to avoid 406 errors from Supabase)
  const scores = await getLocalScores();
  return scores
    .filter(s => s.memberId === memberId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getMemberTotalScore = async (memberId: string, month?: string): Promise<number> => {
  // Use localStorage only for now (to avoid 406 errors from Supabase)
  const scores = await getLocalScores();
  return scores
    .filter(s => {
      if (s.memberId !== memberId) return false;
      if (month) {
        const scoreMonth = s.date.substring(0, 7);
        return scoreMonth === month;
      }
      return true;
    })
    .reduce((total, score) => total + score.totalPoints, 0);
};

// Helper function for localStorage fallback
const getLocalScores = (): MemberScore[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};