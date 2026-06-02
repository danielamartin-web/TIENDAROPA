import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (productId: number, size: string) => void;
  updateQuantity: (productId: number, size: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const MAX_QUANTITY_PER_LINE = 20;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const incomingQty = clamp(item.quantity ?? 1, 1, MAX_QUANTITY_PER_LINE);
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId && i.size === item.size
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId && i.size === item.size
                  ? { ...i, quantity: clamp(i.quantity + incomingQty, 1, MAX_QUANTITY_PER_LINE) }
                  : i
              ),
            };
          }
          const { quantity: _drop, ...rest } = item;
          void _drop;
          return { items: [...state.items, { ...rest, quantity: incomingQty }] };
        });
      },

      removeItem: (productId, size) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.size === size)
          ),
        }));
      },

      updateQuantity: (productId, size, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, size);
          return;
        }
        const next = clamp(quantity, 1, MAX_QUANTITY_PER_LINE);
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.size === size ? { ...i, quantity: next } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      getTotalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: 'marda-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
