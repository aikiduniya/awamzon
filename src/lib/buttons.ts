import { group, type SettingsMap } from "./cms-types";

/**
 * CTA button labels + icon names, all editable in Admin → Site settings → Buttons.
 * Components must read labels/icons from here instead of hardcoding copy.
 */
export interface ButtonSettings {
  showIcons: boolean;
  addToCartLabel: string;
  addToCartIcon: string;
  buyNowLabel: string;
  buyNowIcon: string;
  shopNowLabel: string;
  shopNowIcon: string;
  viewCollectionLabel: string;
  viewCollectionIcon: string;
  readMoreLabel: string;
  readMoreIcon: string;
  learnMoreLabel: string;
  learnMoreIcon: string;
  subscribeLabel: string;
  subscribeIcon: string;
  contactLabel: string;
  contactIcon: string;
  continueShoppingLabel: string;
  continueShoppingIcon: string;
  viewAllLabel: string;
  viewAllIcon: string;
  quickViewLabel: string;
  quickViewIcon: string;
  checkoutLabel: string;
  checkoutIcon: string;
  searchLabel: string;
  searchIcon: string;
}

export const buttonDefaults: ButtonSettings = {
  showIcons: true,
  addToCartLabel: "Add to cart",
  addToCartIcon: "ShoppingBag",
  buyNowLabel: "Buy it now",
  buyNowIcon: "Zap",
  shopNowLabel: "Shop now",
  shopNowIcon: "ArrowRight",
  viewCollectionLabel: "View collection",
  viewCollectionIcon: "LayoutGrid",
  readMoreLabel: "Read more",
  readMoreIcon: "BookOpen",
  learnMoreLabel: "Learn more",
  learnMoreIcon: "Info",
  subscribeLabel: "Subscribe",
  subscribeIcon: "Send",
  contactLabel: "Contact us",
  contactIcon: "MessageCircle",
  continueShoppingLabel: "Continue shopping",
  continueShoppingIcon: "ArrowLeft",
  viewAllLabel: "View all",
  viewAllIcon: "ArrowRight",
  quickViewLabel: "Quick view",
  quickViewIcon: "Eye",
  checkoutLabel: "Checkout",
  checkoutIcon: "CreditCard",
  searchLabel: "Search",
  searchIcon: "Search",
};

export function buttonSettings(settings: SettingsMap): ButtonSettings {
  return group(settings, "buttons", buttonDefaults);
}

/** Resolve a button's label + icon, allowing a per-section CMS override. */
export function cta(
  b: ButtonSettings,
  key: "addToCart" | "buyNow" | "shopNow" | "viewCollection" | "readMore" | "learnMore" | "subscribe" | "contact" | "continueShopping" | "viewAll" | "quickView" | "checkout" | "search",
  overrides?: { label?: string | undefined; icon?: string | undefined },
) {
  const label = overrides?.label || (b[`${key}Label` as keyof ButtonSettings] as string);
  const icon = overrides?.icon || (b[`${key}Icon` as keyof ButtonSettings] as string);
  return { label, icon: b.showIcons ? icon : "" };
}
