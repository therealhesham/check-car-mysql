


// import { NextRequest, NextResponse } from 'next/server';
// import Airtable from 'airtable';
// import axios from 'axios';

// // Define interface for the request data
// interface AirtableRequestData {
//   fields: Record<string, string | string[]>;
// }

// // Define interface for Airtable record
// interface AirtableRecord {
//   id: string;
//   fields: Record<string, any>;
//   getId(): string;
// }

// // Configure API to accept JSON data
// export const config = {
//   api: {
//     bodyParser: {
//       sizeLimit: '50mb',
//     },
//   },
// };

// // Airtable configuration
// const airtableApiKey = 'patH4avQdGYSC0oz4.b2bc135c01c9c5c44cfa2d8595850d75189ea9b050661b9a1efb4e243bd44156';
// const airtableBaseId = 'app7Hc09WF8xul5T9';
// const airtableTableName = 'cheakcar';
// const base = new Airtable({ apiKey: airtableApiKey }).base(airtableBaseId);

// // دالة لرفع الصورة إلى imgBB
// async function uploadImageToImgBB(base64: string) {
//   try {
//     const base64Data = base64.split(',')[1];
//     const formData = new FormData();
//     formData.append('image', base64Data);

//     console.log('Uploading image to imgBB...');
//     const response = await axios.post('https://api.imgbb.com/1/upload', formData, {
//       params: {
//         key: '960012ec48fff9b7d8bf3fe19f460320',
//       },
//     });

//     console.log('imgBB response:', response.data);
//     return response.data.data.url;
//   } catch (error) {
//     console.error('Error uploading image to imgBB:', error);
//     throw new Error(`فشل في رفع الصورة إلى imgBB: ${error}`);
//   }
// }

// // Function to verify Airtable connection and table access
// async function verifyTableAccess(): Promise<boolean> {
//   try {
//     console.log(`Attempting to verify access to table: ${airtableTableName}`);
//     const records = await base(airtableTableName)
//       .select({
//         maxRecords: 1,
//       })
//       .firstPage();
//     console.log('Airtable table access verified successfully:', records.length, 'records retrieved');
//     return true;
//   } catch (error: any) {
//     console.error('Error verifying Airtable table access:', {
//       message: error.message,
//       status: error.status,
//       errorCode: error.error,
//       details: error.response?.data || error,
//     });
//     return false;
//   }
// }

// // دالة للتحقق من وجود سجل دخول سابق بنفس رقم العقد
// async function checkPreviousEntry(contractNumber: string): Promise<boolean> {
//   try {
//     // التحقق من أن contractNumber ليس فارغًا وهو رقم صحيح
//     if (!contractNumber || contractNumber.trim() === '') {
//       throw new Error('رقم العقد مطلوب ولا يمكن أن يكون فارغًا');
//     }

//     const contractNum = parseFloat(contractNumber);
//     if (isNaN(contractNum) || !Number.isInteger(contractNum)) {
//       throw new Error('رقم العقد يجب أن يكون رقمًا صحيحًا');
//     }

//     // بناء صيغة الفلتر بعناية
//     const filterFormula = `AND({العقد} = ${contractNum}, {نوع العملية} = "دخول")`;
//     console.log(`Filter formula for checking previous entry: ${filterFormula}`);

//     console.log(`Checking for previous entry with contract number: ${contractNum}`);
//     const records = await base(airtableTableName)
//       .select({
//         filterByFormula: filterFormula,
//         maxRecords: 1,
//       })
//       .firstPage();

//     console.log(`Found ${records.length} previous entry records for contract ${contractNum}`);
//     return records.length > 0;
//   } catch (error: any) {
//     console.error('Error checking previous entry:', {
//       message: error.message,
//       details: error.response?.data || error,
//       contractNumber,
//     });
//     throw new Error(`فشل في التحقق من سجل الدخول السابق: ${error.message}`);
//   }
// }

