// app/api/logout/route.ts
import { NextResponse } from 'next/server';
import { Token } from '@/utils/Token';

export async function POST(req: Request) {
  try {
    // 1. قراءة body الطلب
    const { targetUserId } = await req.json();

    // 2. التحقق من أن targetUserId تم إرساله
    if (!targetUserId) {
      return NextResponse.json(
        { error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      );
    }

    // 3. استخدام الدالة الجديدة التي أضفتها في Token
    const deleted = await Token.removeRefreshTokenByUserId(targetUserId);

    if (!deleted) {
      return NextResponse.json(
        { message: 'لم يتم العثور على توكن لهذا المستخدم أو تم حذفه مسبقًا' },
        { status: 200 }
      );
    }

    // 4. الرد الناجح
    return NextResponse.json({
      success: true,
      message: 'تم حذف التوكن بنجاح',
    });
  } catch (error: any) {
    console.error('Error in /api/logout:', error);
    return NextResponse.json(
      { error: 'حدث خطأ داخلي في السيرفر' },
      { status: 500 }
    );
  }
}