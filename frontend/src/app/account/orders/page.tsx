'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Package } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Order } from '@/types';
import type { PaginatedResponse } from '@/types';
import { useAppSelector } from '@/store';
import { selectIsSessionRestoring } from '@/store/slices/authSlice';

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Paid: 'bg-blue-100 text-blue-800',
  Fulfilled: 'bg-green-100 text-green-800',
  Cancelled: 'bg-gray-100 text-gray-600',
  Refunded: 'bg-purple-100 text-purple-800',
};

export default function OrdersPage() {
  const isSessionRestoring = useAppSelector(selectIsSessionRestoring);

  const { data, isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: () => api.get<PaginatedResponse<Order>>('/orders').then((r) => r.data),
    enabled: !isSessionRestoring,
  });

  if (isLoading) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 py-8">
        <div className="space-y-4 animate-pulse">
          {[1,2,3].map((i) => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const orders = data?.items ?? [];

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      <h1 className="font-display text-2xl font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No orders yet</p>
          <Link href="/" className="text-primary hover:underline font-medium">Browse deals →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900">#{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">{order.createdAt && formatDate(order.createdAt)}</p>
                </div>
                <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', STATUS_COLORS[order.status] ?? 'bg-gray-100')}>
                  {order.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</p>
                <p className="font-bold text-primary">{formatCurrency(order.totalAmount)}</p>
              </div>
              <Link href={`/account/orders/${order.id}`} className="mt-3 text-sm text-primary hover:underline font-medium inline-block">
                View Details →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
