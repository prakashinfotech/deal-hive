'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  expiresAt: string;
  className?: string;
  variant?: 'default' | 'inline';
}

export default function CountdownTimer({ expiresAt, className, variant = 'default' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(expiresAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(expiresAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (timeLeft.expired) return <span className="text-gray-400 text-sm">Expired</span>;

  const isUrgent = timeLeft.totalSeconds < 24 * 3600;

  // Inline variant: single HH:MM:SS string (used in the buy-box countdown banner)
  if (variant === 'inline') {
    const hh = String(timeLeft.days * 24 + timeLeft.hours).padStart(2, '0');
    const mm = String(timeLeft.minutes).padStart(2, '0');
    const ss = String(timeLeft.seconds).padStart(2, '0');
    return (
      <span className={cn('font-mono font-bold', isUrgent && 'text-red-600', className)}>
        {hh}:{mm}:{ss}
      </span>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', isUrgent && 'animate-pulse', className)}>
      {timeLeft.days > 0 && <TimeUnit value={timeLeft.days} label="d" urgent={isUrgent} />}
      <TimeUnit value={timeLeft.hours} label="h" urgent={isUrgent} />
      <TimeUnit value={timeLeft.minutes} label="m" urgent={isUrgent} />
      <TimeUnit value={timeLeft.seconds} label="s" urgent={isUrgent} />
    </div>
  );
}

function TimeUnit({ value, label, urgent }: { value: number; label: string; urgent: boolean }) {
  return (
    <div className={cn(
      'flex flex-col items-center bg-gray-100 rounded-lg px-2 py-1 min-w-[40px]',
      urgent && 'bg-red-100'
    )}>
      <span className={cn('text-lg font-bold tabular-nums leading-none', urgent && 'text-red-600')}>
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</span>
    </div>
  );
}

function parseDateStr(dateStr: string): number {
  if (/^\d{4}-/.test(dateStr)) return new Date(dateStr).getTime();
  const m = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})\s(\d{2}):(\d{2}):(\d{2})$/);
  if (m) return Date.UTC(+m[3], +m[2] - 1, +m[1], +m[4], +m[5], +m[6]);
  return NaN;
}

function getTimeLeft(expiresAt: string) {
  const now = Date.now();
  const end = parseDateStr(expiresAt);
  const diff = end - now;

  if (diff <= 0) return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { expired: false, days, hours, minutes, seconds, totalSeconds };
}
