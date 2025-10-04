import { MemberGoal, ActivityProgress, GoalProgress } from '@/types/goal';
import { SCORING_ACTIVITIES } from '@/types';
import { getScores } from '@/utils/storage';
import { MemberScore } from '@/types';

// Cache for scores to avoid loading multiple times
let scoresCache: MemberScore[] | null = null;
let scoresCacheTime: number = 0;
const CACHE_DURATION = 5000; // 5 seconds cache

// Get scores with caching
const getCachedScores = async (): Promise<MemberScore[]> => {
  const now = Date.now();
  if (scoresCache && (now - scoresCacheTime) < CACHE_DURATION) {
    return scoresCache;
  }

  scoresCache = await getScores();
  scoresCacheTime = now;
  return scoresCache;
};

// Calculate activity counts for a member in a given month
export const calculateActivityProgress = async (
  memberId: string,
  month: string,
  goal: MemberGoal
): Promise<GoalProgress> => {
  // Get all scores for the member in the month (with caching)
  const allScores = await getCachedScores();
  const monthScores = allScores.filter(
    score => score.memberId === memberId && score.date.startsWith(month)
  );

  // Calculate counts for each activity
  const activityCounts: { [key: string]: number } = {};

  monthScores.forEach(score => {
    Object.keys(score.activities).forEach(activityId => {
      const value = score.activities[activityId];
      const activity = SCORING_ACTIVITIES.find(a => a.id === activityId);

      if (!activity) return;

      if (!activityCounts[activityId]) {
        activityCounts[activityId] = 0;
      }

      // Count based on activity type
      if (activity.type === 'checkbox') {
        if (value === true) {
          activityCounts[activityId]++;
        }
      } else if (activity.type === 'checkbox_double') {
        if (typeof value === 'object' && value !== null) {
          const dualValue = value as { morning: boolean; evening: boolean };
          if (dualValue.morning) activityCounts[activityId]++;
          if (dualValue.evening) activityCounts[activityId]++;
        } else if (value === true) {
          activityCounts[activityId] += 2;
        }
      } else if (activity.type === 'number') {
        if (typeof value === 'number') {
          activityCounts[activityId] += value;
        }
      } else if (activity.type === 'radio') {
        if (typeof value === 'number' && value > 0) {
          activityCounts[activityId]++;
        }
      }
    });
  });

  // Build activity progresses
  const activityProgresses: ActivityProgress[] = goal.activityTargets.map(target => {
    const activity = SCORING_ACTIVITIES.find(a => a.id === target.activityId);
    const currentCount = activityCounts[target.activityId] || 0;
    const progressPercentage = Math.min(100, Math.round((currentCount / target.targetCount) * 100));

    return {
      activityId: target.activityId,
      activityName: activity?.name || target.activityId,
      targetCount: target.targetCount,
      currentCount,
      progressPercentage,
      remainingCount: Math.max(0, target.targetCount - currentCount),
      isCompleted: currentCount >= target.targetCount
    };
  });

  const completedActivities = activityProgresses.filter(ap => ap.isCompleted).length;
  const totalActivitiesWithGoals = goal.activityTargets.length;
  const overallProgressPercentage = totalActivitiesWithGoals > 0
    ? Math.round((completedActivities / totalActivitiesWithGoals) * 100)
    : 0;

  return {
    memberId,
    memberName: '', // Will be filled by caller
    month,
    activityProgresses,
    totalActivitiesWithGoals,
    completedActivities,
    overallProgressPercentage
  };
};

// Clear the scores cache (useful when scores are updated)
export const clearScoresCache = (): void => {
  scoresCache = null;
  scoresCacheTime = 0;
};
