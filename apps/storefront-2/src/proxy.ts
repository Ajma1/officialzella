// apps/storefront-2/src/proxy.ts
import { NextResponse, type NextRequest } from "next/server";

/**
 * feedback.officialzella.com is a single-purpose subdomain: every request
 * to it is served storefront-2's own /feedback route, same-origin (no
 * cross-project hop, unlike storefront-1's old A/B proxy). Any other host
 * (officialzella.com, the storefront-2 .vercel.app alias, localhost)
 * passes straight through.
 */
export function proxy(request: NextRequest) {
  if (request.nextUrl.hostname !== "feedback.officialzella.com") {
    return NextResponse.next();
  }

  return NextResponse.rewrite(new URL("/feedback", request.url));
}

export const config = {
  matcher: "/",
};
