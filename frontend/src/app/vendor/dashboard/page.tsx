'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Tag,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Ticket,
  CheckCircle,
  Star,
  Clock,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import type { VendorDashboard } from '@/types';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  sub?: string;
}

function MetricCard({ title, value, icon: Icon, color, sub }: MetricCardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm font-medium text-gray-600 mt-0.5">{title}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function VendorDashboardPage() {
  const { data, isLoading, error } = useQuery<VendorDashboard>({
    queryKey: ['vendor', 'dashboard'],
    queryFn: () => api.get<VendorDashboard>('/vendors/me/dashboard').then((r) => r.data),
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div>
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="text-red-700 font-medium">Failed to load dashboard</p>
        <p className="text-sm text-red-500 mt-1">Please try refreshing the page.</p>
      </div>
    );
  }

  const stats = data!;
  const redemptionRate =
    stats.totalVouchers > 0
      ? Math.round((stats.redeemedVouchers / stats.totalVouchers) * 100)
      : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Overview of your vendor performance</p>
        </div>
        <Link
          href="/vendor/deals/new"
          className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary-dark transition-colors"
        >
          <Tag className="w-4 h-4" />
          New Deal
        </Link>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Total Deals"
          value={stats.totalDeals}
          icon={Tag}
          color="bg-blue-50 text-blue-600"
        />
        <MetricCard
          title="Active Deals"
          value={stats.activeDeals}
          icon={TrendingUp}
          color="bg-green-50 text-green-600"
          sub={stats.totalDeals > 0 ? `${Math.round((stats.activeDeals / stats.totalDeals) * 100)}% of total` : undefined}
        />
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          color="bg-emerald-50 text-emerald-600"
        />
        <MetricCard
          title="Pending Payout"
          value={formatCurrency(stats.pendingPayout)}
          icon={Clock}
          color="bg-orange-50 text-orange-600"
          sub="Estimated (10%)"
        />
        <MetricCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingCart}
          color="bg-purple-50 text-purple-600"
        />
        <MetricCard
          title="Total Vouchers"
          value={stats.totalVouchers}
          icon={Ticket}
          color="bg-indigo-50 text-indigo-600"
        />
        <MetricCard
          title="Redeemed"
          value={stats.redeemedVouchers}
          icon={CheckCircle}
          color="bg-teal-50 text-teal-600"
          sub={`${redemptionRate}% redemption rate`}
        />
        <MetricCard
          title="Avg Rating"
          value={stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '—'}
          icon={Star}
          color="bg-yellow-50 text-yellow-600"
          sub={stats.avgRating > 0 ? 'Out of 5.0' : 'No ratings yet'}
        />
      </div>

      {/* Quick actions */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/vendor/deals/new"
            className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-primary hover:bg-primary-light transition-colors group"
          >
            <div>
              <p className="font-medium text-sm text-gray-900">Create a Deal</p>
              <p className="text-xs text-gray-500 mt-0.5">Publish a new offer</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
          </Link>
          <Link
            href="/vendor/deals"
            className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-primary hover:bg-primary-light transition-colors group"
          >
            <div>
              <p className="font-medium text-sm text-gray-900">Manage Deals</p>
              <p className="text-xs text-gray-500 mt-0.5">View and edit your offers</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
          </Link>
          <Link
            href="/"
            className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-primary hover:bg-primary-light transition-colors group"
          >
            <div>
              <p className="font-medium text-sm text-gray-900">Browse Marketplace</p>
              <p className="text-xs text-gray-500 mt-0.5">See your deals live</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
}
