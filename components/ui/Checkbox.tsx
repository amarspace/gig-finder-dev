import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export default function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
}: CheckboxProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
        />
        <div
          className={`w-6 h-6 border-2 rounded-md transition-all duration-200 flex items-center justify-center ${
            checked
              ? 'bg-brand-purple border-brand-purple'
              : 'bg-white border-gray-300 hover:border-brand-purple'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {checked && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
        </div>
      </div>
      {label && (
        <span className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
          {label}
        </span>
      )}
    </label>
  );
}
