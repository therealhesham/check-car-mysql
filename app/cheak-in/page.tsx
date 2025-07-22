// //@ts-nocheck
// //@ts-ignore
// 'use client';
// function trimCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement {
//   const ctx = canvas.getContext('2d');
//   const width = canvas.width;
//   const height = canvas.height;
//   const imageData = ctx.getImageData(0, 0, width, height).data;

//   let top = null, left = null, right = null, bottom = null;

//   for (let y = 0; y < height; y++) {
//     for (let x = 0; x < width; x++) {
//       const idx = (width * y + x) * 4;
//       if (imageData[idx + 3] > 0) { // alpha > 0 means there's content
//         if (top === null) top = y;
//         if (left === null || x < left) left = x;
//         if (right === null || x > right) right = x;
//         bottom = y;
//       }
//     }
//   }

//   if (top === null) return canvas; // no content

//   const trimmedWidth = right - left;
//   const trimmedHeight = bottom - top;
//   const trimmed = document.createElement('canvas');
//   trimmed.width = trimmedWidth;
//   trimmed.height = trimmedHeight;
//   const trimmedCtx = trimmed.getContext('2d');
//   trimmedCtx.drawImage(canvas, left, top, trimmedWidth, trimmedHeight, 0, 0, trimmedWidth, trimmedHeight);

//   return trimmed;
// }

// import AWS from 'aws-sdk';
// import imageCompression from 'browser-image-compression';
// import { v4 as uuidv4 } from 'uuid';
// import Navbar from '@/public/components/navbar';
// import { useState, useRef, useEffect, RefCallback } from 'react';
// import { carList } from '@/lib/car';
// import { licenseList } from '@/lib/License';
// import { FaSearch, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
// import SignaturePad from 'react-signature-canvas';
// import { toast } from 'react-toastify';
// import { useRouter } from 'next/navigation';
// import retry from 'async-retry';
// import { FiRefreshCw } from 'react-icons/fi';
// import Lightbox from 'yet-another-react-lightbox';
// import Counter from 'yet-another-react-lightbox/plugins/counter';
// import Zoom from 'yet-another-react-lightbox/plugins/zoom';
// import Captions from 'yet-another-react-lightbox/plugins/captions';
// import Download from 'yet-another-react-lightbox/plugins/download';
// import 'yet-another-react-lightbox/styles.css';
// import 'yet-another-react-lightbox/plugins/counter.css';
// import 'yet-another-react-lightbox/plugins/captions.css';

// const sanitizeTitle = (title: string, index: number) => {
//   const cleanTitle = title.replace(/\s+/g, '-').replace(/[^\u0600-\u06FF\w-]/g, '');
//   return `${cleanTitle}-${index}`;
// };

// const fieldTitlesMap = {
//   'rear_bumper_with_lights': 'الصدام الخلفي مع الانوار',
//   'trunk_lid': 'سطح الشنطة مع الزجاج الخلفي',
//   'trunk_contents': 'محتويات الشنطة مع الاستبنة',
//   'roof': 'التندة',
//   'rear_right_fender': 'الرفرف الخلفي يمين',
//   'right_doors': 'الابواب اليمين مع توضيح السمكة',
//   'front_right_fender': 'الرفرف الامامي يمين',
//   'front_bumper': 'الصدام الامامي مع الشنب',
//   'hoode': 'الكبوت مع الشبك',
//   'front_windshield': 'الزجاج الامامي',
//   'front_left_fender': 'الرفرف الامامي يسار',
//   'left_doors': 'الابواب اليسار مع توضيح السمكة',
//   'rear_left_fender': 'الرفرف الخلفي يسار',
//   'front_left_seat': 'المقعد الامامي يسار',
//   'front_right_seat': 'المقعد الامامي يمين',
//   'rear_seat_with_front_seat_backs': 'المقعد الخلفي مع خلفية المقاعد الامامية',
//   'fire_extinguisher': 'طفاية الحريق',
//   'meter': 'العداد',
//   'other_images': 'صور اخرى',
//   'signature_url': 'التوقيع',
// };

// interface FileSection {
//   id: string;
//   imageUrls: string | string[] | null;
//   title: string;
//   multiple: boolean;
//   previewUrls: string[];
//   isUploading: boolean;
//   uploadProgress: number;
// }

// interface AirtableRecord {
//   id: string;
//   client_id: string;
//   client_name: string;
//   meter_reading: string;
//   contract_number: number;
//   car_model: string;
//   plate_number: string;
//   operation_type: string;
//   employee_name: string;
//   branch_name: string;
//   meter?: string;
//   right_doors?: string;
//   front_right_fender?: string;
//   rear_right_fender?: string;
//   rear_bumper_with_lights?: string;
//   trunk_lid?: string;
//   roof?: string;
//   rear_left_fender?: string;
//   left_doors?: string;
//   front_left_fender?: string;
//   front_bumper?: string;
//   hoode?: string;
//   front_windshield?: string;
//   trunk_contents?: string;
//   fire_extinguisher?: string;
//   front_right_seat?: string;
//   front_left_seat?: string;
//   rear_seat_with_front_seat_backs?: string;
//   other_images?: string;
//   signature_url?: string;
// }

// interface ApiResponse {
//   success: boolean;
//   message: string;
//   results: AirtableRecord[];
//   total: number;
//   page: number;
//   pageSize: number;
//   error?: string;
//   details?: any;
// }

// interface User {
//   id: string;
//   Name: string;
//   EmID: number;
//   role: string;
//   branch: string;
//   selectedBranch?: string; // إضافة selectedBranch كحقل اختياري
// }

// export default function CheckInPage() {
//   const fieldTitles = [
//     'rear_bumper_with_lights',
//     'trunk_lid',
//     'trunk_contents',
//     'roof',
//     'rear_right_fender',
//     'right_doors',
//     'front_right_fender',
//     'front_bumper',
//     'hoode',
//     'front_windshield',
//     'front_left_fender',
//     'left_doors',
//     'rear_left_fender',
//     'front_left_seat',
//     'front_right_seat',
//     'rear_seat_with_front_seat_backs',
//     'fire_extinguisher',
//     'meter',
//     'other_images',
//   ];

//   const initialFiles: FileSection[] = fieldTitles.map((title, index) => ({
//     id: `file-section-${sanitizeTitle(title, index)}`,
//     imageUrls: null,
//     title: title,
//     multiple: title === 'other_images',
//     previewUrls: [],
//     isUploading: false,
//     uploadProgress: 0,
//   }));

//   const signatureSection: FileSection = {
//     id: `file-section-signature_url`,
//     imageUrls: null,
//     title: 'signature_url',
//     multiple: false,
//     previewUrls: [],
//     isUploading: false,
//     uploadProgress: 0,
//   };

//   const [files, setFiles] = useState<FileSection[]>(initialFiles);
//   const [signatureFile, setSignatureFile] = useState<FileSection>(signatureSection);
//   const [car, setCar] = useState<string>('');
//   const [newMeterReading, setNewMeterReading] = useState('');
//   const [carSearch, setCarSearch] = useState<string>('');
//   const [showCarList, setShowCarList] = useState<boolean>(false);
//   const [plate, setPlate] = useState<string>('');
//   const [plateSearch, setPlateSearch] = useState<string>('');
//   const [showPlateList, setShowPlateList] = useState<boolean>(false);
//   const [contract, setContract] = useState<string>('');
//   const [operationType] = useState<string>('دخول');
//   const [isUploading, setIsUploading] = useState<boolean>(false);
//   const [uploadMessage, setUploadMessage] = useState<string>('');
//   const [showToast, setShowToast] = useState<boolean>(false);
//   const [isSuccess, setIsSuccess] = useState<boolean>(false);
//   const [previousRecord, setPreviousRecord] = useState<AirtableRecord | null>(null);
//   const [hasExitRecord, setHasExitRecord] = useState<boolean>(false);
//   const [isContractVerified, setIsContractVerified] = useState<boolean>(false);
//   const [previewImage, setPreviewImage] = useState<string | null>(null);
//   const [previewImages, setPreviewImages] = useState<string[]>([]);
//   const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
//   const [isSearching, setIsSearching] = useState<boolean>(false);
//   const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
//   const [user, setUser] = useState<User | null>(null);
//   const [client_id, setClientId] = useState('');
//   const [client_name, setClientName] = useState('');
//   const [isSignatureLocked, setIsSignatureLocked] = useState<boolean>(false);
//   const [meterError, setMeterError] = useState<string>('');
//   const router = useRouter();
//   const [shouldRedirect, setShouldRedirect] = useState<boolean>(false);

//   const sigCanvas = useRef<SignaturePad>(null);
//   const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
//   const carInputRef = useRef<HTMLDivElement>(null);
//   const plateInputRef = useRef<HTMLDivElement>(null);
//   const abortControllerRef = useRef<AbortController | null>(null);
//   const uploadQueue = useRef<Promise<void>>(Promise.resolve());
//   const contractInputRef = useRef<HTMLDivElement>(null);
//   const [branchName, setBranchName] = useState<string>('');
//   const [openLightbox, setOpenLightbox] = useState(false);


//   useEffect(() => {
//     const storedUser = localStorage.getItem('user');
//     if (storedUser) {
//       const parsedUser = JSON.parse(storedUser);
//       console.log('Loaded user from localStorage:', parsedUser); // سجل للتصحيح
//       setUser(parsedUser);
//     }
//   }, []);

//   useEffect(() => {
//     if (shouldRedirect && !showToast) {
//       // Redirect only after the toast has finished displaying
//       router.push('/');
//     }
//   }, [shouldRedirect, showToast, router]);

//   useEffect(() => {
//     const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
//     setIsDarkMode(mediaQuery.matches);

//     const handleChange = (e: MediaQueryListEvent) => {
//       setIsDarkMode(e.matches);
//     };

//     mediaQuery.addEventListener('change', handleChange);
//     return () => mediaQuery.removeEventListener('change', handleChange);
//   }, []);

//   useEffect(() => {
//     fileInputRefs.current = Array(files.length).fill(null);
//   }, [files.length]);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (carInputRef.current && !carInputRef.current.contains(event.target as Node)) {
//         setShowCarList(false);
//       }
//       if (plateInputRef.current && !plateInputRef.current.contains(event.target as Node)) {
//         setShowPlateList(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   useEffect(() => {
//     if (showToast) {
//       const timer = setTimeout(() => {
//         setShowToast(false);
//         setUploadMessage('');
//         setIsSuccess(false);
//       }, 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [showToast]);

//   useEffect(() => {
//     if (isSuccess) {
//       const timer = setTimeout(() => {
//         setIsSuccess(false);
//       }, 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [isSuccess]);

//   useEffect(() => {
//     if (contract.trim()) {
//       fetchPreviousRecord();
//     } else {
//       setPreviousRecord(null);
//       setHasExitRecord(false);
//       setIsContractVerified(false);
//       setUploadMessage('');
//       setShowToast(false);
//       setCar('');
//       setCarSearch('');
//       setPlate('');
//       setPlateSearch('');
//     }
//   }, [contract]);

//   const restrictToNumbers = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     const charCode = e.charCode;
//     if (charCode < 48 || charCode > 57) {
//       e.preventDefault();
//     }
//   };

//   const fetchPreviousRecord = async () => {
//     if (!contract.trim()) {
//       setPreviousRecord(null);
//       setHasExitRecord(false);
//       setIsContractVerified(false);
//       setUploadMessage('رقم العقد مطلوب للبحث.');
//       setShowToast(true);
//       return;
//     }
  
//     if (!/^\d+$/.test(contract.trim())) {
//       setPreviousRecord(null);
//       setHasExitRecord(false);
//       setIsContractVerified(false);
//       setUploadMessage('رقم العقد يجب أن يحتوي على أرقام فقط.');
//       setShowToast(true);
//       return;
//     }
  
//     setIsSearching(true);
//     setUploadMessage('');
  
//     if (abortControllerRef.current) {
//       abortControllerRef.current.abort();
//     }
//     abortControllerRef.current = new AbortController();
  
//     try {
//       // التحقق من سجل دخول سابق
//       const entryResponse = await fetch(
//         `/api/history?contractNumber=${encodeURIComponent(contract)}&operationType=دخول`,
//         {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           signal: abortControllerRef.current.signal,
//         }
//       );
  
//       if (!entryResponse.ok) {
//         const errorData = await entryResponse.json().catch(() => ({}));
//         throw new Error(errorData.message || `فشل في التحقق من سجل الدخول (حالة: ${entryResponse.status})`);
//       }
  
//       const entryData = await entryResponse.json();
//       console.log('Entry check response:', entryData); // سجل للتصحيح
  
//       if (entryData && Array.isArray(entryData.records) && entryData.records.length > 0) {
//         setPreviousRecord(null);
//         setHasExitRecord(false);
//         setIsContractVerified(true);
//         setUploadMessage('تم تسجيل عملية دخول لهذا العقد من قبل.');
//         setShowToast(true);
//         setCar('');
//         setCarSearch('');
//         setPlate('');
//         setPlateSearch('');
//         setClientId('');
//         setClientName('');
//         setBranchName('');
//         return;
//       }
  
//       // التحقق من سجل خروج
//       const exitResponse = await fetch(
//         `/api/history?contractNumber=${encodeURIComponent(contract)}&operationType=خروج`,
//         {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           signal: abortControllerRef.current.signal,
//         }
//       );
  
//       if (!exitResponse.ok) {
//         const errorData = await exitResponse.json().catch(() => ({}));
//         throw new Error(errorData.message || `فشل في التحقق من سجل الخروج (حالة: ${exitResponse.status})`);
//       }
  
//       const exitData = await exitResponse.json();
//       console.log('Exit check response:', exitData); // سجل للتصحيح
  
//       if (exitData && Array.isArray(exitData.records) && exitData.records.length > 0) {
//         const exitRecord = exitData.records[0];
//         setPreviousRecord(exitRecord);
//         setHasExitRecord(true);
//         setClientId(exitRecord.client_id || '');
//         setClientName(exitRecord.client_name || '');
//         setCar(exitRecord.car_model || '');
//         setCarSearch(exitRecord.car_model || '');
//         setPlate(exitRecord.plate_number || '');
//         setPlateSearch(exitRecord.plate_number || '');
//         setBranchName(exitRecord.branch_name || '');
//       } else {
//         setPreviousRecord(null);
//         setHasExitRecord(false);
//         setUploadMessage('لا يوجد سجل خروج سابق لهذا العقد.');
//         setShowToast(true);
//         setCar('');
//         setCarSearch('');
//         setPlate('');
//         setPlateSearch('');
//         setClientId('');
//         setClientName('');
//         setBranchName('');
//       }
  
//       setIsContractVerified(true);
//     } catch (err: any) {
//       if (err.name === 'AbortError') {
//         return;
//       }
//       console.error('Error fetching previous record:', err);
//       setUploadMessage(err.message || 'حدث خطأ أثناء جلب السجل السابق.');
//       setShowToast(true);
//       setPreviousRecord(null);
//       setHasExitRecord(false);
//       setIsContractVerified(true);
//     } finally {
//       setIsSearching(false);
//     }
//   };

//   const handleSearch = () => {
//     fetchPreviousRecord();
//   };

//   const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter') {
//       e.preventDefault();
//       fetchPreviousRecord();
//     }
//   };

//   const filteredCars = carList.filter((carItem) =>
//     carItem.toLowerCase().includes(carSearch.toLowerCase())
//   );

//   const filteredPlates = licenseList.filter((plateItem) =>
//     plateItem.toLowerCase().includes(plateSearch.toLowerCase())
//   );

//   const DO_ACCESS_KEY = process.env.NEXT_PUBLIC_DO_ACCESS_KEY;
//   const DO_SECRET_KEY = process.env.NEXT_PUBLIC_DO_SECRET_KEY;
//   const DO_SPACE_NAME = process.env.NEXT_PUBLIC_DO_SPACE_NAME;
//   const DO_REGION = process.env.NEXT_PUBLIC_DO_REGION;
//   const DO_ENDPOINT = process.env.NEXT_PUBLIC_DO_ENDPOINT;
//   const s3 = new AWS.S3({
//     accessKeyId: DO_ACCESS_KEY,
//     secretAccessKey: DO_SECRET_KEY,
//     endpoint: DO_ENDPOINT,
//     s3ForcePathStyle: true,
//     signatureVersion: 'v4',
//   });

