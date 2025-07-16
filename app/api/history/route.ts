

// import { NextRequest, NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// export async function GET(req: NextRequest) {
//   try {
//     // Extract query parameters
//     const url = new URL(req.url);
//     const page = parseInt(url.searchParams.get('page') || '1', 10);
//     const pageSize = parseInt(url.searchParams.get('pageSize') || '50', 10);
//     const contractNumber = url.searchParams.get('contractNumber');
//     const plateNumber = url.searchParams.get('plateNumber')?.trim();
//     const carModel = url.searchParams.get('carModel')?.trim();
//     const operationType = url.searchParams.get('operationType')?.trim();
//     const branchName = url.searchParams.get('branchName')?.trim();
//     const sort = url.searchParams.get('sort')?.toLowerCase();
//     const fetchFiltersParam = url.searchParams.get('fetchFilters') === 'true';

//     // Build the where clause dynamically
//     const where: any = {};
//     if (contractNumber) {
//       where.contract_number = parseInt(contractNumber, 10);
//     }
//     if (plateNumber) {
//       where.plate_number = plateNumber;
//     }
//     if (carModel) {
//       where.car_model = carModel;
//     }
//     if (operationType) {
//       where.operation_type = operationType;
//     }
//     if (branchName) {
//       where.branch_name = branchName;
//     }

//     // Handle sorting
//     type SortOrder = 'asc' | 'desc';
//     const orderBy: { created_at: SortOrder }[] = [
//       { created_at: sort === 'desc' ? 'desc' : 'asc' },
//     ];

//     // Handle fetch filters
//     if (fetchFiltersParam) {
//       const contracts = await prisma.contracts.findMany({
//         select: {
//           car_model: true,
//           plate_number: true,
//           branch_name: true,
//         },
//         distinct: ['car_model', 'plate_number', 'branch_name'],
//       });
//       return NextResponse.json(contracts, { status: 200 });
//     }

//     // Fetch total count of matching records
//     const totalCount = await prisma.contracts.count({ where });

//     // Fetch contracts with pagination and sorting
//     const contracts = await prisma.contracts.findMany({
//       where,
//       select: {
//         signature_url: true,
//         id: true,
//         contract_number: true,
//         client_id: true,
//         created_at: true,
//         client_name: true,
//         meter_reading: true,
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
//       orderBy,
//       skip: (page - 1) * pageSize,
//       take: pageSize,
//     });

//     // Return both contracts and totalCount
//     return NextResponse.json(
//       {
//         records: contracts,
//         totalCount,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error('Error fetching contracts:', error);
//     return NextResponse.json(
//       { error: 'Internal Server Error' },
//       { status: 500 }
//     );
//   } finally {
//     await prisma.$disconnect();
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { startOfHour, endOfHour } from 'date-fns';

const prisma = new PrismaClient();

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
    const createdAt = url.searchParams.get('createdAt')?.trim(); // New parameter
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
    if (createdAt) {
      const date = new Date(createdAt);
      if (!isNaN(date.getTime())) {
        const start = startOfHour(date);
        const end = endOfHour(date);
        where.created_at = {
          gte: start,
          lt: end,
        };
      }
    }

    // Handle sorting
    type SortOrder = 'asc' | 'desc';
    const orderBy: { created_at: SortOrder }[] = [
      { created_at: sort === 'desc' ? 'desc' : 'asc' },
    ];

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

    // Fetch total count of matching records
    const totalCount = await prisma.contracts.count({ where });

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
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // Return both contracts and totalCount
    return NextResponse.json(
      {
        records: contracts,
        totalCount,
      },
      { status: 200 }
    );
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