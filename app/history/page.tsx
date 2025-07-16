// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import Navbar from '@/public/components/navbar';
// import { FaHistory, FaSearch, FaChevronDown } from 'react-icons/fa';
// import Image from 'next/image';
// import { useRouter } from 'next/navigation';

// interface Contract {
//   meter_reading:string;
//   id: string;
//   contract_number: number | null;
//   car_model: string | null;
//   plate_number: string | null;
//   operation_type: string | null;
//   employee_name: string | null;
//   branch_name: string | null;
//   meter?: string | null;
//   right_doors?: string | null;
//   front_right_fender?: string | null;
//   rear_right_fender?: string | null;
//   rear_bumper_with_lights?: string | null;
//   trunk_lid?: string | null;
//   roof?: string | null;
//   rear_left_fender?: string | null;
//   left_doors?: string | null;
//   front_left_fender?: string | null;
//   front_bumper?: string | null;
//   hoode?: string | null;
//   front_windshield?: string | null;
//   trunk_contents?: string | null;
//   fire_extinguisher?: string | null;
//   front_right_seat?: string | null;
//   front_left_seat?: string | null;
//   rear_seat_with_front_seat_backs?: string | null;
//   other_images?: string | null;
// }
// const fieldTitles: { [key: string]: string } = {
//   meter: 'العداد',
//   right_doors: 'الابواب اليمين مع توضيح السمكة',
//   front_right_fender: 'الرفرف الامامي يمين',
//   rear_right_fender: 'الرفرف الخلفي يمين',
//   rear_bumper_with_lights: 'الصدام الخلفي مع الانوار',
//   trunk_lid: 'سطح الشنطة مع الزجاج الخلفي',
//   roof: 'التندة',
//   rear_left_fender: 'الرفرف الخلفي يسار',
//   left_doors: 'الابواب اليسار مع توضيح السمكة',
//   front_left_fender: 'الرفرف الامامي يسار',
//   front_bumper: 'الصدام الامامي مع الشنب',
//   hoode: 'الكبوت مع الشبك',
//   front_windshield: 'الزجاج الامامي',
//   trunk_contents: 'محتويات الشنطة مع الاستبنة',
//   fire_extinguisher: 'طفاية الحريق',
//   front_right_seat: 'المقعد الامامي يمين',
//   front_left_seat: 'المقعد الامامي يسار',
//   rear_seat_with_front_seat_backs: 'المقعد الخلفي مع خلفية المقاعد الامامية',
//   other_images: 'صور اخرى',
// };

// export default function HistoryPage() {
//   const [records, setRecords] = useState<Contract[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedImage, setSelectedImage] = useState<string | null>(null);
//   const [pageSearch, setPageSearch] = useState('');
//   const [contractSearch, setContractSearch] = useState('');
//   const [operationTypeFilter, setOperationTypeFilter] = useState('');
//   const [operationTypeSearch, setOperationTypeSearch] = useState('');
//   const [showOperationTypeList, setShowOperationTypeList] = useState(false);
//   const [carFilter, setCarFilter] = useState('');
//   const [carSearch, setCarSearch] = useState('');
//   const [showCarList, setShowCarList] = useState(false);
//   const [plateFilter, setPlateFilter] = useState('');
//   const [plateSearch, setPlateSearch] = useState('');
//   const [showPlateList, setShowPlateList] = useState(false);
//   const [branchFilter, setBranchFilter] = useState('');
//   const [branchSearch, setBranchSearch] = useState('');
//   const [showBranchList, setShowBranchList] = useState(false);
//   const [page, setPage] = useState(1);
//   const [totalRecords, setTotalRecords] = useState(0);
//   const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
//   const [expandedRecords, setExpandedRecords] = useState<{ [key: string]: boolean }>({});
//   const [cars, setCars] = useState<string[]>([]);
//   const [plates, setPlates] = useState<string[]>([]);
//   const [branches, setBranches] = useState<string[]>([]);
//   const pageSize = 50;
//   const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
//   const [selectedImageList, setSelectedImageList] = useState<{ url: string; title: string }[]>([]);
//   const [touchStartX, setTouchStartX] = useState<number | null>(null);
//   const [zoomLevel, setZoomLevel] = useState(1); // Zoom level (1 = original size)
// const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 }); // Image position for panning
// const [isDragging, setIsDragging] = useState(false); // Track dragging state
// const [dragStart, setDragStart] = useState({ x: 0, y: 0 }); // Starting point of drag
// const imageRef = useRef<HTMLImageElement>(null); // Reference to the image
// let touchDistance = 0; // For pinch-to-zoom

  
//   const operationTypeRef = useRef<HTMLDivElement>(null);
//   const carFilterRef = useRef<HTMLDivElement>(null);
//   const plateFilterRef = useRef<HTMLDivElement>(null);
//   const branchFilterRef = useRef<HTMLDivElement>(null);
//   const router = useRouter();

//   const operationTypes = ['دخول', 'خروج'];

//   // Check for authentication
//   useEffect(() => {
//     const storedUser = localStorage.getItem('user');
//     if (!storedUser) {
//       router.push('/login');
//     }
//   }, [router]);
//   // زوم للصورة 
//   useEffect(() => {
//     const handleWheel = (e: WheelEvent) => {
//       e.preventDefault();
//       setZoomLevel((prev) => {
//         const delta = e.deltaY < 0 ? 0.1 : -0.1;
//         const newZoom = Math.max(prev + delta, 1); // الحد الأدنى 1
//         if (newZoom === 1) {
//           setZoomPosition({ x: 0, y: 0 }); // إعادة تعيين الموقع عند الحجم الأصلي
//         }
//         return Math.min(newZoom, 3); // الحد الأقصى 3
//       });
  
//       if (imageRef.current) {
//         const rect = imageRef.current.getBoundingClientRect();
//         const x = (e.clientX - rect.left) / rect.width - 0.5;
//         const y = (e.clientY - rect.top) / rect.height - 0.5;
//         setZoomPosition({ x, y });
//       }
//     };
  
//     const handleTouchStart = (e: TouchEvent) => {
//       if (e.touches.length === 2) {
//         const touch1 = e.touches[0];
//         const touch2 = e.touches[1];
//         touchDistance = Math.hypot(
//           touch1.clientX - touch2.clientX,
//           touch1.clientY - touch2.clientY
//         );
//       }
//     };
  
//     const handleTouchMove = (e: TouchEvent) => {
//       if (e.touches.length === 2) {
//         e.preventDefault();
//         const touch1 = e.touches[0];
//         const touch2 = e.touches[1];
//         const newDistance = Math.hypot(
//           touch1.clientX - touch2.clientX,
//           touch1.clientY - touch2.clientY
//         );
//         const delta = newDistance - touchDistance;
//         setZoomLevel((prev) => {
//           const newZoom = Math.max(prev + delta * 0.01, 1); // Enforce minimum zoom of 1
//           return Math.min(newZoom, 3); // Maximum zoom of 3
//         });
//         touchDistance = newDistance;
  
//         if (imageRef.current) {
//           const rect = imageRef.current.getBoundingClientRect();
//           const x = ((touch1.clientX + touch2.clientX) / 2 - rect.left) / rect.width - 0.5;
//           const y = ((touch1.clientY + touch2.clientY) / 2 - rect.top) / rect.height - 0.5;
//           setZoomPosition({ x, y });
//         }
//       }
//     };
  
//     const imageElement = imageRef.current;
//     if (imageElement) {
//       imageElement.addEventListener('wheel', handleWheel, { passive: false });
//       imageElement.addEventListener('touchstart', handleTouchStart);
//       imageElement.addEventListener('touchmove', handleTouchMove, { passive: false });
//     }
//     return () => {
//       if (imageElement) {
//         imageElement.removeEventListener('wheel', handleWheel);
//         imageElement.removeEventListener('touchstart', handleTouchStart);
//         imageElement.removeEventListener('touchmove', handleTouchMove);
//       }
//     };
//   }, [selectedImage]);
//   //تحريك الصورة بعد الزوم
//   useEffect(() => {
//     const handleMouseDown = (e: MouseEvent) => {
//       if (zoomLevel > 1) { // Only allow dragging if zoomed in
//         setIsDragging(true);
//         setDragStart({ x: e.clientX, y: e.clientY });
//       }
//     };
  
