'use client';

import { useState, useEffect } from 'react';
import { GoalProgress as GoalProgressType } from '@/types/goal';
import { getMemberGoal } from '@/utils/goalStorage';
import { calculateActivityProgress } from '@/utils/goalProgress';

interface GoalProgressProps {
  memberId: string;
  memberName: string;
  month: string; // Format: YYYY-MM
  currentDate: string; // Format: YYYY-MM-DD
}

export const GoalProgress: React.FC<GoalProgressProps> = ({
  memberId,
  memberName,
  month,
  currentDate
}) => {
  const [progress, setProgress] = useState<GoalProgressType | null>(null);

  useEffect(() => {
    loadProgress();
  }, [memberId, month, currentDate]);

  const loadProgress = async () => {
    const goal = await getMemberGoal(memberId, month);
    if (!goal || goal.activityTargets.length === 0) {
      setProgress(null);
      return;
    }

    const calculatedProgress = await calculateActivityProgress(memberId, month, goal);
    calculatedProgress.memberName = memberName;
    setProgress(calculatedProgress);
  };

  if (!progress || progress.totalActivitiesWithGoals === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-purple-900">
          📊 Tiến độ mục tiêu
        </h3>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          progress.overallProgressPercentage === 100
            ? 'bg-green-100 text-green-700'
            : progress.overallProgressPercentage >= 50
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-red-100 text-red-700'
        }`}>
          {progress.completedActivities}/{progress.totalActivitiesWithGoals} hoàn thành
        </span>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {progress.activityProgresses.map(activityProgress => (
          <div key={activityProgress.activityId} className="bg-white/60 rounded-lg p-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-700 truncate flex-1" title={activityProgress.activityName}>
                {activityProgress.activityName}
              </span>
              <span className={`font-medium ml-2 ${
                activityProgress.isCompleted ? 'text-green-600' : 'text-purple-600'
              }`}>
                {activityProgress.currentCount}/{activityProgress.targetCount} lần
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  activityProgress.isCompleted
                    ? 'bg-gradient-to-r from-green-400 to-green-600'
                    : activityProgress.progressPercentage >= 50
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                    : 'bg-gradient-to-r from-red-400 to-red-600'
                }`}
                style={{ width: `${activityProgress.progressPercentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {progress.overallProgressPercentage === 100 ? (
        <div className="mt-3 text-xs text-green-700 bg-green-100 rounded-lg p-2 text-center font-medium">
          🎉 Hoàn thành tất cả mục tiêu!
        </div>
      ) : progress.overallProgressPercentage >= 50 ? (
        <div className="mt-3 text-xs text-yellow-700 bg-yellow-100 rounded-lg p-2 text-center">
          💪 Đang trên đà tốt! Còn {progress.totalActivitiesWithGoals - progress.completedActivities} mục tiêu
        </div>
      ) : (
        <div className="mt-3 text-xs text-red-700 bg-red-100 rounded-lg p-2 text-center">
          ⚠️ Cần nỗ lực hơn! Còn {progress.totalActivitiesWithGoals - progress.completedActivities} mục tiêu
        </div>
      )}
    </div>
  );
};
