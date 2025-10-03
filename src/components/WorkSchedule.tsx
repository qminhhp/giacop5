'use client';

import { useState, useEffect } from 'react';
import { WORK_ACTIVITIES, TimeSlot, DaySchedule } from '@/types/workSchedule';

interface WorkScheduleProps {
  memberId: string;
  date: string;
  schedule: DaySchedule | null;
  onScheduleChange: (schedule: DaySchedule) => void;
}

export const WorkSchedule: React.FC<WorkScheduleProps> = ({
  memberId,
  date,
  schedule,
  onScheduleChange
}) => {
  const [selectedSlots, setSelectedSlots] = useState<{
    morning?: string;
    afternoon?: string;
    evening?: string;
  }>({
    morning: schedule?.morning || '',
    afternoon: schedule?.afternoon || '',
    evening: schedule?.evening || ''
  });

  useEffect(() => {
    setSelectedSlots({
      morning: schedule?.morning || '',
      afternoon: schedule?.afternoon || '',
      evening: schedule?.evening || ''
    });
  }, [schedule]);

  const handleSlotChange = (slot: TimeSlot, value: string) => {
    const updated = { ...selectedSlots, [slot]: value };
    setSelectedSlots(updated);

    const newSchedule: DaySchedule = {
      date,
      morning: updated.morning || undefined,
      afternoon: updated.afternoon || undefined,
      evening: updated.evening || undefined
    };

    onScheduleChange(newSchedule);
  };

  const getSlotLabel = (slot: TimeSlot): string => {
    switch (slot) {
      case 'morning': return 'Sáng';
      case 'afternoon': return 'Chiều';
      case 'evening': return 'Tối';
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const dayOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][date.getDay()];
    return `${dayOfWeek}, ${date.getDate()}/${date.getMonth() + 1}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <h3 className="text-lg font-semibold mb-4 text-blue-600">
        Lịch làm việc - {formatDate(date)}
      </h3>

      <div className="space-y-4">
        {(['morning', 'afternoon', 'evening'] as TimeSlot[]).map((slot) => (
          <div key={slot} className="border rounded-lg p-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {getSlotLabel(slot)}
            </label>
            <select
              value={selectedSlots[slot] || ''}
              onChange={(e) => handleSlotChange(slot, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Chọn hoạt động --</option>
              {WORK_ACTIVITIES.map((activity) => (
                <option key={activity.code} value={activity.code}>
                  {activity.code}: {activity.name}
                </option>
              ))}
            </select>
            {selectedSlots[slot] && (
              <p className="mt-2 text-xs text-gray-600">
                {WORK_ACTIVITIES.find(a => a.code === selectedSlots[slot])?.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};