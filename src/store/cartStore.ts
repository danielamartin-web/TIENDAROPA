import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
  /** Stock disponible para este talle del producto (undefined = sin tracking) */
  maxStock?: number;
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

function maxForItem(item: { maxStock?: number }): number {
  if (item.maxStock !== undefined) {
    return Math.min(MAX_QUANTITY_PER_LINE, item.maxStock);
  }
  return MAX_QUANTITY_PER_LINE;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const cap = maxForItem(item);
        if (cap <= 0) return;
        const incomingQty = clamp(item.quantity ?? 1, 1, cap);
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId && i.size === item.size
          );
          if (existing) {
            const itemCap = Math.min(maxForItem(existing), cap);
            return {
              items: state.items.map((i) =>
                i.productId === item.productId && i.size === item.size
                  ? {
                      ...i,
                      quantity: clamp(i.quantity + incomingQty, 1, itemCap),
                      maxStock: item.maxStock ?? i.maxStock,
                    }
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
        set((state) => ({
          items: state.items.map((i) => {
            if (i.productId !== productId || i.size !== size) return i;
            const cap = maxForItem(i);
            return { ...i, quantity: clamp(quantity, 1, cap) };
          }),
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
