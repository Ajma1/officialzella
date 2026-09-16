import { NextResponse, type NextRequest } from "next/server";

/**
 * The A/B gateway: storefront-1's domain is the single public entry point for
 * both storefronts. Half of first-time visitors get a sticky cookie pinning
 * them to storefront-1 (this app, served normally); the other half get
 * rewritten transparently — on every request, including static assets and
 * Server Action POSTs — to storefront-2's deployment, so the address bar
 * never changes. `NextResponse.rewrite` to an absolute cross-origin URL is
 * what makes the proxy invisible to the browser.
 */
const VARIANT_COOKIE = "zella-ab";
const STOREFRONT_2_ORIGIN =
  process.env.STOREFRONT_2_ORIGIN ??
  "https://storefront-2-ajmals-projects-648d0d21.vercel.app";
const ONE_YEAR = 60 * 60 * 24 * 365;
const CANONICAL_HOSTS = new Set(["officialzella.com", "www.officialzella.com"]);

export function proxy(request: NextRequest) {
  // Every Vercel project also answers on its own *.vercel.app alias. Left
  // alone, that alias bypasses this proxy entirely — no A/B split, no sticky
  // cookie. Only production has a canonical domain to redirect to; preview
  // deployments (git branches) still need their own raw URL to be reviewable.
  if (
    process.env.VERCEL_ENV === "production" &&
    !CANONICAL_HOSTS.has(request.nextUrl.hostname)
  ) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.hostname = "officialzella.com";
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  const existing = request.cookies.get(VARIANT_COOKIE)?.value;
  const variant: "a" | "b" =
    existing === "a" || existing === "b"
      ? existing
      : Math.random() < 0.5
        ? "a"
        : "b";

  const response =
    variant === "b"
      ? NextResponse.rewrite(
          new URL(
            request.nextUrl.pathname + request.nextUrl.search,
            STOREFRONT_2_ORIGIN,
          ),
        )
      : NextResponse.next();

  if (!existing) {
    response.cookies.set(VARIANT_COOKIE, variant, {
      maxAge: ONE_YEAR,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
}

export const config = {
  matcher: "/:path*",
};
