// @ts-nocheck
// @ts-ignore

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

// يفضل استخدام global instance لـ Prisma في بيئة التطوير لتجنب كثرة الاتصالات
const prisma = new PrismaClient();

// تعريف مدة التجميد (72 ساعة بالمللي ثانية)
const FREEZE_DURATION_MS = 72 * 60 * 60 * 1000;

/**
 * -----------------------------------------------------------------
 * دالة مساعدة: المصادقة وتحديد الفرع الفعال
 * -----------------------------------------------------------------
 */
async function getUserRole(userId: number) {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { role: true }
  });
  if (!user) throw new Error('User not found');
  return user.role;
}

async function getUserFromRequest(request: Request) {
  const headers = request.headers;
  
  const userIdHeader = headers.get('x-user-id');
  const userBranchHeader = headers.get('x-user-branch'); 
  // قراءة الهيدر الخاص بالفرع المستهدف (الذي يرسله المحاسب)
  const targetBranchHeader = headers.get('x-target-branch'); 

  if (!userIdHeader || !userBranchHeader) {
    throw new Error('User authentication headers are missing');
  }

  const userId = parseInt(userIdHeader, 10);
  if (isNaN(userId)) {
    throw new Error('Invalid User ID in header');
  }

  // الفرع الأصلي للمستخدم (من التوكن أو اللوجن)
  const originalUserBranch = decodeURIComponent(userBranchHeader);
  
  // تحديد الفرع الفعال (Effective Branch)
  // إذا كان هناك target_branch، نعتبره هو الفرع الحالي للعمليات
  let effectiveBranchName = originalUserBranch;
  if (targetBranchHeader && targetBranchHeader !== 'null' && targetBranchHeader !== 'undefined') {
      effectiveBranchName = decodeURIComponent(targetBranchHeader);
  }

  return {
    userId: userId,
    branchName: effectiveBranchName, // هذا هو الفرع الذي سيتم جلب بياناته
    originalBranch: originalUserBranch,
  };
}


/**
 * -----------------------------------------------------------------
 * GET: جلب البيانات
 * -----------------------------------------------------------------
 */
