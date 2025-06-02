// import { NextRequest, NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// // GET /api/contracts - Fetch all contracts
// export async function GET(req: Request) {
//   try {
//     // Extract query parameters
//     const url = new URL(req.url);
//     const page = parseInt(url.searchParams.get('page') || '1', 10);
//     const pageSize = parseInt(url.searchParams.get('pageSize') || '50', 10);
//     const contract_number = url.searchParams.get('contractNumber');
//     const plateFilter = url.searchParams.get('plateFilter')?.trim();
//     const branchFilter = url.searchParams.get('branchFilter')?.trim();
//     const operationType = url.searchParams.get('operationType')?.trim();
//     const fetchFiltersParam = url.searchParams.get('fetchFilters') === 'true';

//     // Build the where clause dynamically
//     const where: any = {};
//     if (contract_number) {
//       where.contract_number = parseInt(contract_number, 10);
//     }

//     const contracts = await prisma.contracts.findMany({
//       where,
//       select: {
//         signature_url: true,
//         id: true,
//         contract_number: true,
//         client_id:true,created_at:true,client_name:true,meter_reading:true,
//         car_model: true,
//         plate_number: true,
//         operation_type: true,
//         employee_name: true,
//         branch_name: true,
//         meter: true,
//         right_doors: true,
//         front_right_fender: true,
//         rear_right_fender: true,
//         rear_bumper_with_lights: true,
//         trunk_lid: true,
//         roof: true,
//         rear_left_fender: true,
//         left_doors: true,
//         front_left_fender: true,
//         front_bumper: true,
//         hoode: true,
//         front_windshield: true,
//         trunk_contents: true,
//         fire_extinguisher: true,
//         front_right_seat: true,
//         front_left_seat: true,
//         rear_seat_with_front_seat_backs: true,
//         other_images: true,
//       },
//     });

//     return NextResponse.json(contracts, { status: 200 });
//   } catch (error) {
//     console.error('Error fetching contracts:', error);
//     return NextResponse.json(
//       { error: 'Internal Server Error' },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET request handler
export async function GET(req: NextRequest) {
  try {
    // Extract query parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '50', 10);
    const contractNumber = url.searchParams.get('contractNumber');
    const plateNumber = url.searchParams.get('plateNumber')?.trim();
    const carModel = url.searchParams.get('carModel')?.trim();
    const operationType = url.searchParams.get('operationType')?.trim();
    const branchName = url.searchParams.get('branchName')?.trim();
    const sort = url.searchParams.get('sort')?.toLowerCase();
    const fetchFiltersParam = url.searchParams.get('fetchFilters') === 'true';

    // Build the where clause dynamically
    const where: any = {};
    if (contractNumber) {
      where.contract_number = parseInt(contractNumber, 10);
    }
    if (plateNumber) {
      where.plate_number = plateNumber;
    }
    if (carModel) {
      where.car_model = carModel;
    }
    if (operationType) {
      where.operation_type = operationType;
    }
    if (branchName) {
      where.branch_name = branchName;
    }

    // Handle sorting
    const orderBy = sort === 'desc' ? [{ created_at: 'desc' }] : [{ created_at: 'asc' }];

    // Handle fetch filters
    if (fetchFiltersParam) {
      const contracts = await prisma.contracts.findMany({
        select: {
          car_model: true,
          plate_number: true,
          branch_name: true,
        },
        distinct: ['car_model', 'plate_number', 'branch_name'],
      });

      return NextResponse.json(contracts, { status: 200 });
    }

    // Fetch contracts with pagination and sorting
    const contracts = await prisma.contracts.findMany({
      where,
      select: {
        signature_url: true,
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
      },
      orderBy, // Apply sorting
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return NextResponse.json(contracts, { status: 200 });
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}