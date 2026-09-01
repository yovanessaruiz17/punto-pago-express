import React from 'react';
import { LucideIcon } from 'lucide-react';
import { formatCOP } from '../../utils/formatters';

interface StatCardProps {
  id?: string;
  title: string;
  amount: number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'emerald' | 'rose' | 'amber' | 'blue' | 'indigo' | 'neutral';
  badge?: string;
  badgeType?: 'positive' | 'negative' | 'neutral';
  tooltip?: string;
  isLarge?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  amount,
  subtitle,
  icon: Icon,
  variant = 'neutral',
  badge,
  badgeType = 'neutral',
  isLarge = false,
}) => {
  const variantStyles = {
    emerald: {
      bg: 'bg-emerald-50/70 border-emerald-200/80',
      iconBg: 'bg-emerald-500 text-white',
      amountColor: 'text-emerald-950',
    },
    rose: {
      bg: 'bg-rose-50/70 border-rose-200/80',
      iconBg: 'bg-rose-500 text-white',
      amountColor: 'text-rose-950',
    },
    amber: {
      bg: 'bg-amber-50/70 border-amber-200/80',
      iconBg: 'bg-amber-500 text-white',
      amountColor: 'text-amber-950',
    },
    blue: {
      bg: 'bg-blue-50/70 border-blue-200/80',
      iconBg: 'bg-blue-600 text-white',
      amountColor: 'text-blue-950',
    },
    indigo: {
      bg: 'bg-indigo-50/70 border-indigo-200/80',
      iconBg: 'bg-indigo-600 text-white',
      amountColor: 'text-indigo-950',
    },
    neutral: {
      bg: 'bg-white border-slate-200',
      iconBg: 'bg-slate-800 text-white',
      amountColor: 'text-slate-900',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      id={id}
      className={`rounded-2xl border p-5 transition-all duration-200 shadow-xs hover:shadow-sm ${style.bg}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 truncate">
            {title}
          </p>
          <p
            className={`font-extrabold tracking-tight ${
              isLarge ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
            } ${style.amountColor}`}
          >
            {formatCOP(amount)}
          </p>
        </div>

        <div className={`p-2.5 rounded-xl shrink-0 shadow-xs ${style.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-slate-100/80">
        <span className="text-xs text-slate-500 truncate font-medium">
          {subtitle || 'Valores en COP'}
        </span>
        {badge && (
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
              badgeType === 'positive'
                ? 'bg-emerald-100 text-emerald-800'
                : badgeType === 'negative'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {badge}
          </span>
        )}
      </div>
    </div>
  );
};
