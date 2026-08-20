'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LayoutDashboard, Tag, Store, LogOut, ShieldCheck, ShoppingBag } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  logoutUser,
  selectIsAuthenticated,
  selectIsSessionRestoring,
  selectCurrentUser,
  selectUserRole,
} from '@/store/slices/authSlice';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/deals',     label: 'Deals',     icon: Tag },
  { href: '/admin/vendors',   label: 'Vendors',   icon: Store },
  { href: '/admin/orders',    label: 'Orders',    icon: ShoppingBag },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isSessionRestoring = useAppSelector(selectIsSessionRestoring);
  const user = useAppSelector(selectCurrentUser);
  const role = useAppSelector(selectUserRole);

  useEffect(() => {
    if (isSessionRestoring) return;
    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (role !== 'Admin' && role !== 'SuperAdmin') {
      router.replace('/');
    }
  }, [isAuthenticated, isSessionRestoring, role, pathname, router]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push('/');
  };

  if (isSessionRestoring && !isAuthenticated) return null;
  if (!isAuthenticated) return null;
  if (role !== 'Admin' && role !== 'SuperAdmin') return null;

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 bg-gray-900">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-white" />
                <p className="font-semibold text-white text-sm">Admin Portal</p>
              </div>
              <p className="text-xs text-gray-300 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>

            {/* Nav */}
            <nav className="p-2">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    pathname.startsWith(href)
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </Link>
              ))}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors mt-1"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                Sign Out
              </button>
            </nav>
          </div>
        </aside>

        {/* Page content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
