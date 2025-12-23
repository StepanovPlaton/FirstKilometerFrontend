import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { nameOfAuthTokensStorePersist } from './shared/utils/schemes/tokens';
import { JWTTools } from './shared/utils/services/tools';

export async function middleware(request: NextRequest) {
  const cookieAuthTokens = (await cookies()).get(nameOfAuthTokensStorePersist)?.value;
  try {
    if (cookieAuthTokens) {
      new JWTTools().decodeAndValidatePairJWTTokenFromCookies(cookieAuthTokens);
    } else {
      throw new Error('Middleware: Unexpected content of auth cookies');
    }
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|login|font|logo).*)'],
};