// // Direct upload to Airtable
// async function uploadDirectly(data: Record<string, string | string[]>): Promise<any> {
//   try {
//     console.log('Attempting direct upload...');
//     const hasAccess = await verifyTableAccess();
//     if (!hasAccess) {
//       throw new Error('INVALID_PERMISSIONS_OR_TABLE_NOT_FOUND');
//     }

//     // Validate and handle all fields
//     const fields: Record<string, any> = {};

//     for (const [key, value] of Object.entries(data)) {
//       if (key === 'العقد') {
//         const contractNum = parseFloat(value as string);
//         if (isNaN(contractNum)) {
//           throw new Error('حقل العقد يجب أن يكون رقمًا صالحًا');
//         }
//         fields[key] = contractNum;
//       } else if (key === 'صور اخرى' && Array.isArray(value)) {
//         if (!value.every((img) => img.startsWith('data:image/'))) {
//           throw new Error('جميع الصور في حقل صور اخرى يجب أن تكون بتنسيق Base64 صالح');
//         }
//         const imageUrls = await Promise.all(
//           value.map(async (img) => {
//             const url = await uploadImageToImgBB(img);
//             return { url, filename: `${key}_${Date.now()}.png` };
//           })
//         );
//         fields[key] = imageUrls;
//       } else if (typeof value === 'string' && fieldTitles.includes(key)) {
//         if (!value.startsWith('data:image/')) {
//           throw new Error(`الصورة في حقل ${key} يجب أن تكون بتنسيق Base64 صالح (يبدأ بـ data:image/)`);
//         }
//         const imageUrl = await uploadImageToImgBB(value);
//         fields[key] = [{ url: imageUrl, filename: `${key}_${Date.now()}.png` }];
//       } else if (key === 'الموظف' || key === 'الفرع') {
//         if (!value || (typeof value === 'string' && value.trim() === '')) {
//           throw new Error(`حقل ${key} لا يمكن أن يكون فارغًا`);
//         }
//         fields[key] = value;
//       } else {
//         fields[key] = value;
//       }
//     }

//     // Log the fields being sent to Airtable
//     console.log('Fields to Airtable:', JSON.stringify(fields, null, 2));

//     // Upload as a single record
//     const createdRecords = await base(airtableTableName).create([{ fields }]);

//     const recordId = createdRecords[0].id;
//     console.log('Created record with ID:', recordId);

//     return {
//       success: true,
//       recordId,
//       results: createdRecords.map((record: AirtableRecord) => ({
//         id: record.id,
//         fields: record.fields,
//       })),
//     };
//   } catch (error) {
//     console.error('Error in direct upload:', error);
//     throw error;
//   }
// }

// export async function POST(req: NextRequest) {
//   try {
//     const data = (await req.json()) as AirtableRequestData;
//     console.log('Processing data for upload...', Object.keys(data.fields).length, 'fields');

//     // Check if contract number is provided
//     if (!data.fields['العقد']) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'رقم العقد مطلوب.',
//           error: 'CONTRACT_NUMBER_REQUIRED',
//         },
//         { status: 400 }
//       );
//     }

//     // التحقق من وجود سجل دخول سابق
//     const contractNumber = data.fields['العقد'] as string;
//     const hasPreviousEntry = await checkPreviousEntry(contractNumber);
//     if (hasPreviousEntry) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'تم تسجيل عملية دخول لهذا العقد من قبل.',
//           error: 'PREVIOUS_ENTRY_EXISTS',
//         },
//         { status: 400 }
//       );
//     }

//     // Check if at least one image is provided
//     const hasImage = Object.entries(data.fields).some(([key, value]) =>
//       fieldTitles.includes(key) && (typeof value === 'string' ? value.startsWith('data:image/') : Array.isArray(value))
//     );
//     if (!hasImage) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'يجب تقديم صورة واحدة على الأقل.',
//           error: 'NO_IMAGES_PROVIDED',
//         },
//         { status: 400 }
//       );
//     }

//     // Check if employee and branch fields are present
//     if (!data.fields['الموظف'] || !data.fields['الفرع']) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'يجب تقديم بيانات الموظف والفرع.',
//           error: 'MISSING_EMPLOYEE_OR_BRANCH',
//         },
//         { status: 400 }
//       );
//     }

