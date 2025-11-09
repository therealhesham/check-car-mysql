
import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// واجهة لبيانات الطلب لإنشاء أو تحديث موظف
interface CreateOrUpdateEmployeeRequestData {
  id?: string; // للتحديث فقط
  fields: {
    Name: string;
    EmID: number;
    password: string;
    role: string;
    branch: string;
  };
  // إضافة معلومات التوكنز للتحديث
  originalPassword?: string;
  originalRole?: string;
}

// واجهة لبيانات الطلب لحذف موظف
interface DeleteEmployeeRequestData {
  id: string;
}

// إعدادات Airtable (يمكن إزالتها إذا كنت تستخدم Prisma فقط)
const airtableApiKey = 'patH4avQdGYSC0oz4.b2bc135c01c9c5c44cfa2d8595850d75189ea9b050661b9a1efb4e243bd44156';
const airtableBaseId = 'app7Hc09WF8xul5T9';
const airtableTableName = 'user';
const base = new Airtable({ apiKey: airtableApiKey }).base(airtableBaseId);

const VALID_ROLES = ['employee', 'accountant', 'admin', 'super_admin', 'owner'] as const;
type UserRole = typeof VALID_ROLES[number];

// دالة حذف جميع refresh tokens للمستخدم
// دالة حذف جميع refresh tokens للمستخدم
// دالة حذف جميع refresh tokens للمستخدم
async function deleteUserTokens(userEmID: number): Promise<void> {
  try {
    console.log(`Attempting to delete all tokens for user EmID: ${userEmID}`);
    
    // البحث عن المستخدم باستخدام EmID للحصول على id
    const user = await prisma.users.findUnique({
      where: { EmID: userEmID },
      select: { id: true } // نحتاج فقط إلى id المستخدم
    });
    
    if (!user) {
      console.log(`User with EmID ${userEmID} not found`);
      return;
    }
    
    // حذف جميع التوكنز للمستخدم من قاعدة البيانات
    const deletedTokens = await prisma.tokens.deleteMany({
      where: {
        user_id: user.id, // استخدام id المستخدم الذي حصلنا عليه
        type: 'refresh', // تحديد نوع التوكن كـ refresh
        is_active: true
      }
    });
    
    console.log(`Successfully deleted ${deletedTokens.count} active tokens for user ID: ${user.id}`);
  } catch (error: any) {
    console.error(`Error deleting tokens for user EmID ${userEmID}:`, {
      message: error.message,
      stack: error.stack
    });
    // لا نرمي الخطأ لأننا لا نريد إيقاف عملية التحديث/الحذف الأساسية
  }
}

// دالة للتحقق من الوصول إلى الجدول
async function verifyTableAccess(): Promise<boolean> {
  try {
    console.log(`Attempting to verify access to table: ${airtableTableName}`);
    const records = await base(airtableTableName)
      .select({
        maxRecords: 1,
      })
      .firstPage();
    console.log('Airtable table access verified successfully:', records.length, 'records retrieved');
    return true;
  } catch (error: any) {
    console.error('Error verifying Airtable table access:', {
      message: error.message,
      status: error.status,
      errorCode: error.error,
      details: error.response?.data || error,
    });
    return false;
  }
}