//   const addDateTimeToImage = async (file: File): Promise<File> => {
//     if (!file.type.startsWith('image/')) {
//       throw new Error('الملف ليس صورة صالحة.');
//     }
  
//     return new Promise((resolve, reject) => {
//       const img = new Image();
//       const reader = new FileReader();
  
//       reader.onload = (e) => {
//         img.src = e.target?.result as string;
  
//         img.onload = () => {
//           const canvas = document.createElement('canvas');
//           const ctx = canvas.getContext('2d');
//           if (!ctx) {
//             reject(new Error('فشل في إنشاء سياق الرسم.'));
//             return;
//           }
  
//           canvas.width = img.width;
//           canvas.height = img.height;
  
//           ctx.drawImage(img, 0, 0);
  
//           const now = new Date();
//           const dateTimeString = now.toLocaleString('ar-SA', {
//             calendar: 'gregory',
//             year: 'numeric',
//             month: '2-digit',
//             day: '2-digit',
//             hour: '2-digit',
//             minute: '2-digit',
//             second: '2-digit',
//             hour12: true,
//           });
  
//           ctx.font = '40px Arial';
//           ctx.fillStyle = 'white';
//           ctx.strokeStyle = 'black';
//           ctx.lineWidth = 3;
  
//           const text = dateTimeString;
//           const textWidth = ctx.measureText(text).width;
//           const padding = 20;
//           const textX = canvas.width - textWidth - padding;
//           const textY = 40;
  
//           ctx.strokeText(text, textX, textY);
//           ctx.fillText(text, textX, textY);
  
//           canvas.toBlob(
//             (blob) => {
//               if (!blob) {
//                 reject(new Error('فشل في تحويل الصورة إلى Blob.'));
//                 return;
//               }
//               const modifiedFile = new File([blob], `${uuidv4()}.webp`, { type: 'image/webp' });
//               resolve(modifiedFile);
//             },
//             'image/webp', // تغيير إلى WebP
//             0.95 // زيادة الجودة إلى 0.95
//           );
//         };
  
//         img.onerror = () => {
//           reject(new Error('فشل في تحميل الصورة.'));
//         };
//       };
  
//       reader.onerror = () => {
//         reject(new Error('فشل في قراءة ملف الصورة.'));
//       };
  
//       reader.readAsDataURL(file);
//     });
//   };

//   const compressImage = async (file: File): Promise<File> => {
//     const options = {
//       maxSizeMB: 5, // زيادة الحد الأقصى لحجم الملف إلى 5 ميغابايت
//       maxWidthOrHeight: 1920, // الإبقاء على الدقة القصوى 1920 بكسل
//       useWebWorker: true,
//       fileType: 'image/webp', // تحديد صيغة الإخراج إلى WebP
//       initialQuality: 0.95, // تحديد جودة أولية عالية
//     };
  
//     try {
//       const compressedFile = await imageCompression(file, options);
//       if (compressedFile.size > 32 * 1024 * 1024) {
//         throw new Error('حجم الصورة المضغوطة كبير جدًا (الحد الأقصى 32 ميغابايت).');
//       }
//       const modifiedFile = await addDateTimeToImage(compressedFile);
//       return modifiedFile;
//     } catch (error) {
//       console.error('Error processing image:', error);
//       throw new Error('فشل في معالجة الصورة: ' + error.message);
//     }
//   };

//   const throttle = (func: (...args: any[]) => void, limit: number) => {
//     let inThrottle: boolean;
//     return (...args: any[]) => {
//       if (!inThrottle) {
//         func(...args);
//         inThrottle = true;
//         setTimeout(() => (inThrottle = false), limit);
//       }
//     };
//   };
  
//   const uploadImageToBackend = async (
//     file: File,
//     fileSectionId: string,
//     onProgress: (progress: number) => void
//   ): Promise<string> => {
//     const fileName = `${uuidv4()}.webp`; // تغيير الامتداد إلى .webp
//     const buffer = Buffer.from(await file.arrayBuffer());
  
//     const params = {
//       Bucket: DO_SPACE_NAME,
//       Key: fileName,
//       Body: buffer,
//       ContentType: 'image/webp', // تغيير إلى image/webp
//       ACL: 'public-read',
//     };
  
//     try {
//       if (!file.type.startsWith('image/')) {
//         throw new Error('الملف ليس صورة صالحة. يرجى رفع ملف بصيغة JPEG أو PNG أو WebP.');
//       }
//       if (file.size > 32 * 1024 * 1024) {
//         throw new Error('حجم الصورة كبير جدًا (الحد الأقصى 32 ميغابايت).');
//       }
  
//       const upload = s3.upload(params);
  
//       const throttledOnProgress = throttle((percentage: number) => {
//         onProgress(percentage);
//       }, 100);
  
//       upload.on('httpUploadProgress', (progress) => {
//         const percentage = Math.round((progress.loaded / progress.total) * 100);
//         throttledOnProgress(percentage);
//       });
  
//       const result = await upload.promise();
//       if (result.Location.length > 512) {
//         console.warn(`تحذير: رابط الصورة (${result.Location.length} حرفًا) يتجاوز الحد الأقصى لـ VARCHAR(512).`);
//       }
//       return result.Location;
//     } catch (error: any) {
//       throw error;
//     }
//   };

//   const handleSignatureSave = async () => {
//     if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
//       setUploadMessage('يرجى رسم التوقيع أولاً.');
//       setShowToast(true);
//       toast.error('يرجى رسم التوقيع أولاً.');
//       return;
//     }
  
//     const rawCanvas = sigCanvas.current.getCanvas();
//     const trimmedCanvas = trimCanvas(rawCanvas);
//     const signatureDataUrl = trimmedCanvas.toDataURL('image/webp', 0.95);
  
//     const blob = await fetch(signatureDataUrl).then((res) => res.blob());
//     const file = new File([blob], `${uuidv4()}.webp`, { type: 'image/webp' });
  
//     const localPreviewUrl = URL.createObjectURL(file);
  
//     setSignatureFile((prev) => ({
//       ...prev,
//       previewUrls: [localPreviewUrl],
//       imageUrls: null,
//       isUploading: true,
//       uploadProgress: 0,
//     }));
  
//     uploadQueue.current = uploadQueue.current.then(async () => {
//       try {
//         await saveToLocalStorage(file, signatureSection.id); // حفظ التوقيع في localStorage
//       } catch (error: any) {
//         setUploadMessage('فشل في حفظ التوقيع مؤقتًا: ' + error.message);
//         setShowToast(true);
//         toast.error('فشل في حفظ التوقيع مؤقتًا: ' + error.message);
//         setSignatureFile((prev) => ({
//           ...prev,
//           previewUrls: [],
//           isUploading: false,
//           uploadProgress: 0,
//         }));
//         URL.revokeObjectURL(localPreviewUrl);
//         return;
//       }
  
//       try {
//         const options = {
//           maxSizeMB: 5,
//           maxWidthOrHeight: 1920,
//           useWebWorker: true,
//           fileType: 'image/webp',
//           initialQuality: 0.95,
//         };
//         const compressedFile = await imageCompression(file, options);
//         const modifiedFile = await addDateTimeToImage(compressedFile);
//         const imageUrl = await uploadImageToBackend(modifiedFile, signatureSection.id, (progress) => {
//           setSignatureFile((prev) => ({
//             ...prev,
//             uploadProgress: progress,
//           }));
//         });
//         setSignatureFile((prev) => ({
//           ...prev,
//           imageUrls: imageUrl,
//           previewUrls: [imageUrl],
//           isUploading: false,
//           uploadProgress: 100,
//         }));
//         setIsSignatureLocked(true);
//         clearFromLocalStorage(signatureSection.id); // مسح التوقيع من localStorage بعد النجاح
//         URL.revokeObjectURL(localPreviewUrl);
//         sigCanvas.current?.clear();
//         toast.success('تم حفظ التوقيع بنجاح.');
//       } catch (error: any) {
//         let errorMessage = 'حدث خطأ أثناء رفع التوقيع. التوقيع محفوظ مؤقتًا ويمكن إعادة المحاولة لاحقًا.';
//         if (error.message.includes('Rate limit')) {
//           errorMessage = 'تم تجاوز حد رفع الصور. التوقيع محفوظ مؤقتًا.';
//         }
//         setUploadMessage(errorMessage);
//         setShowToast(true);
//         toast.error(errorMessage);
//         setSignatureFile((prev) => ({
//           ...prev,
//           imageUrls: null,
//           previewUrls: [],
//           isUploading: false,
//           uploadProgress: 0,
//         }));
//         URL.revokeObjectURL(localPreviewUrl);
//       }
//     });
//   };

//   const handleFileChange = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files || e.target.files.length === 0) return;
  
//     const file = e.target.files[0];
//     const localPreviewUrl = URL.createObjectURL(file);
  
//     setFiles((prevFiles) =>
//       prevFiles.map((fileSection) =>
//         fileSection.id === id
//           ? {
//               ...fileSection,
//               previewUrls: [localPreviewUrl],
//               imageUrls: null,
//               isUploading: true,
//               uploadProgress: 0,
//             }
//           : fileSection
//       )
//     );
  
//     uploadQueue.current = uploadQueue.current.then(async () => {
//       try {
//         await saveToLocalStorage(file, id); // حفظ الصورة في localStorage
//       } catch (error: any) {
//         setUploadMessage('فشل في حفظ الصورة مؤقتًا: ' + error.message);
//         setShowToast(true);
//         toast.error('فشل في حفظ الصورة مؤقتًا: ' + error.message);
//         setFiles((prevFiles) =>
//           prevFiles.map((fileSection) =>
//             fileSection.id === id
//               ? { ...fileSection, previewUrls: [], isUploading: false, uploadProgress: 0 }
//               : fileSection
//           )
//         );
//         URL.revokeObjectURL(localPreviewUrl);
//         const index = files.findIndex((fileSection) => fileSection.id === id);
//         if (fileInputRefs.current[index]) {
//           fileInputRefs.current[index]!.value = '';
//         }
//         return;
//       }
  
//       try {
//         const compressedFile = await compressImage(file);
//         const imageUrl = await uploadImageToBackend(compressedFile, id, (progress) => {
//           setFiles((prevFiles) =>
//             prevFiles.map((fileSection) =>
//               fileSection.id === id
//                 ? { ...fileSection, uploadProgress: progress }
//                 : fileSection
//             )
//           );
//         });
//         setFiles((prevFiles) =>
//           prevFiles.map((fileSection) =>
//             fileSection.id === id
//               ? {
//                   ...fileSection,
//                   imageUrls: imageUrl,
//                   previewUrls: [imageUrl],
//                   isUploading: false,
//                   uploadProgress: 100,
//                 }
//               : fileSection
//           )
//         );
//         clearFromLocalStorage(id); // مسح الصورة من localStorage بعد النجاح
//         URL.revokeObjectURL(localPreviewUrl);
//         const index = files.findIndex((fileSection) => fileSection.id === id);
//         if (fileInputRefs.current[index]) {
//           fileInputRefs.current[index]!.value = '';
//         }
//       } catch (error: any) {
//         let errorMessage = 'حدث خطأ أثناء رفع الصورة. الصورة محفوظة مؤقتًا ويمكن إعادة المحاولة لاحقًا.';
//         if (error.message.includes('Rate limit')) {
//           errorMessage = 'تم تجاوز حد رفع الصور. الصورة محفوظة مؤقتًا.';
//         } else if (error.message.includes('ضغط')) {
//           errorMessage = 'فشل في ضغط الصورة. الصورة محفوظة مؤقتًا.';
//         }
//         setUploadMessage(errorMessage);
//         setShowToast(true);
//         toast.error(errorMessage);
//         setFiles((prevFiles) =>
//           prevFiles.map((fileSection) =>
//             fileSection.id === id
//               ? { ...fileSection, isUploading: false, uploadProgress: 0 }
//               : fileSection
//           )
//         );
//       }
//     });
//   };

//   const handleMultipleFileChange = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files || e.target.files.length === 0) return;
  
//     const selectedFiles = Array.from(e.target.files);
//     const localPreviewUrls = selectedFiles.map((file) => URL.createObjectURL(file));
//     const startIndex = files.find((fileSection) => fileSection.id === id)?.previewUrls.length || 0;
  
//     setFiles((prevFiles) =>
//       prevFiles.map((fileSection) =>
//         fileSection.id === id
//           ? {
//               ...fileSection,
//               previewUrls: [...fileSection.previewUrls, ...localPreviewUrls],
//               isUploading: true,
//               uploadProgress: 0,
//             }
//           : fileSection
//       )
//     );
  
//     uploadQueue.current = uploadQueue.current.then(async () => {
//       const uploadPromises = selectedFiles.map(async (file, index) => {
//         const uniqueId = `${id}-${startIndex + index}`;
//         try {
//           await saveToLocalStorage(file, uniqueId); // حفظ كل صورة بمعرف فريد
//         } catch (error: any) {
//           setUploadMessage(`فشل في حفظ الصورة ${index + 1} مؤقتًا: ${error.message}`);
//           setShowToast(true);
//           toast.error(`فشل في حفظ الصورة ${index + 1} مؤقتًا: ${error.message}`);
//           return { index: startIndex + index, url: null };
//         }
  
//         try {
//           const compressedFile = await compressImage(file);
//           const imageUrl = await uploadImageToBackend(compressedFile, id, (progress) => {
//             const completedFiles = (progress / 100) + (index / selectedFiles.length);
//             const overallProgress = Math.round((completedFiles / selectedFiles.length) * 100);
//             setFiles((prevFiles) =>
//               prevFiles.map((fileSection) =>
//                 fileSection.id === id
//                   ? { ...fileSection, uploadProgress: overallProgress }
//                   : fileSection
//               )
//             );
//           });
//           clearFromLocalStorage(uniqueId); // مسح الصورة من localStorage بعد النجاح
//           return { index: startIndex + index, url: imageUrl };
//         } catch (error: any) {
//           setUploadMessage(
//             `فشل رفع الصورة ${index + 1}. الصورة محفوظة مؤقتًا ويمكن إعادة المحاولة لاحقًا.`
//           );
//           setShowToast(true);
//           toast.error(`فشل رفع الصورة ${index + 1}. الصورة محفوظة مؤقتًا ويمكن إعادة المحاولة لاحقًا.`);
//           return { index: startIndex + index, url: null };
//         }
//       });
  
//       try {
//         const results = await Promise.all(uploadPromises);
//         const successfulUrls = results
//           .filter((result): result is { index: number; url: string } => result.url !== null)
//           .map((result) => result.url);
  
//         setFiles((prevFiles) =>
//           prevFiles.map((fileSection) =>
//             fileSection.id === id
//               ? {
//                   ...fileSection,
//                   imageUrls: [
//                     ...(Array.isArray(fileSection.imageUrls) ? fileSection.imageUrls : []),
//                     ...successfulUrls,
//                   ],
//                   previewUrls: [
//                     ...(Array.isArray(fileSection.imageUrls) ? fileSection.imageUrls : []),
//                     ...successfulUrls,
//                   ],
//                   isUploading: false,
//                   uploadProgress: 100,
//                 }
//               : fileSection
//           )
//         );
  
