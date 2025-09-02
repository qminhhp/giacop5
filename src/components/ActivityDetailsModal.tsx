'use client';

import { useState, useEffect } from 'react';
import { MemberScore, SCORING_ACTIVITIES, Member } from '@/types';
import { getMemberActivities } from '@/utils/storage';

interface ActivityDetailsModalProps {
  member: Member;
  isOpen: boolean;
  onClose: () => void;
}

export const ActivityDetailsModal: React.FC<ActivityDetailsModalProps> = ({
  member,
  isOpen,
  onClose
}) => {
  const [activities, setActivities] = useState<MemberScore[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && member) {
      loadActivities();
    }
  }, [isOpen, member]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const memberActivities = await getMemberActivities(member.id);
      setActivities(memberActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityName = (activityId: string) => {
    const activity = SCORING_ACTIVITIES.find(a => a.id === activityId);
    return activity?.name || activityId;
  };

  const formatActivityValue = (activityId: string, value: number | boolean) => {
    const activity = SCORING_ACTIVITIES.find(a => a.id === activityId);
    if (!activity) return String(value);
    
    if (typeof value === 'boolean') {
      return value ? 'Có' : '';
    }
    
    if (typeof value === 'number') {
      if (value === 0) return '';
      return value.toString();
    }
    
    return String(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-blue-600 text-white p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{member.name}</h2>
            <p className="text-blue-100 text-sm">Chi tiết hoạt động</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-700 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Đang tải...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Chưa có dữ liệu hoạt động
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((score, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">
                      {new Date(score.date).toLocaleDateString('vi-VN')}
                    </h3>
                    <div className="text-blue-600 font-bold">
                      {score.totalPoints} điểm
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(score.activities).map(([activityId, value]) => {
                      const displayValue = formatActivityValue(activityId, value);
                      if (!displayValue) return null;
                      
                      return (
                        <div key={activityId} className="bg-white p-3 rounded border">
                          <div className="text-sm font-medium text-gray-800">
                            {getActivityName(activityId)}
                          </div>
                          <div className="text-blue-600 font-semibold">
                            {displayValue}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};