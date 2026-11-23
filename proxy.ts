import { auth } from "@/lib/auth/server";

export default auth.middleware({
  loginUrl: "/login",
});

export const config = {
  matcher: [
    "/home/:path*",
    "/documents/:path*",
    "/customers/:path*",
    "/settings/:path*",
  ],
};
