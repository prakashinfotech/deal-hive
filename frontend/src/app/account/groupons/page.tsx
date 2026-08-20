'use client';

import { useQuery } from '@tanstack/react-query';
import { Ticket } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Voucher } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  Active: 'bg-green-100 text-green-800',
  Redeemed: 'bg-gray-100 text-gray-600',
  Expired: 'bg-red-100 text-red-700',
  Refunded: 'bg-purple-100 text-purple-800',
};

export default function MyGrouponsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['vouchers'],
    queryFn: () => api.get<{ items: Voucher[] }>('/vouchers').then((r) => r.data),
  });

  const vouchers = data?.items ?? [];

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      <h1 className="text-2xl font-black text-[#1A1A1A] mb-8">My Groupons</h1>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3].map((i) => <div key={i} className="h-40 bg-gray-200 rounded" />)}
        </div>
      ) : vouchers.length === 0 ? (
        <div className="text-center py-16">
          <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#636366] mb-4">No Groupons yet</p>
          <Link href="/local" className="text-[#53A318] hover:underline font-bold">Browse deals →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vouchers.map((voucher) => (
            <div key={voucher.id} className={cn(
              'bg-white border border-[#E0E0E0] rounded p-5 shadow-card',
              voucher.status === 'Active' && 'border-[#53A318]/40'
            )}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#1A1A1A] truncate text-sm">{voucher.dealTitle}</p>
                  <p className="text-xs text-[#636366]">{voucher.vendorName}</p>
                </div>
                <span className={cn('ml-2 text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0', STATUS_COLORS[voucher.status])}>
                  {voucher.status}
                </span>
              </div>

              <div className="bg-[#F5F5F5] rounded p-3 mb-3 text-center">
                <p className="text-xs text-[#636366] mb-1">Voucher Code</p>
                <p className="font-mono font-black text-lg tracking-widest text-[#1A1A1A]">{voucher.code}</p>
              </div>

              <div className="text-xs text-[#636366]">
                <p>Expires: {formatDate(voucher.expiresAt)}</p>
                {voucher.redeemedAt && <p>Redeemed: {formatDate(voucher.redeemedAt)}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
