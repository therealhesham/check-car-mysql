//@ts-ignore
//@ts-nocheck
// app/api/cheakout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

interface RequestBody {
  fields: {
    client_id?: string | null;
    client_name?: string | null;
    meter_reading?: string | null;
    'السيارة': string;
    'اللوحة': string;
    'العقد': string;
    'نوع العملية': string;
    'الموظف': string;
    'الفرع': string;
    meter?: string | null;
    right_doors?: string | null;
    front_right_fender?: string | null;
    rear_right_fender?: string | null;
    rear_bumper_with_lights?: string | null;
    trunk_lid?: string | null;
    roof?: string | null;
    rear_left_fender?: string | null;
    left_doors?: string | null;
    front_left_fender?: string | null;
    front_bumper?: string | null;
    hoode?: string | null;
    front_windshield?: string | null;
    trunk_contents?: string | null;
    fire_extinguisher?: string | null;
    front_right_seat?: string | null;
    front_left_seat?: string | null;
    rear_seat_with_front_seat_backs?: string | null;
    other_images?: string[] | null;
    signature_url?: string | null; // Added signature_url field
  };
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
  details?: any;
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body: RequestBody = await req.json();
    const { fields } = body;

    // Validate required fields
    const requiredFields = ['اللوحة', 'العقد', 'نوع العملية', 'الموظف', 'الفرع', 'signature_url'];
    const missingFields = requiredFields.filter((field) => !fields[field] || fields[field].trim() === '');
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'حقول مطلوبة مفقودة أو غير صالحة',
          details: { missingFields },
        },
        { status: 400 }
      );
    }

    // Validate contract number
    const contractNumber = parseInt(fields['العقد'], 10);
    if (isNaN(contractNumber)) {
      return NextResponse.json(
        {
          success: false,
          error: 'رقم العقد يجب أن يكون رقمًا صالحًا',
        },
        { status: 400 }
      );
    }

    // Check for existing checkout record
    const existingRecord = await prisma.contracts.findFirst({
      where: {
        contract_number: contractNumber,
        operation_type: 'خروج',
      },
    });

    if (existingRecord) {
      return NextResponse.json(
        {
          success: false,
          error: 'سجل خروج موجود بالفعل لهذا العقد',
        },
        { status: 409 }
      );
    }

    // Validate required images (all fields except 'other_images' and 'signature_url')
    const imageFields = [
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
    ];

    const missingImages = imageFields.filter((field) => !fields[field] || fields[field] === '');
    if (missingImages.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `يجب رفع صورة واحدة على الأقل لكل من: ${missingImages.join(', ')}`,
        },
        { status: 400 }
      );
    }
console.log('Fields:', fields.client_id);
    // Create new contract record
    const newContract = await prisma.contracts.create({
      data: {
        client_id: fields.client_id,
        client_name: fields.client_name,
        meter_reading: fields.meter_reading,
        contract_number: contractNumber,
        car_model: fields['السيارة'],
        plate_number: fields['اللوحة'],
        operation_type: fields['نوع العملية'],
        employee_name: fields['الموظف'],
        branch_name: fields['الفرع'],
        meter: fields.meter,
        right_doors: fields.right_doors,
        front_right_fender: fields.front_right_fender,
        rear_right_fender: fields.rear_right_fender,
        rear_bumper_with_lights: fields.rear_bumper_with_lights,
        trunk_lid: fields.trunk_lid,
        roof: fields.roof,
        rear_left_fender: fields.rear_left_fender,
        left_doors: fields.left_doors,
        front_left_fender: fields.front_left_fender,
        front_bumper: fields.front_bumper,
        hoode: fields.hoode,
        front_windshield: fields.front_windshield,
        trunk_contents: fields.trunk_contents,
        fire_extinguisher: fields.fire_extinguisher,
        front_right_seat: fields.front_right_seat,
        front_left_seat: fields.front_left_seat,
        rear_seat_with_front_seat_backs: fields.rear_seat_with_front_seat_backs,
        other_images: fields.other_images ? fields.other_images.join(',') : null,
        signature_url: fields.signature_url, // Added signature_url to data
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'تم إنشاء سجل التشييك بنجاح',
        data: newContract,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating contract:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ أثناء معالجة الطلب',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

