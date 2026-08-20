'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/store';
import { selectIsSessionRestoring } from '@/store/slices/authSlice';

interface OrderItemDto {
  id: string;
  dealTitle: string;
  optionTitle?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  vendorId: string;
}

interface OrderDto {
  id: string;
  orderNumber: string;
  status: string;
  items: OrderItemDto[];
  totalAmount: number;
  currency: string;
  paidAt?: string;
  createdAt: string;
}

interface PaginatedOrdersResponse {
  items: OrderDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const STATUS_STYLES: Record<string, string> = {
  Pending:   'bg-gray-100 text-gray-600',
  Paid:      'bg-green-100 text-green-700',
  Fulfilled: 'bg-blue-100 text-blue-700',
  Cancelled: 'bg-red-100 text-red-600',
  Refunded:  'bg-orange-100 text-orange-600',
};

export default function VendorOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSessionRestoring = useAppSelector(selectIsSessionRestoring);

  const page = parseInt(searchParams.get('page') ?? '1', 10);

  const { data, isLoading } = useQuery<PaginatedOrdersResponse>({
    queryKey: ['vendor', 'orders', page],
    queryFn: () => api.get<PaginatedOrdersResponse>(`/vendors/me/orders?page=${page}&pageSize=20`).then(r => r.data),
    enabled: !isSessionRestoring,
    staleTime: 30_000,
  });

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    router.push(`/vendor/orders?${params.toString()}`);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500 mt-0.5">Orders placed for your deals</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-[120px_1fr_100px_90px_110px] gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <span>Order #</span>
          <span>Items</span>
          <span>Total</span>
          <span>Status</span>
          <span>Date</span>
        </div>

        {isLoading && (
          <div className="space-y-px">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-50 animate-pulse" />)}
          </div>
        )}

        {!isLoading && !data?.items.length && (
          <div className="py-16 text-center">
            <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No orders yet</p>
          </div>
        )}

        {!isLoading && data?.items.map((order) => (
          <div
            key={order.id}
            className="grid grid-cols-1 md:grid-cols-[120px_1fr_100px_90px_110px] gap-2 md:gap-4 items-start px-5 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50"
          >
            <p className="text-xs font-mono font-medium text-gray-700 truncate">{order.orderNumber}</p>
            <div className="space-y-1">
              {order.items.map((item) => (
                <p key={item.id} className="text-sm text-gray-800">
                  {item.dealTitle}
                  {item.optionTitle && <span className="text-gray-400"> — {item.optionTitle}</span>}
                  <span className="text-gray-400 ml-1">×{item.quantity}</span>
                </p>
              ))}
            </div>
            <p className="text-sm font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</p>
            <span className={cn(
              'inline-block text-xs font-semibold px-2.5 py-1 rounded-full w-fit',
              STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-600'
            )}>
              {order.status}
            </span>
            <p className="text-xs text-gray-400">
              {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        ))}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between mt-5 text-sm">
          <p className="text-gray-500">Page {data.page} of {data.totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(page - 1)} disabled={page <= 1} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setPage(page + 1)} disabled={page >= data.totalPages} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
