import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  change?: string;
  changePositive?: boolean;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = '#6F1219',
  iconBgColor = 'rgba(111,18,25,0.1)',
  change,
  changePositive = true,
}: StatCardProps) {
  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 transition-all duration-300 hover:border-[#3A3A3A]">
      <div className="flex items-center justify-between mb-4">
        <span className="font-body text-[13px] text-[#6B6B6B]">{title}</span>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: iconBgColor }}
        >
          <Icon size={20} style={{ color: iconColor }} />
        </div>
      </div>
      <div className="font-mono text-[28px] text-white leading-none mb-1">{value}</div>
      {change && (
        <span
          className={`font-body text-[12px] ${changePositive ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}
        >
          {changePositive ? '+' : ''}{change}
        </span>
      )}
    </div>
  );
}
