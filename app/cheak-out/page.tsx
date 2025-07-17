//@ts-nocheck
//@ts-nocheck

'use client';
function trimCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const imageData = ctx.getImageData(0, 0, width, height).data;

  let top = null, left = null, right = null, bottom = null;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) * 4;
      if (imageData[idx + 3] > 0) { // alpha > 0 means there's content
        if (top === null) top = y;
        if (left === null || x < left) left = x;
        if (right === null || x > right) right = x;
        bottom = y;
      }
    }
  }

  if (top === null) return canvas; // no content

  const trimmedWidth = right - left;
  const trimmedHeight = bottom - top;
  const trimmed = document.createElement('canvas');
  trimmed.width = trimmedWidth;
  trimmed.height = trimmedHeight;
  const trimmedCtx = trimmed.getContext('2d');
  trimmedCtx.drawImage(canvas, left, top, trimmedWidth, trimmedHeight, 0, 0, trimmedWidth, trimmedHeight);

  return trimmed;
}

import Navbar from '@/public/components/navbar';
import { useState, useRef, useEffect, RefCallback } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import imageCompression from 'browser-image-compression';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import SignaturePad from 'react-signature-canvas';
import { useRouter } from 'next/navigation';
import retry from 'async-retry';
import { FiRefreshCw } from 'react-icons/fi';
import { openDB } from 'idb';
import { toast } from 'react-toastify';

const sanitizeTitle = (title: string, index: number) => {
  const cleanTitle = title.replace(/\s+/g, '-').replace(/[^\u0600-\u06FF\w-]/g, '');
  return `${cleanTitle}-${index}`;
};

interface FileSection {
  id: string;
  imageUrls: string | string[] | null;
  title: string;
  multiple: boolean;
  previewUrls: string[];
  isUploading: boolean; // للتحكم في حالة الرفع العامة للقسم (غير مستخدم في الصور المتعددة)
  uploadProgress: number; // للتحكم في تقدم الرفع العام (غير مستخدم في الصور المتعددة)
  failedUploads?: { index: number; previewUrl: string }[]; // لتتبع الصور الفاشلة
  isUploadingImages?: boolean[]; // حالة الرفع لكل صورة (جديد)
  uploadProgresses?: number[]; // تقدم الرفع لكل صورة (جديد)
}


interface User {
  id: string;
  Name: string;
  EmID: number;
  role: string;
  branch: string;
  selectedBranch: string; // إضافة selectedBranch إلى الواجهة
}

interface Car {
  id: string;
  name: string;
}

interface Plate {
  id: string;
  name: string;
}

