'use client';

import Navbar from '@/public/components/navbar';
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import * as XLSX from 'xlsx';

// قاموس لتحويل أسماء السيارات إلى التنسيق العربي/الإنجليزي
const carNameMapping: { [key: string]: string } = {
  "hyundai Accent": "هيونداي - اكسنت / Hyundai-Accent",
  "kia Carens": "كيا - كارينز / Kia-Carens",
  "hyundai Elantra": "هيونداي - النترا / Hyundai-Elantra",
  "hyundai I10": "هيونداي - جراند10 / Hyundai-I10",
  "hyundai Sonata": "هيونداي - سوناتا / Hyundai-Sonata",
  "toyota Yaris": "تويوتا - يارس / Toyota-Yaris",
  "hyundai Venue": "هيونداي - فينيو / Hyundai-Venue",
  "kia Pegas": "كيا - بيجاس / Kia-Pegas",
  "toyota Corolla": "تويوتا - كورولا / Toyota-Corolla",
  "hyundai Staria": "هيونداي - ستاريا / Hyundai-Staria",
  "kia K4": "كيا - كي 4 / Kia-K4",
  "hyundai Creta Jeep": "هيونداي - كريتا جيب / Hyundai-Creta Jeep",
  "suzuki Dzire": "سوزوكي - ديزاير / Suzuki-Dzire",
  "toyota Hilux": "تويوتا - هايلوكس / Toyota-Hilux",
  "toyota Veloz": "تويوتا - فيلوز / Toyota-Veloz",
  "toyota Raize": "تويوتا - رايز / Toyota-Raize",
  "great wall Wingle": "جريت وول - وينجل / Great Wall-Wingle",
  "toyota Camry": "تويوتا - كامري / Toyota-Camry",
  "mitsubishi Attrage": "ميتسوبيشي - اتراج / Mitsubishi-Attrage",
  "great wall Wingel 7": "جريت وول - وينجل 7 / Great Wall-Wingel 7",
  "nissan Sunny": "نيسان - صني / Nissan-Sunny",
  "lexus Es 250": "لكزس - ES 250 / Lexus-Es 250",
  "chery Tiggo 4 Pro": "شيري - تيجو 4 / Chery-Tiggo 4 Pro",
};

interface Car {
  id: number;
  owner_name?: string;
  specification_policy?: string;
  Ref?: number;
  make_no?: number;
  manufacturer?: string;
  model_no?: number;
  model?: string;
  type_no?: string;
  Type?: string;
  seats?: number;
  manufacturing_year?: number;
  plate?: string;
  sequance?: number;
  chassis?: string;
  excess?: number;
  color?: string;
  sum_insured?: number;
  premium?: number;
}

const StyledContainer = styled.div`
  .main-container {
    min-height: 100vh;
    background-color: #f9fafb;
    padding: 2rem;
  }

  .header-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .title {
    font-size: 2.25rem;
    font-weight: 800;
    color: #1e293b;
  }

  .search-add-container {
    display: flex;
    flex-direction: row;
    gap: 1rem;
    width: 100%;
    max-width: 600px;
    justify-content: center;
    align-items: center;
  }

  .search-input {
    flex: 1;
    padding: 0.75rem 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    font-size: 1rem;
    color: #334155;
    background-color: #ffffff;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .search-input:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .manufacturer-logo {
    width: 60px;
    height: auto;
    object-fit: contain;
  }

  .manufacturer-logo-text {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
  }

  .back-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background-color: #e2e8f0;
    color: #475569;
    border: none;
    border-radius: 0.5rem;
    font-size: 1.25rem;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.2s;
  }

  .back-button:hover {
    background-color: #cbd5e1;
    transform: translateX(2px);
  }

  .car-card {
    background-color: #ffffff;
    border-radius: 0.75rem;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.3s, transform 0.3s;
    border: 1px solid #e2e8f0;
  }

  .car-card:hover {
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2);
    transform: translateY(-5px);
  }

  .car-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
  }

  .car-info {
    font-size: 0.875rem;
    color: #64748b;
  }

  .action-buttons {
    display: flex;
    gap: 0.75rem;
    margin-top: 1rem;
  }

  .edit-button {
    padding: 0.5rem 1rem;
    background-color: #f59e0b;
    color: #ffffff;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .edit-button:hover {
    background-color: #d97706;
  }

  .delete-button {
    padding: 0.5rem 1rem;
    background-color: #ef4444;
    color: #ffffff;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .delete-button:hover {
    background-color: #dc2626;
  }

  .cards-section {
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    padding: 1.5rem;
    background-color: #ffffff;
    margin-top: 1.5rem;
  }

  .cards-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: center;
  }
`;

