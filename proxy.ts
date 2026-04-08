import { auth } from "@/auth";
import { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  return auth(request as any);
}

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)"],
};