//     const handleMouseMove = (e: MouseEvent) => {
//       if (isDragging && imageRef.current && zoomLevel > 1) {
//         e.preventDefault();
//         const rect = imageRef.current.getBoundingClientRect();
//         const deltaX = (e.clientX - dragStart.x) / (rect.width * zoomLevel);
//         const deltaY = (e.clientY - dragStart.y) / (rect.height * zoomLevel);
//         setZoomPosition((prev) => {
//           const maxX = 0.5 / zoomLevel; // حدود التحريك بناءً على مستوى التكبير
//           const maxY = 0.5 / zoomLevel;
//           return {
//             x: Math.max(Math.min(prev.x + deltaX, maxX), -maxX),
//             y: Math.max(Math.min(prev.y + deltaY, maxY), -maxY),
//           };
//         });
//         setDragStart({ x: e.clientX, y: e.clientY });
//       }
//     };
  
//     const handleMouseUp = () => {
//       setIsDragging(false);
//     };
  
//     const handleTouchStart = (e: TouchEvent) => {
//       if (e.touches.length === 1 && zoomLevel > 1) { // Single touch for dragging
//         setIsDragging(true);
//         setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
//       } else if (e.touches.length === 2) { // Pinch-to-zoom (existing)
//         const touch1 = e.touches[0];
//         const touch2 = e.touches[1];
//         touchDistance = Math.hypot(
//           touch1.clientX - touch2.clientX,
//           touch1.clientY - touch2.clientY
//         );
//       }
//     };
  
//     const handleTouchMove = (e: TouchEvent) => {
//       if (e.touches.length === 1 && isDragging && imageRef.current && zoomLevel > 1) {
//         e.preventDefault();
//         const rect = imageRef.current.getBoundingClientRect();
//         const deltaX = (e.touches[0].clientX - dragStart.x) / (rect.width * zoomLevel);
//         const deltaY = (e.touches[0].clientY - dragStart.y) / (rect.height * zoomLevel);
//         setZoomPosition((prev) => {
//           const maxX = 0.5 / zoomLevel;
//           const maxY = 0.5 / zoomLevel;
//           return {
//             x: Math.max(Math.min(prev.x + deltaX, maxX), -maxX),
//             y: Math.max(Math.min(prev.y + deltaY, maxY), -maxY),
//           };
//         });
//         setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
//       } else if (e.touches.length === 2) {
//         e.preventDefault();
//         const touch1 = e.touches[0];
//         const touch2 = e.touches[1];
//         const newDistance = Math.hypot(
//           touch1.clientX - touch2.clientX,
//           touch1.clientY - touch2.clientY
//         );
//         const delta = newDistance - touchDistance;
//         setZoomLevel((prev) => {
//           const newZoom = Math.max(prev + delta * 0.01, 1);
//           return Math.min(newZoom, 3);
//         });
//         touchDistance = newDistance;
  
//         if (imageRef.current) {
//           const rect = imageRef.current.getBoundingClientRect();
//           const x = ((touch1.clientX + touch2.clientX) / 2 - rect.left) / rect.width - 0.5;
//           const y = ((touch1.clientY + touch2.clientY) / 2 - rect.top) / rect.height - 0.5;
//           setZoomPosition({ x, y });
//         }
//       }
//     };
  
//     const handleTouchEnd = () => {
//       setIsDragging(false);
//     };
  
//     const imageElement = imageRef.current;
//     if (imageElement) {
//       imageElement.addEventListener('mousedown', handleMouseDown);
//       imageElement.addEventListener('mousemove', handleMouseMove);
//       imageElement.addEventListener('mouseup', handleMouseUp);
//       imageElement.addEventListener('touchstart', handleTouchStart);
//       imageElement.addEventListener('touchmove', handleTouchMove, { passive: false });
//       imageElement.addEventListener('touchend', handleTouchEnd);
//     }
//     return () => {
//       if (imageElement) {
//         imageElement.removeEventListener('mousedown', handleMouseDown);
//         imageElement.removeEventListener('mousemove', handleMouseMove);
//         imageElement.removeEventListener('mouseup', handleMouseUp);
//         imageElement.removeEventListener('touchstart', handleTouchStart);
//         imageElement.removeEventListener('touchmove', handleTouchMove);
//         imageElement.removeEventListener('touchend', handleTouchEnd);
//       }
//     };
//   }, [isDragging, dragStart, zoomLevel, selectedImage]);

//   useEffect(() => {
//     let touchDistance = 0;
  
//     const handleTouchStart = (e: TouchEvent) => {
//       if (e.touches.length === 2) {
//         const touch1 = e.touches[0];
//         const touch2 = e.touches[1];
//         touchDistance = Math.hypot(
//           touch1.clientX - touch2.clientX,
//           touch1.clientY - touch2.clientY
//         );
//       }
//     };
  
//     const handleTouchMove = (e: TouchEvent) => {
//       if (e.touches.length === 2) {
//         e.preventDefault();
//         const touch1 = e.touches[0];
//         const touch2 = e.touches[1];
//         const newDistance = Math.hypot(
//           touch1.clientX - touch2.clientX,
//           touch1.clientY - touch2.clientY
//         );
//         const delta = newDistance - touchDistance;
//         setZoomLevel((prev) => {
//           const newZoom = Math.min(Math.max(prev + delta * 0.01, 1), 3); // حدود التكبير: 1x إلى 3x
//           return newZoom;
//         });
//         touchDistance = newDistance;
  
//         // تحديث مركز التكبير
//         if (imageRef.current) {
//           const rect = imageRef.current.getBoundingClientRect();
//           const x = ((touch1.clientX + touch2.clientX) / 2 - rect.left) / rect.width - 0.5;
//           const y = ((touch1.clientY + touch2.clientY) / 2 - rect.top) / rect.height - 0.5;
//           setZoomPosition({ x, y });
//         }
//       }
//     };
  
//     const imageElement = imageRef.current;
//     if (imageElement) {
//       imageElement.addEventListener('touchstart', handleTouchStart);
//       imageElement.addEventListener('touchmove', handleTouchMove, { passive: false });
//     }
//     return () => {
//       if (imageElement) {
//         imageElement.removeEventListener('touchstart', handleTouchStart);
//         imageElement.removeEventListener('touchmove', handleTouchMove);
//       }
//     };
//   }, [selectedImage]);

//   // Detect dark mode
//   useEffect(() => {
//     const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
//     setIsDarkMode(mediaQuery.matches);

//     const handleChange = (e: MediaQueryListEvent) => {
//       setIsDarkMode(e.matches);
//     };

//     mediaQuery.addEventListener('change', handleChange);
//     return () => mediaQuery.removeEventListener('change', handleChange);
//   }, []);