//         localPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
//         const index = files.findIndex((fileSection) => fileSection.id === id);
//         if (fileInputRefs.current[index]) {
//           fileInputRefs.current[index]!.value = '';
//         }
//       } catch (error: any) {
//         let errorMessage = 'حدث خطأ أثناء رفع الصور. يرجى المحاولة مرة أخرى.';
//         if (error.message.includes('Rate limit')) {
//           errorMessage = 'تم تجاوز حد رفع الصور. يرجى المحاولة مجددًا لاحقًا.';
//         } else if (error.message.includes('ضغط')) {
//           errorMessage = 'فشل في ضغط الصورة. يرجى المحاولة مرة أخرى.';
//         } else if (error.message.includes('512')) {
//           errorMessage = error.message;
//         }
//         setUploadMessage(errorMessage);
//         setShowToast(true);
//         toast.error(errorMessage);
//         setFiles((prevFiles) =>
//           prevFiles.map((fileSection) =>
//             fileSection.id === id
//               ? {
//                   ...fileSection,
//                   isUploading: false,
//                   uploadProgress: 0,
//                   previewUrls: Array.isArray(fileSection.imageUrls) ? fileSection.imageUrls : [],
//                 }
//               : fileSection
//           )
//         );
//         localPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
//         const index = files.findIndex((fileSection) => fileSection.id === id);
//         if (fileInputRefs.current[index]) {
//           fileInputRefs.current[index]!.value = '';
//         }
//       }
//     });
//   };

//   const deleteFile = (fileKey: string): Promise<void> => {
//     return new Promise((resolve, reject) => {
//       const params = {
//         Bucket: 'uploadcarimages',
//         Key: fileKey,
//       };

//       s3.deleteObject(params, (err, data) => {
//         if (err) {
//           console.error('Error deleting:', err);
//           reject(new Error(`فشل في حذف الملف: ${fileKey}`));
//         } else {
//           console.log('File deleted successfully:', fileKey);
//           resolve();
//         }
//       });
//     });
//   };

//   const removePreviewImage = async (fileId: string, previewIndex: number, e?: React.MouseEvent) => {
//     if (e) {
//       e.stopPropagation();
//     }
  
//     if (fileId === signatureFile.id) {
//       const updatedPreviews = [...signatureFile.previewUrls];
//       const deletedPreviewUrl = updatedPreviews.splice(previewIndex, 1)[0];
//       let updatedImageUrls = signatureFile.imageUrls;
  
//       let fileKey: string | null = null;
//       if (deletedPreviewUrl) {
//         try {
//           const urlParts = deletedPreviewUrl.split('/');
//           fileKey = urlParts[urlParts.length - 1];
//         } catch (error) {
//           console.error('Error parsing URL:', error);
//         }
//       }
  
//       if (Array.isArray(updatedImageUrls)) {
//         updatedImageUrls = [...updatedImageUrls];
//         updatedImageUrls.splice(previewIndex, 1);
//       } else if (previewIndex === 0) {
//         updatedImageUrls = null;
//       }
  
//       if (fileKey) {
//         deleteFile(fileKey)
//           .then(() => {
//             setUploadMessage('تم حذف التوقيع بنجاح من السيرفر.');
//             setShowToast(true);
//             toast.success('تم حذف التوقيع بنجاح من السيرفر.');
//           })
//           .catch((error) => {
//             setUploadMessage(error.message);
//             setShowToast(true);
//             toast.error(error.message);
//           });
//       }
  
//       clearFromLocalStorage(fileId); // مسح التوقيع من localStorage
//       setSignatureFile({
//         ...signatureFile,
//         previewUrls: updatedPreviews,
//         imageUrls: updatedImageUrls,
//         isUploading: false,
//       });
//       setIsSignatureLocked(false);
//       return;
//     }
  
//     setFiles((prevFiles) =>
//       prevFiles.map((fileSection) => {
//         if (fileSection.id === fileId) {
//           const updatedPreviews = [...fileSection.previewUrls];
//           const deletedPreviewUrl = updatedPreviews.splice(previewIndex, 1)[0];
//           let updatedImageUrls = fileSection.imageUrls;
  
//           let fileKey: string | null = null;
//           if (deletedPreviewUrl) {
//             try {
//               const urlParts = deletedPreviewUrl.split('/');
//               fileKey = urlParts[urlParts.length - 1];
//             } catch (error) {
//               console.error('Error parsing URL:', error);
//             }
//           }
  
//           if (Array.isArray(updatedImageUrls)) {
//             updatedImageUrls = [...updatedImageUrls];
//             updatedImageUrls.splice(previewIndex, 1);
//           } else if (previewIndex === 0) {
//             updatedImageUrls = null;
//           }
  
//           if (fileKey) {
//             deleteFile(fileKey)
//               .then(() => {
//                 setUploadMessage('تم حذف الصورة بنجاح من السيرفر.');
//                 setShowToast(true);
//                 toast.success('تم حذف الصورة بنجاح من السيرفر.');
//               })
//               .catch((error) => {
//                 setUploadMessage(error.message);
//                 setShowToast(true);
//                 toast.error(error.message);
//               });
//           }
  
//           clearFromLocalStorage(fileId); // مسح الصورة من localStorage
//           return {
//             ...fileSection,
//             previewUrls: updatedPreviews,
//             imageUrls: updatedImageUrls,
//             isUploading: false,
//           };
//         }
//         return fileSection;
//       })
//     );
  
//     const index = files.findIndex((fileSection) => fileSection.id === fileId);
//     if (fileInputRefs.current[index]) {
//       fileInputRefs.current[index]!.value = '';
//     }
//   };

//   const saveToLocalStorage = async (file: File, fileSectionId: string): Promise<void> => {
//     return new Promise((resolve, reject) => {
//       if (file.size > 5 * 1024 * 1024) { // تحديد حد أقصى 5 ميغابايت
//         reject(new Error('حجم الصورة كبير جدًا للحفظ في localStorage (الحد الأقصى 5 ميغابايت).'));
//         return;
//       }
//       const reader = new FileReader();
//       reader.onload = () => {
//         try {
//           localStorage.setItem(`pending-upload-${fileSectionId}`, reader.result as string);
//           resolve();
//         } catch (error) {
//           reject(new Error('فشل في حفظ الصورة مؤقتًا بسبب قيود التخزين.'));
//         }
//       };
//       reader.onerror = () => reject(new Error('فشل في قراءة ملف الصورة.'));
//       reader.readAsDataURL(file);
//     });
//   };
  
//   const getFromLocalStorage = (fileSectionId: string): string | null => {
//     return localStorage.getItem(`pending-upload-${fileSectionId}`);
//   };
  
//   const clearFromLocalStorage = (fileSectionId: string): void => {
//     localStorage.removeItem(`pending-upload-${fileSectionId}`);
//   };
  
//   const retryUpload = async (fileSectionId: string, index?: number) => {
//     const uniqueId = index !== undefined ? `${fileSectionId}-${index}` : fileSectionId;
//     const dataUrl = getFromLocalStorage(uniqueId);
//     if (!dataUrl) {
//       setUploadMessage('لا توجد صورة محفوظة لإعادة المحاولة.');
//       setShowToast(true);
//       toast.error('لا توجد صورة محفوظة لإعادة المحاولة.');
//       return;
//     }
  
//     setFiles((prevFiles) =>
//       prevFiles.map((fileSection) =>
//         fileSection.id === fileSectionId
//           ? { ...fileSection, isUploading: true, uploadProgress: 0 }
//           : fileSection
//       )
//     );
  
//     try {
//       const response = await fetch(dataUrl);
//       const blob = await response.blob();
//       const file = new File([blob], `${uuidv4()}.webp`, { type: 'image/webp' });
  
//       setFiles((prevFiles) =>
//         prevFiles.map((fileSection) =>
//           fileSection.id === fileSectionId ? { ...fileSection, uploadProgress: 30 } : fileSection
//         )
//       );
  
//       const compressedFile = await compressImage(file);
  
//       setFiles((prevFiles) =>
//         prevFiles.map((fileSection) =>
//           fileSection.id === fileSectionId ? { ...fileSection, uploadProgress: 60 } : fileSection
//         )
//       );
  
//       const imageUrl = await uploadImageToBackend(compressedFile, fileSectionId, (progress) => {
//         setFiles((prevFiles) =>
//           prevFiles.map((fileSection) =>
//             fileSection.id === fileSectionId
//               ? { ...fileSection, uploadProgress: progress }
//               : fileSection
//           )
//         );
//       });
  
//       setFiles((prevFiles) =>
//         prevFiles.map((fileSection) => {
//           if (fileSection.id === fileSectionId) {
//             if (fileSection.multiple) {
//               const updatedPreviewUrls = [...(fileSection.previewUrls || [])];
//               if (index !== undefined && updatedPreviewUrls[index]) {
//                 updatedPreviewUrls[index] = imageUrl;
//               } else {
//                 updatedPreviewUrls.push(imageUrl);
//               }
  
//               return {
//                 ...fileSection,
//                 imageUrls: [
//                   ...(Array.isArray(fileSection.imageUrls) ? fileSection.imageUrls : []),
//                   imageUrl,
//                 ],
//                 previewUrls: updatedPreviewUrls,
//                 isUploading: false,
//                 uploadProgress: 100,
//               };
//             } else {
//               return {
//                 ...fileSection,
//                 imageUrls: imageUrl,
//                 previewUrls: [imageUrl],
//                 isUploading: false,
//                 uploadProgress: 100,
//               };
//             }
//           }
//           return fileSection;
//         })
//       );
  
//       clearFromLocalStorage(uniqueId);
//       setUploadMessage('تم إعادة رفع الصورة بنجاح.');
//       setShowToast(true);
//       toast.success('تم إعادة رفع الصورة بنجاح.');
//     } catch (error: any) {
//       setUploadMessage('فشل إعادة رفع الصورة: ' + error.message);
//       setShowToast(true);
//       toast.error('فشل إعادة رفع الصورة: ' + error.message);
//       setFiles((prevFiles) =>
//         prevFiles.map((fileSection) =>
//           fileSection.id === fileSectionId
//             ? { ...fileSection, isUploading: false, uploadProgress: 0 }
//             : fileSection
//         )
//       );
//     }
//   };

//   const setInputRef = (index: number): RefCallback<HTMLInputElement> => {
//     return (element: HTMLInputElement | null) => {
//       fileInputRefs.current[index] = element;
//     };
//   };



//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
  
//     if (meterError) {
//       setUploadMessage(meterError);
//       setShowToast(true);
//       toast.error(meterError);
//       return;
//     }
  
//     if (parseInt(newMeterReading) < parseInt(previousRecord?.meter_reading || '0')) {
//       setUploadMessage('قراءة العداد الجديدة يجب أن تكون أكبر من أو تساوي القراءة السابقة.');
//       setShowToast(true);
//       toast.error('قراءة العداد الجديدة يجب أن تكون أكبر من أو تساوي القراءة السابقة.');
//       return;
//     }
  
//     if (!contract.trim() || !car.trim() || !plate.trim()) {
//       setUploadMessage('يرجى ملء جميع الحقول المطلوبة.');
//       setShowToast(true);
//       toast.error('يرجى ملء جميع الحقول المطلوبة.');
//       return;
//     }
  
//     if (!/^\d+$/.test(contract.trim())) {
//       setUploadMessage('رقم العقد يجب أن يحتوي على أرقام فقط.');
//       setShowToast(true);
//       toast.error('رقم العقد يجب أن يحتوي على أرقام فقط.');
//       return;
//     }
  
//     const contractNum = parseFloat(contract);
//     if (isNaN(contractNum)) {
//       setUploadMessage('رقم العقد يجب أن يكون رقمًا صالحًا.');
//       setShowToast(true);
//       toast.error('رقم العقد يجب أن يكون رقمًا صالحًا.');
//       return;
//     }
  
//     if (!hasExitRecord) {
//       setUploadMessage('لا يمكن إرسال النموذج بدون سجل خروج سابق.');
//       setShowToast(true);
//       toast.error('لا يمكن إرسال النموذج بدون سجل خروج سابق.');
//       return;
//     }
  
//     const requiredImages = files.filter((fileSection) => fileSection.title !== 'other_images');
//     const hasAnyRequiredImage = requiredImages.some((fileSection) => {
//       if (fileSection.imageUrls === null) return false;
//       if (Array.isArray(fileSection.imageUrls)) return fileSection.imageUrls.length > 0;
//       return fileSection.imageUrls !== '';
//     });
//     if (!hasAnyRequiredImage) {
//       setUploadMessage('يرجى رفع الصور المطلوبة.');
//       setShowToast(true);
//       toast.error('يرجى رفع الصور المطلوبة.');
//       return;
//     }
  
//     const missingImages = requiredImages.filter((fileSection) => {
//       if (fileSection.imageUrls === null) return true;
//       if (Array.isArray(fileSection.imageUrls)) return fileSection.imageUrls.length === 0;
//       return fileSection.imageUrls === '';
//     });
//     if (missingImages.length > 0) {
//       setUploadMessage(
//         `يجب رفع صورة واحدة على الأقل لكل من: ${missingImages
//           .map((f) => fieldTitlesMap[f.title] || f.title)
//           .join(', ')}.`
//       );
//       setShowToast(true);
//       toast.error(
//         `يجب رفع صورة واحدة على الأقل لكل من: ${missingImages
//           .map((f) => fieldTitlesMap[f.title] || f.title)
//           .join(', ')}.`
//       );
//       return;
//     }
  
//     const isAnyUploading = files.some((fileSection) => fileSection.isUploading) || signatureFile.isUploading;
//     if (isAnyUploading) {
//       setUploadMessage('يرجى الانتظار حتى يكتمل رفع جميع الصور أو التوقيع.');
//       setShowToast(true);
//       toast.error('يرجى الانتظار حتى يكتمل رفع جميع الصور أو التوقيع.');
//       return;
//     }
  
//     if (!user || !user.Name) {
//       setUploadMessage('بيانات الموظف غير متوفرة. يرجى تسجيل الدخول مرة أخرى.');
//       setShowToast(true);
//       toast.error('بيانات الموظف غير متوفرة. يرجى تسجيل الدخول مرة أخرى.');
//       return;
//     }
  
//     setIsUploading(true);
//     setUploadMessage('');
//     setIsSuccess(false);
  
//     try {
//       if (!user?.selectedBranch) {
//         setUploadMessage('يرجى تحديد فرع من خلال تسجيل الدخول أو اختيار فرع.');
//         setShowToast(true);
//         toast.error('يرجى تحديد فرع من خلال تسجيل الدخول أو اختيار فرع.');
//         return;
//       }
  
//       const cleanSelectedBranch = (user.selectedBranch || '').split(',')[0].trim(); // تنظيف القيمة
//       console.log('Selected branch to upload:', cleanSelectedBranch); // سجل للتصحيح
  
//       const airtableData = {
//         fields: {} as Record<string, string | string[]>,
//         client_id,
//         client_name,
//         meter_reading: newMeterReading,
//       };
  
//       airtableData.fields['السيارة'] = car.trim();
//       airtableData.fields['اللوحة'] = plate.trim();
//       airtableData.fields['العقد'] = contractNum.toString();
//       airtableData.fields['نوع العملية'] = operationType;
//       airtableData.fields['الموظف'] = user.Name;
//       airtableData.fields['الفرع'] = cleanSelectedBranch; // استخدام selectedBranch المنظف
//       // Only include signature if it exists
//       if (signatureFile.imageUrls) {
//         airtableData.fields['signature_url'] = signatureFile.imageUrls as string;
//       }
  
//       files.forEach((fileSection) => {
//         if (fileSection.imageUrls) {
//           airtableData.fields[fileSection.title] = fileSection.imageUrls;
//         }
//       });
  
//       // Rest of the submission logic remains unchanged
//       const controller = new AbortController();
// const timeoutId = setTimeout(() => controller.abort(), 120000);

// try {
//   const response = await fetch('/api/cheakin', { // تغيير إلى /api/cheakin
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(airtableData),
//     signal: controller.signal,
//   });

//   clearTimeout(timeoutId);

//   const result = await response.json();
//   console.log('Response from /api/cheakin:', result); // سجل للتصحيح

