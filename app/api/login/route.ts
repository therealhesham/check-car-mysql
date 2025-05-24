import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

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
      where: { EmID: Number(emId) ,password},
    });

    if (!user) {
      return NextResponse.json(
        { message: 'معرف الموظف أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    const { password: _, ...userData } = user;
    return NextResponse.json({ success: true, user: userData }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'حدث خطأ أثناء تسجيل الدخول' },
      { status: 500 }
    );
  }
}