//   // Handle clicks outside dropdowns
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (operationTypeRef.current && !operationTypeRef.current.contains(event.target as Node)) {
//         setShowOperationTypeList(false);
//       }
//       if (carFilterRef.current && !carFilterRef.current.contains(event.target as Node)) {
//         setShowCarList(false);
//       }
//       if (plateFilterRef.current && !plateFilterRef.current.contains(event.target as Node)) {
//         setShowPlateList(false);
//       }
//       if (branchFilterRef.current && !branchFilterRef.current.contains(event.target as Node)) {
//         setShowBranchList(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   // Fetch filter lists (cars, plates, branches)
//   useEffect(() => {
//     const fetchFilters = async () => {
//       try {
//         const response = await fetch('/api/history?fetchFilters=true', {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         });

//         if (!response.ok) {
//           throw new Error('Failed to fetch filters');
//         }

//         const data = await response.json();
//         // Assuming API returns unique values for filters
//         const uniqueCars = [...new Set(data.map((record: Contract) => record.car_model).filter(Boolean))] as string[];
//         const uniquePlates = [...new Set(data.map((record: Contract) => record.plate_number).filter(Boolean))] as string[];
//         const uniqueBranches = [...new Set(data.map((record: Contract) => record.branch_name).filter(Boolean))] as string[];
//         setCars(uniqueCars);
//         setPlates(uniquePlates);
//         setBranches(uniqueBranches);
//       } catch (err: any) {
//         console.error('Error fetching filters:', err);
//         setError('حدث خطأ أثناء جلب قوائم الفلاتر');
//       }
//     };

//     fetchFilters();
//   }, []);

//   // Fetch records
//   useEffect(() => {
//     const fetchRecords = async () => {
//       try {
//         setIsLoading(true);
//         setError(null);
//         let url = `/api/history?page=${page}&pageSize=${pageSize}&sort=desc`; // إضافة sort=desc
//         if (contractSearch) {
//           url += `&contractNumber=${encodeURIComponent(contractSearch)}`;
//         }
//         if (plateFilter) {
//           url += `&plateNumber=${encodeURIComponent(plateFilter)}`;
//         }
//         if (carFilter) {
//           url += `&carModel=${encodeURIComponent(carFilter)}`;
//         }
//         if (operationTypeFilter) {
//           url += `&operationType=${encodeURIComponent(operationTypeFilter)}`;
//         }
//         if (branchFilter) {
//           url += `&branchName=${encodeURIComponent(branchFilter)}`;
//         }

//         const response = await fetch(url, {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         });

//         if (!response.ok) {
//           const errorData = await response.json().catch(() => ({}));
//           throw new Error(errorData.error || `فشل في استرجاع السجلات (حالة: ${response.status})`);
//         }

//         const data: Contract[] = await response.json();
//         setRecords(data);
//         setTotalRecords(data.length + (page - 1) * pageSize); // Approximate total, adjust if API provides total
//       } catch (err: any) {
//         console.error('Error in fetchRecords:', {
//           message: err.message,
//           stack: err.stack,
//         });
//         setError(err.message || 'حدث خطأ غير معروف أثناء استرجاع السجلات');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchRecords();
//   }, [page, contractSearch, plateFilter, carFilter, operationTypeFilter, branchFilter]);

//   const filteredRecords = records.filter((record) => {
//     const matchesPageSearch = pageSearch
//       ? String(record.contract_number ?? '').includes(pageSearch) ||
//         (record.car_model ?? '').toLowerCase().includes(pageSearch.toLowerCase()) ||
//         (record.plate_number ?? '').toLowerCase().includes(pageSearch.toLowerCase()) ||
//         (record.operation_type ?? '').toLowerCase().includes(pageSearch.toLowerCase()) ||
//         (record.employee_name ?? '').toLowerCase().includes(pageSearch.toLowerCase()) ||
//         (record.branch_name ?? '').toLowerCase().includes(pageSearch.toLowerCase())
//       : true;

//     return matchesPageSearch;
//   });

//   const filteredOperationTypes = operationTypes.filter((type) =>
//     type.toLowerCase().includes(operationTypeSearch.toLowerCase())
//   );

//   const filteredCars = cars.filter((car) =>
//     car.toLowerCase().includes(carSearch.toLowerCase())
//   );

//   const filteredPlates = plates.filter((plate) =>
//     plate.toLowerCase().includes(plateSearch.toLowerCase())
//   );

//   const filteredBranches = branches.filter((branch) =>
//     branch.toLowerCase().includes(branchSearch.toLowerCase())
//   );

//   const handleOperationTypeSelect = (type: string) => {
//     setOperationTypeFilter(type);
//     setOperationTypeSearch(type);
//     setShowOperationTypeList(false);
//     setPage(1);
//   };

//   const handleCarSelect = (car: string) => {
//     setCarFilter(car);
//     setCarSearch(car);
//     setShowCarList(false);
//     setPage(1);
//   };

//   const handlePlateSelect = (plate: string) => {
//     setPlateFilter(plate);
//     setPlateSearch(plate);
//     setShowPlateList(false);
//     setPage(1);
//   };

//   const handleBranchSelect = (branch: string) => {
//     setBranchFilter(branch);
//     setBranchSearch(branch);
//     setShowBranchList(false);
//     setPage(1);
//   };

//   const clearOperationTypeFilter = () => {
//     setOperationTypeFilter('');
//     setOperationTypeSearch('');
//     setShowOperationTypeList(false);
//     setPage(1);
//   };

//   const clearCarFilter = () => {
//     setCarFilter('');
//     setCarSearch('');
//     setShowCarList(false);
//     setPage(1);
//   };

//   const clearPlateFilter = () => {
//     setPlateFilter('');
//     setPlateSearch('');
//     setShowPlateList(false);
//     setPage(1);
//   };

//   const clearBranchFilter = () => {
//     setBranchFilter('');
//     setBranchSearch('');
//     setShowBranchList(false);
//     setPage(1);
//   };

 

//   const toggleImages = (recordId: string) => {
//     setExpandedRecords((prev) => ({
//       ...prev,
//       [recordId]: !prev[recordId],
//     }));
//   };
  

//   // const getAllImages = (record: Contract) => {
//   //   const images: { url: string; title: string; index: number }[] = [];
//   //   Object.keys(fieldTitles).forEach((field) => {
//   //     const fieldValue = record[field as keyof Contract] as string | null | undefined;
//   //     if (fieldValue) { // Check if fieldValue is a non-empty string
//   //       // console.log(`Field: ${field}, Value: ${fieldValue}`); // Debugging
//   //       images.push({ url: fieldValue, title: fieldTitles[field], index: 0 });
//   //     }
//   //   });
//   //   return images;
//   // };

//   const getAllImages = (record: Contract) => {
//     const images: { url: string; title: string; index: number }[] = [];
//     Object.keys(fieldTitles).forEach((field) => {
//       const fieldValue = record[field as keyof Contract] as string | null | undefined;
//       if (fieldValue) {
//         if (field === 'other_images') {
//           // تقسيم الروابط إذا كانت تحتوي على فواصل
//           const imageUrls = fieldValue.split(',').filter(url => url.trim().length > 0);
//           imageUrls.forEach((url, index) => {
//             images.push({ url: url.trim(), title: fieldTitles[field], index });
//           });
//         } else {
//           // للحقول الأخرى، أضف الصورة كما هي
//           images.push({ url: fieldValue, title: fieldTitles[field], index: 0 });
//         }
//       }
//     });
//     return images;
//   };
//   const closeImageModal = () => {
//     setSelectedImage(null);
//     setSelectedImageIndex(null);
//     setSelectedImageList([]);
//   };
  
//   // التعامل مع السحب
//   const handleTouchEnd = (touchEndX: number) => {
//     if (touchStartX === null) return;
//     const deltaX = touchEndX - touchStartX;
//     if (deltaX > 100) goToPrevImage();
//     else if (deltaX < -100) goToNextImage();
//     setTouchStartX(null);
//     setIsDragging(false); // Reset dragging state
//   };
  
//   const goToPrevImage = () => {
//     if (selectedImageIndex !== null && selectedImageIndex > 0) {
//       const newIndex = selectedImageIndex - 1;
//       setSelectedImage(selectedImageList[newIndex].url);
//       setSelectedImageIndex(newIndex);
//     }
//   };
  
//   const goToNextImage = () => {
//     if (selectedImageIndex !== null && selectedImageIndex < selectedImageList.length - 1) {
//       const newIndex = selectedImageIndex + 1;
//       setSelectedImage(selectedImageList[newIndex].url);
//       setSelectedImageIndex(newIndex);
//     }
//   };
  
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (!selectedImage) return;
//       if (e.key === 'ArrowLeft') goToPrevImage();
//       else if (e.key === 'ArrowRight') goToNextImage();
//       else if (e.key === 'Escape') closeImageModal();
//     };
//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [selectedImage, selectedImageIndex, selectedImageList]);
  

//   return (
//     <div dir="rtl" className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
//       <Navbar />
//       <div className="container mx-auto px-4 py-8 bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
//         <h1 className="text-2xl md:text-3xl font-semibold text-center text-gray-900 dark:text-gray-100 mb-8 flex items-center justify-center">
//           <FaHistory className="mr-2 text-blue-600" />
//           سجل تشييك السيارات
//         </h1>

//         <div className="mb-6 flex flex-col sm:flex-row gap-4 flex-wrap">
//           <div className="relative flex-1 min-w-[200px]">
//             <input
//               type="text"
//               value={pageSearch}
//               onChange={(e) => setPageSearch(e.target.value)}
//               placeholder="ابحث في الصفحة (العقد، السيارة، اللوحة، الموظف، الفرع...)"
//               className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
//             />
//             <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
//           </div>

//           <div className="relative flex-1 min-w-[200px]">
//             <input
//               type="text"
//               value={contractSearch}
//               onChange={(e) => {
//                 setContractSearch(e.target.value);
//                 setPage(1);
//               }}
//               placeholder="ابحث برقم العقد (بحث عام)"
//               className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
//             />
//             <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
//           </div>

//           <div ref={operationTypeRef} className="relative flex-1 min-w-[200px]">
//             <input
//               type="text"
//               value={operationTypeSearch}
//               onChange={(e) => {
//                 setOperationTypeSearch(e.target.value);
//                 setShowOperationTypeList(true);
//               }}
//               onFocus={() => setShowOperationTypeList(true)}
//               placeholder="فلتر حسب نوع العملية"
//               className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
//             />
//             {operationTypeFilter && (
//               <button
//                 type="button"
//                 onClick={clearOperationTypeFilter}
//                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
//               >
//                 ×
//               </button>
//             )}
//             {showOperationTypeList && (
//               <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
//                 {filteredOperationTypes.length > 0 ? (
//                   filteredOperationTypes.map((type) => (
//                     <li
//                       key={type}
//                       onClick={() => handleOperationTypeSelect(type)}
//                       className="px-4 py-2 hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer text-sm text-gray-900 dark:text-gray-100"
//                     >
//                       {type}
//                     </li>
//                   ))
//                 ) : (
//                   <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
//                     لا توجد خيارات مطابقة
//                   </li>
//                 )}
//               </ul>
//             )}
//           </div>

//           <div ref={carFilterRef} className="relative flex-1 min-w-[200px]">
//             <input
//               type="text"
//               value={carSearch}
//               onChange={(e) => {
//                 setCarSearch(e.target.value);
//                 setShowCarList(true);
//               }}
//               onFocus={() => setShowCarList(true)}
//               placeholder="فلتر حسب السيارة"
//               className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
//             />
//             {carFilter && (
//               <button
//                 type="button"
//                 onClick={clearCarFilter}
//                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
//               >
//                 ×
//               </button>
//             )}
//             {showCarList && (
//               <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
//                 {filteredCars.length > 0 ? (
//                   filteredCars.map((car) => (
//                     <li
//                       key={car}
//                       onClick={() => handleCarSelect(car)}
//                       className="px-4 py-2 hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer text-sm text-gray-900 dark:text-gray-100"
//                     >
//                       {car}
//                     </li>
//                   ))
//                 ) : (
//                   <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
//                     لا توجد سيارات مطابقة
//                   </li>
//                 )}
//               </ul>
//             )}
//           </div>

//           <div ref={plateFilterRef} className="relative flex-1 min-w-[200px]">
//             <input
//               type="text"
//               value={plateSearch}
//               onChange={(e) => {
//                 setPlateSearch(e.target.value);
//                 setShowPlateList(true);
//               }}
//               onFocus={() => setShowPlateList(true)}
//               placeholder="فلتر حسب اللوحة"
//               className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
//             />
//             {plateFilter && (
//               <button
//                 type="button"
//                 onClick={clearPlateFilter}
//                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
//               >
//                 ×
//               </button>
//             )}
//             {showPlateList && (
//               <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
//                 {filteredPlates.length > 0 ? (
//                   filteredPlates.map((plate) => (
//                     <li
//                       key={plate}
//                       onClick={() => handlePlateSelect(plate)}
//                       className="px-4 py-2 hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer text-sm text-gray-900 dark:text-gray-100"
//                     >
//                       {plate}
//                     </li>
//                   ))
//                 ) : (
//                   <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
//                     لا توجد لوحات مطابقة
//                   </li>
//                 )}
//               </ul>
//             )}
//           </div>

//           <div ref={branchFilterRef} className="relative flex-1 min-w-[200px]">
//             <input
//               type="text"
//               value={branchSearch}
//               onChange={(e) => {
//                 setBranchSearch(e.target.value);
//                 setShowBranchList(true);
//               }}
//               onFocus={() => setShowBranchList(true)}
//               placeholder="فلتر حسب الفرع"
//               className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
//             />
//             {branchFilter && (
//               <button
//                 type="button"
//                 onClick={clearBranchFilter}
//                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
//               >
//                 ×
//               </button>
//             )}
//             {showBranchList && (
//               <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
//                 {filteredBranches.length > 0 ? (
//                   filteredBranches.map((branch) => (
//                     <li
//                       key={branch}
//                       onClick={() => handleBranchSelect(branch)}
//                       className="px-4 py-2 hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer text-sm text-gray-900 dark:text-gray-100"
//                     >
//                       {branch}
//                     </li>
//                   ))
//                 ) : (
//                   <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
//                     لا توجد فروع مطابقة
//                   </li>
//                 )}
//               </ul>
//             )}
//           </div>
//         </div>

//         {isLoading && (
//           <div className="flex justify-center items-center">
//             <p className="text-lg text-gray-600 dark:text-gray-300">جاري التحميل...</p>
//           </div>
//         )}

//         {error && (
//           <div className="text-center text-sm text-red-700 dark:text-red-200 bg-red-100 dark:bg-red-900 p-4 rounded-md mb-6">
//             {error}
//           </div>
//         )}

//         {!isLoading && !error && filteredRecords.length === 0 && (
//           <div className="text-center text-gray-600 dark:text-gray-300">
//             <p>لا توجد سجلات مطابقة لمعايير البحث أو الفلتر.</p>
//           </div>
//         )}

//         {!isLoading && !error && filteredRecords.length > 0 && (
//           <div className="overflow-x-auto">
//             <table className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
//               <thead>
//                 <tr className="bg-blue-600 text-white">
//                   <th className="py-3 px-4 text-right">رقم العقد</th>
//                   <th className="py-3 px-4 text-right">السيارة</th>
//                   <th className="py-3 px-4 text-right">اللوحة</th>
//                   <th className="py-3 px-4 text-right">قراءة العداد</th>

//                   <th className="py-3 px-4 text-right">نوع العملية</th>
//                   <th className="py-3 px-4 text-right">الموظف</th>
//                   <th className="py-3 px-4 text-right">الفرع</th>
//                   <th className="py-3 px-4 text-right">الصور</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredRecords.map((record) => {
//                   const allImages = getAllImages(record);
//                   const isExpanded = expandedRecords[record.id] || false;

//                   return (
//                     <tr
//                       key={record.id}
//                       className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
//                     >
//                       <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">
//                         {record.contract_number ?? '-'}
//                       </td>
//                       <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">
//                         {record.car_model ?? '-'}
//                       </td>
//                       <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">
//                         {record.plate_number ?? '-'}
//                       </td>

//                       <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">
//                         {record.meter_reading ?? '-'}
//                       </td>

//                       <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">
//                         {record.operation_type ?? '-'}
//                       </td>
//                       <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">
//                         {record.employee_name ?? '-'}
//                       </td>
//                       <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">
//                         {record.branch_name ?? '-'}
//                       </td>
//                       <td className="py-3 px-4 text-right">
//                         {allImages.length > 0 ? (
//                           <div className="flex flex-col gap-2">
//                             <div className="flex items-center gap-2">
//                             <button
//   onClick={() => {
//     setSelectedImageList(allImages);
//     setSelectedImage(allImages[0].url);
//     setSelectedImageIndex(0);
//   }}
//   className="relative w-12 h-12"
// >
//   <img
//     src={allImages[0].url}
//     alt={`${allImages[0].title}-${allImages[0].index}`}
//     className="object-cover w-full h-full rounded"
//     sizes="48px"
//     loading="lazy"
//     decoding="async"
//   />
// </button>

//                               {allImages.length > 1 && (
//                                 <button
//                                   onClick={() => toggleImages(record.id)}
//                                   className="sm:hidden text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 flex items-center"
//                                   title="عرض/إخفاء الصور"
//                                 >
//                                   <FaChevronDown
//                                     className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''} text-2xl`}
//                                   />
//                                 </button>
//                               )}
//                             </div>
//                             <div
//                               className={`flex flex-wrap gap-2 ${isExpanded ? 'block' : 'hidden'} sm:flex`}
//                             >
//                               {allImages.slice(1).map((image, index) => (
//   <button
//     key={`${image.title}-${image.index}`}
//     onClick={() => {
//       setSelectedImageList(allImages);
//       setSelectedImage(image.url);
//       setSelectedImageIndex(index + 1); // +1 لأنك قطعت أول صورة
//     }}
//     className="relative w-12 h-12"
//   >
//     <img
//       src={image.url}
//       alt={`${image.title}-${image.index}`}
//       className="object-cover w-full h-full rounded"
//       sizes="48px"
//       loading="lazy"
//       decoding="async"
//     />
//   </button>
// ))}

//                             </div>
//                           </div>
//                         ) : (
//                           <span className="text-gray-500 dark:text-gray-400">لا توجد صور</span>
//                         )}
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         )}

