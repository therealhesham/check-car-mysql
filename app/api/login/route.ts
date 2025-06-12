// import { NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client';
// import bcrypt from 'bcrypt';

// const prisma = new PrismaClient();

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
//       where: { EmID: Number(emId) ,password},
//     });

//     if (!user) {
//       return NextResponse.json(
//         { message: 'معرف الموظف أو كلمة المرور غير صحيحة' },
//         { status: 401 }
//       );
//     }

//     // const { password: _, ...userData } = user;
//     return NextResponse.json({ success: true, user }, { status: 200 });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { message: 'حدث خطأ أثناء تسجيل الدخول' },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
        branch: true, // التأكد من تضمين branch صراحة
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'معرف الموظف أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    console.log('User fetched from database:', user); // سجل لتصحيح الأخطاء

    // إنشاء كائن userData مع قيم افتراضية
    const userData = {
      id: user.id || '',
      Name: user.Name || '',
      EmID: user.EmID || 0,
      role: user.role || '',
      branch: user.branch || '', // إرجاع سلسلة فارغة إذا كان branch null
    };

    return NextResponse.json({ success: true, user: userData }, { status: 200 });
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { message: 'حدث خطأ أثناء تسجيل الدخول' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}