//   if (result.success) {
//     setIsSuccess(true);
//     setShowToast(true);
//     setUploadMessage('تم بنجاح رفع التشييك');
//     toast.success('تم بنجاح رفع التشييك');
//     setFiles(
//       fieldTitles.map((title, index) => ({
//         id: `file-section-${sanitizeTitle(title, index)}`,
//         imageUrls: null,
//         title: title,
//         multiple: title === 'other_images',
//         previewUrls: [],
//         isUploading: false,
//         uploadProgress: 0,
//       }))
//     );
//     setSignatureFile({
//       id: `file-section-signature_url`,
//       imageUrls: null,
//       title: 'signature_url',
//       multiple: false,
//       previewUrls: [],
//       isUploading: false,
//       uploadProgress: 0,
//     });
//     setIsSignatureLocked(false);
//     setCar('');
//     setCarSearch('');
//     setPlate('');
//     setPlateSearch('');
//     setContract('');
//     setPreviousRecord(null);
//     setHasExitRecord(false);
//     setIsContractVerified(false);
//     setClientId('');
//     setClientName('');
//     setNewMeterReading('');
//     setMeterError('');
//     fileInputRefs.current.forEach((ref) => {
//       if (ref) ref.value = '';
//     });
//     sigCanvas.current?.clear();
//     setShouldRedirect(true);
//   } else {
//     setUploadMessage(result.message || result.error || 'حدث خطأ أثناء رفع البيانات');
//     toast.error(result.message || result.error || 'حدث خطأ أثناء رفع البيانات');
//     setShowToast(true);
//     return;
//   }
// } catch (fetchError: any) {
//   clearTimeout(timeoutId);
//   if (fetchError.name === 'AbortError') {
//     setUploadMessage('انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.');
//     toast.error('انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.');
//   } else {
//     setUploadMessage('فشلت عملية الرفع: يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.');
//     toast.error('فشلت عملية الرفع: يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.');
//   }
//   setShowToast(true);
// }
//     } catch (error: any) {
//       setUploadMessage(error.message || 'حدث خطأ أثناء تجهيز البيانات للرفع.');
//       setShowToast(true);
//       toast.error(error.message || 'حدث خطأ أثناء تجهيز البيانات للرفع.');
//     } finally {
//       setIsUploading(false);
//     }
//   };
//   const handleCarSelect = (selectedCar: string) => {
//     setCar(selectedCar);
//     setCarSearch(selectedCar);
//     setShowCarList(false);
//   };

//   const handlePlateSelect = (selectedPlate: string) => {
//     setPlate(selectedPlate);
//     setPlateSearch(selectedPlate);
//     setShowPlateList(false);
//   };

//   const openPreview = (images: string[], initialIndex: number) => {
//     setPreviewImages(images);
//     setCurrentImageIndex(initialIndex);
//     setPreviewImage(images[initialIndex]);
//   };

//   const closePreview = () => {
//     setPreviewImage(null);
//     setPreviewImages([]);
//     setCurrentImageIndex(0);
//   };

//   const goToPreviousImage = () => {
//     if (currentImageIndex > 0) {
//       const newIndex = currentImageIndex - 1;
//       setCurrentImageIndex(newIndex);
//       setPreviewImage(previewImages[newIndex]);
//     }
//   };

//   const goToNextImage = () => {
//     if (currentImageIndex < previewImages.length - 1) {
//       const newIndex = currentImageIndex + 1;
//       setCurrentImageIndex(newIndex);
//       setPreviewImage(previewImages[newIndex]);
//     }
//   };

//   const clearSignature = () => {
//     sigCanvas.current?.clear();
//     if (signatureFile.imageUrls) {
//       removePreviewImage(signatureFile.id, 0);
//     }
//     setIsSignatureLocked(false);
//   };

//   return (
//     <div dir="rtl" className={`relative ${isDarkMode ? 'dark' : ''}`}>
//       <Navbar />
//       <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 p-2 transition-colors duration-200">
//         <div className="w-full max-w-4xl p-3 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg relative">
//           <h1 className="text-xl sm:text-2xl font-semibold text-center text-gray-900 dark:text-gray-100 mb-4">
//             رفع بيانات تشييك الدخول
//           </h1>
//           <form onSubmit={handleSubmit}>
//             <div className="mb-6" ref={contractInputRef}>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
//                 رقم العقد *
//               </label>
//               <div className="relative flex items-center">
//                 <input
//                   type="text"
//                   inputMode="numeric"
//                   pattern="[0-9]*"
//                   value={contract}
//                   onChange={(e) => setContract(e.target.value)}
//                   onKeyPress={(e) => {
//                     restrictToNumbers(e);
//                     handleKeyPress(e);
//                   }}
//                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
//                   placeholder="أدخل رقم العقد"
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={handleSearch}
//                   disabled={isSearching || !contract.trim()}
//                   className={`ml-2 p-2 bg-blue-600 text-white rounded-full flex items-center justify-center sm:hidden ${
//                     isSearching || !contract.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
//                   }`}
//                   aria-label="بحث برقم العقد"
//                 >
//                   {isSearching ? (
//                     <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
//                   ) : (
//                     <FaSearch className="h-5 w-5" />
//                   )}
//                 </button>
//               </div>
//             </div>

//             <div className="relative">
//               {!hasExitRecord && (
//                 <div
//                   className="absolute inset-0 bg-gray-50 dark:bg-gray-900 bg-opacity-90 z-10 flex items-start justify-center pt-16 sm:pt-20 rounded-lg"
//                   style={{ top: contractInputRef.current?.offsetHeight || 0 }}
//                 >
//                   <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-md w-full text-center">
//                     <FaExclamationTriangle className="text-yellow-500 text-4xl mx-auto mb-4" />
//                     <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
//                       {isContractVerified
//                         ? 'لا يوجد سجل خروج سابق لهذا العقد.'
//                         : 'يرجى إدخال رقم العقد للتحقق من سجل الخروج.'}
//                     </p>
//                     <p className="text-sm text-gray-600 dark:text-gray-400">
//                       أدخل رقم عقد صالح وتأكد من وجود سجل خروج سابق لتفعيل النموذج.
//                     </p>
//                   </div>
//                 </div>
//               )}

// <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
//   <div ref={carInputRef}>
//     <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
//       السيارة *
//     </label>
//     <div
//       className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 ${
//         !hasExitRecord ? 'opacity-50' : ''
//       }`}
//     >
//       {carSearch || 'غير متوفر'}
//     </div>
//   </div>
//   <div ref={plateInputRef}>
//     <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
//       اللوحة *
//     </label>
//     <div
//       className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 ${
//         !hasExitRecord ? 'opacity-50' : ''
//       }`}
//     >
//       {plateSearch || 'غير متوفر'}
//     </div>
//   </div>
//   <div>
//     <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
//       نوع العملية
//     </label>
//     <div
//       className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
//     >
//       {operationType}
//     </div>
//   </div>
//   <div>
//     <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
//       الموظف
//     </label>
//     <div
//       className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
//     >
//       {user?.Name || 'غير متوفر'}
//     </div>
//   </div>
//   <div>
//     <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
//       الفرع
//     </label>
//     <div
//   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
// >
//   {branchName || 'غير متوفر'}
// </div>
//   </div>
//   <div>
//     <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
//       هوية العميل
//     </label>
//     <div
//       className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
//     >
//       {client_id || 'غير متوفر'}
//     </div>
//   </div>
//   <div>
//     <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
//       اسم العميل
//     </label>
//     <div
//       className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
//     >
//       {client_name || 'غير متوفر'}
//     </div>
//   </div>
//   <div className="mb-6">
//   <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">
//     قراءة العداد (القراءة السابقة: {previousRecord?.meter_reading || 'غير متوفر'}) *
//   </label>
//   <input
//     type="text"
//     inputMode="numeric"
//     pattern="[0-9]*"
//     value={newMeterReading}
//     onChange={(e) => {
//       const value = e.target.value;
//       setNewMeterReading(value);

//       if (value && previousRecord?.meter_reading) {
//         const newReading = parseInt(value);
//         const previousReading = parseInt(previousRecord.meter_reading);
//         if (!isNaN(newReading) && !isNaN(previousReading)) {
//           if (newReading < previousReading) {
//             setMeterError('قراءة العداد الجديدة يجب أن تكون أكبر من أو تساوي القراءة السابقة.');
//             toast.error('قراءة العداد الجديدة يجب أن تكون أكبر من أو تساوي القراءة السابقة.');
//           } else {
//             setMeterError('');
//           }
//         } else {
//           setMeterError('يرجى إدخال رقم صالح.');
//           toast.error('يرجى إدخال رقم صالح.');
//         }
//       } else {
//         setMeterError('');
//       }
//     }}
//     onKeyPress={restrictToNumbers}
//     className={`w-full px-3 py-2 border ${
//       meterError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
//     } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
//     placeholder="اكتب قراءة العداد"
//     required
//     disabled={!hasExitRecord}
//   />
//   {meterError && (
//     <p className="text-red-500 text-xs mt-1">{meterError}</p>
//   )}
// </div>
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
//               {files.map((fileSection, index) => (
//   <div key={fileSection.id} className="mb-6">
//     <div className="font-semibold text-gray-800 dark:text-gray-100 text-base mb-1">
//       {fieldTitlesMap[fileSection.title] || fileSection.title}
//     </div>
//     <div className="grid grid-cols-1 gap-3">
//       <div className="min-w-0">
//         <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1"></div>
//         {fileSection.previewUrls && fileSection.previewUrls.length > 0 ? (
//           <div
//             className={`relative border-2 border-gray-300 dark:border-gray-600 rounded-lg p-2 ${
//               fileSection.multiple ? 'h-auto' : 'h-28 sm:h-32'
//             }`}
//           >
//             {fileSection.multiple ? (
//               <div className="grid grid-cols-2 gap-2">
//                 {fileSection.previewUrls.map((previewUrl, previewIndex) => (
//                   <div key={previewIndex} className="relative h-20 sm:h-24">
//                     <img
//                       src={previewUrl}
//                       alt={`صورة ${previewIndex + 1}`}
//                       className="h-full w-full object-cover rounded-md cursor-pointer"
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         openPreview(fileSection.previewUrls, previewIndex);
//                       }}
//                     />
//                     <button
//                       type="button"
//                       onClick={(e) => removePreviewImage(fileSection.id, previewIndex, e)}
//                       className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md"
//                       aria-label="حذف الصورة"
//                     >
//                       <span className="text-lg font-bold">×</span>
//                     </button>
//                     {!fileSection.imageUrls && (
//                       <button
//                         type="button"
//                         onClick={() => retryUpload(fileSection.id, previewIndex)}
//                         className="absolute top-0 left-0 bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md"
//                         aria-label="إعادة محاولة رفع الصورة"
//                       >
//                         <span className="text-lg font-bold">↻</span>
//                       </button>
//                     )}
//                   </div>
//                 ))}
//                 <label
//                   htmlFor={`file-input-${fileSection.id}`}
//                   className="h-20 sm:h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400"
//                 >
//                   <span className="text-gray-500 dark:text-gray-400 text-xl font-bold">+</span>
//                 </label>
//               </div>
//             ) : (
//               <div className="relative h-full w-full flex items-center justify-center">
//                 <img
//                   src={fileSection.previewUrls[0]}
//                   alt={fileSection.title}
//                   className="max-h-full max-w-full object-contain rounded-md cursor-pointer"
//                   onClick={() => openPreview([fileSection.previewUrls[0]], 0)}
//                 />
//                 <button
//                   type="button"
//                   onClick={(e) => removePreviewImage(fileSection.id, 0, e)}
//                   className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md z-10"
//                   aria-label="حذف الصورة"
//                 >
//                   <span className="text-lg font-bold">×</span>
//                 </button>
//                 {!fileSection.imageUrls && (
//                   <button
//                     type="button"
//                     onClick={() => retryUpload(fileSection.id)}
//                     className="absolute top-1 left-1 bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md z-10"
//                     aria-label="إعادة محاولة رفع الصورة"
//                   >
//                     <span className="text-lg font-bold">↻</span>
//                   </button>
//                 )}
//               </div>
//             )}
//             {fileSection.isUploading && fileSection.uploadProgress < 100 && (
//               <div className="mt-2">
//                 <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
//                   <div
//                     className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
//                     style={{ width: `${fileSection.uploadProgress}%` }}
//                   ></div>
//                 </div>
//                 <span className="text-xs text-gray-600 dark:text-gray-300 mt-1 block text-center">
//                   {fileSection.uploadProgress}%
//                 </span>
//               </div>
//             )}
//             <input
//               id={`file-input-${fileSection.id}`}
//               type="file"
//               accept="image/*"
//               capture={fileSection.multiple ? undefined : 'environment'}
//               multiple={fileSection.multiple}
//               onChange={(e) =>
//                 fileSection.multiple
//                   ? handleMultipleFileChange(fileSection.id, e)
//                   : handleFileChange(fileSection.id, e)
//               }
//               className="hidden"
//               ref={setInputRef(index)}
//               disabled={!hasExitRecord}
//             />
//           </div>
//         ) : (
//           <label
//             htmlFor={`file-input-${fileSection.id}`}
//             className={`relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-2 h-28 sm:h-32 flex items-center justify-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 ${
//               !hasExitRecord ? 'pointer-events-none opacity-50' : ''
//             }`}
//           >
//             <span className="text-gray-500 dark:text-gray-400 text-sm text-center">
//               {fileSection.multiple ? 'انقر لرفع صور' : 'انقر لالتقاط صورة'}
//             </span>
//             <input
//               id={`file-input-${fileSection.id}`}
//               type="file"
//               accept="image/*"
//               capture={fileSection.multiple ? undefined : 'environment'}
//               multiple={fileSection.multiple}
//               onChange={(e) =>
//                 fileSection.multiple
//                   ? handleMultipleFileChange(fileSection.id, e)
//                   : handleFileChange(fileSection.id, e)
//               }
//               className="hidden"
//               ref={setInputRef(index)}
//               disabled={!hasExitRecord}
//             />
//           </label>
//         )}
//       </div>
//       <div className="min-w-0">
//         <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
//           (تشييك الخروج):
//         </div>
//         {previousRecord && previousRecord[fileSection.title] ? (
//           <div className="relative border-2 border-gray-200 dark:border-gray-600 rounded-lg p-2 h-28 sm:h-32 bg-gray-50 dark:bg-gray-700">
//             <div className="relative h-full w-full flex items-center justify-center">
//               {Array.isArray(previousRecord[fileSection.title]) ? (
//                 <div className="grid grid-cols-2 gap-2 w-full h-full">
//                   {(previousRecord[fileSection.title] as string[]).map((url, imgIndex) => (
//                     <img
//                       key={imgIndex}
//                       src={url}
//                       alt={`صورة سابقة ${imgIndex + 1}`}
//                       className="max-h-full max-w-full object-cover rounded-md cursor-pointer"
//                       onClick={() => openPreview(previousRecord[fileSection.title] as string[], imgIndex)}
//                     />
//                   ))}
//                 </div>
//               ) : (
//                 <img
//                   src={previousRecord[fileSection.title] as string}
//                   alt="صورة سابقة"
//                   className="max-h-full max-w-full object-contain rounded-md cursor-pointer"
//                   onClick={() => openPreview([previousRecord[fileSection.title] as string], 0)}
//                 />
//               )}
//             </div>
//           </div>
//         ) : (
//           <div className="h-28 sm:h-32 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
//             لا توجد صورة قديمة
//           </div>
//         )}
//       </div>
//     </div>
//   </div>
// ))}
// </div>
             
