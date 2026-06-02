import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { products as initialProducts } from '@/data/products';
import type { Product } from '@/data/products';

interface ProductState {
  products: Product[];
  nextId: number;
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: number, updates: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  getProductById: (id: number) => Product | undefined;
  resetProducts: () => void;
}

const INITIAL_NEXT_ID = Math.max(0, ...initialProducts.map((p) => p.id)) + 1;

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: initialProducts,
      nextId: INITIAL_NEXT_ID,

      addProduct: (productData) => {
        const id = get().nextId;
        const newProduct: Product = { ...productData, id };
        set((state) => ({
          products: [...state.products, newProduct],
          nextId: id + 1,
        }));
        return newProduct;
      },

      updateProduct: (id, updates) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));
      },

      getProductById: (id) => get().products.find((p) => p.id === id),

      resetProducts: () => set({ products: initialProducts, nextId: INITIAL_NEXT_ID }),
    }),
    {
      name: 'marda-products',
      version: 2,
      migrate: (persisted: unknown, version) => {
        const state = (persisted as Partial<ProductState>) ?? {};
        if (version < 2) {
          const products = state.products ?? initialProducts;
          return {
            ...state,
            products,
            nextId: Math.max(INITIAL_NEXT_ID, ...products.map((p) => p.id)) + 1,
          } as ProductState;
        }
        return state as ProductState;
      },
    }
  )
);
