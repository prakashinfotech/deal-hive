// ============================================================
// DealHive — Cart Redux Slice
// src/store/slices/cartSlice.ts
// ============================================================

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { DealSummary, DealOption } from '@/types';

export interface CartItem {
  dealId: string;
  dealTitle: string;
  vendorName: string;
  primaryImageUrl: string;
  dealOptionId?: string;
  optionTitle?: string;
  unitPrice: number;
  originalUnitPrice?: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  promoCode: string | null;
  promoDiscount: number;
}

const initialState: CartState = {
  items: [],
  promoCode: null,
  promoDiscount: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<CartItem>) {
      const existing = state.items.find(
        (i) => i.dealId === action.payload.dealId && i.dealOptionId === action.payload.dealOptionId
      );
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
    },
    removeItem(state, action: PayloadAction<{ dealId: string; dealOptionId?: string }>) {
      state.items = state.items.filter(
        (i) => !(i.dealId === action.payload.dealId && i.dealOptionId === action.payload.dealOptionId)
      );
    },
    updateQuantity(state, action: PayloadAction<{ dealId: string; dealOptionId?: string; quantity: number }>) {
      const item = state.items.find(
        (i) => i.dealId === action.payload.dealId && i.dealOptionId === action.payload.dealOptionId
      );
      if (item) {
        item.quantity = Math.max(1, action.payload.quantity);
      }
    },
    clearCart(state) {
      state.items = [];
      state.promoCode = null;
      state.promoDiscount = 0;
    },
    applyPromoCode(state, action: PayloadAction<{ code: string; discount: number }>) {
      state.promoCode = action.payload.code;
      state.promoDiscount = action.payload.discount;
    },
    removePromoCode(state) {
      state.promoCode = null;
      state.promoDiscount = 0;
    },
  },
});

export const { addItem, removeItem, updateQuantity, clearCart, applyPromoCode, removePromoCode } = cartSlice.actions;
export default cartSlice.reducer;

// ─── Selectors ───────────────────────────────────────────────
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, i) => sum + i.quantity, 0);
export const selectCartSubtotal = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
export const selectCartTotal = (state: { cart: CartState }) => {
  const subtotal = selectCartSubtotal(state);
  return subtotal - state.cart.promoDiscount;
};
export const selectPromoCode = (state: { cart: CartState }) => state.cart.promoCode;