//               <div className="mb-6 mt-6">
//   <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
//     التوقيع
//   </label>
//   <div className="grid grid-cols-1 gap-3">
//     <div className="min-w-0">
//       <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
//         التوقيع الجديد:
//       </div>
//       <div
//         className={`relative border-2 border-gray-300 dark:border-gray-600 rounded-md p-2 ${
//           !hasExitRecord ? 'pointer-events-none opacity-50' : ''
//         }`}
//       >
//         {signatureFile.previewUrls && signatureFile.previewUrls.length > 0 ? (
//           <div className="relative h-32 w-full flex items-center justify-center">
//             <img
//               src={signatureFile.previewUrls[0]}
//               alt="التوقيع"
//               className="max-h-full max-w-full object-contain rounded cursor-pointer"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 openPreview([signatureFile.previewUrls[0]], 0);
//               }}
//             />
//             <button
//               type="button"
//               onClick={(e) => removePreviewImage(signatureFile.id, 0, e)}
//               className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-md z-10"
//               aria-label="حذف التوقيع"
//             >
//               <span className="text-lg font-bold">×</span>
//             </button>
//           </div>
//         ) : (
//           <div className="w-full flex flex-col items-center justify-center gap-3">
//             <div className="w-full h-32">
//               <SignaturePad
//                 ref={sigCanvas}
//                 backgroundColor="#ffffff"
//                 penColor="black"
//                 canvasProps={{
//                   className: `border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md w-full h-full ${
//                     !hasExitRecord || isSignatureLocked
//                       ? 'pointer-events-none opacity-50'
//                       : ''
//                   }`,
//                 }}
//               />
//             </div>
//             <div className="flex justify-center gap-2">
//               <button
//                 type="button"
//                 onClick={clearSignature}
//                 className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
//                 disabled={!hasExitRecord}
//               >
//                 مسح التوقيع
//               </button>
//               <button
//                 type="button"
//                 onClick={() => handleSignatureSave()}
//                 className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//                 disabled={!hasExitRecord || isSignatureLocked}
//               >
//                 حفظ التوقيع
//               </button>
//             </div>
//           </div>
//         )}
//         {signatureFile.isUploading && signatureFile.uploadProgress < 100 && (
//           <div className="mt-2">
//             <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
//               <div
//                 className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
//                 style={{ width: `${signatureFile.uploadProgress}%` }}
//               ></div>
//             </div>
//             <span className="text-xs text-gray-600 dark:text-gray-300 mt-1 block text-center">
//               {signatureFile.uploadProgress}%
//             </span>
//           </div>
//         )}
//       </div>
//     </div>
//     <div className="min-w-0">
//       <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
//         التوقيع القديم (تشييك الخروج):
//       </div>
//       {previousRecord && previousRecord.signature_url ? (
//         <div className="relative border-2 border-gray-200 dark:border-gray-600 rounded-md p-2 h-32 bg-gray-50 dark:bg-gray-700">
//           <div className="relative h-full w-full flex items-center justify-center">
//             <img
//               src={previousRecord.signature_url}
//               alt="التوقيع - سابق"
//               className="max-h-full max-w-full object-contain rounded cursor-pointer"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 openPreview([previousRecord.signature_url], 0);
//               }}
//             />
//           </div>
//         </div>
//       ) : (
//         <div className="h-32 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700">
//           لا يوجد توقيع قديم
//         </div>
//       )}
//     </div>
//   </div>
// </div>
             
//               <div className="mb-4 text-center mt-4">
//                 <button
//                   type="submit"
//                   disabled={isUploading || !hasExitRecord}
//                   className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                     isUploading || !hasExitRecord ? 'opacity-50 cursor-not-allowed' : ''
//                   }`}
//                 >
//                   {isUploading ? (
//                     <span className="flex items-center">
//                       <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
//                       جارٍ الرفع...
//                     </span>
//                   ) : (
//                     'رفع التشييك'
//                   )}
//                 </button>
//               </div>
//             </div>
//           </form>
         
//           {previewImage && (
//             <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
//               <div className="relative max-w-4xl w-full p-4">
//                 <img
//                   src={previewImage}
//                   alt="معاينة الصورة"
//                   className="max-h-[80vh] max-w-full object-contain mx-auto rounded-lg"
//                 />
//                 <button
//                   onClick={closePreview}
//                   className="absolute top-4 right-4 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md"
//                   aria-label="إغلاق المعاينة"
//                 >
//                   <span className="text-lg font-bold">×</span>
//                 </button>
//                 {previewImages.length > 1 && (
//                   <>
//                     <button
//                       onClick={goToPreviousImage}
//                       disabled={currentImageIndex === 0}
//                       className={`absolute left-4 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md ${
//                         currentImageIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
//                       }`}
//                       aria-label="الصورة السابقة"
//                     >
//                       <span className="text-2xl">←</span>
//                     </button>
//                     <button
//                       onClick={goToNextImage}
//                       disabled={currentImageIndex === previewImages.length - 1}
//                       className={`absolute right-4 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md ${
//                         currentImageIndex === previewImages.length - 1
//                           ? 'opacity-50 cursor-not-allowed'
//                           : 'hover:bg-blue-700'
//                       }`}
//                       aria-label="الصورة التالية"
//                     >
//                       <span className="text-2xl">→</span>
//                     </button>
//                   </>
//                 )}
//               </div>
//             </div>
//           )}
         
//           {showToast && (
//             <div
//               className={`fixed top-5 right-5 px-4 py-2 rounded-md shadow-lg text-white flex items-center z-50 ${
//                 isSuccess ? 'bg-green-600' : 'bg-red-600'
//               }`}
//             >
//               {isSuccess ? (
//                 <FaCheckCircle className="mr-2 h-5 w-5" />
//               ) : (
//                 <FaExclamationTriangle className="mr-2 h-5 w-5" />
//               )}
//               <span>{uploadMessage}</span>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

//@ts-nocheck
//@ts-ignore
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

import AWS from 'aws-sdk';
import imageCompression from 'browser-image-compression';
import { v4 as uuidv4 } from 'uuid';
import Navbar from '@/public/components/navbar';
import { useState, useRef, useEffect, RefCallback } from 'react';
import { carList } from '@/lib/car';
import { licenseList } from '@/lib/License';
import { FaSearch, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import SignaturePad from 'react-signature-canvas';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import retry from 'async-retry';
import { FiRefreshCw } from 'react-icons/fi';
import Lightbox from 'yet-another-react-lightbox';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import Download from 'yet-another-react-lightbox/plugins/download';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/counter.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import { openDB } from 'idb';


const sanitizeTitle = (title: string, index: number) => {
  const cleanTitle = title.replace(/\s+/g, '-').replace(/[^\u0600-\u06FF\w-]/g, '');
  return `${cleanTitle}-${index}`;
};

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
  'signature_url': 'التوقيع',
};

interface FileSection {
  id: string;
  imageUrls: string | string[] | null;
  title: string;
  multiple: boolean;
  previewUrls: string[];
  isUploading: boolean;
  uploadProgress: number;
  failedUploads?: { index: number; previewUrl: string }[];
  isUploadingImages?: boolean[];
  uploadProgresses?: number[];
}

interface AirtableRecord {
  id: string;
  client_id: string;
  client_name: string;
  meter_reading: string;
  contract_number: number;
  car_model: string;
  plate_number: string;
  operation_type: string;
  employee_name: string;
  branch_name: string;
  meter?: string;
  right_doors?: string;
  front_right_fender?: string;
  rear_right_fender?: string;
  rear_bumper_with_lights?: string;
  trunk_lid?: string;
  roof?: string;
  rear_left_fender?: string;
  left_doors?: string;
  front_left_fender?: string;
  front_bumper?: string;
  hoode?: string;
  front_windshield?: string;
  trunk_contents?: string;
  fire_extinguisher?: string;
  front_right_seat?: string;
  front_left_seat?: string;
  rear_seat_with_front_seat_backs?: string;
  other_images?: string;
  signature_url?: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  results: AirtableRecord[];
  total: number;
  page: number;
  pageSize: number;
  error?: string;
  details?: any;
}

interface User {
  id: string;
  Name: string;
  EmID: number;
  role: string;
  branch: string;
  selectedBranch?: string; // إضافة selectedBranch كحقل اختياري
}

export default function CheckInPage() {
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

  const initialFiles: FileSection[] = fieldTitles.map((title, index) => ({
    id: `file-section-${sanitizeTitle(title, index)}`,
    imageUrls: null,
    title: title,
    multiple: index === fieldTitles.length - 1, // افتراض أن "صور أخرى" هي الحقل الأخير
    previewUrls: [],
    isUploading: false,
    uploadProgress: 0,
    failedUploads: [],
    isUploadingImages: [],
    uploadProgresses: [],
  }));

  const signatureSection: FileSection = {
    id: `file-section-signature_url`,
    imageUrls: null,
    title: 'signature_url',
    multiple: false,
    previewUrls: [],
    isUploading: false,
    uploadProgress: 0,
  };

  // دالة لفتح قاعدة البيانات
  async function openDatabase() {
    try {
      return await openDB('carImagesDB', 1, {
        upgrade(db, oldVersion, newVersion, transaction) {
          if (!db.objectStoreNames.contains('pendingUploads')) {
            const store = db.createObjectStore('pendingUploads', { keyPath: 'id' });
            console.log('تم إنشاء متجر pendingUploads');
          }
        },
        blocked() {
          console.warn('تم حظر فتح قاعدة البيانات');
        },
        blocking() {
          console.warn('قاعدة البيانات تحظر إصدار أحدث');
        },
        terminated() {
          console.warn('تم إنهاء اتصال قاعدة البيانات');
        }
      });
    } catch (error) {
      console.error('خطأ في فتح قاعدة البيانات:', error);
      throw new Error('فشل في الاتصال بقاعدة البيانات المحلية');
    }
  }

  const [files, setFiles] = useState<FileSection[]>(initialFiles);
  const [signatureFile, setSignatureFile] = useState<FileSection>(signatureSection);
  const [car, setCar] = useState<string>('');
  const [newMeterReading, setNewMeterReading] = useState('');
  const [carSearch, setCarSearch] = useState<string>('');
  const [showCarList, setShowCarList] = useState<boolean>(false);
  const [plate, setPlate] = useState<string>('');
  const [plateSearch, setPlateSearch] = useState<string>('');
  const [showPlateList, setShowPlateList] = useState<boolean>(false);
  const [contract, setContract] = useState<string>('');
  const [operationType] = useState<string>('دخول');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadMessage, setUploadMessage] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [previousRecord, setPreviousRecord] = useState<AirtableRecord | null>(null);
  const [hasExitRecord, setHasExitRecord] = useState<boolean>(false);
  const [isContractVerified, setIsContractVerified] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [client_id, setClientId] = useState('');
  const [client_name, setClientName] = useState('');
  const [isSignatureLocked, setIsSignatureLocked] = useState<boolean>(false);
  const [meterError, setMeterError] = useState<string>('');
  const router = useRouter();
  const [shouldRedirect, setShouldRedirect] = useState<boolean>(false);

  const sigCanvas = useRef<SignaturePad>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const carInputRef = useRef<HTMLDivElement>(null);
  const plateInputRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const uploadQueue = useRef<Promise<void>>(Promise.resolve());
  const contractInputRef = useRef<HTMLDivElement>(null);
  const [branchName, setBranchName] = useState<string>('');
  const [openLightbox, setOpenLightbox] = useState(false);
const [selectedImage, setSelectedImage] = useState<{ src: string; title: string } | null>(null);


  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      console.log('Loaded user from localStorage:', parsedUser); // سجل للتصحيح
      setUser(parsedUser);
    }
  }, []);
  
  useEffect(() => {
    cleanupOldData();
  }, []);

  useEffect(() => {
    if (shouldRedirect && !showToast) {
      // Redirect only after the toast has finished displaying
      router.push('/');
    }
  }, [shouldRedirect, showToast, router]);

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
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
        setUploadMessage('');
        setIsSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

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
      setPreviousRecord(null);
      setHasExitRecord(false);
      setIsContractVerified(false);
      setUploadMessage('');
      setShowToast(false);
      setCar('');
      setCarSearch('');
      setPlate('');
      setPlateSearch('');
    }
  }, [contract]);

  const restrictToNumbers = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const charCode = e.charCode;
    if (charCode < 48 || charCode > 57) {
      e.preventDefault();
    }
  };

  const fetchPreviousRecord = async () => {
    if (!contract.trim()) {
      setPreviousRecord(null);
      setHasExitRecord(false);
      setIsContractVerified(false);
      setUploadMessage('رقم العقد مطلوب للبحث.');
      setShowToast(true);
      return;
    }
  
    if (!/^\d+$/.test(contract.trim())) {
      setPreviousRecord(null);
      setHasExitRecord(false);
      setIsContractVerified(false);
      setUploadMessage('رقم العقد يجب أن يحتوي على أرقام فقط.');
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
      // التحقق من سجل دخول سابق
      const entryResponse = await fetch(
        `/api/history?contractNumber=${encodeURIComponent(contract)}&operationType=دخول`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: abortControllerRef.current.signal,
        }
      );
  
      if (!entryResponse.ok) {
        const errorData = await entryResponse.json().catch(() => ({}));
        throw new Error(errorData.message || `فشل في التحقق من سجل الدخول (حالة: ${entryResponse.status})`);
      }
  
      const entryData = await entryResponse.json();
      console.log('Entry check response:', entryData); // سجل للتصحيح
  
      if (entryData && Array.isArray(entryData.records) && entryData.records.length > 0) {
        setPreviousRecord(null);
        setHasExitRecord(false);
        setIsContractVerified(true);
        setUploadMessage('تم تسجيل عملية دخول لهذا العقد من قبل.');
        setShowToast(true);
        setCar('');
        setCarSearch('');
        setPlate('');
        setPlateSearch('');
        setClientId('');
        setClientName('');
        setBranchName('');
        return;
      }
  
      // التحقق من سجل خروج
      const exitResponse = await fetch(
        `/api/history?contractNumber=${encodeURIComponent(contract)}&operationType=خروج`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: abortControllerRef.current.signal,
        }
      );
  
      if (!exitResponse.ok) {
        const errorData = await exitResponse.json().catch(() => ({}));
        throw new Error(errorData.message || `فشل في التحقق من سجل الخروج (حالة: ${exitResponse.status})`);
      }
  
      const exitData = await exitResponse.json();
      console.log('Exit check response:', exitData); // سجل للتصحيح
  
      if (exitData && Array.isArray(exitData.records) && exitData.records.length > 0) {
        const exitRecord = exitData.records[0];
        setPreviousRecord(exitRecord);
        setHasExitRecord(true);
        setClientId(exitRecord.client_id || '');
        setClientName(exitRecord.client_name || '');
        setCar(exitRecord.car_model || '');
        setCarSearch(exitRecord.car_model || '');
        setPlate(exitRecord.plate_number || '');
        setPlateSearch(exitRecord.plate_number || '');
        setBranchName(exitRecord.branch_name || '');
      } else {
        setPreviousRecord(null);
        setHasExitRecord(false);
        setUploadMessage('لا يوجد سجل خروج سابق لهذا العقد.');
        setShowToast(true);
        setCar('');
        setCarSearch('');
        setPlate('');
        setPlateSearch('');
        setClientId('');
        setClientName('');
        setBranchName('');
      }
  
      setIsContractVerified(true);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return;
      }
      console.error('Error fetching previous record:', err);
      setUploadMessage(err.message || 'حدث خطأ أثناء جلب السجل السابق.');
      setShowToast(true);
      setPreviousRecord(null);
      setHasExitRecord(false);
      setIsContractVerified(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = () => {
    fetchPreviousRecord();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      fetchPreviousRecord();
    }
  };

  const filteredCars = carList.filter((carItem) =>
    carItem.toLowerCase().includes(carSearch.toLowerCase())
  );

  const filteredPlates = licenseList.filter((plateItem) =>
    plateItem.toLowerCase().includes(plateSearch.toLowerCase())
  );

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
            'image/webp', // تغيير إلى WebP
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
      maxWidthOrHeight: 1920, // الإبقاء على الدقة القصوى 1920 بكسل
      useWebWorker: true,
      fileType: 'image/webp', // تحديد صيغة الإخراج إلى WebP
      initialQuality: 0.95, // تحديد جودة أولية عالية
    };
  
    try {
      const compressedFile = await imageCompression(file, options);
      if (compressedFile.size > 32 * 1024 * 1024) {
        throw new Error('حجم الصورة المضغوطة كبير جدًا (الحد الأقصى 32 ميغابايت).');
      }
      const modifiedFile = await addDateTimeToImage(compressedFile);
      return modifiedFile;
    } catch (error) {
      console.error('Error processing image:', error);
      throw new Error('فشل في معالجة الصورة: ' + error.message);
    }
  };

  const throttle = (func: (...args: any[]) => void, limit: number) => {
    let inThrottle: boolean;
    return (...args: any[]) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  };
  
  // دالة لرفع الصورة مع إعادة المحاولة
