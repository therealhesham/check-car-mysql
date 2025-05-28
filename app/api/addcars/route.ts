//@ts-nocheck
//@ts-ignore
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import Airtable from 'airtable';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// إعدادات Airtable
const airtableApiKey = 'patH4avQdGYSC0oz4.b2bc135c01c9c5c44cfa2d8595850d75189ea9b050661b9a1efb4e243bd44156';
const airtableBaseId = 'app7Hc09WF8xul5T9';
const airtableTableName = 'cars';
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

// دالة للتحقق من وجود السيارة مسبقًا
async function checkCarExists(name: string): Promise<boolean> {
  try {
    const records = await base(airtableTableName)
      .select({
        filterByFormula: `{Name} = '${encodeURIComponent(name)}'`,
        maxRecords: 1,
      })
      .firstPage();
    return records.length > 0;
  } catch (error: any) {
    console.error('Error checking car existence:', error);
    throw new Error(`Failed to check car existence: ${error.message}`);
  }
}

// جلب قائمة السيارات
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

    const records = await prisma.cars.findMany()

    const cars = records.map((record) => ({
      id: record.id,
      fields: {
        Name: String(record.car_name),
      },
    }));

    return NextResponse.json({
      success: true,
      message: 'Cars fetched successfully!',
      results: cars,
    });
  } catch (error: any) {
    console.error('Error fetching cars:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch cars. Please try again.',
        error: error.message || String(error),
      },
      { status: 500 }
    );
  }
}

// إضافة سيارة جديدة
export async function POST(req: NextRequest) {
  try {
    const { company, model } = await req.json();
    if (!company || typeof company !== 'string' || !model || typeof model !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Company and model are required and must be strings' },
        { status: 400 }
      );
    }

    // دمج الشركة والموديل في حقل Name
    const carName = `${company.trim()}-${model.trim()}`;

    // // التحقق من الوصول إلى الجدول
    // const hasAccess = await verifyTableAccess();
    // if (!hasAccess) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       error: 'Cannot access the database.',
    //       errorCode: 'INVALID_PERMISSIONS_OR_TABLE_NOT_FOUND',
    //     },
    //     { status: 403 }
    //   );
    // }

    // // التحقق من عدم وجود السيارة مسبقًا
    // const carExists = await checkCarExists(carName);
    // if (carExists) {
    //   return NextResponse.json(
    //     { success: false, error: 'Car already exists' },
    //     { status: 400 }
    //   );
    // }

    // إضافة السيارة إلى Airtable
    const createdRecords = await prisma.cars.create({
      data: {car_name: carName}})


    return NextResponse.json({
      success: true,
      message: 'Car added successfully!',
      result: {
        id: createdRecords.id,
        fields: createdRecords,
      },
    });
  } catch (error: any) {
    console.error('Error adding car:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add car' },
      { status: 500 }
    );
  }
}

// حذف سيارة
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    // if (!id || typeof id !== 'string') {
    //   return NextResponse.json(
    //     { success: false, error: 'Car ID is required and must be a string' },
    //     { status: 400 }
    //   );
    // }

    // // التحقق من الوصول إلى الجدول
    // const hasAccess = await verifyTableAccess();
    // if (!hasAccess) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       error: 'Cannot access the database.',
    //       errorCode: 'INVALID_PERMISSIONS_OR_TABLE_NOT_FOUND',
    //     },
    //     { status: 403 }
    //   );
    // }



    const deleter = await prisma.cars.delete({
      where: { id: Number(id) }})
    return NextResponse.json({
      success: true,
      message: 'Car deleted successfully!',
    });
  } catch (error: any) {
    console.error('Error deleting car:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete car. Please try again.',
        error: error.message || String(error),
      },
      { status: 500 }
    );
  }
}