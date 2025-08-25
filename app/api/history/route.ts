
// import { NextRequest, NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client';
// import { startOfHour, endOfHour } from 'date-fns';

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
//     const createdAt = url.searchParams.get('createdAt')?.trim(); // New parameter
//     const createdBeforeStr = url.searchParams.get('createdBefore')?.trim();
// const createdAfterStr = url.searchParams.get('createdAfter')?.trim();
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
//     if (createdAt) {
//       const date = new Date(createdAt);
//       if (!isNaN(date.getTime())) {
//         const start = startOfHour(date);
//         const end = endOfHour(date);
//         where.created_at = {
//           gte: start,
//           lt: end,
//         };
//       }
//     }
//     // دعم: createdBefore (أقدم من تاريخ معين)
// if (createdBeforeStr) {
//   const date = new Date(createdBeforeStr);
//   if (!isNaN(date.getTime())) {
//     where.created_at = {
//       lt: date,
//     };
//   }
// }

// // دعم: createdAfter (أحدث من تاريخ معين)
// if (createdAfterStr) {
//   const date = new Date(createdAfterStr);
//   if (!isNaN(date.getTime())) {
//     where.created_at = {
//       gte: date,
//     };
//   }
// }

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
import AWS from 'aws-sdk';

const prisma = new PrismaClient();


// إعداد DigitalOcean Spaces
const s3 = new AWS.S3({
  accessKeyId: process.env.DO_ACCESS_KEY || '',
  secretAccessKey: process.env.DO_SECRET_KEY || '',
  endpoint: process.env.DO_ENDPOINT || '',
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
});

// دالة حذف ملف من DigitalOcean
const deleteFileFromDO = (fileKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: 'uploadcarimages',
      Key: fileKey,
    };

    s3.deleteObject(params, (err, data) => {
      if (err) {
        console.error('S3 Delete Error:', err);
        reject(new Error(`فشل في حذف الملف: ${fileKey}`));
      } else {
        console.log('تم حذف الملف من S3:', fileKey);
        resolve();
      }
    });
  });
};

