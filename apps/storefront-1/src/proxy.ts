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

export function proxy(request: NextRequest) {
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
