// @ts-nocheck
// @ts-ignore

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod'; // تأكد من تثبيت هذه المكتبة (npm install zod)

const prisma = new PrismaClient();

/**
 * -----------------------------------------------------------------
 * دالة المصادقة
 * -----------------------------------------------------------------
 * تقرأ ID الموظف و (selectedBranch) المشفر من الـ Headers
 */
async function getUserFromRequest(request: Request) {
  const headers = request.headers;
  
  const userIdHeader = headers.get('x-user-id');
  const userBranchHeader = headers.get('x-user-branch'); // (يأتي مشفراً)

  if (!userIdHeader || !userBranchHeader) {
    throw new Error('User authentication headers (x-user-id, x-user-branch) are missing');
  }

  const userId = parseInt(userIdHeader, 10);
  if (isNaN(userId)) {
    throw new Error('Invalid User ID in header');
  }

  // فك تشفير اسم الفرع (الذي هو selectedBranch)
  const decodedBranchName = decodeURIComponent(userBranchHeader);

  return {
    userId: userId,
    branchName: decodedBranchName, // هذا هو 'selectedBranch'
  };
}


/**
 * -----------------------------------------------------------------
 * GET: جلب بيانات الصفحة الأولية
 * -----------------------------------------------------------------
 */

export async function GET(request: Request) {
  try {
    const { userId, branchName } = await getUserFromRequest(request);

    // 1. جلب العهدة المعلقة (للموظف)
    const pendingTransactions = await prisma.cash_transactions.findMany({
      where: {
        receiver_employee_id: userId,
        status: 'pending',
      },
      include: {
        expenses: true,
        sender_employee: { select: { Name: true } },
      },
      orderBy: { created_at: 'asc' }
    });

   // 2. جلب السجل (للفرع)
   const history = await prisma.cash_transactions.findMany({
    where: { 
      branch_name: branchName 
    },
    include: {
      sender_employee: { select: { Name: true } },
      receiver_employee: { select: { Name: true } },
      expenses: true // <-- (الإضافة الجديدة هنا)
    },
    orderBy: { created_at: 'desc' },
    take: 50,
  });
    // 3. جلب الموظفين (للفرع)
    const employeesList = await prisma.users.findMany({
      where: {
        branch: { contains: branchName }, 
        id: { not: userId },
        is_active: true,
      },
      select: { id: true, Name: true },
    });

    // 4. جلب العهدة الحالية المخزنة
    const branchData = await prisma.branches.findFirst({
        where: { branch_name: branchName },
        select: { current_cash: true }
    });
    const currentCash = branchData ? branchData.current_cash.toNumber() : 0;
    
    // -------------------------------------------------
    // ▼▼▼ 5. (تعديل جوهري) التحقق من حالة الفرع ▼▼▼
    // -------------------------------------------------
    let branchStatus = 'ok'; // الحالة الافتراضية

    // 5a. ابحث عن آخر "استلام وردية" (handover) تم رفضه
    const lastRejectedHandover = await prisma.cash_transactions.findFirst({
        where: {
            branch_name: branchName,
            type: 'handover',
            status: 'rejected'
        },
        orderBy: { created_at: 'desc' },
        select: { created_at: true }
    });

    // 5b. إذا وجدنا حركة مرفوضة، يجب أن نتحقق
    if (lastRejectedHandover) {
        
        // 5c. ابحث عن أي "تغذية" (feed) مقبولة حدثت *بعد* الرفض
        const subsequentAcceptedFeed = await prisma.cash_transactions.findFirst({
            where: {
                branch_name: branchName,
                type: 'feed',
                status: 'accepted',
                // (أهم شرط) تاريخها أحدث من تاريخ الرفض
                created_at: { gt: lastRejectedHandover.created_at } 
            },
            select: { id: true } // نحتاج فقط للتأكد من وجودها
        });

        // 5d. إذا لم نجد أي تغذية لاحقة، فالفرع "مرفوض"
        if (!subsequentAcceptedFeed) {
            branchStatus = 'rejected';
        }
        // (إذا وجدنا تغذية، ستبقى الحالة 'ok' كما هي)
    }
    // -------------------------------------------------
    // ▲▲▲ نهاية التعديل ▲▲▲
    // -------------------------------------------------

    return NextResponse.json({
      pendingTransactions: pendingTransactions,
      history,
      employeesList,
      currentCash: currentCash,
      branchStatus: branchStatus // <-- إرسال الحالة الصحيحة
    });

  } catch (error) {
    console.error('Error fetching cash data:', error);
    if (error instanceof Error && (error.message.includes('authentication') || error.message.includes('header'))) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}



/**
 * -----------------------------------------------------------------
 * POST: إنشاء حركة جديدة (تسليم أو تغذية)
 * -----------------------------------------------------------------
 */
export async function POST(request: Request) {
  try {
    const { userId, branchName } = await getUserFromRequest(request);
    const body = await request.json();

    // ▼▼▼ (هذا هو التعديل) ▼▼▼

    // -- تعريف هياكل التحقق (Validation Schemas) --
    
    // 1. مخطط تسليم العهدة
    const handoverSchema = z.object({
      action: z.literal('handover'),
      amount: z.number().positive('المبلغ يجب أن يكون أكبر من صفر'),
      notes: z.string().optional(),
      receiver_employee_id: z.number().int('يجب اختيار الموظف المستلم'),
      expenses: z.array(z.object({
        contractNumber: z.string().optional(),
        notes: z.string(),
        amount: z.string(),
      })),
    });

    // 2. مخطط تغذية العهدة (من المحاسب)
    const feedSchema = z.object({
      action: z.literal('feed'),
      amount: z.number().positive('المبلغ يجب أن يكون أكبر من صفر'),
      notes: z.string().optional(),
      receiver_employee_id: z.number().int('يجب اختيار الموظف المستلم للتغذية'),
    });

    // 3. (الأهم) استخدام discriminatedUnion للتحقق الصحيح
    const parsedBody = z.discriminatedUnion('action', [
      handoverSchema,
      feedSchema
    ]).safeParse(body);

    // ▲▲▲ (نهاية التعديل) ▲▲▲


    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsedBody.error.errors }, { status: 400 });
    }
    const data = parsedBody.data;


    // --- 1. حالة تسليم العهدة (Handover) ---
    if (data.action === 'handover') {
      const { amount, notes, receiver_employee_id, expenses } = data;

      // (لا يتم تحديث الرصيد هنا، فقط ننشئ حركة "معلقة")
      const newTransaction = await prisma.$transaction(async (tx) => {
        const transaction = await tx.cash_transactions.create({
          data: {
            branch_name: branchName,
            type: 'handover',
            status: 'pending', // <-- معلقة بانتظار القبول
            amount: amount,
            notes: notes,
            sender_employee_id: userId,
            receiver_employee_id: receiver_employee_id,
          },
        });

        if (expenses && expenses.length > 0) {
          const expensesData = expenses
            .map((exp) => ({
              transaction_id: transaction.id,
              contract_number: exp.contractNumber,
              notes: exp.notes,
              amount: parseFloat(exp.amount) || 0,
            }))
            .filter((exp) => exp.amount > 0);

          if (expensesData.length > 0) {
            await tx.expenses.createMany({ data: expensesData });
          }
        }
        return transaction;
      });

      return NextResponse.json(newTransaction, { status: 201 });
    }

    // --- 2. حالة تغذية العهدة (Feed) ---
    if (data.action === 'feed') {
      // (الآن سيتم جلب البيانات بشكل صحيح بسبب discriminatedUnion)
      const { amount, notes, receiver_employee_id } = data;
      
      // (التغذية أيضاً تنشئ حركة "معلقة" ليقبلها الموظف)
      const newFeed = await prisma.cash_transactions.create({
        data: {
          branch_name: branchName,
          type: 'feed',
          status: 'pending', // <-- معلقة بانتظار القبول
          amount: amount,
          notes: notes || 'تغذية عهدة من المحاسب',
          sender_employee_id: userId, // (المحاسب)
          receiver_employee_id: receiver_employee_id, // (الموظف)
        },
      });
      return NextResponse.json(newFeed, { status: 201 });
    }

  } catch (error) {
    console.error('Error creating transaction:', error);
    if (error instanceof Error && (error.message.includes('authentication') || error.message.includes('header'))) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * -----------------------------------------------------------------
 * PATCH: تحديث حركة (قبول أو رفض) - (معدل)
 * -----------------------------------------------------------------
 */
export async function PATCH(request: Request) {
  try {
    const { userId, branchName } = await getUserFromRequest(request);
    const body = await request.json();

    // (Zod schema parsing - كما هو)
    const patchSchema = z.object({
      transactionId: z.number().int(),
      action: z.enum(['accept', 'reject']),
      rejection_reason: z.string().optional(),
    });
    const parsedBody = patchSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsedBody.error.errors }, { status: 400 });
    }
    const { transactionId, action, rejection_reason } = parsedBody.data;

    // (التحقق من أن الموظف هو المستلم الصحيح - كما هو)
    const transactionToUpdate = await prisma.cash_transactions.findFirst({
      where: {
        id: transactionId,
        receiver_employee_id: userId,
        status: 'pending',
      },
    });

    if (!transactionToUpdate) {
      return NextResponse.json({ error: 'Transaction not found or you do not have permission' }, { status: 404 });
    }

    // ▼▼▼ (الإضافة الجديدة) ▼▼▼
    const processingTime = new Date(); // (الوقت الحالي)

    // --- 1. حالة القبول (Accept) ---
    if (action === 'accept') {
      
      await prisma.$transaction(async (tx) => {
        
        // أ. تحديث حالة الحركة (مع إضافة وقت المعالجة)
        await tx.cash_transactions.update({
          where: { id: transactionId },
          data: { 
            status: 'accepted',
            processed_at: processingTime // <-- (تمت الإضافة)
          },
        });

        // ب. تحديث رصيد الفرع (كما هو)
        if (transactionToUpdate.type === 'handover') {
          await tx.branches.updateMany({
            where: { branch_name: branchName },
            data: { current_cash: transactionToUpdate.amount }
          });
        } 
        else if (transactionToUpdate.type === 'feed') {
          await tx.branches.updateMany({
            where: { branch_name: branchName },
            data: { current_cash: { increment: transactionToUpdate.amount } }
          });
        }
      });

      return NextResponse.json({ message: 'تم قبول العهدة وتحديث الرصيد' });
    }

    // --- 2. حالة الرفض (Reject) ---
    if (action === 'reject') {
      if (!rejection_reason) {
        return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
      }
      
      await prisma.$transaction(async (tx) => {
        
        // 1. تحديث حالة الحركة (مع إضافة وقت المعالجة)
        await tx.cash_transactions.update({
          where: { id: transactionId },
          data: {
            status: 'rejected',
            rejection_reason: rejection_reason,
            processed_at: processingTime // <-- (تمت الإضافة)
          },
        });

        // 2. تصفير رصيد الفرع (كما هو)
        if (transactionToUpdate.type === 'handover') {
            await tx.branches.updateMany({
                where: { branch_name: branchName },
                data: { current_cash: 0 }
            });
        }
      });

      return NextResponse.json({ message: 'تم رفض العهدة' });
    }

  } catch (error) {
    console.error('Error updating transaction:', error);
    if (error instanceof Error && (error.message.includes('authentication') || error.message.includes('header'))) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}