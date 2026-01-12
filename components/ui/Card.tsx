import React from 'react';
import { ChevronRight } from 'lucide-react';

interface CardProps {
  variant: 'purple' | 'orange';
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
}

export default function Card({
  variant,
  icon,
  title,
  description,
  onClick,
}: CardProps) {
  const cardClass = variant === 'purple' ? 'action-card-purple' : 'action-card-orange';
  const iconContainerClass = variant === 'purple' ? 'icon-container-purple' : 'icon-container-orange';
  const iconColor = variant === 'purple' ? 'text-brand-purple' : 'text-brand-orange';

  return (
    <div className={cardClass} onClick={onClick}>
      <div className="flex items-center gap-4 flex-1">
        <div className={iconContainerClass}>
          <div className={iconColor}>
            {icon}
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[#2D2D2D]">{title}</h3>
          <p className="text-sm text-[#6B7280] mt-0.5">{description}</p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-[#9CA3AF]" />
    </div>
  );
}