const uploadImageToBackendWithRetry = async (
  file: File,
  fileSectionId: string,
  onProgress?: (progress: number) => void,
  retries: number = 3
): Promise<string> => {
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

      const upload = s3.upload(params);
      if (onProgress) {
        upload.on('httpUploadProgress', (progress) => {
          const percentage = Math.round((progress.loaded / progress.total) * 100);
          onProgress(percentage);
        });
      }
      const result = await upload.promise();
      return result.Location;
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

const handleSignatureSave = async () => {
  if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
    setUploadMessage('يرجى رسم التوقيع أولاً.');
    setShowToast(true);
    toast.error('يرجى رسم التوقيع أولاً.');
    return;
  }

  const rawCanvas = sigCanvas.current.getCanvas();
  const trimmedCanvas = trimCanvas(rawCanvas);
  const signatureDataUrl = trimmedCanvas.toDataURL('image/webp', 0.95);

  const blob = await fetch(signatureDataUrl).then((res) => res.blob());
  const file = new File([blob], `${uuidv4()}.webp`, { type: 'image/webp' });

  const localPreviewUrl = URL.createObjectURL(file);

  setSignatureFile((prev) => ({
    ...prev,
    previewUrls: [localPreviewUrl],
    imageUrls: null,
    isUploading: true,
    uploadProgress: 0,
  }));

  uploadQueue.current = uploadQueue.current.then(async () => {
    try {
      // تمرير المعرف الكامل مع prefix
      await saveToLocalStorage(file, `pending-upload-${signatureSection.id}`);
    } catch (error: any) {
      setUploadMessage('فشل في حفظ التوقيع مؤقتًا: ' + error.message);
      setShowToast(true);
      toast.error('فشل في حفظ التوقيع مؤقتًا: ' + error.message);
      setSignatureFile((prev) => ({
        ...prev,
        previewUrls: [],
        isUploading: false,
        uploadProgress: 0,
      }));
      URL.revokeObjectURL(localPreviewUrl);
      return;
    }

    try {
      const options = {
        maxSizeMB: 5,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/webp',
        initialQuality: 0.95,
      };
      const compressedFile = await imageCompression(file, options);
      const modifiedFile = await addDateTimeToImage(compressedFile);
      const imageUrl = await uploadImageToBackendWithRetry(modifiedFile, signatureSection.id, (progress) => {
        setSignatureFile((prev) => ({
          ...prev,
          uploadProgress: progress,
        }));
      });
      setSignatureFile((prev) => ({
        ...prev,
        imageUrls: imageUrl,
        previewUrls: [imageUrl],
        isUploading: false,
        uploadProgress: 100,
      }));
      setIsSignatureLocked(true);
      clearFromLocalStorage(`pending-upload-${signatureSection.id}`);
      URL.revokeObjectURL(localPreviewUrl);
      sigCanvas.current?.clear();
      toast.success('تم حفظ التوقيع بنجاح.');
    } catch (error: any) {
      let errorMessage = 'حدث خطأ أثناء رفع التوقيع. التوقيع محفوظ مؤقتًا ويمكن إعادة المحاولة لاحقًا.';
      if (error.message.includes('Rate limit')) {
        errorMessage = 'تم تجاوز حد رفع الصور. التوقيع محفوظ مؤقتًا.';
      }
      setUploadMessage(errorMessage);
      setShowToast(true);
      toast.error(errorMessage);
      setSignatureFile((prev) => ({
        ...prev,
        imageUrls: null,
        previewUrls: [],
        isUploading: false,
        uploadProgress: 0,
      }));
      URL.revokeObjectURL(localPreviewUrl);
    }
  });
};

  // دالة لمعالجة تغيير ملف واحد
  const handleFileChange = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
  
    const file = e.target.files[0];
    const localPreviewUrl = URL.createObjectURL(file);
    
    const isDbHealthy = await checkDatabaseHealth();
    if (!isDbHealthy) {
      console.warn('قاعدة البيانات غير متاحة، سيتم المتابعة بدون حفظ مؤقت');
    }
  
    setFiles((prevFiles) =>
      prevFiles.map((fileSection) =>
        fileSection.id === id
          ? {
              ...fileSection,
              previewUrls: [localPreviewUrl],
              imageUrls: null,
              isUploading: true,
              uploadProgress: 0,
              failedUploads: [{ index: 0, previewUrl: localPreviewUrl, uniqueId: `pending-upload-${id}` }],
            }
          : fileSection
      )
    );
  
    if (isDbHealthy) {
      try {
        await saveToLocalStorage(file, `pending-upload-${id}`);
      } catch (error: any) {
        console.warn('فشل الحفظ المؤقت، سيتم المتابعة:', error.message);
      }
    }
  
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
  
      const imageUrl = await uploadImageToBackendWithRetry(compressedFile, id, (progress) => {
        setFiles((prevFiles) =>
          prevFiles.map((fileSection) =>
            fileSection.id === id ? { ...fileSection, uploadProgress: progress } : fileSection
          )
        );
      });
  
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
  
      if (isDbHealthy) {
        await clearFromLocalStorage(`pending-upload-${id}`);
      }
      URL.revokeObjectURL(localPreviewUrl);
  
      const index = files.findIndex((fileSection) => fileSection.id === id);
      if (fileInputRefs.current[index]) {
        fileInputRefs.current[index]!.value = '';
      }
    } catch (error: any) {
      let errorMessage = 'حدث خطأ أثناء رفع الصورة.';
      if (isDbHealthy) {
        errorMessage += ' الصورة محفوظة مؤقتًا ويمكن إعادة المحاولة لاحقًا.';
      }
      
      if (error.message.includes('Rate limit')) {
        errorMessage = 'تم تجاوز حد رفع الصور.';
        if (isDbHealthy) errorMessage += ' الصورة محفوظة مؤقتًا.';
      } else if (error.message.includes('ضغط')) {
        errorMessage = 'فشل في ضغط الصورة.';
        if (isDbHealthy) errorMessage += ' الصورة محفوظة مؤقتًا.';
      }
      
      setUploadMessage(errorMessage);
      setShowToast(true);
      toast.error(errorMessage);
      setFiles((prevFiles) =>
        prevFiles.map((fileSection) =>
          fileSection.id === id
            ? { ...fileSection, isUploading: false, uploadProgress: 0 }
            : fileSection
        )
      );
    }
  };

  const handleMultipleFileChange = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
  
    const selectedFiles = Array.from(e.target.files);
    const localPreviewUrls = selectedFiles.map((file) => URL.createObjectURL(file));
    const startIndex = files.find((fileSection) => fileSection.id === id)?.previewUrls.length || 0;
  
    const isDbHealthy = await checkDatabaseHealth();
    if (!isDbHealthy) {
      console.warn('قاعدة البيانات غير متاحة، سيتم المتابعة بدون حفظ مؤقت');
    }
  
    setFiles((prevFiles) =>
      prevFiles.map((fileSection) =>
        fileSection.id === id
          ? {
              ...fileSection,
              previewUrls: [...fileSection.previewUrls, ...localPreviewUrls],
              failedUploads: [
                ...(fileSection.failedUploads || []),
                ...localPreviewUrls.map((url, idx) => ({
                  index: startIndex + idx,
                  previewUrl: url,
                  uniqueId: `pending-upload-${id}-${startIndex + idx}`,
                })),
              ],
              isUploadingImages: [...(fileSection.isUploadingImages || []), ...selectedFiles.map(() => true)],
              uploadProgresses: [...(fileSection.uploadProgresses || []), ...selectedFiles.map(() => 0)],
            }
          : fileSection
      )
    );
  
    const uploadPromises = selectedFiles.map(async (file, index) => {
      const uniqueId = `pending-upload-${id}-${startIndex + index}`;
      console.log(`Saving file with ID: ${uniqueId}`);
  
      if (isDbHealthy) {
        try {
          await saveToLocalStorage(file, uniqueId);
        } catch (error: any) {
          console.warn(`فشل حفظ الصورة ${index + 1} مؤقتًا: ${error.message}`);
        }
      }
  
      try {
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
  
        const imageUrl = await uploadImageToBackendWithRetry(compressedFile, uniqueId, (progress) => {
          setFiles((prevFiles) =>
            prevFiles.map((fileSection) =>
              fileSection.id === id
                ? {
                    ...fileSection,
                    uploadProgresses: fileSection.uploadProgresses?.map((p, i) =>
                      i === startIndex + index ? progress : p
                    ),
                  }
                : fileSection
            )
          );
        });
  
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
  
        if (isDbHealthy) {
          await clearFromLocalStorage(uniqueId);
        }
        return { index: startIndex + index, url: imageUrl };
      } catch (error: any) {
        setUploadMessage(
          `فشل رفع الصورة ${index + 1}. ${isDbHealthy ? 'الصورة محفوظة مؤقتًا ويمكن إعادة المحاولة لاحقًا.' : ''}`
        );
        setShowToast(true);
        toast.error(`فشل رفع الصورة ${index + 1}: ${error.message}`);
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
  
    const results = await Promise.all(uploadPromises);
  
    results.forEach((result, index) => {
      if (result.url) {
        URL.revokeObjectURL(localPreviewUrls[index]);
      }
    });
  
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
          console.error('Error deleting:', err);
          reject(new Error(`فشل في حذف الملف: ${fileKey}`));
        } else {
          console.log('File deleted successfully:', fileKey);
          resolve();
        }
      });
    });
  };

  // دالة لإزالة صورة المعاينة
  const removePreviewImage = async (fileId: string, previewIndex: number) => {
    let fileKeyToDelete: string | null = null;
  
    setFiles((prevFiles) =>
      prevFiles.map((fileSection) => {
        if (fileSection.id === fileId) {
          const updatedPreviews = [...fileSection.previewUrls];
          const deletedPreviewUrl = updatedPreviews.splice(previewIndex, 1)[0];
          let updatedImageUrls = fileSection.imageUrls;
  
          if (deletedPreviewUrl) {
            try {
              const urlParts = deletedPreviewUrl.split('/');
              fileKeyToDelete = urlParts[urlParts.length - 1];
            } catch (error) {
              console.error('Error extracting file key:', error);
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
            const uniqueId = `pending-upload-${fileId}-${previewIndex}`;
            clearFromLocalStorage(uniqueId);
          } else {
            clearFromLocalStorage(fileId);
          }
  
          return {
            ...fileSection,
            previewUrls: updatedPreviews,
            imageUrls: updatedImageUrls,
            failedUploads: updatedFailedUploads,
            isUploadingImages: fileSection.isUploadingImages?.filter((_, i) => i !== previewIndex) || [],
            uploadProgresses: fileSection.uploadProgresses?.filter((_, i) => i !== previewIndex) || [],
          };
        }
        return fileSection;
      })
    );
  
    if (fileKeyToDelete) {
      try {
        await deleteFile(fileKeyToDelete);
      } catch (err) {
        console.error('Error deleting file from S3:', err);
      }
    }
  
    const index = files.findIndex((fileSection) => fileSection.id === fileId);
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index]!.value = '';
    }
  };

  // دالة لحفظ الصورة في IndexedDB
  const saveToLocalStorage = async (file: File, fileSectionId: string): Promise<void> => {
    let db = null;
    
    try {
      const MAX_SIZE = 20 * 1024 * 1024; // 20 MB
      if (file.size > MAX_SIZE) {
        throw new Error(`حجم الصورة كبير جدًا للحفظ في IndexedDB (الحد الأقصى ${MAX_SIZE / (1024 * 1024)} ميغابايت).`);
      }
  
      const options = {
        maxSizeMB: 20,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/webp',
        initialQuality: 0.95,
      };
  
      const compressedFile = await imageCompression(file, options);
      
      if (compressedFile.size > MAX_SIZE) {
        throw new Error(`حجم الصورة المضغوطة كبير جدًا للحفظ في IndexedDB (الحد الأقصى ${MAX_SIZE / (1024 * 1024)} ميغابايت).`);
      }
  
      db = await openDatabase();
      if (!db) {
        throw new Error('فشل في الاتصال بقاعدة البيانات');
      }
  
      const transaction = db.transaction(['pendingUploads'], 'readwrite');
      const store = transaction.objectStore('pendingUploads');
      
      await store.put({
        id: fileSectionId, // استخدام المعرف كما هو
        file: compressedFile,
        timestamp: Date.now(),
        originalSize: file.size,
        compressedSize: compressedFile.size
      });
  
      await transaction.complete;
      console.log(`تم حفظ الصورة بنجاح: ${fileSectionId}`);
  
    } catch (error) {
      console.error('خطأ في حفظ الصورة:', error);
      throw new Error('فشل في حفظ الصورة مؤقتًا في IndexedDB: ' + error.message);
    } finally {
      if (db) {
        try {
          db.close();
        } catch (closeError) {
          console.warn('تحذير: خطأ في إغلاق قاعدة البيانات:', closeError);
        }
      }
    }
  };
  
  // دالة لاسترجاع الصورة من IndexedDB
  const getFromLocalStorage = async (fileSectionId: string): Promise<File | null> => {
    let db = null;
    
    try {
      db = await openDatabase();
      
      if (!db) {
        console.warn('لا يمكن فتح قاعدة البيانات');
        return null;
      }
  
      const transaction = db.transaction(['pendingUploads'], 'readonly');
      const store = transaction.objectStore('pendingUploads');
      
      const data = await store.get(fileSectionId);
      
      await transaction.complete;
  
      if (!data || !data.file) {
        console.log(`لا توجد بيانات محفوظة للمعرف: ${fileSectionId}`);
        return null;
      }
      
      const restoredFile = new File([data.file], `${fileSectionId}.webp`, { 
        type: 'image/webp',
        lastModified: data.timestamp || Date.now()
      });
      
      console.log(`تم استرجاع الصورة بنجاح: ${fileSectionId}`);
      return restoredFile;
  
    } catch (error) {
      console.error('فشل في استرجاع الصورة من IndexedDB:', error);
      return null;
    } finally {
      if (db) {
        try {
          db.close();
        } catch (closeError) {
          console.warn('تحذير: خطأ في إغلاق قاعدة البيانات:', closeError);
        }
      }
    }
  };
  
  
  // دالة لحذف الصورة من IndexedDB
  const clearFromLocalStorage = async (fileSectionId: string): Promise<void> => {
    let db = null;
    
    try {
      db = await openDatabase();
      
      if (!db) {
        console.warn('لا يمكن فتح قاعدة البيانات للحذف');
        return;
      }
  
      const transaction = db.transaction(['pendingUploads'], 'readwrite');
      const store = transaction.objectStore('pendingUploads');
      
      await store.delete(fileSectionId);
      
      await transaction.complete;
      
      console.log(`تم حذف الصورة بنجاح: ${fileSectionId}`);
  
    } catch (error) {
      console.error('فشل في حذف الصورة من IndexedDB:', error);
    } finally {
      if (db) {
        try {
          db.close();
        } catch (closeError) {
          console.warn('تحذير: خطأ في إغلاق قاعدة البيانات:', closeError);
        }
      }
    }
  };

  const cleanupOldData = async (maxAge: number = 24 * 60 * 60 * 1000): Promise<void> => {
    let db = null;
    
    try {
      db = await openDatabase();
      
      if (!db) {
        return;
      }
  
      const transaction = db.transaction(['pendingUploads'], 'readwrite');
      const store = transaction.objectStore('pendingUploads');
      
      const allData = await store.getAll();
      const now = Date.now();
      
      for (const item of allData) {
        if (item.timestamp && (now - item.timestamp) > maxAge) {
          await store.delete(item.id);
          console.log(`تم حذف البيانات القديمة: ${item.id}`);
        }
      }
      
      await transaction.complete;
      
    } catch (error) {
      console.error('خطأ في تنظيف البيانات القديمة:', error);
    } finally {
      if (db) {
        try {
          db.close();
        } catch (closeError) {
          console.warn('تحذير: خطأ في إغلاق قاعدة البيانات:', closeError);
        }
      }
    }
  };
  const checkDatabaseHealth = async (): Promise<boolean> => {
    let db = null;
    
    try {
      db = await openDatabase();
      
      if (!db) {
        return false;
      }
      
      const transaction = db.transaction(['pendingUploads'], 'readonly');
      const store = transaction.objectStore('pendingUploads');
      await store.count();
      await transaction.complete;
      
      return true;
      
    } catch (error) {
      console.error('خطأ في فحص قاعدة البيانات:', error);
      return false;
    } finally {
      if (db) {
        try {
          db.close();
        } catch (closeError) {
          console.warn('تحذير: خطأ في إغلاق قاعدة البيانات:', closeError);
        }
      }
    }
  };
  
