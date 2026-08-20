'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, Heart, ShoppingCart, ChevronDown, User, LogOut, Package, Menu, X, Trash2, Tag, Eye, Gift, Languages, Store, ArrowLeft } from 'lucide-react';
import { login } from '@/store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '@/store';
import { selectCurrentUser, selectIsAuthenticated, logoutUser } from '@/store/slices/authSlice';
import { selectCartCount, selectCartItems, selectCartTotal, removeItem, updateQuantity } from '@/store/slices/cartSlice';

// ─── Mega-menu data matching Groupon's nav ────────────────────
const NAV_ITEMS = [
  {
    label: 'Beauty & Spas',
    href: '/local/beauty-and-spas',
    cols: [
      { heading: 'Popular', links: [
        { label: 'Massage', href: '/local/massage' },
        { label: 'Hair Removal', href: '/local/hair-removal' },
        { label: 'Face & Skin Care', href: '/local/skin-care' },
        { label: 'Spas', href: '/local/spa' },
        { label: 'Hair & Styling', href: '/local/hair-salons' },
        { label: 'Nail Salons', href: '/local/nail-salons' },
        { label: 'Brows & Lashes', href: '/local/brow-and-lash' },
        { label: 'Health & Fitness', href: '/local/health-and-fitness' },
      ]},
    ],
  },
  {
    label: 'Things To Do',
    href: '/local/things-to-do',
    cols: [
      { heading: 'Activities', links: [
        { label: 'Fun & Leisure', href: '/local/fun-and-leisure-activities' },
        { label: 'Tickets & Events', href: '/local/tickets-and-events' },
        { label: 'Kids Activities', href: '/local/kids-activities' },
        { label: 'Sightseeing & Tours', href: '/local/sightseeing-and-tours' },
        { label: 'Sports & Outdoors', href: '/local/sports-and-outdoor-activities' },
        { label: 'Classes', href: '/local/classes' },
        { label: 'Escape Games', href: '/local/escape-games' },
        { label: 'Boat Tours', href: '/local/boat-tours' },
      ]},
    ],
  },
  {
    label: 'Auto & Home',
    href: '/local/automotive',
    cols: [
      { heading: 'Services', links: [
        { label: 'Oil Changes', href: '/local/oil-change' },
        { label: 'Auto Repair', href: '/local/auto-repair' },
        { label: 'Car Wash', href: '/local/car-wash' },
        { label: 'Home Cleaning', href: '/local/cleaning-services' },
        { label: 'Home Improvement', href: '/local/home-improvement' },
        { label: 'Parking', href: '/local/parking' },
      ]},
    ],
  },
  {
    label: 'Food & Drink',
    href: '/local/food-and-drink',
    cols: [
      { heading: 'Dining', links: [
        { label: 'Restaurants', href: '/local/restaurants' },
        { label: 'Bars & Nightlife', href: '/local/bars' },
        { label: 'Cafes & Treats', href: '/local/cafes-and-treats' },
        { label: 'Bakeries', href: '/local/bakeries' },
        { label: 'Breweries', href: '/local/breweries-wineries-and-distilleries' },
      ]},
    ],
  },
  {
    label: 'Gifts',
    href: '/gift',
    cols: [
      { heading: 'By Recipient', links: [
        { label: 'For Her', href: '/gift/for-her' },
        { label: 'For Him', href: '/gift/for-him' },
        { label: 'For Couples', href: '/gift/for-couples' },
        { label: 'For Kids', href: '/gift/for-kids' },
      ]},
      { heading: 'By Occasion', links: [
        { label: 'Birthday', href: '/gift/birthday' },
        { label: 'Anniversary', href: '/gift/anniversary' },
        { label: 'Wedding', href: '/gift/wedding' },
        { label: 'Graduation', href: '/gift/graduation' },
      ]},
    ],
  },
  {
    label: 'Local',
    href: '/local',
    cols: [
      { heading: 'Near You', links: [
        { label: 'All Local Deals', href: '/local' },
        { label: 'Beauty & Spas', href: '/local/beauty-and-spas' },
        { label: 'Things To Do', href: '/local/things-to-do' },
        { label: 'Food & Drink', href: '/local/food-and-drink' },
      ]},
    ],
  },
  {
    label: 'Travel',
    href: '/travel',
    cols: [
      { heading: 'Destinations', links: [
        { label: 'Hotels', href: '/travel/hotels' },
        { label: 'Resorts', href: '/travel/resorts' },
        { label: 'Weekend Getaways', href: '/travel/weekend-getaways' },
        { label: 'Cruises', href: '/travel/cruises' },
        { label: 'Theme Parks', href: '/travel/waterparks' },
        { label: 'All-Inclusive', href: '/travel/all-inclusive' },
        { label: 'Family Trips', href: '/travel/family-trips' },
        { label: 'Spa & Wellness', href: '/travel/spa-and-wellness' },
      ]},
    ],
  },
  {
    label: 'Goods',
    href: '/goods',
    cols: [
      { heading: 'Shop', links: [
        { label: 'Electronics', href: '/goods/electronics' },
        { label: 'Fashion', href: '/goods/womens-clothing-shoes-and-accessories' },
        { label: 'Home & Garden', href: '/goods/for-the-home' },
        { label: 'Health & Beauty', href: '/goods/health-and-beauty' },
        { label: 'Sports', href: '/goods/sports-and-outdoors' },
        { label: 'Personalized Gifts', href: '/goods/v1-personalized-items' },
        { label: 'Jewelry', href: '/goods/jewelry-and-watches' },
      ]},
    ],
  },
];

