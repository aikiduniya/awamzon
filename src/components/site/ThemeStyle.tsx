import type { ThemeSettings } from "@/lib/cms-types";

export function ThemeStyle({ theme }: { theme: ThemeSettings }) {
  const css = `:root{
    --primary:${theme.primary};
    --primary-foreground:${theme.primaryForeground};
    --accent:${theme.accent};
    --accent-foreground:${theme.foreground};
    --background:${theme.background};
    --foreground:${theme.foreground};
    --card:${theme.background};
    --card-foreground:${theme.foreground};
    --popover:${theme.background};
    --popover-foreground:${theme.foreground};
    --muted:${theme.muted};
    --secondary:${theme.muted};
    --secondary-foreground:${theme.foreground};
    --border:${theme.border};
    --input:${theme.border};
    --ring:${theme.primary};
    --radius:${theme.radius};
    --heading-font:${theme.headingFont};
    --body-font:${theme.bodyFont};
    --container-width:${theme.containerWidth};
    --section-spacing:${theme.sectionSpacing};
  }`;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
