'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Package } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import type { Order } from '@/types';
import { useAppSelector } from '@/store';
import { selectIsSessionRestoring } from '@/store/slices/authSlice';

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Paid: 'bg-blue-100 text-blue-800',
  Fulfilled: 'bg-green-100 text-green-800',
  Cancelled: 'bg-gray-100 text-gray-600',
  Refunded: 'bg-purple-100 text-purple-800',
};

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const isSessionRestoring = useAppSelector(selectIsSessionRestoring);

  const { data: order, isLoading } = useQuery<Order>({
    queryKey: ['orders', id],
    queryFn: () => api.get<Order>(`/orders/${id}`).then((r) => r.data),
    enabled: !!id && !isSessionRestoring,
  });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-40 bg-gray-200 rounded-xl" />
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Order not found</p>
        <Link href="/account/orders" className="mt-4 text-primary hover:underline text-sm">
          ← Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/account/orders" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-display text-2xl font-bold">Order #{order.orderNumber}</h1>
        <span className={cn('ml-auto text-xs font-semibold px-2.5 py-1 rounded-full', STATUS_COLORS[order.status] ?? 'bg-gray-100')}>
          {order.status}
        </span>
      </div>

      {/* Order summary */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500 mb-1">Order Date</p>
            <p className="font-medium">{order.createdAt ? formatDate(order.createdAt) : '—'}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Order Number</p>
            <p className="font-medium">#{order.orderNumber}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Items</p>
            <p className="font-medium">{order.items?.length ?? 0}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Total</p>
            <p className="font-bold text-primary text-base">{formatCurrency(order.totalAmount)}</p>
          </div>
        </div>
      </div>

      {/* Order items */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Items</h2>
        <div className="divide-y divide-gray-100">
          {order.items?.map((item) => (
            <div key={item.id} className="py-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{item.dealTitle}</p>
                {item.optionTitle && (
                  <p className="text-sm text-gray-500 mt-0.5">{item.optionTitle}</p>
                )}
                <p className="text-sm text-gray-400 mt-1">Qty: {item.quantity}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-semibold">{formatCurrency(item.unitPrice * item.quantity)}</p>
                <p className="text-xs text-gray-400">{formatCurrency(item.unitPrice)} each</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 mt-2 pt-4 flex justify-between font-bold text-base">
          <span>Total</span>
          <span className="text-primary">{formatCurrency(order.totalAmount)}</span>
        </div>
      </div>

      {/* Vouchers */}
      {order.vouchers && order.vouchers.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Vouchers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {order.vouchers.map((v) => (
              <div key={v.id} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">{v.dealTitle}</p>
                <p className="font-mono font-bold text-lg tracking-widest text-gray-900">{v.code}</p>
                <p className="text-xs text-gray-400 mt-1">Expires: {formatDate(v.expiresAt)}</p>
              </div>
            ))}
          </div>
          <Link href="/account/groupons" className="mt-4 inline-block text-sm text-primary hover:underline font-medium">
            View all Groupons →
          </Link>
        </div>
      )}
    </div>
  );
}
