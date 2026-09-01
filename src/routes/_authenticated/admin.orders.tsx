import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "@/components/admin/AdminUI";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/admin/orders")({ component: OrdersAdmin });

function OrdersAdmin() {
  return (
    <AdminPage
      title="Orders & customers"
      description="Checkout, payments, orders, fulfilment and customer accounts are handled by Shopify — the secure system of record for commerce data."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">How it works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>The storefront cart is created through the Shopify Storefront API and checkout completes on Shopify's secure, PCI-compliant checkout.</p>
            <p>Orders, refunds, customers and inventory therefore live in your Shopify admin. No order or payment data is duplicated here, and no Shopify secret keys are ever exposed to the browser.</p>
            <p>Everything else — content, design, navigation, SEO and marketing — is fully editable in this CMS.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Manage in Shopify</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Open your Shopify admin to view orders, customers and inventory, or ask in chat to create and update products.</p>
            <a className="text-primary underline" href="https://admin.shopify.com" target="_blank" rel="noreferrer">
              Open Shopify admin
            </a>
          </CardContent>
        </Card>
      </div>
    </AdminPage>
  );
}
