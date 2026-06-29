import { create } from "zustand";
import { persist } from "zustand/middleware";
import { OrderItem } from "@/core/services/data-base";

type CartState = {
  items: OrderItem[];
  isOpen: boolean;
  cartCount: number;

  openCart: () => void;
  closeCart: () => void;

  addItem: (item: OrderItem) => void;
  increase: (productId: string) => void;
  decrease: (productId: string) => void;
  clear: () => void;

  recalc: (items: OrderItem[]) => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      cartCount: 0,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      recalc: (items) =>
        items.reduce((sum, i) => sum + i.quantity, 0),

      addItem: (item) => {
        const items = get().items;
        const exists = items.find(i => i.productId === item.productId);

        const newItems = exists
          ? items.map(i =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + 1 }
                : i
            )
          : [...items, item];

        set({
          items: newItems,
          cartCount: get().recalc(newItems),
        });
      },

      increase: (productId) => {
        const newItems = get().items.map(i =>
          i.productId === productId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );

        set({
          items: newItems,
          cartCount: get().recalc(newItems),
        });
      },

      decrease: (productId) => {
        const newItems = get().items
          .map(i =>
            i.productId === productId
              ? { ...i, quantity: i.quantity - 1 }
              : i
          )
          .filter(i => i.quantity > 0);

        set({
          items: newItems,
          cartCount: get().recalc(newItems),
        });
      },

      clear: () =>
        set({
          items: [],
          cartCount: 0,
        }),
    }),
    {
      name: "cart-storage",
    }
  )
);