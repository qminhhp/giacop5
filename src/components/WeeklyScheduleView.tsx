'use client';

import { useState, useEffect } from 'react';
import { DaySchedule, WORK_ACTIVITIES } from '@/types/workSchedule';

interface WeeklyScheduleViewProps {
  memberId: string;
  memberName: string;
  currentDate: string;
  schedules: DaySchedule[];
}

export const WeeklyScheduleView: React.FC<WeeklyScheduleViewProps> = ({
  memberId,
  memberName,
  currentDate,
  schedules
}) => {
  const [weekDates, setWeekDates] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    // Check if currentDate is valid
    if (!currentDate) return;

    try {
      // Calculate week dates (Sunday to Saturday)
      const current = new Date(currentDate);

      // Check if date is valid
      if (isNaN(current.getTime())) {
        console.error('Invalid date provided:', currentDate);
        return;
      }

      const dayOfWeek = current.getDay();
      const sunday = new Date(current);
      sunday.setDate(current.getDate() - dayOfWeek);

      const dates: string[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(sunday);
        date.setDate(sunday.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
      }
      setWeekDates(dates);
    } catch (error) {
      console.error('Error calculating week dates:', error);
    }
  }, [currentDate]);

  const getScheduleForDate = (date: string): DaySchedule | undefined => {
    return schedules.find(s => s.date === date);
  };

  const formatDateHeader = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      return `${dayNames[date.getDay()]}\n${date.getDate()}/${date.getMonth() + 1}`;
    } catch {
      return dateStr;
    }
  };

  const getActivityName = (code: string | undefined): string => {
    if (!code) return '';
    const activity = WORK_ACTIVITIES.find(a => a.code === code);
    return activity ? `${code}: ${activity.name}` : code;
  };

  const copyToClipboard = () => {
    let tableData = `Lịch làm việc - ${memberName}\n\n`;
    tableData += 'Thời gian\t';

    // Header row with dates
    weekDates.forEach(date => {
      const d = new Date(date);
      const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      tableData += `${dayNames[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}\t`;
    });
    tableData += '\n';

    // Morning row
    tableData += 'Sáng\t';
    weekDates.forEach(date => {
      const schedule = getScheduleForDate(date);
      tableData += `${schedule?.morning || ''}\t`;
    });
    tableData += '\n';

    // Afternoon row
    tableData += 'Chiều\t';
    weekDates.forEach(date => {
      const schedule = getScheduleForDate(date);
      tableData += `${schedule?.afternoon || ''}\t`;
    });
    tableData += '\n';

    // Evening row
    tableData += 'Tối\t';
    weekDates.forEach(date => {
      const schedule = getScheduleForDate(date);
      tableData += `${schedule?.evening || ''}\t`;
    });

    navigator.clipboard.writeText(tableData).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const getWeekRange = (): string => {
    if (weekDates.length === 0) return '';
    try {
      const start = new Date(weekDates[0]);
      const end = new Date(weekDates[6]);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return '';
      return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}/${end.getFullYear()}`;
    } catch {
      return '';
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
      >
        Xem lịch tuần ({getWeekRange()})
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsModalOpen(false)}></div>

            <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
              <div className="sticky top-0 bg-white border-b px-6 py-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">
                    Lịch làm việc tuần {getWeekRange()}
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">{memberName}</p>
              </div>

              <div className="p-6 overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2 bg-gray-100 font-medium text-sm">Thời gian</th>
                      {weekDates.map(date => (
                        <th key={date} className="border p-2 bg-gray-100 font-medium text-sm whitespace-pre-line">
                          {formatDateHeader(date)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2 font-medium bg-gray-50">Sáng</td>
                      {weekDates.map(date => {
                        const schedule = getScheduleForDate(date);
                        return (
                          <td key={date} className="border p-2 text-center">
                            {schedule?.morning || '-'}
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="border p-2 font-medium bg-gray-50">Chiều</td>
                      {weekDates.map(date => {
                        const schedule = getScheduleForDate(date);
                        return (
                          <td key={date} className="border p-2 text-center">
                            {schedule?.afternoon || '-'}
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="border p-2 font-medium bg-gray-50">Tối</td>
                      {weekDates.map(date => {
                        const schedule = getScheduleForDate(date);
                        return (
                          <td key={date} className="border p-2 text-center">
                            {schedule?.evening || '-'}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>

                <div className="mt-6">
                  <h3 className="font-medium mb-2">Chú thích:</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 max-h-48 overflow-y-auto">
                    {weekDates.map(date => {
                      const schedule = getScheduleForDate(date);
                      const codes = [schedule?.morning, schedule?.afternoon, schedule?.evening].filter(Boolean);
                      const uniqueCodes = [...new Set(codes)];

                      if (uniqueCodes.length === 0) return null;

                      return uniqueCodes.map(code => {
                        const activity = WORK_ACTIVITIES.find(a => a.code === code);
                        return activity ? (
                          <div key={`${date}-${code}`} className="truncate">
                            <span className="font-medium">{code}:</span> {activity.name}
                          </div>
                        ) : null;
                      });
                    }).flat().filter(Boolean)}
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t">
                <button
                  onClick={copyToClipboard}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {copySuccess ? 'Đã sao chép!' : 'Sao chép để dán vào Excel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};