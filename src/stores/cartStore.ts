import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { storefrontApiRequest, type ShopifyProduct } from "@/lib/shopify";

export interface CartItem {
  lineId: string | null;
  product: ShopifyProduct;
  variantId: string;
  variantTitle: string;
  price: { amount: string; currencyCode: string };
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
}

const CART_QUERY = `query cart($id: ID!) { cart(id: $id) { id totalQuantity } }`;

const CART_CREATE_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } }
      }
      userErrors { field message }
    }
  }
`;

const CART_LINES_ADD_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { id lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } } }
      userErrors { field message }
    }
  }
`;

const CART_LINES_UPDATE_MUTATION = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { id } userErrors { field message } }
  }
`;

const CART_LINES_REMOVE_MUTATION = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { id } userErrors { field message } }
  }
`;

function formatCheckoutUrl(checkoutUrl: string): string {
  try {
    const url = new URL(checkoutUrl);
    url.searchParams.set("channel", "online_store");
    return url.toString();
  } catch {
    return checkoutUrl;
  }
}

function isCartNotFoundError(userErrors: Array<{ message: string }>): boolean {
  return userErrors.some(
    (e) =>
      e.message.toLowerCase().includes("cart not found") ||
      e.message.toLowerCase().includes("does not exist"),
  );
}

async function createShopifyCart(item: CartItem) {
  const data = await storefrontApiRequest(CART_CREATE_MUTATION, {
    input: { lines: [{ quantity: item.quantity, merchandiseId: item.variantId }] },
  });
  if (data?.data?.cartCreate?.userErrors?.length > 0) {
    console.error("Cart creation failed:", data.data.cartCreate.userErrors);
    return null;
  }
  const cart = data?.data?.cartCreate?.cart;
  if (!cart?.checkoutUrl) return null;
  const lineId = cart.lines.edges[0]?.node?.id;
  if (!lineId) return null;
  return { cartId: cart.id as string, checkoutUrl: formatCheckoutUrl(cart.checkoutUrl), lineId: lineId as string };
}

async function addLineToShopifyCart(cartId: string, item: CartItem) {
  const data = await storefrontApiRequest(CART_LINES_ADD_MUTATION, {
    cartId,
    lines: [{ quantity: item.quantity, merchandiseId: item.variantId }],
  });
  const userErrors = data?.data?.cartLinesAdd?.userErrors || [];
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
  if (userErrors.length > 0) return { success: false };
  const lines = data?.data?.cartLinesAdd?.cart?.lines?.edges || [];
  const newLine = lines.find(
    (l: { node: { id: string; merchandise: { id: string } } }) => l.node.merchandise.id === item.variantId,
  );
  return { success: true, lineId: newLine?.node?.id as string | undefined };
}

async function updateShopifyCartLine(cartId: string, lineId: string, quantity: number) {
  const data = await storefrontApiRequest(CART_LINES_UPDATE_MUTATION, { cartId, lines: [{ id: lineId, quantity }] });
  const userErrors = data?.data?.cartLinesUpdate?.userErrors || [];
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
  if (userErrors.length > 0) return { success: false };
  return { success: true };
}

async function removeLineFromShopifyCart(cartId: string, lineId: string) {
  const data = await storefrontApiRequest(CART_LINES_REMOVE_MUTATION, { cartId, lineIds: [lineId] });
  const userErrors = data?.data?.cartLinesRemove?.userErrors || [];
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
  if (userErrors.length > 0) return { success: false };
  return { success: true };
}

export interface AddItemResult {
  ok: boolean;
  error?: string;
}

interface CartStore {
  items: CartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
  /** Per-variant in-flight state so each product button has its own spinner. */
  pending: Record<string, boolean>;
  isLoading: boolean;
  isSyncing: boolean;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  addItem: (item: Omit<CartItem, "lineId">) => Promise<AddItemResult>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => void;
  syncCart: () => Promise<void>;
  getCheckoutUrl: () => string | null;
}

/**
 * All cart mutations run through one queue. Without this, two quick clicks on
 * different products both see `cartId === null` and create two separate Shopify
 * carts — the second one silently replacing the first.
 */