const StyledBookCard = styled.div`
  .book {
    position: relative;
    border-radius: 15px;
    width: 250px;
    height: 350px;
    background-color: #f0f4f8;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transform: preserve-3d;
    perspective: 2000px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #333;
    cursor: pointer;
    overflow: hidden;
    transition: transform 0.3s, box-shadow 0.3s;
    border: 1px solid #e2e8f0;
  }

  .book:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2);
  }

  .cover {
    top: 0;
    position: absolute;
    background-color: rgb(227, 236, 247);
    width: 100%;
    height: 100%;
    border-radius: 15px;
    cursor: pointer;
    transition: all 0.5s;
    transform-origin: 0;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
  }

  .book:hover .cover {
    transition: all 0.5s;
    transform: rotateY(-80deg);
  }

  .logo {
    width: 100px;
    height: auto;
    max-height: 80%;
    object-fit: contain;
  }

  .manufacturer-text {
    font-size: 22px;
    font-weight: bolder;
    margin: 0;
    text-align: center;
  }

  .car-count {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 1rem;
    font-weight: 600;
    color: #334155;
    background-color: rgba(255, 255, 255, 0.8);
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    opacity: 0;
    transition: opacity 0.3s;
  }

  .book:hover .car-count {
    opacity: 1;
  }

  .car-count-number {
    display: block;
  }

  .book:hover .car-count-number {
    display: none;
  }

  .car-count-text {
    display: none;
  }

  .book:hover .car-count-text {
    display: block;
  }
`;

const StyledModal = styled.div`
  .modal-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
  }

  .modal-content {
    background-color: #ffffff;
    border-radius: 0.75rem;
    padding: 2rem;
    width: 100%;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2);
  }

  .modal-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 1.5rem;
  }

  .tabs-container {
    display: flex;
    border-bottom: 1px solid #e2e8f0;
    margin-bottom: 1.5rem;
  }

  .tab {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    color: #475569;
    cursor: pointer;
    transition: all 0.3s;
    border-bottom: 2px solid transparent;
  }

  .tab.active {
    color: #6366f1;
    border-bottom: 2px solid #6366f1;
  }

  .tab:hover {
    color: #4f46e5;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .form-field {
    display: flex;
    flex-direction: column;
  }

  .form-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #475569;
    margin-bottom: 0.5rem;
  }

  .form-input {
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    font-size: 1rem;
    color: #334155;
    background-color: #ffffff;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .form-input:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
  }

  .file-input {
    padding: 0.5rem;
  }

  .error-message {
    padding: 0.75rem;
    background-color: #fee2e2;
    color: #dc2626;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    margin-bottom: 1rem;
  }

  .success-message {
    padding: 0.75rem;
    background-color: #dcfce7;
    color: #15803d;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    margin-bottom: 1rem;
  }

  .excel-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
  }

  .excel-table th,
  .excel-table td {
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    text-align: right;
    font-size: 0.875rem;
    color: #334155;
  }

  .excel-table th {
    background-color: #f8fafc;
    font-weight: 600;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .cancel-button {
    padding: 0.5rem 1rem;
    background-color: #e2e8f0;
    color: #475569;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .cancel-button:hover {
    background-color: #cbd5e1;
  }

  .submit-button {
    padding: 0.5rem 1rem;
    background-color: #6366f1;
    color: #ffffff;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.2s;
  }

  .submit-button:hover {
    background-color: #4f46e5;
    transform: translateY(-2px);
  }

  .submit-button:disabled {
    background-color: #a5b4fc;
    cursor: not-allowed;
  }

  .add-all-button {
    padding: 0.5rem 1rem;
    background-color: #22c55e;
    color: #ffffff;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.2s;
  }

  .add-all-button:hover {
    background-color: #16a34a;
    transform: translateY(-2px);
  }

  .add-all-button:disabled {
    background-color: #86efac;
    cursor: not-allowed;
  }
`;

const AddButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <StyledButtonWrapper>
      <button className="Btn" onClick={onClick}>
        <div className="sign">+</div>
        <div className="text">إضافة سيارة</div>
      </button>
    </StyledButtonWrapper>
  );
};

const StyledButtonWrapper = styled.div`
  .Btn {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 45px;
    height: 45px;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition-duration: 0.3s;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.199);
    background-color: #22c55e;
  }

  .sign {
    width: 100%;
    font-size: 2em;
    color: white;
    transition-duration: 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .text {
    position: absolute;
    right: 0%;
    width: 0%;
    opacity: 0;
    color: white;
    font-size: 0.9em;
    font-weight: 500;
    transition-duration: 0.3s;
    white-space: nowrap;
    text-align: right;
  }

  .Btn:hover {
    width: 140px;
    border-radius: 0.5rem;
    transition-duration: 0.3s;
  }

  .Btn:hover .sign {
    width: 30%;
    transition-duration: 0.3s;
    padding-right: 20px;
  }

  .Btn:hover .text {
    opacity: 1;
    width: 70%;
    transition-duration: 0.3s;
    padding-right: 20px;
  }

  .Btn:active {
    transform: translate(2px, 2px);
  }
`;

interface ScrollToTopButtonProps {
  visible: boolean;
}

