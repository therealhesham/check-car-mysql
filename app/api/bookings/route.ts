// @ts-nocheck
// @ts-ignore

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// --- (دوال مساعدة) ---

async function getUserFromRequest(request: Request) {
  const headers = request.headers;
  const userIdHeader = headers.get('x-user-id');
  const userBranchHeader = headers.get('x-user-branch'); 

  if (!userIdHeader || !userBranchHeader) {
    throw new Error('User authentication headers (x-user-id, x-user-branch) are missing');
  }
  const userId = parseInt(userIdHeader, 10);
  if (isNaN(userId)) {
    throw new Error('Invalid User ID in header');
  }
  const decodedBranchName = decodeURIComponent(userBranchHeader);
  return {
    userId: userId,
    branchName: decodedBranchName,
  };
}

async function getUserRole(userId: number) {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { role: true }
  });
  if (!user) throw new Error('User not found');
  return user.role;
}

// --- (دوال الـ API) ---

/**
 * -----------------------------------------------------------------
 * GET: جلب الحجوزات (معدل ليناسب صلاحيات الموظف)
 * -----------------------------------------------------------------
 */
export async function GET(request: Request) {
      try {
        // 1. التحقق من الصلاحيات (كما هي)
        const { userId, branchName } = await getUserFromRequest(request);
        const userRole = await getUserRole(userId);
        
        if (userRole === 'accountant') {
            return NextResponse.json({ error: 'Unauthorized role' }, { status: 403 });
        }
        
        // 2. بناء فلتر البحث بناءً على الدور (كما هو)
        let whereClause: any = {};
        if (userRole === 'admin' || userRole === 'employee') {
            whereClause = {
                pickup_branch: branchName
            };
        }
        // (الـ Owner والـ Super Admin يرون كل شيء)
    
        // 3. (تعديل) جلب البيانات في مصفوفتين
       
        // (أ) الحجوزات الجديدة (بانتظار المراجعة)
        const pendingBookings = await prisma.wix_bookings.findMany({
            where: {
                ...whereClause,
                status: 'pending' // (فقط المعلقة)
            },
            orderBy: {
                created_at: 'asc' // (الأقدم أولاً)
            }
        });
    
        // (ب) السجل (المؤكدة والملغية)
        const completedBookings = await prisma.wix_bookings.findMany({
            where: {
                ...whereClause,
                status: {
                    not: 'pending' // (كل شيء ما عدا المعلقة)
                }
            },
            orderBy: {
                updated_at: 'desc' // (الأحدث في التعديل أولاً)
            },
            take: 50 // (لضمان عدم تحميل سجل ضخم)
        });
    
        return NextResponse.json({
            pendingBookings: pendingBookings,
            completedBookings: completedBookings
        });
    
      } catch (error) {
        console.error('Error fetching bookings:', error);
        if (error instanceof Error && (error.message.includes('authentication') || error.message.includes('header'))) {
          return NextResponse.json({ error: error.message }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
      }
    }

/**
 * -----------------------------------------------------------------
 * PATCH: تحديث حالة الحجز (مؤكد أو ملغي مع ملاحظة)
 * -----------------------------------------------------------------
 */
export async function PATCH(request: Request) {
    try {
        // 1. التحقق من الصلاحيات
        const { userId } = await getUserFromRequest(request);
        const userRole = await getUserRole(userId);
        
        if (userRole === 'accountant') {
            return NextResponse.json({ error: 'Unauthorized role' }, { status: 403 });
        }
        
        // 2. قراءة البيانات (Zod)
        const body = await request.json();
        
        const updateSchema = z.object({
            bookingId: z.number().int(),
            newStatus: z.enum(['confirmed', 'cancelled']), // (الحالات الجديدة)
            note: z.string().min(1, 'الملاحظة إجبارية') // (الملاحظة إجبارية)
        });

        const parsedBody = updateSchema.safeParse(body);

        if (!parsedBody.success) {
            return NextResponse.json({ error: 'Invalid data', details: parsedBody.error.errors }, { status: 400 });
        }
        
        const { bookingId, newStatus, note } = parsedBody.data;

        // 3. تحديث الحجز (بالحالة الجديدة والملاحظة)
        const updatedBooking = await prisma.wix_bookings.update({
            where: { id: bookingId },
            data: {
                status: newStatus,
                follow_up_note: note
                // (سيتم تحديث 'updated_at' تلقائياً بواسطة قاعدة البيانات)
            }
        });
        
        return NextResponse.json(updatedBooking);

    } catch (error) {
        console.error('Error updating booking:', error);
        return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
    }
}