// دالة استخراج مفاتيح الملفات من URL
const extractFileKeys = (record: any): string[] => {
  const fileKeys: string[] = [];
  
  // دالة مساعدة لاستخراج المفتاح من رابط واحد
  const extractKeyFromUrl = (url: string): string | null => {
    try {
      // إزالة أي مسافات زائدة
      url = url.trim();
      
      // التحقق من أن الرابط ينتمي إلى DigitalOcean Spaces
      if (url.includes('.digitaloceanspaces.com/')) {
        // تقسيم الرابط للحصول على المسار الكامل بعد النطاق
        const urlParts = url.split('.digitaloceanspaces.com/');
        if (urlParts.length > 1) {
          // استخراج المسار الكامل بعد اسم الحاوية
          const fullPath = urlParts[1];
          
          // إزالة أي شرطات مائلة زائدة في البداية
          const cleanPath = fullPath.replace(/^\/+/, '');
          
          // تقسيم المسار للحصول على أجزائه
          const pathParts = cleanPath.split('/');
          
          // إذا كان المسار يحتوي على اسم الحاوية كأول جزء، نزيله
          // لأن المفتاح يجب أن يكون بدون اسم الحاوية
          if (pathParts.length > 1 && pathParts[0] === 'uploadcarimages') {
            pathParts.shift(); // إزالة أول عنصر (اسم الحاوية)
          }
          
          // إعادة بناء المفتاح الصحيح
          const fileKey = pathParts.join('/');
          
          // فك تشفير المفتاح
          const decodedKey = decodeURIComponent(fileKey);
          
          // التحقق من أن المفتاح ليس فارغًا
          if (decodedKey && decodedKey.trim() !== '') {
            return decodedKey;
          }
        }
      }
    } catch (e) {
      console.warn('فشل في تحليل رابط الصورة:', url);
    }
    return null;
  };
  
  // المرور على جميع قيم السجل
  Object.entries(record).forEach(([key, value]) => {
    // التعامل مع القيم النصية
    if (typeof value === 'string') {
      const extractedKey = extractKeyFromUrl(value);
      if (extractedKey) {
        fileKeys.push(extractedKey);
      }
    } 
    // التعامل مع حقول الصور المتعددة مثل other_images
    else if (key === 'other_images' && Array.isArray(value)) {
      value.forEach(item => {
        if (typeof item === 'string') {
          const extractedKey = extractKeyFromUrl(item);
          if (extractedKey) {
            fileKeys.push(extractedKey);
          }
        }
      });
    }
  });
  
  console.log('المفاتيح المستخرجة:', fileKeys);
  return fileKeys;
};

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
    const createdAt = url.searchParams.get('createdAt')?.trim();
    const createdBeforeStr = url.searchParams.get('createdBefore')?.trim();
    const createdAfterStr = url.searchParams.get('createdAfter')?.trim();
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
    
    if (createdBeforeStr) {
      const date = new Date(createdBeforeStr);
      if (!isNaN(date.getTime())) {
        where.created_at = {
          lt: date,
        };
      }
    }

    if (createdAfterStr) {
      const date = new Date(createdAfterStr);
      if (!isNaN(date.getTime())) {
        where.created_at = {
          gte: date,
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
  } 
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { entryId, exitId } = body;

    if (!entryId) {
      return NextResponse.json(
        { error: 'entryId مطلوب' },
        { status: 400 }
      );
    }

    console.log(`بدء عملية حذف السجل - Entry ID: ${entryId}, Exit ID: ${exitId || 'غير موجود'}`);

    // 1. جلب بيانات السجلات أولاً لاستخراج روابط الصور
    const entryRecord = await prisma.contracts.findUnique({
      where: { id: entryId }
    });

    if (!entryRecord) {
      return NextResponse.json(
        { error: 'سجل الدخول غير موجود' },
        { status: 404 }
      );
    }

    let exitRecord = null;
    if (exitId) {
      exitRecord = await prisma.contracts.findUnique({
        where: { id: exitId }
      });
    }

    // 2. استخراج مفاتيح الملفات من كلا السجلين
    const allFileKeys: string[] = [];
    
    // استخراج الملفات من سجل الدخول
    const entryFileKeys = extractFileKeys(entryRecord);
    allFileKeys.push(...entryFileKeys);
    console.log(`تم العثور على ${entryFileKeys.length} ملف في سجل الدخول`);

    // استخراج الملفات من سجل الخروج (إن وجد)
    if (exitRecord) {
      const exitFileKeys = extractFileKeys(exitRecord);
      allFileKeys.push(...exitFileKeys);
      console.log(`تم العثور على ${exitFileKeys.length} ملف في سجل الخروج`);
    }

    console.log(`إجمالي الملفات المراد حذفها: ${allFileKeys.length}`);

    // 3. حذف جميع الصور من DigitalOcean أولاً
    if (allFileKeys.length > 0) {
      console.log('بدء حذف الصور من DigitalOcean...');
      
      // حذف الصور بشكل متسلسل (واحدة تلو الأخرى) للتحقق من نجاح كل عملية
      for (const fileKey of allFileKeys) {
        try {
          await deleteFileFromDO(fileKey);
          console.log(`تم حذف الملف بنجاح: ${fileKey}`);
        } catch (error) {
          console.error(`فشل حذف الملف ${fileKey}:`, error);
          // إرجاع خطأ فورًا إذا فشل حذف أي صورة
          return NextResponse.json(
            { 
              error: `فشل في حذف الصورة ${fileKey} من DigitalOcean. تم إلغاء عملية حذف السجل.`,
              failedFileKey: fileKey
            },
            { status: 500 }
          );
        }
      }
      
      console.log(`تم حذف جميع ${allFileKeys.length} ملف بنجاح من DigitalOcean`);
    }

   // في دالة DELETE، بعد حذف الصور بنجاح
// 4. حذف السجلات من قاعدة البيانات فقط إذا نجح حذف جميع الصور
await prisma.$transaction(async (tx) => {
  // حذف سجل الدخول
  await tx.contracts.delete({
    where: { id: entryId }
  });
  console.log(`تم حذف سجل الدخول ${entryId} من قاعدة البيانات`);

  // حذف سجل الخروج إذا كان موجوداً
  if (exitId) {
    // التحقق من وجود السجل أولاً
    const exitRecord = await tx.contracts.findUnique({
      where: { id: exitId }
    });
    
    if (exitRecord) {
      await tx.contracts.delete({
        where: { id: exitId }
      });
      console.log(`تم حذف سجل الخروج ${exitId} من قاعدة البيانات`);
    } else {
      console.log(`سجل الخروج ${exitId} غير موجود، تم تجاهل حذفه`);
    }
  }
});

    // 5. إرجاع النتيجة
    const message = `تم حذف السجل${exitId ? ' وسجل الخروج' : ''} و ${allFileKeys.length} صورة بنجاح`;
    return NextResponse.json(
      { 
        success: true, 
        message,
        deletedFiles: allFileKeys.length,
        failedFiles: 0,
        details: {
          entryDeleted: true,
          exitDeleted: !!exitId,
          totalFilesProcessed: allFileKeys.length,
          filesDeletedSuccessfully: allFileKeys.length,
          filesFailedToDelete: 0
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting contracts:', error);
    
    // إرجاع خطأ إذا فشل حذف أي صورة أو سجل
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف السجل: ' + (error as Error).message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}