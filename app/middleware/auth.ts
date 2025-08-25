// import { NextRequest, NextResponse } from 'next/server';
// import JWTService from '@/utils/jwt';

// export function authenticateToken(req: NextRequest) {
//   const excludedRoutes = ['/api/login', '/api/refresh'];

//   const pathname = req.nextUrl.pathname;
//   if (excludedRoutes.includes(pathname)) {
//     return NextResponse.next(); // تجاوز التحقق للتوكن
//   }

//   try {
//     const authHeader = req.headers.get('authorization');
//     const token = authHeader && authHeader.split(' ')[1];

//     if (!token) {
//       return NextResponse.json(
//         { error: 'Access token required' },
//         { status: 401 }
//       );
//     }

//     const user = JWTService.getUserFromToken(token);
//     if (!user) {
//       return NextResponse.json(
//         { error: 'Invalid or expired token' },
//         { status: 403 }
//       );
//     }

//     const response = NextResponse.next();
//     response.headers.set('user', JSON.stringify(user));
//     return response;
//   } catch (error) {
//     console.error('Authentication error:', error);
//     return NextResponse.json(
//       { error: 'Invalid or expired token' },
//       { status: 403 }
//     );
//   }
// }

// import { NextRequest, NextResponse } from 'next/server';
// import * as jwt from 'jsonwebtoken';

// const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// export function authenticateToken(req: NextRequest) {
//   const excludedRoutes = ['/api/login', '/api/refresh'];
//   const pathname = req.nextUrl.pathname;

//   if (excludedRoutes.includes(pathname)) {
//     return NextResponse.next();
//   }

//   try {
//     const authHeader = req.headers.get('authorization');
//     const token = authHeader?.split(' ')[1];
//     console.log('Received Token:', token); // <--- أضف هذا السجل
//     console.log('JWT_SECRET:', JWT_SECRET); // <--- أضف هذا السجل

//     if (!token) {
//       return NextResponse.json({ error: 'Access token required' }, { status: 401 });
//     }

//     const user = jwt.verify(token, JWT_SECRET) as any;

//     if (!user) {
//       return NextResponse.json({ error: 'Invalid or expired token' }, { status: 403 });
//     }

//     const response = NextResponse.next();
//     response.headers.set('user', JSON.stringify(user));
//     return response;
//   } catch (error) {
//     console.error('Authentication error:', error);
//     return NextResponse.json({ error: 'Invalid or expired token' }, { status: 403 });
//   }
// }
