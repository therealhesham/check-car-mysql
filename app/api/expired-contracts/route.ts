import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { subMonths, startOfDay } from 'date-fns';

const prisma = new PrismaClient();

type SortOrder = 'asc' | 'desc';  // إضافة هذا التعريف لحل الخطأ في orderBy

export async function GET(req: NextRequest) {
  try {
    // استخراج query parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '50', 10);
    const monthsAgo = parseInt(url.searchParams.get('monthsAgo') || '3', 10); // افتراضي 3 أشهر
    const sort = url.searchParams.get('sort')?.toLowerCase() || 'desc'; // تنازلي افتراضياً
    const contractNumber = url.searchParams.get('contract_number');
    const plateNumber = url.searchParams.get('plateNumber')?.trim();
    const carModel = url.searchParams.get('carModel')?.trim();
    const branchName = url.searchParams.get('branchName')?.trim();

    // حساب التاريخ: monthsAgo أشهر قبل اليوم (بدء اليوم لتجنب الساعات)
    const createdBeforeDate = subMonths(startOfDay(new Date()), monthsAgo);

    // بناء where clause لعقود "الدخول" فقط
    const where: any = {
      operation_type: 'دخول',
      created_at: {
        lt: createdBeforeDate,
      },
    };

    if (contractNumber) {
      where.contract_number = parseInt(contractNumber, 10);
    }
    if (plateNumber) {
      where.plate_number = plateNumber;
    }
    if (carModel) {
      where.car_model = carModel;
    }
    if (branchName) {
      where.branch_name = branchName;
    }

    // ترتيب: تنازلي أو تصاعدي حسب created_at
    const orderBy: { created_at: SortOrder }[] = [  // استخدام النوع المعرف
      { created_at: sort === 'desc' ? 'desc' : 'asc' },
    ];

    // جلب العقود المطابقة مع التصفح
    const contracts = await prisma.contracts.findMany({
      where,
      select: {
        id: true,
        contract_number: true,
        client_id: true,
        created_at: true,
        client_name: true,
        meter_reading: true,
        car_model: true,
        plate_number: true,
        operation_type: true,
        employee_name: true,
        branch_name: true,
        meter: true,
        right_doors: true,
        front_right_fender: true,
        rear_right_fender: true,
        rear_bumper_with_lights: true,
        trunk_lid: true,
        roof: true,
        rear_left_fender: true,
        left_doors: true,
        front_left_fender: true,
        front_bumper: true,
        hoode: true,
        front_windshield: true,
        trunk_contents: true,
        fire_extinguisher: true,
        front_right_seat: true,
        front_left_seat: true,
        rear_seat_with_front_seat_backs: true,
        other_images: true,
        signature_url: true, // إضافة signature_url إذا كان مطلوباً
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // إزالة التكرارات حسب contract_number (استخدم Map)
    const uniqueContractsMap = new Map<number, any>();
    contracts.forEach((contract) => {
      if (contract.contract_number && !uniqueContractsMap.has(contract.contract_number)) {
        uniqueContractsMap.set(contract.contract_number, contract);
      }
    });
    const uniqueContracts = Array.from(uniqueContractsMap.values());

    // جلب سجل الخروج الأحدث لكل عقد دخول
    const result: { entry: any; exit: any | null }[] = [];
    for (const entry of uniqueContracts) {
      const contractNum = entry.contract_number;
      if (!contractNum || typeof contractNum !== 'number' || contractNum <= 0) {
        result.push({ entry, exit: null });
        continue;
      }

      const exitWhere = {
        contract_number: contractNum,
        operation_type: 'خروج',
      };

      const exitContract = await prisma.contracts.findFirst({
        where: exitWhere,
        select: {
          id: true,
          contract_number: true,
          client_id: true,
          created_at: true,
          client_name: true,
          meter_reading: true,
          car_model: true,
          plate_number: true,
          operation_type: true,
          employee_name: true,
          branch_name: true,
          meter: true,
          right_doors: true,
          front_right_fender: true,
          rear_right_fender: true,
          rear_bumper_with_lights: true,
          trunk_lid: true,
          roof: true,
          rear_left_fender: true,
          left_doors: true,
          front_left_fender: true,
          front_bumper: true,
          hoode: true,
          front_windshield: true,
          trunk_contents: true,
          fire_extinguisher: true,
          front_right_seat: true,
          front_left_seat: true,
          rear_seat_with_front_seat_backs: true,
          other_images: true,
          signature_url: true, // إضافة signature_url
        },
        orderBy: [{ created_at: 'desc' }],  // استخدام النوع المعرف هنا أيضاً
      });

      result.push({
        entry,
        exit: exitContract || null,
      });
    }

    // ترتيب النتائج: الأحدث أولاً حسب تاريخ الدخول
    result.sort(
      (a, b) =>
        new Date(b.entry.created_at).getTime() - new Date(a.entry.created_at).getTime()
    );

    // حساب العدد الإجمالي (بدون تصفح، لكن مع الفلاتر)
    const totalCount = await prisma.contracts.count({ where });

    return NextResponse.json(
      {
        records: result,
        totalCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching expired contracts:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}