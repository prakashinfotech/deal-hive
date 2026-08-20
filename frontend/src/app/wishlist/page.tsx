'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { DealCard, DealCardSkeleton } from '@/components/deals/DealCard';
import { useAppDispatch } from '@/store';
import { optimisticToggleWishlist } from '@/store/slices/dealsSlice';
import type { DealSummary } from '@/types';

export default function WishlistPage() {
  const dispatch = useAppDispatch();
  const qc = useQueryClient();

  const { data: wishlist = [], isLoading } = useQuery<DealSummary[]>({
    queryKey: ['wishlist'],
    queryFn: () => api.get<DealSummary[]>('/users/me/wishlist').then((r) => r.data),
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

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      <h1 className="text-2xl font-black text-[#1A1A1A] mb-8">My Wishlist</h1>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <DealCardSkeleton key={i} />)}
        </div>
      ) : wishlist.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#636366] mb-4">Your wishlist is empty</p>
          <Link href="/local" className="text-[#53A318] hover:underline font-bold">Browse deals →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {wishlist.map((deal) => (
            <DealCard key={deal.id} deal={deal} onWishlistToggle={() => toggleMutation.mutate(deal.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
