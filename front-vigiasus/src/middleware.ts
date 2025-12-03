// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas protegidas com permissões específicas (RBAC)
const protectedRoutes = [
  {
    path: '/admin',
    roles: ['admin'],
  },
  {
    path: '/dashboard/secretaria',
    roles: ['secretaria', 'admin'],
  },
  {
    path: '/validar',
    roles: ['gerente', 'diretor', 'membro', 'admin', 'secretaria'],
  },
];

// Rotas públicas (não requerem login)
const publicRoutes = ['/login', '/esqueci-senha', '/404'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('vigiasus_token')?.value || null;

  // IMPORTANTE: normaliza o role para lowercase
  const userRole = request.cookies.get('vigiasus_role')?.value?.toLowerCase() || null;

  const { pathname } = request.nextUrl;

  // 1. Se for rota pública, libera
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    // Se já está logado e tenta usar /login → manda para Home
    if (pathname === '/login' && token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // 2. Qualquer outra rota requer token **incluindo a Home '/'**
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. RBAC – verifica permissões específicas
  const matchedRoute = protectedRoutes.find(route =>
    pathname.startsWith(route.path)
  );

  if (matchedRoute) {
    // Normaliza todas permissões para lowercase
    const allowedRoles = matchedRoute.roles.map(r => r.toLowerCase());

    if (!userRole || !allowedRoles.includes(userRole)) {
      // Sem permissão → envia para Home (rota protegida, mas o usuário tem token)
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Intercepta todas as rotas, exceto:
    // - /api
    // - /_next/static
    // - /_next/image
    // - /favicon.ico
    // - arquivos públicos
    '/((?!api|_next/static|_next/image|favicon.ico|logos|icons|public).*)',
  ],
};
