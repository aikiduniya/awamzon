import { createContext, useContext, useMemo, type ReactNode } from "react";
import { group, type SettingsMap } from "@/lib/cms-types";
import { formatMoney } from "@/lib/shopify";

export interface CurrencyDef {
  code: string;
  label: string;
  symbol: string;
  /** Multiplier applied to the Shopify (store) price for display only. */
  rate: number;
  /** "before" | "after" */
  position: string;
  decimals: number;
  enabled: boolean;
  order: number;
}

export interface CurrencySettings {
  enabled: boolean;
  defaultCode: string;
  showSwitcher: boolean;
  note: string;
  list: CurrencyDef[];
}

export const currencyDefaults: CurrencySettings = {
  enabled: false,
  defaultCode: "PKR",
  showSwitcher: false,
  note: "Prices are shown for reference. Checkout is completed in the store currency.",
  list: [],
};

function coerceList(value: unknown): CurrencyDef[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is Record<string, unknown> => typeof v === "object" && v !== null)
    .map((v, index) => ({
      code: String(v["code"] ?? "").toUpperCase(),
      label: String(v["label"] ?? v["code"] ?? ""),
      symbol: String(v["symbol"] ?? ""),
      rate: Number(v["rate"] ?? 1) || 1,
      position: String(v["position"] ?? "before"),
      decimals: Number.isFinite(Number(v["decimals"])) ? Number(v["decimals"]) : 2,
      enabled: v["enabled"] !== false,
      order: Number(v["order"] ?? index),
    }))
    .filter((c) => c.code)
    .sort((a, b) => a.order - b.order);
}

export function readCurrencySettings(settings: SettingsMap): CurrencySettings {
  const raw = group(settings, "currency", currencyDefaults as unknown as Record<string, unknown>);
  return {
    enabled: raw["enabled"] === true,
    defaultCode: String(raw["defaultCode"] ?? "PKR").toUpperCase(),
    showSwitcher: raw["showSwitcher"] === true,
    note: String(raw["note"] ?? currencyDefaults.note),
    list: coerceList(raw["list"]),
  };
}

export type MoneyFormatter = (amount: string | number, storeCurrencyCode: string) => string;

const CurrencyContext = createContext<{ settings: CurrencySettings; format: MoneyFormatter } | null>(null);

export function buildFormatter(settings: CurrencySettings): MoneyFormatter {
  const active = settings.list.find((c) => c.enabled && c.code === settings.defaultCode);
  return (amount, storeCurrencyCode) => {
    const base = typeof amount === "string" ? parseFloat(amount) : amount;
    if (!settings.enabled || !active || active.code === storeCurrencyCode) {
      return formatMoney(amount, storeCurrencyCode);
    }
    const value = base * (active.rate || 1);
    const body = value.toLocaleString(undefined, {
      minimumFractionDigits: active.decimals,
      maximumFractionDigits: active.decimals,
    });
    const symbol = active.symbol || active.code;
    return active.position === "after" ? `${body} ${symbol}` : `${symbol}${body}`;
  };
}

export function CurrencyProvider({ settings, children }: { settings: SettingsMap; children: ReactNode }) {
  const value = useMemo(() => {
    const parsed = readCurrencySettings(settings);
    return { settings: parsed, format: buildFormatter(parsed) };
  }, [settings]);
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

/** Money formatter that honours Admin → Currency; falls back to the Shopify currency. */
export function useMoney(): MoneyFormatter {
  const ctx = useContext(CurrencyContext);
  return ctx?.format ?? formatMoney;
}

export function useCurrencySettings(): CurrencySettings {
  return useContext(CurrencyContext)?.settings ?? currencyDefaults;
}
