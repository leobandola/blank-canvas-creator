import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // O sistema usa autenticação customizada via cookies, não precisa do middleware do Supabase
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
