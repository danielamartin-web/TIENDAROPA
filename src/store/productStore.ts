import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { products as initialProducts } from '@/data/products';
import type { Product } from '@/data/products';

interface ProductState {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: number, updates: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  getProductById: (id: number) => Product | undefined;
}

let nextId = 100;

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: initialProducts,

      addProduct: (productData) => {
        nextId++;
        const newProduct: Product = {
          ...productData,
          id: nextId,
        };
        set((state) => ({ products: [...state.products, newProduct] }));
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

      getProductById: (id) => {
        return get().products.find((p) => p.id === id);
      },
    }),
    {
      name: 'marda-products',
    }
  )
);