export async function GET(request: Request) {
  try {
    // هنا branchName سيحتوي على الفرع المختار (إذا كان محاسباً) أو فرع الموظف
    const { userId, branchName } = await getUserFromRequest(request);
    
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    // ─── مسار 1: جلب ملخص كل الفروع (للمحاسب/الأدمن) ───
    if (action === 'get_all_branches_summary') {
        // التحقق من الصلاحية
        const role = await getUserRole(userId);
        if (!['accountant', 'admin', 'super_admin', 'owner'].includes(role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // جلب كل الفروع
        const branches = await prisma.branches.findMany({
            select: {
                id: true,
                branch_name: true,
                current_cash: true,
                is_frozen: true
            }
        });

        // تجهيز البيانات وحساب الطلبات المعلقة
        const branchesSummary = await Promise.all(branches.map(async (branch) => {
            const pendingCount = await prisma.cash_transactions.count({
                where: {
                    branch_name: branch.branch_name,
                    status: 'pending'
                }
            });

            return {
                id: branch.id,
                name: branch.branch_name,
                balance: branch.current_cash.toNumber(),
                status: branch.is_frozen ? 'frozen' : 'active',
                pending_requests: pendingCount
            };
        }));

        return NextResponse.json({ branches: branchesSummary });
    }
    
    // ─── مسار 2: جلب تفاصيل الفرع المحدد (branchName) ───

    // 1. جلب العهد المعلقة الخاصة بالمستخدم (بغض النظر عن الفرع) أو يمكن تخصيصها
    // ملاحظة: هنا نجلب ما يجب أن يستلمه المستخدم الحالي (userId)
   // 1. جلب العهدة المعلقة (للموظف)
   const pendingTransactions = await prisma.cash_transactions.findMany({
    where: {
      receiver_employee_id: userId,
      status: 'pending',
      // ▼▼▼ الإضافة الحاسمة هنا ▼▼▼
      // هذا الشرط يضمن أن الموظف لا يرى إلا الحوالات الخاصة بالفرع الذي يتصفحه حالياً
      branch_name: branchName, 
    },
    include: {
      expenses: true,
      sender_employee: { select: { id: true, Name: true } },
    },
    orderBy: { created_at: 'asc' }
  });

    // 2. جلب السجل (للفرع المحدد حالياً)
    // هذا هو الأهم: سيجلب سجل الفرع المختار من الداشبورد
    const history = await prisma.cash_transactions.findMany({
      where: { 
        branch_name: branchName 
      },
      include: {
        sender_employee: { select: { id: true, Name: true } },
        receiver_employee: { select: { id: true, Name: true } },
        expenses: true
      },
      orderBy: { created_at: 'desc' },
      take: 50,
    });

    // 3. جلب موظفي هذا الفرع فقط
    const employeesList = await prisma.users.findMany({
         where: {
           branch: { contains: branchName }, 
           is_active: true,
         },
         select: { id: true, Name: true },
    });

    // 4. جلب بيانات الرصيد وحالة التجميد للفرع
    const branchData = await prisma.branches.findFirst({
        where: { branch_name: branchName },
        select: { current_cash: true, is_frozen: true }
    });

    if (!branchData) {
      return NextResponse.json({ 
        error: 'Branch not found', 
        currentCash: 0, 
        branchStatus: 'ok', 
        history: [], 
        employeesList: [], 
        pendingTransactions: [] 
      }, { status: 200 });
    }

    let currentCash = branchData.current_cash.toNumber();
    let branchStatus = 'ok';
    let timeRemaining = null;

    // 5. منطق التجميد والمهلة
    if (branchData.is_frozen) {
        branchStatus = 'frozen';
        currentCash = 0;
    } else {
        // البحث عن آخر عملية مقبولة وتتطلب مراجعة
        const unresolvedTx = await prisma.cash_transactions.findFirst({
            where: {
                branch_name: branchName,
                requires_review: true,
                status: 'accepted'
            },
            orderBy: { processed_at: 'desc' },
            select: { processed_at: true }
        });

        if (unresolvedTx && unresolvedTx.processed_at) {
            const freezeTime = unresolvedTx.processed_at.getTime() + FREEZE_DURATION_MS;
            const now = Date.now();
            
            if (now >= freezeTime) {
                // تجميد الفرع إذا انتهت المهلة
                await prisma.branches.updateMany({
                    where: { branch_name: branchName },
                    data: { is_frozen: true, current_cash: 0 }
                });
                branchStatus = 'frozen';
                currentCash = 0;
            } else {
                branchStatus = 'review_pending';
                timeRemaining = freezeTime - now;
            }
        }
    }

    return NextResponse.json({
      pendingTransactions: pendingTransactions,
      history,
      employeesList,
      currentCash: currentCash,
      branchStatus: branchStatus,
      timeRemainingForFreeze: timeRemaining,
      // نعيد اسم الفرع للتأكد في الفرونت اند
      branchName: branchName 
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
 * POST: إنشاء حركة جديدة (تسليم، تغذية، حل إشكالية)
 * -----------------------------------------------------------------
 */
export async function POST(request: Request) {
  try {
    // branchName هنا هو الفرع المختار
    const { userId, branchName } = await getUserFromRequest(request); 
    const body = await request.json();
    const role = await getUserRole(userId);

    // -- Validation Schemas --
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

    const feedSchema = z.object({
      action: z.literal('feed'),
      amount: z.number().positive('المبلغ يجب أن يكون أكبر من صفر'),
      notes: z.string().optional(),
      receiver_employee_id: z.number().int('يجب اختيار الموظف المستلم للتغذية'),
    });

    const resolveSchema = z.object({
        action: z.literal('resolve_issue'),
        amount: z.number().positive('المبلغ يجب أن يكون أكبر من صفر'),
        receiver_employee_id: z.number().int('يجب اختيار الموظف المستلم'),
        notes: z.string().optional(), 
    });

    const parsedBody = z.discriminatedUnion('action', [
      handoverSchema,
      feedSchema,
      resolveSchema
    ]).safeParse(body);


    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsedBody.error.errors }, { status: 400 });
    }
    const data = parsedBody.data;


    // ─── 1. تسليم العهدة (Handover) ───
    if (data.action === 'handover') {
      const branchData = await prisma.branches.findFirst({
        where: { branch_name: branchName },
        select: { current_cash: true, is_frozen: true }
      });

      if (!branchData || branchData.is_frozen) {
        return NextResponse.json({ error: 'العهدة مجمدة أو الفرع غير موجود' }, { status: 403 });
      }
      
      // السماح بالتسليم الصفري فقط إذا كانت العهدة أصلاً 0 (لتسليم الفواتير فقط مثلاً) أو إغلاق
      // لكن هنا نتحقق إذا كان الرصيد والمبلغ صفر ولا توجد مصروفات
      if (branchData.current_cash.toNumber() <= 0 && data.amount <= 0 && data.expenses.length === 0) {
           return NextResponse.json({ error: 'لا يوجد رصيد أو عمليات لتسليمها' }, { status: 403 });
      }

      // التحقق من أن المسلّم هو صاحب العهدة الحالي
      const lastAcceptedTx = await prisma.cash_transactions.findFirst({
        where: {
            branch_name: branchName,
            status: 'accepted',
        },
        orderBy: { processed_at: 'desc' },
        select: { receiver_employee_id: true }
      });

      if (lastAcceptedTx && lastAcceptedTx.receiver_employee_id !== userId) {
        const correctUser = await prisma.users.findUnique({
            where: { id: lastAcceptedTx.receiver_employee_id },
            select: { Name: true }
        });
        const correctUserName = correctUser?.Name || 'الموظف المستلم الأخير';
        return NextResponse.json({ error: `لا يمكنك تسليم العهدة. العهدة حالياً بحوزة: ${correctUserName}` }, { status: 403 });
      }
      
      // رصيد افتتاحي (أول مرة)
      if (!lastAcceptedTx && branchData.current_cash.toNumber() > 0) {
           if (!['accountant', 'admin', 'super_admin', 'owner'].includes(role)) {
               return NextResponse.json({ error: 'لا يمكنك تسليم رصيد افتتاحي. هذه المهمة للمشرف أو المحاسب.' }, { status: 403 });
           }
      }

      const { amount, notes, receiver_employee_id, expenses } = data;

      const newTransaction = await prisma.$transaction(async (tx) => {
        const transaction = await tx.cash_transactions.create({
          data: {
            branch_name: branchName,
            type: 'handover',
            status: 'pending',
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

    // ─── 2. تغذية العهدة (Feed) ───
    if (data.action === 'feed') {
      const { amount, notes, receiver_employee_id } = data;
      
      // ملاحظة: يتم إنشاء التغذية للفرع المختار (branchName)
      const newFeed = await prisma.cash_transactions.create({
        data: {
          branch_name: branchName, 
          type: 'feed',
          status: 'pending',
          amount: amount,
          notes: notes || 'تغذية عهدة من المحاسب',
          sender_employee_id: userId,
          receiver_employee_id: receiver_employee_id,
        },
      });
      return NextResponse.json(newFeed, { status: 201 });
    }

    // ─── 3. حل الإشكالية (Resolve Issue) ───
    if (data.action === 'resolve_issue') {
      const { amount, receiver_employee_id, notes } = data; 
      
      if (!['accountant', 'admin', 'super_admin', 'owner'].includes(role)) {
           return NextResponse.json({ error: 'غير مصرح لك بتنفيذ هذا الإجراء' }, { status: 403 });
      }

      await prisma.$transaction(async (tx) => {
          // فك التجميد وتصفير الرصيد (استعداداً للقيمة الجديدة)
          await tx.branches.updateMany({
              where: { branch_name: branchName },
              data: { 
                  is_frozen: false,
                  current_cash: 0
              }
          });

          // إزالة علامة "تتطلب مراجعة" من العمليات السابقة في هذا الفرع
          await tx.cash_transactions.updateMany({
              where: { 
                  branch_name: branchName,
                  requires_review: true 
              },
              data: { requires_review: false }
          });
          
          // إنشاء حركة تغذية جديدة بالمبلغ المصحح
          await tx.cash_transactions.create({
              data: {
                  branch_name: branchName,
                  type: 'feed',
                  status: 'pending', 
                  notes: notes || 'تسوية عهدة وحل إشكالية', 
                  amount: amount,
                  sender_employee_id: userId,
                  receiver_employee_id: receiver_employee_id
              }
          });
      });
      
      return NextResponse.json({ message: 'تم إرسال تسوية العهدة للموظف بنجاح' });
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
 * PATCH: تحديث حالة الحركة (قبول / رفض مع تصحيح)
 * -----------------------------------------------------------------
 */
export async function PATCH(request: Request) {
  try {
    const { userId, branchName } = await getUserFromRequest(request);
    const body = await request.json();

    const patchSchema = z.object({
      transactionId: z.number().int(),
      action: z.enum(['accept', 'reject']),
      rejection_reason: z.string().optional(),
      actual_amount: z.number().optional(), 
    });
    
    const parsedBody = patchSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsedBody.error.errors }, { status: 400 });
    }
    const { transactionId, action, rejection_reason } = parsedBody.data;

    // البحث عن الحركة المعلقة الموجهة لهذا المستخدم
    const transactionToUpdate = await prisma.cash_transactions.findFirst({
      where: {
        id: transactionId,
        receiver_employee_id: userId,
        status: 'pending',
      },
    });

    if (!transactionToUpdate) {
      return NextResponse.json({ error: 'Transaction not found or permissions denied' }, { status: 404 });
    }

    const processingTime = new Date();

    // ─── 1. قبول عادي (المبلغ مطابق) ───
   // ─── 1. قبول عادي (المبلغ مطابق) ───
   if (action === 'accept') {
    await prisma.$transaction(async (tx) => {
      // تحديث حالة الطلب
      await tx.cash_transactions.update({
        where: { id: transactionId },
        data: { 
          status: 'accepted',
          processed_at: processingTime,
          requires_review: false
        },
      });

      // تحديث رصيد الفرع
      // ▼▼▼ التغيير الخطير هنا: لا نستخدم branchName من الهيدر، بل من الحركة نفسها ▼▼▼
      const targetBranchName = transactionToUpdate.branch_name; 

      if (transactionToUpdate.type === 'handover') {
        await tx.branches.updateMany({
          where: { branch_name: targetBranchName }, // استخدام الفرع المسجل في الحركة
          data: { current_cash: transactionToUpdate.amount }
        });
      } 
      else if (transactionToUpdate.type === 'feed') {
        await tx.branches.updateMany({
          where: { branch_name: targetBranchName }, // استخدام الفرع المسجل في الحركة
          data: { current_cash: { increment: transactionToUpdate.amount } }
        });
      }
    });

    return NextResponse.json({ message: 'تم قبول العهدة وتحديث الرصيد' });
  }

    // ─── 2. رفض (تصحيح مبلغ / عجز / فائض) ───
    if (action === 'reject') {
      const actual_amount = body.actual_amount;
      if (actual_amount === undefined || typeof actual_amount !== 'number' || actual_amount < 0) {
          return NextResponse.json({ error: 'المبلغ الفعلي مطلوب للتصحيح' }, { status: 400 });
      }

      await prisma.$transaction(async (tx) => {
        // نعتبرها "مقبولة" لكن مع تعديل المبلغ ووضع علامة requires_review
        await tx.cash_transactions.update({
          where: { id: transactionId },
          data: {
            status: 'accepted',
            notes: rejection_reason, // حفظ سبب الاختلاف
            amount: actual_amount,   // تحديث المبلغ بالمبلغ الفعلي
            processed_at: processingTime,
            requires_review: true    // تفعيل وضع المراجعة
          },
        });

        // تحديث رصيد الفرع بالمبلغ الفعلي
        if (transactionToUpdate.type === 'handover') {
            await tx.branches.updateMany({
                where: { branch_name: branchName },
                data: { current_cash: actual_amount }
            });
        }
        else if (transactionToUpdate.type === 'feed') {
            await tx.branches.updateMany({
                where: { branch_name: branchName },
                data: { current_cash: { increment: actual_amount } }
            });
        }
      });

      return NextResponse.json({ message: 'تم قبول العهدة بالمبلغ المصحح' });
    }

  } catch (error) {
    console.error('Error updating transaction:', error);
    if (error instanceof Error && (error.message.includes('authentication') || error.message.includes('header'))) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}