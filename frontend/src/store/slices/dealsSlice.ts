import { createSlice, createAsyncThunk, createSelector, PayloadAction } from '@reduxjs/toolkit';
import { publicApi, api } from '@/lib/api';
import type { DealSummary, DealDetail, PaginatedResponse, DealsFilterParams } from '@/types';

interface DealsState {
  featured: DealSummary[];
  trending: DealSummary[];
  expiringSoon: DealSummary[];
  searchResults: DealSummary[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  currentDeal: DealDetail | null;
  wishlistedIds: Record<string, boolean>;
  isLoading: boolean;
  isDetailLoading: boolean;
  error: string | null;
  filters: DealsFilterParams;
}

const initialState: DealsState = {
  featured: [],
  trending: [],
  expiringSoon: [],
  searchResults: [],
  totalCount: 0,
  currentPage: 1,
  totalPages: 0,
  currentDeal: null,
  wishlistedIds: {},
  isLoading: false,
  isDetailLoading: false,
  error: null,
  filters: { page: 1, pageSize: 20, sort: 'relevance' },
};

// ─── Async Thunks ─────────────────────────────────────────────

export const fetchDeals = createAsyncThunk<PaginatedResponse<DealSummary>, DealsFilterParams>(
  'deals/fetchDeals',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await publicApi.get<PaginatedResponse<DealSummary>>('/deals', { params });
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? 'Failed to fetch deals');
    }
  }
);

export const fetchDealBySlug = createAsyncThunk<DealDetail, string>(
  'deals/fetchBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const { data } = await publicApi.get<DealDetail>(`/deals/${slug}`);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? 'Deal not found');
    }
  }
);

export const fetchFeaturedDeals = createAsyncThunk<DealSummary[]>(
  'deals/fetchFeatured',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await publicApi.get<DealSummary[]>('/deals/featured');
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? 'Failed to fetch featured deals');
    }
  }
);

export const fetchTrendingDeals = createAsyncThunk<DealSummary[]>(
  'deals/fetchTrending',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await publicApi.get<DealSummary[]>('/deals/trending');
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchExpiringSoonDeals = createAsyncThunk<DealSummary[]>(
  'deals/fetchExpiringSoon',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await publicApi.get<DealSummary[]>('/deals/expiring-soon');
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const toggleWishlist = createAsyncThunk<{ dealId: string; wishlisted: boolean }, string>(
  'deals/toggleWishlist',
  async (dealId, { rejectWithValue }) => {
    try {
      const { data } = await api.post<{ wishlisted: boolean }>('/users/me/wishlist', { dealId });
      return { dealId, wishlisted: data.wishlisted };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchWishlist = createAsyncThunk<string[]>(
  'deals/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<string[]>('/users/me/wishlist');
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────

const dealsSlice = createSlice({
  name: 'deals',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<DealsFilterParams>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters(state) {
      state.filters = { page: 1, pageSize: 20, sort: 'relevance' };
    },
    clearCurrentDeal(state) {
      state.currentDeal = null;
    },
    optimisticToggleWishlist(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (state.wishlistedIds[id]) {
        delete state.wishlistedIds[id];
      } else {
        state.wishlistedIds[id] = true;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeals.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchDeals.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.currentPage = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchDeals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchDealBySlug.pending, (state) => { state.isDetailLoading = true; })
      .addCase(fetchDealBySlug.fulfilled, (state, action) => {
        state.isDetailLoading = false;
        state.currentDeal = action.payload;
      })
      .addCase(fetchDealBySlug.rejected, (state, action) => {
        state.isDetailLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchFeaturedDeals.fulfilled, (state, action) => { state.featured = action.payload; })
      .addCase(fetchTrendingDeals.fulfilled, (state, action) => { state.trending = action.payload; })
      .addCase(fetchExpiringSoonDeals.fulfilled, (state, action) => { state.expiringSoon = action.payload; })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        const { dealId, wishlisted } = action.payload;
        if (wishlisted) {
          state.wishlistedIds[dealId] = true;
        } else {
          delete state.wishlistedIds[dealId];
        }
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.wishlistedIds = action.payload.reduce<Record<string, boolean>>(
          (acc, id) => { acc[id] = true; return acc; }, {}
        );
      });
  },
});

export const { setFilters, clearFilters, clearCurrentDeal, optimisticToggleWishlist } = dealsSlice.actions;
export default dealsSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────

export const selectFeaturedDeals = (state: { deals: DealsState }) => state.deals.featured;
export const selectTrendingDeals = (state: { deals: DealsState }) => state.deals.trending;
export const selectExpiringSoonDeals = (state: { deals: DealsState }) => state.deals.expiringSoon;
export const selectSearchResults = (state: { deals: DealsState }) => state.deals.searchResults;
export const selectCurrentDeal = (state: { deals: DealsState }) => state.deals.currentDeal;
export const selectDealsLoading = (state: { deals: DealsState }) => state.deals.isLoading;
export const selectDealDetailLoading = (state: { deals: DealsState }) => state.deals.isDetailLoading;
export const selectWishlistedIds = (state: { deals: DealsState }) => state.deals.wishlistedIds;
export const selectIsWishlisted = (dealId: string) =>
  (state: { deals: DealsState }) => !!state.deals.wishlistedIds[dealId];
export const selectPagination = createSelector(
  (state: { deals: DealsState }) => state.deals,
  (d) => ({ totalCount: d.totalCount, currentPage: d.currentPage, totalPages: d.totalPages })
);
