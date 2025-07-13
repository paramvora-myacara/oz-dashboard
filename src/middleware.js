import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request) {
  console.log('🔥 MIDDLEWARE IS RUNNING FOR:', request.nextUrl.pathname)
  
  // Protected routes that require authentication
  const protectedRoutes = ['/check-oz']
  const { pathname } = request.nextUrl
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  console.log('🔒 Is protected route:', isProtectedRoute)

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // This will refresh session if expired - required for Server Components
  const { data: { user }, error } = await supabase.auth.getUser()

  console.log('👤 User found:', !!user)
  if (user) {
    console.log('📧 User email:', user.email)
  }

  // Check if this is a protected route and user is not authenticated
  if (isProtectedRoute && !user) {
    console.log('🚫 Blocking access - redirecting to login page')
    // Redirect to login page with returnTo parameter
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('returnTo', pathname)
    console.log('🔄 Redirecting to:', loginUrl.toString())
    return NextResponse.redirect(loginUrl)
  }

  console.log('✅ Allowing access to:', pathname)
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 