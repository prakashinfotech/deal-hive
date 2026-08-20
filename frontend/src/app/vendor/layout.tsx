'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Tag, PlusCircle, Store, LogOut, ShoppingBag } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  logoutUser,
  selectIsAuthenticated,
  selectIsSessionRestoring,
  selectCurrentUser,
  selectUserRole,
} from '@/store/slices/authSlice';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

const NAV_ITEMS = [
  { href: '/vendor/dashboard', label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/vendor/deals',     label: 'My Deals',    icon: Tag },
  { href: '/vendor/deals/new', label: 'Create Deal', icon: PlusCircle },
  { href: '/vendor/orders',    label: 'Orders',      icon: ShoppingBag },
];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isSessionRestoring = useAppSelector(selectIsSessionRestoring);
  const user = useAppSelector(selectCurrentUser);
  const role = useAppSelector(selectUserRole);

  const isRegisterPage = pathname === '/vendor/register';

  useEffect(() => {
    // Register page is public — no redirect needed
    if (isRegisterPage) return;
    if (isSessionRestoring) return;
    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    // Authenticated non-vendor: send them to register
    if (role === 'Consumer') {
      router.replace('/vendor/register');
    }
  }, [isAuthenticated, isSessionRestoring, isRegisterPage, role, pathname, router]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push('/');
  };

  // Register page is public — render immediately without any auth check
  if (isRegisterPage) return <>{children}</>;

  if (isSessionRestoring && !isAuthenticated) return null;
  if (!isAuthenticated) return null;

  const isVendor = role === 'Vendor';

  if (!isVendor) return null;

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 bg-primary-light">
              <div className="flex items-center gap-2 mb-1">
                <Store className="w-4 h-4 text-primary" />
                <p className="font-semibold text-gray-900 text-sm">Vendor Portal</p>
              </div>
              <p className="text-xs text-gray-500 truncate">
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
                    pathname === href || (href !== '/vendor/deals/new' && pathname.startsWith(href + '/'))
                      ? 'bg-primary text-white'
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