const retryUpload = async (fileSectionId: string, index?: number): Promise<void> => {
  let uniqueId: string;

  // البحث عن uniqueId في failedUploads
  const fileSection = files.find((fs) => fs.id === fileSectionId);
  if (fileSection && fileSection.failedUploads && index !== undefined) {
    const failedUpload = fileSection.failedUploads.find((failed) => failed.index === index);
    if (failedUpload && failedUpload.uniqueId) {
      uniqueId = failedUpload.uniqueId;
    } else {
      uniqueId = `pending-upload-${fileSectionId}`;
    }
  } else {
    uniqueId = `pending-upload-${fileSectionId}`;
  }

  console.log(`Attempting to retry upload for: ${uniqueId}`);

  // البحث بالمعرف الصحيح
  const file = await getFromLocalStorage(uniqueId);
  if (!file) {
    console.warn(`No file found in IndexedDB for ${uniqueId}`);
    setUploadMessage('لا توجد صورة محفوظة لإعادة المحاولة.');
    setShowToast(true);
    toast.error('لا توجد صورة محفوظة لإعادة المحاولة.');
    return;
  }

  let localPreviewUrl = '';
  try {
    localPreviewUrl = URL.createObjectURL(file);

    // تحديث حالة الرفع - بدء الرفع
    if (fileSection?.multiple) {
      // للملفات المتعددة
      setFiles((prevFiles) =>
        prevFiles.map((fileSection) =>
          fileSection.id === fileSectionId
            ? {
                ...fileSection,
                isUploadingImages: fileSection.isUploadingImages?.map((status, i) =>
                  i === index ? true : status
                ) || (index !== undefined ? Array(index + 1).fill(false).map((_, i) => i === index) : [true]),
                uploadProgresses: fileSection.uploadProgresses?.map((progress, i) =>
                  i === index ? 0 : progress
                ) || (index !== undefined ? Array(index + 1).fill(0).map((_, i) => i === index ? 0 : 0) : [0]),
              }
            : fileSection
        )
      );
    } else {
      // للملف المفرد
      setFiles((prevFiles) =>
        prevFiles.map((fileSection) =>
          fileSection.id === fileSectionId
            ? {
                ...fileSection,
                isUploading: true,
                uploadProgress: 0,
              }
            : fileSection
        )
      );
    }

    // مرحلة الحفظ المؤقت - 30%
    if (fileSection?.multiple) {
      setFiles((prevFiles) =>
        prevFiles.map((fileSection) =>
          fileSection.id === fileSectionId
            ? {
                ...fileSection,
                uploadProgresses: fileSection.uploadProgresses?.map((progress, i) =>
                  i === index ? 30 : progress
                ) || (index !== undefined ? Array(index + 1).fill(0).map((_, i) => i === index ? 30 : 0) : [30]),
              }
            : fileSection
        )
      );
    } else {
      setFiles((prevFiles) =>
        prevFiles.map((fileSection) =>
          fileSection.id === fileSectionId
            ? { ...fileSection, uploadProgress: 30 }
            : fileSection
        )
      );
    }

    // ضغط الصورة
    const compressedFile = await compressImage(file);

    // مرحلة الضغط - 60%
    if (fileSection?.multiple) {
      setFiles((prevFiles) =>
        prevFiles.map((fileSection) =>
          fileSection.id === fileSectionId
            ? {
                ...fileSection,
                uploadProgresses: fileSection.uploadProgresses?.map((progress, i) =>
                  i === index ? 60 : progress
                ) || (index !== undefined ? Array(index + 1).fill(0).map((_, i) => i === index ? 60 : 0) : [60]),
              }
            : fileSection
        )
      );
    } else {
      setFiles((prevFiles) =>
        prevFiles.map((fileSection) =>
          fileSection.id === fileSectionId
            ? { ...fileSection, uploadProgress: 60 }
            : fileSection
        )
      );
    }

    // رفع الملف
    const imageUrl = await uploadImageToBackendWithRetry(compressedFile, uniqueId, (progress) => {
      if (fileSection?.multiple) {
        setFiles((prevFiles) =>
          prevFiles.map((fileSection) =>
            fileSection.id === fileSectionId
              ? {
                  ...fileSection,
                  uploadProgresses: fileSection.uploadProgresses?.map((p, i) =>
                    i === index ? progress : p
                  ) || (index !== undefined ? Array(index + 1).fill(0).map((_, i) => i === index ? progress : 0) : [progress]),
                }
              : fileSection
          )
        );
      } else {
        setFiles((prevFiles) =>
          prevFiles.map((fileSection) =>
            fileSection.id === fileSectionId
              ? { ...fileSection, uploadProgress: progress }
              : fileSection
          )
        );
      }
    });

    // تحديث حالة النجاح
    setFiles((prevFiles) =>
      prevFiles.map((fileSection) => {
        if (fileSection.id === fileSectionId) {
          if (fileSection.multiple) {
            // للملفات المتعددة
            const updatedPreviewUrls = [...(fileSection.previewUrls || [])];
            if (index !== undefined && index < updatedPreviewUrls.length) {
              updatedPreviewUrls[index] = imageUrl;
            } else if (index !== undefined) {
              // إذا كان المؤشر أكبر من الطول الحالي، قم بتوسيع المصفوفة
              while (updatedPreviewUrls.length <= index) {
                updatedPreviewUrls.push('');
              }
              updatedPreviewUrls[index] = imageUrl;
            }

            return {
              ...fileSection,
              imageUrls: Array.isArray(fileSection.imageUrls) 
                ? [...fileSection.imageUrls, imageUrl] 
                : [imageUrl],
              previewUrls: updatedPreviewUrls,
              failedUploads: (fileSection.failedUploads || []).filter(
                (failed) => failed.index !== (index ?? 0)
              ),
              isUploadingImages: fileSection.isUploadingImages?.map((status, i) =>
                i === index ? false : status
              ) || [],
              uploadProgresses: fileSection.uploadProgresses?.map((progress, i) =>
                i === index ? 100 : progress
              ) || (index !== undefined ? Array(index + 1).fill(0).map((_, i) => i === index ? 100 : 0) : [100]),
            };
          } else {
            // للملف المفرد
            return {
              ...fileSection,
              imageUrls: imageUrl,
              previewUrls: [imageUrl],
              isUploading: false,
              uploadProgress: 100,
              failedUploads: [],
              isUploadingImages: [],
              uploadProgresses: [],
            };
          }
        }
        return fileSection;
      })
    );

    // حذف الملف من التخزين المؤقت
    await clearFromLocalStorage(uniqueId);
    
    // تنظيف URL المؤقت
    URL.revokeObjectURL(localPreviewUrl);
    
    // إعادة تعيين input file
    const sectionIndex = files.findIndex((fileSection) => fileSection.id === fileSectionId);
    if (fileInputRefs.current[sectionIndex]) {
      fileInputRefs.current[sectionIndex]!.value = '';
    }
    
    // رسائل النجاح
    setUploadMessage('تم إعادة رفع الصورة بنجاح.');
    setShowToast(true);
    toast.success('تم إعادة رفع الصورة بنجاح.');
    
    console.log(`Successfully retried upload for: ${uniqueId}`);
    
  } catch (error: any) {
    console.error(`Failed to retry upload for ${uniqueId}:`, error);
    
    // معالجة الأخطاء المختلفة
    let errorMessage = 'فشل إعادة رفع الصورة: ';
    if (error.message.includes('Rate limit')) {
      errorMessage += 'تم تجاوز حد رفع الصور. يرجى المحاولة لاحقاً.';
    } else if (error.message.includes('ضغط')) {
      errorMessage += 'فشل في ضغط الصورة.';
    } else if (error.message.includes('Network')) {
      errorMessage += 'مشكلة في الاتصال بالإنترنت.';
    } else {
      errorMessage += error.message;
    }
    
    setUploadMessage(errorMessage);
    setShowToast(true);
    toast.error(errorMessage);
    
    // إعادة تعيين حالة الرفع
    if (fileSection?.multiple) {
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
    } else {
      setFiles((prevFiles) =>
        prevFiles.map((fileSection) =>
          fileSection.id === fileSectionId
            ? {
                ...fileSection,
                isUploading: false,
                uploadProgress: 0,
              }
            : fileSection
        )
      );
    }
    
    // تنظيف URL المؤقت في حالة الخطأ
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
    }
  }
};




  const setInputRef = (index: number): RefCallback<HTMLInputElement> => {
    return (element: HTMLInputElement | null) => {
      fileInputRefs.current[index] = element;
    };
  };



  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    if (meterError) {
      setUploadMessage(meterError);
      setShowToast(true);
      toast.error(meterError);
      return;
    }
  
    if (parseInt(newMeterReading) < parseInt(previousRecord?.meter_reading || '0')) {
      setUploadMessage('قراءة العداد الجديدة يجب أن تكون أكبر من أو تساوي القراءة السابقة.');
      setShowToast(true);
      toast.error('قراءة العداد الجديدة يجب أن تكون أكبر من أو تساوي القراءة السابقة.');
      return;
    }
  
    if (!contract.trim() || !car.trim() || !plate.trim()) {
      setUploadMessage('يرجى ملء جميع الحقول المطلوبة.');
      setShowToast(true);
      toast.error('يرجى ملء جميع الحقول المطلوبة.');
      return;
    }
  
    if (!/^\d+$/.test(contract.trim())) {
      setUploadMessage('رقم العقد يجب أن يحتوي على أرقام فقط.');
      setShowToast(true);
      toast.error('رقم العقد يجب أن يحتوي على أرقام فقط.');
      return;
    }
  
    const contractNum = parseFloat(contract);
    if (isNaN(contractNum)) {
      setUploadMessage('رقم العقد يجب أن يكون رقمًا صالحًا.');
      setShowToast(true);
      toast.error('رقم العقد يجب أن يكون رقمًا صالحًا.');
      return;
    }
  
    if (!hasExitRecord) {
      setUploadMessage('لا يمكن إرسال النموذج بدون سجل خروج سابق.');
      setShowToast(true);
      toast.error('لا يمكن إرسال النموذج بدون سجل خروج سابق.');
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
      toast.error('يرجى رفع الصور المطلوبة.');
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
          .map((f) => fieldTitlesMap[f.title] || f.title)
          .join(', ')}.`
      );
      setShowToast(true);
      toast.error(
        `يجب رفع صورة واحدة على الأقل لكل من: ${missingImages
          .map((f) => fieldTitlesMap[f.title] || f.title)
          .join(', ')}.`
      );
      return;
    }
  
    const isAnyUploading = files.some(
      (fileSection) =>
        fileSection.isUploading || fileSection.isUploadingImages?.some((status) => status)
    ) || signatureFile.isUploading;
    if (isAnyUploading) {
      setUploadMessage('يرجى الانتظار حتى يكتمل رفع جميع الصور أو التوقيع.');
      setShowToast(true);
      toast.error('يرجى الانتظار حتى يكتمل رفع جميع الصور أو التوقيع.');
      return;
    }
  
    const hasPendingUploads = files.some((fileSection) => fileSection.failedUploads?.length > 0);
    if (hasPendingUploads) {
      setUploadMessage('هناك صور فشل رفعها. يرجى إعادة المحاولة أو إزالتها قبل الإرسال.');
      setShowToast(true);
      toast.error('هناك صور فشل رفعها. يرجى إعادة المحاولة أو إزالتها قبل الإرسال.');
      return;
    }
  
    if (!user || !user.Name) {
      setUploadMessage('بيانات الموظف غير متوفرة. يرجى تسجيل الدخول مرة أخرى.');
      setShowToast(true);
      toast.error('بيانات الموظف غير متوفرة. يرجى تسجيل الدخول مرة أخرى.');
      return;
    }
  
    setIsUploading(true);
    setUploadMessage('');
    setIsSuccess(false);
  
    try {
      if (!user?.selectedBranch) {
        setUploadMessage('يرجى تحديد فرع من خلال تسجيل الدخول أو اختيار فرع.');
        setShowToast(true);
        toast.error('يرجى تحديد فرع من خلال تسجيل الدخول أو اختيار فرع.');
        return;
      }
  
      const cleanSelectedBranch = (user.selectedBranch || '').split(',')[0].trim();
  
      const airtableData = {
        fields: {} as Record<string, string | string[]>,
        client_id,
        client_name,
        meter_reading: newMeterReading,
      };
  
      airtableData.fields['السيارة'] = car.trim();
      airtableData.fields['اللوحة'] = plate.trim();
      airtableData.fields['العقد'] = contractNum.toString();
      airtableData.fields['نوع العملية'] = operationType;
      airtableData.fields['الموظف'] = user.Name;
      airtableData.fields['الفرع'] = cleanSelectedBranch;
      if (signatureFile.imageUrls) {
        airtableData.fields['signature_url'] = signatureFile.imageUrls as string;
      }
  
      files.forEach((fileSection) => {
        if (fileSection.imageUrls) {
          airtableData.fields[fileSection.title] = fileSection.imageUrls;
        }
      });
  
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);
  
      try {
        const response = await fetch('/api/cheakin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(airtableData),
          signal: controller.signal,
        });
  
        clearTimeout(timeoutId);
  
        const result = await response.json();
        console.log('Response from /api/cheakin:', result);
  
        if (result.success) {
          setIsSuccess(true);
          setShowToast(true);
          setUploadMessage('تم بنجاح رفع التشييك');
          toast.success('تم بنجاح رفع التشييك');
          setFiles(
            fieldTitles.map((title, index) => ({
              id: `file-section-${sanitizeTitle(title, index)}`,
              imageUrls: null,
              title: title,
              multiple: title === 'other_images',
              previewUrls: [],
              isUploading: false,
              uploadProgress: 0,
              failedUploads: [],
              isUploadingImages: [],
              uploadProgresses: [],
            }))
          );
          setSignatureFile({
            id: `file-section-signature_url`,
            imageUrls: null,
            title: 'signature_url',
            multiple: false,
            previewUrls: [],
            isUploading: false,
            uploadProgress: 0,
            failedUploads: [],
            isUploadingImages: [],
            uploadProgresses: [],
          });
          setIsSignatureLocked(false);
          setCar('');
          setCarSearch('');
          setPlate('');
          setPlateSearch('');
          setContract('');
          setPreviousRecord(null);
          setHasExitRecord(false);
          setIsContractVerified(false);
          setClientId('');
          setClientName('');
          setNewMeterReading('');
          setMeterError('');
          fileInputRefs.current.forEach((ref) => {
            if (ref) ref.value = '';
          });
          sigCanvas.current?.clear();
          setShouldRedirect(true);
        } else {
          setUploadMessage(result.message || result.error || 'حدث خطأ أثناء رفع البيانات');
          toast.error(result.message || result.error || 'حدث خطأ أثناء رفع البيانات');
          setShowToast(true);
          return;
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          setUploadMessage('انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.');
          toast.error('انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.');
        } else {
          setUploadMessage('فشلت عملية الرفع: يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.');
          toast.error('فشلت عملية الرفع: يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.');
        }
        setShowToast(true);
      }
    } catch (error: any) {
      setUploadMessage(error.message || 'حدث خطأ أثناء تجهيز البيانات للرفع.');
      setShowToast(true);
      toast.error(error.message || 'حدث خطأ أثناء تجهيز البيانات للرفع.');
    } finally {
      setIsUploading(false);
    }
  };
  const handleCarSelect = (selectedCar: string) => {
    setCar(selectedCar);
    setCarSearch(selectedCar);
    setShowCarList(false);
  };

  const handlePlateSelect = (selectedPlate: string) => {
    setPlate(selectedPlate);
    setPlateSearch(selectedPlate);
    setShowPlateList(false);
  };

  const openPreview = (imageSrc: string, title: string) => {
    setSelectedImage({ src: imageSrc, title });
    setOpenLightbox(true);
  };

  const closePreview = () => {
    setPreviewImage(null);
    setPreviewImages([]);
    setCurrentImageIndex(0);
  };

  const goToPreviousImage = () => {
    if (currentImageIndex > 0) {
      const newIndex = currentImageIndex - 1;
      setCurrentImageIndex(newIndex);
      setPreviewImage(previewImages[newIndex]);
    }
  };

  const goToNextImage = () => {
    if (currentImageIndex < previewImages.length - 1) {
      const newIndex = currentImageIndex + 1;
      setCurrentImageIndex(newIndex);
      setPreviewImage(previewImages[newIndex]);
    }
  };

  const clearSignature = () => {
    sigCanvas.current?.clear();
    if (signatureFile.imageUrls) {
      removePreviewImage(signatureFile.id, 0);
    }
    setIsSignatureLocked(false);
  };

  return (
    <div dir="rtl" className={`relative ${isDarkMode ? 'dark' : ''}`}>
      <Navbar />
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 p-2 transition-colors duration-200">
        <div className="w-full max-w-4xl p-3 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg relative">
          <h1 className="text-xl sm:text-2xl font-semibold text-center text-gray-900 dark:text-gray-100 mb-4">
            رفع بيانات تشييك الدخول
          </h1>
          <form onSubmit={handleSubmit}>
            <div className="mb-6" ref={contractInputRef}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                رقم العقد *
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={contract}
                  onChange={(e) => setContract(e.target.value)}
                  onKeyPress={(e) => {
                    restrictToNumbers(e);
                    handleKeyPress(e);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="أدخل رقم العقد"
                  required
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={isSearching || !contract.trim()}
                  className={`ml-2 p-2 bg-blue-600 text-white rounded-full flex items-center justify-center sm:hidden ${
                    isSearching || !contract.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                  }`}
                  aria-label="بحث برقم العقد"
                >
                  {isSearching ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <FaSearch className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="relative">
              {!hasExitRecord && (
                <div
                  className="absolute inset-0 bg-gray-50 dark:bg-gray-900 bg-opacity-90 z-10 flex items-start justify-center pt-16 sm:pt-20 rounded-lg"
                  style={{ top: contractInputRef.current?.offsetHeight || 0 }}
                >
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-md w-full text-center">
                    <FaExclamationTriangle className="text-yellow-500 text-4xl mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {isContractVerified
                        ? 'لا يوجد سجل خروج سابق لهذا العقد.'
                        : 'يرجى إدخال رقم العقد للتحقق من سجل الخروج.'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      أدخل رقم عقد صالح وتأكد من وجود سجل خروج سابق لتفعيل النموذج.
                    </p>
                  </div>
                </div>
              )}

<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
  <div ref={carInputRef}>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
      السيارة *
    </label>
    <div
      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 ${
        !hasExitRecord ? 'opacity-50' : ''
      }`}
    >
      {carSearch || 'غير متوفر'}
    </div>
  </div>
  <div ref={plateInputRef}>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
      اللوحة *
    </label>
    <div
      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 ${
        !hasExitRecord ? 'opacity-50' : ''
      }`}
    >
      {plateSearch || 'غير متوفر'}
    </div>
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
      نوع العملية
    </label>
    <div
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
    >
      {operationType}
    </div>
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
      الموظف
    </label>
    <div
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
    >
      {user?.Name || 'غير متوفر'}
    </div>
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
      الفرع
    </label>
    <div
  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
>
  {branchName || 'غير متوفر'}
</div>
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
      هوية العميل
    </label>
    <div
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
    >
      {client_id || 'غير متوفر'}
    </div>
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
      اسم العميل
    </label>
    <div
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
    >
      {client_name || 'غير متوفر'}
    </div>
  </div>
  <div className="mb-6">
  <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">
    قراءة العداد (القراءة السابقة: {previousRecord?.meter_reading || 'غير متوفر'}) *
  </label>
  <input
    type="text"
    inputMode="numeric"
    pattern="[0-9]*"
    value={newMeterReading}
    onChange={(e) => {
      const value = e.target.value;
      setNewMeterReading(value);

      if (value && previousRecord?.meter_reading) {
        const newReading = parseInt(value);
        const previousReading = parseInt(previousRecord.meter_reading);
        if (!isNaN(newReading) && !isNaN(previousReading)) {
          if (newReading < previousReading) {
            setMeterError('قراءة العداد الجديدة يجب أن تكون أكبر من أو تساوي القراءة السابقة.');
            toast.error('قراءة العداد الجديدة يجب أن تكون أكبر من أو تساوي القراءة السابقة.');
          } else {
            setMeterError('');
          }
        } else {
          setMeterError('يرجى إدخال رقم صالح.');
          toast.error('يرجى إدخال رقم صالح.');
        }
      } else {
        setMeterError('');
      }
    }}
    onKeyPress={restrictToNumbers}
    className={`w-full px-3 py-2 border ${
      meterError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
    placeholder="اكتب قراءة العداد"
    required
    disabled={!hasExitRecord}
  />
  {meterError && (
    <p className="text-red-500 text-xs mt-1">{meterError}</p>
  )}
</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
              {files.map((fileSection, index) => (
  <div key={fileSection.id} className="mb-6">
    <div className="font-semibold text-gray-800 dark:text-gray-100 text-base mb-1">
      {fieldTitlesMap[fileSection.title] || fileSection.title}
    </div>
    <div className="grid grid-cols-1 gap-3">
      <div className="min-w-0">
        <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1"></div>
        {fileSection.previewUrls && fileSection.previewUrls.length > 0 ? (
          <div
            className={`relative border-2 border-gray-300 dark:border-gray-600 rounded-lg p-2 ${
              fileSection.multiple ? 'h-auto' : 'h-28 sm:h-32'
            }`}
          >
            {fileSection.multiple ? (
              <div className="grid grid-cols-2 gap-2">
                {fileSection.previewUrls.map((previewUrl, previewIndex) => (
                  <div key={previewIndex} className="relative h-20 sm:h-24">
                    <img
                      src={previewUrl}
                      alt={`صورة ${previewIndex + 1}`}
                      className="h-full w-full object-cover rounded-md cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        openPreview(previewUrl, fieldTitlesMap[fileSection.title]);
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => removePreviewImage(fileSection.id, previewIndex, e)}
                      className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md"
                      aria-label="حذف الصورة"
                    >
                      <span className="text-lg font-bold">×</span>
                    </button>
                    {fileSection.failedUploads?.map((failed) =>
  failed.index === previewIndex ? (
    <button
      key={`retry-${previewIndex}`}
      type="button"
      onClick={() => retryUpload(fileSection.id, failed.index)}
      className="absolute top-1 left-1 bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md z-10"
      aria-label="إعادة محاولة رفع الصورة"
    >
      <FiRefreshCw className="text-sm" />
    </button>
  ) : null
)}
{fileSection.isUploadingImages?.[previewIndex] && (
  <div className="w-full bg-gray-200 rounded-full h-2.5">
    <div
      className="bg-blue-600 h-2.5 rounded-full"
      style={{ width: `${fileSection.uploadProgresses?.[previewIndex] || 0}%` }}
    ></div>
  </div>
)}
                  </div>
                ))}
                <label
                  htmlFor={`file-input-${fileSection.id}`}
                  className="h-20 sm:h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400"
                >
                  <span className="text-gray-500 dark:text-gray-400 text-xl font-bold">+</span>
                </label>
              </div>
            ) : (
              <div className="relative h-full w-full">
                <img
                  src={fileSection.previewUrls[0]}
                  alt={fileSection.title}
                  className="h-full w-full object-cover rounded-md cursor-pointer"
                  onClick={() => openPreview(fileSection.previewUrls[0], fieldTitlesMap[fileSection.title])}
                />
                <button
                  type="button"
                  onClick={(e) => removePreviewImage(fileSection.id, 0, e)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md z-10"
                  aria-label="حذف الصورة"
                >
                  <span className="text-lg font-bold">×</span>
                </button>
                {fileSection.failedUploads?.some((failed) => failed.index === 0) && (
                  <button
                    type="button"
                    onClick={() => retryUpload(fileSection.id, 0)}
                    className="absolute top-1 left-1 bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md z-10"
                    aria-label="إعادة محاولة رفع الصورة"
                  >
                    <FiRefreshCw className="text-sm" />
                  </button>
                )}
                {fileSection.isUploading && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${fileSection.uploadProgress || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-300 mt-1 block text-center">
                      {Math.round(fileSection.uploadProgress || 0)}%
                    </span>
                  </div>
                )}
              </div>
            )}
            <input
              id={`file-input-${fileSection.id}`}
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
              ref={setInputRef(index)}
              disabled={!hasExitRecord}
            />
          </div>
        ) : (
          <label
            htmlFor={`file-input-${fileSection.id}`}
            className={`relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-2 h-28 sm:h-32 flex items-center justify-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 ${
              !hasExitRecord ? 'pointer-events-none opacity-50' : ''
            }`}
          >
            <span className="text-gray-500 dark:text-gray-400 text-sm text-center">
              {fileSection.multiple ? 'انقر لرفع صور' : 'انقر لالتقاط صورة'}
            </span>
            <input
              id={`file-input-${fileSection.id}`}
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
              ref={setInputRef(index)}
              disabled={!hasExitRecord}
            />
          </label>
        )}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
          (تشييك الخروج):
        </div>
        {previousRecord && previousRecord[fileSection.title] ? (
          <div className="relative border-2 border-gray-200 dark:border-gray-600 rounded-lg p-2 h-28 sm:h-32 bg-gray-50 dark:bg-gray-700">
            <div className="relative h-full w-full flex items-center justify-center">
              {Array.isArray(previousRecord[fileSection.title]) ? (
                <div className="grid grid-cols-2 gap-2 w-full h-full">
                  {(previousRecord[fileSection.title] as string[]).map((url, imgIndex) => (
                    <img
                      key={imgIndex}
                      src={url}
                      alt={`صورة سابقة ${imgIndex + 1}`}
                      className="max-h-full max-w-full object-cover rounded-md cursor-pointer"
                      onClick={() => openPreview(url, fieldTitlesMap[fileSection.title])}
                    />
                  ))}
                </div>
              ) : (
                <img
                  src={previousRecord[fileSection.title] as string}
                  alt="صورة سابقة"
                  className="max-h-full max-w-full object-cover rounded-md cursor-pointer"
                  onClick={() => openPreview(previousRecord[fileSection.title] as string, fieldTitlesMap[fileSection.title])}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="h-28 sm:h-32 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
            لا توجد صورة قديمة
          </div>
        )}
      </div>
    </div>
  </div>
))}
</div>
             
              <div className="mb-6 mt-6">
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
    التوقيع
  </label>
  <div className="grid grid-cols-1 gap-3">
    <div className="min-w-0">
      <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
        التوقيع الجديد:
      </div>
      <div
        className={`relative border-2 border-gray-300 dark:border-gray-600 rounded-md p-2 ${
          !hasExitRecord ? 'pointer-events-none opacity-50' : ''
        }`}
      >
        {signatureFile.previewUrls && signatureFile.previewUrls.length > 0 ? (
          <div className="relative h-32 w-full flex items-center justify-center">
            <img
              src={signatureFile.previewUrls[0]}
              alt="التوقيع"
              className="max-h-full max-w-full object-contain rounded cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                openPreview([signatureFile.previewUrls[0]], 0);
              }}
            />
            <button
              type="button"
              onClick={(e) => removePreviewImage(signatureFile.id, 0, e)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-md z-10"
              aria-label="حذف التوقيع"
            >
              <span className="text-lg font-bold">×</span>
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center justify-center gap-3">
            <div className="w-full h-32">
              <SignaturePad
                ref={sigCanvas}
                backgroundColor="#ffffff"
                penColor="black"
                canvasProps={{
                  className: `border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md w-full h-full ${
                    !hasExitRecord || isSignatureLocked
                      ? 'pointer-events-none opacity-50'
                      : ''
                  }`,
                }}
              />
            </div>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={clearSignature}
                className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                disabled={!hasExitRecord}
              >
                مسح التوقيع
              </button>
              <button
                type="button"
                onClick={() => handleSignatureSave()}
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                disabled={!hasExitRecord || isSignatureLocked}
              >
                حفظ التوقيع
              </button>
            </div>
          </div>
        )}
        {signatureFile.isUploading && signatureFile.uploadProgress < 100 && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${signatureFile.uploadProgress}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-300 mt-1 block text-center">
              {signatureFile.uploadProgress}%
            </span>
          </div>
        )}
      </div>
    </div>
    <div className="min-w-0">
      <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
        التوقيع القديم (تشييك الخروج):
      </div>
      {previousRecord && previousRecord.signature_url ? (
        <div className="relative border-2 border-gray-200 dark:border-gray-600 rounded-md p-2 h-32 bg-gray-50 dark:bg-gray-700">
          <div className="relative h-full w-full flex items-center justify-center">
            <img
              src={previousRecord.signature_url}
              alt="التوقيع - سابق"
              className="max-h-full max-w-full object-contain rounded cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                openPreview([previousRecord.signature_url], 0);
              }}
            />
          </div>
        </div>
      ) : (
        <div className="h-32 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700">
          لا يوجد توقيع قديم
        </div>
      )}
    </div>
  </div>
