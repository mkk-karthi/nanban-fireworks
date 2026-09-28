import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Types

interface CartEntry {
  productId: string;
  quantity: number;
}

interface CartStore {
  /** All items currently in the cart */
  items: CartEntry[];

  /** True after localStorage has been rehydrated on the client */
  hasHydrated: boolean;

  // Actions

  /** Remove the entire product entry from the cart */
  removeItem: (productId: string) => void;

  /** Set an explicit quantity – removes the item if quantity ≤ 0 */
  updateQuantity: (productId: string, quantity: number) => void;

  /** Empty the cart completely */
  clearCart: () => void;

  // Selectors (non-reactive helpers)

  /** Total number of individual units across all cart entries */
  getTotalUnits: () => number;

  /** Called by the persist onRehydrateStorage callback */
  setHasHydrated: (value: boolean) => void;
}

// Store

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((i) => i.productId !== productId) };
          }
          const existing = state.items.find((i) => i.productId === productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === productId ? { ...i, quantity } : i
              ),
            };
          }
          return { items: [...state.items, { productId, quantity }] };
        }),

      clearCart: () => set({ items: [] }),

      getTotalUnits: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: "nanban-crackers-cart",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