const StyledScrollToTopButton = styled.button<ScrollToTopButtonProps>`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 50px;
  height: 50px;
  background-color: #6366f1;
  color: #ffffff;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: ${(props) => (props.visible ? 1 : 0)};
  visibility: ${(props) => (props.visible ? 'visible' : 'hidden')};
  transition: opacity 0.3s, visibility 0.3s, transform 0.3s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  z-index: 1000;

  &:hover {
    background-color: #4f46e5;
    transform: translateY(-3px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <StyledScrollToTopButton visible={isVisible} onClick={scrollToTop}>
      ↑
    </StyledScrollToTopButton>
  );
};

export default function CarsPage() {
  const [groupedCars, setGroupedCars] = useState<Record<string, Car[]>>({});
  const [selectedManufacturer, setSelectedManufacturer] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Car>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [activeTab, setActiveTab] = useState<'manual' | 'excel'>('manual');
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [newCars, setNewCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  

  useEffect(() => {
    fetchCars();
  }, [searchQuery]);

  const fetchCars = async () => {
    try {
      setError(null);
      const response = await fetch(`/api/car_managment?search=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('فشل في جلب السيارات');
      const data = await response.json();

      const normalizedGroupedCars: Record<string, Car[]> = {};
      Object.keys(data.groupedCars || {}).forEach((key) => {
        const normalizedKey = key.toLowerCase();
        normalizedGroupedCars[normalizedKey] = data.groupedCars[key].map((car: Car) => ({
          ...car,
          manufacturer: car.manufacturer ? car.manufacturer.toLowerCase() : car.manufacturer,
        }));
      });

      setGroupedCars(normalizedGroupedCars);
      if (selectedManufacturer && !normalizedGroupedCars[selectedManufacturer.toLowerCase()]) {
        setSelectedManufacturer(null);
      }
    } catch (err) {
      setError('حدث خطأ أثناء جلب السيارات. حاول مرة أخرى.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccessMessage(null);
      const method = editingId ? 'PUT' : 'POST';
      const normalizedFormData = {
        ...formData,
        manufacturer: formData.manufacturer ? formData.manufacturer.toLowerCase() : formData.manufacturer,
      };
      const body = editingId ? { id: editingId, ...normalizedFormData } : normalizedFormData;

      const response = await fetch('/api/CarsDetails', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('فشل في إضافة/تحديث السيارة');

      setFormData({});
      setEditingId(null);
      setIsModalOpen(false);
      setSuccessMessage(editingId ? 'تم تحديث السيارة بنجاح' : 'تم إضافة السيارة بنجاح');
      fetchCars();
    } catch (err) {
      setError('حدث خطأ أثناء إضافة/تحديث السيارة. حاول مرة أخرى.');
    }
  };

  const handleEdit = (car: Car) => {
    setFormData(car);
    setEditingId(car.id);
    setIsModalOpen(true);
    setActiveTab('manual');
    setExcelFile(null);
    setNewCars([]);
    setError(null);
    setSuccessMessage(null);
  };

  const handleDelete = async (id: number) => {
    try {
      setError(null);
      setSuccessMessage(null);
      const response = await fetch(`/api/CarsDetails?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('فشل في حذف السيارة');
      setSuccessMessage('تم حذف السيارة بنجاح');
      fetchCars();
      if (selectedManufacturer && groupedCars[selectedManufacturer.toLowerCase()]?.length === 1) {
        setSelectedManufacturer(null);
      }
    } catch (err) {
      setError('حدث خطأ أثناء حذف السيارة. حاول مرة أخرى.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newValue = name === 'manufacturer' ? value.toLowerCase() : value;
    setFormData({ ...formData, [name]: newValue });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setSelectedManufacturer(null);
  };

  const openAddModal = () => {
    setFormData({});
    setEditingId(null);
    setIsModalOpen(true);
    setActiveTab('manual');
    setExcelFile(null);
    setNewCars([]);
    setError(null);
    setSuccessMessage(null);
  };

  const handleManufacturerClick = (manufacturer: string) => {
    setSelectedManufacturer(manufacturer.toLowerCase());
  };

  const handleBackClick = () => {
    setSelectedManufacturer(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccessMessage(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        setError('يرجى رفع ملف بصيغة Excel (.xlsx أو .xls)');
        setExcelFile(null);
        return;
      }
      setExcelFile(file);
    } else {
      setExcelFile(null);
    }
  };
  
  const handleExcelUpload = async () => {
    if (!excelFile) {
      setError('يرجى اختيار ملف Excel أولاً');
      return;
    }
  
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
  
    try {
      const response = await fetch('/api/car_managment');
      if (!response.ok) {
        console.error('API response not OK:', response.status, response.statusText);
        throw new Error('فشل في جلب السيارات الحالية');
      }
      const data: { groupedCars: Record<string, Car[]> } = await response.json();
      console.log('Existing cars from API:', data.groupedCars);
  
      const existingPlates = Object.values(data.groupedCars)
        .flat()
        .map((car) => car.plate?.trim().toLowerCase())
        .filter((plate): plate is string => !!plate);
      console.log('Existing plates:', existingPlates);
  
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[];

       

        let headerRowIndex = 0;

        if (
          excelFile?.name.includes('المملوكة لعبداللطيف جميل') // الملف الذي فيه صف إضافي
        ) {
          headerRowIndex = 2; // نتخطى صفين
        } else {
          headerRowIndex = 0; // الملف العادي
        }
        
        const headers = jsonData[headerRowIndex] as string[];
        const rows = jsonData.slice(headerRowIndex + 1);
        

        

      
  
        const excelCars: Car[] = rows.map((row, index) => {
          const rowData = headers.reduce((acc, header, i) => {
            acc[header] = row[i];
            return acc; 
          }, {} as Record<string, any>);
  
          return {
            id: 0,
            owner_name: (() => {
              const normalizedKeys = Object.keys(rowData).reduce((acc, key) => {
                const normalized = key.trim().toLowerCase().replace(/\s+/g, '_');
                acc[normalized] = rowData[key];
                return acc;
              }, {} as Record<string, any>);
            
              return normalizedKeys['owner_name'] || undefined;
            })(),
            
            
            specification_policy: rowData['Specification-Policy No'] || undefined,
            Ref: rowData.Ref ? parseInt(rowData.Ref) : undefined,
            make_no: rowData['Make No'] || undefined,
            manufacturer: rowData.Make ? String(rowData.Make).trim() : undefined,
            model_no: rowData['Model No'] || undefined,
            model: rowData.Model ? String(rowData.Model).trim().toLowerCase() : undefined,
            type_no: rowData['Type No'] || undefined,
            Type: rowData.Type || undefined,
            seats: rowData.Seats ? parseInt(rowData.Seats) : undefined,
            manufacturing_year: rowData.Year ? parseInt(rowData.Year) : undefined,
            plate: rowData.Plate ? String(rowData.Plate).trim() : undefined, // Changed from plate to Plate
            sequance: rowData.Sequence ? parseInt(rowData.Sequence) : undefined,
            chassis: rowData.Chassis || undefined,
            excess: rowData.Excess ? parseInt(rowData.Excess) : undefined,
            color: (() => {
              const normalizedKeys = Object.keys(rowData).reduce((acc, key) => {
                const normalized = key.trim().toLowerCase().replace(/\s+/g, '_');
                acc[normalized] = rowData[key];
                return acc;
              }, {} as Record<string, any>);
            
              return (
                normalizedKeys['color'] ||
                normalizedKeys['اللون'] ||
                normalizedKeys['لون'] ||
                undefined
              );
            })(),
            
            sum_insured: rowData['Sum Insured/ السعر'] || rowData['Sum Insured'] || rowData['sum insured'] || rowData['SUM INSURED'] ? parseFloat(String(rowData['Sum Insured/ السعر'] || rowData['Sum Insured'] || rowData['sum insured'] || rowData['SUM INSURED']).trim()) : undefined,
            premium: rowData.premium ? parseFloat(rowData.premium) : undefined,
          };
        });
  
        console.log('Parsed Excel cars:', excelCars);
  
        const newCars = excelCars.filter(
          (car) => car.plate && !existingPlates.includes(car.plate.trim().toLowerCase())
        );
        console.log('New cars filtered:', newCars);
  
        if (newCars.length > 0) {
          setNewCars(newCars);
          setSuccessMessage(`تم العثور على ${newCars.length} سيارة جديدة`);
        } else {
          setNewCars([]);
          setSuccessMessage('لم يتم العثور على سيارات جديدة في الملف');
        }
        setIsLoading(false);
      };
      reader.onerror = () => {
        setError('حدث خطأ أثناء قراءة ملف Excel');
        setIsLoading(false);
      };
      reader.readAsArrayBuffer(excelFile);
    } catch (err) {
      console.error('Error processing Excel file:', err);
      setError('حدث خطأ أثناء معالجة الملف. حاول مرة أخرى.');
      setIsLoading(false);
    }
  };
  
  const handleAddNewCars = async () => {
    if (newCars.length === 0) {
      setError('لا توجد سيارات جديدة لإضافتها');
      return;
    }
  
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
  
    try {
      const addPromises = newCars.map((car) =>
        fetch('/api/car_managment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            owner_name: car.owner_name,
            specification_policy: car.specification_policy,
            Ref: car.Ref,
            make_no: car.make_no,
            manufacturer: car.manufacturer,
            model_no: car.model_no,
            model: car.model,
            type_no: car.type_no,
            Type: car.Type,
            seats: car.seats,
            manufacturing_year: car.manufacturing_year,
            plate: car.plate,
            sequance: car.sequance,
            chassis: car.chassis,
            excess: car.excess,
            color: car.color,
            sum_insured: car.sum_insured,
            premium: car.premium,
          }),
        }).then((res) => {
          if (!res.ok) {
            throw new Error(`فشل في إضافة السيارة ${car.plate || ''}`);
          }
          return res.json();
        })
      );
  
      await Promise.all(addPromises);
  
      setSuccessMessage('تم إضافة السيارات الجديدة بنجاح');
      setNewCars([]);
      setExcelFile(null);
      setIsModalOpen(false);
      fetchCars();
    } catch (err) {
      setError('حدث خطأ أثناء إضافة السيارات. حاول مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  // const handleExcelUpload = async () => {
  //   if (!excelFile) {
  //     setError('يرجى اختيار ملف Excel أولاً');
  //     return;
  //   }

  //   setIsLoading(true);
  //   setError(null);
  //   setSuccessMessage(null);

  //   const formData = new FormData();
  //   formData.append('file', excelFile);

  //   try {
  //     const response = await fetch('/api/CarsDetails/check-excel', {
  //       method: 'POST',
  //       body: formData,
  //     });

  //     if (!response.ok) throw new Error('فشل في معالجة ملف Excel');

  //     const data = await response.json();
  //     if (data.newCars && data.newCars.length > 0) {
  //       setNewCars(data.newCars);
  //       setSuccessMessage(`تم العثور على ${data.newCars.length} سيارة جديدة`);
  //     } else {
  //       setNewCars([]);
  //       setSuccessMessage('لم يتم العثور على سيارات جديدة في الملف');
  //     }
  //   } catch (err) {
  //     setError('حدث خطأ أثناء معالجة ملف Excel. حاول مرة أخرى.');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const handleAddNewCars = async () => {
  //   if (newCars.length === 0) {
  //     setError('لا توجد سيارات جديدة لإضافتها');
  //     return;
  //   }

  //   try {
  //     setError(null);
  //     setSuccessMessage(null);
  //     const response = await fetch('/api/CarsDetails/bulk', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(newCars),
  //     });

  //     if (!response.ok) throw new Error('فشل في إضافة السيارات');

  //     setSuccessMessage('تم إضافة السيارات الجديدة بنجاح');
  //     setNewCars([]);
  //     setExcelFile(null);
  //     setIsModalOpen(false);
  //     fetchCars();
  //   } catch (err) {
  //     setError('حدث خطأ أثناء إضافة السيارات. حاول مرة أخرى.');
  //   }
  // };

  return (
    <div dir="rtl">
      <Navbar />
      <StyledContainer>
        <div className="main-container">
          <div className="header-section">
            <h1 className="title">إدارة السيارات</h1>
            <div className="search-add-container">
              <input
                type="text"
                placeholder="ابحث حسب المالك، الشركة المصنعة، الموديل، اللوحة، أو اللون"
                value={searchQuery}
                onChange={handleSearchChange}
                className="search-input"
              />
              <AddButton onClick={openAddModal} />
            </div>
          </div>

          {/* رسائل الخطأ والنجاح */}
          {error && (
            <div className="error-message" style={{ margin: '1rem' }}>
              {error}
            </div>
          )}
          {successMessage && (
            <div className="success-message" style={{ margin: '1rem' }}>
              {successMessage}
            </div>
          )}

          {/* Manufacturer Cards or Cars List */}
          <div className="cards-section">
            {selectedManufacturer ? (
              <div>
                <div className="section-header">
                  <div>
                    <img
                      src={`/images/${selectedManufacturer}.png`}
                      alt={`${selectedManufacturer} logo`}
                      className="manufacturer-logo"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                        const textElement = img.nextElementSibling as HTMLElement;
                        if (textElement) {
                          textElement.style.display = 'block';
                        }
                      }}
                    />
                    <span className="manufacturer-logo-text" style={{ display: 'none' }}>
                      {selectedManufacturer}
                    </span>
                  </div>
                  <button onClick={handleBackClick} className="back-button">
                    ←
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedCars[selectedManufacturer]?.map((car) => (
                    <div key={car.id} className="car-card">
                      <h2 className="car-title">
                        {carNameMapping[`${car.manufacturer} ${car.model}`] ||
                          `${car.manufacturer} ${car.model}`}
                      </h2>
                      <p className="car-info">اللوحة: {car.plate || 'غير متوفر'}</p>
                      <p className="car-info">سنة التصنيع: {car.manufacturing_year || 'غير متوفر'}</p>
                      <div className="action-buttons">
                        <button onClick={() => handleEdit(car)} className="edit-button">
                          تعديل
                        </button>
                        <button onClick={() => handleDelete(car.id)} className="delete-button">
                          حذف
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="cards-grid">
                {Object.keys(groupedCars).map((manufacturer) => {
                  const normalizedManufacturer = manufacturer.toLowerCase();
                  return (
                    <StyledBookCard
                      key={manufacturer}
                      onClick={() => handleManufacturerClick(manufacturer)}
                    >
                      <div className="book">
                        <div className="car-count">
                          <span className="car-count-number">{groupedCars[manufacturer].length}</span>
                          <span className="car-count-text">عدد السيارات: {groupedCars[manufacturer].length}</span>
                        </div>
                        <div className="cover">
                          <img
                            src={`/images/${normalizedManufacturer}.png`}
                            alt={`${manufacturer} logo`}
                            className="logo"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.style.display = 'none';
                              const textElement = img.nextElementSibling as HTMLElement;
                              if (textElement) {
                                textElement.style.display = 'block';
                              }
                            }}
                          />
                          <p className="manufacturer-text" style={{ display: 'none' }}>
                            {manufacturer}
                          </p>
                        </div>
                      </div>
                    </StyledBookCard>
                  );
                })}
                {Object.keys(groupedCars).length === 0 && (
                  <p className="text-gray-600 text-center col-span-full">
                    لا توجد شركات أو سيارات مطابقة للبحث.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Modal */}
          {isModalOpen && (
            <StyledModal>
              <div className="modal-overlay">
                <div className="modal-content">
                  <h2 className="modal-title">
                    {editingId
                      ? `تعديل: ${
                          carNameMapping[`${formData.manufacturer} ${formData.model}`] ||
                          `${formData.manufacturer || ''} ${formData.model || ''}`
                        }`
                      : 'إضافة سيارة جديدة'}
                  </h2>

                  {/* Tabs */}
                  <div className="tabs-container">
                    <div
                      className={`tab ${activeTab === 'manual' ? 'active' : ''}`}
                      onClick={() => setActiveTab('manual')}
                    >
                      إضافة يدوية
                    </div>
                    <div
                      className={`tab ${activeTab === 'excel' ? 'active' : ''}`}
                      onClick={() => setActiveTab('excel')}
                    >
                      رفع ملف Excel
                    </div>
                  </div>

                  {/* رسائل الخطأ والنجاح */}
                  {error && activeTab === 'excel' && (
                    <div className="error-message">{error}</div>
                  )}
                  {successMessage && activeTab === 'excel' && (
                    <div className="success-message">{successMessage}</div>
                  )}

                  {/* Manual Add Tab */}
                  {activeTab === 'manual' && (
                    <form onSubmit={handleSubmit}>
                      <div className="form-grid">
                        <div className="form-field">
                          <label className="form-label">اسم المالك</label>
                          <input
                            type="text"
                            name="owner_name"
                            value={formData.owner_name || ''}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="أدخل اسم المالك"
                          />
                        </div>
                        <div className="form-field">
                          <label className="form-label">مرجع</label>
                          <input
                            type="text"
                            name="Ref"
                            value={formData.Ref || ''}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="أدخل المرجع"
                          />
                        </div>
                        <div className="form-field">
                          <label className="form-label">الشركة المصنعة</label>
                          <input
                            type="text"
                            name="manufacturer"
                            value={formData.manufacturer || ''}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="أدخل الشركة المصنعة"
                          />
                        </div>
                        <div className="form-field">
                          <label className="form-label">الموديل</label>
                          <input
                            type="text"
                            name="model"
                            value={formData.model || ''}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="أدخل الموديل"
                          />
                        </div>
                        <div className="form-field">
                          <label className="form-label">عدد المقاعد</label>
                          <input
                            type="number"
                            name="seats"
                            value={formData.seats || ''}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="أدخل عدد المقاعد"
                          />
                        </div>
                        <div className="form-field">
                          <label className="form-label">سنة الصنع</label>
                          <input
                            type="number"
                            name="manufacturing_year"
                            value={formData.manufacturing_year || ''}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="أدخل سنة الصنع"
                          />
                        </div>
                        <div className="form-field">
                          <label className="form-label">رقم اللوحة</label>
                          <input
                            type="text"
                            name="plate"
                            value={formData.plate || ''}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="أدخل رقم اللوحة"
                          />
                        </div>
                        <div className="form-field">
                          <label className="form-label">اللون</label>
                          <input
                            type="text"
                            name="color"
                            value={formData.color || ''}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="أدخل اللون"
                          />
                        </div>
                      </div>
                      <div className="modal-actions">
                        <button
                          type="button"
                          onClick={() => setIsModalOpen(false)}
                          className="cancel-button"
                        >
                          إلغاء
                        </button>
                        <button type="submit" className="submit-button">
                          {editingId ? 'تحديث السيارة' : 'إضافة السيارة'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Excel Upload Tab */}
                  {activeTab === 'excel' && (
                    <div>
                      <div className="form-field">
                        <label className="form-label">رفع ملف Excel</label>
                        <input
                          type="file"
                          accept=".xlsx, .xls"
                          onChange={handleFileChange}
                          className="form-input file-input"
                        />
                        <button
                          onClick={handleExcelUpload}
                          disabled={!excelFile || isLoading}
                          className="submit-button"
                          style={{ marginTop: '0.5rem' }}
                        >
                          {isLoading ? 'جاري التحميل...' : 'تحميل الملف'}
                        </button>
                      </div>

                      {/* Display New Cars */}
                      {newCars.length > 0 && (
                        <div>
                          <h3 className="form-label" style={{ marginTop: '1rem' }}>
                            السيارات الجديدة المكتشفة
                          </h3>
                          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            <table className="excel-table">
                              <thead>
                                <tr>
                                  <th>الشركة المصنعة</th>
                                  <th>الموديل</th>
                                  <th>رقم اللوحة</th>
                                  <th>سنة الصنع</th>
                                </tr>
                              </thead>
                              <tbody>
                                {newCars.map((car, index) => (
                                  <tr key={index}>
                                    <td>{car.manufacturer || 'غير متوفر'}</td>
                                    <td>{car.model || 'غير متوفر'}</td>
                                    <td>{car.plate || 'غير متوفر'}</td>
                                    <td>{car.manufacturing_year || 'غير متوفر'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <button
                            onClick={handleAddNewCars}
                            className="add-all-button"
                            style={{ marginTop: '1rem' }}
                          >
                            إضافة كل السيارات الجديدة
                          </button>
                        </div>
                      )}

                      <div className="modal-actions">
                        <button
                          type="button"
                          onClick={() => setIsModalOpen(false)}
                          className="cancel-button"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </StyledModal>
          )}
        </div>
        <ScrollToTopButton />
      </StyledContainer>
    </div>
  );
}