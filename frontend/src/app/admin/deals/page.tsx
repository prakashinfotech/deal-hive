'use client';

import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, ExternalLink, ChevronLeft, ChevronRight, AlertCircle, PauseCircle, PlayCircle } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/store';
import { selectIsSessionRestoring } from '@/store/slices/authSlice';

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
  page: number;
  pageSize: number;
  totalPages: number;
}

const STATUS_TABS = [
  { label: 'All',      value: '' },
  { label: 'Pending',  value: 'PendingApproval' },
  { label: 'Active',   value: 'Active' },
  { label: 'Paused',   value: 'Paused' },
  { label: 'Rejected', value: 'Rejected' },
  { label: 'Expired',  value: 'Expired' },
];

const STATUS_STYLES: Record<string, string> = {
  Active:          'bg-green-100 text-green-700',
  Draft:           'bg-gray-100 text-gray-600',
  PendingApproval: 'bg-amber-100 text-amber-700',
  Paused:          'bg-orange-100 text-orange-700',
  Rejected:        'bg-red-100 text-red-600',
  Expired:         'bg-red-100 text-red-400',
};

export default function AdminDealsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const isSessionRestoring = useAppSelector(selectIsSessionRestoring);

  const statusFilter = searchParams.get('status') ?? '';
  const page = parseInt(searchParams.get('page') ?? '1', 10);

  const [rejectModal, setRejectModal] = useState<{ id: string; title: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const { data, isLoading } = useQuery<PaginatedDealsResponse>({
    queryKey: ['admin', 'deals', statusFilter, page],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), pageSize: '20' });
      if (statusFilter) params.set('status', statusFilter);
      return api.get<PaginatedDealsResponse>(`/admin/deals?${params}`).then(r => r.data);
    },
    enabled: !isSessionRestoring,
    staleTime: 15_000,
  });

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'deals'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'analytics'] });
  }, [queryClient]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await api.put(`/admin/deals/${id}/approve`);
      showToast('Deal approved.', true);
      invalidate();
    } catch {
      showToast('Failed to approve deal.', false);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePause = async (id: string) => {
    setActionLoading(id);
    try {
      await api.put(`/admin/deals/${id}/pause`);
      showToast('Deal paused.', true);
      invalidate();
    } catch {
      showToast('Failed to pause deal.', false);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResume = async (id: string) => {
    setActionLoading(id);
    try {
      await api.put(`/admin/deals/${id}/resume`);
      showToast('Deal resumed.', true);
      invalidate();
    } catch {
      showToast('Failed to resume deal.', false);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal || !rejectReason.trim()) return;
    setActionLoading(rejectModal.id);
    try {
      await api.put(`/admin/deals/${rejectModal.id}/reject`, { reason: rejectReason });
      showToast('Deal rejected.', true);
      setRejectModal(null);
      setRejectReason('');
      invalidate();
    } catch {
      showToast('Failed to reject deal.', false);
    } finally {
      setActionLoading(null);
    }
  };

  const setStatus = (s: string) => {
    const p = new URLSearchParams();
    if (s) p.set('status', s);
    router.push(`/admin/deals?${p.toString()}`);
  };

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    router.push(`/admin/deals?${params.toString()}`);
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={cn(
          'fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2',
          toast.ok ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        )}>
          {toast.ok ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-bold text-gray-900 mb-1">Reject Deal</h3>
            <p className="text-sm text-gray-500 mb-4 truncate">"{rejectModal.title}"</p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (required)…"
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="flex-1 border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || !!actionLoading}
                className="flex-1 bg-red-600 text-white font-semibold py-2.5 rounded-xl hover:bg-red-700 text-sm disabled:opacity-50"
              >
                {actionLoading ? 'Rejecting…' : 'Reject Deal'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
        <p className="text-sm text-gray-500 mt-0.5">{data?.totalCount ?? 0} deal{data?.totalCount !== 1 ? 's' : ''}</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setStatus(tab.value)}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors',
              statusFilter === tab.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-[1fr_140px_90px_70px_110px_100px] gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <span>Deal</span>
          <span>Vendor</span>
          <span>Price</span>
          <span>Sold</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {isLoading && (
          <div className="space-y-px">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-50 animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && !data?.items.length && (
          <div className="py-14 text-center text-sm text-gray-400">No deals found</div>
        )}

        {!isLoading && data?.items.map((deal) => (
          <div
            key={deal.id}
            className="grid grid-cols-1 md:grid-cols-[1fr_140px_90px_70px_110px_100px] gap-2 md:gap-4 items-center px-5 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{deal.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(deal.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <p className="text-sm text-gray-600 truncate">{deal.vendorName}</p>
            <p className="text-sm font-semibold text-gray-900">{formatCurrency(deal.discountedPrice)}</p>
            <p className="text-sm text-gray-600">{deal.quantitySold.toLocaleString()}</p>
            <span className={cn(
              'inline-block text-xs font-semibold px-2.5 py-1 rounded-full w-fit',
              STATUS_STYLES[deal.status] ?? 'bg-gray-100 text-gray-600'
            )}>
              {deal.status === 'PendingApproval' ? 'Pending' : deal.status}
            </span>
            <div className="flex items-center gap-1">
              {/* PendingApproval → Approve or Reject */}
              {deal.status === 'PendingApproval' && (
                <>
                  <button
                    onClick={() => handleApprove(deal.id)}
                    disabled={actionLoading === deal.id}
                    title="Approve"
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-40"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setRejectModal({ id: deal.id, title: deal.title })}
                    disabled={!!actionLoading}
                    title="Reject"
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </>
              )}
              {/* Active → Pause */}
              {deal.status === 'Active' && (
                <button
                  onClick={() => handlePause(deal.id)}
                  disabled={actionLoading === deal.id}
                  title="Pause deal"
                  className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-40"
                >
                  <PauseCircle className="w-4 h-4" />
                </button>
              )}
              {/* Paused → Resume */}
              {deal.status === 'Paused' && (
                <button
                  onClick={() => handleResume(deal.id)}
                  disabled={actionLoading === deal.id}
                  title="Resume deal"
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-40"
                >
                  <PlayCircle className="w-4 h-4" />
                </button>
              )}
              {/* Always: view public page */}
              <Link
                href={`/deals/${deal.slug}`}
                target="_blank"
                title="View public page"
                className="p-2 text-gray-400 hover:text-primary hover:bg-primary-light rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between mt-5 text-sm">
          <p className="text-gray-500">
            Page {data.page} of {data.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= data.totalPages}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
