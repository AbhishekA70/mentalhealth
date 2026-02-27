import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabase_anon_key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const PUBLIC_PATHS = new Set(['/auth/login', '/auth/signup'])

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    supabase_url!,
    supabase_anon_key!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname, search } = request.nextUrl
  const isAuthRoute = PUBLIC_PATHS.has(pathname)

  // Require authentication for all app pages except login/signup.
  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', `${pathname}${search}`)
    return NextResponse.redirect(url)
  }

  // If user is logged in and visits auth pages, send to app home.
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.searchParams.delete('redirect')
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