// جلب جميع الموظفين
export async function GET(req: NextRequest) {
  try {
    const records = await prisma.users.findMany()

    const employees = records.map((record) => ({
      id: record.id,
      Name: String(record.Name),
      EmID: Number(record.EmID),
      password: String(record.password),
      role: String(record.role),
      branch: String(record.branch),
    }));

    return NextResponse.json({
      success: true,
      message: 'تم جلب الموظفين بنجاح!',
      results: employees,
    });
  } catch (error: any) {
    console.error('Error fetching employees:', error);
    const errorMessage = error.message || String(error);
    return NextResponse.json(
      {
        success: false,
        message: 'حدث خطأ أثناء جلب الموظفين. يرجى المحاولة مرة أخرى.',
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

// إنشاء موظف جديد
export async function POST(req: NextRequest) {
  try {
    const data = (await req.json()) as CreateOrUpdateEmployeeRequestData;
    console.log('Processing employee creation request:', data.fields);

    // التحقق من وجود الحقول المطلوبة
    if (
      !data.fields.Name ||
      !data.fields.password ||
      !data.fields.role ||
      !data.fields.branch ||
      isNaN(data.fields.EmID)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'جميع الحقول مطلوبة ويجب أن تكون صالحة.',
          error: 'MISSING_OR_INVALID_FIELDS',
        },
        { status: 400 }
      );
    }

    // التحقق من صحة الفرع
    const branchRegex = /^[ء-ي\s,]+$/;
    const branches = data.fields.branch.split(',').map((b) => b.trim()).filter((b) => b);
    if (branches.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'يجب تحديد فرع واحد على الأقل.',
          error: 'NO_BRANCH_SELECTED',
        },
        { status: 400 }
      );
    }
    
    for (const branch of branches) {
      if (!branchRegex.test(branch)) {
        return NextResponse.json(
          {
            success: false,
            message: 'كل فرع يجب أن يحتوي على حروف عربية ومسافات فقط.',
            error: 'INVALID_BRANCH_FORMAT',
          },
          { status: 400 }
        );
      }
    }

    // التحقق من الدور
    if (!VALID_ROLES.includes(data.fields.role as UserRole)) {
      return NextResponse.json(
        {
          success: false,
          message: `الدور يجب أن يكون واحدًا من: ${VALID_ROLES.join(', ')}.`,
          error: 'INVALID_ROLE',
        },
        { status: 400 }
      );
    }

    // التحقق من عدم وجود EmID مكرر
    const existingUser = await prisma.users.findUnique({
      where: { EmID: data.fields.EmID }
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'معرف الموظف هذا مستخدم بالفعل.',
          error: 'EMPLOYEE_ID_ALREADY_EXISTS',
        },
        { status: 400 }
      );
    }

    // إنشاء السجل في قاعدة البيانات
    const createdRecord = await prisma.users.create({
      data: {
        branch: data.fields.branch.trim(),
        EmID: data.fields.EmID, 
        Name: data.fields.Name.trim(), 
        password: data.fields.password.trim(), 
        role: data.fields.role
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم إضافة الموظف بنجاح!',
      result: {
        id: createdRecord.id,
        fields: {
          Name: createdRecord.Name,
          EmID: createdRecord.EmID,
          role: createdRecord.role,
          branch: createdRecord.branch
        }
      }
    });
  } catch (error: any) {
    console.error('Error creating employee:', error);
    const errorMessage = error.message || String(error);
    
    // التحقق من خطأ التكرار
    if (errorMessage.includes('Unique constraint failed') && errorMessage.includes('EmID')) {
      return NextResponse.json(
        {
          success: false,
          message: 'معرف الموظف هذا مستخدم بالفعل.',
          error: 'EMPLOYEE_ID_ALREADY_EXISTS',
        },
        { status: 400 }
      );
    }

    const statusCode = error.status || 500;
    return NextResponse.json(
      {
        success: false,
        message: 'حدث خطأ أثناء إضافة الموظف. يرجى المحاولة مرة أخرى.',
        error: errorMessage,
      },
      { status: statusCode }
    );
  }
}

