import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Info, Megaphone, ShieldCheck } from "lucide-react";
import { AdminPage, Field } from "@/components/admin/AdminUI";
import { useSetting } from "@/components/admin/useSetting";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_authenticated/admin/integrations")({ component: IntegrationsAdmin });

interface AnalyticsValue extends Record<string, unknown> {
  enabled: boolean;
  consentRequired: boolean;
  ga4Enabled: boolean;
  ga4Id: string;
  gtmEnabled: boolean;
  gtmId: string;
  metaPixelId: string;
  tiktokPixelId: string;
  searchConsoleVerification: string;
}

interface FeaturesValue extends Record<string, unknown> {
  analytics: boolean;
}

const ANALYTICS_DEFAULTS: AnalyticsValue = {
  enabled: false,
  consentRequired: true,
  ga4Enabled: true,
  ga4Id: "",
  gtmEnabled: true,
  gtmId: "",
  metaPixelId: "",
  tiktokPixelId: "",
  searchConsoleVerification: "",
};

function IntegrationsAdmin() {
  const analytics = useSetting<AnalyticsValue>("analytics", "analytics", ANALYTICS_DEFAULTS);
  const features = useSetting<FeaturesValue>("features", "features", { analytics: false });

  return (
    <AdminPage
      title="Integrations & tracking"
      description="Connect Google Analytics 4, Google Tag Manager, Search Console verification and advertising pixels. No IDs are hard-coded — everything is read from here at runtime."
      actions={
        <Button
          onClick={async () => {
            await analytics.save();
            await features.save();
          }}
          disabled={analytics.saving || features.saving}
        >
          {analytics.saving || features.saving ? "Saving…" : "Save changes"}
        </Button>
      }
    >
      <Card className="border-dashed bg-muted/40">
        <CardContent className="flex gap-3 p-4 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <p>
            Tracking only loads when both the master feature flag and this section are enabled. With “Require cookie
            consent” on, scripts wait until the visitor accepts the cookie banner.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="size-4 text-primary" aria-hidden /> Master switches
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <Toggle
            label="Tracking feature enabled"
            checked={features.value.analytics === true}
            onChange={(c) => features.patch({ analytics: c })}
          />
          <Toggle
            label="Load tracking scripts"
            checked={analytics.value.enabled}
            onChange={(c) => analytics.patch({ enabled: c })}
          />
          <Toggle
            label="Require cookie consent"
            checked={analytics.value.consentRequired}
            onChange={(c) => analytics.patch({ consentRequired: c })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="size-4 text-primary" aria-hidden /> Google
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Toggle
            label="Google Analytics 4 enabled"
            checked={analytics.value.ga4Enabled}
            onChange={(c) => analytics.patch({ ga4Enabled: c })}
          />
          <Field label="GA4 Measurement ID" hint="Format: G-XXXXXXXXXX">
            <Input
              value={analytics.value.ga4Id}
              placeholder="G-XXXXXXXXXX"
              onChange={(e) => analytics.patch({ ga4Id: e.target.value.trim() })}
            />
          </Field>
          <Toggle
            label="Google Tag Manager enabled"
            checked={analytics.value.gtmEnabled}
            onChange={(c) => analytics.patch({ gtmEnabled: c })}
          />
          <Field label="GTM Container ID" hint="Format: GTM-XXXXXXX">
            <Input
              value={analytics.value.gtmId}
              placeholder="GTM-XXXXXXX"
              onChange={(e) => analytics.patch({ gtmId: e.target.value.trim() })}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field
              label="Search Console verification"
              hint="Paste only the content value of the google-site-verification meta tag."
            >
              <Input
                value={analytics.value.searchConsoleVerification}
                onChange={(e) => analytics.patch({ searchConsoleVerification: e.target.value.trim() })}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Megaphone className="size-4 text-primary" aria-hidden /> Advertising pixels
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Meta (Facebook) Pixel ID">
            <Input
              value={analytics.value.metaPixelId}
              onChange={(e) => analytics.patch({ metaPixelId: e.target.value.trim() })}
            />
          </Field>
          <Field label="TikTok Pixel ID">
            <Input
              value={analytics.value.tiktokPixelId}
              onChange={(e) => analytics.patch({ tiktokPixelId: e.target.value.trim() })}
            />
          </Field>
        </CardContent>
      </Card>
    </AdminPage>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
