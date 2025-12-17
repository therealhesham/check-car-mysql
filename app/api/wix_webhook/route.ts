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
    const internalName = WIX_BRANCH_MAP[wixName.trim()];
    return internalName || wixName; 
}

/**
 * -----------------------------------------------------------------
 * POST: استقبال الحجوزات الجديدة من Wix
 * -----------------------------------------------------------------
 */
export async function POST(request: Request) {
  try {
    // 1. قراءة البيانات
    const body = await request.json();

    // التأكد من وجود البيانات داخل data أو مباشرة (للاحتياط)
    const payload = body.data || body;

    const { 
        client_name, 
        client_phone, 
        client_age, 
        car_category, 
        booking_days, 
        pickup_date, 
        pickup_branch 
      } = payload;

    // 2. التحقق من البيانات الأساسية
    if (!client_name || !client_phone) {
      console.warn('Wix Webhook: بيانات ناقصة', payload);
      return NextResponse.json({ error: 'الاسم ورقم الهاتف مطلوبان' }, { status: 400 });
    }

  // 3. ترجمة اسم الفرع
  const internalBranchName = mapWixBranch(pickup_branch);

  // 4. حفظ الحجز (تم تعديل هذا الجزء ليناسب قاعدة البيانات الجديدة)
  const newBooking = await prisma.wix_bookings.create({
    data: {
      client_name: String(client_name),
      client_phone: String(client_phone),
      client_age: client_age ? parseInt(client_age) : null,
      car_category: car_category ? String(car_category) : null,
      booking_days: booking_days ? parseInt(booking_days) : null,
      pickup_date: pickup_date ? new Date(pickup_date) : null, 
      pickup_branch: internalBranchName,
      
      // ✅ التعديل هنا: استخدام status بدلاً من is_contacted
      status: 'pending', 
      follow_up_note: null
    }
  });

    return NextResponse.json({ success: true, bookingId: newBooking.id }, { status: 200 });

  } catch (error) {
    console.error('Wix Webhook Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}