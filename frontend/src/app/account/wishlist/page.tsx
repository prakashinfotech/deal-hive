'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { DealCard, DealCardSkeleton } from '@/components/deals/DealCard';
import { useAppDispatch, useAppSelector } from '@/store';
import { optimisticToggleWishlist } from '@/store/slices/dealsSlice';
import { selectIsSessionRestoring } from '@/store/slices/authSlice';
import type { DealSummary } from '@/types';

export default function WishlistPage() {
  const dispatch = useAppDispatch();
  const qc = useQueryClient();
  const isSessionRestoring = useAppSelector(selectIsSessionRestoring);

  const { data: wishlist = [], isLoading } = useQuery<DealSummary[]>({
    queryKey: ['wishlist'],
    queryFn: () => api.get<DealSummary[]>('/users/me/wishlist').then((r) => r.data),
    enabled: !isSessionRestoring,
  });

  const toggleMutation = useMutation({
    mutationFn: (dealId: string) =>
      api.post<{ wishlisted: boolean }>('/users/me/wishlist', { dealId }).then((r) => r.data),
    onMutate: async (dealId) => {
      dispatch(optimisticToggleWishlist(dealId));
      await qc.cancelQueries({ queryKey: ['wishlist'] });
      const prev = qc.getQueryData<DealSummary[]>(['wishlist']);
      qc.setQueryData<DealSummary[]>(['wishlist'], (old) => old?.filter((d) => d.id !== dealId) ?? []);
      return { prev };
    },
    onError: (_err, _dealId, ctx) => {
      if (ctx?.prev) qc.setQueryData(['wishlist'], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['wishlist'] }),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4].map((i) => <DealCardSkeleton key={i} />)}
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="text-center py-16">
        <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-[#636366] mb-4">Your wishlist is empty</p>
        <Link href="/local" className="text-[#53A318] hover:underline font-bold">Browse deals →</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Wishlist</h1>
        <p className="text-sm text-gray-500 mt-0.5">{wishlist.length} saved deal{wishlist.length !== 1 ? 's' : ''}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {wishlist.map((deal) => (
          <DealCard key={deal.id} deal={deal} onWishlistToggle={() => toggleMutation.mutate(deal.id)} />
        ))}
      </div>
    </div>
  );
}
