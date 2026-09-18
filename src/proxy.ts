import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

const VALID_LOCALES = new Set(routing.locales); // ["bn", "en"]
const DEFAULT_LOCALE = routing.defaultLocale;   // "bn"

/** Type guard: narrows a plain `string` to the locale union. */
function isValidLocale(segment: string): segment is (typeof routing.locales)[number] {
  return (VALID_LOCALES as Set<string>).has(segment);
}

const SESSION_COOKIE =
  process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

const PROTECTED_PREFIXES = ["/profile", "/boats", "/trips", "/reports", "/recyclebin", "/maintenance"];

function isProtected(pathnameWithoutLocale: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) =>
      pathnameWithoutLocale === prefix ||
      pathnameWithoutLocale.startsWith(prefix + "/")
  );
}

/**
 * Handles locale routing robustly:
 *  - /             → /bn/
 *  - /stories      → /bn/stories   (missing prefix)
 *  - /fr/stories   → /bn/stories   (invalid locale treated as path)
 *  - /bn/stories   → served as-is
 *  - /en/stories   → served as-is
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Split pathname into segments: "/bn/stories" → ["", "bn", "stories"]
  const segments = pathname.split("/");
  const firstSegment = segments[1]; // e.g. "bn", "en", "stories", "fr", ""

  // If the first path segment is NOT a valid locale, redirect to default locale
  if (!isValidLocale(firstSegment)) {
    const url = request.nextUrl.clone();
    // Prepend the default locale, keep the rest of the path intact
    url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url, { status: 308 }); // 308 = Permanent Redirect
  }

  const localePrefix = `/${firstSegment}`;
  const pathnameWithoutLocale = pathname.slice(localePrefix.length) || "/";

  // Auth guard for protected routes
  if (isProtected(pathnameWithoutLocale)) {
    const hasSession = request.cookies.has(SESSION_COOKIE);
    if (!hasSession) {
      // Redirect to the referring page if available, otherwise to locale root
      const referer = request.headers.get("referer");
      if (referer) {
        return NextResponse.redirect(new URL(referer), { status: 303 });
      } else {
        const url = request.nextUrl.clone();
        url.pathname = localePrefix;
        url.searchParams.set("auth", "required");
        return NextResponse.redirect(url, { status: 303 });
      }
    }
  }

  // Valid locale present — let next-intl handle the rest
  return intlMiddleware(request);
}

// Default export for compatibility with next-intl's createMiddleware expectations
export default proxy;

export const config = {
  // Match everything except: API routes, Next.js internals, static files, favicons
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};