//         {!isLoading && !error && totalRecords > 0 && (
//           <div className="mt-6 flex justify-center gap-4 items-center">
//             <button
//               onClick={() => setPage((p) => Math.max(1, p - 1))}
//               disabled={page === 1}
//               className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
//             >
//               السابق
//             </button>
//             <span className="text-gray-800 dark:text-gray-200">
//               صفحة {page} من {Math.ceil(totalRecords / pageSize)}
//             </span>
//             <button
//               onClick={() => setPage((p) => p + 1)}
//               disabled={page >= Math.ceil(totalRecords / pageSize)}
//               className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
//             >
//               التالي
//             </button>
//           </div>
//         )}

// {selectedImage && selectedImageIndex !== null && (
//   <div
//     className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 overflow-y-auto"
//     onTouchStart={(e) => {
//       if (e.touches.length === 1) {
//         setTouchStartX(e.touches[0].clientX);
//       }
//     }}
//     onTouchEnd={(e) => handleTouchEnd(e.changedTouches[0].clientX)}
//   >
//     <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
//       {/* Title Bar */}
//       <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-4 border-b border-gray-200 dark:border-gray-600">
//         <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
//           {selectedImageList[selectedImageIndex]?.title || 'معاينة الصورة'}
//         </h2>
//         <button
//           onClick={closeImageModal}
//           className="bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
//           aria-label="إغلاق المعاينة"
//         >
//           <span className="text-2xl">×</span>
//         </button>
//       </div>
//       {/* Image Content */}
//       <div className="relative flex items-center justify-center p-4 max-h-[80vh]">
//         <button
//           onClick={goToPrevImage}
//           disabled={selectedImageIndex === 0}
//           className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
//           aria-label="الصورة السابقة"
//         >
//           <span className="text-2xl">→</span>
//         </button>
//         <img
//           ref={imageRef}
//           src={selectedImage}
//           alt="معاينة الصورة"
//           className="max-w-full max-h-[70vh] rounded-lg object-contain"
//           style={{
//             transform: `scale(${zoomLevel}) translate(${zoomPosition.x * 100}px, ${zoomPosition.y * 100}px)`,
//             transformOrigin: 'center',
//             transition: isDragging ? 'none' : 'transform 0.2s ease-out, opacity 0.3s ease-out',
//             opacity: selectedImage ? 1 : 0.5,
//             cursor: zoomLevel > 1 ? 'move' : 'default', // Indicate draggable state
//           }}
//           loading="lazy"
//           decoding="async"
//           onError={() => setError('فشل تحميل الصورة')}
//         />
//         <button
//           onClick={goToNextImage}
//           disabled={selectedImageIndex === selectedImageList.length - 1}
//           className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
//           aria-label="الصورة التالية"
//         >
//           <span className="text-2xl">←</span>
//         </button>
//         <div className="absolute bottom-4 text-gray-100 bg-black bg-opacity-50 px-3 py-1 rounded-md">
//           صورة {selectedImageIndex + 1} من {selectedImageList.length}
//         </div>
//         {error && (
//           <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-md">
//             {error}
//           </div>
//         )}
//       </div>
//     </div>
//   </div>
// )}