export default function Navbar() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const cartCount = useAppSelector(selectCartCount);
  const cartItems = useAppSelector(selectCartItems);
  const cartTotal = useAppSelector(selectCartTotal);

  const [search, setSearch] = useState('');

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginStep, setLoginStep] = useState<'email' | 'password'>('email');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginEmailErr, setLoginEmailErr] = useState('');
  const [loginPwErr, setLoginPwErr] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<string | null>(null);
  const navTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cartRef = useRef<HTMLDivElement>(null);
  const loginRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close cart on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) {
        setCartOpen(false);
      }
    };
    if (cartOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [cartOpen]);

  // Close login popup on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (loginRef.current && !loginRef.current.contains(e.target as Node)) {
        setLoginOpen(false);
      }
    };
    if (loginOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [loginOpen]);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  const openLogin = () => {
    setLoginOpen(true);
    setLoginStep('email');
    setLoginEmail('');
    setLoginPassword('');
    setLoginEmailErr('');
    setLoginPwErr('');
    setLoginError('');
    setCartOpen(false);
  };

  const handleLoginContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)) {
      setLoginEmailErr('Please enter a valid email address.');
      return;
    }
    setLoginEmailErr('');
    setLoginStep('password');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPassword) { setLoginPwErr('Password is required.'); return; }
    setLoginPwErr('');
    setLoginLoading(true);
    setLoginError('');
    const result = await dispatch(login({ email: loginEmail, password: loginPassword }));
    setLoginLoading(false);
    if (login.fulfilled.match(result)) {
      setLoginOpen(false);
    } else {
      setLoginError('Invalid email or password.');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push('/');
  };

  const handleNavEnter = (label: string) => {
    if (navTimeout.current) clearTimeout(navTimeout.current);
    setActiveNav(label);
  };

  const handleNavLeave = () => {
    navTimeout.current = setTimeout(() => setActiveNav(null), 150);
  };

  useEffect(() => () => { if (navTimeout.current) clearTimeout(navTimeout.current); }, []);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-nav">
      {/* ── Promo Strip ── */}
      <div className="bg-gradient-to-r from-[#2D1B6E] via-[#1E3A8A] to-[#1E40AF] text-white text-xs py-2 px-4 flex items-center justify-center gap-3">
        <span className="font-medium">Up to 80% off local favorites — Top-rated spots near you for less with code <span className="font-bold">MAYSALE</span></span>
        <a href="/local" className="flex-shrink-0 bg-white text-[#1E3A8A] font-bold text-xs px-3 py-1 rounded-full hover:bg-gray-100 transition-colors">
          Shop Now!
        </a>
      </div>

      {/* ── Main Header Row ── */}
      <div className="bg-white border-b border-[#E0E0E0]">
        <div className="max-w-[1280px] mx-auto px-4 h-14 flex items-center gap-3">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 mr-2">
            <span className="text-[#53A318] font-black text-2xl tracking-tight leading-none">
              DealHive
            </span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 flex items-center">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search deals: spa, massage, oil change, tours…"
                className="w-full pl-9 pr-4 py-2 border border-[#E0E0E0] rounded text-sm outline-none focus:border-[#53A318] focus:ring-1 focus:ring-[#53A318] bg-[#F5F5F5] focus:bg-white transition-colors"
              />
            </div>
            <button
              type="submit"
              className="ml-2 bg-[#53A318] hover:bg-[#438F10] text-white font-bold px-5 py-2 rounded text-sm transition-colors flex-shrink-0"
            >
              Search
            </button>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-1">
            {/* Cart button + popup */}
            <div className="relative" ref={cartRef}>
              <button
                onClick={() => setCartOpen((o) => !o)}
                className="relative flex flex-col items-center p-2 hover:text-[#53A318] transition-colors"
                aria-label="Open cart"
              >
                <ShoppingCart className="w-5 h-5 text-gray-600" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0.5 bg-[#53A318] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
                <span className="hidden md:block text-[10px] text-gray-500 mt-0.5">Cart</span>
              </button>

              {/* Cart dropdown popup */}
              {cartOpen && (
                <div className="absolute right-0 top-full mt-2 w-[400px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h2 className="text-base font-bold text-gray-900">Your Cart</h2>
                    <button
                      onClick={() => setCartOpen(false)}
                      className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {cartItems.length === 0 ? (
                    /* Empty state */
                    <div className="px-5 py-10 text-center">
                      <ShoppingCart className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">Your cart is empty</p>
                      <Link
                        href="/local"
                        onClick={() => setCartOpen(false)}
                        className="mt-3 inline-block text-sm font-bold text-[#53A318] hover:underline"
                      >
                        Browse deals →
                      </Link>
                    </div>
                  ) : (
                    <>
                      {/* Items list */}
                      <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100">
                        {cartItems.map((item) => (
                          <div key={`${item.dealId}-${item.dealOptionId ?? ''}`} className="flex gap-3 px-5 py-4">
                            {/* Image */}
                            <div className="relative w-[72px] h-[72px] flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                              {item.primaryImageUrl ? (
                                <Image
                                  src={item.primaryImageUrl}
                                  alt={item.dealTitle}
                                  fill
                                  className="object-cover"
                                  sizes="72px"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200" />
                              )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">
                                {item.dealTitle}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">{item.vendorName}</p>
                              {item.optionTitle && (
                                <p className="text-xs text-gray-400 mt-0.5">{item.optionTitle}</p>
                              )}

                              {/* Price + total */}
                              <div className="mt-2">
                                <span className="text-sm text-gray-500">${item.unitPrice.toFixed(2)}</span>
                                <span className="ml-2 text-base font-bold text-[#53A318]">
                                  ${(item.unitPrice * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col items-end justify-between flex-shrink-0">
                              {/* Delete */}
                              <button
                                onClick={() => dispatch(removeItem({ dealId: item.dealId, dealOptionId: item.dealOptionId }))}
                                className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-500"
                                aria-label="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>

                              {/* Quantity dropdown */}
                              <div className="relative">
                                <select
                                  value={item.quantity}
                                  onChange={(e) => dispatch(updateQuantity({
                                    dealId: item.dealId,
                                    dealOptionId: item.dealOptionId,
                                    quantity: Number(e.target.value),
                                  }))}
                                  className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-6 py-1.5 text-sm font-bold text-gray-800 cursor-pointer hover:border-gray-300 transition-colors focus:outline-none focus:border-[#53A318]"
                                >
                                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                    <option key={n} value={n}>{n}</option>
                                  ))}
                                </select>
                                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
                        <Link
                          href="/checkout"
                          onClick={() => setCartOpen(false)}
                          className="block w-full bg-[#1a7a2d] hover:bg-[#145e22] text-white font-bold text-sm text-center py-3.5 rounded-full transition-colors"
                        >
                          Proceed to Checkout
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist */}
            <Link href="/account/wishlist" className="flex flex-col items-center p-2 hover:text-[#53A318] transition-colors">
              <Heart className="w-5 h-5 text-gray-600" />
              <span className="hidden md:block text-[10px] text-gray-500 mt-0.5">Wishlist</span>
            </Link>

            {/* Sign in / account */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex flex-col items-center p-2 hover:text-[#53A318] transition-colors"
                >
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="hidden md:block text-[10px] text-gray-500 mt-0.5">
                    {user?.firstName}
                  </span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-1 w-56 bg-white rounded shadow-dropdown border border-[#E0E0E0] py-1 z-50 animate-fade-in">
                    <div className="px-4 py-2.5 border-b border-[#E0E0E0]">
                      <p className="font-bold text-sm">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                    </div>
                    {(!user?.role || user.role === 'Consumer') && (
                      <>
                        <Link href="/account/orders" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[#F5F5F5]" onClick={() => setUserMenuOpen(false)}>
                          <Package className="w-4 h-4 text-gray-500" /> My Orders
                        </Link>
                        <Link href="/account/groupons" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[#F5F5F5]" onClick={() => setUserMenuOpen(false)}>
                          <Package className="w-4 h-4 text-gray-500" /> My Vouchers
                        </Link>
                      </>
                    )}
                    <Link href="/account/wishlist" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[#F5F5F5]" onClick={() => setUserMenuOpen(false)}>
                      <Heart className="w-4 h-4 text-gray-500" /> Wishlist
                    </Link>
                    {user?.role === 'Vendor' && (
                      <Link href="/vendor/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[#F5F5F5]" onClick={() => setUserMenuOpen(false)}>
                        <Package className="w-4 h-4 text-gray-500" /> Vendor Portal
                      </Link>
                    )}
                    {(user?.role === 'Admin' || user?.role === 'SuperAdmin') && (
                      <Link href="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[#F5F5F5]" onClick={() => setUserMenuOpen(false)}>
                        <Package className="w-4 h-4 text-gray-500" /> Admin Panel
                      </Link>
                    )}
                    <hr className="my-1 border-[#E0E0E0]" />
                    <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative" ref={loginRef}>
                {/* User icon button */}
                <button
                  onClick={openLogin}
                  className="flex flex-col items-center p-2 hover:text-[#53A318] transition-colors"
                  aria-label="Sign in"
                >
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="hidden md:block text-[10px] text-gray-500 mt-0.5">Sign In</span>
                </button>

                {/* Login popup */}
                {loginOpen && (
                  <div className="absolute right-0 mt-1 w-[360px] bg-white rounded-2xl shadow-2xl border border-[#E0E0E0] z-50 overflow-hidden animate-fade-in">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#F0F0F0]">
                      {loginStep === 'password' ? (
                        <button onClick={() => setLoginStep('email')} className="text-[#636366] hover:text-[#1A1A1A]">
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                      ) : <div className="w-4" />}
                      <h2 className="text-base font-bold text-[#1A1A1A]">Log in or sign up</h2>
                      <button onClick={() => setLoginOpen(false)} className="text-[#636366] hover:text-[#1A1A1A] text-lg leading-none">×</button>
                    </div>

                    <div className="px-5 py-4 max-h-[80vh] overflow-y-auto">
                      {/* ── Step 1: Email ── */}
                      {loginStep === 'email' && (<>
                        {/* Social buttons */}
                        <div className="flex gap-2 mb-4">
                          {[
                            { label: 'Google', icon: <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> },
                            { label: 'Apple', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg> },
                            { label: 'Facebook', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
                          ].map(({ label, icon }) => (
                            <button key={label} className="flex-1 flex items-center justify-center gap-1.5 border border-[#E0E0E0] rounded-full py-2 text-xs font-semibold text-[#1A1A1A] hover:bg-gray-50 transition-colors">
                              {icon} {label}
                            </button>
                          ))}
                        </div>
                        {/* Divider */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex-1 h-px bg-[#E0E0E0]" />
                          <span className="text-xs text-[#636366]">Or use an email</span>
                          <div className="flex-1 h-px bg-[#E0E0E0]" />
                        </div>
                        {/* Email form */}
                        <form onSubmit={handleLoginContinue} className="space-y-2.5">
                          <input
                            type="email"
                            value={loginEmail}
                            onChange={(e) => { setLoginEmail(e.target.value); setLoginEmailErr(''); }}
                            placeholder="Email"
                            autoComplete="email"
                            autoFocus
                            className="w-full border border-[#E0E0E0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#53A318] focus:ring-1 focus:ring-[#53A318] transition-colors"
                          />
                          {loginEmailErr && <p className="text-xs text-red-600">{loginEmailErr}</p>}
                          <button type="submit" className="w-full bg-[#53A318] hover:bg-[#438F10] text-white font-bold py-3 rounded-full text-sm transition-colors">
                            Continue
                          </button>
                        </form>
                        <p className="text-[11px] text-[#9CA3AF] text-center mt-2.5 leading-relaxed">
                          By continuing, I agree to the <a href="/terms" className="underline text-[#636366]">Terms</a> and <a href="/privacy" className="underline text-[#636366]">Privacy Statement</a>.
                        </p>
                      </>)}

                      {/* ── Step 2: Password ── */}
                      {loginStep === 'password' && (<>
                        <p className="text-xs text-[#636366] text-center mb-3">{loginEmail}</p>
                        {loginError && <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">{loginError}</div>}
                        <form onSubmit={handleLoginSubmit} className="space-y-2.5">
                          <input
                            type="password"
                            value={loginPassword}
                            onChange={(e) => { setLoginPassword(e.target.value); setLoginPwErr(''); }}
                            placeholder="Password"
                            autoComplete="current-password"
                            autoFocus
                            className="w-full border border-[#E0E0E0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#53A318] focus:ring-1 focus:ring-[#53A318] transition-colors"
                          />
                          {loginPwErr && <p className="text-xs text-red-600">{loginPwErr}</p>}
                          <button type="submit" disabled={loginLoading} className="w-full bg-[#53A318] hover:bg-[#438F10] text-white font-bold py-3 rounded-full text-sm transition-colors disabled:opacity-60">
                            {loginLoading ? 'Signing in…' : 'Sign In'}
                          </button>
                        </form>
                        <div className="flex justify-between mt-2 text-xs">
                          <a href="/login/forgot-password" className="text-[#53A318] hover:underline">Forgot password?</a>
                          <Link href={`/signup?email=${encodeURIComponent(loginEmail)}`} onClick={() => setLoginOpen(false)} className="text-[#53A318] hover:underline">Create account</Link>
                        </div>
                      </>)}

                      {/* ── Quick links ── */}
                      <div className="mt-4 border-t border-[#F0F0F0] pt-1">
                        {[
                          ...(!user || user.role === 'Consumer' ? [
                            { href: '/account/groupons', icon: <Tag className="w-4 h-4" />, label: 'My Groupons' },
                            { href: '/account/orders',   icon: <Eye className="w-4 h-4" />, label: 'My Orders' },
                          ] : []),
                          { href: '/gift', icon: <Gift className="w-4 h-4" />, label: 'Redeem Gift Card' },
                        ].map(({ href, icon, label }) => (
                          <Link key={href} href={href} onClick={() => setLoginOpen(false)}
                            className="flex items-center justify-between py-2.5 border-b border-[#F5F5F5] last:border-0 hover:bg-gray-50 -mx-5 px-5 transition-colors">
                            <div className="flex items-center gap-3 text-sm text-[#1A1A1A]">
                              <span className="text-[#636366]">{icon}</span>{label}
                            </div>
                            <ChevronDown className="w-3.5 h-3.5 text-[#636366] -rotate-90" />
                          </Link>
                        ))}
                        <div className="flex items-center justify-between py-2.5 -mx-5 px-5">
                          <div className="flex items-center gap-3 text-sm text-[#1A1A1A]">
                            <span className="text-[#636366]"><Languages className="w-4 h-4" /></span>Language
                          </div>
                          <div className="flex items-center gap-1 text-xs text-[#636366]">
                            <span>🇺🇸 English</span>
                            <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                          </div>
                        </div>
                      </div>

                      {/* ── Sell on DealHive ── */}
                      <div className="mt-3 pt-3 border-t border-[#F0F0F0]">
                        <Link href="/vendor/register" onClick={() => setLoginOpen(false)}
                          className="flex items-center justify-center gap-2 w-full border-2 border-[#53A318] text-[#53A318] font-bold text-sm py-2.5 rounded-full hover:bg-[#EFF7E6] transition-colors">
                          <Store className="w-4 h-4" /> Sell on DealHive
                        </Link>
                      </div>

                      {/* ── Get the App ── */}
                      <div className="mt-3 pt-3 border-t border-[#F0F0F0] flex items-start gap-3">
                        <div className="flex-1">
                          <p className="text-xs font-bold text-[#53A318]">Get the DealHive App</p>
                          <p className="text-sm font-bold text-[#1A1A1A] leading-snug mt-0.5">Unlock up to 90% discounts on the go!</p>
                          <p className="text-xs text-[#636366] mt-1 leading-relaxed">Exclusive deals, push notifications, and digital vouchers at your fingertips.</p>
                          <div className="text-[#FFB800] text-sm mt-1">★★★★★</div>
                        </div>
                        <div className="w-14 h-14 bg-[#1A1A1A] rounded flex-shrink-0 flex items-center justify-center">
                          <svg viewBox="0 0 64 64" className="w-12 h-12 text-white" fill="currentColor">
                            <rect x="4" y="4" width="24" height="24" rx="2"/><rect x="8" y="8" width="16" height="16" rx="1" fill="#1A1A1A"/><rect x="10" y="10" width="12" height="12"/>
                            <rect x="36" y="4" width="24" height="24" rx="2"/><rect x="40" y="8" width="16" height="16" rx="1" fill="#1A1A1A"/><rect x="42" y="10" width="12" height="12"/>
                            <rect x="4" y="36" width="24" height="24" rx="2"/><rect x="8" y="40" width="16" height="16" rx="1" fill="#1A1A1A"/><rect x="10" y="42" width="12" height="12"/>
                            <rect x="36" y="36" width="8" height="8"/><rect x="48" y="36" width="8" height="8"/><rect x="36" y="48" width="8" height="8"/><rect x="48" y="48" width="8" height="8"/>
                          </svg>
                        </div>
                      </div>
                      <Link href="#" className="mt-2 block w-full bg-[#53A318] hover:bg-[#438F10] text-white font-bold text-sm py-2.5 rounded-full text-center transition-colors">
                        Get the App
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen((o) => !o)} className="md:hidden p-2 ml-1">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Category Mega-Menu Nav ── */}
      <div className="hidden md:block bg-white border-b border-[#E0E0E0]">
        <div className="max-w-[1280px] mx-auto px-4">
          <nav className="flex items-center">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => handleNavEnter(item.label)}
                onMouseLeave={handleNavLeave}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-1 px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                    activeNav === item.label
                      ? 'text-[#53A318] border-[#53A318]'
                      : 'text-[#1A1A1A] border-transparent hover:text-[#53A318]'
                  }`}
                >
                  {item.label}
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </Link>

                {/* Dropdown */}
                {activeNav === item.label && (
                  <div
                    className="absolute top-full left-0 bg-white border border-[#E0E0E0] shadow-dropdown rounded-b z-50 animate-slide-down"
                    style={{ minWidth: item.cols.length > 1 ? 360 : 220 }}
                    onMouseEnter={() => handleNavEnter(item.label)}
                    onMouseLeave={handleNavLeave}
                  >
                    <div className={`flex gap-6 p-5 ${item.cols.length > 1 ? '' : ''}`}>
                      {item.cols.map((col) => (
                        <div key={col.heading} className="flex-1 min-w-[140px]">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{col.heading}</p>
                          <ul className="space-y-1">
                            {col.links.map((link) => (
                              <li key={link.label}>
                                <Link
                                  href={link.href}
                                  onClick={() => setActiveNav(null)}
                                  className="block text-sm text-[#1A1A1A] hover:text-[#53A318] py-1 transition-colors"
                                >
                                  {link.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-[#E0E0E0] px-5 py-3">
                      <Link
                        href={item.href}
                        onClick={() => setActiveNav(null)}
                        className="text-sm font-bold text-[#53A318] hover:underline"
                      >
                        View all {item.label} →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-[#E0E0E0] shadow-lg">
          <div className="px-4 py-3 border-b border-[#E0E0E0]">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search deals…"
                className="flex-1 border border-[#E0E0E0] rounded px-3 py-2 text-sm outline-none"
              />
              <button type="submit" className="bg-[#53A318] text-white px-4 py-2 rounded text-sm font-bold">
                Go
              </button>
            </form>
          </div>
          <nav className="divide-y divide-[#E0E0E0]">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-4 py-3 text-sm font-medium text-[#1A1A1A] hover:bg-[#F5F5F5]"
              >
                {item.label}
                <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90" />
              </Link>
            ))}
          </nav>
          {!isAuthenticated && (
            <div className="p-4 flex gap-3 border-t border-[#E0E0E0]">
              <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center border-2 border-[#53A318] text-[#53A318] font-bold py-2 rounded text-sm">Sign In</Link>
              <Link href="/signup" onClick={() => setMobileOpen(false)} className="flex-1 text-center bg-[#53A318] text-white font-bold py-2 rounded text-sm">Join Free</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
