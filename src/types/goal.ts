// Type definitions for member monthly goals

// Activity target for a specific activity
export interface ActivityTarget {
  activityId: string;
  targetCount: number; // Number of times to complete the activity
}

// Member's goal for a month
export interface MemberGoal {
  memberId: string;
  month: string; // Format: YYYY-MM
  activityTargets: ActivityTarget[]; // Array of targets for different activities
  createdAt?: string;
  updatedAt?: string;
}

// Progress for a specific activity
export interface ActivityProgress {
  activityId: string;
  activityName: string;
  targetCount: number;
  currentCount: number;
  progressPercentage: number;
  remainingCount: number;
  isCompleted: boolean;
}

// Overall goal progress for a member
export interface GoalProgress {
  memberId: string;
  memberName: string;
  month: string;
  activityProgresses: ActivityProgress[];
  totalActivitiesWithGoals: number;
  completedActivities: number;
  overallProgressPercentage: number;
}
