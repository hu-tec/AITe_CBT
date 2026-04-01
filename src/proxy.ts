import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const session = await auth();
  const path = request.nextUrl.pathname;

  const isAdminRoute = path.startsWith("/admin");
  const isStudentRoute = path.startsWith("/student");
  const isPublicRoute = ["/login", "/register"].includes(path);

  // 관리자 라우트: ADMIN만 접근
  if (isAdminRoute) {
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 응시자 라우트: 인증 필요
  if (isStudentRoute) {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 로그인/회원가입: 이미 인증된 사용자 리다이렉트
  if (isPublicRoute && session?.user) {
    const redirectUrl =
      session.user.role === "ADMIN" ? "/admin" : "/student";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