let mutationQueue: Promise<unknown> = Promise.resolve();
function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = mutationQueue.then(task, task);
  mutationQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,
      checkoutUrl: null,
      pending: {},
      isLoading: false,
      isSyncing: false,
      isOpen: false,
      setOpen: (open) => set({ isOpen: open }),

      addItem: async (item) => {
        if (!item.variantId || !item.variantId.startsWith("gid://shopify/ProductVariant/")) {
          return { ok: false, error: "This product has no valid variant to purchase." };
        }
        // Duplicate-click guard: same variant already being added.
        if (get().pending[item.variantId]) return { ok: false, error: "Already adding…" };
        set({ pending: { ...get().pending, [item.variantId]: true } });

        const finish = (result: AddItemResult): AddItemResult => {
          const next = { ...get().pending };
          delete next[item.variantId];
          set({ pending: next });
          return result;
        };

        return enqueue(async () => {
          try {
            const startFresh = async (): Promise<AddItemResult> => {
              const created = await createShopifyCart({ ...item, lineId: null });
              if (!created) return { ok: false, error: "Could not start a checkout cart. Please try again." };
              set({
                cartId: created.cartId,
                checkoutUrl: created.checkoutUrl,
                items: [{ ...item, lineId: created.lineId }],
              });
              return { ok: true };
            };

            const cartId = get().cartId;
            if (!cartId) return finish(await startFresh());

            const existingItem = get().items.find((i) => i.variantId === item.variantId);

            if (existingItem?.lineId) {
              const newQuantity = existingItem.quantity + item.quantity;
              const result = await updateShopifyCartLine(cartId, existingItem.lineId, newQuantity);
              if (result.success) {
                set({
                  items: get().items.map((i) =>
                    i.variantId === item.variantId ? { ...i, quantity: newQuantity } : i,
                  ),
                });
                return finish({ ok: true });
              }
              if (result.cartNotFound) {
                get().clearCart();
                return finish(await startFresh());
              }
              return finish({ ok: false, error: "Could not update the quantity." });
            }

            const result = await addLineToShopifyCart(cartId, { ...item, lineId: null });
            if (result.success) {
              set({ items: [...get().items, { ...item, lineId: result.lineId ?? null }] });
              return finish({ ok: true });
            }
            if (result.cartNotFound) {
              get().clearCart();
              return finish(await startFresh());
            }
            return finish({ ok: false, error: "This item could not be added. It may be out of stock." });
          } catch (error) {
            console.error("Failed to add item:", error);
            return finish({
              ok: false,
              error: error instanceof Error ? error.message : "Could not add to cart.",
            });
          }
        });
      },


      updateQuantity: async (variantId, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(variantId);
          return;
        }
        const { items, cartId, clearCart } = get();
        const item = items.find((i) => i.variantId === variantId);
        if (!item?.lineId || !cartId) return;
        set({ isLoading: true });
        try {
          const result = await updateShopifyCartLine(cartId, item.lineId, quantity);
          if (result.success) {
            const currentItems = get().items;
            set({ items: currentItems.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)) });
          } else if (result.cartNotFound) {
            clearCart();
          }
        } catch (error) {
          console.error("Failed to update quantity:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (variantId) => {
        const { items, cartId, clearCart } = get();
        const item = items.find((i) => i.variantId === variantId);
        if (!item?.lineId || !cartId) return;
        set({ isLoading: true });
        try {
          const result = await removeLineFromShopifyCart(cartId, item.lineId);
          if (result.success) {
            const currentItems = get().items;
            const newItems = currentItems.filter((i) => i.variantId !== variantId);
            if (newItems.length === 0) clearCart();
            else set({ items: newItems });
          } else if (result.cartNotFound) {
            clearCart();
          }
        } catch (error) {
          console.error("Failed to remove item:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: () => set({ items: [], cartId: null, checkoutUrl: null }),
      getCheckoutUrl: () => get().checkoutUrl,

      syncCart: async () => {
        const { cartId, isSyncing, clearCart } = get();
        if (!cartId || isSyncing) return;
        set({ isSyncing: true });
        try {
          const data = await storefrontApiRequest(CART_QUERY, { id: cartId });
          if (!data) return;
          const cart = data?.data?.cart;
          if (!cart || cart.totalQuantity === 0) clearCart();
        } catch (error) {
          console.error("Failed to sync cart with Shopify:", error);
        } finally {
          set({ isSyncing: false });
        }
      },
    }),
    {
      name: "shopify-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, cartId: state.cartId, checkoutUrl: state.checkoutUrl }),
    },
  ),
);
