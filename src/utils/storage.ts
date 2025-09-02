import { MemberScore } from '@/types';

const STORAGE_KEY = 'church_member_scores';

export const getScores = (): MemberScore[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveScore = (score: MemberScore): void => {
  if (typeof window === 'undefined') return;
  const scores = getScores();
  const existingIndex = scores.findIndex(
    s => s.memberId === score.memberId && s.date === score.date
  );
  
  if (existingIndex >= 0) {
    scores[existingIndex] = score;
  } else {
    scores.push(score);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
};

export const getMemberScore = (memberId: string, date: string): MemberScore | null => {
  const scores = getScores();
  return scores.find(s => s.memberId === memberId && s.date === date) || null;
};

export const getMemberTotalScore = (memberId: string, month?: string): number => {
  const scores = getScores();
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

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};