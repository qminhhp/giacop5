'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { SCORING_ACTIVITIES } from '@/types';
import { getMemberScore, saveScore, formatDate } from '@/utils/storage';
import { findMemberBySlug } from '@/utils/slug';
import { useFilteredMembers } from '@/hooks/useFilteredMembers';
import { WorkSchedule } from '@/components/WorkSchedule';
import { WeeklyScheduleView } from '@/components/WeeklyScheduleView';
import { DaySchedule } from '@/types/workSchedule';
import { getMemberDaySchedule, saveMemberDaySchedule, getWeeklySchedule } from '@/utils/workScheduleStorage';
import { GoalSetting } from '@/components/GoalSetting';
import { GoalProgress } from '@/components/GoalProgress';
import { useDebouncedSave } from '@/hooks/useDebouncedSave';

export default function MemberScoring() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const filteredMembers = useFilteredMembers();

  const [member] = useState(() => findMemberBySlug(slug, filteredMembers));
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [activities, setActivities] = useState<{ [key: string]: number | boolean | { morning: boolean; evening: boolean } }>({});
  const [totalPoints, setTotalPoints] = useState(0);
  const [monthlyActivitiesCompleted, setMonthlyActivitiesCompleted] = useState<Set<string>>(new Set());
  const [workSchedule, setWorkSchedule] = useState<DaySchedule | null>(null);
  const [weeklySchedules, setWeeklySchedules] = useState<DaySchedule[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);

  const loadMonthlyActivitiesCompleted = useCallback(async (date: string) => {
    if (!member) return;
    
    const currentDate = new Date(date);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const completed = new Set<string>();
    
    // Check each day of the current month for completed monthly activities
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const checkDate = formatDate(new Date(year, month, day));
      const score = await getMemberScore(member.id, checkDate);
      if (score) {
        SCORING_ACTIVITIES.forEach(activity => {
          if (activity.monthlyOnly && score.activities[activity.id]) {
            completed.add(activity.id);
          }
        });
      }
    }
    
    setMonthlyActivitiesCompleted(completed);
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
    
    // Load monthly activities status
    await loadMonthlyActivitiesCompleted(date);

    // Load work schedule for the date
    const schedule = await getMemberDaySchedule(member.id, date);
    setWorkSchedule(schedule);

    // Load weekly schedules
    const weekSchedules = await getWeeklySchedule(member.id, date);
    setWeeklySchedules(weekSchedules);
  }, [member, loadMonthlyActivitiesCompleted]);

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

  // Debounced save function
  const performSave = useCallback(async (scoreData: {
    memberId: string;
    date: string;
    activities: { [key: string]: number | boolean | { morning: boolean; evening: boolean } };
    totalPoints: number
  }) => {
    setIsSaving(true);
    try {
      await saveScore(scoreData);
      setLastSavedTime(new Date());
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const { debouncedSave } = useDebouncedSave(performSave, 800);

  const handleActivityChange = async (activityId: string, value: number | boolean | { morning: boolean; evening: boolean }) => {
    const activity = SCORING_ACTIVITIES.find(a => a.id === activityId);
    if (!activity) return;

    if (activity.weekdaysOnly && selectedDate) {
      const date = new Date(selectedDate);
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return;
      }
    }

    // Update activities state immediately (optimistic update)
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

    setTotalPoints(newTotal);

    // Debounced save
    if (member && selectedDate) {
      const score = {
        memberId: member.id,
        date: selectedDate,
        activities: newActivities,
        totalPoints: newTotal
      };

      debouncedSave(score);

      // If this is a monthly activity, refresh the monthly activities completed status
      if (activity && activity.monthlyOnly) {
        await loadMonthlyActivitiesCompleted(selectedDate);
      }
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    loadScoreForDate(date);
  };

  const handleWorkScheduleChange = async (schedule: DaySchedule) => {
    if (!member) return;

    try {
      await saveMemberDaySchedule(member.id, schedule);
      setWorkSchedule(schedule);

      // Refresh weekly schedules
      const weekSchedules = await getWeeklySchedule(member.id, selectedDate);
      setWeeklySchedules(weekSchedules);
    } catch (error) {
      console.error('Error saving work schedule:', error);
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate);
    const newDate = new Date(currentDate);
    
    if (direction === 'prev') {
      newDate.setDate(currentDate.getDate() - 1);
    } else {
      newDate.setDate(currentDate.getDate() + 1);
    }
    
    const newDateString = formatDate(newDate);
    const today = formatDate(new Date());
    
    // Don't allow navigation to future dates
    if (direction === 'next' && newDateString > today) {
      return;
    }
    
    handleDateChange(newDateString);
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
            <div className="flex items-center justify-between mb-2">
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
            {/* Save status indicator */}
            <div className="flex items-center justify-end">
              {isSaving ? (
                <div className="flex items-center text-blue-100 text-xs">
                  <svg className="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang lưu...
                </div>
              ) : lastSavedTime ? (
                <div className="text-blue-100 text-xs">
                  ✓ Đã lưu {lastSavedTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </div>
              ) : null}
            </div>
          </div>

          <div className="p-4">
            {/* Goal Setting Section */}
            {selectedDate && (
              <div className="mb-4">
                <GoalSetting
                  memberId={member.id}
                  memberName={member.name}
                  month={selectedDate.substring(0, 7)}
                  onGoalUpdated={() => loadScoreForDate(selectedDate)}
                />
              </div>
            )}

            {/* Goal Progress Section */}
            {selectedDate && (
              <div className="mb-4">
                <GoalProgress
                  memberId={member.id}
                  memberName={member.name}
                  month={selectedDate.substring(0, 7)}
                  currentDate={selectedDate}
                />
              </div>
            )}

            <div className="mb-4 bg-gray-50 p-3 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn ngày
              </label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateDate('prev')}
                  className="p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  title="Ngày trước"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  max={formatDate(new Date())}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                />
                <button
                  onClick={() => navigateDate('next')}
                  disabled={selectedDate >= formatDate(new Date())}
                  className="p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                  title="Ngày sau"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Work Schedule Section */}
            {selectedDate && (
              <div className="mb-6">
                <WorkSchedule
                  memberId={member.id}
                  date={selectedDate}
                  schedule={workSchedule}
                  onScheduleChange={handleWorkScheduleChange}
                />
              </div>
            )}

            {/* Weekly Schedule View Button */}
            {selectedDate && (
              <div className="mb-6">
                <WeeklyScheduleView
                  memberId={member.id}
                  memberName={member.name}
                  currentDate={selectedDate}
                  schedules={weeklySchedules}
                />
              </div>
            )}

            {/* Daily Goals Section */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-blue-500">
                📅 Nhiệm vụ ngày
              </h2>
              <div className="space-y-3">
                {SCORING_ACTIVITIES.filter(activity => !activity.monthlyOnly).map(activity => (
                  <div key={activity.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="mb-3">
                      <h3 className="font-medium text-gray-900 text-sm">{activity.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.points} điểm
                        {activity.maxPointsPerDay && ` • Tối đa ${activity.maxPointsPerDay}/ngày`}
                        {activity.weekdaysOnly && ` • Chỉ các ngày trong tuần`}
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

            {/* Monthly Goals Section */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-green-500">
                📆 Nhiệm vụ tháng
              </h2>
              <div className="space-y-3">
                {SCORING_ACTIVITIES.filter(activity => activity.monthlyOnly).map(activity => (
                  <div key={activity.id} className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-sm">
                    <div className="mb-3">
                      <h3 className="font-medium text-gray-900 text-sm">{activity.name}</h3>
                      <p className="text-xs text-green-600 mt-1">
                        {activity.points} điểm
                        {activity.maxPointsPerMonth && ` • Tối đa ${activity.maxPointsPerMonth}/tháng`}
                      </p>
                    </div>

                    <div>
                      {activity.type === 'checkbox' && (
                        <label className="flex items-center p-2 rounded-lg cursor-pointer hover:bg-green-100">
                          <input
                            type="checkbox"
                            checked={!!activities[activity.id]}
                            onChange={(e) => handleActivityChange(activity.id, e.target.checked)}
                            className="w-5 h-5"
                          />
                          <span className="ml-3 text-sm text-gray-700 font-medium">
                            Hoàn thành
                          </span>
                        </label>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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