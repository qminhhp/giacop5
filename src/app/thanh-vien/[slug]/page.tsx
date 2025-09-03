'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MEMBERS, SCORING_ACTIVITIES, MemberScore } from '@/types';
import { getMemberScore, saveScore, formatDate } from '@/utils/storage';
import { findMemberBySlug } from '@/utils/slug';
import { PrayerCard } from '@/components/PrayerCard';

export default function MemberScoring() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [member] = useState(() => findMemberBySlug(slug, MEMBERS));
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [activities, setActivities] = useState<{ [key: string]: number | boolean | { morning: boolean; evening: boolean } }>({});
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    if (!member) {
      router.push('/');
      return;
    }
    
    const today = new Date();
    const todayStr = formatDate(today);
    setSelectedDate(todayStr);
    
    loadScoreForDate(todayStr);
  }, [member, router]);

  useEffect(() => {
    calculateTotalPoints();
  }, [activities]);

  const loadScoreForDate = async (date: string) => {
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
  };

  const calculateTotalPoints = () => {
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
  };

  const handleActivityChange = (activityId: string, value: number | boolean | { morning: boolean; evening: boolean }) => {
    const activity = SCORING_ACTIVITIES.find(a => a.id === activityId);
    if (!activity) return;

    if (activity.weekdaysOnly && selectedDate) {
      const date = new Date(selectedDate);
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return;
      }
    }

    setActivities(prev => ({
      ...prev,
      [activityId]: value
    }));
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    loadScoreForDate(date);
  };


  const handleSave = async () => {
    if (!member || !selectedDate) return;

    const score: MemberScore = {
      memberId: member.id,
      date: selectedDate,
      activities,
      totalPoints
    };

    try {
      await saveScore(score);
      alert('Đã lưu điểm thành công!');
    } catch (error) {
      console.error('Error saving score:', error);
      alert('Có lỗi xảy ra khi lưu điểm. Dữ liệu đã được lưu offline.');
    }
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
                      <label className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={!!activities[activity.id]}
                          onChange={(e) => handleActivityChange(activity.id, e.target.checked)}
                        />
                        <span className="ml-3 text-sm text-gray-700 font-medium">Hoàn thành</span>
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
                            Tích sáng ({activity.points} điểm)
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
                            Tích chiều ({activity.points} điểm)
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

          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-semibold text-gray-900">
                Tổng điểm: <span className="text-blue-600">{totalPoints}</span>
              </div>
            </div>
            <button
              onClick={handleSave}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors active:bg-blue-800"
            >
              Lưu điểm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}