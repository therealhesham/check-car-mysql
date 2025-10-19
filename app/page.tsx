'use client';

import Link from 'next/link';
import Navbar from '@/public/components/navbar';
import { FaCar, FaHistory, FaArrowRight, FaArrowLeft, FaUsers, FaCarSide, FaTag, FaBuilding, FaTimes } from 'react-icons/fa';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import { PermissionGuard } from './ROLE/PermissionGuard';
import { usePermissions } from './ROLE/usePermissions';
import { UserRole , ROLE_PERMISSIONS} from './ROLE/types';
import { FaEdit,FaPlus,FaSave,FaTrash,FaList,FaUser,FaIdCard,FaLock,FaUserTag,FaChevronDown,FaSignOutAlt} from 'react-icons/fa';
import React from 'react';
import AWS from 'aws-sdk';


interface User {
  id: string;
  name: string;
  EmID: number;
  role: UserRole;
  branch: string;
}

interface Employee {
  id: string;
  Name: string;
  EmID: number;
  password: string;
  role: string;
  branch: string;
}

interface Car {
  id: string;
  Name: string;
}

interface Plate {
  id: string;
  Name: string;
}

interface Branch {
  id: string;
  Name: string;
}

interface Contract {
  id: number;
  contract_number: number;
  car_model: string;
  plate_number: string;
  operation_type: string;
  branch_name: string;
  created_at: string; // أو Date
  client_id: string;
  client_name: string;
  meter_reading?: string;
  // أضف أي حقول أخرى حسب الحاجة
}

