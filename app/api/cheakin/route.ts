//@ts-ignore
//@ts-nocheck





import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Define interface for the request data
interface AirtableRequestData {
  fields: Record<string, string | string[]>;
}

// Define interface for Airtable record
interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
  getId(): string;
}

// Configure API to accept JSON data
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

// Airtable configuration
const airtableApiKey = 'patH4avQdGYSC0oz4.b2bc135c01c9c5c44cfa2d8595850d75189ea9b050661b9a1efb4e243bd44156';
const airtableBaseId = 'app7Hc09WF8xul5T9';
const airtableTableName = 'cheakcar';
const base = new Airtable({ apiKey: airtableApiKey }).base(airtableBaseId);

// Function to verify Airtable connection and table access
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

// دالة للتحقق من وجود سجل دخول سابق بنفس رقم العقد
async function checkPreviousEntry(contractNumber: string): Promise<boolean> {
  try {
    if (!contractNumber || contractNumber.trim() === '') {
      throw new Error('رقم العقد مطلوب ولا يمكن أن يكون فارغًا');
    }

    const contractNum = parseFloat(contractNumber);
    if (isNaN(contractNum) || !Number.isInteger(contractNum)) {
      throw new Error('رقم العقد يجب أن يكون رقمًا صحيحًا');
    }
const records = await prisma.contracts.findMany({
      where: {operation_type:"دخول", contract_number: contractNum }});

    return records.length > 0;
  } catch (error: any) {
    console.error('Error checking previous entry:', {
      message: error.message,
      details: error.response?.data || error,
      contractNumber,
    });
    throw new Error(`فشل في التحقق من سجل الدخول السابق: ${error.message}`);
  }
}

// Direct upload to Airtable
async function uploadDirectly(data: Record<string, string | string[]>): Promise<any> {
  try {
    console.log('Attempting direct upload...');
    const hasAccess = await verifyTableAccess();
    if (!hasAccess) {
      throw new Error('INVALID_PERMISSIONS_OR_TABLE_NOT_FOUND');
    }

    const fields: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
      if (key === 'العقد') {
        const contractNum = parseFloat(value as string);
        if (isNaN(contractNum)) {
          throw new Error('حقل العقد يجب أن يكون رقمًا صالحًا');
        }
        fields[key] = contractNum;
      } else if (key === 'صور اخرى' && Array.isArray(value)) {
        const imageUrls = value.map((url) => ({
          url,
          filename: `${key}_${Date.now()}.jpg`,
        }));
        fields[key] = imageUrls;
      } else if (typeof value === 'string' && fieldTitles.includes(key)) {
        fields[key] = [{ url: value, filename: `${key}_${Date.now()}.jpg` }];
      } else if (key === 'الموظف' || key === 'الفرع') {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          throw new Error(`حقل ${key} لا يمكن أن يكون فارغًا`);
        }
        fields[key] = value;
      } else {
        fields[key] = value;
      }
    }

    console.log('Fields to Airtable:', JSON.stringify(fields, null, 2));
console.log(fields)
    const newContract = await prisma.contracts.create({
      data: {
        contract_number: fields['العقد'] ,
        car_model: fields['السيارة'],
        plate_number: fields['اللوحة'],
        operation_type: fields['نوع العملية'],
        employee_name: fields['الموظف'],
        branch_name: fields['الفرع'],
        meter: fields.meter[0].url,
        right_doors: fields.right_doors[0].url,
        front_right_fender: fields.front_right_fender[0].url,
        rear_right_fender: fields.rear_right_fender[0].url,
        rear_bumper_with_lights: fields.rear_bumper_with_lights[0].url,
        trunk_lid: fields.trunk_lid[0].url,
        roof: fields.roof[0].url,
        rear_left_fender: fields.rear_left_fender[0].url,
        left_doors: fields.left_doors[0].url,
        front_left_fender: fields.front_left_fender[0].url,
        front_bumper: fields.front_bumper[0].url,
        hoode: fields.hoode[0].url,
        front_windshield: fields.front_windshield[0].url,
        trunk_contents: fields.trunk_contents[0].url,
        fire_extinguisher: fields.fire_extinguisher[0].url,
        front_right_seat: fields.front_right_seat[0].url,
        front_left_seat: fields.front_left_seat[0].url,
        rear_seat_with_front_seat_backs: fields.rear_seat_with_front_seat_backs[0].url,
        other_images: fields.other_images ? fields.other_images.join(',') : null, // Convert array to comma-separated string
      },
    });

    return {
      success: true
    };
  } catch (error) {
    console.error('Error in direct upload:', error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log('Processing data for upload...', Object.keys(data.fields).length, 'fields');

    if (!data.fields['العقد']) {
      return NextResponse.json(
        {
          success: false,
          message: 'رقم العقد مطلوب.',
          error: 'CONTRACT_NUMBER_REQUIRED',
        },
        { status: 400 }
      );
    }

    const contractNumber = data.fields['العقد'] as string;
    const hasPreviousEntry = await checkPreviousEntry(contractNumber);
    if (hasPreviousEntry) {
      return NextResponse.json(
        {
          success: false,
          message: 'تم تسجيل عملية دخول لهذا العقد من قبل.',
          error: 'يوجد سجل دخول سابق',
        },
        { status: 400 }
      );
    }

    const hasImage = Object.entries(data.fields).some(([key, value]) =>
      fieldTitles.includes(key) && (typeof value === 'string' || Array.isArray(value))
    );
    if (!hasImage) {
      return NextResponse.json(
        {
          success: false,
          message: 'يجب تقديم صورة واحدة على الأقل.',
          error: 'لم يتم رفع صور',
        },
        { status: 400 }
      );
    }

    if (!data.fields['الموظف'] || !data.fields['الفرع']) {
      return NextResponse.json(
        {
          success: false,
          message: 'يجب تقديم بيانات الموظف والفرع.',
          error: 'بيانات الموظف والفرع مطلوبة',
        },
        { status: 400 }
      );
    }

    const result = await uploadDirectly(data.fields);
    return NextResponse.json({
      success: true,
      message: 'تم رفع البيانات بنجاح!',
      result,
    });
  } catch (error: any) {
    console.error('Error processing upload:', error);
    const errorMessage = error.message || String(error);
    const statusCode =
      error.message === 'INVALID_PERMISSIONS_OR_TABLE_NOT_FOUND'
        ? 403
        : error.message.includes('تم تسجيل عملية دخول')
        ? 400
        : typeof error.statusCode === 'number'
        ? error.statusCode
        : 500;
    return NextResponse.json(
      {
        success: false,
        message: 'حدث خطأ أثناء معالجة البيانات. يرجى المحاولة مرة أخرى لاحقاً.',
        error: errorMessage,
      },
      { status: statusCode }
    );
  }
}

// Define fieldTitles for validation
const fieldTitles = [
  'meter',
  'right_doors',
  'front_right_fender',
  'rear_right_fender',
  'rear_bumper_with_lights',
  'trunk_lid',
  'roof',
  'rear_left_fender',
  'left_doors',
  'front_left_fender',
  'front_bumper',
  'hoode',
  'front_windshield',
  'trunk_contents',
  'fire_extinguisher',
  'front_right_seat',
  'front_left_seat',
  'rear_seat_with_front_seat_backs',
  'other_images',
];
