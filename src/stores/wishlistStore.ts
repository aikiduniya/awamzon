import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface WishlistState {
  handles: string[];
  toggle: (handle: string) => boolean;
  has: (handle: string) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      handles: [],
      toggle: (handle) => {
        const exists = get().handles.includes(handle);
        set({ handles: exists ? get().handles.filter((h) => h !== handle) : [...get().handles, handle] });
        return !exists;
      },
      has: (handle) => get().handles.includes(handle),
      clear: () => set({ handles: [] }),
    }),
    { name: "storefront-wishlist", storage: createJSONStorage(() => localStorage) },
  ),
);
