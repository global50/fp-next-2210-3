import { PUBLIC_ROUTES } from "./PUBLIC_ROUTES";

/**
 * Check whether a given pathname matches one of the public routes.
 * Behavior:
 * - Normalizes trailing slashes (so "/route" and "/route/" match).
 * - By default requires exact match to avoid accidental prefix matches
 *   (e.g. "/sign-in" will not match "/sign-in-evil").
 * - Supports explicit wildcard routes by adding "/*" to the entry in
 *   PUBLIC_ROUTES (for example: "/auth/*" will match "/auth/confirm").
 */
export function isPublicRoute(pathname: string) {
  // Handle empty string explicitly
  if (!pathname) return false;

  const normalize = (p: string) => {
    // First trim whitespace
    const trimmed = p.replace(/^\s+|\s+$/g, "");

    // Handle empty string or just slashes
    if (!trimmed || /^\/+$/.test(trimmed)) return "/";

    // Security: Decode URL encoding to prevent bypass

    let decoded: string;

    try {
      decoded = decodeURIComponent(trimmed);
    } catch {
      return "/__BLOCKED_INVALID_ENCODING__";
    }

    // Security: Block any path containing directory traversal attempts or suspicious patterns
    if (decoded.includes("../") || decoded.includes("/./") || decoded.startsWith("//") || decoded.includes("://")) {
      return "/__BLOCKED_TRAVERSAL__";
    }

    // Normalize multiple slashes to single slash
    decoded = decoded.replace(/\/+/g, "/");

    // Security: Block paths with null bytes or other control characters
    if (decoded.includes("\0")) {
      return "/__BLOCKED_CONTROL_CHARS__";
    }

    // Remove trailing slashes (but keep leading slash)
    return decoded.replace(/\/+$/, "");
  };
  const path = normalize(pathname);

  for (const route of PUBLIC_ROUTES) {
    // wildcard support: route like "/auth/*" will allow any child under /auth
    if (route.endsWith("/*")) {
      const base = normalize(route.slice(0, -2));

      if (base === "/") {
        // an entry of "/*" is ambiguous; treat it as explicit root only (do not match everything)
        if (path === "/") return true;
        continue;
      }

      if (path === base || path.startsWith(base + "/")) return true;
      continue;
    }

    const r = normalize(route);

    if (path === r) return true;
  }

  return false;
}
