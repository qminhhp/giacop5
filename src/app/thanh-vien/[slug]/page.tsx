'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MEMBERS, SCORING_ACTIVITIES } from '@/types';
import { getMemberScore, saveScore, formatDate, getMemberActivities } from '@/utils/storage';
import { findMemberBySlug } from '@/utils/slug';

export default function MemberScoring() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [member] = useState(() => findMemberBySlug(slug, MEMBERS));
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [activities, setActivities] = useState<{ [key: string]: number | boolean | { morning: boolean; evening: boolean } }>({});
  const [totalPoints, setTotalPoints] = useState(0);
  const [monthlyActivitiesCompleted, setMonthlyActivitiesCompleted] = useState<Set<string>>(new Set());

  const checkMonthlyActivities = useCallback(async (date: string) => {
    if (!member) return;
    
    const monthStr = date.substring(0, 7); // Get YYYY-MM format
    const allActivities = await getMemberActivities(member.id);
    
    // Filter activities for the current month
    const monthlyActivities = allActivities.filter(score => 
      score.date.startsWith(monthStr)
    );
    
    const completedSet = new Set<string>();
    monthlyActivities.forEach(score => {
      Object.entries(score.activities).forEach(([activityId, value]) => {
        const activity = SCORING_ACTIVITIES.find(a => a.id === activityId && a.monthlyOnly);
        if (activity && value === true) {
          completedSet.add(activityId);
        }
      });
    });
    
    setMonthlyActivitiesCompleted(completedSet);
  }, [member]);

  const loadScoreForDate = useCallback(async (date: string) => {
    if (!member) return;
    
    const existingScore = await getMemberScore(member.id, date);
    if (existingScore) {
      setActivities(existingScore.activities);
    } else {
      const defaultActivities: { [key: string]: number | boolean | { morning: boolean; evening: boolean } } = {};
      SCORING_ACTIVITIES.forEach(activity => {
        if (activity.type === 'checkbox') {
          defaultActivities[activity.id] = false;
        } else if (activity.type === 'checkbox_double') {
          defaultActivities[activity.id] = { morning: false, evening: false };
        } else if (activity.type === 'radio') {
          defaultActivities[activity.id] = 0;
        } else {
          defaultActivities[activity.id] = 0;
        }
      });
      setActivities(defaultActivities);
    }
    
    // Check monthly activities
    await checkMonthlyActivities(date);
  }, [member, checkMonthlyActivities]);

  const calculateTotalPoints = useCallback(() => {
    let total = 0;
    SCORING_ACTIVITIES.forEach(activity => {
      const value = activities[activity.id];
      if (typeof value === 'object' && value !== null && 'morning' in value && 'evening' in value) {
        // Handle dual-checkbox format
        const dualValue = value as { morning: boolean; evening: boolean };
        if (dualValue.morning) total += activity.points;
        if (dualValue.evening) total += activity.points;
      } else if (typeof value === 'boolean' && value) {
        if (activity.type === 'checkbox_double') {
          total += activity.points * 2;
        } else {
          total += activity.points;
        }
      } else if (typeof value === 'number' && value > 0) {
        total += activity.points * value;
      }
    });
    setTotalPoints(total);
  }, [activities]);

  useEffect(() => {
    if (!member) {
      router.push('/');
      return;
    }
    
    const today = new Date();
    const todayStr = formatDate(today);
    setSelectedDate(todayStr);
    
    loadScoreForDate(todayStr);
  }, [member, router, loadScoreForDate]);

  useEffect(() => {
    calculateTotalPoints();
  }, [activities, calculateTotalPoints]);

  const handleActivityChange = async (activityId: string, value: number | boolean | { morning: boolean; evening: boolean }) => {
    const activity = SCORING_ACTIVITIES.find(a => a.id === activityId);
    if (!activity) return;

    // Check if monthly activity is already completed
    if (activity.monthlyOnly && monthlyActivitiesCompleted.has(activityId) && value === true) {
      alert('Hoạt động này đã được hoàn thành trong tháng này!');
      return;
    }

    if (activity.weekdaysOnly && selectedDate) {
      const date = new Date(selectedDate);
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return;
      }
    }

    // Update activities state
    const newActivities = {
      ...activities,
      [activityId]: value
    };
    
    setActivities(newActivities);

    // Calculate new total points
    let newTotal = 0;
    SCORING_ACTIVITIES.forEach(act => {
      const actValue = activityId === act.id ? value : activities[act.id];
      if (typeof actValue === 'object' && actValue !== null && 'morning' in actValue && 'evening' in actValue) {
        const dualValue = actValue as { morning: boolean; evening: boolean };
        if (dualValue.morning) newTotal += act.points;
        if (dualValue.evening) newTotal += act.points;
      } else if (typeof actValue === 'boolean' && actValue) {
        if (act.type === 'checkbox_double') {
          newTotal += act.points * 2;
        } else {
          newTotal += act.points;
        }
      } else if (typeof actValue === 'number' && actValue > 0) {
        newTotal += act.points * actValue;
      }
    });

    // Auto-save immediately
    if (member && selectedDate) {
      const score = {
        memberId: member.id,
        date: selectedDate,
        activities: newActivities,
        totalPoints: newTotal
      };

      try {
        await saveScore(score);
        // Refresh monthly activities check if this was a monthly activity
        if (activity.monthlyOnly) {
          await checkMonthlyActivities(selectedDate);
        }
      } catch (error) {
        console.error('Auto-save error:', error);
      }
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    loadScoreForDate(date);
  };



  if (!member) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Không tìm thấy thành viên</h2>
          <Link href="/" className="text-blue-600 hover:underline">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-sm">
          <div className="sticky top-0 z-10 bg-blue-600 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link 
                  href="/"
                  className="p-1 hover:bg-blue-700 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
                <div>
                  <h1 className="text-lg font-semibold">{member.name}</h1>
                  <p className="text-blue-100 text-sm">{new Date(selectedDate).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold">{totalPoints}</div>
                <div className="text-blue-100 text-xs">điểm</div>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="mb-4 bg-gray-50 p-3 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn ngày
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                max={formatDate(new Date())}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              />
            </div>

            <div className="space-y-3">
              {SCORING_ACTIVITIES.map(activity => (
                <div key={activity.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="mb-3">
                    <h3 className="font-medium text-gray-900 text-sm">{activity.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.points} điểm
                      {activity.maxPointsPerDay && ` • Tối đa ${activity.maxPointsPerDay}/ngày`}
                      {activity.maxPointsPerMonth && ` • Tối đa ${activity.maxPointsPerMonth}/tháng`}
                    </p>
                  </div>

                  <div>
                    {activity.type === 'checkbox' && (
                      <label className={`flex items-center p-2 rounded-lg ${
                        activity.monthlyOnly && monthlyActivitiesCompleted.has(activity.id) 
                          ? 'cursor-not-allowed opacity-50' 
                          : 'cursor-pointer hover:bg-gray-50'
                      }`}>
                        <input
                          type="checkbox"
                          checked={!!activities[activity.id]}
                          disabled={activity.monthlyOnly && monthlyActivitiesCompleted.has(activity.id)}
                          onChange={(e) => handleActivityChange(activity.id, e.target.checked)}
                        />
                        <span className="ml-3 text-sm text-gray-700 font-medium">
                          {activity.monthlyOnly && monthlyActivitiesCompleted.has(activity.id) 
                            ? 'Đã hoàn thành trong tháng này' 
                            : 'Hoàn thành'
                          }
                        </span>
                      </label>
                    )}

                    {activity.type === 'checkbox_double' && (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id={`prayer-morning-${activity.id}`}
                            checked={!!(activities[activity.id] as { morning: boolean; evening: boolean })?.morning}
                            onChange={(e) => {
                              const current = activities[activity.id] as { morning: boolean; evening: boolean } || { morning: false, evening: false };
                              handleActivityChange(activity.id, { ...current, morning: e.target.checked });
                            }}
                            className="w-6 h-6"
                          />
                          <label htmlFor={`prayer-morning-${activity.id}`} className="text-gray-700 text-sm">
                            Sáng ({activity.points} điểm)
                          </label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id={`prayer-evening-${activity.id}`}
                            checked={!!(activities[activity.id] as { morning: boolean; evening: boolean })?.evening}
                            onChange={(e) => {
                              const current = activities[activity.id] as { morning: boolean; evening: boolean } || { morning: false, evening: false };
                              handleActivityChange(activity.id, { ...current, evening: e.target.checked });
                            }}
                            className="w-6 h-6"
                          />
                          <label htmlFor={`prayer-evening-${activity.id}`} className="text-gray-700 text-sm">
                            Chiều ({activity.points} điểm)
                          </label>
                        </div>
                      </div>
                    )}

                    {activity.type === 'number' && (
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            const current = (activities[activity.id] as number) || 0;
                            if (current > 0) handleActivityChange(activity.id, current - 1);
                          }}
                          className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <input
                          type="number"
                          min="0"
                          max="50"
                          value={activities[activity.id] as number || 0}
                          onChange={(e) => handleActivityChange(activity.id, parseInt(e.target.value) || 0)}
                          className="w-16 p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base text-center font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const current = (activities[activity.id] as number) || 0;
                            if (current < 50) handleActivityChange(activity.id, current + 1);
                          }}
                          className="w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                        <span className="text-sm text-gray-600 ml-2">lần</span>
                      </div>
                    )}

                    {activity.type === 'radio' && activity.radioOptions && (
                      <div className="flex space-x-6">
                        {activity.radioOptions.map(option => (
                          <label key={option} className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name={activity.id}
                              value={option}
                              checked={(activities[activity.id] as number) === option}
                              onChange={(e) => handleActivityChange(activity.id, parseInt(e.target.value))}
                            />
                            <span className="ml-2 text-sm text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>

          <div className="p-4 bg-gray-50 border-t">
            <div className="text-center text-lg font-semibold text-gray-900">
              Tổng điểm: <span className="text-blue-600">{totalPoints}</span>
            </div>
            <p className="text-center text-sm text-gray-500 mt-2">
              Điểm được tự động lưu khi thay đổi
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}