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
}

// واجهة لبيانات الطلب لحذف موظف
interface DeleteEmployeeRequestData {
  id: string;
}

// واجهة لسجل Airtable
interface AirtableRecord {
  id: string;
  fields: {
    Name: string;
    EmID: number;
    password: string;
    role: string;
    branch: string;
  };
}

// إعدادات Airtable
const airtableApiKey = 'patH4avQdGYSC0oz4.b2bc135c01c9c5c44cfa2d8595850d75189ea9b050661b9a1efb4e243bd44156';
const airtableBaseId = 'app7Hc09WF8xul5T9';
const airtableTableName = 'user';
const base = new Airtable({ apiKey: airtableApiKey }).base(airtableBaseId);

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
    const branchRegex = /^[ء-ي\s]+$/;
    if (!branchRegex.test(data.fields.branch.trim())) {
      return NextResponse.json(
        {
          success: false,
          message: 'اسم الفرع يجب أن يحتوي على حروف عربية ومسافات فقط.',
          error: 'INVALID_BRANCH_FORMAT',
        },
        { status: 400 }
      );
    }

    // التحقق من الدور
    if (!['admin', 'employee'].includes(data.fields.role)) {
      return NextResponse.json(
        {
          success: false,
          message: 'الدور يجب أن يكون إما admin أو employee.',
          error: 'INVALID_ROLE',
        },
        { status: 400 }
      );
    }

    // التحقق من الوصول إلى الجدول
 

    // إنشاء السجل في Airtable
    const createdRecords = await prisma.users.create({
      data: {branch: data.fields.branch.trim(),EmID: data.fields.EmID, Name: data.fields.Name.trim(), password: data.fields.password.trim(), role: data.fields.role},
    });

    return NextResponse.json({
      success: true,
      message: 'تم إضافة الموظف بنجاح!',
 
    });
  } catch (error: any) {
    console.error('Error creating employee:', error);
    const errorMessage = error.message || String(error);
    const statusCode =
      errorMessage.includes('INVALID_PERMISSIONS_OR_TABLE_NOT_FOUND') ? 403 : error.status || 500;
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
    const branchRegex = /^[ء-ي\s]+$/;
    if (!branchRegex.test(data.fields.branch.trim())) {
      return NextResponse.json(
        {
          success: false,
          message: 'اسم الفرع يجب أن يحتوي على حروف عربية ومسافات فقط.',
          error: 'INVALID_BRANCH_FORMAT',
        },
        { status: 400 }
      );
    }

    // التحقق من الدور
    if (!['admin', 'employee'].includes(data.fields.role)) {
      return NextResponse.json(
        {
          success: false,
          message: 'الدور يجب أن يكون إما admin أو employee.',
          error: 'INVALID_ROLE',
        },
        { status: 400 }
      );
    }

    // التحقق من الوصول إلى الجدول
console.log('Verifying access to Airtable table:', data);    

    const updatedRecords = await prisma.users.update({where: { id: parseInt(data.id) }, data:
      {
          Name: data.fields.Name.trim(),
          EmID: data.fields.EmID,
          password: data.fields.password.trim(),
          role: data.fields.role,
          branch: data.fields.branch.trim(),
      }});

    // console.log('Updated employee record with ID:', updatedRecord.id);

    return NextResponse.json({
      success: true,
      message: 'تم تحديث الموظف بنجاح!',
     
    });
  } catch (error: any) {
    console.error('Error updating employee:', error);
    const errorMessage = error.message || String(error);
    const statusCode =
      errorMessage.includes('INVALID_PERMISSIONS_OR_TABLE_NOT_FOUND') ? 403 : error.status || 500;
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

await prisma.users.delete({where: { id: parseInt(data.id) }});
    console.log('Deleted employee record with ID:', data.id);

    return NextResponse.json({
      success: true,
      message: 'تم حذف الموظف بنجاح!',
    });
  } catch (error: any) {
    console.error('Error deleting employee:', error);
    const errorMessage = error.message || String(error);
    const statusCode =
      errorMessage.includes('INVALID_PERMISSIONS_OR_TABLE_NOT_FOUND') ? 403 : error.status || 500;
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