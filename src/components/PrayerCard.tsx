'use client';

import { useState } from 'react';

export interface PrayerCardProps {
  title: string;
  points: number;
  timeLimit: string;
  type: 'checkbox' | 'counter' | 'radio';
  initialValue?: number | boolean;
  maxValue?: number;
  options?: string[];
  onValueChange?: (value: number | boolean) => void;
}

export const PrayerCard: React.FC<PrayerCardProps> = ({
  title,
  points,
  timeLimit,
  type,
  initialValue,
  maxValue = 10,
  options = ['0', '1', '2'],
  onValueChange
}) => {
  const [checkboxValue, setCheckboxValue] = useState<boolean>(
    typeof initialValue === 'boolean' ? initialValue : false
  );
  const [counterValue, setCounterValue] = useState<number>(
    typeof initialValue === 'number' ? initialValue : 1
  );
  const [radioValue, setRadioValue] = useState<string>(
    typeof initialValue === 'number' ? initialValue.toString() : '1'
  );

  const handleCheckboxChange = (checked: boolean) => {
    setCheckboxValue(checked);
    onValueChange?.(checked);
  };

  const handleCounterChange = (newValue: number) => {
    const clampedValue = Math.max(0, Math.min(maxValue, newValue));
    setCounterValue(clampedValue);
    onValueChange?.(clampedValue);
  };

  const handleRadioChange = (value: string) => {
    setRadioValue(value);
    onValueChange?.(parseInt(value));
  };

  const renderControl = () => {
    switch (type) {
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`prayer-${title}`}
              checked={checkboxValue}
              onChange={(e) => handleCheckboxChange(e.target.checked)}
              className="w-6 h-6"
            />
            <label htmlFor={`prayer-${title}`} className="text-gray-700 text-sm">
              Sáng và chiều
            </label>
          </div>
        );

      case 'counter':
        return (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleCounterChange(counterValue - 1)}
              disabled={counterValue <= 0}
              className="w-10 h-10 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors"
            >
              <span className="text-lg font-semibold">−</span>
            </button>
            
            <div className="bg-white border-2 border-gray-200 rounded-lg px-4 py-2 min-w-[3rem] text-center">
              <span className="text-lg font-semibold">{counterValue}</span>
            </div>
            
            <button
              onClick={() => handleCounterChange(counterValue + 1)}
              disabled={counterValue >= maxValue}
              className="w-10 h-10 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-colors"
            >
              <span className="text-lg font-semibold">+</span>
            </button>
            
            <span className="text-sm text-gray-600">lần</span>
          </div>
        );

      case 'radio':
        return (
          <div className="flex items-center space-x-4">
            {options.map((option) => (
              <label key={option} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name={`prayer-radio-${title}`}
                  value={option}
                  checked={radioValue === option}
                  onChange={(e) => handleRadioChange(e.target.value)}
                  className="w-6 h-6"
                />
                <span className="text-gray-700 text-lg font-medium">{option}</span>
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <h3 className="text-gray-900 font-medium text-lg leading-tight">
            {title}
          </h3>
        </div>

        {/* Points and Time Limit */}
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>{points} điểm</span>
          <span>•</span>
          <span>{timeLimit}</span>
        </div>

        {/* Control */}
        <div className="pt-2">
          {renderControl()}
        </div>
      </div>
    </div>
  );
};