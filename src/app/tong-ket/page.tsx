'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SCORING_ACTIVITIES } from '@/types';
import { getScores } from '@/utils/storage';
import { useFilteredMembers } from '@/hooks/useFilteredMembers';

interface ActivitySummary {
  activityId: string;
  activityName: string;
  memberStats: {
    memberId: string;
    memberName: string;
    count: number;
    totalPoints: number;
  }[];
}

export default function MonthlySummary() {
  const [currentMonth, setCurrentMonth] = useState<string>('');
  const [summaries, setSummaries] = useState<ActivitySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const filteredMembers = useFilteredMembers();

  useEffect(() => {
    const today = new Date();
    const monthStr = today.toISOString().substring(0, 7);
    setCurrentMonth(monthStr);
    loadMonthlySummary(monthStr);
  }, [filteredMembers]);

  const loadMonthlySummary = async (monthStr: string) => {
    setIsLoading(true);
    try {
      const allScores = await getScores();

      // Filter scores for current month
      const monthScores = allScores.filter(score =>
        score.date.startsWith(monthStr)
      );

      // Calculate summary for each activity
      const activitySummaries: ActivitySummary[] = SCORING_ACTIVITIES.map(activity => {
        const memberStats = filteredMembers.map(member => {
          let count = 0;
          let totalPoints = 0;

          monthScores
            .filter(score => score.memberId === member.id)
            .forEach(score => {
              const activityValue = score.activities[activity.id];

              if (activity.type === 'checkbox') {
                if (activityValue === true) {
                  count += 1;
                  totalPoints += activity.points;
                }
              } else if (activity.type === 'checkbox_double') {
                const doubleValue = activityValue as { morning: boolean; evening: boolean } | undefined;
                if (doubleValue) {
                  if (doubleValue.morning) {
                    count += 1;
                    totalPoints += activity.points;
                  }
                  if (doubleValue.evening) {
                    count += 1;
                    totalPoints += activity.points;
                  }
                }
              } else if (activity.type === 'number' || activity.type === 'radio') {
                const numValue = Number(activityValue) || 0;
                if (numValue > 0) {
                  count += numValue;
                  totalPoints += activity.points * numValue;
                }
              }
            });

          return {
            memberId: member.id,
            memberName: member.name,
            count,
            totalPoints
          };
        });

        return {
          activityId: activity.id,
          activityName: activity.name,
          memberStats: memberStats.filter(stat => stat.count > 0)
        };
      }).filter(summary => summary.memberStats.length > 0);

      setSummaries(activitySummaries);
    } catch (error) {
      console.error('Error loading monthly summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentMonthName = () => {
    const [year, month] = currentMonth.split('-');
    return `Tháng ${parseInt(month)}/${year}`;
  };

  const getPreviousMonth = () => {
    const date = new Date(currentMonth + '-01');
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().substring(0, 7);
  };

  const getNextMonth = () => {
    const date = new Date(currentMonth + '-01');
    date.setMonth(date.getMonth() + 1);
    return date.toISOString().substring(0, 7);
  };

  const isCurrentMonth = () => {
    const today = new Date();
    const todayMonth = today.toISOString().substring(0, 7);
    return currentMonth === todayMonth;
  };

  const handleMonthChange = (monthStr: string) => {
    setCurrentMonth(monthStr);
    loadMonthlySummary(monthStr);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-sm">
          <div className="p-4 bg-green-600 text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Link
                  href="/"
                  className="p-1 hover:bg-green-700 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
                <h1 className="text-lg sm:text-xl font-semibold">
                  Tổng Kết Tháng
                </h1>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => handleMonthChange(getPreviousMonth())}
                className="p-2 hover:bg-green-700 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="text-center">
                <p className="text-lg font-medium">
                  {getCurrentMonthName()}
                </p>
                <p className="text-green-100 text-sm">
                  {summaries.length} hoạt động
                </p>
              </div>

              <button
                onClick={() => handleMonthChange(getNextMonth())}
                disabled={isCurrentMonth()}
                className={`p-2 rounded-full transition-colors ${
                  isCurrentMonth()
                    ? 'text-green-300 cursor-not-allowed'
                    : 'hover:bg-green-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-4">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                Đang tải dữ liệu...
              </div>
            ) : summaries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Chưa có dữ liệu cho tháng này
              </div>
            ) : (
              <div className="space-y-6">
                {summaries.map(summary => (
                  <div key={summary.activityId} className="bg-white border rounded-lg overflow-hidden">
                    <div className="bg-blue-50 px-4 py-3 border-b">
                      <h2 className="font-semibold text-gray-900">
                        {summary.activityName}
                      </h2>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                              Thành viên
                            </th>
                            <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">
                              Số lần
                            </th>
                            <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">
                              Tổng điểm
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {summary.memberStats
                            .sort((a, b) => b.totalPoints - a.totalPoints)
                            .map(stat => (
                              <tr key={stat.memberId} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-sm text-gray-900">
                                  {stat.memberName}
                                </td>
                                <td className="px-4 py-2 text-center text-sm text-gray-600">
                                  {stat.count}
                                </td>
                                <td className="px-4 py-2 text-right text-sm font-medium text-green-600">
                                  {stat.totalPoints}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}