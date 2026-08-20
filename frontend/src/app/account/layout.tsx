'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, Ticket, Heart, User, LogOut } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { logout, logoutUser, selectIsAuthenticated, selectIsSessionRestoring, selectCurrentUser, selectUserRole } from '@/store/slices/authSlice';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

const NAV_ITEMS = [
  { href: '/account/orders',   label: 'My Orders',   icon: ShoppingBag },
  { href: '/account/groupons', label: 'My Vouchers', icon: Ticket },
  { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/account/profile',  label: 'Profile',     icon: User },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isSessionRestoring = useAppSelector(selectIsSessionRestoring);
  const user = useAppSelector(selectCurrentUser);
  const role = useAppSelector(selectUserRole);

  // Wait for session restoration before deciding to redirect
  useEffect(() => {
    if (isSessionRestoring) return;
    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    // Vendors → vendor portal; Admins → admin portal
    if (role === 'Vendor') { router.replace('/vendor/dashboard'); return; }
    if (role === 'Admin' || role === 'SuperAdmin') { router.replace('/admin/dashboard'); return; }
  }, [isAuthenticated, isSessionRestoring, role, pathname, router]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push('/');
  };

  // Show nothing while restoring session (avoids redirect flash)
  if (isSessionRestoring && !isAuthenticated) return null;
  if (!isAuthenticated) return null;
  if (role === 'Vendor' || role === 'Admin' || role === 'SuperAdmin') return null;

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-60 flex-shrink-0">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            {/* User info */}
            <div className="p-5 border-b border-gray-100 bg-primary-light">
              <p className="font-semibold text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-gray-500 truncate">{user?.email}</p>
            </div>

            {/* Nav */}
            <nav className="p-2">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    pathname === href || pathname.startsWith(href + '/')
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