//       </div>
//     </div>
//   );
// }

'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/public/components/navbar';
import { FaHistory, FaSearch, FaChevronDown, FaDownload } from 'react-icons/fa';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Lightbox, { ZoomRef } from 'yet-another-react-lightbox';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/counter.css';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import 'yet-another-react-lightbox/plugins/captions.css';
import Download from 'yet-another-react-lightbox/plugins/download';
import jsPDF from 'jspdf';
import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css'; // لتحميل الأنماط
import { format, isSameHour } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { arSA } from 'date-fns/locale';
import { formatInTimeZone } from 'date-fns-tz'; // استيراد formatInTimeZone



declare module 'yet-another-react-lightbox' {
  interface SlideImage {
    title?: string;
  }
}

interface Contract {
  meter_reading: string;
  id: string;
  contract_number: number | null;
  car_model: string | null;
  plate_number: string | null;
  operation_type: string | null;
  employee_name: string | null;
  branch_name: string | null;
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
  created_at: string;
  other_images?: string | null;
}

const fieldTitles: { [key: string]: string } = {
  meter: 'العداد',
  right_doors: 'الابواب اليمين مع توضيح السمكة',
  front_right_fender: 'الرفرف الامامي يمين',
  rear_right_fender: 'الرفرف الخلفي يمين',
  rear_bumper_with_lights: 'الصدام الخلفي مع الانوار',
  trunk_lid: 'سطح الشنطة مع الزجاج الخلفي',
  roof: 'التندة',
  rear_left_fender: 'الرفرف الخلفي يسار',
  left_doors: 'الابواب اليسار مع توضيح السمكة',
  front_left_fender: 'الرفرف الامامي يسار',
  front_bumper: 'الصدام الامامي مع الشنب',
  hoode: 'الكبوت مع الشبك',
  front_windshield: 'الزجاج الامامي',
  trunk_contents: 'محتويات الشنطة مع الاستبنة',
  fire_extinguisher: 'طفاية الحريق',
  front_right_seat: 'المقعد الامامي يمين',
  front_left_seat: 'المقعد الامامي يسار',
  rear_seat_with_front_seat_backs: 'المقعد الخلفي مع خلفية المقاعد الامامية',
  other_images: 'صور اخرى',
};

