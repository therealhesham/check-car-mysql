import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import Airtable from 'airtable';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// إعدادات Airtable
const airtableApiKey = 'patH4avQdGYSC0oz4.b2bc135c01c9c5c44cfa2d8595850d75189ea9b050661b9a1efb4e243bd44156';
const airtableBaseId = 'app7Hc09WF8xul5T9';
const airtableTableName = 'branchList';
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

// دالة للتحقق من وجود الفرع مسبقًا
async function checkBranchExists(branch: string, excludeId?: string): Promise<boolean> {
  try {
    const records = await base(airtableTableName)
      .select({
        filterByFormula: `{Name} = '${branch.replace(/'/g, "\\'")}'`, // Escaping single quotes
        maxRecords: 1,
      })
      .firstPage();
    if (excludeId) {
      return records.length > 0 && records[0].id !== excludeId;
    }
    return records.length > 0;
  } catch (error: any) {
    console.error('Error checking branch existence:', error);
    throw new Error(`Failed to check branch existence: ${error.message}`);
  }
}

// جلب قائمة الفروع
export async function GET(req: NextRequest) {
  try {
    // const hasAccess = await verifyTableAccess();
    // if (!hasAccess) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       message: 'Cannot access the database.',
    //       error: 'INVALID_PERMISSIONS_OR_TABLE_NOT_FOUND',
    //     },
    //     { status: 403 }
    //   );
    // }

    const records = await prisma.branches.findMany();

    const branches = records.map((record) => ({
      id: record.id,
      fields: {
        Name: String(record.branch_name),
      },
    }));

    return NextResponse.json({
      success: true,
      message: 'Branches fetched successfully!',
      results: branches,
    });
  } catch (error: any) {
    console.error('Error fetching branches:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch branches. Please try again.',
        error: error.message || String(error),
      },
      { status: 500 }
    );
  }
}

// إضافة فرع جديد
export async function POST(req: NextRequest) {
  try {
    const { branch } = await req.json();
    if (!branch || typeof branch !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Branch name is required and must be a string' },
        { status: 400 }
      );
    }

    // التحقق من صحة اسم الفرع (حروف عربية ومسافات فقط)
    const branchRegex = /^[ء-ي\s]+$/;
    if (!branchRegex.test(branch.trim())) {
      return NextResponse.json(
        { success: false, error: 'Branch name must contain only Arabic letters and spaces' },
        { status: 400 }
      );
    }

    // // التحقق من عدم وجود الفرع مسبقًا
    // const branchExists = await checkBranchExists(branch.trim());
    // if (branchExists) {
    //   return NextResponse.json(
    //     { success: false, error: 'Branch already exists' },
    //     { status: 400 }
    //   );
    // }

    // إضافة الفرع إلى Airtable
    const createdRecords = await prisma.branches.create({
      data: {branch_name: branch.trim()}})

    const recordId = createdRecords;
    console.log('Created branch record with ID:', recordId);

    return NextResponse.json({
      success: true,
      message: 'Branch added successfully!',
      result: {
        id: recordId,
        fields: createdRecords,
      },
    });
  } catch (error: any) {
    console.error('Error adding branch:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add branch' },
      { status: 500 }
    );
  }
}

// تعديل فرع موجود
export async function PUT(req: NextRequest) {
  try {
    const { id, branch } = await req.json();
    // if (!id || typeof id !== 'string' || !branch || typeof branch !== 'string') {
    //   return NextResponse.json(
    //     { success: false, error: 'ID and branch name are required and must be strings' },
    //     { status: 400 }
    //   );
    // }

    // التحقق من صحة اسم الفرع (حروف عربية ومسافات فقط)
    const branchRegex = /^[ء-ي\s]+$/;
    if (!branchRegex.test(branch.trim())) {
      return NextResponse.json(
        { success: false, error: 'Branch name must contain only Arabic letters and spaces' },
        { status: 400 }
      );
    }


    // التحقق من عدم وجود الفرع مسبقًا (باستثناء السجل الحالي)
    // const branchExists = await checkBranchExists(branch.trim(), id);
    // if (branchExists) {
    //   return NextResponse.json(
    //     { success: false, error: 'Branch already exists' },
    //     { status: 400 }
    //   );
    // }

    // تعديل الفرع في Airtable
    const updatedRecords = await prisma.branches.update({data: {branch_name: branch.trim()}, where: {id:parseInt(id)}});

    console.log('Updated branch record with ID:', id);

    return NextResponse.json({
      success: true,
      message: 'Branch updated successfully!',
      result: {
        id: updatedRecords.id,
        fields: updatedRecords,
      },
    });
  } catch (error: any) {
    console.error('Error updating branch:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update branch' },
      { status: 500 }
    );
  }
}

// حذف فرع
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();



    const userTable = new Airtable({ apiKey: airtableApiKey }).base(airtableBaseId)('user');
    const employeeRecords = await prisma.branches.delete({where: {id:parseInt(id)}});

    return NextResponse.json({
      success: true,
      message: 'Branch deleted successfully!',
    });
  } catch (error: any) {
    console.error('Error deleting branch:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete branch. Please try again.',
        error: error.message || String(error),
      },
      { status: 500 }
    );
  }
}