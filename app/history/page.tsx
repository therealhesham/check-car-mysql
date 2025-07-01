'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/public/components/navbar';
import { FaHistory, FaSearch, FaChevronDown } from 'react-icons/fa';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Contract {
  meter_reading:string;
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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
  const pageSize = 50;
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [selectedImageList, setSelectedImageList] = useState<{ url: string; title: string }[]>([]);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  
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
        // Assuming API returns unique values for filters
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

  // Fetch records
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setIsLoading(true);
        setError(null);
        let url = `/api/history?page=${page}&pageSize=${pageSize}&sort=desc`; // إضافة sort=desc
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

        const data: Contract[] = await response.json();
        setRecords(data);
        setTotalRecords(data.length + (page - 1) * pageSize); // Approximate total, adjust if API provides total
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
  }, [page, contractSearch, plateFilter, carFilter, operationTypeFilter, branchFilter]);

  const filteredRecords = records.filter((record) => {
    const matchesPageSearch = pageSearch
      ? String(record.contract_number ?? '').includes(pageSearch) ||
        (record.car_model ?? '').toLowerCase().includes(pageSearch.toLowerCase()) ||
        (record.plate_number ?? '').toLowerCase().includes(pageSearch.toLowerCase()) ||
        (record.operation_type ?? '').toLowerCase().includes(pageSearch.toLowerCase()) ||
        (record.employee_name ?? '').toLowerCase().includes(pageSearch.toLowerCase()) ||
        (record.branch_name ?? '').toLowerCase().includes(pageSearch.toLowerCase())
      : true;

    return matchesPageSearch;
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
  

  const getAllImages = (record: Contract) => {
    const images: { url: string; title: string; index: number }[] = [];
    Object.keys(fieldTitles).forEach((field) => {
      const fieldValue = record[field as keyof Contract] as string | null | undefined;
      if (fieldValue) { // Check if fieldValue is a non-empty string
        // console.log(`Field: ${field}, Value: ${fieldValue}`); // Debugging
        images.push({ url: fieldValue, title: fieldTitles[field], index: 0 });
      }
    });
    return images;
  };
  const closeImageModal = () => {
    setSelectedImage(null);
    setSelectedImageIndex(null);
    setSelectedImageList([]);
  };
  
  // التعامل مع السحب
  const handleTouchEnd = (touchEndX: number) => {
    if (touchStartX === null) return;
    const deltaX = touchEndX - touchStartX;
    if (deltaX > 50) goToPrevImage();
    else if (deltaX < -50) goToNextImage();
    setTouchStartX(null);
  };
  
  const goToPrevImage = () => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      const newIndex = selectedImageIndex - 1;
      setSelectedImage(selectedImageList[newIndex].url);
      setSelectedImageIndex(newIndex);
    }
  };
  
  const goToNextImage = () => {
    if (selectedImageIndex !== null && selectedImageIndex < selectedImageList.length - 1) {
      const newIndex = selectedImageIndex + 1;
      setSelectedImage(selectedImageList[newIndex].url);
      setSelectedImageIndex(newIndex);
    }
  };
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;
      if (e.key === 'ArrowLeft') goToPrevImage();
      else if (e.key === 'ArrowRight') goToNextImage();
      else if (e.key === 'Escape') closeImageModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, selectedImageIndex, selectedImageList]);
  

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
        </div>

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
                  <th className="py-3 px-4 text-right">الصور</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => {
                  const allImages = getAllImages(record);
                  const isExpanded = expandedRecords[record.id] || false;

                  return (
                    <tr
                      key={record.id}
                      className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
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
                      <td className="py-3 px-4 text-right">
                        {allImages.length > 0 ? (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                            <button
  onClick={() => {
    setSelectedImageList(allImages);
    setSelectedImage(allImages[0].url);
    setSelectedImageIndex(0);
  }}
  className="relative w-12 h-12"
>
  <img
    src={allImages[0].url}
    alt={`${allImages[0].title}-${allImages[0].index}`}
    className="object-cover w-full h-full rounded"
    sizes="48px"
    loading="lazy"
    decoding="async"
  />
</button>

                              {allImages.length > 1 && (
                                <button
                                  onClick={() => toggleImages(record.id)}
                                  className="sm:hidden text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 flex items-center"
                                  title="عرض/إخفاء الصور"
                                >
                                  <FaChevronDown
                                    className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''} text-2xl`}
                                  />
                                </button>
                              )}
                            </div>
                            <div
                              className={`flex flex-wrap gap-2 ${isExpanded ? 'block' : 'hidden'} sm:flex`}
                            >
                              {allImages.slice(1).map((image, index) => (
  <button
    key={`${image.title}-${image.index}`}
    onClick={() => {
      setSelectedImageList(allImages);
      setSelectedImage(image.url);
      setSelectedImageIndex(index + 1); // +1 لأنك قطعت أول صورة
    }}
    className="relative w-12 h-12"
  >
    <img
      src={image.url}
      alt={`${image.title}-${image.index}`}
      className="object-cover w-full h-full rounded"
      sizes="48px"
      loading="lazy"
      decoding="async"
    />
  </button>
))}

                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">لا توجد صور</span>
                        )}
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

{selectedImage && selectedImageIndex !== null && (
      <div
        className="fixed inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-50 overflow-y-auto"
        onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
        onTouchEnd={(e) => handleTouchEnd(e.changedTouches[0].clientX)}
      >
        <div className="relative max-w-3xl w-full mt-16 mb-16 flex items-center justify-center">
          <button
            onClick={closeImageModal}
            className="absolute top-4 right-4 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center z-10"
          >
            <span className="text-xl">×</span>
          </button>

          <button
            onClick={goToPrevImage}
            disabled={selectedImageIndex === 0}
            className="absolute left-2 sm:left-6 top-1/2 transform -translate-y-1/2 text-white text-3xl z-10 disabled:text-gray-500"
          >
            ‹
          </button>

          <img
            src={selectedImage}
            alt="معاينة الصورة"
            className="max-w-full max-h-[80vh] rounded-lg"
            loading="lazy"
            decoding="async"
          />

          <button
            onClick={goToNextImage}
            disabled={selectedImageIndex === selectedImageList.length - 1}
            className="absolute right-2 sm:right-6 top-1/2 transform -translate-y-1/2 text-white text-3xl z-10 disabled:text-gray-500"
          >
            ›
          </button>
        </div>
      </div>
    )}

      </div>
    </div>
  );
}