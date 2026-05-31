import { create } from 'zustand';
import { products } from '@/data/products';
import type { Product } from '@/data/products';
import type { Category } from '@/lib/constants';

interface ShopState {
  // Products
  allProducts: Product[];

  // Filters
  selectedCategory: Category | 'todos';
  searchQuery: string;
  priceRange: [number, number];
  selectedSizes: string[];

  // Actions
  setCategory: (category: Category | 'todos') => void;
  setSearchQuery: (query: string) => void;
  setPriceRange: (range: [number, number]) => void;
  toggleSize: (size: string) => void;
  clearFilters: () => void;

  // Getters
  getFilteredProducts: () => Product[];
}

export const useShopStore = create<ShopState>((set, get) => ({
  allProducts: products,
  selectedCategory: 'todos',
  searchQuery: '',
  priceRange: [0, 50000],
  selectedSizes: [],

  setCategory: (category) => set({ selectedCategory: category }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setPriceRange: (range) => set({ priceRange: range }),

  toggleSize: (size) =>
    set((state) => ({
      selectedSizes: state.selectedSizes.includes(size)
        ? state.selectedSizes.filter((s) => s !== size)
        : [...state.selectedSizes, size],
    })),

  clearFilters: () =>
    set({
      selectedCategory: 'todos',
      searchQuery: '',
      priceRange: [0, 50000],
      selectedSizes: [],
    }),

  getFilteredProducts: () => {
    const state = get();
    return state.allProducts.filter((product) => {
      // Category filter
      if (state.selectedCategory !== 'todos' && product.category !== state.selectedCategory) {
        return false;
      }
      // Search filter
      if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesDesc = product.description.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }
      // Price filter
      if (product.price < state.priceRange[0] || product.price > state.priceRange[1]) {
        return false;
      }
      // Size filter
      if (state.selectedSizes.length > 0) {
        const hasMatchingSize = product.sizes.some((s) =>
          state.selectedSizes.includes(s)
        );
        if (!hasMatchingSize) return false;
      }
      return true;
    });
  },
}));
