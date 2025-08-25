// import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { jwtService } from '@/utils/jwt';
// // ⚠️ تأكد من أن لديك ملف utils/Token.ts
// import { Token } from '@/utils/Token'; 
// import { SignJWT, jwtVerify } from 'jose';

// export async function POST(req: Request) {
//   try {
//     const { emId, password } = await req.json();

//     if (!emId || !password) {
//       return NextResponse.json(
//         { message: 'معرف الموظف وكلمة المرور مطلوبان' },
//         { status: 400 }
//       );
//     }

//     const user = await prisma.users.findFirst({
//       where: { EmID: Number(emId), password },
//       select: {
//         id: true,
//         Name: true,
//         EmID: true,
//         role: true,
//         branch: true,
//         is_active: true,
//       },
//     });

//     if (!user || !user.is_active) {
//       return NextResponse.json(
//         { message: 'معرف الموظف أو كلمة المرور غير صحيحة' },
//         { status: 401 }
//       );
//     }

//     let branchIds: number[] = [];
//     if (user.branch && typeof user.branch === 'string') {
//       const branchNames = user.branch.split(',').map(name => name.trim());

//       const branches = await prisma.branches.findMany({
//         where: {
//           branch_name: {
//             in: branchNames,
//           },
//         },
//         select: {
//           id: true,
//         },
//       });

//       branchIds = branches.map(b => b.id);
//     }

//     const payload = {
//       userId: user.id,
//       EmID: user.EmID,
//       role: user.role,
//       branchIds: branchIds,
//     };

//     const accessToken = await jwtService.generateAccessToken(payload);
//     const refreshToken = await jwtService.generateRefreshToken({ userId: user.id });

//     // ✅ التعديل هنا: إعادة تفعيل حفظ التوكن في قاعدة البيانات
//     await Token.saveRefreshToken(user.id, refreshToken);
    
//     // ✅ تحديث آخر دخول للمستخدم
//     await prisma.users.update({
//       where: { id: user.id },
//       data: { last_login: new Date() },
//     });
    
//     const response = NextResponse.json({
//       success: true,
//       message: 'تم تسجيل الدخول بنجاح',
//       user: {
//         id: user.id.toString(),
//         Name: user.Name,
//         EmID: user.EmID,
//         role: user.role,
//         branch: user.branch || '',
//       },
//     });

//     const accessMaxAge = 15 * 60; // 15 دقيقة
//     const refreshMaxAge = 8 * 60 * 60; // 8 ساعات

//     response.cookies.set('accessToken', accessToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       path: '/',
//       maxAge: accessMaxAge, 
//     });

//     response.cookies.set('refreshToken', refreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       path: '/',
//       maxAge: refreshMaxAge, 
//     });

//     return response;

//   } catch (error) {
//     console.error('Login API error:', error);
//     return NextResponse.json(
//       { message: 'حدث خطأ أثناء تسجيل الدخول' },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtService } from '@/utils/jwt';
import { Token } from '@/utils/Token'; 
import { SignJWT, jwtVerify } from 'jose';

export async function POST(req: Request) {
  try {
    const { emId, password } = await req.json();
    if (!emId || !password) {
      return NextResponse.json(
        { message: 'معرف الموظف وكلمة المرور مطلوبان' },
        { status: 400 }
      );
    }
    const user = await prisma.users.findFirst({
      where: { EmID: Number(emId), password },
      select: {
        id: true,
        Name: true,
        EmID: true,
        role: true,
        branch: true,
        is_active: true,
      },
    });
    if (!user || !user.is_active) {
      return NextResponse.json(
        { message: 'معرف الموظف أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }
    let branchIds: number[] = [];
    if (user.branch && typeof user.branch === 'string') {
      const branchNames = user.branch.split(',').map(name => name.trim());
      const branches = await prisma.branches.findMany({
        where: {
          branch_name: {
            in: branchNames,
          },
        },
        select: {
          id: true,
        },
      });
      branchIds = branches.map(b => b.id);
    }
    const payload = {
      userId: user.id,
      EmID: user.EmID,
      role: user.role,
      branchIds: branchIds,
    };
    const accessToken = await jwtService.generateAccessToken(payload);
    const refreshToken = await jwtService.generateRefreshToken({ userId: user.id });
    
    // ✅ التعديل الرئيسي: حساب تاريخ انتهاء الصلاحية للـ refreshToken
    const refreshExpiresAt = new Date();
    refreshExpiresAt.setHours(refreshExpiresAt.getHours() + 8); // 8 ساعات من الآن
    
    // ✅ التعديل الرئيسي: تمرير تاريخ الانتهاء مع حفظ التوكن
    await Token.saveRefreshToken(user.id, refreshToken, refreshExpiresAt);
    
    // ✅ تحديث آخر دخول للمستخدم
    await prisma.users.update({
      where: { id: user.id },
      data: { last_login: new Date() },
    });
    
    const response = NextResponse.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      user: {
        id: user.id.toString(),
        Name: user.Name,
        EmID: user.EmID,
        role: user.role,
        branch: user.branch || '',
      },
    });
    const accessMaxAge = 15 * 60; // 15 دقيقة
    const refreshMaxAge = 8 * 60 * 60; // 8 ساعات
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: accessMaxAge, 
    });
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: refreshMaxAge, 
    });
    return response;
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { message: 'حدث خطأ أثناء تسجيل الدخول' },
      { status: 500 }
    );
  }
}