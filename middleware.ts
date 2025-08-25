
// import { NextRequest, NextResponse } from 'next/server';
// import { jwtVerify } from 'jose';

// const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

// export async function middleware(req: NextRequest) {
//   const pathname = req.nextUrl.pathname;

//   // استثناء المسارات التي لا تحتاج توثيق
//   if (pathname === '/login') {
//     const token = req.cookies.get('accessToken')?.value;
//     if (token) {
//       try {
//         await jwtVerify(token, JWT_SECRET, { algorithms: ['HS256'] });
//         console.log('Middleware: Valid token found on /login, redirecting to /');
//         return NextResponse.redirect(new URL('/', req.url));
//       } catch (error) {
//         console.log('Middleware: Invalid token on /login, allowing access.');
//       }
//     }
//     return NextResponse.next();
//   }

//   // حماية باقي المسارات
//   const token = req.cookies.get('accessToken')?.value;

//   if (!token) {
//     console.log('Middleware: No token found, redirecting to /login');
//     return NextResponse.redirect(new URL(`/login?error=session_expired&returnTo=${pathname}`, req.url));
//   }

//   try {
//     await jwtVerify(token, JWT_SECRET, { algorithms: ['HS256'] });
//     console.log('Middleware: Valid token. Access granted.');
//     return NextResponse.next();
//   } catch (error: any) {
//     console.error('Middleware: Authentication error:', error.message);
//     return NextResponse.redirect(new URL(`/login?error=session_expired&returnTo=${pathname}`, req.url));
//   }
// }

// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for:
//      * - `_next/static` (static files)
//      * - `_next/image` (image optimization files)
//      * - `favicon.ico` (favicon file)
//      * - `api` (api routes)
//      * - `login`
//      */
//     '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
//   ],
// };

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { jwtService } from '@/utils/jwt';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
const API_URL = process.env.NEXT_PUBLIC_APP_URL || `http://localhost:3000`;

export async function middleware(req: NextRequest) {
  console.log('Middleware: Processing request for:', req.nextUrl.pathname);
  
  const pathname = req.nextUrl.pathname;
  const accessToken = req.cookies.get('accessToken')?.value;
  const refreshToken = req.cookies.get('refreshToken')?.value;
  
  // إذا لم يوجد أي توكن، توجيه لصفحة تسجيل الدخول
  if (!accessToken && !refreshToken) {
    console.log('Middleware: No tokens found. Redirecting to login.');
    return NextResponse.redirect(new URL(`/login?returnTo=${pathname}`, req.url));
  }
  
  // إذا كان هناك access token، حاول التحقق منه
  if (accessToken) {
    try {
      console.log('Middleware: Verifying access token...');
      await jwtVerify(accessToken, JWT_SECRET, { algorithms: ['HS256'] });
      console.log('Middleware: Access token is valid.');
      return NextResponse.next();
    } catch (error) {
      console.log('Middleware: Access token verification failed:', error);
      
      // إذا كان الخطأ ليس انتهاء صلاحية، توجيه لصفحة تسجيل الدخول
      if (!(error && typeof error === 'object' && 
            (('code' in error && error.code === 'ERR_JWT_EXPIRED') || 
             ('name' in error && error.name === 'JWTExpired')))) {
        console.log('Middleware: Access token is invalid (not expired). Redirecting to login.');
        return NextResponse.redirect(new URL(`/login?error=invalid_token&returnTo=${pathname}`, req.url));
      }
      
      // إذا كان الخطأ انتهاء صلاحية، حاول تجديد التوكن
      console.log('Middleware: Access token expired. Attempting refresh...');
    }
  }
  
  // إذا لم يكن هناك access token أو كان منتهي الصلاحية، حاول استخدام refresh token
  if (refreshToken) {
    try {
      console.log('Middleware: Verifying refresh token...');
      await jwtVerify(refreshToken, JWT_SECRET, { algorithms: ['HS256'] });
      console.log('Middleware: Refresh token verified successfully.');
      
      // استدعاء API endpoint للتحقق من التوكن في قاعدة البيانات
      console.log('Middleware: Checking refresh token in database via API...');
      const verifyResponse = await fetch(`${API_URL}/api/verify-refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });
      
      const verifyData = await verifyResponse.json();
      
      if (!verifyResponse.ok || !verifyData.success) {
        console.log('Middleware: Refresh token invalid in DB. Redirecting to login.');
        return NextResponse.redirect(new URL(`/login?error=session_expired&returnTo=${pathname}`, req.url));
      }
      
      console.log('Middleware: Refresh token is valid in database.');
      
      // إنشاء access token جديد
      const newPayload = {
        userId: verifyData.user.id,
        EmID: verifyData.user.EmID,
        role: verifyData.user.role,
        branchIds: [],
      };
      
      console.log('Middleware: Generating new access token...');
      const newAccessToken = await jwtService.generateAccessToken(newPayload);
      console.log('Middleware: New access token generated.');
      
      // إنشاء استجابة جديدة وإعادة توجيه إلى الصفحة الأصلية مع تعيين الكوكي الجديد
      const response = NextResponse.redirect(new URL(pathname, req.url));
      response.cookies.set('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
        maxAge: 15 * 60,
      });
      
      console.log('Middleware: Access token refreshed and set in cookies. Redirecting to original page.');
      return response;
    } catch (refreshError) {
      console.error('Middleware: Failed to refresh token:', refreshError);
      return NextResponse.redirect(new URL(`/login?error=session_expired&returnTo=${pathname}`, req.url));
    }
  }
  
  // إذا لم ينجح أي شيء، توجيه لصفحة تسجيل الدخول
  console.log('Middleware: All attempts failed. Redirecting to login.');
  return NextResponse.redirect(new URL(`/login?error=session_expired&returnTo=${pathname}`, req.url));
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/history/:path*',
    '/cheak-out/:path*',
    '/usermange/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico|login|_next|public).*)',
  ],
};