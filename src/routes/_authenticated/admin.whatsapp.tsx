import { createFileRoute } from "@tanstack/react-router";
import { Info, MessageCircle } from "lucide-react";
import { AdminPage, Field } from "@/components/admin/AdminUI";
import { useSetting } from "@/components/admin/useSetting";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/admin/whatsapp")({ component: WhatsAppAdmin });

interface ChatValue extends Record<string, unknown> {
  enabled: boolean;
  number: string;
  message: string;
  label: string;
  position: string;
  color: string;
  showOnAllPages: boolean;
  hideOnPaths: string;
}

interface FeaturesValue extends Record<string, unknown> {
  chatWidget: boolean;
}

const DEFAULTS: ChatValue = {
  enabled: false,
  number: "",
  message: "Hi! I have a question about your products.",
  label: "Chat with us",
  position: "right",
  color: "oklch(0.6 0.15 150)",
  showOnAllPages: true,
  hideOnPaths: "",
};

function WhatsAppAdmin() {
  const chat = useSetting<ChatValue>("chat", "marketing", DEFAULTS);
  const features = useSetting<FeaturesValue>("features", "features", { chatWidget: false });

  const digits = String(chat.value.number).replace(/\D/g, "");
  const href = digits ? `https://wa.me/${digits}?text=${encodeURIComponent(chat.value.message)}` : "";

  return (
    <AdminPage
      title="WhatsApp"
      description="A floating WhatsApp button on the storefront. The chat link is generated automatically from the number and message below."
      actions={
        <Button
          onClick={async () => {
            await chat.save();
            await features.save();
          }}
          disabled={chat.saving || features.saving}
        >
          {chat.saving || features.saving ? "Saving…" : "Save changes"}
        </Button>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="size-4 text-primary" aria-hidden /> Widget settings
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <span className="text-sm">Chat widget feature enabled</span>
            <Switch
              checked={features.value.chatWidget === true}
              onCheckedChange={(c) => features.patch({ chatWidget: c })}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <span className="text-sm">Show WhatsApp button</span>
            <Switch checked={chat.value.enabled} onCheckedChange={(c) => chat.patch({ enabled: c })} />
          </div>
          <Field label="WhatsApp number" hint="Include the country code, e.g. 923001234567">
            <Input value={chat.value.number} onChange={(e) => chat.patch({ number: e.target.value })} />
          </Field>
          <Field label="Button label" hint="Leave blank to show only the icon.">
            <Input value={chat.value.label} onChange={(e) => chat.patch({ label: e.target.value })} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Pre-filled message">
              <Textarea rows={2} value={chat.value.message} onChange={(e) => chat.patch({ message: e.target.value })} />
            </Field>
          </div>
          <Field label="Position">
            <Select value={chat.value.position} onValueChange={(v) => chat.patch({ position: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="right">Bottom right</SelectItem>
                <SelectItem value="left">Bottom left</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Button colour" hint="Any CSS colour value.">
            <div className="flex gap-2">
              <Input value={chat.value.color} onChange={(e) => chat.patch({ color: e.target.value })} />
              <span className="h-9 w-9 shrink-0 rounded-md border" style={{ background: chat.value.color }} aria-hidden />
            </div>
          </Field>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <span className="text-sm">Show on all pages</span>
            <Switch
              checked={chat.value.showOnAllPages}
              onCheckedChange={(c) => chat.patch({ showOnAllPages: c })}
            />
          </div>
          <Field label="Hide on paths" hint="Comma separated, e.g. /cart, /checkout">
            <Input value={chat.value.hideOnPaths} onChange={(e) => chat.patch({ hideOnPaths: e.target.value })} />
          </Field>
        </CardContent>
      </Card>

      <Card className="border-dashed bg-muted/40">
        <CardContent className="flex gap-3 p-4 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <p>
            Generated link:{" "}
            {href ? (
              <a className="break-all text-primary underline" href={href} target="_blank" rel="noreferrer">
                {href}
              </a>
            ) : (
              "add a number to generate the WhatsApp link"
            )}
          </p>
        </CardContent>
      </Card>
    </AdminPage>
  );
}
