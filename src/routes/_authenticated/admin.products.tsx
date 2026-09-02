import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { AdminPage } from "@/components/admin/AdminUI";
import { DataTable, type DataColumn } from "@/components/admin/DataTable";
import { fetchProducts, formatMoney, type ShopifyProduct } from "@/lib/shopify";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/products")({ component: ProductsAdmin });

function ProductsAdmin() {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void fetchProducts({ first: 250 }).then(
      (data) => {
        if (!active) return;
        setProducts(data);
        setLoading(false);
      },
      () => active && setLoading(false),
    );
    return () => {
      active = false;
    };
  }, []);

  const vendors = useMemo(
    () =>
      Array.from(new Set(products.map((p) => p.node.vendor).filter(Boolean))).map((v) => ({
        value: String(v),
        label: String(v),
      })),
    [products],
  );

  const stockOf = (p: ShopifyProduct) =>
    p.node.variants.edges.reduce((sum, v) => sum + (v.node.quantityAvailable ?? 0), 0);
  const availableOf = (p: ShopifyProduct) => p.node.variants.edges.some((v) => v.node.availableForSale);

  const columns: Array<DataColumn<ShopifyProduct>> = [
    {
      key: "title",
      header: "Product",
      value: (p) => p.node.title,
      render: (p) => {
        const image = p.node.images.edges[0]?.node.url;
        return (
          <div className="flex items-center gap-3">
            {image ? (
              <img src={image} alt={p.node.title} className="h-10 w-10 rounded object-cover" loading="lazy" />
            ) : (
              <div className="h-10 w-10 rounded bg-muted" />
            )}
            <div>
              <p className="font-medium">{p.node.title}</p>
              <p className="text-xs text-muted-foreground">/product/{p.node.handle}</p>
            </div>
          </div>
        );
      },
    },
    { key: "vendor", header: "Brand", value: (p) => p.node.vendor ?? "—" },
    {
      key: "price",
      header: "Price",
      value: (p) => Number(p.node.priceRange.minVariantPrice.amount),
      render: (p) => (
        <span className="whitespace-nowrap tabular-nums">
          {formatMoney(p.node.priceRange.minVariantPrice.amount, p.node.priceRange.minVariantPrice.currencyCode)}
        </span>
      ),
    },
    { key: "variants", header: "Variants", value: (p) => p.node.variants.edges.length },
    { key: "stock", header: "Inventory", value: (p) => stockOf(p) },
    {
      key: "tags",
      header: "Tags",
      hidden: true,
      value: (p) => (p.node.tags ?? []).join(", "),
    },
    {
      key: "status",
      header: "Status",
      value: (p) => (availableOf(p) ? "In stock" : "Sold out"),
      render: (p) => (
        <Badge variant={availableOf(p) ? "default" : "secondary"}>{availableOf(p) ? "In stock" : "Sold out"}</Badge>
      ),
    },
  ];

  return (
    <AdminPage
      title="Products & inventory"
      description="Live catalogue from Shopify. Products, pricing, variants and inventory are managed in Shopify and stay in sync with the storefront automatically."
      actions={
        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <a href="https://admin.shopify.com" target="_blank" rel="noreferrer">
            <ExternalLink className="size-3.5" aria-hidden /> Manage in Shopify
          </a>
        </Button>
      }
    >
      <DataTable
        rows={products}
        loading={loading}
        columns={columns}
        getId={(p) => p.node.id}
        searchPlaceholder="Search products by title, brand, tag…"
        csvName="products"
        emptyText="No products found. Ask in chat to create products for your store."
        filters={[
          {
            key: "availability",
            label: "Availability",
            options: [
              { value: "in", label: "In stock" },
              { value: "out", label: "Sold out" },
            ],
            match: (p, v) => (v === "in" ? availableOf(p) : !availableOf(p)),
          },
          {
            key: "vendor",
            label: "Brands",
            options: vendors,
            match: (p, v) => p.node.vendor === v,
          },
        ]}
        rowActions={(p) => (
          <Button asChild size="sm" variant="ghost">
            <a href={`/product/${p.node.handle}`} target="_blank" rel="noreferrer">
              View
            </a>
          </Button>
        )}
      />
    </AdminPage>
  );
}
