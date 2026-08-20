'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { selectCartItems, selectCartSubtotal, selectCartTotal, removeItem, updateQuantity } from '@/store/slices/cartSlice';
import { selectIsAuthenticated } from '@/store/slices/authSlice';
import { formatCurrency } from '@/lib/utils';

export default function CartPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const total = useAppSelector(selectCartTotal);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (items.length === 0) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 py-16 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-8">Looks like you haven't added any deals yet.</p>
        <Link href="/" className="bg-primary text-white font-semibold px-8 py-3 rounded-lg hover:bg-primary-dark transition-colors">
          Browse Deals
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      <h1 className="font-display text-2xl font-bold mb-8">Your Cart ({items.length} {items.length === 1 ? 'item' : 'items'})</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart items */}
        <div className="flex-1 space-y-4">
          {items.map((item) => (
            <div key={`${item.dealId}-${item.dealOptionId}`}
              className="flex gap-4 bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <div className="relative w-24 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                {item.primaryImageUrl && (
                  <Image src={item.primaryImageUrl} alt={item.dealTitle} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 truncate">{item.dealTitle}</h3>
                {item.optionTitle && <p className="text-xs text-gray-500 mb-1">{item.optionTitle}</p>}
                <p className="text-xs text-gray-500">{item.vendorName}</p>
                <p className="text-sm font-bold text-primary mt-1">{formatCurrency(item.unitPrice)}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button onClick={() => dispatch(removeItem({ dealId: item.dealId, dealOptionId: item.dealOptionId }))}
                  className="text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button onClick={() => dispatch(updateQuantity({ dealId: item.dealId, dealOptionId: item.dealOptionId, quantity: item.quantity - 1 }))}
                    className="px-2 py-1 hover:bg-gray-50 text-sm">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-3 py-1 text-sm font-medium min-w-[32px] text-center">{item.quantity}</span>
                  <button onClick={() => dispatch(updateQuantity({ dealId: item.dealId, dealOptionId: item.dealOptionId, quantity: item.quantity + 1 }))}
                    className="px-2 py-1 hover:bg-gray-50 text-sm">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-sm font-bold">{formatCurrency(item.unitPrice * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="font-display font-bold text-lg mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
            </div>
            {isAuthenticated ? (
              <Link href="/checkout"
                className="block w-full text-center bg-accent hover:bg-accent-hover text-white font-bold py-3 rounded-xl transition-colors">
                Proceed to Checkout
              </Link>
            ) : (
              <Link href="/login?redirect=/checkout"
                className="block w-full text-center bg-accent hover:bg-accent-hover text-white font-bold py-3 rounded-xl transition-colors">
                Sign in to Checkout
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
