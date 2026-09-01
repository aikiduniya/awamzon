import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminPage, EmptyState } from "@/components/admin/AdminUI";
import { fetchProducts, formatMoney, type ShopifyProduct } from "@/lib/shopify";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/admin/products")({ component: ProductsAdmin });

function ProductsAdmin() {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const timer = setTimeout(() => {
      void fetchProducts({ first: 100, query }).then(
        (data) => {
          if (active) {
            setProducts(data);
            setLoading(false);
          }
        },
        () => active && setLoading(false),
      );
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  return (
    <AdminPage
      title="Products & inventory"
      description="Live catalogue from Shopify. Products, pricing, variants and inventory are managed in Shopify and stay in sync with the storefront automatically."
    >
      <Input
        placeholder="Search products (Shopify query syntax supported)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-md"
      />
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading products…</p>
      ) : products.length === 0 ? (
        <EmptyState text="No products found. Ask in chat to create products for your store." />
      ) : (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Variants</TableHead>
                  <TableHead>Inventory</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map(({ node }) => {
                  const variants = node.variants.edges;
                  const stock = variants.reduce((sum, v) => sum + (v.node.quantityAvailable ?? 0), 0);
                  const available = variants.some((v) => v.node.availableForSale);
                  const image = node.images.edges[0]?.node.url;
                  return (
                    <TableRow key={node.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {image ? (
                            <img src={image} alt={node.title} className="h-10 w-10 rounded object-cover" loading="lazy" />
                          ) : (
                            <div className="h-10 w-10 rounded bg-muted" />
                          )}
                          <div>
                            <p className="font-medium">{node.title}</p>
                            <p className="text-xs text-muted-foreground">/product/{node.handle}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatMoney(node.priceRange.minVariantPrice.amount, node.priceRange.minVariantPrice.currencyCode)}
                      </TableCell>
                      <TableCell>{variants.length}</TableCell>
                      <TableCell>{stock}</TableCell>
                      <TableCell>
                        <Badge variant={available ? "default" : "secondary"}>{available ? "In stock" : "Sold out"}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </AdminPage>
  );
}
