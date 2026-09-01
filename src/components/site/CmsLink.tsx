import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

/**
 * Link for admin-authored URLs. CMS URLs are plain strings, so they cannot be
 * type-checked against the generated route tree. External links fall back to <a>.
 */
export function CmsLink({
  to,
  className,
  children,
  onClick,
}: {
  to: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  if (/^(https?:)?\/\//.test(to) || to.startsWith("mailto:") || to.startsWith("tel:")) {
    return (
      <a href={to} className={className} target="_blank" rel="noopener noreferrer" onClick={onClick}>
        {children}
      </a>
    );
  }
  if (to.startsWith("#") || to.includes("?")) {
    return (
      <a href={to} className={className} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to as never} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
