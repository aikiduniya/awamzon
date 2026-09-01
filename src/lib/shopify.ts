import { toast } from "sonner";

export const SHOPIFY_API_VERSION = "2025-07";
export const SHOPIFY_STORE_PERMANENT_DOMAIN = "store-studio-od5t7-7mhztzeg.myshopify.com";
export const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
export const SHOPIFY_STOREFRONT_TOKEN = "6f0fffa6bb0b9c96ad9858e01058bf37";

export interface ShopifyProduct {
  node: {
    id: string;
    title: string;
    description: string;
    descriptionHtml?: string;
    handle: string;
    vendor?: string;
    tags?: string[];
    priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
    compareAtPriceRange?: { minVariantPrice: { amount: string; currencyCode: string } };
    images: { edges: Array<{ node: { url: string; altText: string | null } }> };
    variants: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          sku?: string | null;
          price: { amount: string; currencyCode: string };
          compareAtPrice?: { amount: string; currencyCode: string } | null;
          availableForSale: boolean;
          quantityAvailable?: number | null;
          selectedOptions: Array<{ name: string; value: string }>;
        };
      }>;
    };
    options: Array<{ name: string; values: string[] }>;
  };
}

const PRODUCT_FRAGMENT = `
  id
  title
  description
  descriptionHtml
  handle
  vendor
  tags
  priceRange { minVariantPrice { amount currencyCode } }
  compareAtPriceRange { minVariantPrice { amount currencyCode } }
  images(first: 8) { edges { node { url altText } } }
  variants(first: 25) {
    edges {
      node {
        id
        title
        sku
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
        availableForSale
        selectedOptions { name value }
      }
    }
  }
  options { name values }
`;

export const PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $query: String, $sortKey: ProductSortKeys, $after: String) {
    products(first: $first, query: $query, sortKey: $sortKey, after: $after) {
      pageInfo { hasNextPage endCursor }
      edges { node { ${PRODUCT_FRAGMENT} } }
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = `
  query GetProduct($handle: String!) {
    product(handle: $handle) { ${PRODUCT_FRAGMENT} }
  }
`;

export const COLLECTIONS_QUERY = `
  query GetCollections($first: Int!) {
    collections(first: $first) {
      edges { node { id title handle description image { url altText } } }
    }
  }
`;

export const COLLECTION_BY_HANDLE_QUERY = `
  query GetCollection($handle: String!, $first: Int!, $sortKey: ProductCollectionSortKeys) {
    collection(handle: $handle) {
      id
      title
      handle
      description
      image { url altText }
      products(first: $first, sortKey: $sortKey) {
        edges { node { ${PRODUCT_FRAGMENT} } }
      }
    }
  }
`;

export async function storefrontApiRequest(query: string, variables: Record<string, unknown> = {}) {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (response.status === 402) {
    if (typeof window !== "undefined") {
      toast.error("Shopify: Payment required", {
        description: "Shopify API access requires an active billing plan on your store.",
      });
    }
    return;
  }

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

  const data = await response.json();
  if (data.errors) {
    throw new Error(`Error calling Shopify: ${data.errors.map((e: { message: string }) => e.message).join(", ")}`);
  }
  return data;
}

export async function fetchProducts(opts: { first?: number; query?: string; sortKey?: string } = {}) {
  const data = await storefrontApiRequest(PRODUCTS_QUERY, {
    first: opts.first ?? 24,
    query: opts.query || undefined,
    sortKey: opts.sortKey || undefined,
  });
  return (data?.data?.products?.edges ?? []) as ShopifyProduct[];
}

export async function fetchProductByHandle(handle: string) {
  const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
  const product = data?.data?.product;
  return product ? ({ node: product } as ShopifyProduct) : null;
}

export interface ShopifyCollection {
  id: string;
  title: string;
  handle: string;
  description: string;
  image: { url: string; altText: string | null } | null;
}

export async function fetchCollections(first = 20) {
  const data = await storefrontApiRequest(COLLECTIONS_QUERY, { first });
  return ((data?.data?.collections?.edges ?? []) as Array<{ node: ShopifyCollection }>).map((e) => e.node);
}

export async function fetchCollection(handle: string, first = 48, sortKey?: string) {
  const data = await storefrontApiRequest(COLLECTION_BY_HANDLE_QUERY, { handle, first, sortKey });
  const collection = data?.data?.collection;
  if (!collection) return null;
  return {
    ...(collection as ShopifyCollection),
    products: (collection.products?.edges ?? []) as ShopifyProduct[],
  };
}

export function formatMoney(amount: string | number, currencyCode: string) {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: currencyCode }).format(value);
  } catch {
    return `${currencyCode} ${value.toFixed(2)}`;
  }
}