async function fetchBranches(): Promise<Branch[]> {
  try {
    const response = await fetch('/api/addbranch', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (data.success) {
      return data.results.map((record: any) => ({
        id: record.id,
        Name: record.fields.Name,
      }));

    }
    return [];
  } catch (error) {
    console.error('Error fetching branches:', error);
    return [];
  }
}



async function fetchEmployees(): Promise<Employee[]> {
  try {
    const response = await fetch('/api/usermange', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'فشل في جلب الموظفين.');
    }

    const data = await response.json();
    if (data.success) {
      return data.results.map((record: any) => ({
        id: record.id,
        Name: record.Name,
        EmID: record.EmID,
        password: record.password,
        role: record.role,
        branch: record.branch,
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
}

export default function HomePage() {
  const [isPlateModalOpen, setIsPlateModalOpen] = useState(false);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState<boolean>(false);
  const [confirmDeleteChecked, setConfirmDeleteChecked] = useState<boolean>(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
  const [plateToDelete, setPlateToDelete] = useState<string | null>(null);
  const [branchToDelete, setBranchToDelete] = useState<string | null>(null);
  const [isAddEmployeeMode, setIsAddEmployeeMode] = useState(false);
  const [isAddPlateMode, setIsAddPlateMode] = useState(false);
  const [isAddBranchMode, setIsAddBranchMode] = useState(false);
  const [newPlateLetters, setNewPlateLetters] = useState('');
  const [newPlateNumbers, setNewPlateNumbers] = useState('');
  const [newBranchName, setNewBranchName] = useState('');
  const [originalPassword, setOriginalPassword] = useState('');
  const [originalRole, setOriginalRole] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'EmID' | 'role'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const { isAtLeastRole, hasRole } = usePermissions();
  const [newEmployee, setNewEmployee] = useState<Employee>({
    id: '',
    Name: '',
    EmID: 0,
    password: '',
    role: 'employee',
    branch: '',
  });
  const [plates, setPlates] = useState<Plate[]>([]);
  const [isDeleteProgressModalOpen, setIsDeleteProgressModalOpen] = useState<boolean>(false);
const [deleteProgress, setDeleteProgress] = useState<{
  current: number;
  total: number;
  status: 'pending' | 'success' | 'error';
  message: string;
  details: Array<{
    contractNumber: number;
    entryId: number;
    exitId?: number;
    status: 'in-progress' | 'success' | 'error';
    message: string;
  }>;
} | null>(null);
  const [filteredPlates, setFilteredPlates] = useState<Plate[]>([]);
  const [searchPlateTerm, setSearchPlateTerm] = useState('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedPlate, setSelectedPlate] = useState<Plate | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isExpiredContractsModalOpen, setIsExpiredContractsModalOpen] = useState<boolean>(false);
  const DO_ACCESS_KEY = process.env.NEXT_PUBLIC_DO_ACCESS_KEY;
  const DO_SECRET_KEY = process.env.NEXT_PUBLIC_DO_SECRET_KEY;
  const DO_ENDPOINT = process.env.NEXT_PUBLIC_DO_ENDPOINT;

if (!DO_ACCESS_KEY || !DO_SECRET_KEY || !DO_ENDPOINT) {
  console.error('Missing DigitalOcean credentials in environment variables');
}

// إنشاء كائن s3
const s3 = new AWS.S3({
  accessKeyId: DO_ACCESS_KEY,
  secretAccessKey: DO_SECRET_KEY,
  endpoint: DO_ENDPOINT,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
});
  // حالة العقود المحددة
const [selectedContractIds, setSelectedContractIds] = useState<number[]>([]);

// حالة العقد المُوسّع (لعرض التفاصيل)
const [expandedContract, setExpandedContract] = useState<number | null>(null);

// حالة تحديد الكل
const [selectAll, setSelectAll] = useState<boolean>(false);
const [expiredContracts, setExpiredContracts] = useState<{
  entry: any;
  exit?: any;
}[]>([]); // تخزين أزواج (دخول + خروج)
const [loadingExpired, setLoadingExpired] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const [time, settime] = useState(Date.now())
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      router.push('/login');
      toast.warn('يرجى تسجيل الدخول أولاً.');
    }

    const loadData = async () => {
      try {
        const fetchedBranches = await fetchBranches();
        const fetchedEmployees = await fetchEmployees();
        setBranches(fetchedBranches);

        setEmployees(fetchedEmployees);
        if (fetchedBranches.length === 0) {
          toast.warn('لا توجد فروع متاحة. يرجى إضافة فرع أولاً.');
        } else {
          setNewEmployee((prev) => ({
            ...prev,
            branch: fetchedBranches[0].Name,
          }));
        }
      } catch (err) {
        console.error('Error loading data:', err);
        toast.error('حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.');
      }
    };
    loadData();
  }, [router, time]);

  useEffect(() => {
    if (isBranchModalOpen && user?.role === 'admin') {
      const loadBranches = async () => {
        try {
          const fetchedBranches = await fetchBranches();
          setBranches(fetchedBranches);
          if (fetchedBranches.length === 0) {
            toast.info('لا توجد فروع متاحة حاليًا.');
          }
        } catch (err) {
          console.error('Error loading branches:', err);
          toast.error('حدث خطأ أثناء تحميل الفروع.');
        }
      };
      loadBranches();
    }
  }, [isBranchModalOpen, user]);

  useEffect(() => {
    if (isEmployeeModalOpen && user?.role === 'admin') {
      const loadEmployees = async () => {
        try {
          const fetchedEmployees = await fetchEmployees();
          setEmployees(fetchedEmployees);
          if (fetchedEmployees.length === 0) {
            toast.info('لا توجد موظفين متاحين حاليًا.');
          }
        } catch (err) {
          console.error('Error loading employees:', err);
          toast.error('حدث خطأ أثناء تحميل الموظفين.');
        }
      };
      loadEmployees();
    }
  }, [isEmployeeModalOpen, user]);

  // Handle plate search
  useEffect(() => {
    if (searchPlateTerm.trim() === '') {
      setFilteredPlates(plates);
      return;
    }

    const searchLower = searchPlateTerm.trim().toLowerCase();
    const filtered = plates.filter((plate) => {
      // Normalize plate Name by converting to lowercase and removing extra spaces
      const plateName = plate.Name.trim().toLowerCase();
      // Check if the entire plate name contains the search term
      return plateName.includes(searchLower);
    });

    setFilteredPlates(filtered);

    if (filtered.length === 0 && plates.length > 0) {
      toast.warn('لا توجد لوحات مطابقة للبحث.');
    }
  }, [searchPlateTerm, plates]);

  const openPlateModal = () => {
    setIsPlateModalOpen(true);
  };

  const openBranchModal = () => {
    setIsBranchModalOpen(true);
  };

  const openEmployeeModal = () => {
    setIsEmployeeModalOpen(true);
  };


  const closePlateModal = () => {
    setIsPlateModalOpen(false);
    setSelectedPlate(null);
    setIsAddPlateMode(false);
    setNewPlateLetters('');
    setNewPlateNumbers('');
    setSearchPlateTerm('');
  };

  

  const fetchExpiredContracts = async () => {
    setLoadingExpired(true);
    try {
      // 1. حساب التاريخ: 3 أشهر قبل اليوم
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      const createdBefore = threeMonthsAgo.toISOString();
  
      // 2. جلب عقود "الدخول" فقط
      const response = await fetch(
        `/api/history?operation_type=دخول&createdBefore=${encodeURIComponent(createdBefore)}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      const data = await response.json();
      if (!response.ok || !Array.isArray(data.records)) {
        throw new Error(data.message || 'فشل في جلب العقود');
      }
  
      const contracts: Contract[] = data.records;
  
      // 3. إزالة التكرارات حسب contract_number
      const uniqueContractsMap = new Map<number, Contract>();
      contracts.forEach(contract => {
        if (contract.contract_number && contract.operation_type === 'دخول') {
          if (!uniqueContractsMap.has(contract.contract_number)) {
            uniqueContractsMap.set(contract.contract_number, contract);
          }
        }
      });
      const uniqueContracts = Array.from(uniqueContractsMap.values());
  
      // 4. جلب عقود "الخروج" لكل عقد دخول
      const result: { entry: Contract; exit?: Contract | null }[] = [];
  
      for (const entry of uniqueContracts) {
        const contractNum = entry.contract_number;
  
        // ✅ التحقق من صحة contract_number
        if (!contractNum || typeof contractNum !== 'number' || contractNum <= 0) {
          result.push({ entry, exit: null });
          continue;
        }
  
        let exitContract: Contract | null = null;
        try {
          const exitResponse = await fetch(
            `/api/history?contract_number=${encodeURIComponent(contractNum)}&operation_type=خروج&sort=desc`,
            {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
              cache: 'no-store'
            }
          );
          
          if (!exitResponse.ok) {
            console.warn(`فشل في جلب سجل الخروج للعقد ${contractNum}:`, exitResponse.status);
            exitContract = null;
          } else {
            const contentType = exitResponse.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
              console.warn('الاستجابة ليست من نوع JSON:', contentType);
              exitContract = null;
            } else {
              const exitData = await exitResponse.json();
              // استخراج أحدث سجل خروج (مع التأكد من الترتيب الصحيح)
              if (Array.isArray(exitData.records) && exitData.records.length > 0) {
                // ترتيب السجلات حسب التاريخ بشكل صريح واختيار الأحدث
                const sortedExits = exitData.records.sort((a: any, b: any) => {
                  const dateA = new Date(a.created_at).getTime();
                  const dateB = new Date(b.created_at).getTime();
                  return dateB - dateA; // تنازلي (الأحدث أولاً)
                });
                exitContract = sortedExits[0];
              } else {
                exitContract = null;
              }
            }
          }
        } catch (error) {
          console.error(`خطأ في جلب سجل الخروج للعقد ${contractNum}:`, error);
          exitContract = null;
        }
  
        result.push({
          entry,
          exit: exitContract,
        });
      }
  
      // 5. ترتيب: الأحدث أولًا (حسب تاريخ الدخول)
      result.sort(
        (a, b) =>
          new Date(b.entry.created_at).getTime() - new Date(a.entry.created_at).getTime()
      );
  
      // 6. تحديث الحالة
      setExpiredContracts(result);
      setSelectedContractIds([]);
      setExpandedContract(null);
      setSelectAll(false);
    } catch (error) {
      console.error('Error fetching expired contracts:', error);
      toast.error('فشل في جلب العقود المنتهية');
      setExpiredContracts([]);
      setSelectedContractIds([]);
      setExpandedContract(null);
      setSelectAll(false);
    } finally {
      setLoadingExpired(false);
    }
  };

  const closeBranchModal = () => {
    setIsBranchModalOpen(false);
    setSelectedBranch(null);
    setIsAddBranchMode(false);
    setNewBranchName('');
  };

  const closeEmployeeModal = () => {
    setIsEmployeeModalOpen(false);
    setSelectedEmployee(null);
    setIsAddEmployeeMode(false);
    setNewEmployee({ id: '', Name: '', EmID: 0, password: '', role: 'employee', branch: branches[0]?.Name || '' });
  };


  const closeDeleteConfirmModal = () => {
    setIsDeleteConfirmModalOpen(false);
    setEmployeeToDelete(null);
    setPlateToDelete(null);
    setBranchToDelete(null);
  };

  const handleAddBranch = async () => {
    // التحقق من صلاحية المستخدم الأساسية - يجب أن يكون لديه صلاحية إضافة الفروع
    if (!user || !ROLE_PERMISSIONS[user.role].canManageBranches) {
      toast.error('غير مصرح لك بتنفيذ هذا الإجراء.');
      return;
    }
    
    const branchRegex = /^[ء-ي\s]+$/;
    if (!newBranchName.trim()) {
      toast.error('الرجاء إدخال اسم الفرع.');
      return;
    }
    
    if (!branchRegex.test(newBranchName.trim())) {
      toast.error('اسم الفرع يجب أن يحتوي على حروف عربية ومسافات فقط.');
      return;
    }
    
    try {
      const response = await fetch('/api/addbranch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ branch: newBranchName.trim() }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.error.includes('already exists')) {
          toast.error('هذا الفرع موجود بالفعل.');
        } else {
          throw new Error(errorData.error || 'فشل في إضافة الفرع.');
        }
        return;
      }
      
      const data = await response.json();
      
      // تحديث قائمة الفروع المحلية
      setBranches([...branches, { id: data.result.id, Name: data.result.fields.Name }]);
      
      // إعادة تعيين الحالات
      setNewBranchName('');
      setIsAddBranchMode(false);
      settime(Date.now());
      toast.success('تمت إضافة الفرع بنجاح!');
    } catch (err: any) {
      console.error('Error adding branch:', err);
      toast.error(
        err.message.includes('Failed to fetch')
          ? 'فشل الاتصال بالخادم. تحقق من الشبكة وحاول مرة أخرى.'
          : err.message || 'حدث خطأ أثناء إضافة الفرع.'
      );
    }
  };
  


  const handleEditBranch = (branch: Branch) => {
    setSelectedBranch(branch);
    setNewBranchName(branch.Name);
    setIsAddBranchMode(false);
    toast.info(`جاري تعديل : ${branch.Name}`);
  };

  const handleUpdateBranch = async () => {
    // التحقق من صلاحية المستخدم الأساسية - يجب أن يكون لديه صلاحية تعديل الفروع
    if (!user || !ROLE_PERMISSIONS[user.role].canManageBranches) {
      toast.error('غير مصرح لك بتنفيذ هذا الإجراء.');
      return;
    }
    
    if (!selectedBranch) {
      toast.error('لم يتم اختيار فرع للتعديل.');
      return;
    }
    
    const branchRegex = /^[ء-ي\s]+$/;
    if (!newBranchName.trim()) {
      toast.error('الرجاء إدخال اسم الفرع.');
      return;
    }
    
    if (!branchRegex.test(newBranchName.trim())) {
      toast.error('اسم الفرع يجب أن يحتوي على حروف عربية ومسافات فقط.');
      return;
    }
    
    try {
      const response = await fetch('/api/addbranch', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedBranch.id,
          branch: newBranchName.trim(),
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.error.includes('already exists')) {
          toast.error('هذا الفرع موجود بالفعل.');
        } else {
          throw new Error(errorData.error || 'فشل في تعديل الفرع.');
        }
        return;
      }
      
      const data = await response.json();
      
      // تحديث قائمة الفروع المحلية
      setBranches(
        branches.map((branch) =>
          branch.id === selectedBranch.id ? { id: data.result.id, Name: data.result.Name } : branch
        )
      );
      
      // تحديث بيانات الموظفين إذا تم تغيير اسم الفرع
      if (selectedBranch.Name !== newBranchName.trim()) {
        setEmployees(prevEmployees =>
          prevEmployees.map(employee => {
            if (employee.branch.includes(selectedBranch.Name)) {
              // استبدال اسم الفرع القديم بالجديد في قائمة فروع الموظف
              const updatedBranches = employee.branch
                .split(',')
                .map(branch => branch.trim() === selectedBranch.Name ? newBranchName.trim() : branch)
                .join(',');
              
              return {
                ...employee,
                branch: updatedBranches
              };
            }
            return employee;
          })
        );
      }
      
      setSelectedBranch(null);
      setNewBranchName('');
      settime(Date.now());
      toast.success('تم تعديل الفرع بنجاح!');
    } catch (err: any) {
      console.error('Error updating branch:', err);
      toast.error(
        err.message.includes('Failed to fetch')
          ? 'فشل الاتصال بالخادم. تحقق من الشبكة وحاول مرة أخرى.'
          : err.message || 'حدث خطأ أثناء تعديل الفرع.'
      );
    }
  };

  const confirmDeleteBranch = (branchId: string) => {
    setBranchToDelete(branchId);
    setEmployeeToDelete(null);
    setPlateToDelete(null);
    setIsDeleteConfirmModalOpen(true);
  };

  const handleDeleteBranch = async () => {
    // التحقق من صلاحية المستخدم الأساسية - يجب أن يكون لديه صلاحية حذف الفروع
    if (!user || !ROLE_PERMISSIONS[user.role].canDeleteBranches) {
      toast.error('غير مصرح لك بتنفيذ هذا الإجراء.');
      return;
    }
    
    if (!branchToDelete) {
      toast.error('لم يتم اختيار فرع للحذف.');
      return;
    }
    
    try {
      const response = await fetch('/api/addbranch', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: branchToDelete }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // ✅ استخدم الرسالة من الـ API بدلًا من كتابتها يدويًا
        if (errorData.message && errorData.message.includes('موظفين')) {
          toast.error(errorData.message); // ستعرض: "لا يمكن حذف الفرع لأنه يحتوي على موظفين..."
        } else {
          // للرسائل العامة
          toast.error(errorData.message || errorData.error || 'فشل في حذف الفرع.');
        }
        return;
      }
      
      // تحديث قائمة الفروع المحلية
      setBranches(branches.filter((branch) => branch.id !== branchToDelete));
      
      // تحديث بيانات الموظفين لإزالة الفرع المحذوف من قائمة فروعهم
      setEmployees(prevEmployees =>
        prevEmployees.map(employee => {
          if (employee.branch.includes(branchToDelete)) {
            // إزالة الفرع المحذوف من قائمة فروع الموظف
            const updatedBranches = employee.branch
              .split(',')
              .filter(branch => branch.trim() !== branchToDelete)
              .join(',');
            
            return {
              ...employee,
              branch: updatedBranches
            };
          }
          return employee;
        })
      );
      
      closeDeleteConfirmModal();
      settime(Date.now());
      toast.success('تم حذف الفرع بنجاح!');
    } catch (err: any) {
      console.error('Error deleting branch:', err);
      toast.error(
        err.message.includes('Failed to fetch')
          ? 'فشل الاتصال بالخادم. تحقق من الشبكة وحاول مرة أخرى.'
          : err.message || 'حدث خطأ أثناء حذف الفرع.'
      );
    }
  };


  const handleAddEmployee = async () => {
    // ✅ تحقق من صلاحية المستخدم باستخدام نظام الصلاحيات
    if (!isAtLeastRole('admin')) {
      toast.error('غير مصرح لك بإدارة الموظفين. يجب أن تكون مديرًا أو أعلى.');
      return;
    }
  
    if (!newEmployee.Name.trim() || !newEmployee.password.trim() || !newEmployee.branch.trim()) {
      toast.error('الرجاء ملء جميع الحقول المطلوبة (الاسم، كلمة المرور، الفرع).');
      return;
    }
  
    if (isNaN(newEmployee.EmID) || newEmployee.EmID <= 0) {
      toast.error('معرف الموظف يجب أن يكون رقمًا صالحًا وأكبر من 0.');
      return;
    }
  
    // ✅ التحقق من صلاحية تعيين الدور
    const newRole = newEmployee.role as UserRole;
  
    if (newRole === 'super_admin' || newRole === 'owner') {
      if (!hasRole('owner')) {
        toast.error('فقط المالك يمكنه إنشاء super_admin أو owner');
        return;
      }
    }
    // لا حاجة لفحص أدوار أخرى، لأن owner و super_admin مسموحان فقط لمن هو owner
  
    try {
      const response = await fetch('/api/usermange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            Name: newEmployee.Name.trim(),
            EmID: newEmployee.EmID,
            password: newEmployee.password.trim(),
            role: newRole,
            branch: newEmployee.branch.trim(),
          },
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.error?.includes('already exists')) {
          toast.error('معرف الموظف هذا مستخدم بالفعل.');
        } else {
          throw new Error(errorData.error || 'فشل في إضافة الموظف.');
        }
        return;
      }
  
      const data = await response.json();
      setIsAddEmployeeMode(false);
      settime(Date.now());
      toast.success('تمت إضافة الموظف بنجاح!');
    } catch (err: any) {
      console.error('Error adding employee:', err);
      toast.error(
        err.message.includes('Failed to fetch')
          ? 'فشل الاتصال بالخادم. تحقق من الشبكة وحاول مرة أخرى.'
          : err.message || 'حدث خطأ أثناء إضافة الموظف.'
      );
    }
  };

  

  const handleEditEmployee = (employee: Employee) => {
    if (employee.EmID === 1 && user?.EmID !== 1) {
      toast.error('لا يمكن تعديل بيانات الموظف بمعرف 1.');
      return;
    }
    setSelectedEmployee(employee);
    setOriginalPassword(employee.password);
    setOriginalRole(employee.role);
    setIsAddEmployeeMode(false);
    toast.info(`جاري تعديل الموظف: ${employee.Name}`);
  };
  
  const handleUpdateEmployee = async () => {
    // التحقق من صلاحية المستخدم الأساسية - يجب أن يكون على الأقل admin
    if (!user || !['admin', 'super_admin', 'owner'].includes(user.role)) {
      toast.error('غير مصرح لك بتنفيذ هذا الإجراء.');
      return;
    }
    
    if (!selectedEmployee) {
      toast.error('لم يتم اختيار موظف للتعديل.');
      return;
    }
    
    if (!selectedEmployee.Name.trim() || !selectedEmployee.branch.trim()) {
      toast.error('الرجاء ملء جميع الحقول المطلوبة (الاسم، الفرع).');
      return;
    }
    
    // التحقق من صلاحية تعديل الدور
    if (selectedEmployee.role !== originalRole) {
      // التحقق من أن المستخدم يمكنه تعديل هذا الدور
      if (user.role === 'admin' && ['super_admin', 'owner'].includes(selectedEmployee.role)) {
        toast.error('غير مصرح لك تعيين هذا الدور.');
        return;
      }
      
      if (user.role === 'super_admin' && selectedEmployee.role === 'owner') {
        toast.error('غير مصرح لك تعيين دور المالك.');
        return;
      }
    }
    
    if (isNaN(selectedEmployee.EmID) || selectedEmployee.EmID <= 0) {
      toast.error('معرف الموظف يجب أن يكون رقمًا صالحًا وأكبر من 0.');
      return;
    }
    
    // التحقق من صلاحيات تعديل الفرق
    if (user.role === 'admin') {
      // المدير يمكنه تعديل الفروع التي يملكها فقط
      const userBranches = user.branch ? user.branch.split(',').map(b => b.trim()) : [];
      const selectedBranches = selectedEmployee.branch.split(',').map(b => b.trim());
      
      // تحقق من أن جميع الفروع المحددة موجودة في فروع المستخدم
      const hasPermission = selectedBranches.every(branch => userBranches.includes(branch));
      
      if (!hasPermission) {
        toast.error('غير مصرح لك تعديل فروع لا تملك صلاحيتها.');
        return;
      }
    }
    // super_admin و owner يمكنهم تعديل أي فرع
    
    // التحقق من صلاحية تعديل كلمة المرور (فقط المالك يمكنه تعديل كلمات المرور)
    if (selectedEmployee.password !== originalPassword && user.role !== 'owner') {
      toast.error('غير مصرح لك تعديل كلمة المرور.');
      return;
    }
    
    try {
      const response = await fetch('/api/usermange', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedEmployee.id,
          fields: {
            Name: selectedEmployee.Name.trim(),
            EmID: selectedEmployee.EmID,
            password: selectedEmployee.password || originalPassword,
            role: selectedEmployee.role,
            branch: selectedEmployee.branch.trim(),
          },
          originalPassword: originalPassword,
          originalRole: originalRole,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.error.includes('already exists')) {
          toast.error('معرف الموظف هذا مستخدم بالفعل.');
        } else {
          throw new Error(errorData.error || 'فشل في تحديث الموظف.');
        }
        return;
      }
  
      const data = await response.json();
      
      // تحديث قائمة الموظفين المحلية
      setEmployees(prevEmployees => 
        prevEmployees.map(emp => 
          emp.id === selectedEmployee.id 
            ? { 
                ...selectedEmployee, 
                password: selectedEmployee.password || emp.password,
                // تأكد من تطابق الأنواع
                role: selectedEmployee.role as UserRole
              } 
            : emp
        )
      );
      
      // تحديث بيانات المستخدم الحالي إذا كان المستخدم الحالي هو من يتم تعديله
      if (user && user.id === selectedEmployee.id) {
        // إنشاء كائن جديد يتوافق مع واجهة User
        const updatedUser: User = {
          id: selectedEmployee.id,
          name: selectedEmployee.Name, // تحويل Name إلى name
          EmID: selectedEmployee.EmID,
          role: selectedEmployee.role as UserRole, // تحويل string إلى UserRole
          branch: selectedEmployee.branch
        };
        
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      setSelectedEmployee(null);
      settime(Date.now());
      setOriginalPassword('');
      setOriginalRole('');
      toast.success(data.message || 'تم تحديث الموظف بنجاح!');
    } catch (err: any) {
      console.error('Error updating employee:', err);
      toast.error(
        err.message.includes('Failed to fetch')
          ? 'فشل الاتصال بالخادم. تحقق من الشبكة وحاول مرة أخرى.'
          : err.message || 'حدث خطأ أثناء تحديث الموظف.'
      );
    }
  };
  
  

  const confirmDeleteEmployee = (employeeId: string) => {
    if (user?.id === employeeId) {
      toast.error('لا يمكنك حذف نفسك.');
      return;
    }

    const employeeToDelete = employees.find((emp) => emp.id === employeeId);
    if (employeeToDelete?.EmID === 1) {
      toast.error('لا يمكن حذف الموظف بمعرف 1.');
      return;
    }
    if (employeeToDelete?.role === 'admin' && !hasRole('owner')) {
      toast.error('فقط المالك يمكنه حذف المديرين.');
      return;
    }

    setEmployeeToDelete(employeeId);
    setPlateToDelete(null);
    setBranchToDelete(null);
    setIsDeleteConfirmModalOpen(true);
  };

  const handleDeleteEmployee = async () => {
    // التحقق من الصلاحية: يجب أن يكون على الأقل admin
    if (!isAtLeastRole('admin')) {
      toast.error('غير مصرح لك بحذف الموظفين. يجب أن تكون مديرًا أو أعلى.');
      return;
    }
  
    if (!employeeToDelete) {
      toast.error('لم يتم اختيار موظف للحذف.');
      return;
    }
  
    const employee = employees.find(emp => emp.id === employeeToDelete);
    if (!employee) {
      toast.error('الموظف غير موجود.');
      return;
    }
  
    // منع المستخدم من حذف نفسه
    if (user?.id === employeeToDelete) {
      toast.error('لا يمكنك حذف حسابك الخاص.');
      return;
    }
  
    // منع حذف الموظف رقم 1 (الحساب الرئيسي)
    if (employee.EmID === 1) {
      toast.error('لا يمكن حذف الحساب الرئيسي.');
      return;
    }
  
    // منع حذف super_admin أو owner إلا من قبل owner
    if (['super_admin', 'owner'].includes(employee.role) && !hasRole('owner')) {
      toast.error('فقط المالك يمكنه حذف super_admin أو owner.');
      return;
    }
  
    try {
      const response = await fetch('/api/usermange', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: employeeToDelete }),
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'فشل في حذف الموظف.');
      }
  
      const data = await response.json();
      setEmployees(employees.filter((emp) => emp.id !== employeeToDelete));
      closeDeleteConfirmModal();
      settime(Date.now());
      toast.success(data.message || 'تم حذف الموظف بنجاح!');
    } catch (err: any) {
      console.error('Error deleting employee:', err);
      toast.error(
        err.message.includes('Failed to fetch')
          ? 'فشل الاتصال بالخادم. تحقق من الشبكة وحاول مرة أخرى.'
          : err.message || 'حدث خطأ أثناء حذف الموظف.'
      );
    }
  };

  const confirmDeleteCar = (carId: string) => {
    setEmployeeToDelete(null);
    setPlateToDelete(null);
    setBranchToDelete(null);
    setIsDeleteConfirmModalOpen(true);
  };

  // --- دالة حذف الملف من DigitalOcean ---
const deleteFile = (fileKey: string): Promise<void> => {
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


// --- دالة حذف السجل المحسنة (الدخول + الخروج) ---
// --- دالة حذف السجل المبسطة (تتم العملية كاملة في الخادم) ---
const deleteContractRecord = async (entryId: number, exitId?: number) => {
  if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا السجل؟ سيتم حذف الصور والبيانات نهائياً.')) {
    return;
  }
  try {
    console.log(`بدء حذف السجل - Entry ID: ${entryId}, Exit ID: ${exitId || 'غير موجود'}`);
    
    // إرسال طلب الحذف إلى الخادم
    const response = await fetch('/api/history', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entryId, exitId: exitId || null }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // التحقق إذا كان الخطأ متعلقاً بحذف الصور
      if (data.error && data.error.includes('فشل في حذف الصورة')) {
        toast.error(`فشل في حذف الصور: ${data.error}`);
        return;
      }
      throw new Error(data.error || 'فشل في الحذف');
    }
    
    // تحديث واجهة المستخدم
    setExpiredContracts(prev => prev.filter(item => item.entry.id !== entryId));
    
    // عرض رسالة النجاح
    toast.success(data.message || 'تم حذف السجل وجميع الصور بنجاح.');
  } catch (error: any) {
    console.error('Error deleting contract:', error);
    toast.error(error.message || 'حدث خطأ أثناء الحذف');
  }
};

const handleBulkDeleteConfirmed = async () => {
  try {
    // تهيئة حالة التقدم
    const total = selectedContractIds.length;
    const details = selectedContractIds.map(contractNum => {
      const item = expiredContracts.find(i => i.entry.contract_number === contractNum);
      return {
        contractNumber: contractNum,
        entryId: item?.entry.id,
        exitId: item?.exit?.id,
        status: 'in-progress' as const,
        message: 'قيد المعالجة...',
      };
    });

    setDeleteProgress({
      current: 0,
      total,
      status: 'pending',
      message: 'جارٍ الحذف...',
      details,
    });
    setIsDeleteProgressModalOpen(true);

    let successCount = 0;
    let failureCount = 0;

    // معالجة الحذف سجلاً سجلاً
    for (let i = 0; i < details.length; i++) {
      const item = details[i];
      try {
        // تحديث التقدم
        setDeleteProgress(prev => prev ? {
          ...prev,
          current: i + 1,
          message: `حذف السجل ${i + 1} من ${total}...`,
          details: prev.details.map(d => d.contractNumber === item.contractNumber ? {
            ...d,
            status: 'in-progress',
            message: 'جاري حذف الصور والسجل...',
          } : d),
        } : null);

        // إرسال طلب الحذف
        const response = await fetch('/api/history', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entryId: item.entryId, exitId: item.exitId || null }),
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error || 'فشل في الحذف');

        // نجاح
        setDeleteProgress(prev => prev ? {
          ...prev,
          details: prev.details.map(d => d.contractNumber === item.contractNumber ? {
            ...d,
            status: 'success',
            message: 'تم الحذف بنجاح',
          } : d),
        } : null);

        successCount++;
      } catch (error) {
        setDeleteProgress(prev => prev ? {
          ...prev,
          details: prev.details.map(d => d.contractNumber === item.contractNumber ? {
            ...d,
            status: 'error',
            message: error instanceof Error ? error.message : 'فشل غير معروف',
          } : d),
        } : null);
        failureCount++;
      }

      // تأخير بسيط لتحسين تجربة المستخدم (اختياري)
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // انتهاء العملية
    setDeleteProgress(prev => prev ? {
      ...prev,
      status: 'success',
      message: `اكتمل الحذف: ${successCount} نجاح، ${failureCount} فشل`,
    } : null);

    // تحديث واجهة المستخدم بعد 1.5 ثانية
    setTimeout(() => {
      setExpiredContracts(prev =>
        prev.filter(item => !selectedContractIds.includes(item.entry.contract_number))
      );
      setSelectedContractIds([]);
      setSelectAll(false);
      setIsDeleteProgressModalOpen(false);
      setDeleteProgress(null);

      if (successCount > 0 && failureCount === 0) {
        toast.success(`تم حذف ${successCount} سجل بنجاح`);
      } else if (successCount > 0 && failureCount > 0) {
        toast.warning(`تم حذف ${successCount} سجل، فشل ${failureCount}`);
      } else {
        toast.error('فشل حذف جميع السجلات');
      }
    }, 1500);

  } catch (error: any) {
    console.error('Error in bulk delete:', error);
    toast.error('حدث خطأ أثناء الحذف');
    setIsDeleteProgressModalOpen(false);
    setDeleteProgress(null);
  }
};


 // دالة ترتيب الموظفين حسب الدور (ثابتة)
const sortedEmployees = useMemo(() => {
  return [...employees].sort((a, b) => {
    // دالة للحصول على قيمة الترتيب للدور
    const getRoleValue = (role: string): number => {
      switch (role) {
        case 'owner': return 4;
        case 'super_admin': return 3;
        case 'admin': return 2;
        case 'employee': return 1;
        default: return 0;
      }
    };
    
    // ترتيب حسب الدور
    const roleComparison = getRoleValue(b.role) - getRoleValue(a.role);
    if (roleComparison !== 0) {
      return roleComparison;
    }
    
    // إذا كان الدور نفسه، ترتيب حسب الاسم
    return a.Name.localeCompare(b.Name, 'ar');
  });
}, [employees]);

 

  if (!user) return null;

  return (
    <div dir="rtl" className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

      {/* ✅ هذا هو القسم المعدّل */}
      <Link href="/cheak-out">
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow duration-300 cursor-pointer">
          <div className="text-blue-600 mb-4">
            <FaCar className="inline-block text-4xl" />
            <FaArrowLeft className="inline-block text-2xl ml-2" />
          </div>
          <h2 className="text-xl font-medium text-gray-800 mb-2">تشييك خروج السيارة</h2>
          <p className="text-sm text-gray-600">تسجيل بيانات خروج السيارة مع الصور</p>
        </div>
      </Link>

          <Link href="/cheak-in">
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow duration-300">
              <div className="text-blue-600 mb-4">
                <FaCar className="inline-block text-4xl" />
                <FaArrowRight className="inline-block text-2xl ml-2" />
              </div>
              <h2 className="text-xl font-medium text-gray-800 mb-2">تشييك دخول السيارة</h2>
              <p className="text-sm text-gray-600">تسجيل بيانات دخول السيارة مع الصور</p>
            </div>
          </Link>

          <Link href="/history">
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow duration-300">
              <div className="text-blue-600 mb-4">
                <FaHistory className="inline-block text-4xl" />
              </div>
              <h2 className="text-xl font-medium text-gray-800 mb-2">السجل</h2>
              <p className="text-sm text-gray-600">عرض سجلات تشييك السيارات</p>
            </div>
          </Link>

<PermissionGuard requireAtLeastRole="admin">
  <div
    onClick={openBranchModal}
    className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow duration-300 cursor-pointer"
  >
    <div className="text-blue-600 mb-4">
      <FaBuilding className="inline-block text-4xl" />
    </div>
    <h2 className="text-xl font-medium text-gray-800 mb-2">إدارة الفروع</h2>
    <p className="text-sm text-gray-600">إضافة، تعديل، وحذف الفروع</p>
  </div>
</PermissionGuard>

<PermissionGuard requireAtLeastRole="admin">
  <div
    onClick={openEmployeeModal}
    className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow duration-300 cursor-pointer"
  >
    <div className="text-blue-600 mb-4">
      <FaUsers className="inline-block text-4xl" />
    </div>
    <h2 className="text-xl font-medium text-gray-800 mb-2">إدارة الموظفين</h2>
    <p className="text-sm text-gray-600">عرض وتعديل بيانات الموظفين</p>
  </div>
</PermissionGuard>
<PermissionGuard requireAtLeastRole="admin">
  <div
    onClick={() => router.push("/car_managment")}
    className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow duration-300 cursor-pointer"
  >
    <div className="text-blue-600 mb-4">
      <FaCarSide className="inline-block text-4xl" />
    </div>
    <h2 className="text-xl font-medium text-gray-800 mb-2">إدارة السيارات</h2>
    <p className="text-sm text-gray-600">إضافة وحذف السيارات</p>
  </div>
</PermissionGuard>

<PermissionGuard requireAtLeastRole="super_admin">
  <div
    onClick={async () => {
      setIsExpiredContractsModalOpen(true);
      await fetchExpiredContracts(); // ✅ الاستدعاء يحدث هنا
    }}
    className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow duration-300 cursor-pointer"
  >
    <div className="text-red-600 mb-4">
    <svg className="text-red-600" fill="currentColor" viewBox="0 0 20 20" width="50" height="50">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
    </div>
    <h2 className="text-xl font-medium text-gray-800 mb-2">العقود المنتهية</h2>
    <p className="text-sm text-gray-600">عرض العقود التي مضى على دخولها أكثر من 3 أشهر</p>
  </div>
</PermissionGuard>
        </div>
      </div>

      {isBranchModalOpen && (
  <div 
    className="fixed inset-0 flex items-center justify-center z-50"
    style={{
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)', // دعم Safari
      backgroundColor: 'rgba(0, 0, 0, 0.3)', // خلفية شبه شفافة لفصل النموذج بصريًا
    }}
  >
    <div className="bg-white rounded-2xl shadow-xl p-6 w-[550px] h-[550px] flex flex-col relative border border-gray-100">
      {/* رأس المودال */}
      <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 p-2 rounded-lg mr-3">
            <FaBuilding className="text-blue-600 text-xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">إدارة الفروع</h2>
        </div>
        <button
          onClick={closeBranchModal}
          className="text-gray-400 hover:text-red-500 focus:outline-none transition-colors duration-200 p-2 rounded-full hover:bg-gray-100"
        >
          <FaTimes className="text-xl" />
        </button>
      </div>
      
      {/* المحتوى كله محمي: فقط من دوره admin أو أعلى يراه */}
      <PermissionGuard requireAtLeastRole="admin">
        {selectedBranch ? (
          <div className="flex-1 overflow-y-auto">
            <div className="flex items-center mb-6">
              <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                <FaEdit className="text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">تعديل فرع</h3>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">اسم الفرع</label>
              <div className="relative mx-2">
  <input
    type="text"
    value={newBranchName}
    onChange={(e) => setNewBranchName(e.target.value)}
    placeholder="مثال: فرع الرياض"
    className="w-full px-4 py-4 sm:py-5 
               border border-gray-300 rounded-lg 
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
               transition-all duration-200
               text-base sm:text-lg
               leading-normal  /* أو leading-6 */
               placeholder:italic
               box-border
               "
    style={{ lineHeight: '1.7' }} // <-- تحكم دقيق في ارتفاع السطر
  />
  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
    <FaBuilding className="text-gray-400" />
  </div>
</div>
            </div>
            
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setSelectedBranch(null)}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <FaTimes className="ml-2" />
                إلغاء
              </button>
              <button
                onClick={handleUpdateBranch}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
              >
                <FaSave className="ml-2" />
                تحديث
              </button>
            </div>
          </div>
        ) : isAddBranchMode ? (
          <div className="flex-1 overflow-y-auto">
            <div className="flex items-center mb-6 gap-2">
              <div className="bg-green-100 p-2 rounded-lg mr-3">
                <FaPlus className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">إضافة فرع جديد</h3>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">اسم الفرع</label>
              <div className="relative mx-2">
               <input
  type="text"
  value={newBranchName}
  onChange={(e) => setNewBranchName(e.target.value)}
  placeholder="مثال: فرع الرياض"
  className="w-full px-4 py-4 sm:py-5 
             border border-gray-300 rounded-lg 
             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
             transition-all duration-200
             text-base sm:text-lg
             leading-normal
             placeholder:italic
             box-border"
  style={{ lineHeight: '1.7' }}
/>
<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
  <FaBuilding className="text-gray-400" />
</div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setIsAddBranchMode(false)}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <FaTimes className="ml-2" />
                إلغاء
              </button>
              <button
                onClick={handleAddBranch}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md"
              >
                <FaPlus className="ml-2" />
                إضافة
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <FaList className="text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">قائمة الفروع</h3>
              </div>
              <button
                onClick={() => setIsAddBranchMode(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
              >
                <FaPlus className="ml-2" />
                إضافة فرع جديد
              </button>
            </div>
            
            <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-200 overflow-hidden flex flex-col min-h-0">
              {branches.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 py-10">
                  <FaBuilding className="text-4xl mb-3" />
                  <p className="text-lg">لا توجد فروع متاحة</p>
                  <p className="text-sm mt-1">انقر على "إضافة فرع جديد" لإنشاء فرع جديد</p>
                </div>
              ) : (
                <div className="overflow-auto flex-1">
                  <table className="min-w-full bg-white">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700 border-b whitespace-nowrap">اسم الفرع</th>
                        <th className="py-3 px-4 text-center text-sm font-semibold text-gray-700 border-b whitespace-nowrap">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {branches.map((branch) => (
                        <tr key={branch.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="py-3 px-4 text-right text-gray-800 font-medium max-w-xs truncate" title={branch.Name}>
                            {branch.Name}
                          </td>
                          <td className="py-3 px-4 text-center">
                              <div className="flex justify-center gap-4">

                              <button
                                onClick={() => handleEditBranch(branch)}
                                className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors duration-200"
                                title="تعديل"
                              >
                                <FaEdit />
                              </button>
                              <PermissionGuard permission="canDeleteBranches">
                                <button
                                  onClick={() => confirmDeleteBranch(branch.id)}
                                  className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors duration-200"
                                  title="حذف"
                                >
                                  <FaTrash />
                                </button>
                              </PermissionGuard>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </PermissionGuard>
      
      {/* رسالة بديلة لمن ليس لديه صلاحية */}
      <PermissionGuard requireAtLeastRole="admin" fallback={
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="bg-red-100 p-4 rounded-full mb-4">
            <FaTimes className="text-red-500 text-2xl" />
          </div>
          <p className="text-red-600 text-lg font-medium">ليس لديك صلاحية للوصول إلى إدارة الفروع.</p>
          <p className="text-gray-500 mt-2">يرجى التواصل مع المدير للحصول على الصلاحيات اللازمة</p>
        </div>
      }>
        {/* لا يعرض شيئًا */}
      </PermissionGuard>
    </div>
  </div>
)}

{/* Employee Management Modal */}
{isEmployeeModalOpen && (
  <div 
    className="fixed inset-0 flex items-center justify-center z-50"
    style={{
      // تأثير البلور على الخلفية فقط
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)', // دعم Safari
      backgroundColor: 'rgba(0, 0, 0, 0.3)', // خلفية شبه شفافة
    }}
  >
    {/* المودال نفسه (بدون أي blur داخلي) */}
    <div className="bg-white rounded-2xl shadow-xl p-6 w-full sm:w-[90%] md:w-[80%] lg:w-[70%] max-w-6xl min-h-[500px] max-h-[90vh] flex flex-col relative border border-gray-100">
      {/* رأس المودال */}
      <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 p-2 rounded-lg mr-3">
            <FaUsers className="text-blue-600 text-xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">إدارة الموظفين</h2>
        </div>
        <button
          onClick={closeEmployeeModal}
          className="text-gray-400 hover:text-red-500 focus:outline-none transition-colors duration-200 p-2 rounded-full hover:bg-gray-100"
        >
          <FaTimes className="text-xl" />
        </button>
      </div>
      
      {/* المحتوى كله محمي: فقط من دوره admin أو أعلى يراه */}
      <PermissionGuard requireAtLeastRole="admin">
        {selectedEmployee ? (
          <div className="flex-1 overflow-y-auto">
            <div className="flex items-center mb-6 gap-2">
              <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                <FaEdit className="text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">تعديل موظف</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الاسم</label>
                <div className="relative mx-2">
                  <input
                    type="text"
                    value={selectedEmployee.Name}
                    onChange={(e) =>
                      setSelectedEmployee({ ...selectedEmployee, Name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                </div>
              </div>
              
              <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">معرف الموظف</label>
  <div className="relative mx-2">
    <input
      type="number"
      value={selectedEmployee.EmID}
      onChange={(e) =>
        setSelectedEmployee({ ...selectedEmployee, EmID: parseInt(e.target.value) })
      }
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200
                 [&::-webkit-outer-spin-button]:appearance-none
                 [&::-webkit-inner-spin-button]:appearance-none
                 [&::-moz-spin-button]:appearance-none
                 [&::-ms-reveal]:appearance-none
                 [&::-ms-clear]:appearance-none"
      style={{ MozAppearance: 'textfield' }} // للتأكد من إخفاء الأسهم في Firefox
    />
    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
      <FaIdCard className="text-gray-400" />
    </div>
  </div>
</div>
              
              {/* فقط owner يرى ويعدل كلمة المرور */}
              <PermissionGuard role="owner">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور</label>
                  <div className="relative mx-2">
                    <input
                      type="text"
                      value={selectedEmployee.password || ''}
                      onChange={(e) =>
                        setSelectedEmployee({ ...selectedEmployee, password: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                  </div>
                </div>
              </PermissionGuard>
              
              <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">الدور</label>
  <div className="relative mx-2">
    <select
      value={selectedEmployee.role}
      onChange={(e) => {
        const newRole = e.target.value as UserRole;
        if (
          (newRole === 'super_admin' || newRole === 'owner') &&
          !hasRole('owner')
        ) {
          toast.error('فقط المالك يمكنه تعيين super_admin أو owner');
          return;
        }
        setSelectedEmployee({ ...selectedEmployee, role: newRole });
      }}
      className="w-full px-4 py-4 sm:py-5 border border-gray-300 rounded-lg 
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                 transition-all duration-200
                 text-base sm:text-lg
                 leading-normal
                 appearance-none
                 bg-white"
      style={{ lineHeight: '1.7' }}
    >
      <option value="employee">موظف</option>
      <option value="admin">مدير</option>
      {isAtLeastRole('owner') && (
        <option value="super_admin">سوبر مدير</option>
      )}
      {hasRole('owner') && (
        <option value="owner">مالك</option>
      )}
    </select>

    {/* الأيقونات على اليسار */}
    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none space-x-2 space-x-reverse">
      {/* أيقونة السهم */}
      <FaChevronDown className="text-gray-400 w-5 h-5" />
      {/* أيقونة الدور */}
      <FaUserTag className="text-gray-400" />
    </div>
  </div>
</div>
              
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">الفروع</label>
                <Select
                  isMulti
                  value={selectedEmployee.branch
                    .split(',')
                    .filter((b) => b.trim())
                    .map((branch) => ({ value: branch, label: branch }))}
                  onChange={(selectedOptions) => {
                    const selectedBranches = selectedOptions
                      ? selectedOptions.map((option) => option.value).join(',')
                      : '';
                    setSelectedEmployee({ ...selectedEmployee, branch: selectedBranches });
                  }}
                  options={branches.map((branch) => ({
                    value: branch.Name,
                    label: branch.Name,
                  }))}
                  placeholder="اختر الفروع..."
                  noOptionsMessage={() => "لا توجد فروع متاحة"}
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: '#d1d5db',
                      borderRadius: '0.5rem',
                      padding: '0.5rem',
                      '&:hover': { borderColor: '#3b82f6' },
                      boxShadow: 'none',
                    }),
                    menu: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <FaTimes className="ml-2" />
                إلغاء
              </button>
              <button
                onClick={handleUpdateEmployee}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
              >
                <FaSave className="ml-2" />
                تحديث
              </button>
            </div>
          </div>
        ) : isAddEmployeeMode ? (
          <div className="flex-1 overflow-y-auto">
            <div className="flex items-center mb-6 gap-2">
              <div className="bg-green-100 p-2 rounded-lg mr-3">
                <FaPlus className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">إضافة موظف جديد</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الاسم</label>
                <div className="relative">
                  <input
                    type="text"
                    value={newEmployee.Name}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, Name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">معرف الموظف</label>
                <div className="relative">
                  <input
                    type="number"
                    value={newEmployee.EmID}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, EmID: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaIdCard className="text-gray-400" />
                  </div>
                </div>
              </div>
              
              {/* فقط owner يرى ويُدخل كلمة المرور عند الإضافة */}
           
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={newEmployee.password || ''}
                      onChange={(e) =>
                        setNewEmployee({ ...newEmployee, password: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                  </div>
                </div>
              
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الدور</label>
                <div className="relative">
                  <select
                    value={newEmployee.role}
                    onChange={(e) => {
                      const newRole = e.target.value as UserRole;
                      if (
                        (newRole === 'super_admin' || newRole === 'owner') &&
                        !hasRole('owner')
                      ) {
                        toast.error('فقط المالك يمكنه إنشاء super_admin أو owner');
                        return;
                      }
                      setNewEmployee({ ...newEmployee, role: newRole });
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none"
                  >
                    <option value="employee">موظف</option>
                    <option value="admin">مدير</option>
                    {isAtLeastRole('owner') && (
                      <option value="super_admin">سوبر مدير</option>
                    )}
                    {hasRole('owner') && (
                      <option value="owner">مالك</option>
                    )}
                  </select>
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaUserTag className="text-gray-400" />
                  </div>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <FaChevronDown className="text-gray-400" />
                  </div>
                </div>
              </div>
              
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">الفروع</label>
                <Select
                  isMulti
                  value={
                    newEmployee.branch
                      ? newEmployee.branch
                          .split(',')
                          .filter((b) => b.trim())
                          .map((branch) => ({ value: branch, label: branch }))
                      : []
                  }
                  onChange={(selectedOptions) => {
                    const selectedBranches = selectedOptions
                      ? selectedOptions.map((option) => option.value).join(',')
                      : '';
                    setNewEmployee({ ...newEmployee, branch: selectedBranches });
                  }}
                  options={branches.map((branch) => ({
                    value: branch.Name,
                    label: branch.Name,
                  }))}
                  placeholder="اختر الفروع..."
                  noOptionsMessage={() => "لا توجد فروع متاحة"}
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: '#d1d5db',
                      borderRadius: '0.5rem',
                      padding: '0.5rem',
                      '&:hover': { borderColor: '#3b82f6' },
                      boxShadow: 'none',
                    }),
                    menu: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setIsAddEmployeeMode(false)}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <FaTimes className="ml-2" />
                إلغاء
              </button>
              <button
                onClick={handleAddEmployee}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md"
              >
                <FaPlus className="ml-2" />
                إضافة
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <FaList className="text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">قائمة الموظفين</h3>
              </div>
              <button
                onClick={() => setIsAddEmployeeMode(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
              >
                <FaPlus className="ml-2" />
                إضافة موظف جديد
              </button>
            </div>
            
            <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-200 overflow-hidden flex flex-col min-h-0">
              {employees.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 py-10">
                  <FaUsers className="text-4xl mb-3" />
                  <p className="text-lg">لا توجد موظفين متاحين</p>
                  <p className="text-sm mt-1">انقر على "إضافة موظف جديد" لإنشاء موظف جديد</p>
                </div>
              ) : (
                <div className="overflow-auto flex-1">
                  <table className="min-w-full bg-white">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700 border-b whitespace-nowrap">الاسم</th>
                        <th className="py-3 px-4 text-center text-sm font-semibold text-gray-700 border-b whitespace-nowrap">المعرف</th>
                        <th className="py-3 px-4 text-center text-sm font-semibold text-gray-700 border-b whitespace-nowrap">الدور</th>
                        <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700 border-b whitespace-nowrap">الفرع</th>
                        <th className="py-3 px-4 text-center text-sm font-semibold text-gray-700 border-b whitespace-nowrap">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {sortedEmployees.map((employee) => (
                        <tr key={employee.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="py-3 px-4 text-right text-gray-800 font-medium max-w-xs truncate" title={employee.Name}>
                            {employee.Name}
                          </td>
                          <td className="py-3 px-4 text-center text-gray-800 font-medium">
                            {employee.EmID}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              employee.role === 'owner' 
                                ? 'bg-purple-100 text-purple-800' 
                                : employee.role === 'super_admin' 
                                  ? 'bg-indigo-100 text-indigo-800' 
                                  : employee.role === 'admin' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-green-100 text-green-800'
                            }`}>
                              {employee.role === 'admin' ? 'مدير' : 
                               employee.role === 'super_admin' ? 'سوبر مدير' : 
                               employee.role === 'owner' ? 'مالك' : 'موظف'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-gray-800 font-medium max-w-xs" title={employee.branch}>
                            <div className="overflow-hidden text-ellipsis line-clamp-2 pb-2" style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical' }}>
                              {employee.branch}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex justify-center space-x-2 space-x-reverse gap-4">
                              <button
                                onClick={() => handleEditEmployee(employee)}
                                className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors duration-200"
                                title="تعديل"
                              >
                                <FaEdit />
                              </button>
                              <PermissionGuard role="owner">
                                <button
                                  onClick={() => confirmDeleteEmployee(employee.id)}
                                  className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors duration-200"
                                  title="حذف"
                                >
                                  <FaTrash />
                                </button>
                              </PermissionGuard>
                              {/* ✅ زر حذف التوكن - فقط للـ owner */}
    <PermissionGuard role="owner">
      <button
        onClick={async (e) => {
          e.stopPropagation();
          if (!window.confirm(`هل أنت متأكد من حذف توكن ${employee.Name}؟`)) return;

          try {
            const response = await fetch('/api/logout', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ targetUserId: employee.id }),
            });

            const data = await response.json();
            if (response.ok) {
              toast.success(`تم حذف توكن ${employee.Name}`);
            } else {
              toast.error(data.error || 'فشل في حذف التوكن');
            }
          } catch (err) {
            console.error('Error deleting token:', err);
            toast.error('حدث خطأ في الاتصال');
          }
        }}
        className="p-2 bg-yellow-100 text-yellow-600 rounded-full hover:bg-yellow-200 transition-colors duration-200"
        title="حذف التوكن"
      >
        <FaSignOutAlt />
      </button>
    </PermissionGuard>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </PermissionGuard>
      
      {/* رسالة بديلة لمن ليس لديه صلاحية */}
      <PermissionGuard requireAtLeastRole="admin" fallback={
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="bg-red-100 p-4 rounded-full mb-4">
            <FaTimes className="text-red-500 text-2xl" />
          </div>
          <p className="text-red-600 text-lg font-medium">ليس لديك صلاحية للوصول إلى إدارة الموظفين.</p>
          <p className="text-gray-500 mt-2">يرجى التواصل مع المدير للحصول على الصلاحيات اللازمة</p>
        </div>
      }>
        {/* لا يعرض شيئًا */}
      </PermissionGuard>
    </div>
  </div>
)}

{/* نموذج العقود المنتهية */}
{isExpiredContractsModalOpen && (
  <div 
    className="fixed inset-0 flex items-center justify-center z-50"
    style={{
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
    }}
  >
    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-6xl max-h-[90vh] flex flex-col border border-gray-100">
      {/* رأس النموذج */}
      <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="bg-red-100 p-2 rounded-lg">
            <svg className="text-red-600" fill="currentColor" viewBox="0 0 20 20" width="20" height="20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">العقود المنتهية (أقدم من 3 أشهر)</h2>
        </div>
        <button
          onClick={() => setIsExpiredContractsModalOpen(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FaTimes className="text-xl" />
        </button>
      </div>

      {/* جدول القائمة */}
      <div className="flex-1 overflow-y-auto">
        {loadingExpired ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500 mb-3"></div>
            <p className="text-sm">جاري جلب العقود...</p>
          </div>
        ) : expiredContracts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <svg className="w-12 h-12 mb-3 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <p className="text-sm">لا توجد عقود أقدم من 3 أشهر</p>
          </div>
        ) : (
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700 border-b">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSelectAll(checked);
                      if (checked) {
                        // تحديد جميع العقود
                        setSelectedContractIds(
                          expiredContracts.map(item => item.entry.contract_number)
                        );
                      } else {
                        // إلغاء التحديد
                        setSelectedContractIds([]);
                      }
                    }}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                </th>
                <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700 border-b">رقم العقد</th>
                <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700 border-b">اسم السيارة</th>
                <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700 border-b">الفرع</th>
                <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700 border-b">تاريخ الدخول</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
            {expiredContracts
  .filter(item => item && item.entry)
  .map((item) => {
    const contractNum = item.entry.contract_number;
    const isExpanded = expandedContract === contractNum;
    const isChecked = selectedContractIds.includes(contractNum);

    return (
      <React.Fragment key={`contract-${item.entry.id}`}>
        {/* سطر العقد (فقط دخول) */}
        <tr
          className={`hover:bg-gray-50 cursor-pointer ${isExpanded ? 'bg-blue-50' : ''}`}
          onClick={() => setExpandedContract(isExpanded ? null : contractNum)}
        >
          <td className="py-3 px-4">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => {
                e.stopPropagation();
                const checked = e.target.checked;
                setSelectedContractIds(prev =>
                  checked
                    ? [...prev, contractNum]
                    : prev.filter(id => id !== contractNum)
                );
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
          </td>
          <td className="py-3 px-4 text-sm text-gray-800 font-medium">{contractNum}</td>
          <td className="py-3 px-4 text-sm text-gray-800">{item.entry.car_model}</td>
          <td className="py-3 px-4 text-sm text-gray-600">{item.entry.branch_name}</td>
          <td className="py-3 px-4 text-sm text-gray-600">
            {new Date(item.entry.created_at).toLocaleDateString('ar-SA', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              calendar: 'gregory',
            })}
          </td>
        </tr>

        {/* سطر التفاصيل (مُوسّع عند النقر) */}
        {isExpanded && (
          <tr className="bg-gray-50">
            <td colSpan={5} className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* تفاصيل الدخول */}
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <h3 className="font-semibold text-gray-800 mb-3">بيانات الدخول</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">العميل:</span> {item.entry.client_name}</p>
                    <p><span className="font-medium">اللوحة:</span> {item.entry.plate_number}</p>
                    <p><span className="font-medium">الموظف:</span> {item.entry.employee_name}</p>
                    <p><span className="font-medium">الفرع:</span> {item.entry.branch_name}</p>
                    <p><span className="font-medium">التاريخ: </span> 
                     {new Date(item.entry.created_at).toLocaleDateString('ar-SA', {
                       year: 'numeric',
                       month: '2-digit',
                       day: '2-digit',
                       calendar: 'gregory',
                                        })}
                                                       </p> 
                  </div>
                  {/* عرض صور الدخول */}
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700">الصور</h4>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {Object.entries(item.entry)
                        .filter(([key, value]) => 
                          typeof value === 'string' && 
                          value.startsWith('http') && 
                          !key.includes('signature')
                        )
                        .slice(0, 4)
                        .map(([key, value], idx) => (
                          <img
                            key={idx}
                            src={value as string}
                            alt={key}
                            className="w-full h-20 object-cover rounded border"
                          />
                        ))}
                    </div>
                  </div>
                </div>

                {/* تفاصيل الخروج (إذا وُجد) */}
                {item.exit ? (
                  <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <h3 className="font-semibold text-gray-800 mb-3">بيانات الخروج</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">العميل:</span> {item.exit.client_name}</p>
                      <p><span className="font-medium">اللوحة:</span> {item.exit.plate_number}</p>
                      <p><span className="font-medium">الموظف:</span> {item.exit.employee_name}</p>
                      <p><span className="font-medium">الفرع:</span> {item.exit.branch_name}</p>
      <p><span className="font-medium">التاريخ: </span> 
        {new Date(item.exit.created_at).toLocaleDateString('ar-SA', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          calendar: 'gregory',
        })}
      </p>                         
                    </div>
                    {/* عرض صور الخروج */}
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700">الصور</h4>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {Object.entries(item.exit)
                          .filter(([key, value]) => 
                            typeof value === 'string' && 
                            value.startsWith('http') && 
                            !key.includes('signature')
                          )
                          .slice(0, 4)
                          .map(([key, value], idx) => (
                            <img
                              key={idx}
                              src={value as string}
                              alt={key}
                              className="w-full h-20 object-cover rounded border"
                            />
                          ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">لم يتم تسجيل خروج لهذا العقد بعد.</p>
                  </div>
                )}
              </div>
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  })}
            </tbody>
          </table>
        )}
      </div>

      {/* أزرار التحكم */}
<div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
  {/* عرض عدد السجلات المحددة */}
  <div className="flex items-center text-sm text-gray-600">
    {selectedContractIds.length === 0 ? (
      <span>لا يوجد سجلات محددة</span>
    ) : (
      <span>
        تم تحديد <span className="font-semibold">{selectedContractIds.length}</span> سجل
      </span>
    )}
  </div>

  <div className="flex gap-3">
    {/* زر الحذف */}
   

{/* زر الحذف المحدث */}
<button
  onClick={() => setIsDeleteConfirmModalOpen(true)}
  disabled={selectedContractIds.length === 0}
  className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-all duration-200 flex-1
    ${selectedContractIds.length === 0 
      ? 'bg-gray-400 cursor-not-allowed' 
      : 'bg-red-600 hover:bg-red-700 active:bg-red-800'
    }
  `}
>
  {selectedContractIds.length === 0 ? 'لا يوجد تحديد' : `حذف ${selectedContractIds.length}`}
</button>

    {/* زر الإغلاق */}
    <button
      onClick={() => setIsExpiredContractsModalOpen(false)}
      className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium flex-1"
    >
      إغلاق
    </button>
  </div>
</div>
    </div>
  </div>
)}


      {/* Delete Confirmation Modal */}
      {isDeleteConfirmModalOpen && (employeeToDelete || branchToDelete || plateToDelete) && (
        <div 
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)', // دعم Safari
          backgroundColor: 'rgba(0, 0, 0, 0.2)', // خلفية شبه شفافة مع بلور
        }}
      >
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">تأكيد الحذف</h2>
            <p className="text-sm text-gray-600 mb-4">
              هل أنت متأكد من أنك تريد حذف{' '}
              {employeeToDelete
                ? 'هذا الموظف'
                  : plateToDelete
                    ? 'هذه اللوحة'
                    : 'هذا الفرع'}؟
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={closeDeleteConfirmModal}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  if (employeeToDelete) handleDeleteEmployee();
                  else if (branchToDelete) handleDeleteBranch();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* نموذج تأكيد الحذف الجديد */}
      {isDeleteConfirmModalOpen && selectedContractIds.length > 0 && (
 <div
 className="fixed inset-0 flex items-center justify-center z-50 p-4"
 style={{
   backdropFilter: 'blur(8px)',
   WebkitBackdropFilter: 'blur(8px)', // دعم Safari
   backgroundColor: 'rgba(0, 0, 0, 0.2)',
 }}
 onClick={() => setIsDeleteConfirmModalOpen(false)}
>
 <div
   className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-auto border border-gray-200 overflow-hidden"
   onClick={(e) => e.stopPropagation()}
 >
  
     {/* رأس النموذج */}
<div className="p-6 text-center">
  {/* الدائرة البيضاء مع أيقونة سلة المهملات */}
  <div className="inline-flex items-center justify-center w-16 h-16 bg-white border-4 border-red-500 rounded-full mb-4 shadow-lg">
    <FaTrash className="text-red-600 text-2xl" />
  </div>
  <h2 className="text-2xl font-bold text-gray-800 mb-1">تأكيد الحذف</h2>
  <p className="text-gray-600 text-sm">سيتم حذف جميع الصور والبيانات المرتبطة</p>
</div>

      {/* المحتوى */}
      <div className="p-6">
        <div className="flex items-start gap-3 mb-6">
          <div className="mt-1">
            <input
              type="checkbox"
              id="confirmDelete"
              checked={confirmDeleteChecked}
              onChange={(e) => setConfirmDeleteChecked(e.target.checked)}
              className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
          </div>
          <label htmlFor="confirmDelete" className="text-gray-700 text-sm leading-relaxed">
            أنا أعلم وأوافق على حذف{' '}
            <span className="font-semibold text-red-600">{selectedContractIds.length}</span>{' '}
            سجلًا نهائيًا. سيتم حذف جميع الصور المرتبطة بهذه السجلات من الخادم.
          </label>
        </div>

        {/* تحذير */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 text-xs leading-relaxed">
            ⚠️ بمجرد الحذف، لن يمكن استعادة البيانات. تأكد من أنك لا تحتاج إلى هذه السجلات.
          </p>
        </div>

        {/* أزرار التحكم */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              setIsDeleteConfirmModalOpen(false);
              setConfirmDeleteChecked(false);
            }}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-medium"
          >
            إلغاء
          </button>
          <button
            onClick={async () => {
              if (confirmDeleteChecked) {
                await handleBulkDeleteConfirmed();
                setIsDeleteConfirmModalOpen(false);
                setConfirmDeleteChecked(false);
              }
            }}
            disabled={!confirmDeleteChecked}
            className={`flex-1 px-4 py-2 text-white font-medium rounded-lg transition-all duration-200 ${
              confirmDeleteChecked
                ? 'bg-red-600 hover:bg-red-700 active:bg-red-800'
                : 'bg-red-400 cursor-not-allowed'
            }`}
          >
            {confirmDeleteChecked ? 'حذف السجلات' : 'يجب التأكيد'}
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* نموذج تتبع تقدم الحذف */}
{isDeleteProgressModalOpen && deleteProgress && (
  <div 
    className="fixed inset-0 flex items-center justify-center z-50 p-4"
    style={{
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
    }}
  >
    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-auto border border-gray-200 overflow-hidden">
      {/* رأس النموذج */}
      <div className="bg-gradient-to-br from-red-500 to-red-800 p-6 text-center text-white">
        <h2 className="text-xl font-bold">حذف السجلات</h2>
        <p className="text-blue-100 text-sm">{deleteProgress.message}</p>
      </div>

      {/* المحتوى */}
      <div className="p-6">
        {/* شريط التقدم */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>التقدم</span>
            <span>{deleteProgress.current} من {deleteProgress.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(deleteProgress.current / deleteProgress.total) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* تفاصيل العمليات */}
        <div className="max-h-60 overflow-y-auto space-y-3">
          {deleteProgress.details.map((detail, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                detail.status === 'in-progress' ? 'bg-yellow-500' :
                detail.status === 'success' ? 'bg-green-500' :
                'bg-red-500'
              }`}>
                {detail.status === 'in-progress' ? '🔄' :
                 detail.status === 'success' ? '✅' : '❌'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  العقد #{detail.contractNumber}
                </p>
                <p className="text-xs text-gray-500">{detail.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}


