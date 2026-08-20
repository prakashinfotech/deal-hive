'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { DollarSign, ShoppingBag, Tag, Clock, TrendingUp, ChevronRight } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useAppSelector } from '@/store';
import { selectIsSessionRestoring } from '@/store/slices/authSlice';
import { cn } from '@/lib/utils';

interface AnalyticsResponse {
  gmv: number;
  ordersToday: number;
  newUsersToday: number;
  activeDeals: number;
  pendingApprovals: number;
}

interface AdminDealDto {
  id: string;
  title: string;
  slug: string;
  status: string;
  vendorName: string;
  discountedPrice: number;
  quantitySold: number;
  createdAt: string;
}

interface PaginatedDealsResponse {
  items: AdminDealDto[];
  totalCount: number;
}

export default function AdminDashboardPage() {
  const isSessionRestoring = useAppSelector(selectIsSessionRestoring);

  const { data: analytics, isLoading: analyticsLoading } = useQuery<AnalyticsResponse>({
    queryKey: ['admin', 'analytics'],
    queryFn: () => api.get<AnalyticsResponse>('/admin/analytics/overview').then(r => r.data),
    enabled: !isSessionRestoring,
    staleTime: 30_000,
  });

  const { data: pendingDeals } = useQuery<PaginatedDealsResponse>({
    queryKey: ['admin', 'deals', 'PendingApproval'],
    queryFn: () => api.get<PaginatedDealsResponse>('/admin/deals?status=PendingApproval&pageSize=5').then(r => r.data),
    enabled: !isSessionRestoring,
    staleTime: 30_000,
  });

  const stats = [
    {
      label: 'Total GMV',
      value: analytics ? formatCurrency(analytics.gmv) : '—',
      icon: DollarSign,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Orders Today',
      value: analytics ? analytics.ordersToday.toLocaleString() : '—',
      icon: ShoppingBag,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Active Deals',
      value: analytics ? analytics.activeDeals.toLocaleString() : '—',
      icon: Tag,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Pending Approvals',
      value: analytics ? analytics.pendingApprovals.toLocaleString() : '—',
      icon: Clock,
      color: analytics?.pendingApprovals ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-500',
      urgent: (analytics?.pendingApprovals ?? 0) > 0,
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Platform overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, urgent }) => (
          <div
            key={label}
            className={cn(
              'bg-white border rounded-2xl p-5 shadow-sm',
              urgent ? 'border-amber-300' : 'border-gray-100'
            )}
          >
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', color)}>
              <Icon className="w-5 h-5" />
            </div>
            {analyticsLoading ? (
              <div className="h-7 w-20 bg-gray-100 rounded animate-pulse mb-1" />
            ) : (
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            )}
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Pending Deals */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            <h2 className="font-semibold text-gray-900 text-sm">Deals Awaiting Approval</h2>
            {(pendingDeals?.totalCount ?? 0) > 0 && (
              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingDeals!.totalCount}
              </span>
            )}
          </div>
          <Link href="/admin/deals?status=PendingApproval" className="text-xs text-primary hover:underline flex items-center gap-1">
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {!pendingDeals?.items.length ? (
          <div className="py-10 text-center text-sm text-gray-400">No deals pending approval</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pendingDeals.items.map((deal) => (
              <div key={deal.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{deal.title}</p>
                  <p className="text-xs text-gray-400">{deal.vendorName} · {formatCurrency(deal.discountedPrice)}</p>
                </div>
                <Link
                  href="/admin/deals?status=PendingApproval"
                  className="ml-4 text-xs text-primary font-medium hover:underline whitespace-nowrap"
                >
                  Review →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