// تحديث موظف
// تحديث موظف
export async function PUT(req: NextRequest) {
  try {
    const data = (await req.json()) as CreateOrUpdateEmployeeRequestData;
    console.log('Processing employee update request for ID:', data.id);
    
    // التحقق من وجود الحقول المطلوبة
    if (
      !data.id ||
      !data.fields.Name ||
      !data.fields.password ||
      !data.fields.role ||
      !data.fields.branch ||
      isNaN(data.fields.EmID)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'جميع الحقول مطلوبة ويجب أن تكون صالحة.',
          error: 'MISSING_OR_INVALID_FIELDS',
        },
        { status: 400 }
      );
    }
    
    // التحقق من صحة الفرع
    const branchRegex = /^[ء-ي\s,]+$/;
    const branches = data.fields.branch.split(',').map((b) => b.trim()).filter((b) => b);
    if (branches.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'يجب تحديد فرع واحد على الأقل.',
          error: 'NO_BRANCH_SELECTED',
        },
        { status: 400 }
      );
    }
    
    for (const branch of branches) {
      if (!branchRegex.test(branch)) {
        return NextResponse.json(
          {
            success: false,
            message: 'كل فرع يجب أن يحتوي على حروف عربية ومسافات فقط.',
            error: 'INVALID_BRANCH_FORMAT',
          },
          { status: 400 }
        );
      }
    }
    
    // التحقق من الدور
    if (!VALID_ROLES.includes(data.fields.role as UserRole)) {
      return NextResponse.json(
        {
          success: false,
          message: `الدور يجب أن يكون واحدًا من: ${VALID_ROLES.join(', ')}.`,
          error: 'INVALID_ROLE',
        },
        { status: 400 }
      );
    }
    
    // التحقق من وجود المستخدم أولاً
    const existingUser = await prisma.users.findUnique({
      where: { id: parseInt(data.id) }
    });
    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'الموظف غير موجود.',
          error: 'USER_NOT_FOUND',
        },
        { status: 404 }
      );
    }
    
    // التحقق من تكرار EmID (باستثناء المستخدم الحالي)
    const duplicateEmID = await prisma.users.findFirst({
      where: { 
        EmID: data.fields.EmID,
        id: { not: parseInt(data.id) }
      }
    });
    if (duplicateEmID) {
      return NextResponse.json(
        {
          success: false,
          message: 'معرف الموظف هذا مستخدم بالفعل.',
          error: 'EMPLOYEE_ID_ALREADY_EXISTS',
        },
        { status: 400 }
      );
    }
    
    // التحقق من ضرورة حذف التوكنز
    const shouldDeleteTokens = (
      (data.originalPassword && data.fields.password !== data.originalPassword) ||
      (data.originalRole && data.fields.role !== data.originalRole)
    );
    console.log('Should delete tokens:', shouldDeleteTokens);
    
    // حذف التوكنز إذا تغيرت كلمة المرور أو الدور
    if (shouldDeleteTokens) {
      await deleteUserTokens(existingUser.EmID); // استخدام EmID بدلاً من id
    }
    
    // تحديث بيانات المستخدم
    const updatedRecord = await prisma.users.update({
      where: { id: parseInt(data.id) }, 
      data: {
        Name: data.fields.Name.trim(),
        EmID: data.fields.EmID,
        password: data.fields.password.trim(),
        role: data.fields.role,
        branch: data.fields.branch.trim(),
      }
    });
    
    return NextResponse.json({
      success: true,
      message: shouldDeleteTokens 
        ? 'تم تحديث الموظف وإنهاء جميع جلساته بنجاح!' 
        : 'تم تحديث الموظف بنجاح!',
      result: {
        id: updatedRecord.id,
        fields: {
          Name: updatedRecord.Name,
          EmID: updatedRecord.EmID,
          role: updatedRecord.role,
          branch: updatedRecord.branch
        }
      }
    });
  } catch (error: any) {
    console.error('Error updating employee:', error);
    const errorMessage = error.message || String(error);
    
    // التحقق من خطأ التكرار
    if (errorMessage.includes('Unique constraint failed') && errorMessage.includes('EmID')) {
      return NextResponse.json(
        {
          success: false,
          message: 'معرف الموظف هذا مستخدم بالفعل.',
          error: 'EMPLOYEE_ID_ALREADY_EXISTS',
        },
        { status: 400 }
      );
    }
    const statusCode = error.status || 500;
    return NextResponse.json(
      {
        success: false,
        message: 'حدث خطأ أثناء تحديث الموظف. يرجى المحاولة مرة أخرى.',
        error: errorMessage,
      },
      { status: statusCode }
    );
  }
}

// حذف موظف
// حذف موظف
export async function DELETE(req: NextRequest) {
  try {
    const data = (await req.json()) as DeleteEmployeeRequestData;
    console.log('Processing employee deletion request for ID:', data.id);
    
    // التحقق من وجود الحقل id
    if (!data.id) {
      return NextResponse.json(
        {
          success: false,
          message: 'معرف الموظف مطلوب.',
          error: 'MISSING_ID',
        },
        { status: 400 }
      );
    }
    
    // التحقق من وجود المستخدم أولاً للحصول على EmID
    const existingUser = await prisma.users.findUnique({
      where: { id: parseInt(data.id) }
    });
    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'الموظف غير موجود.',
          error: 'USER_NOT_FOUND',
        },
        { status: 404 }
      );
    }
    
    // حذف جميع التوكنز للمستخدم أولاً
    await deleteUserTokens(existingUser.EmID); // استخدام EmID بدلاً من id
    
    // حذف المستخدم من قاعدة البيانات
    await prisma.users.delete({
      where: { id: parseInt(data.id) }
    });
    
    console.log('Deleted employee record with ID:', data.id);
    return NextResponse.json({
      success: true,
      message: 'تم حذف الموظف وجميع جلساته بنجاح!',
    });
  } catch (error: any) {
    console.error('Error deleting employee:', error);
    const errorMessage = error.message || String(error);
    const statusCode = error.status || 500;
    return NextResponse.json(
      {
        success: false,
        message: 'حدث خطأ أثناء حذف الموظف. يرجى المحاولة مرة أخرى.',
        error: errorMessage,
      },
      { status: statusCode }
    );
  }
}