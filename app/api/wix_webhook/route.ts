// @ts-nocheck
// @ts-ignore

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
// ▼▼▼ (1) قاموس الربط ▼▼▼
const WIX_BRANCH_MAP: { [key: string]: string } = {
    "المدينة المنورة حي العريض": "فرع العريض",
    "المدينة المنورة حي الظاهرة": "فرع الظاهرة",
    "المدينة المنورة حي العزيزية": "فرع العزيزية",
    "المدينة المنورة شارع ساري": "فرع شارع ساري",
    "ينبع حي البحيرة طريق الملك عبدالعزيز": "فرع مجمع التاجير",
    "ينبع حي البحيرة طريق عثمان بن عفان": "فرع البحيرة",
    "جدة حي بني مالك طريق فلسطين": "فرع فلسطين"
  };
  
  // ▼▼▼ (2) دالة الربط المساعدة ▼▼▼
  function mapWixBranch(wixName: string | null | undefined): string | null {
    if (!wixName) return null;
    
    // البحث عن الاسم القادم من ويكس (بعد إزالة المسافات الزائدة)
    const internalName = WIX_BRANCH_MAP[wixName.trim()];
    
    // إذا وجدنا اسم مطابق، نرجعه.
    // إذا لم نجد (مثل "فرع مجمع التاجير")، نرجع اسم ويكس الأصلي كما هو
    return internalName || wixName; 
  }

/**
 * -----------------------------------------------------------------
 * POST: استقبال الحجوزات الجديدة من Wix (عام - بدون أمان)
 * -----------------------------------------------------------------
 */
export async function POST(request: Request) {
  try {
    // 1. قراءة البيانات القادمة من Wix
    const body = await request.json();

    // ★★ انتبه: هذه الأسماء يجب أن تطابق ما يرسله Wix ★★
    const { 
        client_name,     // الاسم
        client_phone,    // رقم الجوال
        client_age,      // العمر
        car_category,    // فئة السيارة
        booking_days,    // عدد ايام الحجز
        pickup_date,     // تاريخ بداية الحجز
        pickup_branch    // فرع الاستلام
      } = body.data; // <-- (هذا هو الإصلاح)

    // 2. التحقق من البيانات الأساسية
    if (!client_name || !client_phone) {
      console.warn('Wix Webhook: تم استلام طلب ناقص (الاسم أو الهاتف مفقود).');
      return NextResponse.json({ error: 'الاسم ورقم الهاتف مطلوبان' }, { status: 400 });
    }

  // 3. (جديد) ترجمة اسم الفرع
  const internalBranchName = mapWixBranch(pickup_branch);

  // 4. حفظ الحجز في قاعدة البيانات
  const newBooking = await prisma.wix_bookings.create({
    data: {
      client_name: String(client_name),
      client_phone: String(client_phone),
      client_age: client_age ? parseInt(client_age) : null,
      car_category: car_category ? String(car_category) : null,
      booking_days: booking_days ? parseInt(booking_days) : null,
      pickup_date: pickup_date ? new Date(pickup_date) : null, 
      pickup_branch: internalBranchName, // <-- (هذا هو السطر المعدل)
      is_contacted: false 
    }
  });

    // 4. إرسال رد ناجح إلى Wix (لإخباره أن العملية تمت)
    return NextResponse.json({ success: true, bookingId: newBooking.id }, { status: 200 });

  } catch (error) {
    console.error('Wix Webhook Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}