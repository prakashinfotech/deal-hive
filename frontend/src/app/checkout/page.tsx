'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Trash2, ChevronDown, ChevronUp, ShieldCheck, Clock, Gift, CheckCircle2, Tag } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  selectCartItems,
  selectCartTotal,
  selectCartSubtotal,
  removeItem,
  updateQuantity,
  clearCart,
  applyPromoCode,
  removePromoCode,
  selectPromoCode,
} from '@/store/slices/cartSlice';
import api from '@/lib/api';
import type { CreateOrderResponse } from '@/types';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '');

type PaymentMethod = 'apple' | 'google' | 'card' | 'paypal';

// ── Countdown hook (counts down from initialSeconds) ──────────
function useCountdown(initialSeconds: number) {
  const [secs, setSecs] = useState(initialSeconds);
  useEffect(() => {
    const id = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  const h = String(Math.floor(secs / 3600)).padStart(2, '0');
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

// ── Payment method pill logos ──────────────────────────────────
function ApplePayBadge() {
  return (
    <span className="border border-gray-200 rounded px-2 py-0.5 text-xs font-bold tracking-tight text-black bg-white">
      Apple Pay
    </span>
  );
}
function GPayBadge() {
  return (
    <span className="border border-gray-200 rounded px-2 py-0.5 text-xs font-bold text-[#4285F4] bg-white">
      G Pay
    </span>
  );
}
function CardBadge() {
  return (
    <div className="flex gap-1">
      {['Visa', 'MC', 'Amex'].map((c) => (
        <span key={c} className="border border-gray-200 rounded px-1.5 py-0.5 text-[10px] font-bold text-gray-500 bg-white">
          {c}
        </span>
      ))}
    </div>
  );
}
function PayPalBadge() {
  return (
    <span className="text-xs font-bold text-[#003087]">
      Pay<span className="text-[#009cde]">Pal</span>
    </span>
  );
}

// ── Main checkout form ─────────────────────────────────────────
function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const promoCode = useAppSelector(selectPromoCode);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('google');
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [giftCardOpen, setGiftCardOpen] = useState(false);
  const [buyAsGift, setBuyAsGift] = useState(false);
  const [emailOptIn, setEmailOptIn] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const countdown = useCountdown(20 * 60 + 25 * 60 + 2); // 20:25:02 start

  // 10% discount on promo
  const promoSavings = promoApplied ? subtotal * 0.10 : 0;
  const total = subtotal - promoSavings;
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  const handleApplyPromo = () => {
    if (promoInput.trim()) {
      dispatch(applyPromoCode({ code: promoInput.trim(), discount: subtotal * 0.10 }));
      setPromoApplied(true);
    }
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    setCardError(null);
    try {
      // Always create the order in the backend first
      const { data: order } = await api.post<CreateOrderResponse>('/orders', {
        items: items.map((i) => ({
          dealId: i.dealId,
          dealOptionId: i.dealOptionId,
          quantity: i.quantity,
        })),
      });

      if (paymentMethod === 'card') {
        if (!stripe || !elements) return;
        const card = elements.getElement(CardElement);
        if (!card) throw new Error('Card element not found');
        const { error, paymentIntent } = await stripe.confirmCardPayment(order.stripeClientSecret, {
          payment_method: { card },
        });
        if (error) {
          setCardError(error.message ?? 'Payment failed. Please try again.');
          setIsProcessing(false);
          return;
        }
        if (paymentIntent?.status !== 'succeeded') return;
      } else {
        // For Apple Pay / Google Pay / PayPal — confirm directly via backend
        await api.post(`/orders/${order.orderId}/confirm`);
      }

      dispatch(clearCart());
      setOrderNumber(order.orderNumber);
      setOrderComplete(true);
    } catch (err: any) {
      const d = err.response?.data;
      setCardError(
        (typeof d === 'string' ? d : null) ?? d?.detail ?? d?.title ?? 'An error occurred. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const ctaLabel = () => {
    if (isProcessing) return 'Processing…';
    switch (paymentMethod) {
      case 'apple':  return 'Buy with Apple Pay';
      case 'google': return 'Buy with G Pay';
      case 'paypal': return 'Buy with PayPal';
      default:       return `Pay $${total.toFixed(2)}`;
    }
  };

  const ctaBg = () => {
    switch (paymentMethod) {
      case 'apple':
      case 'google': return 'bg-black hover:bg-gray-900';
      case 'paypal': return 'bg-[#0070ba] hover:bg-[#005ea6]';
      default:       return 'bg-[#1a7a2d] hover:bg-[#145e22]';
    }
  };

  // ── Success screen ─────────────────────────────────────────
  if (orderComplete) {
    return (
      <div className="text-center py-16 max-w-[480px] mx-auto px-4">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Order Confirmed!</h2>
        <p className="text-[#636366] mb-1">Order #{orderNumber}</p>
        <p className="text-[#636366] mb-8">Your vouchers have been sent to your email.</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => router.push('/account/groupons')}
            className="bg-[#53A318] text-white font-bold px-6 py-3 rounded-lg hover:bg-[#438F10] transition-colors"
          >
            View My Groupons
          </button>
          <button
            onClick={() => router.push('/')}
            className="border border-gray-300 font-semibold px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // ── Empty cart ─────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="text-center py-16 max-w-[480px] mx-auto px-4">
        <p className="text-4xl mb-4">🛒</p>
        <p className="text-[#1A1A1A] font-bold text-lg mb-2">Your cart is empty</p>
        <p className="text-[#636366] mb-6 text-sm">Looks like you haven't added any deals yet.</p>
        <Link href="/local" className="bg-[#53A318] text-white font-bold px-6 py-3 rounded-lg hover:bg-[#438F10] transition-colors inline-block">
          Browse Deals
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[640px] mx-auto px-4 pb-16">

      {/* ── Page heading ─────────────────────────────── */}
      <h1 className="text-xl font-bold text-[#1A1A1A] mb-4">
        Checkout ({totalItems} {totalItems === 1 ? 'item' : 'items'})
      </h1>

      {/* ── Cart Items ───────────────────────────────── */}
      <div className="bg-white border border-[#E0E0E0] rounded-lg mb-3">
        {items.map((item, idx) => {
          const lineTotal = item.unitPrice * item.quantity;
          const lineOriginal = item.originalUnitPrice
            ? item.originalUnitPrice * item.quantity
            : null;

          return (
            <div
              key={`${item.dealId}-${item.dealOptionId}`}
              className={`p-4 ${idx < items.length - 1 ? 'border-b border-[#E0E0E0]' : ''}`}
            >
              <div className="flex gap-3">
                {/* Thumbnail */}
                <div className="w-[72px] h-[72px] flex-shrink-0 rounded overflow-hidden bg-gray-100 relative">
                  <Image
                    src={item.primaryImageUrl || '/placeholder-deal.jpg'}
                    alt={item.dealTitle}
                    fill
                    className="object-cover"
                    sizes="72px"
                  />
                </div>

                {/* Title + controls */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1A1A1A] line-clamp-2 leading-snug">
                    {item.dealTitle}
                  </p>
                  {item.optionTitle && (
                    <p className="text-xs text-[#636366] mt-0.5">{item.optionTitle}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {/* Qty dropdown */}
                    <select
                      value={item.quantity}
                      onChange={(e) =>
                        dispatch(updateQuantity({
                          dealId: item.dealId,
                          dealOptionId: item.dealOptionId,
                          quantity: Number(e.target.value),
                        }))
                      }
                      className="text-xs border border-[#E0E0E0] rounded px-2 py-1 bg-white outline-none cursor-pointer"
                    >
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                    {/* Trash */}
                    <button
                      onClick={() => dispatch(removeItem({ dealId: item.dealId, dealOptionId: item.dealOptionId }))}
                      className="text-[#636366] hover:text-red-500 transition-colors p-0.5"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="text-right flex-shrink-0 pl-2">
                  {lineOriginal && (
                    <p className="text-xs text-[#636366] line-through">${lineOriginal.toFixed(2)}</p>
                  )}
                  <p className="text-sm font-bold text-[#1A1A1A]">${lineTotal.toFixed(2)}</p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Buy as gift */}
        <div className="px-4 py-3 border-t border-[#E0E0E0]">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={buyAsGift}
              onChange={(e) => setBuyAsGift(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 accent-[#53A318]"
            />
            <span className="text-sm text-[#1A1A1A] flex items-center gap-1.5">
              Buy as a gift
              <Gift className="w-3.5 h-3.5 text-[#53A318]" />
            </span>
          </label>
          {buyAsGift && (
            <p className="text-xs text-[#636366] mt-1 ml-6">Send or print gift voucher after purchase</p>
          )}
        </div>

        {/* Refund guarantee */}
        <div className="px-4 py-2.5 border-t border-[#E0E0E0] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#53A318] flex-shrink-0" />
          <span className="text-xs text-[#636366]">3 days hassle-free refund guarantee</span>
        </div>

        {/* Countdown bar */}
        <div className="px-4 py-2.5 border-t border-[#E0E0E0] bg-[#FFF5F3] rounded-b-lg flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#E05A00] flex-shrink-0" />
          <span className="text-xs font-medium text-[#E05A00]">
            Sale ends in{' '}
            <span className="font-mono font-bold">{countdown}</span>
          </span>
        </div>
      </div>

      {/* ── Promo Code ───────────────────────────────── */}
      <div className="bg-white border border-[#E0E0E0] rounded-lg mb-3">
        <button
          onClick={() => setPromoOpen(!promoOpen)}
          className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-medium text-[#1A1A1A] hover:bg-gray-50 transition-colors rounded-lg"
        >
          <span className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#636366]" />
            {promoApplied ? (
              <span className="text-[#53A318] font-bold">Promo code applied ✓</span>
            ) : (
              'Enter Promo Code'
            )}
          </span>
          {promoOpen
            ? <ChevronUp className="w-4 h-4 text-[#636366]" />
            : <ChevronDown className="w-4 h-4 text-[#636366]" />}
        </button>
        {promoOpen && (
          <div className="px-4 pb-4 border-t border-[#E0E0E0] pt-3 flex gap-2">
            <input
              type="text"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              placeholder="Enter promo code"
              className="flex-1 border border-[#E0E0E0] rounded px-3 py-2 text-sm outline-none focus:border-[#53A318]"
              onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
            />
            <button
              onClick={handleApplyPromo}
              className="bg-[#53A318] text-white text-sm font-bold px-4 py-2 rounded hover:bg-[#438F10] transition-colors"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {/* ── PayPal Express ───────────────────────────── */}
      <div className="bg-white border border-[#E0E0E0] rounded-lg mb-3 p-4">
        <button
          onClick={() => setPaymentMethod('paypal')}
          className="w-full bg-[#0070ba] text-white rounded-md py-2.5 font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#005ea6] transition-colors mb-3"
        >
          <span className="text-base font-black italic tracking-tight">PayPal</span>
        </button>
        <p className="text-xs text-[#636366] text-center leading-relaxed">
          PayPal makes checking out simple. Sign in seconds and shop with confidence
          across devices. Choose PayPal to join today.
        </p>
        <p className="text-[10px] text-[#9CA3AF] text-center mt-2">
          Powered by Braintree ·{' '}
          <a href="#" className="underline hover:text-[#636366]">Privacy Policy</a>
        </p>
      </div>

      {/* ── Payment ──────────────────────────────────── */}
      <div className="bg-white border border-[#E0E0E0] rounded-lg mb-3">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E0E0E0]">
          <span className="font-bold text-sm text-[#1A1A1A]">Payment</span>
          <button className="text-xs text-[#0066CC] hover:underline">
            Can&apos;t proceed? Report a problem
          </button>
        </div>

        {/* Gift card row */}
        <button
          onClick={() => setGiftCardOpen(!giftCardOpen)}
          className="w-full flex items-center justify-between px-4 py-3.5 text-sm text-[#1A1A1A] border-b border-[#E0E0E0] hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-[#636366]" />
            Enter Gift Card Code
          </span>
          {giftCardOpen
            ? <ChevronUp className="w-4 h-4 text-[#636366]" />
            : <ChevronDown className="w-4 h-4 text-[#636366]" />}
        </button>
        {giftCardOpen && (
          <div className="px-4 py-3 border-b border-[#E0E0E0] flex gap-2">
            <input
              type="text"
              placeholder="Gift card code"
              className="flex-1 border border-[#E0E0E0] rounded px-3 py-2 text-sm outline-none focus:border-[#53A318]"
            />
            <button className="bg-[#53A318] text-white text-sm font-bold px-4 py-2 rounded hover:bg-[#438F10] transition-colors">
              Apply
            </button>
          </div>
        )}

        {/* Payment method options */}
        {(
          [
            { id: 'apple' as const,  label: 'Apple Pay',          badge: <ApplePayBadge /> },
            { id: 'google' as const, label: 'Google Pay',          badge: <GPayBadge /> },
            { id: 'card' as const,   label: 'Credit/Debit Card',   badge: <CardBadge /> },
            { id: 'paypal' as const, label: 'PayPal',              badge: <PayPalBadge /> },
          ]
        ).map((method) => (
          <div key={method.id} className="border-b border-[#E0E0E0] last:border-b-0">
            <button
              onClick={() => setPaymentMethod(method.id)}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {/* Radio */}
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    paymentMethod === method.id ? 'border-[#53A318]' : 'border-gray-300'
                  }`}
                >
                  {paymentMethod === method.id && (
                    <div className="w-2 h-2 rounded-full bg-[#53A318]" />
                  )}
                </div>
                <span className="text-sm text-[#1A1A1A]">{method.label}</span>
              </div>
              {method.badge}
            </button>

            {/* Stripe card element (only when card is selected) */}
            {method.id === 'card' && paymentMethod === 'card' && (
              <div className="px-4 pb-4">
                <div className="border border-[#E0E0E0] rounded-lg p-3 bg-gray-50">
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          color: '#1A1A1A',
                          '::placeholder': { color: '#9CA3AF' },
                        },
                        invalid: { color: '#DC2626' },
                      },
                    }}
                  />
                </div>
                {cardError && (
                  <p className="text-red-600 text-xs mt-2 bg-red-50 rounded p-2">{cardError}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Order Summary ────────────────────────────── */}
      <div className="bg-white border border-[#E0E0E0] rounded-lg mb-3 px-4 py-5">
        <h3 className="font-bold text-base text-[#1A1A1A] mb-4">Order Summary</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-[#636366]">Subtotal</span>
            <span className="font-bold text-[#1A1A1A]">${subtotal.toFixed(2)}</span>
          </div>
          {promoSavings > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-[#636366]">Promo savings</span>
              <span className="font-bold text-[#53A318]">−${promoSavings.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-3 border-t border-[#E0E0E0]">
            <span className="text-[15px] font-medium text-[#1A1A1A]">Total</span>
            <span className="text-[15px] font-bold text-[#53A318]">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* ── Email opt-in ─────────────────────────────── */}
      <label className="flex items-start gap-2 mb-3 cursor-pointer">
        <input
          type="checkbox"
          checked={emailOptIn}
          onChange={(e) => setEmailOptIn(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-[#53A318] flex-shrink-0"
        />
        <span className="text-xs text-[#636366] leading-relaxed">
          Yes, I want to save money by also receiving personalised Groupon emails with awesome deals.
        </span>
      </label>

      {/* ── Legal text ───────────────────────────────── */}
      <p className="text-[11px] text-[#636366] mb-4 leading-relaxed">
        By clicking below, I agree to the{' '}
        <a href="#" className="underline text-[#0066CC] hover:opacity-80">Terms of Use</a> and{' '}
        <a href="#" className="underline text-[#0066CC] hover:opacity-80">Refund Policy</a> and have read the{' '}
        <a href="#" className="underline text-[#0066CC] hover:opacity-80">Privacy Statement</a>
      </p>

      {/* ── CTA button ───────────────────────────────── */}
      <button
        onClick={handlePlaceOrder}
        disabled={isProcessing}
        className={`w-full ${ctaBg()} text-white font-bold py-4 rounded-lg text-base transition-opacity disabled:opacity-60`}
      >
        {ctaLabel()}
      </button>
      <p className="text-center text-xs text-[#636366] mt-2.5 flex items-center justify-center gap-1">
        <ShieldCheck className="w-3.5 h-3.5" />
        Secure Transaction
      </p>

      {/* ── Our Promise + Help ───────────────────────── */}
      <div className="grid grid-cols-2 gap-6 mt-10 pt-6 border-t border-[#E0E0E0]">
        <div>
          <p className="text-sm font-bold text-[#1A1A1A] mb-1">Our promise to you</p>
          <p className="text-xs text-[#636366] leading-relaxed">
            We&apos;re confident in your Groupon experience and back it with the Groupon
            Promise.{' '}
            <a href="#" className="text-[#53A318] hover:underline font-medium">Learn more</a>
          </p>
        </div>
        <div>
          <p className="text-sm font-bold text-[#1A1A1A] mb-1">Need Some Help?</p>
          <p className="text-xs text-[#636366] leading-relaxed">
            <a href="#" className="text-[#53A318] hover:underline font-medium">Check out our FAQ</a>{' '}
            for more information on promo codes, shipping, refunds, and more messages.
          </p>
        </div>
      </div>

      {/* ── reCAPTCHA ────────────────────────────────── */}
      <p className="text-[10px] text-[#9CA3AF] text-center mt-6">
        This site is protected by reCAPTCHA and the Google{' '}
        <a href="#" className="underline hover:text-[#636366]">Privacy Policy</a> and{' '}
        <a href="#" className="underline hover:text-[#636366]">Terms of Service</a> apply.
      </p>
    </div>
  );
}

// ── Page shell ────────────────────────────────────────────────
export default function CheckoutPage() {
  const router = useRouter();

  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      {/* Minimal checkout header */}
      <div className="bg-white border-b border-[#E0E0E0]">
        <div className="max-w-[640px] mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-[#53A318] font-black text-xl tracking-tight">
            DealHive
          </Link>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs text-[#636366] border border-[#E0E0E0] rounded-full px-3 py-1.5 hover:bg-gray-50 transition-colors"
          >
            ← Continue Shopping
          </button>
        </div>
      </div>

      <div className="py-6">
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      </div>
    </div>
  );
}