export default function HistoryPage() {
  const [records, setRecords] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageSearch, setPageSearch] = useState('');
  const [contractSearch, setContractSearch] = useState('');
  const [operationTypeFilter, setOperationTypeFilter] = useState('');
  const [operationTypeSearch, setOperationTypeSearch] = useState('');
  const [showOperationTypeList, setShowOperationTypeList] = useState(false);
  const [carFilter, setCarFilter] = useState('');
  const [carSearch, setCarSearch] = useState('');
  const [showCarList, setShowCarList] = useState(false);
  const [plateFilter, setPlateFilter] = useState('');
  const [plateSearch, setPlateSearch] = useState('');
  const [showPlateList, setShowPlateList] = useState(false);
  const [branchFilter, setBranchFilter] = useState('');
  const [branchSearch, setBranchSearch] = useState('');
  const [showBranchList, setShowBranchList] = useState(false);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [expandedRecords, setExpandedRecords] = useState<{ [key: string]: boolean }>({});
  const [cars, setCars] = useState<string[]>([]);
  const [plates, setPlates] = useState<string[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [openLightbox, setOpenLightbox] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [selectedImageList, setSelectedImageList] = useState<{ src: string; title: string }[]>([]);
  const [currentRecordImages, setCurrentRecordImages] = useState<{ src: string; title: string }[]>([]);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<string | null>(null); // معرف السجل
  const datetimeRef = useRef<any>(null); // مرجع لمكون Datetime

 

const [datetimeFilter, setDatetimeFilter] = useState<string>(''); // Keep this for the single field



  const pageSize = 50;
  const operationTypeRef = useRef<HTMLDivElement>(null);
  const carFilterRef = useRef<HTMLDivElement>(null);
  const plateFilterRef = useRef<HTMLDivElement>(null);
  const branchFilterRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const operationTypes = ['دخول', 'خروج'];



  
  

  // Check for authentication
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
    }
  }, [router]);

  // Detect dark mode
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (operationTypeRef.current && !operationTypeRef.current.contains(event.target as Node)) {
        setShowOperationTypeList(false);
      }
      if (carFilterRef.current && !carFilterRef.current.contains(event.target as Node)) {
        setShowCarList(false);
      }
      if (plateFilterRef.current && !plateFilterRef.current.contains(event.target as Node)) {
        setShowPlateList(false);
      }
      if (branchFilterRef.current && !branchFilterRef.current.contains(event.target as Node)) {
        setShowBranchList(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch filter lists (cars, plates, branches)
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await fetch('/api/history?fetchFilters=true', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch filters');
        }

        const data = await response.json();
        const uniqueCars = [...new Set(data.map((record: Contract) => record.car_model).filter(Boolean))] as string[];
        const uniquePlates = [...new Set(data.map((record: Contract) => record.plate_number).filter(Boolean))] as string[];
        const uniqueBranches = [...new Set(data.map((record: Contract) => record.branch_name).filter(Boolean))] as string[];
        setCars(uniqueCars);
        setPlates(uniquePlates);
        setBranches(uniqueBranches);
      } catch (err: any) {
        console.error('Error fetching filters:', err);
        setError('حدث خطأ أثناء جلب قوائم الفلاتر');
      }
    };

    fetchFilters();
  }, []);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setIsLoading(true);
        setError(null);
        let url = `/api/history?page=${page}&pageSize=${pageSize}&sort=desc`;
        if (contractSearch) {
          url += `&contractNumber=${encodeURIComponent(contractSearch)}`;
        }
        if (plateFilter) {
          url += `&plateNumber=${encodeURIComponent(plateFilter)}`;
        }
        if (carFilter) {
          url += `&carModel=${encodeURIComponent(carFilter)}`;
        }
        if (operationTypeFilter) {
          url += `&operationType=${encodeURIComponent(operationTypeFilter)}`;
        }
        if (branchFilter) {
          url += `&branchName=${encodeURIComponent(branchFilter)}`;
        }
        console.log('Fetching records from URL:', url);
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `فشل في استرجاع السجلات (حالة: ${response.status})`);
        }
  
        const data = await response.json();
        console.log('API response:', data);
        setRecords(data.records || []);
        setTotalRecords(data.totalCount || 0);
      } catch (err: any) {
        console.error('Error in fetchRecords:', {
          message: err.message,
          stack: err.stack,
        });
        setError(err.message || 'حدث خطأ غير معروف أثناء استرجاع السجلات');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchRecords();
  }, [page, contractSearch, plateFilter, carFilter, operationTypeFilter, branchFilter, datetimeFilter]);

  const filteredRecords = records.filter((record) => {
    const matchesPageSearch = pageSearch
      ? String(record.contract_number ?? '').includes(pageSearch) ||
        (record.car_model ?? '').toLowerCase().includes(pageSearch.toLowerCase()) ||
        (record.plate_number ?? '').toLowerCase().includes(pageSearch.toLowerCase()) ||
        (record.operation_type ?? '').toLowerCase().includes(pageSearch.toLowerCase()) ||
        (record.employee_name ?? '').toLowerCase().includes(pageSearch.toLowerCase()) ||
        (record.branch_name ?? '').toLowerCase().includes(pageSearch.toLowerCase())
      : true;
  
    // تصفية بناءً على التاريخ
    let matchesDate = true;
    if (datetimeFilter) {
      try {
        const selectedDate = toZonedTime(new Date(datetimeFilter), 'Asia/Riyadh');
        const recordDate = toZonedTime(new Date(record.created_at), 'Asia/Riyadh');
        // مقارنة التاريخ والوقت (بساعة واحدة)
        matchesDate = isSameHour(selectedDate, recordDate);
      } catch (err) {
        console.error('Error parsing date:', err);
        matchesDate = false; // إذا حدث خطأ في تحليل التاريخ، استبعد السجل
      }
    }
  
    return matchesPageSearch && matchesDate;
  });


  const filteredOperationTypes = operationTypes.filter((type) =>
    type.toLowerCase().includes(operationTypeSearch.toLowerCase())
  );

  const filteredCars = cars.filter((car) =>
    car.toLowerCase().includes(carSearch.toLowerCase())
  );

  const filteredPlates = plates.filter((plate) =>
    plate.toLowerCase().includes(plateSearch.toLowerCase())
  );

  const filteredBranches = branches.filter((branch) =>
    branch.toLowerCase().includes(branchSearch.toLowerCase())
  );

  const handleOperationTypeSelect = (type: string) => {
    setOperationTypeFilter(type);
    setOperationTypeSearch(type);
    setShowOperationTypeList(false);
    setPage(1);
  };

  const handleCarSelect = (car: string) => {
    setCarFilter(car);
    setCarSearch(car);
    setShowCarList(false);
    setPage(1);
  };

  const handlePlateSelect = (plate: string) => {
    setPlateFilter(plate);
    setPlateSearch(plate);
    setShowPlateList(false);
    setPage(1);
  };

  const handleBranchSelect = (branch: string) => {
    setBranchFilter(branch);
    setBranchSearch(branch);
    setShowBranchList(false);
    setPage(1);
  };

  const clearOperationTypeFilter = () => {
    setOperationTypeFilter('');
    setOperationTypeSearch('');
    setShowOperationTypeList(false);
    setPage(1);
  };

  const clearCarFilter = () => {
    setCarFilter('');
    setCarSearch('');
    setShowCarList(false);
    setPage(1);
  };

  const clearPlateFilter = () => {
    setPlateFilter('');
    setPlateSearch('');
    setShowPlateList(false);
    setPage(1);
  };

  const clearBranchFilter = () => {
    setBranchFilter('');
    setBranchSearch('');
    setShowBranchList(false);
    setPage(1);
  };

  const toggleImages = (recordId: string) => {
    setExpandedRecords((prev) => ({
      ...prev,
      [recordId]: !prev[recordId],
    }));
  };
  function sanitizeFileName(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9-_ا-ي]/g, '-') // يسمح بالأحرف الإنجليزية والعربية والأرقام و- و_
      .replace(/\s+/g, '-')               // استبدال المسافات بـ -
      .substring(0, 50);                  // حد أقصى للطول لتجنب مشاكل النظام
  }
  

  const getAllImages = (record: Contract) => {
    const images: { src: string; title: string }[] = [];
    const validImageExtensions = /\.(jpg|jpeg|png|gif|webp)$/i; // للتحقق من امتدادات الصور الصالحة
  
    // التحقق من front_bumper أولاً
    const frontBumperValue = record.front_bumper as string | null | undefined;
    if (frontBumperValue && frontBumperValue.trim() && /^https?:\/\//.test(frontBumperValue.trim()) && validImageExtensions.test(frontBumperValue.trim())) {
      images.push({ src: frontBumperValue.trim(), title: fieldTitles['front_bumper'] });
    }
  
    // جمع باقي الصور باستثناء front_bumper
    Object.keys(fieldTitles).forEach((field) => {
      if (field === 'front_bumper') return; // تخطي front_bumper لأنه تمت معالجته
      const fieldValue = record[field as keyof Contract] as string | null | undefined;
      if (fieldValue && fieldValue.trim()) {
        if (field === 'other_images') {
          const imageUrls = fieldValue
            .split(',')
            .filter((url) => url.trim().length > 0 && /^https?:\/\//.test(url.trim()) && validImageExtensions.test(url.trim()));
          imageUrls.forEach((url) => {
            images.push({ src: url.trim(), title: fieldTitles[field] });
          });
        } else if (/^https?:\/\//.test(fieldValue.trim()) && validImageExtensions.test(fieldValue.trim())) {
          images.push({ src: fieldValue.trim(), title: fieldTitles[field] });
        }
      }
    });
  
    console.log('Images for record', record.id, images); // تسجيل الصور للتحقق
    return images;
  };

  const handleImageClick = (images: { src: string; title: string }[], index: number, event: React.MouseEvent) => {
    event.stopPropagation(); // منع النقر على الصورة من توسيع/طي السجل
    const validImages = images.filter((image) => !failedImages.has(image.src));
    if (validImages.length === 0) {
      setError('لا توجد صور صالحة للعرض');
      return;
    }
    console.log('Image clicked:', { images: validImages, index });
    setSelectedImageList(validImages);
    const adjustedIndex = Math.min(index, validImages.length - 1);
    setSelectedImageIndex(adjustedIndex);
    setOpenLightbox(true);
  };
  const handleRowClick = (recordId: string) => {
    setExpandedRecords((prev) => ({
      ...prev,
      [recordId]: !prev[recordId],
    }));
  };

  let fontLoaded = false; // تحميل الخط لمرة واحدة فقط

 const generatePDF = async (record: Contract) => {
  console.log('Starting generatePDF for record:', record.id); // تسجيل بداية الدالة
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  let yOffset = 10;

 // تحميل الخط العربي مرة واحدة فقط
if (!fontLoaded) {
  try {
    console.log('Fetching font: /fonts/Amiri-Regular.ttf');
    const response = await fetch('/fonts/Amiri-Regular.ttf');
    if (!response.ok) {
      console.error('Failed to fetch font:', response.status);
      throw new Error('فشل تحميل الخط العربي');
    }
    const fontData = await response.arrayBuffer();
    const uint8Array = new Uint8Array(fontData);
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const fontBase64 = btoa(binary);
    pdf.addFileToVFS('Amiri-Regular.ttf', fontBase64);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    fontLoaded = true;
  } catch (err) {
    console.error('Error loading Arabic font:', err);
    setError('فشل تحميل الخط العربي، سيتم استخدام الخط الافتراضي');
  }
}

// استخدام الخط
pdf.setFont('Amiri', 'normal');


  // إضافة عنوان
  pdf.setFontSize(16);
  let plate = record.plate_number || 'بدون لوحة';
  // تنظيف plate_number للسماح بالأحرف العربية والأرقام فقط
  plate = plate.replace(/[^ء-ي0-9\s]/g, '').trim(); // إزالة الأحرف الخاصة، الاحتفاظ بالعربية والأرقام
  console.log('Raw plate_number:', record.plate_number); // تسجيل القيمة الخام
  console.log('Cleaned plate:', plate); // تسجيل القيمة بعد التنظيف
  const title = `سجل تشييك سيارة ${plate}`;
  console.log('PDF title:', title); // تسجيل العنوان
  pdf.text(title, pageWidth / 2, yOffset, { align: 'center' });
  yOffset += 10;

  yOffset += 10;

  // إضافة بيانات السجل
  pdf.setFontSize(12);
  const fields = [
    { label: 'رقم العقد', value: record.contract_number ?? '-' },
    { label: 'السيارة', value: record.car_model ?? '-' },
    { label: 'اللوحة', value: record.plate_number ?? '-' },
    { label: 'قراءة العداد', value: record.meter_reading ?? '-' },
    { label: 'نوع العملية', value: record.operation_type ?? '-' },
    { label: 'الموظف', value: record.employee_name ?? '-' },
    { label: 'الفرع', value: record.branch_name ?? '-' },
    {
      label: 'التاريخ',
      value: (() => {
        const date = new Date(record.created_at);
        
        const time = new Intl.DateTimeFormat('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: 'Asia/Riyadh'
        }).format(date);
    
        const formattedDate = new Intl.DateTimeFormat('en-CA', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          timeZone: 'Asia/Riyadh'
        }).format(date); // يعطيك YYYY-MM-DD مباشرة
    
        return `${time} ${formattedDate}`;
      })()
    }
    
    
  ];
  

