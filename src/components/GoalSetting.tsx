'use client';

import { useState, useEffect } from 'react';
import { MemberGoal, ActivityTarget } from '@/types/goal';
import { SCORING_ACTIVITIES } from '@/types';
import { getMemberGoal, saveMemberGoal } from '@/utils/goalStorage';

interface GoalSettingProps {
  memberId: string;
  memberName: string;
  month: string; // Format: YYYY-MM
  onGoalUpdated?: () => void;
}

export const GoalSetting: React.FC<GoalSettingProps> = ({
  memberId,
  memberName,
  month,
  onGoalUpdated
}) => {
  const [goal, setGoal] = useState<MemberGoal | null>(null);
  const [activityTargets, setActivityTargets] = useState<{ [key: string]: string }>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadGoal();
  }, [memberId, month]);

  const loadGoal = async () => {
    const existingGoal = await getMemberGoal(memberId, month);
    setGoal(existingGoal);

    if (existingGoal) {
      const targets: { [key: string]: string } = {};
      existingGoal.activityTargets.forEach(target => {
        targets[target.activityId] = target.targetCount.toString();
      });
      setActivityTargets(targets);
    } else {
      setActivityTargets({});
    }
  };

  const handleSave = async () => {
    // Build activity targets array from inputs
    const targets: ActivityTarget[] = [];
    Object.keys(activityTargets).forEach(activityId => {
      const count = parseInt(activityTargets[activityId]);
      if (!isNaN(count) && count > 0) {
        targets.push({
          activityId,
          targetCount: count
        });
      }
    });

    if (targets.length === 0) {
      alert('Vui lòng nhập ít nhất một mục tiêu');
      return;
    }

    setIsSaving(true);
    try {
      const newGoal: MemberGoal = {
        memberId,
        month,
        activityTargets: targets
      };

      await saveMemberGoal(newGoal);
      setGoal(newGoal);
      setIsEditing(false);
      onGoalUpdated?.();
    } catch (error) {
      console.error('Failed to save goal:', error);
      alert('Lỗi khi lưu mục tiêu');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (goal) {
      const targets: { [key: string]: string } = {};
      goal.activityTargets.forEach(target => {
        targets[target.activityId] = target.targetCount.toString();
      });
      setActivityTargets(targets);
    } else {
      setActivityTargets({});
    }
    setIsEditing(false);
  };

  const handleTargetChange = (activityId: string, value: string) => {
    setActivityTargets(prev => ({
      ...prev,
      [activityId]: value
    }));
  };

  const getMonthName = () => {
    const [year, monthNum] = month.split('-');
    return `Tháng ${parseInt(monthNum)}/${year}`;
  };

  const hasTargets = goal && goal.activityTargets.length > 0;

  if (!isEditing && !hasTargets) {
    return (
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-purple-900">
              Mục tiêu {getMonthName()}
            </p>
            <p className="text-xs text-purple-600 mt-1">
              Chưa đặt mục tiêu cho tháng này
            </p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            Đặt mục tiêu
          </button>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-purple-900">
            Đặt mục tiêu {getMonthName()}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-3 py-1 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Đang lưu...' : 'Lưu'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto space-y-2">
          {SCORING_ACTIVITIES.map(activity => (
            <div key={activity.id} className="flex items-center gap-2 bg-white p-2 rounded">
              <label className="flex-1 text-xs text-gray-700 truncate" title={activity.name}>
                {activity.name}
              </label>
              <input
                type="number"
                value={activityTargets[activity.id] || ''}
                onChange={(e) => handleTargetChange(activity.id, e.target.value)}
                placeholder="0"
                className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                min="0"
              />
              <span className="text-xs text-gray-500">lần</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-purple-900">
          Mục tiêu {getMonthName()}
        </p>
        <button
          onClick={() => setIsEditing(true)}
          className="px-3 py-1 text-purple-600 text-xs font-medium hover:bg-purple-100 rounded-lg transition-colors"
        >
          Chỉnh sửa
        </button>
      </div>

      <div className="space-y-1 max-h-40 overflow-y-auto">
        {goal?.activityTargets.map(target => {
          const activity = SCORING_ACTIVITIES.find(a => a.id === target.activityId);
          if (!activity) return null;
          return (
            <div key={target.activityId} className="flex items-center justify-between text-xs bg-white px-2 py-1 rounded">
              <span className="text-gray-700 truncate flex-1" title={activity.name}>
                {activity.name}
              </span>
              <span className="font-medium text-purple-700 ml-2">
                {target.targetCount} lần
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
