import { NextRequest, NextResponse } from 'next/server';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

// إعداد بيانات DigitalOcean Spaces
const DO_ACCESS_KEY = process.env.DO_ACCESS_KEY || 'DO80192ACFDRB9F6LGW8'; // استخدام متغيرات البيئة
const DO_SECRET_KEY = process.env.DO_SECRET_KEY || 'd4DkpWlzchg7gBFxIoBjqFk0R2WXZZOY4lzV/ZOO7yM'; // استخدام متغيرات البيئة
const DO_SPACE_NAME = 'uploadcarimages';
const DO_REGION = 'sgp1';
const DO_ENDPOINT = `https://uploadcarimages.sgp1.digitaloceanspaces.com`;

// إعداد AWS SDK لـ DigitalOcean Spaces
const s3 = new AWS.S3({
  accessKeyId: DO_ACCESS_KEY,
  secretAccessKey: DO_SECRET_KEY,
  endpoint: DO_ENDPOINT,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb', // دعم ملفات تصل إلى 100 ميغابايت
    },
  },
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'لا يوجد ملف مرفق.' },
        { status: 400 }
      );
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'الملف ليس صورة صالحة. يرجى رفع ملف بصيغة JPEG أو PNG.' },
        { status: 400 }
      );
    }

    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'حجم الصورة كبير جدًا (الحد الأقصى 100 ميغابايت).' },
        { status: 400 }
      );
    }

    const fileName = `${uuidv4()}-${file.name}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const params = {
      Bucket: DO_SPACE_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
      ACL: 'public-read', // جعل الصورة عامة للوصول إليها
    };

    console.log(`Uploading ${fileName} to DigitalOcean Spaces...`);
    const uploadResult = await s3.upload(params).promise();
    console.log(`Uploaded ${fileName} to ${uploadResult.Location}`);

    return NextResponse.json({
      success: true,
      url: uploadResult.Location,
    });
  } catch (error: any) {
    console.error('Error uploading to DigitalOcean Spaces:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'فشل رفع الصورة إلى DigitalOcean Spaces.',
      },
      { status: 500 }
    );
  }
}
