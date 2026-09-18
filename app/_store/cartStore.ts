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

  /** Add product with optional quantity */
  addItem: (productId: string, quantity?: number) => void;

  /** Remove the entire product entry from the cart */
  removeItem: (productId: string) => void;

  /** Set an explicit quantity – removes the item if quantity ≤ 0 */
  updateQuantity: (productId: string, quantity: number) => void;

  /** Empty the cart completely */
  clearCart: () => void;

  // Selectors (non-reactive helpers)

  /** Check if a product is in the cart */
  isInCart: (productId: string) => boolean;

  /** Quantity of a specific product in the cart (0 if absent) */
  getItemQuantity: (productId: string) => number;

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

      addItem: (productId, quantity = 1) =>
        set((state) => {
          const qtyToAdd = Math.max(1, quantity);
          const existing = state.items.find((i) => i.productId === productId);

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === productId
                  ? { ...i, quantity: i.quantity + qtyToAdd }
                  : i
              ),
            };
          }

          return { items: [...state.items, { productId, quantity: qtyToAdd }] };
        }),

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

      isInCart: (productId) =>
        get().items.some((i) => i.productId === productId),

      getItemQuantity: (productId) =>
        get().items.find((i) => i.productId === productId)?.quantity ?? 0,

      getTotalUnits: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: "mkk-fireworks-cart",
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
