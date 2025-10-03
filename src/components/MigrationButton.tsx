'use client';

import { useState } from 'react';
import { migrateScoresFromSupabase, hasLocalData, getLocalDataCount } from '@/utils/migrateFromSupabase';

export const MigrationButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [localCount, setLocalCount] = useState(getLocalDataCount());

  const handleMigrate = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      await migrateScoresFromSupabase();
      const count = getLocalDataCount();
      setLocalCount(count);
      setMessage(`✅ Đã tải xuống ${count} bản ghi thành công!`);

      // Reload page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      setMessage('❌ Lỗi khi tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show if already has data
  if (hasLocalData()) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
        ✅ Dữ liệu đã được tải xuống ({localCount} bản ghi)
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">
            Tải dữ liệu từ Supabase
          </h3>
          <p className="text-sm text-yellow-700 mb-3">
            Nhấn nút bên dưới để tải xuống tất cả dữ liệu điểm số từ Supabase về máy của bạn.
          </p>
          <button
            onClick={handleMigrate}
            disabled={isLoading}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Đang tải xuống...' : 'Tải dữ liệu xuống'}
          </button>
          {message && (
            <p className="mt-2 text-sm font-medium text-yellow-800">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};