//     const result = await uploadDirectly(data.fields);
//     return NextResponse.json({
//       success: true,
//       message: 'تم رفع البيانات بنجاح!',
//       result,
//     });
//   } catch (error: any) {
//     console.error('Error processing upload:', error);
//     const errorMessage = error.message || String(error);
//     const statusCode =
//       error.message === 'INVALID_PERMISSIONS_OR_TABLE_NOT_FOUND'
//         ? 403
//         : typeof error.statusCode === 'number'
//         ? error.statusCode
//         : 500;
//     return NextResponse.json(
//       {
//         success: false,
//         message: 'حدث خطأ أثناء معالجة البيانات. يرجى المحاولة مرة أخرى لاحقاً.',
//         error: errorMessage,
//       },
//       { status: statusCode }
//     );
//   }
// }

// // Define fieldTitles for validation
// const fieldTitles = [
//   'العداد',
//   'الابواب اليمين مع توضيح السمكة',
//   'الرفرف الامامي يمين',
//   'الرفرف الخلفي يمين',
//   'الصدام الخلفي مع الانوار',
//   'سطح الشنطة مع الزجاج الخلفي',
//   'التندة',
//   'الرفرف الخلفي يسار',
//   'الابواب اليسار مع توضيح السمكة',
//   'الرفرف الامامي يسار',
//   'الصدام الامامي مع الشنب',
//   'الكبوت مع الشبك',
//   'الزجاج الامامي',
//   'محتويات الشنطة مع الاستبنة',
//   'طفاية الحريق',
//   'المقعد الامامي يمين',
//   'المقعد الامامي يسار',
//   'المقعد الخلفي مع خلفية المقاعد الامامية',
//   'صور اخرى',
// ];

import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';

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

    const filterFormula = `AND({العقد} = ${contractNum}, {نوع العملية} = "دخول")`;
    console.log(`Filter formula for checking previous entry: ${filterFormula}`);

    console.log(`Checking for previous entry with contract number: ${contractNum}`);
    const records = await base(airtableTableName)
      .select({
        filterByFormula: filterFormula,
        maxRecords: 1,
      })
      .firstPage();

    console.log(`Found ${records.length} previous entry records for contract ${contractNum}`);
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

    const createdRecords = await base(airtableTableName).create([{ fields }]);

    const recordId = createdRecords[0].id;
    console.log('Created record with ID:', recordId);

    return {
      success: true,
      recordId,
      results: createdRecords.map((record: AirtableRecord) => ({
        id: record.id,
        fields: record.fields,
      })),
    };
  } catch (error) {
    console.error('Error in direct upload:', error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = (await req.json()) as AirtableRequestData;
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
          error: 'PREVIOUS_ENTRY_EXISTS',
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
          error: 'NO_IMAGES_PROVIDED',
        },
        { status: 400 }
      );
    }

    if (!data.fields['الموظف'] || !data.fields['الفرع']) {
      return NextResponse.json(
        {
          success: false,
          message: 'يجب تقديم بيانات الموظف والفرع.',
          error: 'MISSING_EMPLOYEE_OR_BRANCH',
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
  'العداد',
  'الابواب اليمين مع توضيح السمكة',
  'الرفرف الامامي يمين',
  'الرفرف الخلفي يمين',
  'الصدام الخلفي مع الانوار',
  'سطح الشنطة مع الزجاج الخلفي',
  'التندة',
  'الرفرف الخلفي يسار',
  'الابواب اليسار مع توضيح السمكة',
  'الرفرف الامامي يسار',
  'الصدام الامامي مع الشنب',
  'الكبوت مع الشبك',
  'الزجاج الامامي',
  'محتويات الشنطة مع الاستبنة',
  'طفاية الحريق',
  'المقعد الامامي يمين',
  'المقعد الامامي يسار',
  'المقعد الخلفي مع خلفية المقاعد الامامية',
  'صور اخرى',
];