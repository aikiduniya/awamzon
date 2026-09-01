import { createFileRoute } from "@tanstack/react-router";
import { AdminPage, SettingsCard } from "@/components/admin/AdminUI";
import { useSettings } from "./admin.settings";

export const Route = createFileRoute("/_authenticated/admin/theme")({ component: ThemeAdmin });

function ThemeAdmin() {
  const { draft, setDraft, saving, save } = useSettings();
  const theme = draft["theme"] ?? {};

  return (
    <AdminPage
      title="Theme, colors & fonts"
      description="Applied live to the storefront through CSS variables. Use any valid CSS color (oklch, hsl, hex) and font stack."
    >
      <SettingsCard
        title="Theme tokens"
        description="Colors, radius, fonts, container width and section spacing."
        value={theme}
        onChange={(next) => setDraft((d) => ({ ...d, theme: next }))}
        onSave={() => void save("theme", "theme")}
        saving={saving === "theme"}
      />
      <div className="rounded-lg border bg-background p-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preview</p>
        <div
          className="rounded-lg border p-6"
          style={{
            background: String(theme["background"] ?? ""),
            color: String(theme["foreground"] ?? ""),
            borderRadius: String(theme["radius"] ?? "0.5rem"),
          }}
        >
          <p style={{ fontFamily: String(theme["headingFont"] ?? "inherit"), fontSize: "1.5rem" }}>Heading sample</p>
          <p style={{ fontFamily: String(theme["bodyFont"] ?? "inherit") }}>
            Body text sample for the storefront theme.
          </p>
          <span
            className="mt-4 inline-block px-4 py-2"
            style={{
              background: String(theme["primary"] ?? ""),
              color: String(theme["primaryForeground"] ?? ""),
              borderRadius: String(theme["radius"] ?? "0.5rem"),
            }}
          >
            Primary button
          </span>
        </div>
      </div>
    </AdminPage>
  );
}