fields.forEach(({ label, value }) => {
  const stringValue = String(value);
  const hasEnglish = /[a-zA-Z]/.test(stringValue);
  
  if (hasEnglish) {
    // حساب المواضع بدقة
    const totalText = `${label}: ${stringValue}`;
    const totalWidth = pdf.getTextWidth(totalText);
    
    // موضع البداية
    const startX = pageWidth - margin - totalWidth;
    
    // كتابة النص الإنجليزي أولاً (من اليسار)
    pdf.text(stringValue, startX, yOffset, { align: 'left' });
    
    // حساب موضع النص العربي
    const englishWidth = pdf.getTextWidth(stringValue);
    const arabicText = ` :${label}`;
    
    // كتابة النص العربي بعد الإنجليزي
    pdf.text(arabicText, startX + englishWidth, yOffset, { align: 'left' });
  } else {
    const text = `${label}: ${stringValue}`;
    pdf.text(text, pageWidth - margin, yOffset, { align: 'right' });
  }
  
  yOffset += 8;
});

  yOffset += 5; // مسافة إضافية قبل الصور

  // إضافة الصور
  const allImages = getAllImages(record);
console.log('Processing images:', allImages);

for (const image of allImages) {
  if (failedImages.has(image.src)) {
    console.log('Skipping failed image:', image.src);
    continue;
  }

  try {
    // ✅ نضيف delay بسيط لتفادي تجميد الصفحة
    await new Promise((res) => setTimeout(res, 30));

    const response = await fetch(image.src, { mode: 'cors' });
    if (!response.ok) {
      console.error('Failed to fetch image:', image.src, response.status);
      continue;
    }

    const blob = await response.blob();
    const imgData = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => {
        console.error('Failed to read image as data URL:', image.src);
        resolve('');
      };
      reader.readAsDataURL(blob);
    });

    if (!imgData) continue;

    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = 80;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    if (yOffset + imgHeight + margin > pageHeight) {
      pdf.addPage();
      yOffset = margin;
    }

    pdf.text(image.title, pageWidth - margin, yOffset, { align: 'right' });
    yOffset += 5;
    pdf.addImage(imgData, 'JPEG', margin, yOffset, imgWidth, imgHeight);
    yOffset += imgHeight + 5;
  } catch (err) {
    console.error('Error adding image to PDF:', image.src, err);
  }
}



  // حفظ الملف
  
  let safePlate = record.plate_number || 'بدون_لوحة';
  // تنظيف safePlate للسماح بالأحرف العربية والأرقام فقط
  safePlate = safePlate.replace(/[^ء-ي0-9\s]/g, '').trim(); // إزالة الأحرف الخاصة
  console.log('Raw plate_number for filename:', record.plate_number); // تسجيل القيمة الخام
  console.log('Cleaned safePlate for filename:', safePlate); // تسجيل القيمة المنظفة
  pdf.save(`سجل_تشييك_سيارة_${safePlate}.pdf`);
};
  
  // useEffect(() => {
  //   if (selectedImageList.length > 0 && selectedImageIndex >= 0) {
  //     setTimeout(() => {
  //       setOpenLightbox(true); // افتح بعد تأكد أن selectedImageIndex تم تعيينه فعلاً
  //     }, 0); // delay 0ms فقط لضمان أن React أكمل الـ state updates
  //   }
  // }, [selectedImageList, selectedImageIndex]);
  
    
  

  return (
    <div dir="rtl" className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <Navbar />
      <div className="container mx-auto px-4 py-8 bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
        <h1 className="text-2xl md:text-3xl font-semibold text-center text-gray-900 dark:text-gray-100 mb-8 flex items-center justify-center">
          <FaHistory className="mr-2 text-blue-600" />
          سجل تشييك السيارات
        </h1>
        <div className="mb-6 flex flex-col sm:flex-row gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              value={pageSearch}
              onChange={(e) => setPageSearch(e.target.value)}
              placeholder="ابحث في الصفحة (العقد، السيارة، اللوحة، الموظف، الفرع...)"
              className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          </div>

          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              value={contractSearch}
              onChange={(e) => {
                setContractSearch(e.target.value);
                setPage(1);
              }}
              placeholder="ابحث برقم العقد (بحث عام)"
              className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          </div>

          <div ref={operationTypeRef} className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              value={operationTypeSearch}
              onChange={(e) => {
                setOperationTypeSearch(e.target.value);
                setShowOperationTypeList(true);
              }}
              onFocus={() => setShowOperationTypeList(true)}
              placeholder="فلتر حسب نوع العملية"
              className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            {operationTypeFilter && (
              <button
                type="button"
                onClick={clearOperationTypeFilter}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
              >
                ×
              </button>
            )}
            {showOperationTypeList && (
              <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                {filteredOperationTypes.length > 0 ? (
                  filteredOperationTypes.map((type) => (
                    <li
                      key={type}
                      onClick={() => handleOperationTypeSelect(type)}
                      className="px-4 py-2 hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer text-sm text-gray-900 dark:text-gray-100"
                    >
                      {type}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                    لا توجد خيارات مطابقة
                  </li>
                )}
              </ul>
            )}
          </div>

          <div ref={carFilterRef} className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              value={carSearch}
              onChange={(e) => {
                setCarSearch(e.target.value);
                setShowCarList(true);
              }}
              onFocus={() => setShowCarList(true)}
              placeholder="فلتر حسب السيارة"
              className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            {carFilter && (
              <button
                type="button"
                onClick={clearCarFilter}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
              >
                ×
              </button>
            )}
            
            {showCarList && (
              <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                {filteredCars.length > 0 ? (
                  filteredCars.map((car) => (
                    <li
                      key={car}
                      onClick={() => handleCarSelect(car)}
                      className="px-4 py-2 hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer text-sm text-gray-900 dark:text-gray-100"
                    >
                      {car}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                    لا توجد سيارات مطابقة
                  </li>
                )}
              </ul>
            )}
          </div>

          <div ref={plateFilterRef} className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              value={plateSearch}
              onChange={(e) => {
                setPlateSearch(e.target.value);
                setShowPlateList(true);
              }}
              onFocus={() => setShowPlateList(true)}
              placeholder="فلتر حسب اللوحة"
              className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            {plateFilter && (
              <button
                type="button"
                onClick={clearPlateFilter}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
              >
                ×
              </button>
            )}
            {showPlateList && (
              <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                {filteredPlates.length > 0 ? (
                  filteredPlates.map((plate) => (
                    <li
                      key={plate}
                      onClick={() => handlePlateSelect(plate)}
                      className="px-4 py-2 hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer text-sm text-gray-900 dark:text-gray-100"
                    >
                      {plate}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                    لا توجد لوحات مطابقة
                  </li>
                )}
              </ul>
            )}
          </div>

          <div ref={branchFilterRef} className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              value={branchSearch}
              onChange={(e) => {
                setBranchSearch(e.target.value);
                setShowBranchList(true);
              }}
              onFocus={() => setShowBranchList(true)}
              placeholder="فلتر حسب الفرع"
              className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            {branchFilter && (
              <button
                type="button"
                onClick={clearBranchFilter}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
              >
                ×
              </button>
            )}
            {showBranchList && (
              <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                {filteredBranches.length > 0 ? (
                  filteredBranches.map((branch) => (
                    <li
                      key={branch}
                      onClick={() => handleBranchSelect(branch)}
                      className="px-4 py-2 hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer text-sm text-gray-900 dark:text-gray-100"
                    >
                      {branch}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                    لا توجد فروع مطابقة
                  </li>
                )}
              </ul>
            )}
             </div>

             <div className="relative flex-1 min-w-[200px]">
  <Datetime
    value={datetimeFilter}
    onChange={(value) => {
      if (typeof value === 'string') {
        setDatetimeFilter(value);
      } else if (value && typeof value === 'object' && 'format' in value) {
        const formattedDate = formatInTimeZone(value.toDate(), 'Asia/Riyadh', 'yyyy-MM-dd HH:mm', {
          locale: arSA,
        });
        setDatetimeFilter(formattedDate);
      } else {
        setDatetimeFilter(''); // في حالة إدخال غير صالح
      }
      setPage(1);
    }}
    inputProps={{
      placeholder: 'فلتر حسب التاريخ والوقت',
      value: datetimeFilter, // التحكم المباشر في قيمة الحقل
      onChange: (e) => {
        const inputValue = (e.target as HTMLInputElement).value;
        setDatetimeFilter(inputValue); // تحديث الحالة مباشرة عند الكتابة
        setPage(1);
      },
      className:
        'w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100',
    }}
    timeFormat="HH:mm"
    dateFormat="YYYY-MM-DD"
    locale="ar"
  />
  {datetimeFilter && (
    <button
      type="button"
      onClick={() => {
        setDatetimeFilter(''); // إعادة تعيين الحالة إلى فارغ
        setPage(1); // إعادة تعيين الصفحة
      }}
      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
    >
      ×
    </button>
  )}
</div>
            
        </div>

 {/* إضافة عبارة "تم العثور على -- سجل" */}
 {!isLoading && !error && (
  <p className="text-right text-sm text-gray-700 dark:text-gray-300 mb-6">
    تم العثور على {filteredRecords.length} {filteredRecords.length === 1 ? 'سجل' : 'سجلات'}
  </p>
)}         
        {isLoading && (
          <div className="flex justify-center items-center">
            <p className="text-lg text-gray-600 dark:text-gray-300">جاري التحميل...</p>
          </div>
        )}

        {error && (
          <div className="text-center text-sm text-red-700 dark:text-red-200 bg-red-100 dark:bg-red-900 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {!isLoading && !error && filteredRecords.length === 0 && (
          <div className="text-center text-gray-600 dark:text-gray-300">
            <p>لا توجد سجلات مطابقة لمعايير البحث أو الفلتر.</p>
          </div>
        )}

{!isLoading && !error && filteredRecords.length > 0 && (
  <div className="overflow-x-auto">
    <table className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
     
  <thead>
  <tr className="bg-blue-600 text-white">
    <th className="py-3 px-4 text-right">رقم العقد</th>
    <th className="py-3 px-4 text-right">السيارة</th>
    <th className="py-3 px-4 text-right">اللوحة</th>
    <th className="py-3 px-4 text-right">قراءة العداد</th>
    <th className="py-3 px-4 text-right">نوع العملية</th>
    <th className="py-3 px-4 text-right">الموظف</th>
    <th className="py-3 px-4 text-right">الفرع</th>
    <th className="py-3 px-4 text-right">التاريخ</th> {/* إضافة عمود التاريخ */}
    <th className="py-3 px-4 text-right">الصور</th>
    <th className="py-3 px-4 text-right">إجراءات</th>
  </tr>
</thead>

<tbody>
  {filteredRecords.map((record) => {
    const allImages = getAllImages(record);
    const isExpanded = expandedRecords[record.id] || false;

    return (
      <tr
        key={record.id}
        onClick={() => handleRowClick(record.id)}
        className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
      >
        <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">
          {record.contract_number ?? '-'}
        </td>
        <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">
          {record.car_model ?? '-'}
        </td>
        <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">
          {record.plate_number ?? '-'}
        </td>
        <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">
          {record.meter_reading ?? '-'}
        </td>
        <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">
          {record.operation_type ?? '-'}
        </td>
        <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">
          {record.employee_name ?? '-'}
        </td>
        <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">
          {record.branch_name ?? '-'}
        </td>
        <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">
        <td className="py-3 px-0.5 text-gray-900 dark:text-gray-100" dir="ltr">
  <span className="translate-x-90%">
  {record.created_at ? (
    new Date(record.created_at).toLocaleString('sv-SE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Riyadh' // توقيت السعودية
    }).replace('T', ' ')
  ) : '-'}
   </span>
</td>



</td>
        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
          {allImages.length > 0 ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleImageClick(allImages, 0, e)}
                  className="relative w-12 h-12"
                >
                  <img
                    src={failedImages.has(allImages[0].src) ? '/placeholder-image.jpg' : allImages[0].src}
                    alt={allImages[0].title}
                    className="object-cover w-full h-full rounded"
                    sizes="48px"
                    loading="lazy"
                    decoding="async"
                    onError={() => {
                      console.error('Failed to load thumbnail:', allImages[0].src);
                      setFailedImages((prev) => new Set(prev).add(allImages[0].src));
                      setError('فشل تحميل الصورة المصغرة');
                    }}
                  />
                </button>
                {allImages.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleImages(record.id);
                    }}
                    className="md:hidden text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 flex items-center"
                    title="عرض/إخفاء الصور"
                  >
                    <FaChevronDown
                      className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''} text-2xl`}
                    />
                  </button>
                )}
              </div>
              {allImages.length > 1 && (
                <div
                  className={`flex flex-wrap gap-2 ${isExpanded ? 'block' : 'hidden'}`}
                >
                  {allImages.slice(1).map((image, arrayIndex) => {
                    const actualIndex = arrayIndex + 1;
                    return (
                      <button
                        key={`${image.title}-${actualIndex}`}
                        onClick={(e) => handleImageClick(allImages, actualIndex, e)}
                        className="relative w-12 h-12"
                      >
                        <img
                          src={failedImages.has(image.src) ? '/placeholder-image.jpg' : image.src}
                          alt={image.title}
                          className="object-cover w-full h-full rounded"
                          sizes="48px"
                          loading="lazy"
                          decoding="async"
                          onError={() => {
                            console.error('Failed to load thumbnail:', image.src);
                            setFailedImages((prev) => new Set(prev).add(image.src));
                            setError('فشل تحميل الصورة المصغرة');
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <span className="text-gray-500 dark:text-gray-400">لا توجد صور</span>
          )}
        </td>
        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => {
              setIsGeneratingPDF(record.id);
              generatePDF(record).finally(() => setIsGeneratingPDF(null));
            }}
            disabled={isGeneratingPDF === record.id}
            className={`text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-2 ${isGeneratingPDF === record.id ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="تحميل كـ PDF"
          >
            {isGeneratingPDF === record.id ? 'جاري الإنشاء...' : <><FaDownload /><span>PDF</span></>}
          </button>
        </td>
      </tr>
    );
  })}
</tbody>
    </table>
  </div>
)}

        {!isLoading && !error && totalRecords > 0 && (
          <div className="mt-6 flex justify-center gap-4 items-center">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              السابق
            </button>
            <span className="text-gray-800 dark:text-gray-200">
              صفحة {page} من {Math.ceil(totalRecords / pageSize)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(totalRecords / pageSize)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              التالي
            </button>
          </div>
        )}

<Lightbox
  open={openLightbox}
  close={() => setOpenLightbox(false)}
  slides={selectedImageList.map((image) => ({
    src: image.src,
    title: image.title,
    description: image.title,
    downloadUrl: image.src, // تأكيد أن التحميل يتم من نفس الرابط
  }))}
  index={selectedImageIndex}
  plugins={[Counter, Zoom, Captions, Download]}

  counter={{
    container: {
      style: {
        top: 0,
        bottom: 'unset',
      },
    },
  }}
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
      <div key="separator-2" style={{ flexGrow: 1 }} />,
      "counter",
    ],
  }}
  
  captions={{
    showToggle: false,  // Hide the captions toggle button
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
      </div>
    </div>
  );
}