</div>
             
              <div className="mb-4 text-center mt-4">
                <button
                  type="submit"
                  disabled={isUploading || !hasExitRecord}
                  className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isUploading || !hasExitRecord ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isUploading ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      جارٍ الرفع...
                    </span>
                  ) : (
                    'رفع التشييك'
                  )}
                </button>
              </div>
            </div>
          </form>
         
          {selectedImage && (
  <Lightbox
    open={openLightbox}
    close={() => setOpenLightbox(false)}
    slides={[{ src: selectedImage.src, title: selectedImage.title, description: selectedImage.title }]}
    index={0}
    plugins={[Zoom, Captions, Download]}
    zoom={{
      maxZoomPixelRatio: 4,
      zoomInMultiplier: 2,
      doubleTapDelay: 300,
      doubleClickDelay: 500,
      doubleClickMaxStops: 2,
      scrollToZoom: true,
    }}
    toolbar={{
      buttons: [
        "close",
        <div key="separator-1" style={{ flexGrow: 1 }} />,
        "zoom",
        "download",
      ],
    }}
    captions={{
      showToggle: false,
      descriptionTextAlign: 'center',
      descriptionMaxLines: 3,
    }}
    styles={{
      container: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
      },
      slide: {
        filter: isDarkMode ? 'brightness(1.1)' : 'none',
      },
      captionsTitle: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
      },
      captionsDescription: {
        fontSize: '14px',
        color: '#cccccc',
        textAlign: 'center',
        marginTop: '4px',
      },
    }}
  />
)}
         
          {showToast && (
            <div
              className={`fixed top-5 right-5 px-4 py-2 rounded-md shadow-lg text-white flex items-center z-50 ${
                isSuccess ? 'bg-green-600' : 'bg-red-600'
              }`}
            >
              {isSuccess ? (
                <FaCheckCircle className="mr-2 h-5 w-5" />
              ) : (
                <FaExclamationTriangle className="mr-2 h-5 w-5" />
              )}
              <span>{uploadMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

