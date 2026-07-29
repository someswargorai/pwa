import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
    const modifiedHeaders = new Headers(req.headers);
    modifiedHeaders.set("x-user-role", "admin");
    const path = new URL(req.nextUrl);
    const cookieStore = await cookies();
  
    cookieStore.set("role", "admin");

    return NextResponse.next({
      request: {
        headers: modifiedHeaders,
      }
    });
}

export const config = {
    matcher: [
      {
        source: "/(.*)",
        missing: [
          { type: "header", key: "next-router-prefetch" },
          { type: "header", key: "purpose", value: "prefetch" },
        ],
      }
    ]
}
