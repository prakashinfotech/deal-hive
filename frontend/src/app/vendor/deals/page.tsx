'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { PlusCircle, Tag, ExternalLink, Pencil } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface VendorDealDto {
  id: string;
  title: string;
  slug: string;
  status: string;
  originalPrice: number;
  discountedPrice: number;
  quantitySold: number;
  quantityTotal?: number;
  avgRating: number;
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  Active:          'bg-green-100 text-green-700',
  Draft:           'bg-gray-100 text-gray-600',
  PendingApproval: 'bg-yellow-100 text-yellow-700',
  Paused:          'bg-orange-100 text-orange-700',
  Expired:         'bg-red-100 text-red-600',
  Rejected:        'bg-red-100 text-red-600',
};

export default function VendorDealsPage() {
  const { data: deals, isLoading, error } = useQuery<VendorDealDto[]>({
    queryKey: ['vendor', 'deals'],
    queryFn: () => api.get<VendorDealDto[]>('/vendors/me/deals').then((r) => r.data),
    staleTime: 30_000,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Deals</h1>
          <p className="text-sm text-gray-500 mt-0.5">{deals?.length ?? 0} deal{deals?.length !== 1 ? 's' : ''} total</p>
        </div>
        <Link
          href="/vendor/deals/new"
          className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary-dark transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          New Deal
        </Link>
      </div>

      {isLoading && (
        <div className="space-y-3 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-2xl" />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-700 font-medium">Failed to load deals</p>
        </div>
      )}

      {!isLoading && deals?.length === 0 && (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="font-medium text-gray-700 mb-1">No deals yet</p>
          <p className="text-sm text-gray-500 mb-4">Create your first deal to start selling</p>
          <Link
            href="/vendor/deals/new"
            className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-dark transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Create Deal
          </Link>
        </div>
      )}

      {deals && deals.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-[1fr_120px_100px_80px_80px_80px] gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <span>Deal</span>
            <span>Status</span>
            <span>Price</span>
            <span>Sold</span>
            <span>Rating</span>
            <span>Actions</span>
          </div>

          <div className="divide-y divide-gray-100">
            {deals.map((deal) => {
              const discount = Math.round(
                ((deal.originalPrice - deal.discountedPrice) / deal.originalPrice) * 100
              );
              return (
                <div
                  key={deal.id}
                  className="grid grid-cols-1 md:grid-cols-[1fr_120px_100px_80px_80px_80px] gap-2 md:gap-4 items-center px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Title */}
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{deal.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Created {new Date(deal.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <span
                      className={cn(
                        'inline-block text-xs font-semibold px-2.5 py-1 rounded-full',
                        STATUS_STYLES[deal.status] ?? 'bg-gray-100 text-gray-600'
                      )}
                    >
                      {deal.status}
                    </span>
                  </div>

                  {/* Price */}
                  <div>
                    <p className="font-semibold text-sm text-gray-900">
                      {formatCurrency(deal.discountedPrice)}
                    </p>
                    <p className="text-xs text-gray-400 line-through">
                      {formatCurrency(deal.originalPrice)}
                    </p>
                    {discount > 0 && (
                      <span className="text-xs font-bold text-green-600">-{discount}%</span>
                    )}
                  </div>

                  {/* Sold */}
                  <div>
                    <p className="text-sm font-medium text-gray-700">{deal.quantitySold.toLocaleString()}</p>
                    {deal.quantityTotal && (
                      <p className="text-xs text-gray-400">of {deal.quantityTotal.toLocaleString()}</p>
                    )}
                  </div>

                  {/* Rating */}
                  <div>
                    {deal.avgRating > 0 ? (
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400 text-sm">★</span>
                        <span className="text-sm font-medium text-gray-700">
                          {deal.avgRating.toFixed(1)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/vendor/deals/${deal.id}`}
                      className="p-2 text-gray-400 hover:text-primary transition-colors rounded-lg hover:bg-primary-light"
                      title="Edit deal"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/deals/${deal.slug}`}
                      target="_blank"
                      className="p-2 text-gray-400 hover:text-primary transition-colors rounded-lg hover:bg-primary-light"
                      title="View public page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
