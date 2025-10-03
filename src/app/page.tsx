'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Member } from '@/types';
import { getMemberTotalScore } from '@/utils/storage';
import { createSlug } from '@/utils/slug';
import { ActivityDetailsModal } from '@/components/ActivityDetailsModal';
import { useFilteredMembers } from '@/hooks/useFilteredMembers';
import { MigrationButton } from '@/components/MigrationButton';
import { useAutoSync } from '@/hooks/useAutoSync';

export default function Home() {
  const [memberScores, setMemberScores] = useState<{ [key: string]: number }>({});
  const [currentMonth, setCurrentMonth] = useState<string>('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const filteredMembers = useFilteredMembers();

  // Auto-sync from Supabase every 5 minutes
  useAutoSync(() => {
    // Reload scores when sync completes
    if (currentMonth) {
      loadScoresForMonth(currentMonth);
    }
  });

  useEffect(() => {
    const today = new Date();
    const monthStr = today.toISOString().substring(0, 7);
    setCurrentMonth(monthStr);
    loadScoresForMonth(monthStr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredMembers]);

  const loadScoresForMonth = async (monthStr: string) => {
    const scores: { [key: string]: number } = {};

    // Load scores for all members in parallel
    const scorePromises = filteredMembers.map(async (member) => {
      const score = await getMemberTotalScore(member.id, monthStr);
      return { memberId: member.id, score };
    });

    const results = await Promise.all(scorePromises);
    results.forEach(({ memberId, score }) => {
      scores[memberId] = score;
    });

    setMemberScores(scores);
  };

  const handleMonthChange = (monthStr: string) => {
    setCurrentMonth(monthStr);
    loadScoresForMonth(monthStr);
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

  const handlePointsClick = (e: React.MouseEvent, member: Member) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="safe-area-inset">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-sm">
            <div className="p-4 bg-blue-600 text-white">
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-lg sm:text-xl font-semibold">
                  Bảng Thi Đua Giacop 5
                </h1>
              </div>
              
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleMonthChange(getPreviousMonth())}
                  className="p-2 hover:bg-blue-700 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className="text-center">
                  <p className="text-lg font-medium">
                    {getCurrentMonthName()}
                  </p>
                  <p className="text-blue-100 text-sm">
                    {filteredMembers.length} thành viên
                  </p>
                </div>
                
                <button
                  onClick={() => handleMonthChange(getNextMonth())}
                  disabled={isCurrentMonth()}
                  className={`p-2 rounded-full transition-colors ${
                    isCurrentMonth() 
                      ? 'text-blue-300 cursor-not-allowed' 
                      : 'hover:bg-blue-700'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredMembers
                .sort((a, b) => (memberScores[b.id] || 0) - (memberScores[a.id] || 0))
                .map((member, index) => (
                  <Link 
                    key={member.id}
                    href={`/thanh-vien/${createSlug(member.name)}`}
                    className="block hover:bg-gray-50 transition-colors active:bg-gray-100"
                  >
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            index === 0
                              ? 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-400' 
                              : index < 3 
                              ? 'bg-yellow-50 text-yellow-700' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {member.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex items-center space-x-2">
                        <button
                          onClick={(e) => handlePointsClick(e, member)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium hover:opacity-80 transition-opacity ${
                            (memberScores[member.id] || 0) > 1500 
                              ? 'bg-green-100 text-green-800' 
                              : (memberScores[member.id] || 0) > 1000
                              ? 'bg-blue-100 text-blue-800'
                              : (memberScores[member.id] || 0) > 500
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {memberScores[member.id] || 0}
                        </button>
                        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
            
            <div className="p-4 bg-gray-50 border-t">
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>
                  {isCurrentMonth() ? 'Tháng hiện tại' : 'Xem tháng trước'}
                </span>
                <span>
                  Cập nhật: {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {selectedMember && (
        <ActivityDetailsModal
          member={selectedMember}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
