import { siteRouteApi } from "@/routes/_site";
import { buttonSettings, type ButtonSettings } from "@/lib/buttons";

/** Admin-managed CTA labels + icon names for any storefront component. */
export function useSiteButtons(): ButtonSettings {
  const config = siteRouteApi.useLoaderData();
  return buttonSettings(config.settings);
}