export default function UploadPage() {
  const fieldTitlesMap = {
    'rear_bumper_with_lights': 'الصدام الخلفي مع الانوار',
    'trunk_lid': 'سطح الشنطة مع الزجاج الخلفي',
    'trunk_contents': 'محتويات الشنطة مع الاستبنة',
    'roof': 'التندة',
    'rear_right_fender': 'الرفرف الخلفي يمين',
    'right_doors': 'الابواب اليمين مع توضيح السمكة',
    'front_right_fender': 'الرفرف الامامي يمين',
    'front_bumper': 'الصدام الامامي مع الشنب',
    'hoode': 'الكبوت مع الشبك',
    'front_windshield': 'الزجاج الامامي',
    'front_left_fender': 'الرفرف الامامي يسار',
    'left_doors': 'الابواب اليسار مع توضيح السمكة',
    'rear_left_fender': 'الرفرف الخلفي يسار',
    'front_left_seat': 'المقعد الامامي يسار',
    'front_right_seat': 'المقعد الامامي يمين',
    'rear_seat_with_front_seat_backs': 'المقعد الخلفي مع خلفية المقاعد الامامية',
    'fire_extinguisher': 'طفاية الحريق',
    'meter': 'العداد',
    'other_images': 'صور اخرى',
  };

  const fieldTitles = [
    'rear_bumper_with_lights',
    'trunk_lid',
    'trunk_contents',
    'roof',
    'rear_right_fender',
    'right_doors',
    'front_right_fender',
    'front_bumper',
    'hoode',
    'front_windshield',
    'front_left_fender',
    'left_doors',
    'rear_left_fender',
    'front_left_seat',
    'front_right_seat',
    'rear_seat_with_front_seat_backs',
    'fire_extinguisher',
    'meter',
    'other_images',
  ];

  // دالة لفتح قاعدة البيانات
async function openDatabase() {
  return openDB('carImagesDB', 1, {
    upgrade(db) {
      // إنشاء متجر كائنات إذا لم يكن موجودًا
      if (!db.objectStoreNames.contains('pendingUploads')) {
        db.createObjectStore('pendingUploads', { keyPath: 'id' });
      }
    },
  });
}

const initialFiles: FileSection[] = fieldTitles.map((title, index) => ({
  id: `file-section-${sanitizeTitle(title, index)}`,
  imageUrls: null,
  title: title,
  multiple: index === fieldTitles.length - 1,
  previewUrls: [],
  isUploading: false,
  uploadProgress: 0,
  failedUploads: [],
  isUploadingImages: [], // تهيئة مصفوفة فارغة
  uploadProgresses: [], // تهيئة مصفوفة فارغة
}));
  const [files, setFiles] = useState<FileSection[]>(initialFiles);
  const [car, setCar] = useState<string>('');
  const [carSearch, setCarSearch] = useState<string>('');
  const [cars, setCars] = useState<Car[]>([]);
  const [showCarList, setShowCarList] = useState<boolean>(false);
  const [plate, setPlate] = useState<string>('');
  const [plateSearch, setPlateSearch] = useState<string>('');
  const [plates, setPlates] = useState<Plate[]>([]);
  const [showPlateList, setShowPlateList] = useState<boolean>(false);
  const [contract, setContract] = useState<string>('');
  const [operationType] = useState<string>('خروج');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadMessage, setUploadMessage] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [hasExitRecord, setHasExitRecord] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLoadingCars, setIsLoadingCars] = useState<boolean>(true);
  const [isLoadingPlates, setIsLoadingPlates] = useState<boolean>(true);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [isSignatureEmpty, setIsSignatureEmpty] = useState<boolean>(true);
  const [meter_reading, setMeterReading] = useState<string>('');
  const [client_id, setClientId] = useState<string>('');
  const [client_name, setClientName] = useState<string>('');
  const router = useRouter();
  const [isSignatureLocked, setIsSignatureLocked] = useState<boolean>(false);
  const [clientIdError, setClientIdError] = useState<string>('');
  const [clientNameError, setClientNameError] = useState<string>('');

  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const carInputRef = useRef<HTMLDivElement>(null);
  const plateInputRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  // const uploadQueue = useRef<Promise<void>>(Promise.resolve());
  const signatureCanvasRef = useRef<SignaturePad>(null);
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (!parsedUser.selectedBranch) {
        // إذا لم يكن هناك فرع مختار، أعد التوجيه إلى تسجيل الدخول
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);


  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    fileInputRefs.current = Array(files.length).fill(null);
  }, [files.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (carInputRef.current && !carInputRef.current.contains(event.target as Node)) {
        setShowCarList(false);
      }
      if (plateInputRef.current && !plateInputRef.current.contains(event.target as Node)) {
        setShowPlateList(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (showToast && !hasExitRecord) {
      const timer = setTimeout(() => {
        setShowToast(false);
        setUploadMessage('');
        setIsSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast, hasExitRecord]);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (contract.trim()) {
      fetchPreviousRecord();
    } else {
      setHasExitRecord(false);
      setUploadMessage('');
      setShowToast(false);
    }
  }, [contract]);

  useEffect(() => {
    const fetchCars = async () => {
      setIsLoadingCars(true);
      try {
        const response = await fetch('/api/addcars', { method: 'GET' });
        const data = await response.json();
        if (data.success) {
          const fetchedCars = data.results.map((record: any) => ({
            id: record.id,
            name: record.fields.Name,
          }));
          setCars(fetchedCars);
        } else {
          setUploadMessage('فشل في جلب قائمة السيارات.');
          setShowToast(true);
        }
      } catch (error: any) {
        setUploadMessage('حدث خطأ أثناء جلب قائمة السيارات.');
        setShowToast(true);
      } finally {
        setIsLoadingCars(false);
      }
    };

    fetchCars();
  }, []);

  useEffect(() => {
    const fetchPlates = async () => {
      setIsLoadingPlates(true);
      try {
        const response = await fetch('/api/addlicense', { method: 'GET' });
        const data = await response.json();
        if (data.success) {
          const fetchedPlates = data.results.map((record: any) => ({
            id: record.id,
            name: record.fields.Name,
          }));
          setPlates(fetchedPlates);
        } else {
          setUploadMessage('فشل في جلب قائمة اللوحات.');
          setShowToast(true);
        }
      } catch (error: any) {
        setUploadMessage('حدث خطأ أثناء جلب قائمة اللوحات.');
        setShowToast(true);
      } finally {
        setIsLoadingPlates(false);
      }
    };

    fetchPlates();
  }, []);

  const restrictToLettersAndSpaces = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const char = e.key;
    const isLetterOrSpace = /^[a-zA-Z\u0600-\u06FF\s]$/.test(char);
    const isBackspace = e.key === 'Backspace';
    if (!isLetterOrSpace && !isBackspace) {
      e.preventDefault();
    }
  };

  const restrictToNumbers = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const charCode = e.charCode;
    if (charCode < 48 || charCode > 57) {
      e.preventDefault();
    }
  };

  const fetchPreviousRecord = async () => {
    if (!contract.trim()) {
      setHasExitRecord(false);
      setUploadMessage('رقم العقد مطلوب للبحث.');
      setShowToast(true);
      return;
    }

    setIsSearching(true);
    setUploadMessage('');

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`/api/history?contractNumber=${encodeURIComponent(contract)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `فشل في جلب السجل السابق (حالة: ${response.status})`);
      }

      const data = await response.json();
      if (data.length > 0) {
        const exitRecord = data.find((record) => record['operation_type'] === 'خروج');
        if (exitRecord) {
          setHasExitRecord(true);
          setUploadMessage('لا يمكن إضافة هذا التشييك لأنه تم تسجيل خروج لهذه السيارة لهذا العقد.');
          setShowToast(true);
        } else {
          setHasExitRecord(false);
        }
      } else {
        setHasExitRecord(false);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return;
      }
      setUploadMessage(err.message || 'حدث خطأ أثناء جلب السجل السابق.');
      setShowToast(true);
      setHasExitRecord(false);
    } finally {
      setIsSearching(false);
    }
  };

  const normalizeArabic = (text: string) => {
    if (typeof text !== 'string' || text == null) {
      return '';
    }

    return text
      .replace(/[\u0617-\u061A\u064B-\u065F]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const filteredCars = cars.filter((carItem) => {
    const normalizedCar = normalizeArabic(carItem.name).toLowerCase();
    const normalizedSearch = normalizeArabic(carSearch).toLowerCase();
    return normalizedCar.includes(normalizedSearch);
  });

  const filteredPlates = plates.filter((plateItem) => {
    const normalizedPlate = normalizeArabic(plateItem.name).toLowerCase();
    const normalizedSearch = normalizeArabic(plateSearch).toLowerCase();
    return normalizedPlate.includes(normalizedSearch);
  });

  const DO_ACCESS_KEY = process.env.NEXT_PUBLIC_DO_ACCESS_KEY;
  const DO_SECRET_KEY = process.env.NEXT_PUBLIC_DO_SECRET_KEY;
  const DO_SPACE_NAME = process.env.NEXT_PUBLIC_DO_SPACE_NAME;
  const DO_REGION = process.env.NEXT_PUBLIC_DO_REGION;
  const DO_ENDPOINT = process.env.NEXT_PUBLIC_DO_ENDPOINT;
  const s3 = new AWS.S3({
    accessKeyId: DO_ACCESS_KEY,
    secretAccessKey: DO_SECRET_KEY,
    endpoint: DO_ENDPOINT,
    s3ForcePathStyle: true,
    signatureVersion: 'v4',
  });

  const addDateTimeToImage = async (file: File): Promise<File> => {
    if (!file.type.startsWith('image/')) {
      throw new Error('الملف ليس صورة صالحة.');
    }
  
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
  
      reader.onload = (e) => {
        img.src = e.target?.result as string;
  
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('فشل في إنشاء سياق الرسم.'));
            return;
          }
  
          canvas.width = img.width;
          canvas.height = img.height;
  
          ctx.drawImage(img, 0, 0);
  
          const now = new Date();
          const dateTimeString = now.toLocaleString('ar-SA', {
            calendar: 'gregory',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          });
  
          ctx.font = '40px Arial';
          ctx.fillStyle = 'white';
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 3;
  
          const text = dateTimeString;
          const textWidth = ctx.measureText(text).width;
          const padding = 20;
          const textX = canvas.width - textWidth - padding;
          const textY = 40;
  
          ctx.strokeText(text, textX, textY);
          ctx.fillText(text, textX, textY);
  
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('فشل في تحويل الصورة إلى Blob.'));
                return;
              }
              const modifiedFile = new File([blob], `${uuidv4()}.webp`, { type: 'image/webp' });
              resolve(modifiedFile);
            },
            'image/webp',
            0.95 // زيادة الجودة إلى 0.95
          );
        };
  
        img.onerror = () => {
          reject(new Error('فشل في تحميل الصورة.'));
        };
      };
  
      reader.onerror = () => {
        reject(new Error('فشل في قراءة ملف الصورة.'));
      };
  
      reader.readAsDataURL(file);
    });
  };

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 5, // زيادة الحد الأقصى لحجم الملف إلى 5 ميغابايت
      maxWidthOrHeight: 1920, // زيادة الدقة القصوى إلى 1920 بكسل
      useWebWorker: true,
      fileType: 'image/webp',
      initialQuality: 0.95, // تحديد جودة أولية عالية
    };
  
    try {
      const compressedFile = await imageCompression(file, options);
      if (compressedFile.size > 32 * 1024 * 1024) {
        throw new Error('حجم الصورة المضغوطة كبير جدًا (الحد الأقصى 32 ميغابايت).');
      }
      const modifiedFile = await addDateTimeToImage(compressedFile);uploadImageToBackendWithRetry
      return modifiedFile;
    } catch (error) {
      console.error(error);
      throw new Error('فشل في معالجة الصورة: ' + error.message);
    }
  };
  
  const uploadImageToBackendWithRetry = async (file: File, retries: number = 3): Promise<string> => {
    return retry(
      async () => {
        const fileName = `${uuidv4()}.webp`;
        const buffer = Buffer.from(await file.arrayBuffer());
  
        const params = {
          Bucket: DO_SPACE_NAME,
          Key: fileName,
          Body: buffer,
          ContentType: 'image/webp',
          ACL: 'public-read',
        };
  
        const uploadResult = await s3.upload(params).promise();
        return uploadResult.Location;
      },
      {
        retries,
        factor: 2,
        minTimeout: 1000,
        maxTimeout: 5000,
        onRetry: (error) => {
          console.warn('Retrying upload due to:', error.message);
        },
      }
    );
  };

  const saveToLocalStorage = async (file: File, fileSectionId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // الحد الأقصى الجديد لحجم الصورة (20 ميغابايت)
    const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

    // التحقق من حجم الملف الأصلي
    if (file.size > MAX_SIZE) {
      reject(new Error(`حجم الصورة كبير جدًا للحفظ في IndexedDB (الحد الأقصى ${MAX_SIZE / (1024 * 1024)} ميغابايت).`));
      return;
    }

    // ضغط الصورة وتحويلها إلى WebP
    const options = {
      maxSizeMB: 20, // الحد الأقصى للحجم بعد الضغط
      maxWidthOrHeight: 1920, // الحفاظ على الدقة القصوى
      useWebWorker: true,
      fileType: 'image/webp', // تحويل إلى WebP
      initialQuality: 0.95, // جودة عالية
    };

    imageCompression(file, options)
      .then(async (compressedFile) => {
        // التحقق من حجم الملف المضغوط
        if (compressedFile.size > MAX_SIZE) {
          reject(new Error(`حجم الصورة المضغوطة كبير جدًا للحفظ في IndexedDB (الحد الأقصى ${MAX_SIZE / (1024 * 1024)} ميغابايت).`));
          return;
        }

        try {
          // فتح قاعدة البيانات
          const db = await openDatabase();
          // حفظ الصورة كـ Blob في IndexedDB
          await db.put('pendingUploads', {
            id: `pending-upload-${fileSectionId}`,
            file: compressedFile,
          });
          db.close();
          resolve();
        } catch (error) {
          reject(new Error('فشل في حفظ الصورة مؤقتًا في IndexedDB: ' + error.message));
        }
      })
      .catch((error) => {
        reject(new Error('فشل في ضغط الصورة: ' + error.message));
      });
  });
};
  
const getFromLocalStorage = async (fileSectionId: string): Promise<File | null> => {
  try {
    const db = await openDatabase();
    const data = await db.get('pendingUploads', `pending-upload-${fileSectionId}`);
    db.close();
    if (!data || !data.file) {
      return null;
    }
    // إنشاء ملف File من Blob
    return new File([data.file], `${fileSectionId}.webp`, { type: 'image/webp' });
  } catch (error) {
    console.error('فشل في استرجاع الصورة من IndexedDB:', error);
    return null;
  }
};
  
const clearFromLocalStorage = async (fileSectionId: string): Promise<void> => {
  try {
    const db = await openDatabase();
    await db.delete('pendingUploads', `pending-upload-${fileSectionId}`);
    db.close();
  } catch (error) {
    console.error('فشل في حذف الصورة من IndexedDB:', error);
  }
};


  const handleFileChange = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
  
    const file = e.target.files[0];
    const localPreviewUrl = URL.createObjectURL(file);
  
    // تحديث واجهة المستخدم لعرض المعاينة
    setFiles((prevFiles) =>
      prevFiles.map((fileSection) =>
        fileSection.id === id
          ? {
              ...fileSection,
              previewUrls: [localPreviewUrl],
              imageUrls: null,
              isUploading: true,
              uploadProgress: 0,
              failedUploads: [{ index: 0, previewUrl: localPreviewUrl }],
            }
          : fileSection
      )
    );
  
    // حفظ الصورة في localStorage كإجراء احتياطي
    try {
      await saveToLocalStorage(file, id);
    } catch (error: any) {
      setUploadMessage('فشل في حفظ الصورة مؤقتًا: ' + error.message);
      setShowToast(true);
      setFiles((prevFiles) =>
        prevFiles.map((fileSection) =>
          fileSection.id === id
            ? { ...fileSection, previewUrls: [], isUploading: false, uploadProgress: 0, failedUploads: [] }
            : fileSection
        )
      );
      URL.revokeObjectURL(localPreviewUrl);
      return;
    }
  
    // محاولة ضغط الصورة ورفعها
    try {
      setFiles((prevFiles) =>
        prevFiles.map((fileSection) =>
          fileSection.id === id ? { ...fileSection, uploadProgress: 30 } : fileSection
        )
      );
  
      const compressedFile = await compressImage(file);
  
      setFiles((prevFiles) =>
        prevFiles.map((fileSection) =>
          fileSection.id === id ? { ...fileSection, uploadProgress: 60 } : fileSection
        )
      );
  
      const imageUrl = await uploadImageToBackendWithRetry(compressedFile);
  
      setFiles((prevFiles) =>
        prevFiles.map((fileSection) =>
          fileSection.id === id
            ? {
                ...fileSection,
                imageUrls: imageUrl,
                previewUrls: [imageUrl],
                isUploading: false,
                uploadProgress: 100,
                failedUploads: [],
              }
            : fileSection
        )
      );
  
      clearFromLocalStorage(id); // إزالة الصورة من localStorage بعد الرفع الناجح
      URL.revokeObjectURL(localPreviewUrl);
  
      const index = files.findIndex((fileSection) => fileSection.id === id);
      if (fileInputRefs.current[index]) {
        fileInputRefs.current[index]!.value = '';
      }
    } catch (error: any) {
      let errorMessage = 'حدث خطأ أثناء رفع الصورة. الصورة محفوظة مؤقتًا ويمكن إعادة المحاولة لاحقًا.';
      if (error.message.includes('Rate limit')) {
        errorMessage = 'تم تجاوز حد رفع الصور. الصورة محفوظة مؤقتًا.';
      } else if (error.message.includes('ضغط')) {
        errorMessage = 'فشل في ضغط الصورة. الصورة محفوظة مؤقتًا.';
      }
      setUploadMessage(errorMessage);
      setShowToast(true);
      setFiles((prevFiles) =>
        prevFiles.map((fileSection) =>
          fileSection.id === id
            ? { ...fileSection, isUploading: false, uploadProgress: 0 }
            : fileSection
        )
      );
    }
  };

  const retryUpload = async (fileSectionId: string, index?: number): Promise<void> => {
    const uniqueId = index !== undefined ? `${fileSectionId}-${index}` : fileSectionId;
    const file = await getFromLocalStorage(uniqueId);
    if (!file) {
      setUploadMessage('لا توجد صورة محفوظة لإعادة المحاولة.');
      setShowToast(true);
      toast.error('لا توجد صورة محفوظة لإعادة المحاولة.');
      return;
    }
  
    setFiles((prevFiles) =>
      prevFiles.map((fileSection) =>
        fileSection.id === fileSectionId
          ? {
              ...fileSection,
              isUploadingImages: fileSection.isUploadingImages?.map((status, i) =>
                i === index ? true : status
              ) || (index !== undefined ? [true] : []),
              uploadProgresses: fileSection.uploadProgresses?.map((progress, i) =>
                i === index ? 0 : progress
              ) || (index !== undefined ? [0] : []),
            }
          : fileSection
      )
    );
  
    let localPreviewUrl = '';
    try {
      localPreviewUrl = URL.createObjectURL(file);
  
      setFiles((prevFiles) =>
        prevFiles.map((fileSection) =>
          fileSection.id === fileSectionId
            ? {
                ...fileSection,
                previewUrls: index !== undefined ? [...fileSection.previewUrls] : [localPreviewUrl],
                uploadProgresses: fileSection.uploadProgresses?.map((progress, i) =>
                  i === index ? 30 : progress
                ) || (index !== undefined ? [30] : []),
              }
            : fileSection
        )
      );
  
      const compressedFile = await compressImage(file);
  
      setFiles((prevFiles) =>
        prevFiles.map((fileSection) =>
          fileSection.id === fileSectionId
            ? {
                ...fileSection,
                uploadProgresses: fileSection.uploadProgresses?.map((progress, i) =>
                  i === index ? 60 : progress
                ) || (index !== undefined ? [60] : []),
              }
            : fileSection
        )
      );
  
      const imageUrl = await uploadImageToBackendWithRetry(compressedFile);
  
      setFiles((prevFiles) =>
        prevFiles.map((fileSection) => {
          if (fileSection.id === fileSectionId) {
            if (fileSection.multiple) {
              const updatedPreviewUrls = [...(fileSection.previewUrls || [])];
              if (index !== undefined && updatedPreviewUrls[index]) {
                updatedPreviewUrls[index] = imageUrl;
              } else {
                updatedPreviewUrls.push(imageUrl);
              }
  
              return {
                ...fileSection,
                imageUrls: [
                  ...(Array.isArray(fileSection.imageUrls) ? fileSection.imageUrls : []),
                  imageUrl,
                ],
                previewUrls: updatedPreviewUrls,
                failedUploads: (fileSection.failedUploads || []).filter(
                  (failed) => failed.index !== (index ?? 0)
                ),
                isUploadingImages: fileSection.isUploadingImages?.map((status, i) =>
                  i === index ? false : status
                ) || [],
                uploadProgresses: fileSection.uploadProgresses?.map((progress, i) =>
                  i === index ? 100 : progress
                ) || (index !== undefined ? [100] : []),
              };
            } else {
              return {
                ...fileSection,
                imageUrls: imageUrl,
                previewUrls: [imageUrl],
                isUploading: false,
                uploadProgress: 100,
                failedUploads: [],
                isUploadingImages: [],
                uploadProgresses: [100],
              };
            }
          }
          return fileSection;
        })
      );
  
      await clearFromLocalStorage(uniqueId);
      setUploadMessage('تم إعادة رفع الصورة بنجاح.');
      setShowToast(true);
      toast.success('تم إعادة رفع الصورة بنجاح.');
      URL.revokeObjectURL(localPreviewUrl);
    } catch (error: any) {
      setUploadMessage('فشل إعادة رفع الصورة: ' + error.message);
      setShowToast(true);
      toast.error('فشل إعادة رفع الصورة: ' + error.message);
      setFiles((prevFiles) =>
        prevFiles.map((fileSection) =>
          fileSection.id === fileSectionId
            ? {
                ...fileSection,
                isUploadingImages: fileSection.isUploadingImages?.map((status, i) =>
                  i === index ? false : status
                ) || [],
                uploadProgresses: fileSection.uploadProgresses?.map((progress, i) =>
                  i === index ? 0 : progress
                ) || [],
              }
            : fileSection
        )
      );
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    }
  };

  const handleMultipleFileChange = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
  
    const selectedFiles = Array.from(e.target.files);
    const localPreviewUrls = selectedFiles.map((file) => URL.createObjectURL(file));
    const startIndex = files.find((fileSection) => fileSection.id === id)?.previewUrls.length || 0;
  
    // تحديث واجهة المستخدم لإضافة المعاينات وتهيئة حالات الرفع
    setFiles((prevFiles) =>
      prevFiles.map((fileSection) =>
        fileSection.id === id
          ? {
              ...fileSection,
              previewUrls: [...fileSection.previewUrls, ...localPreviewUrls],
              failedUploads: [
                ...(fileSection.failedUploads || []),
                ...localPreviewUrls.map((url, idx) => ({ index: startIndex + idx, previewUrl: url })),
              ],
              isUploadingImages: [...(fileSection.isUploadingImages || []), ...selectedFiles.map(() => true)],
              uploadProgresses: [...(fileSection.uploadProgresses || []), ...selectedFiles.map(() => 0)],
            }
          : fileSection
      )
    );
  
    // معالجة كل صورة بشكل مستقل
    const uploadPromises = selectedFiles.map(async (file, index) => {
      const uniqueId = `${id}-${startIndex + index}`; // معرف فريد لكل صورة
  
      // حفظ الصورة في IndexedDB
      try {
        await saveToLocalStorage(file, uniqueId);
      } catch (error: any) {
        setUploadMessage(`فشل في حفظ الصورة ${index + 1} مؤقتًا: ${error.message}`);
        setShowToast(true);
        setFiles((prevFiles) =>
          prevFiles.map((fileSection) =>
            fileSection.id === id
              ? {
                  ...fileSection,
                  isUploadingImages: fileSection.isUploadingImages?.map((status, i) =>
                    i === startIndex + index ? false : status
                  ),
                  uploadProgresses: fileSection.uploadProgresses?.map((progress, i) =>
                    i === startIndex + index ? 0 : progress
                  ),
                }
              : fileSection
          )
        );
        return { index: startIndex + index, url: null };
      }
  
      try {
        // تحديث تقدم الضغط
        setFiles((prevFiles) =>
          prevFiles.map((fileSection) =>
            fileSection.id === id
              ? {
                  ...fileSection,
                  uploadProgresses: fileSection.uploadProgresses?.map((progress, i) =>
                    i === startIndex + index ? 30 : progress
                  ),
                }
              : fileSection
          )
        );
  
        const compressedFile = await compressImage(file);
  
        // تحديث تقدم الرفع
        setFiles((prevFiles) =>
          prevFiles.map((fileSection) =>
            fileSection.id === id
              ? {
                  ...fileSection,
                  uploadProgresses: fileSection.uploadProgresses?.map((progress, i) =>
                    i === startIndex + index ? 60 : progress
                  ),
                }
              : fileSection
          )
        );
  
        const imageUrl = await uploadImageToBackendWithRetry(compressedFile);
  
        // تحديث الحالة بعد الرفع الناجح
        setFiles((prevFiles) =>
          prevFiles.map((fileSection) =>
            fileSection.id === id
              ? {
                  ...fileSection,
                  imageUrls: [
                    ...(Array.isArray(fileSection.imageUrls) ? fileSection.imageUrls : []),
                    imageUrl,
                  ],
                  failedUploads: fileSection.failedUploads?.filter(
                    (failed) => failed.index !== startIndex + index
                  ),
                  isUploadingImages: fileSection.isUploadingImages?.map((status, i) =>
                    i === startIndex + index ? false : status
                  ),
                  uploadProgresses: fileSection.uploadProgresses?.map((progress, i) =>
                    i === startIndex + index ? 100 : progress
                  ),
                }
              : fileSection
          )
        );
  
        clearFromLocalStorage(uniqueId); // إزالة الصورة بعد الرفع الناجح
        return { index: startIndex + index, url: imageUrl };
      } catch (error: any) {
        setUploadMessage(
          `فشل رفع الصورة ${index + 1}. الصورة محفوظة مؤقتًا ويمكن إعادة المحاولة لاحقًا.`
        );
        setShowToast(true);
        setFiles((prevFiles) =>
          prevFiles.map((fileSection) =>
            fileSection.id === id
              ? {
                  ...fileSection,
                  isUploadingImages: fileSection.isUploadingImages?.map((status, i) =>
                    i === startIndex + index ? false : status
                  ),
                  uploadProgresses: fileSection.uploadProgresses?.map((progress, i) =>
                    i === startIndex + index ? 0 : progress
                  ),
                }
              : fileSection
          )
        );
        return { index: startIndex + index, url: null };
      }
    });
  
    // تشغيل الرفع في الخلفية دون انتظار
    uploadPromises.forEach((promise, index) =>
      promise.then((result) => {
        if (result.url) {
          URL.revokeObjectURL(localPreviewUrls[index]); // إلغاء معاينة الصورة الناجحة
        }
      })
    );
  
    const index = files.findIndex((fileSection) => fileSection.id === id);
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index]!.value = '';
    }
  };
  const deleteFile = (fileKey: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const params = {
        Bucket: 'uploadcarimages',
        Key: fileKey,
      };

      s3.deleteObject(params, (err, data) => {
        if (err) {
          reject(new Error(`فشل في حذف الملف: ${fileKey}`));
        } else {
          resolve();
        }
      });
    });
  };

  const removePreviewImage = async (fileId: string, previewIndex: number) => {
    let fileKeyToDelete: string | null = null;
  
    // تحديث الحالة أولاً
    setFiles((prevFiles) =>
      prevFiles.map((fileSection) => {
        if (fileSection.id === fileId) {
          const updatedPreviews = [...fileSection.previewUrls];
          const deletedPreviewUrl = updatedPreviews.splice(previewIndex, 1)[0];
          let updatedImageUrls = fileSection.imageUrls;
  
          // فقط استخراج المفتاح هنا، بدون await
          if (deletedPreviewUrl) {
            try {
              const urlParts = deletedPreviewUrl.split('/');
              fileKeyToDelete = urlParts[urlParts.length - 1];
            } catch (error) {
              
            }
          }
  
          if (Array.isArray(updatedImageUrls)) {
            updatedImageUrls = [...updatedImageUrls];
            updatedImageUrls.splice(previewIndex, 1);
          } else if (previewIndex === 0) {
            updatedImageUrls = null;
          }
  
          const updatedFailedUploads = fileSection.failedUploads
            ? fileSection.failedUploads
                .filter((failed) => failed.index !== previewIndex)
                .map((failed, idx) => ({ ...failed, index: idx }))
            : [];
  
          if (fileSection.multiple) {
            clearFromLocalStorage(`${fileSection.id}-${previewIndex}`);
          } else {
            clearFromLocalStorage(fileSection.id);
          }
  
          return {
            ...fileSection,
            previewUrls: updatedPreviews,
            imageUrls: updatedImageUrls,
            failedUploads: updatedFailedUploads,
          };
        }
        return fileSection;
      })
    );
  
    // حذف الملف من السيرفر بعد التعديل
    if (fileKeyToDelete) {
      try {
        await deleteFile(fileKeyToDelete);
        
      } catch (err) {
        
      }
    }
  
    const index = files.findIndex((fileSection) => fileSection.id === fileId);
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index]!.value = '';
    }
  };
  

  const setInputRef = (index: number): RefCallback<HTMLInputElement> => {
    return (element: HTMLInputElement | null) => {
      fileInputRefs.current[index] = element;
    };
  };

  const handleCarSelect = (selectedCar: string) => {
    setCar(selectedCar);
    setCarSearch(selectedCar);
    setShowCarList(false);
  };
  const getCar = async (plate) => {
    // alert(plate)
    const getCarType = await fetch('/api/getlicense', {
      method: 'post', headers: {
        'Content-Type': 'application/json'
      }, body: JSON.stringify({ plate: plate })
    });
    const data = await getCarType.json();
    setCarSearch(data.result.fields)
    setCar(data.result.fields);
  }
  // alert(car)
  const handlePlateSelect = (selectedPlate: string) => {
    getCar(selectedPlate)
    setPlate(selectedPlate);
    setPlateSearch(selectedPlate);
    setShowPlateList(false);
  };
  const handleSaveSignature = async () => {
    try {
      if (!signatureCanvasRef.current) return;
  
      if (signatureCanvasRef.current.isEmpty()) {
        setUploadMessage('يرجى رسم التوقيع قبل الحفظ.');
        setShowToast(true);
        return;
      }
  
      const rawCanvas = signatureCanvasRef.current.getCanvas();
      const trimmedCanvas = trimCanvas(rawCanvas);
  
      const dataUrl = trimmedCanvas.toDataURL('image/webp', 0.95); // زيادة الجودة إلى 0.95
      const response = await fetch(dataUrl);
      const blob = await response.blob();
  
      const signatureFile = new File([blob], `${uuidv4()}.webp`, { type: 'image/webp' });
  
      const options = {
        maxSizeMB: 5, // زيادة الحد الأقصى لحجم التوقيع
        maxWidthOrHeight: 1920, // زيادة الدقة القصوى
        useWebWorker: true,
        fileType: 'image/webp',
        initialQuality: 0.95, // جودة أولية عالية
      };
      const compressedSignature = await imageCompression(signatureFile, options);
      const modifiedFile = await addDateTimeToImage(compressedSignature);
  
      const uploadedSignatureUrl = await uploadImageToBackendWithRetry(modifiedFile);
  
      setSignatureUrl(uploadedSignatureUrl);
      setIsSignatureLocked(true);
      setUploadMessage('تم حفظ التوقيع بنجاح.');
      setShowToast(true);
    } catch (error: any) {
      console.error('Error saving signature:', error);
      setUploadMessage('فشل في حفظ التوقيع: ' + error.message);
      setShowToast(true);
    }
  };

  const handleClearSignature = () => {
    if (signatureCanvasRef.current) {
      signatureCanvasRef.current.clear();
      setIsSignatureEmpty(true);
      setSignatureUrl(null);
      setIsSignatureLocked(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (clientIdError) {
      setUploadMessage('يرجى تصحيح رقم الهوية. يجب أن يكون 10 أرقام بالضبط.');
      setShowToast(true);
      return;
    }

    if (!contract.trim() || !plate.trim()) {
      setUploadMessage('يرجى ملء جميع الحقول المطلوبة.');
      setShowToast(true);
      return;
    }

    if (!/^\d+$/.test(contract.trim())) {
      setUploadMessage('رقم العقد يجب أن يحتوي على أرقام فقط.');
      setShowToast(true);
      return;
    }

    const contractNum = parseFloat(contract);
    if (isNaN(contractNum)) {
      setUploadMessage('رقم العقد يجب أن يكون رقمًا صالحًا.');
      setShowToast(true);
      return;
    }

    if (hasExitRecord) {
      setUploadMessage('لا يمكن إضافة هذا التشييك لأنه تم تسجيل خروج لهذه السيارة لهذا العقد.');
      setShowToast(true);
      return;
    }

    if (!signatureUrl) {
      setUploadMessage('يرجى حفظ التوقيع قبل إرسال البيانات.');
      setShowToast(true);
      return;
    }

    const requiredImages = files.filter((fileSection) => fileSection.title !== 'other_images');
    const hasAnyRequiredImage = requiredImages.some((fileSection) => {
      if (fileSection.imageUrls === null) return false;
      if (Array.isArray(fileSection.imageUrls)) return fileSection.imageUrls.length > 0;
      return fileSection.imageUrls !== '';
    });
    if (!hasAnyRequiredImage) {
      setUploadMessage('يرجى رفع الصور المطلوبة.');
      setShowToast(true);
      return;
    }

    const missingImages = requiredImages.filter((fileSection) => {
      if (fileSection.imageUrls === null) return true;
      if (Array.isArray(fileSection.imageUrls)) return fileSection.imageUrls.length === 0;
      return fileSection.imageUrls === '';
    });
    if (missingImages.length > 0) {
      setUploadMessage(
        `يجب رفع صورة واحدة على الأقل لكل من: ${missingImages
          .map((f) => fieldTitlesMap[f.title])
          .join(', ')}.`
      );
      setShowToast(true);
      return;
    }

    const isAnyUploading = files.some((fileSection) => fileSection.isUploading);
    if (isAnyUploading) {
      setUploadMessage('يرجى الانتظار حتى يكتمل رفع جميع الصور.');
      setShowToast(true);
      return;
    }

    if (!user || !user.Name || !user.selectedBranch) {
      setUploadMessage('بيانات الموظف أو الفرع غير متوفرة. يرجى تسجيل الدخول مرة أخرى.');
      setShowToast(true);
      router.push('/login');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setIsSuccess(false);

    try {
      const airtableData = {
        fields: {} as Record<string, string | string[]>,
      };

      airtableData.fields['السيارة'] = car;
      airtableData.fields['اللوحة'] = plate;
      airtableData.fields['العقد'] = contractNum.toString();
      airtableData.fields['نوع العملية'] = operationType;
      airtableData.fields['الموظف'] = user.Name;
      airtableData.fields['الفرع'] = user.selectedBranch;
      airtableData.fields['client_id'] = client_id;
      airtableData.fields['meter_reading'] = meter_reading;
      airtableData.fields['client_name'] = client_name;
      airtableData.fields['signature_url'] = signatureUrl;

      files.forEach((fileSection) => {
        if (fileSection.imageUrls) {
          airtableData.fields[fileSection.title] = fileSection.imageUrls;
        }
      });

      setUploadProgress(30);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);

      try {
        const response = await fetch('/api/cheakout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(airtableData),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        setUploadProgress(90);

        const result = await response.json();

        if (result.success) {
          setUploadProgress(100);
          setIsSuccess(true);
          setShowToast(true);
          setUploadMessage('تم بنجاح رفع التشييك');
          setFiles(
            fieldTitles.map((title, index) => ({
              id: `file-section-${sanitizeTitle(title, index)}`,
              imageUrls: null,
              title: title,
              multiple: index === fieldTitles.length - 1,
              previewUrls: [],
              isUploading: false,
              uploadProgress: 0,
            }))
          );
          setCar('');
          setCarSearch('');
          setPlate('');
          setPlateSearch('');
          setContract('');
          setMeterReading('');
          setClientId('');
          setClientName('');
          setHasExitRecord(false);
          setSignatureUrl(null);
          setIsSignatureLocked(false); // إلغاء قفل التوقيع بعد الإرسال
          if (signatureCanvasRef.current) {
            signatureCanvasRef.current.clear();
            setIsSignatureEmpty(true);
          }
          fileInputRefs.current.forEach((ref, index) => {
            if (ref) {
              ref.value = '';
            }
          });
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } else {
          throw new Error(result.error || result.message || 'حدث خطأ أثناء رفع البيانات');
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          setUploadMessage('انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.');
        } else {
          setUploadMessage(
            `فشلت عملية الرفع: ${fetchError.message || 'يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.'}`
          );
        }
        setUploadProgress(0);
        setShowToast(true);
      }
    } catch (error: any) {
      setUploadMessage(error.message || 'حدث خطأ أثناء تجهيز البيانات للرفع.');
      setShowToast(true);
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div dir="rtl" className={`relative ${isDarkMode ? 'dark' : ''}`}>
      <Navbar />
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-2 transition-colors duration-200">
        <div className="flex justify-center items-center">
          <div className="w-full max-w-4xl p-3 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h1 className="text-xl sm:text-2xl font-semibold text-center text-gray-900 dark:text-gray-100 mb-4">
              رفع بيانات تشييك الخروج
            </h1>
            <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-300">
            </p>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">

                <div ref={plateInputRef} className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    اللوحة *
                  </label>
                  {isLoadingPlates ? (
                    <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                      جاري تحميل قائمة اللوحات...
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={plateSearch}
                      onChange={(e) => {

                        setPlateSearch(e.target.value);
                        setShowPlateList(true);

                      }}

                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' || e.key === 'Delete') {
                          setPlateSearch('');
                          setCar('');
                          setCarSearch('');
                        }
                      }}

                      onFocus={() => setShowPlateList(true)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="ابحث عن اللوحة"
                      required
                    />
                  )}
                  {showPlateList && filteredPlates.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                      {filteredPlates.map((plateItem) => (
                        <li
                          key={plateItem.id}
                          onClick={() => handlePlateSelect(plateItem.name)}
                          className="px-3 py-2 hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer text-sm text-gray-900 dark:text-gray-100"
                        >
                          {plateItem.name}
                        </li>
                      ))}
                    </ul>
                  )}
                  {showPlateList && plateSearch && filteredPlates.length === 0 && (
                    <div className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg p-3 text-sm text-gray-500 dark:text-gray-400">
                      لا توجد لوحات مطابقة
                    </div>
                  )}
                </div>
                <div ref={carInputRef} className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    السيارة *
                  </label>
                  {isLoadingCars ? (
                    <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                      جاري تحميل قائمة السيارات...
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={plateSearch ? carSearch : ""}
                      // onChange={(e) => {
                      //   setCarSearch(e.target.value);
                      // color='gray'
                      style={{ backgroundColor: 'lightgray' }}
                      //   setShowCarList(true);
                      // }}
                      onFocus={() => setShowCarList(true)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      // placeholder="اختر اللو"
                      readOnly
                      required
                    />
                  )}
                  {/* {showCarList && filteredCars.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                      {filteredCars.map((carItem) => (
                        <li
                          key={carItem.id}
                          onClick={() => handleCarSelect(carItem.name)}
                          className="px-3 py-2 hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer text-sm text-gray-900 dark:text-gray-100"
                        >
                          {carItem.name}
                        </li>
                      ))}
                    </ul>
                  )} */}
                  {/* {showCarList && carSearch && filteredCars.length === 0 && (
                    <div className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg p-3 text-sm text-gray-500 dark:text-gray-400">
                      لا توجد سيارات مطابقة
                    </div>
                  )} */}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    العقد *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={contract}
                    onChange={(e) => setContract(e.target.value)}
                    onKeyPress={restrictToNumbers}
                    className={`w-full px-3 py-2 border ${hasExitRecord ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                    placeholder="أدخل رقم العقد"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    قراءة العداد *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={meter_reading}
                    onChange={(e) => setMeterReading(e.target.value)}
                    onKeyPress={restrictToNumbers}
                    className={`w-full px-3 py-2 border ${hasExitRecord ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                    placeholder="أدخل رقم قراءة العداد"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    اسم العميل *
                  </label>
                  <input
                    type="text"
                    value={client_name}
                    onChange={(e) => {
                      const value = e.target.value;
                      const isValid = /^[a-zA-Z\u0600-\u06FF\s]*$/.test(value);
                      setClientName(value);
                      if (!isValid && value.length > 0) {
                        setClientNameError('اسم العميل يجب أن يحتوي على حروف ومسافات فقط.');
                      } else {
                        setClientNameError('');
                      }
                    }}
                    onKeyPress={restrictToLettersAndSpaces}
                    className={`w-full px-3 py-2 border ${hasExitRecord || clientNameError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                    placeholder="أدخل اسم العميل"
                    required
                  />
                  {clientNameError && (
                    <p className="text-red-500 text-xs mt-1">{clientNameError}</p>
                  )}
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 mt-2">
                    رقم الهوية *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={client_id}
                    onChange={(e) => {
                      const value = e.target.value;
                      setClientId(value);
                      if (value.length !== 10 && value.length > 0) {
                        setClientIdError('رقم الهوية يجب أن يكون 10 أرقام بالضبط.');
                      } else {
                        setClientIdError('');
                      }
                    }}
                    onKeyPress={restrictToNumbers}
                    className={`w-full px-3 py-2 border ${hasExitRecord || clientIdError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                    placeholder="أدخل رقم الهوية"
                    required
                  />
                  {clientIdError && (
                    <p className="text-red-500 text-xs mt-1">{clientIdError}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    نوع العملية
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                    {operationType}
                  </div>
                </div>
              </div>


              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
              {files.map((fileSection, index) => (
  <div key={fileSection.id} className="mb-3">
    <div className="font-semibold text-gray-800 dark:text-gray-100 text-base mb-1">
      {fieldTitlesMap[fileSection.title] !== 'صور اخرى'
        ? fieldTitlesMap[fileSection.title] + ' *'
        : fieldTitlesMap[fileSection.title]}
    </div>
    <div
      className={`relative border-2 border-gray-300 dark:border-gray-600 rounded-md p-2 ${
        fileSection.multiple ? 'min-h-[112px] sm:min-h-[128px]' : 'h-20 sm:h-24'
      }`}
    >
      {fileSection.previewUrls && fileSection.previewUrls.length > 0 ? (
        fileSection.multiple ? (
          fileSection.title === 'other_images' ? (
            <div className="grid grid-cols-2 gap-2">
              {fileSection.previewUrls.map((previewUrl, previewIndex) => (
                <div key={previewUrl} className="relative h-20 sm:h-24">
                  <img
                    src={previewUrl}
                    alt={`صورة ${previewIndex + 1}`}
                    className="h-full w-full object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removePreviewImage(fileSection.id, previewIndex)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md"
                    aria-label="حذف الصورة"
                  >
                    <span className="text-lg font-bold">×</span>
                  </button>
                  {fileSection.failedUploads?.some((failed) => failed.index === previewIndex) && (
                    <button
                      type="button"
                      onClick={() => retryUpload(fileSection.id, previewIndex)}
                      className="absolute top-0 left-0 bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md"
                      aria-label="إعادة محاولة رفع الصورة"
                    >
                      <FiRefreshCw className="text-sm" />
                    </button>
                  )}
                  {fileSection.isUploadingImages?.[previewIndex] && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${fileSection.uploadProgresses?.[previewIndex] || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block text-center">
                        {Math.round(fileSection.uploadProgresses?.[previewIndex] || 0)}%
                      </span>
                    </div>
                  )}
                </div>
              ))}
              <label
                htmlFor={`file-input-${fileSection.id}`}
                className="h-20 sm:h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded flex items-center justify-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400"
              >
                <span className="text-gray-500 dark:text-gray-400 text-xl font-bold">+</span>
              </label>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 h-full">
              {fileSection.previewUrls.map((previewUrl, previewIndex) => (
                <div key={previewIndex} className="relative h-28 sm:h-32 w-full">
                  <img
                    src={previewUrl}
                    alt={`صورة ${previewIndex + 1}`}
                    className="h-full w-full object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removePreviewImage(fileSection.id, previewIndex)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md z-10"
                    aria-label="حذف الصورة"
                  >
                    <span className="text-lg font-bold">×</span>
                  </button>
                  {fileSection.failedUploads?.some((failed) => failed.index === previewIndex) && (
                    <button
                      type="button"
                      onClick={() => retryUpload(fileSection.id, previewIndex)}
                      className="absolute top-1 left-1 bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md z-10"
                      aria-label="إعادة محاولة رفع الصورة"
                    >
                      <FiRefreshCw className="text-sm" />
                    </button>
                  )}
                  {fileSection.isUploadingImages?.[previewIndex] && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${fileSection.uploadProgresses?.[previewIndex] || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block text-center">
                        {Math.round(fileSection.uploadProgresses?.[previewIndex] || 0)}%
                      </span>
                    </div>
                  )}
                </div>
              ))}
              {Array.from({ length: Math.max(0, 4 - fileSection.previewUrls.length) }).map((_, idx) => (
                <div
                  key={`empty-${idx}`}
                  className="h-28 sm:h-32 w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded flex items-center justify-center"
                />
              ))}
              <label
                htmlFor={`file-input-${fileSection.id}`}
                className="h-28 sm:h-32 w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded flex items-center justify-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 col-span-1"
              >
                <span className="text-gray-500 dark:text-gray-400 text-xl font-bold">+</span>
              </label>
            </div>
          )
        ) : (
          <div className="relative h-full w-full flex items-center justify-center">
            <img
              src={fileSection.previewUrls[0]}
              alt={fileSection.title}
              className="max-h-full max-w-full object-contain rounded"
            />
            <button
              type="button"
              onClick={() => removePreviewImage(fileSection.id, 0)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-md z-10"
              aria-label="حذف الصورة"
            >
              <span className="text-lg font-bold">×</span>
            </button>
            {fileSection.failedUploads?.some((failed) => failed.index === 0) && (
              <button
                type="button"
                onClick={() => retryUpload(fileSection.id)}
                className="absolute top-1 left-1 bg-yellow-500 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-md z-10"
                aria-label="إعادة محاولة رفع الصورة"
              >
                <FiRefreshCw className="text-sm" />
              </button>
            )}
          </div>
        )
      ) : (
        <div className="h-full w-full flex items-center justify-center">
          <label
            htmlFor={`file-input-${fileSection.id}`}
            className="cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors flex flex-col items-center justify-center h-full w-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-gray-400 dark:text-gray-500 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {fileSection.multiple ? 'انقر لاختيار عدة صور' : 'انقر لالتقاط صورة'}
            </span>
          </label>
        </div>
      )}
      {!fileSection.multiple && fileSection.isUploading && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${fileSection.uploadProgress}%` }}
            ></div>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block text-center">
            {Math.round(fileSection.uploadProgress)}%
          </span>
        </div>
      )}
    </div>
    <input
      id={`file-input-${fileSection.id}`}
      ref={setInputRef(index)}
      type="file"
      accept="image/*"
      capture={fileSection.multiple ? undefined : 'environment'}
      multiple={fileSection.multiple}
      onChange={(e) =>
        fileSection.multiple
          ? handleMultipleFileChange(fileSection.id, e)
          : handleFileChange(fileSection.id, e)
      }
      className="hidden"
    />
  </div>
))}

              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  التوقيع *
                </label>
                <div className="border-2 border-gray-300 dark:border-gray-600 rounded-md p-2">

                  <SignaturePad
                    ref={signatureCanvasRef}
                    penColor={isDarkMode ? 'white' : 'black'}
                    canvasProps={{
                      className: `w-full h-32 bg-white dark:bg-gray-700 rounded ${isSignatureLocked ? 'pointer-events-none opacity-50' : ''
                        }`,

                    }}

                    onEnd={() => {
                      setIsSignatureEmpty(signatureCanvasRef.current?.isEmpty() || false)
                      // handleSaveSignature()
                    }

                    }
                  />
                  <div className="flex justify-between mt-2">
                    <button
                      type="button"
                      onClick={handleClearSignature}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"

                    >
                      مسح التوقيع
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveSignature}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      disabled={isSignatureEmpty || isSignatureLocked}
                    >
                      حفظ التوقيع
                    </button>
                  </div>
                  {signatureUrl && (
                    <div className="mt-2">
                      <img
                        src={signatureUrl}
                        alt="التوقيع"
                        className="max-w-full h-20 object-contain rounded"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-4 text-center mt-4">
                <button
                  type="submit"
                  disabled={isUploading || hasExitRecord || isLoadingCars || isLoadingPlates}
                  className={`w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none text-lg font-medium ${isUploading || hasExitRecord || isLoadingCars || isLoadingPlates ? 'bg-gray-400' : ''
                    }`}
                >
                  {isUploading ? 'جاري الرفع...' : 'رفع البيانات'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {(isUploading || isSuccess) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center justify-center">
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                  <span className="text-gray-600 dark:text-gray-300 text-lg">جاري الرفع...</span>
                </>
              ) : isSuccess ? (
                <>
                  <FaCheckCircle className="text-green-500 text-5xl mb-4" />
                  <span className="text-gray-600 dark:text-gray-300 text-lg">تم الرفع بنجاح</span>
                </>
              ) : null}
            </div>
          </div>
        )}

        {showToast && (
          <div
            className={`fixed top-5 right-5 px-4 py-2 rounded-md shadow-lg z-50 animate-fade-in-out ${uploadMessage.includes('بنجاح') ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}
          >
            {uploadMessage}
          </div>
        )}
      </div>
    </div>
  );
}
