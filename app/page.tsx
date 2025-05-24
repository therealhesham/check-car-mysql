

// 'use client';

// import Link from 'next/link';
// import Navbar from '@/public/components/navbar';
// import { FaCar, FaHistory, FaArrowRight, FaArrowLeft, FaUsers, FaCarSide, FaTag, FaBuilding, FaTimes } from 'react-icons/fa';
// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// interface User {
//   id: string;
//   name: string;
//   EmID: number;
//   role: string;
//   branch: string;
// }

// interface Employee {
//   id: string;
//   Name: string;
//   EmID: number;
//   password: string;
//   role: string;
//   branch: string;
// }

// interface Car {
//   id: string;
//   Name: string;
// }

// interface Plate {
//   id: string;
//   Name: string;
// }

// interface Branch {
//   id: string;
//   Name: string;
// }

// async function fetchBranches(): Promise<Branch[]> {
//   try {
//     const response = await fetch('/api/addbranch', {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });
//     const data = await response.json();
//     if (data.success) {
//       return data.results.map((record: any) => ({
//         id: record.id,
//         Name: record.fields.Name,
//       }));
//     }
//     return [];
//   } catch (error) {
//     console.error('Error fetching branches:', error);
//     return [];
//   }
// }

// async function fetchPlates(): Promise<Plate[]> {
//   try {
//     const response = await fetch('/api/addlicense', {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });
//     const data = await response.json();
//     if (data.success) {
//       return data.results.map((record: any) => ({
//         id: record.id,
//         Name: record.fields.Name,
//       }));
//     }
//     return [];
//   } catch (error) {
//     console.error('Error fetching plates:', error);
//     return [];
//   }
// }

// async function fetchCars(): Promise<Car[]> {
//   try {
//     const response = await fetch('/api/addcars', {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });
//     const data = await response.json();
//     if (data.success) {
//       return data.results.map((record: any) => ({
//         id: record.id,
//         Name: record.fields.Name,
//       }));
//     }
//     return [];
//   } catch (error) {
//     console.error('Error fetching cars:', error);
//     return [];
//   }
// }

// async function fetchEmployees(): Promise<Employee[]> {
//   try {
//     const response = await fetch('/api/usermange', {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       throw new Error(errorData.error || 'فشل في جلب الموظفين.');
//     }

//     const data = await response.json();
//     if (data.success) {
//       return data.results.map((record: any) => ({
//         id: record.id,
//         Name: record.Name,
//         EmID: record.EmID,
//         password: record.password,
//         role: record.role,
//         branch: record.branch,
//       }));
//     }
//     return [];
//   } catch (error) {
//     console.error('Error fetching employees:', error);
//     return [];
//   }
// }

// export default function HomePage() {
//   const [isPlateModalOpen, setIsPlateModalOpen] = useState(false);
//   const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
//   const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
//   const [isCarModalOpen, setIsCarModalOpen] = useState(false);
//   const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
//   const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
//   const [carToDelete, setCarToDelete] = useState<string | null>(null);
//   const [plateToDelete, setPlateToDelete] = useState<string | null>(null);
//   const [branchToDelete, setBranchToDelete] = useState<string | null>(null);
//   const [isAddEmployeeMode, setIsAddEmployeeMode] = useState(false);
//   const [isAddCarMode, setIsAddCarMode] = useState(false);
//   const [isAddPlateMode, setIsAddPlateMode] = useState(false);
//   const [isAddBranchMode, setIsAddBranchMode] = useState(false);
//   const [newCarCompany, setNewCarCompany] = useState('');
//   const [newCarModel, setNewCarModel] = useState('');
//   const [newPlateLetters, setNewPlateLetters] = useState('');
//   const [newPlateNumbers, setNewPlateNumbers] = useState('');
//   const [newBranchName, setNewBranchName] = useState('');
//   const [newEmployee, setNewEmployee] = useState<Employee>({
//     id: '',
//     Name: '',
//     EmID: 0,
//     password: '',
//     role: 'employee',
//     branch: '',
//   });
//   const [plates, setPlates] = useState<Plate[]>([]);
//   const [branches, setBranches] = useState<Branch[]>([]);
//   const [cars, setCars] = useState<Car[]>([]);
//   const [employees, setEmployees] = useState<Employee[]>([]);
//   const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
//   const [selectedPlate, setSelectedPlate] = useState<Plate | null>(null);
//   const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [user, setUser] = useState<User | null>(null);
//   const router = useRouter();

//   useEffect(() => {
//     const storedUser = localStorage.getItem('user');
//     if (storedUser) {
//       setUser(JSON.parse(storedUser));
//     } else {
//       router.push('/login');
//     }

//     const loadData = async () => {
//       try {
//         const fetchedBranches = await fetchBranches();
//         const fetchedPlates = await fetchPlates();
//         const fetchedCars = await fetchCars();
//         const fetchedEmployees = await fetchEmployees();
//         setBranches(fetchedBranches);
//         setPlates(fetchedPlates);
//         setCars(fetchedCars);
//         setEmployees(fetchedEmployees);
//         if (fetchedBranches.length === 0) {
//           setError('لا توجد فروع متاحة. يرجى إضافة فرع أولاً.');
//         } else {
//           setNewEmployee((prev) => ({
//             ...prev,
//             branch: fetchedBranches[0].Name,
//           }));
//         }
//       } catch (err) {
//         console.error('Error loading data:', err);
//         setError('حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.');
//       }
//     };
//     loadData();
//   }, [router]);

//   useEffect(() => {
//     if (isCarModalOpen && user?.role === 'admin') {
//       const loadCars = async () => {
//         const fetchedCars = await fetchCars();
//         setCars(fetchedCars);
//       };
//       loadCars();
//     }
//   }, [isCarModalOpen, user]);

//   useEffect(() => {
//     if (isPlateModalOpen && user?.role === 'admin') {
//       const loadPlates = async () => {
//         const fetchedPlates = await fetchPlates();
//         setPlates(fetchedPlates);
//       };
//       loadPlates();
//     }
//   }, [isPlateModalOpen, user]);

//   useEffect(() => {
//     if (isBranchModalOpen && user?.role === 'admin') {
//       const loadBranches = async () => {
//         const fetchedBranches = await fetchBranches();
//         setBranches(fetchedBranches);
//       };
//       loadBranches();
//     }
//   }, [isBranchModalOpen, user]);

//   const openPlateModal = () => setIsPlateModalOpen(true);
//   const openBranchModal = () => setIsBranchModalOpen(true);
//   const openEmployeeModal = () => setIsEmployeeModalOpen(true);
//   const openCarModal = () => setIsCarModalOpen(true);

//   const closePlateModal = () => {
//     setIsPlateModalOpen(false);
//     setSelectedPlate(null);
//     setIsAddPlateMode(false);
//     setNewPlateLetters('');
//     setNewPlateNumbers('');
//     setError(null);
//   };

//   const closeBranchModal = () => {
//     setIsBranchModalOpen(false);
//     setSelectedBranch(null);
//     setIsAddBranchMode(false);
//     setNewBranchName('');
//     setError(null);
//   };

//   const closeEmployeeModal = () => {
//     setIsEmployeeModalOpen(false);
//     setSelectedEmployee(null);
//     setIsAddEmployeeMode(false);
//     setNewEmployee({ id: '', Name: '', EmID: 0, password: '', role: 'employee', branch: branches[0]?.Name || '' });
//     setError(null);
//   };

//   const closeCarModal = () => {
//     setIsCarModalOpen(false);
//     setIsAddCarMode(false);
//     setNewCarCompany('');
//     setNewCarModel('');
//     setError(null);
//   };

//   const closeDeleteConfirmModal = () => {
//     setIsDeleteConfirmModalOpen(false);
//     setEmployeeToDelete(null);
//     setCarToDelete(null);
//     setPlateToDelete(null);
//     setBranchToDelete(null);
//   };

//   const handleAddPlate = async () => {
//     if (user?.role !== 'admin') {
//       setError('غير مصرح لك بتنفيذ هذا الإجراء.');
//       return;
//     }

//     setError(null);

//     const lettersRegex = /^[ء-ي\s]+$/;
//     const numbersRegex = /^\d{1,4}$/;

//     if (!newPlateLetters.trim() || !newPlateNumbers.trim()) {
//       setError('الرجاء إدخال الأحرف والأرقام.');
//       return;
//     }

//     if (!lettersRegex.test(newPlateLetters.trim())) {
//       setError('حقل الأحرف يجب أن يحتوي على حروف عربية ومسافات فقط.');
//       return;
//     }

//     if (!numbersRegex.test(newPlateNumbers.trim())) {
//       setError('حقل الأرقام يجب أن يحتوي على 1 إلى 4 أرقام فقط.');
//       return;
//     }

//     try {
//       const response = await fetch('/api/addlicense', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           letters: newPlateLetters.trim(),
//           numbers: newPlateNumbers.trim(),
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.error || 'فشل في إضافة اللوحة.');
//       }

//       const data = await response.json();
//       setPlates([...plates, { id: data.result.id, Name: data.result.fields.Name }]);
//       setNewPlateLetters('');
//       setNewPlateNumbers('');
//       setIsAddPlateMode(false);
//     } catch (err: any) {
//       console.error('Error adding plate:', err);
//       setError(
//         err.message.includes('Failed to fetch')
//           ? 'فشل الاتصال بالخادم. تحقق من الشبكة وحاول مرة أخرى.'
//           : err.message || 'حدث خطأ أثناء إضافة اللوحة.'
//       );
//     }
//   };

//   const handleEditPlate = (plate: Plate) => {
//     const parts = plate.Name.trim().split(/\s+/);
//     if (parts.length < 2) {
//       setError('تنسيق اللوحة غير صالح. يجب أن يحتوي على أحرف وأرقام مفصولة بمسافة.');
//       return;
//     }
//     const letters = parts[0] || '';
//     const numbers = parts[1] || '';
//     setSelectedPlate(plate);
//     setNewPlateLetters(letters);
//     setNewPlateNumbers(numbers);
//     setIsAddPlateMode(false);
//   };

//   const handleUpdatePlate = async () => {
//     if (user?.role !== 'admin') {
//       setError('غير مصرح لك بتنفيذ هذا الإجراء.');
//       return;
//     }

//     if (!selectedPlate) return;

//     setError(null);

//     const lettersRegex = /^[ء-ي\s]+$/;
//     const numbersRegex = /^\d{1,4}$/;

//     if (!newPlateLetters.trim() || !newPlateNumbers.trim()) {
//       setError('الرجاء إدخال الأحرف والأرقام.');
//       return;
//     }

//     if (!lettersRegex.test(newPlateLetters.trim())) {
//       setError('حقل الأحرف يجب أن يحتوي على حروف عربية ومسافات فقط.');
//       return;
//     }

//     if (!numbersRegex.test(newPlateNumbers.trim())) {
//       setError('حقل الأرقام يجب أن يحتوي على 1 إلى 4 أرقام فقط.');
//       return;
//     }

//     try {
//       const response = await fetch('/api/addlicense', {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           id: selectedPlate.id,
//           letters: newPlateLetters.trim(),
//           numbers: newPlateNumbers.trim(),
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.error || 'فشل في تعديل اللوحة.');
//       }

//       const data = await response.json();
//       setPlates(
//         plates.map((plate) =>
//           plate.id === selectedPlate.id ? { id: data.result.id, Name: data.result.fields.Name } : plate
//         )
//       );
//       setSelectedPlate(null);
//       setNewPlateLetters('');
//       setNewPlateNumbers('');
//     } catch (err: any) {
//       console.error('Error updating plate:', err);
//       setError(
//         err.message.includes('Failed to fetch')
//           ? 'فشل الاتصال بالخادم. تحقق من الشبكة وحاول مرة أخرى.'
//           : err.message || 'حدث خطأ أثناء تعديل اللوحة.'
//       );
//     }
//   };

//   const confirmDeletePlate = (plateId: string) => {
//     setPlateToDelete(plateId);
//     setEmployeeToDelete(null);
//     setCarToDelete(null);
//     setBranchToDelete(null);
//     setIsDeleteConfirmModalOpen(true);
//   };

//   const handleDeletePlate = async () => {
//     if (user?.role !== 'admin') {
//       setError('غير مصرح لك بتنفيذ هذا الإجراء.');
//       return;
//     }

//     if (!plateToDelete) return;

//     setError(null);

//     try {
//       const response = await fetch('/api/addlicense', {
//         method: 'DELETE',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ id: plateToDelete }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.error || 'فشل في حذف اللوحة.');
//       }

//       setPlates(plates.filter((plate) => plate.id !== plateToDelete));
//       closeDeleteConfirmModal();
//     } catch (err: any) {
//       console.error('Error deleting plate:', err);
//       setError(
//         err.message.includes('Failed to fetch')
//           ? 'فشل الاتصال بالخادم. تحقق من الشبكة وحاول مرة أخرى.'
//           : err.message || 'حدث خطأ أثناء حذف اللوحة.'
//       );
//     }
//   };

//   const handleAddBranch = async () => {
//     if (user?.role !== 'admin') {
//       setError('غير مصرح لك بتنفيذ هذا الإجراء.');
//       return;
//     }

//     setError(null);

//     const branchRegex = /^[ء-ي\s]+$/;
//     if (!newBranchName.trim()) {
//       setError('الرجاء إدخال اسم الفرع.');
//       return;
//     }

//     if (!branchRegex.test(newBranchName.trim())) {
//       setError('اسم الفرع يجب أن يحتوي على حروف عربية ومسافات فقط.');
//       return;
//     }

//     try {
//       const response = await fetch('/api/addbranch', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ branch: newBranchName.trim() }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.error || 'فشل في إضافة الفرع.');
//       }

//       const data = await response.json();
//       setBranches([...branches, { id: data.result.id, Name: data.result.fields.Name }]);
//       setNewBranchName('');
//       setIsAddBranchMode(false);
//     } catch (err: any) {
//       console.error('Error adding branch:', err);
//       setError(
//         err.message.includes('Failed to fetch')
//           ? 'فشل الاتصال بالخادم. تحقق من الشبكة وحاول مرة أخرى.'
//           : err.message || 'حدث خطأ أثناء إضافة الفرع.'
//       );
//     }
//   };

//   const handleEditBranch = (branch: Branch) => {
//     setSelectedBranch(branch);
//     setNewBranchName(branch.Name);
//     setIsAddBranchMode(false);
//   };

//   const handleUpdateBranch = async () => {
//     if (user?.role !== 'admin') {
//       setError('غير مصرح لك بتنفيذ هذا الإجراء.');
//       return;
//     }

//     if (!selectedBranch) return;

//     setError(null);

//     const branchRegex = /^[ء-ي\s]+$/;
//     if (!newBranchName.trim()) {
//       setError('الرجاء إدخال اسم الفرع.');
//       return;
//     }

//     if (!branchRegex.test(newBranchName.trim())) {
//       setError('اسم الفرع يجب أن يحتوي على حروف عربية ومسافات فقط.');
//       return;
//     }

//     try {
//       const response = await fetch('/api/addbranch', {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           id: selectedBranch.id,
//           branch: newBranchName.trim(),
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.error || 'فشل في تعديل الفرع.');
//       }

//       const data = await response.json();
//       setBranches(
//         branches.map((branch) =>
//           branch.id === selectedBranch.id ? { id: data.result.id, Name: data.result.fields.Name } : branch
//         )
//       );
//       setSelectedBranch(null);
//       setNewBranchName('');
//     } catch (err: any) {
//       console.error('Error updating branch:', err);
//       setError(
//         err.message.includes('Failed to fetch')
//           ? 'فشل الاتصال بالخادم. تحقق من الشبكة وحاول مرة أخرى.'
//           : err.message || 'حدث خطأ أثناء تعديل الفرع.'
//       );
//     }
//   };

//   const confirmDeleteBranch = (branchId: string) => {
//     setBranchToDelete(branchId);
//     setEmployeeToDelete(null);
//     setCarToDelete(null);
//     setPlateToDelete(null);
//     setIsDeleteConfirmModalOpen(true);
//   };

//   const handleDeleteBranch = async () => {
//     if (user?.role !== 'admin') {
//       setError('غير مصرح لك بتنفيذ هذا الإجراء.');
//       return;
//     }
  
//     if (!branchToDelete) return;
  
//     setError(null);
  
//     try {
//       const response = await fetch('/api/addbranch', {
//         method: 'DELETE',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ id: branchToDelete }),
//       });
  
//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.error || 'فشل في حذف الفرع.');
//       }
  
//       setBranches(branches.filter((branch) => branch.id !== branchToDelete));
//       closeDeleteConfirmModal();
//     } catch (err: any) {
//       console.error('Error deleting branch:', err);
//       setError(
//         err.message.includes('Failed to fetch')
//           ? 'فشل الاتصال بالخادم. تحقق من الشبكة وحاول مرة أخرى.'
//           : err.message || 'حدث خطأ أثناء حذف الفرع.'
//       );
//     }
//   };

//   const handleAddCar = async () => {
//     if (user?.role !== 'admin') {
//       setError('غير مصرح لك بتنفيذ هذا الإجراء.');
//       return;
//     }

//     setError(null);

//     if (!newCarCompany.trim() || !newCarModel.trim()) {
//       setError('الرجاء إدخال اسم الشركة والموديل.');
//       return;
//     }

//     try {
//       const response = await fetch('/api/addcars', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           company: newCarCompany.trim(),
//           model: newCarModel.trim(),
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.error || 'فشل في إضافة السيارة.');
//       }

//       const data = await response.json();
//       setCars([...cars, { id: data.result.id, Name: data.result.fields.Name }]);
//       setNewCarCompany('');
//       setNewCarModel('');
//       setIsAddCarMode(false);
//     } catch (err: any) {
//       console.error('Error adding car:', err);
//       setError(
//         err.message.includes('Failed to fetch')
//           ? 'فشل الاتصال بالخادم. تحقق من الشبكة وحاول مرة أخرى.'
//           : err.message || 'حدث خطأ أثناء إضافة السيارة.'
//       );
//     }
//   };

//   const handleAddEmployee = async () => {
//     if (user?.role !== 'admin') {
//       setError('غير مصرح لك بتنفيذ هذا الإجراء.');
//       return;
//     }

//     setError(null);

//     if (!newEmployee.Name.trim() || !newEmployee.password.trim() || !newEmployee.branch.trim()) {
//       setError('الرجاء ملء جميع الحقول المطلوبة (الاسم، كلمة المرور، الفرع).');
//       return;
//     }

//     if (!['admin', 'employee'].includes(newEmployee.role)) {
//       setError('الدور يجب أن يكون إما admin أو employee.');
//       return;
//     }

//     if (isNaN(newEmployee.EmID) || newEmployee.EmID <= 0) {
//       setError('معرف الموظف يجب أن يكون رقمًا صالحًا.');
//       return;
//     }

//     try {
//       const response = await fetch('/api/usermange', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           fields: {
//             Name: newEmployee.Name.trim(),
//             EmID: newEmployee.EmID,
//             password: newEmployee.password.trim(),
//             role: newEmployee.role,
//             branch: newEmployee.branch.trim(),
//           },
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.error || 'فشل في إضافة الموظف.');
//       }

//       const data = await response.json();
//       setEmployees([...employees, { id: data.result.id, ...data.result.fields }]);
//       setNewEmployee({ id: '', Name: '', EmID: 0, password: '', role: 'employee', branch: branches[0]?.Name || '' });
//       setIsAddEmployeeMode(false);
//     } catch (err: any) {
//       console.error('Error adding employee:', err);
//       setError(
//         err.message.includes('Failed to fetch')
//           ? 'فشل الاتصال بالخادم. تحقق من الشبكة وحاول مرة أخرى.'
//           : err.message || 'حدث خطأ أثناء إضافة الموظف.'
//       );
//     }
//   };

//   const handleEditEmployee = (employee: Employee) => {
//     setSelectedEmployee(employee);
//     setIsAddEmployeeMode(false);
//   };

//   const handleUpdateEmployee = async () => {
//     if (user?.role !== 'admin') {
//       setError('غير مصرح لك بتنفيذ هذا الإجراء.');
//       return;
//     }

//     if (!selectedEmployee) return;

//     setError(null);

//     if (!selectedEmployee.Name.trim() || !selectedEmployee.password.trim() || !selectedEmployee.branch.trim()) {
//       setError('الرجاء ملء جميع الحقول المطلوبة (الاسم، كلمة المرور، الفرع).');
//       return;
//     }

//     if (!['admin', 'employee'].includes(selectedEmployee.role)) {
//       setError('الدور يجب أن يكون إما admin أو employee.');
//       return;
//     }

//     if (isNaN(selectedEmployee.EmID) || selectedEmployee.EmID <= 0) {
//       setError('معرف الموظف يجب أن يكون رقمًا صالحًا.');
//       return;
//     }

//     try {
//       const response = await fetch('/api/usermange', {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           id: selectedEmployee.id,
//           fields: {
//             Name: selectedEmployee.Name.trim(),
//             EmID: selectedEmployee.EmID,
//             password: selectedEmployee.password.trim(),
//             role: selectedEmployee.role,
//             branch: selectedEmployee.branch.trim(),
//           },
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.error || 'فشل في تحديث الموظف.');
//       }

//       const data = await response.json();
//       setEmployees(
//         employees.map((emp) =>
//           emp.id === selectedEmployee.id ? { id: data.result.id, ...data.result.fields } : emp
//         )
//       );
//       setSelectedEmployee(null);
//     } catch (err: any) {
//       console.error('Error updating employee:', err);
//       setError(
//         err.message.includes('Failed to fetch')
//           ? 'فشل الاتصال بالخادم. تحقق من الشبكة وحاول مرة أخرى.'
//           : err.message || 'حدث خطأ أثناء تحديث الموظف.'
//       );
//     }
//   };

//   const confirmDeleteEmployee = (employeeId: string) => {
//     setEmployeeToDelete(employeeId);
//     setCarToDelete(null);
//     setPlateToDelete(null);
//     setBranchToDelete(null);
//     setIsDeleteConfirmModalOpen(true);
//   };

//   const handleDeleteEmployee = async () => {
//     if (user?.role !== 'admin') {
//       setError('غير مصرح لك بتنفيذ هذا الإجراء.');
//       return;
//     }

//     if (!employeeToDelete) return;

//     setError(null);

//     try {
//       const response = await fetch('/api/usermange', {
//         method: 'DELETE',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ id: employeeToDelete }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.error || 'فشل في حذف الموظف.');
//       }

//       setEmployees(employees.filter((emp) => emp.id !== employeeToDelete));
//       closeDeleteConfirmModal();
//     } catch (err: any) {
//       console.error('Error deleting employee:', err);
//       setError(
//         err.message.includes('Failed to fetch')
//           ? 'فشل الاتصال بالخادم. تحقق من الشبكة وحاول مرة أخرى.'
//           : err.message || 'حدث خطأ أثناء حذف الموظف.'
//       );
//     }
//   };

//   const confirmDeleteCar = (carId: string) => {
//     setCarToDelete(carId);
//     setEmployeeToDelete(null);
//     setPlateToDelete(null);
//     setBranchToDelete(null);
//     setIsDeleteConfirmModalOpen(true);
//   };

//   const handleDeleteCar = async () => {
//     if (user?.role !== 'admin') {
//       setError('غير مصرح لك بتنفيذ هذا الإجراء.');
//       return;
//     }

//     if (!carToDelete) return;

//     setError(null);

//     try {
//       const response = await fetch('/api/addcars', {
//         method: 'DELETE',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ id: carToDelete }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.error || 'فشل في حذف السيارة.');
//       }

//       setCars(cars.filter((car) => car.id !== carToDelete));
//       closeDeleteConfirmModal();
//     } catch (err: any) {
//       console.error('Error deleting car:', err);
//       setError(
//         err.message.includes('Failed to fetch')
//           ? 'فشل الاتصال بالخادم. تحقق من الشبكة وحاول مرة أخرى.'
//           : err.message || 'حدث خطأ أثناء حذف السيارة.'
//       );
//     }
//   };

//   if (!user) return null;

//   return (
//     <div dir="rtl" className="min-h-screen bg-gray-100">
//       <Navbar />
//       <div className="container mx-auto px-4 py-8">
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           <Link href="/cheak-in">
//             <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow duration-300">
//               <div className="text-blue-600 mb-4">
//                 <FaCar className="inline-block text-4xl" />
//                 <FaArrowRight className="inline-block text-2xl ml-2" />
//               </div>
//               <h2 className="text-xl font-medium text-gray-800 mb-2">تشييك دخول السيارة</h2>
//               <p className="text-sm text-gray-600">تسجيل بيانات دخول السيارة مع الصور</p>
//             </div>
//           </Link>

//           <Link href="/history">
//             <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow duration-300">
//               <div className="text-blue-600 mb-4">
//                 <FaHistory className="inline-block text-4xl" />
//               </div>
//               <h2 className="text-xl font-medium text-gray-800 mb-2">السجل</h2>
//               <p className="text-sm text-gray-600">عرض سجلات تشييك السيارات</p>
//             </div>
//           </Link>

//           <Link href="/cheak-out">
//             <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow duration-300">
//               <div className="text-blue-600 mb-4">
//                 <FaCar className="inline-block text-4xl" />
//                 <FaArrowLeft className="inline-block text-2xl ml-2" />
//               </div>
//               <h2 className="text-xl font-medium text-gray-800 mb-2">تشييك خروج السيارة</h2>
//               <p className="text-sm text-gray-600">تسجيل بيانات خروج السيارة مع الصور</p>
//             </div>
//           </Link>

//           {user.role === 'admin' && (
//             <div
//               onClick={openPlateModal}
//               className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow duration-300 cursor-pointer"
//             >
//               <div className="text-blue-600 mb-4">
//                 <FaTag className="inline-block text-4xl" />
//               </div>
//               <h2 className="text-xl font-medium text-gray-800 mb-2">إدارة اللوحات</h2>
//               <p className="text-sm text-gray-600">اضافة و حذف و تعديل اللوحات</p>
//             </div>
//           )}

//           {user.role === 'admin' && (
//             <div
//               onClick={openBranchModal}
//               className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow duration-300 cursor-pointer"
//             >
//               <div className="text-blue-600 mb-4">
//                 <FaBuilding className="inline-block text-4xl" />
//               </div>
//               <h2 className="text-xl font-medium text-gray-800 mb-2">إدارة الفروع</h2>
//               <p className="text-sm text-gray-600">إضافة، تعديل، وحذف الفروع</p>
//             </div>
//           )}

//           {user.role === 'admin' && (
//             <div
//               onClick={openEmployeeModal}
//               className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow duration-300 cursor-pointer"
//             >
//               <div className="text-blue-600 mb-4">
//                 <FaUsers className="inline-block text-4xl" />
//               </div>
//               <h2 className="text-xl font-medium text-gray-800 mb-2">إدارة الموظفين</h2>
//               <p className="text-sm text-gray-600">عرض وتعديل بيانات الموظفين</p>
//             </div>
//           )}

//           {user.role === 'admin' && (
//             <div
//               onClick={openCarModal}
//               className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow duration-300 cursor-pointer"
//             >
//               <div className="text-blue-600 mb-4">
//                 <FaCarSide className="inline-block text-4xl" />
//               </div>
//               <h2 className="text-xl font-medium text-gray-800 mb-2">إدارة السيارات</h2>
//               <p className="text-sm text-gray-600">إضافة وحذف السيارات</p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Plate Modal */}
//       {isPlateModalOpen && user.role === 'admin' && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-4 w-[500px] h-[500px] flex flex-col relative">
//             {/* عنوان المودال وعلامة الإغلاق "X" */}
//             <div className="flex justify-between items-center mb-3">
//               <h2 className="text-xl font-semibold text-gray-800">إدارة اللوحات</h2>
//               <button
//                 onClick={closePlateModal}
//                 className="text-gray-600 hover:text-gray-800 focus:outline-none"
//               >
//                 <FaTimes className="text-2xl" />
//               </button>
//             </div>

//             {/* رسالة الخطأ إذا وجدت */}
//             {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

//             {/* عرض نموذج تعديل اللوحة إذا تم اختيار لوحة */}
//             {selectedPlate ? (
//               <div className="flex-1 overflow-y-auto">
//                 <h3 className="text-lg font-medium text-gray-800 mb-2">تعديل لوحة</h3>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">الأحرف</label>
//                     <input
//                       type="text"
//                       value={newPlateLetters}
//                       onChange={(e) => setNewPlateLetters(e.target.value)}
//                       placeholder="مثال: ب ر ا"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">الأرقام</label>
//                     <input
//                       type="text"
//                       value={newPlateNumbers}
//                       onChange={(e) => setNewPlateNumbers(e.target.value)}
//                       placeholder="مثال: 2792"
//                       maxLength={4}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                   </div>
//                 </div>
//                 <div className="flex justify-end gap-3 mt-3">
//                   <button
//                     onClick={() => setSelectedPlate(null)}
//                     className="px-3 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
//                   >
//                     إلغاء
//                   </button>
//                   <button
//                     onClick={handleUpdatePlate}
//                     className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//                   >
//                     تحديث
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="flex-1 flex flex-col">
//                 {/* نموذج إضافة لوحة جديدة */}
//                 {isAddPlateMode ? (
//                   <div className="flex-1 overflow-y-auto">
//                     <h3 className="text-lg font-medium text-gray-800 mb-2">إضافة لوحة جديدة</h3>
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">الأحرف</label>
//                         <input
//                           type="text"
//                           value={newPlateLetters}
//                           onChange={(e) => setNewPlateLetters(e.target.value)}
//                           placeholder="مثال: ب ر ا"
//                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">الأرقام</label>
//                         <input
//                           type="text"
//                           value={newPlateNumbers}
//                           onChange={(e) => setNewPlateNumbers(e.target.value)}
//                           placeholder="مثال: 2792"
//                           maxLength={4}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         />
//                       </div>
//                     </div>
//                     <div className="flex justify-end gap-3 mt-3">
//                       <button
//                         onClick={() => setIsAddPlateMode(false)}
//                         className="px-3 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
//                       >
//                         إلغاء
//                       </button>
//                       <button
//                         onClick={handleAddPlate}
//                         className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//                       >
//                         إضافة
//                       </button>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="flex-1 flex flex-col">
//                     <div className="flex justify-end items-center mb-3">
//                       <button
//                         onClick={() => setIsAddPlateMode(true)}
//                         className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//                       >
//                         إضافة لوحة جديدة
//                       </button>
//                     </div>

//                     {/* قائمة اللوحات بحواف مربعة وتمرير داخلي */}
//                     <div className="flex-1">
//                       <h3 className="text-lg font-medium text-gray-800 mb-2">قائمة اللوحات</h3>
//                       <div
//                         className="border border-gray-200 max-h-[300px] overflow-y-auto"
//                         style={{ borderRadius: 0 }}
//                       >
//                         {plates.length === 0 ? (
//                           <p className="text-sm text-gray-600 p-3">لا توجد لوحات متاحة.</p>
//                         ) : (
//                           <table className="min-w-full bg-white">
//                             <thead className="sticky top-0 bg-white">
//                               <tr>
//                                 <th className="px-3 py-2 border-b text-right">اللوحة</th>
//                                 <th className="px-3 py-2 border-b text-right">إجراءات</th>
//                               </tr>
//                             </thead>
//                             <tbody>
//                               {plates.map((plate) => (
//                                 <tr key={plate.id}>
//                                   <td className="px-3 py-2 border-b text-right">{plate.Name}</td>
//                                   <td className="px-3 py-2 border-b text-right">
//                                     <button
//                                       onClick={() => handleEditPlate(plate)}
//                                       className="text-blue-600 hover:underline mx-1"
//                                     >
//                                       تعديل
//                                     </button>
//                                     <button
//                                       onClick={() => confirmDeletePlate(plate.id)}
//                                       className="text-red-600 hover:underline mx-1"
//                                     >
//                                       حذف
//                                     </button>
//                                   </td>
//                                 </tr>
//                               ))}
//                             </tbody>
//                           </table>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Branch Modal */}
//       {isBranchModalOpen && user.role === 'admin' && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-4 w-[500px] h-[500px] flex flex-col relative">
//             {/* عنوان المودال وعلامة الإغلاق "X" */}
//             <div className="flex justify-between items-center mb-3">
//               <h2 className="text-xl font-semibold text-gray-800">إدارة الفروع</h2>
//               <button
//                 onClick={closeBranchModal}
//                 className="text-gray-600 hover:text-gray-800 focus:outline-none"
//               >
//                 <FaTimes className="text-2xl" />
//               </button>
//             </div>

//             {/* رسالة الخطأ إذا وجدت */}
//             {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

//             {selectedBranch ? (
//               <div className="flex-1 overflow-y-auto">
//                 <h3 className="text-lg font-medium text-gray-800 mb-2">تعديل فرع</h3>
//                 <div className="grid grid-cols-1 gap-3">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">اسم الفرع</label>
//                     <input
//                       type="text"
//                       value={newBranchName}
//                       onChange={(e) => setNewBranchName(e.target.value)}
//                       placeholder="مثال: فرع الرياض"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                   </div>
//                 </div>
//                 <div className="flex justify-end gap-3 mt-3">
//                   <button
//                     onClick={() => setSelectedBranch(null)}
//                     className="px-3 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
//                   >
//                     إلغاء
//                   </button>
//                   <button
//                     onClick={handleUpdateBranch}
//                     className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//                   >
//                     تحديث
//                   </button>
//                 </div>
//               </div>
//             ) : isAddBranchMode ? (
//               <div className="flex-1 overflow-y-auto">
//                 <h3 className="text-lg font-medium text-gray-800 mb-2">إضافة فرع جديد</h3>
//                 <div className="grid grid-cols-1 gap-3">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">اسم الفرع</label>
//                     <input
//                       type="text"
//                       value={newBranchName}
//                       onChange={(e) => setNewBranchName(e.target.value)}
//                       placeholder="مثال: فرع الرياض"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                   </div>
//                 </div>
//                 <div className="flex justify-end gap-3 mt-3">
//                   <button
//                     onClick={() => setIsAddBranchMode(false)}
//                     className="px-3 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
//                   >
//                     إلغاء
//                   </button>
//                   <button
//                     onClick={handleAddBranch}
//                     className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//                   >
//                     إضافة
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="flex-1 flex flex-col">
//                 <div className="flex justify-end items-center mb-3">
//                   <button
//                     onClick={() => setIsAddBranchMode(true)}
//                     className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//                   >
//                     إضافة فرع جديد
//                   </button>
//                 </div>

//                 {/* قائمة الفروع بحواف مربعة وتمرير داخلي */}
//                 <div className="flex-1">
//                   <h3 className="text-lg font-medium text-gray-800 mb-2">قائمة الفروع</h3>
//                   <div
//                     className="border border-gray-200 max-h-[300px] overflow-y-auto"
//                     style={{ borderRadius: 0 }}
//                   >
//                     {branches.length === 0 ? (
//                       <p className="text-sm text-gray-600 p-3">لا توجد فروع متاحة.</p>
//                     ) : (
//                       <table className="min-w-full bg-white">
//                         <thead className="sticky top-0 bg-white">
//                           <tr>
//                             <th className="px-3 py-2 border-b text-right">اسم الفرع</th>
//                             <th className="px-3 py-2 border-b text-right">إجراءات</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {branches.map((branch) => (
//                             <tr key={branch.id}>
//                               <td className="px-3 py-2 border-b text-right">{branch.Name}</td>
//                               <td className="px-3 py-2 border-b text-right">
//                                 <button
//                                   onClick={() => handleEditBranch(branch)}
//                                   className="text-blue-600 hover:underline mx-1"
//                                 >
//                                   تعديل
//                                 </button>
//                                 <button
//                                   onClick={() => confirmDeleteBranch(branch.id)}
//                                   className="text-red-600 hover:underline mx-1"
//                                 >
//                                   حذف
//                                 </button>
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Employee Modal */}
//       {isEmployeeModalOpen && user.role === 'admin' && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-4 w-[650px] h-[500px] flex flex-col relative">
//             {/* عنوان المودال وعلامة الإغلاق "X" */}
//             <div className="flex justify-between items-center mb-3">
//               <h2 className="text-xl font-semibold text-gray-800">إدارة الموظفين</h2>
//               <button
//                 onClick={closeEmployeeModal}
//                 className="text-gray-600 hover:text-gray-800 focus:outline-none"
//               >
//                 <FaTimes className="text-2xl" />
//               </button>
//             </div>

//             {/* رسالة الخطأ إذا وجدت */}
//             {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

//             {selectedEmployee ? (
//               <div className="flex-1 overflow-y-auto">
//                 <h3 className="text-lg font-medium text-gray-800 mb-2">تعديل موظف</h3>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
//                     <input
//                       type="text"
//                       value={selectedEmployee.Name}
//                       onChange={(e) =>
//                         setSelectedEmployee({ ...selectedEmployee, Name: e.target.value })
//                       }
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">معرف الموظف</label>
//                     <input
//                       type="number"
//                       value={selectedEmployee.EmID}
//                       onChange={(e) =>
//                         setSelectedEmployee({ ...selectedEmployee, EmID: parseInt(e.target.value) })
//                       }
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
//                     <input
//                       type="text"
//                       value={selectedEmployee.password}
//                       onChange={(e) =>
//                         setSelectedEmployee({ ...selectedEmployee, password: e.target.value })
//                       }
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">الدور</label>
//                     <select
//                       value={selectedEmployee.role}
//                       onChange={(e) =>
//                         setSelectedEmployee({ ...selectedEmployee, role: e.target.value })
//                       }
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     >
//                       <option value="admin">مدير</option>
//                       <option value="employee">موظف</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">الفرع</label>
//                     <select
//                       value={selectedEmployee.branch}
//                       onChange={(e) =>
//                         setSelectedEmployee({ ...selectedEmployee, branch: e.target.value })
//                       }
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     >
//                       {branches.map((branch) => (
//                         <option key={branch.id} value={branch.Name}>
//                           {branch.Name}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>
//                 <div className="flex justify-end gap-3 mt-3">
//                   <button
//                     onClick={() => setSelectedEmployee(null)}
//                     className="px-3 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
//                   >
//                     إلغاء
//                   </button>
//                   <button
//                     onClick={handleUpdateEmployee}
//                     className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//                   >
//                     تحديث
//                   </button>
//                 </div>
//               </div>
//             ) : isAddEmployeeMode ? (
//               <div className="flex-1 overflow-y-auto">
//                 <h3 className="text-lg font-medium text-gray-800 mb-2">إضافة موظف جديد</h3>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
//                     <input
//                       type="text"
//                       value={newEmployee.Name}
//                       onChange={(e) => setNewEmployee({ ...newEmployee, Name: e.target.value })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">معرف الموظف</label>
//                     <input
//                       type="number"
//                       value={newEmployee.EmID}
//                       onChange={(e) => setNewEmployee({ ...newEmployee, EmID: parseInt(e.target.value) })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
//                     <input
//                       type="text"
//                       value={newEmployee.password}
//                       onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">الدور</label>
//                     <select
//                       value={newEmployee.role}
//                       onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     >
//                       <option value="admin">مدير</option>
//                       <option value="employee">موظف</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">الفرع</label>
//                     <select
//                       value={newEmployee.branch}
//                       onChange={(e) => setNewEmployee({ ...newEmployee, branch: e.target.value })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     >
//                       {branches.map((branch) => (
//                         <option key={branch.id} value={branch.Name}>
//                           {branch.Name}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>
//                 <div className="flex justify-end gap-3 mt-3">
//                   <button
//                     onClick={() => setIsAddEmployeeMode(false)}
//                     className="px-3 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
//                   >
//                     إلغاء
//                   </button>
//                   <button
//                     onClick={handleAddEmployee}
//                     className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//                   >
//                     إضافة
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="flex-1 flex flex-col">
//                 <div className="flex justify-end items-center mb-3">
//                   <button
//                     onClick={() => setIsAddEmployeeMode(true)}
//                     className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//                   >
//                     إضافة موظف جديد
//                   </button>
//                 </div>

//                 {/* قائمة الموظفين بحواف مربعة وتمرير داخلي */}
//                 <div className="flex-1">
//                   <h3 className="text-lg font-medium text-gray-800 mb-2">قائمة الموظفين</h3>
//                   <div
//                     className="border border-gray-200 max-h-[300px] overflow-y-auto"
//                     style={{ borderRadius: 0 }}
//                   >
//                     {employees.length === 0 ? (
//                       <p className="text-sm text-gray-600 p-3">لا توجد موظفين متاحين.</p>
//                     ) : (
//                       <table className="min-w-full bg-white">
//                         <thead className="sticky top-0 bg-white">
//                           <tr>
//                             <th className="px-3 py-2 border-b text-right">الاسم</th>
//                             <th className="px-3 py-2 border-b text-right">معرف الموظف</th>
//                             <th className="px-3 py-2 border-b text-right">الدور</th>
//                             <th className="px-3 py-2 border-b text-right">الفرع</th>
//                             <th className="px-3 py-2 border-b text-right">إجراءات</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {employees.map((employee) => (
//                             <tr key={employee.id}>
//                               <td className="px-3 py-2 border-b text-right">{employee.Name}</td>
//                               <td className="px-3 py-2 border-b text-right">{employee.EmID}</td>
//                               <td className="px-3 py-2 border-b text-right">
//                                 {employee.role === 'admin' ? 'مدير' : 'موظف'}
//                               </td>
//                               <td className="px-3 py-2 border-b text-right">{employee.branch}</td>
//                               <td className="px-3 py-2 border-b text-right">
//                                 <button
//                                   onClick={() => handleEditEmployee(employee)}
//                                   className="text-blue-600 hover:underline mx-1"
//                                 >
//                                   تعديل
//                                 </button>
//                                 <button
//                                   onClick={() => confirmDeleteEmployee(employee.id)}
//                                   className="text-red-600 hover:underline mx-1"
//                                 >
//                                   حذف
//                                 </button>
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Car Modal */}
//       {isCarModalOpen && user.role === 'admin' && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-4 w-[500px] h-[500px] flex flex-col relative">
//             {/* عنوان المودال وعلامة الإغلاق "X" */}
//             <div className="flex justify-between items-center mb-3">
//               <h2 className="text-xl font-semibold text-gray-800">إدارة السيارات</h2>
//               <button
//                 onClick={closeCarModal}
//                 className="text-gray-600 hover:text-gray-800 focus:outline-none"
//               >
//                 <FaTimes className="text-2xl" />
//               </button>
//             </div>

//             {/* رسالة الخطأ إذا وجدت */}
//             {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

//             {isAddCarMode ? (
//               <div className="flex-1 overflow-y-auto">
//                 <h3 className="text-lg font-medium text-gray-800 mb-2">إضافة سيارة جديدة</h3>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">الشركة</label>
//                     <input
//                       type="text"
//                       value={newCarCompany}
//                       onChange={(e) => setNewCarCompany(e.target.value)}
//                       placeholder="مثال: هيونداي"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">الموديل</label>
//                     <input
//                       type="text"
//                       value={newCarModel}
//                       onChange={(e) => setNewCarModel(e.target.value)}
//                       placeholder="مثال: اكسنت"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                   </div>
//                 </div>
//                 <div className="flex justify-end gap-3 mt-3">
//                   <button
//                     onClick={() => setIsAddCarMode(false)}
//                     className="px-3 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
//                   >
//                     إلغاء
//                   </button>
//                   <button
//                     onClick={handleAddCar}
//                     className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//                   >
//                     إضافة
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="flex-1 flex flex-col">
//                 <div className="flex justify-end items-center mb-3">
//                   <button
//                     onClick={() => setIsAddCarMode(true)}
//                     className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//                   >
//                     إضافة سيارة جديدة
//                   </button>
//                 </div>

//                 {/* قائمة السيارات بحواف مربعة وتمرير داخلي */}
//                 <div className="flex-1">
//                   <h3 className="text-lg font-medium text-gray-800 mb-2">قائمة السيارات</h3>
//                   <div
//                     className="border border-gray-200 max-h-[300px] overflow-y-auto"
//                     style={{ borderRadius: 0 }}
//                   >
//                     {cars.length === 0 ? (
//                       <p className="text-sm text-gray-600 p-3">لا توجد سيارات متاحة.</p>
//                     ) : (
//                       <table className="min-w-full bg-white">
//                         <thead className="sticky top-0 bg-white">
//                           <tr>
//                             <th className="px-3 py-2 border-b text-right">اسم السيارة</th>
//                             <th className="px-3 py-2 border-b text-right">إجراءات</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {cars.map((car) => (
//                             <tr key={car.id}>
//                               <td className="px-3 py-2 border-b text-right">{car.Name}</td>
//                               <td className="px-3 py-2 border-b text-right">
//                                 <button
//                                   onClick={() => confirmDeleteCar(car.id)}
//                                   className="text-red-600 hover:underline mx-1"
//                                 >
//                                   حذف
//                                 </button>
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Delete Confirmation Modal */}
//       {isDeleteConfirmModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 max-w-md w-full">
//             <h2 className="text-xl font-semibold text-gray-800 mb-4">تأكيد الحذف</h2>
//             <p className="text-sm text-gray-600 mb-4">
//               هل أنت متأكد من أنك تريد حذف{' '}
//               {employeeToDelete
//                 ? 'هذا الموظف'
//                 : carToDelete
//                 ? 'هذه السيارة'
//                 : plateToDelete
//                 ? 'هذه اللوحة'
//                 : 'هذا الفرع'}؟
//             </p>
//             <div className="flex justify-end gap-4">
//               <button
//                 onClick={closeDeleteConfirmModal}
//                 className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
//               >
//                 إلغاء
//               </button>
//               <button
//                 onClick={() => {
//                   if (employeeToDelete) handleDeleteEmployee();
//                   else if (carToDelete) handleDeleteCar();
//                   else if (plateToDelete) handleDeletePlate();
//                   else if (branchToDelete) handleDeleteBranch();
//                 }}
//                 className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
//               >
//                 حذف
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


'use client';

import Link from 'next/link';
import Navbar from '@/public/components/navbar';
import { FaCar, FaHistory, FaArrowRight, FaArrowLeft, FaUsers, FaCarSide, FaTag, FaBuilding, FaTimes } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface User {
  id: string;
  name: string;
  EmID: number;
  role: string;
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

async function fetchPlates(): Promise<Plate[]> {
  try {
    const response = await fetch('/api/addlicense', {
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
    console.error('Error fetching plates:', error);
    return [];
  }
}

async function fetchCars(): Promise<Car[]> {
  try {
    const response = await fetch('/api/addcars', {
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
    console.error('Error fetching cars:', error);
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
  const [isCarModalOpen, setIsCarModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
  const [carToDelete, setCarToDelete] = useState<string | null>(null);
  const [plateToDelete, setPlateToDelete] = useState<string | null>(null);
  const [branchToDelete, setBranchToDelete] = useState<string | null>(null);
  const [isAddEmployeeMode, setIsAddEmployeeMode] = useState(false);
  const [isAddCarMode, setIsAddCarMode] = useState(false);
  const [isAddPlateMode, setIsAddPlateMode] = useState(false);
  const [isAddBranchMode, setIsAddBranchMode] = useState(false);
  const [newCarCompany, setNewCarCompany] = useState('');
  const [newCarModel, setNewCarModel] = useState('');
  const [newPlateLetters, setNewPlateLetters] = useState('');
  const [newPlateNumbers, setNewPlateNumbers] = useState('');
  const [newBranchName, setNewBranchName] = useState('');
  const [newEmployee, setNewEmployee] = useState<Employee>({
    id: '',
    Name: '',
    EmID: 0,
    password: '',
    role: 'employee',
    branch: '',
  });
  const [plates, setPlates] = useState<Plate[]>([]);
  const [filteredPlates, setFilteredPlates] = useState<Plate[]>([]);
  const [searchPlateTerm, setSearchPlateTerm] = useState('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedPlate, setSelectedPlate] = useState<Plate | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

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
        const fetchedPlates = await fetchPlates();
        const fetchedCars = await fetchCars();
        const fetchedEmployees = await fetchEmployees();
        setBranches(fetchedBranches);
        setPlates(fetchedPlates);
        setFilteredPlates(fetchedPlates);
        setCars(fetchedCars);
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
  }, [router]);

  useEffect(() => {
    if (isCarModalOpen && user?.role === 'admin') {
      const loadCars = async () => {
        try {
          const fetchedCars = await fetchCars();
          setCars(fetchedCars);
          if (fetchedCars.length === 0) {
            toast.info('لا توجد سيارات متاحة حاليًا.');
          }
        } catch (err) {
          console.error('Error loading cars:', err);
          toast.error('حدث خطأ أثناء تحميل السيارات.');
        }
      };
      loadCars();
    }
  }, [isCarModalOpen, user]);

  useEffect(() => {
    if (isPlateModalOpen && user?.role === 'admin') {
      const loadPlates = async () => {
        try {
          const fetchedPlates = await fetchPlates();
          setPlates(fetchedPlates);
          setFilteredPlates(fetchedPlates);
          setSearchPlateTerm('');
          if (fetchedPlates.length === 0) {
            toast.info('لا توجد لوحات متاحة حاليًا.');
          }
        } catch (err) {
          console.error('Error loading plates:', err);
          toast.error('حدث خطأ أثناء تحميل اللوحات.');
        }
      };
      loadPlates();
    }
  }, [isPlateModalOpen, user]);

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
    if (user?.role !== 'admin') {
      toast.error('غير مصرح لك بإدارة اللوحات. يجب أن تكون مديرًا.');
      return;
    }
    setIsPlateModalOpen(true);
  };

  const openBranchModal = () => {
    if (user?.role !== 'admin') {
      toast.error('غير مصرح لك بإدارة الفروع. يجب أن تكون مديرًا.');
      return;
    }
    setIsBranchModalOpen(true);
  };

  const openEmployeeModal = () => {
    if (user?.role !== 'admin') {
      toast.error('غير مصرح لك بإدارة الموظفين. يجب أن تكون مديرًا.');
      return;
    }
    setIsEmployeeModalOpen(true);
  };

  const openCarModal = () => {
    if (user?.role !== 'admin') {
      toast.error('غير مصرح لك بإدارة السيارات. يجب أن تكون مديرًا.');
      return;
    }
    setIsCarModalOpen(true);
  };

  const closePlateModal = () => {
    setIsPlateModalOpen(false);
    setSelectedPlate(null);
    setIsAddPlateMode(false);
    setNewPlateLetters('');
    setNewPlateNumbers('');
    setSearchPlateTerm('');
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

  const closeCarModal = () => {
    setIsCarModalOpen(false);
    setIsAddCarMode(false);
    setNewCarCompany('');
    setNewCarModel('');
  };

  const closeDeleteConfirmModal = () => {
    setIsDeleteConfirmModalOpen(false);
    setEmployeeToDelete(null);
    setCarToDelete(null);
    setPlateToDelete(null);
    setBranchToDelete(null);
  };

  const handleAddPlate = async () => {
    if (user?.role !== 'admin') {
      toast.error('غير مصرح لك بتنفيذ هذا الإجراء.');
      return;
    }

    const lettersRegex = /^[ء-ي\s]+$/;
    const numbersRegex = /^\d{1,4}$/;

    if (!newPlateLetters.trim() || !newPlateNumbers.trim()) {
      toast.error('الرجاء إدخال الأحرف والأرقام.');
      return;
    }

    if (!lettersRegex.test(newPlateLetters.trim())) {
      toast.error('حقل الأحرف يجب أن يحتوي على حروف عربية ومسافات فقط.');
      return;
    }

    if (!numbersRegex.test(newPlateNumbers.trim())) {
      toast.error('حقل الأرقام يجب أن يحتوي على 1 إلى 4 أرقام فقط.');
      return;
    }

    try {
      const response = await fetch('/api/addlicense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          letters: newPlateLetters.trim(),
          numbers: newPlateNumbers.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.error.includes('already exists')) {
          toast.error('هذه اللوحة موجودة بالفعل.');
        } else {
          throw new Error(errorData.error || 'فشل في إضافة اللوحة.');
        }
        return;
      }

      const data = await response.json();
      const newPlate = { id: data.result.id, Name: data.result.fields.Name };
      setPlates([...plates, newPlate]);
      setFilteredPlates([...plates, newPlate]);
      setNewPlateLetters('');
      setNewPlateNumbers('');
      setIsAddPlateMode(false);
      toast.success('تمت إضافة اللوحة بنجاح!');
    } catch (err: any) {
      console.error('Error adding plate:', err);
      toast.error(
        err.message.includes('Failed to fetch')
          ? 'فشل الاتصال بالخادم. تحقق من الشبكة وحاول مرة أخرى.'
          : err.message || 'حدث خطأ أثناء إضافة اللوحة.'
      );
    }
  };

  const handleEditPlate = (plate: Plate) => {
    const parts = plate.Name.trim().split(/\s+/);
    if (parts.length < 2) {
      toast.error('تنسيق اللوحة غير صالح. يجب أن يحتوي على أحرف وأرقام مفصولة بمسافة.');
      return;
    }
    const letters = parts[0] || '';
    const numbers = parts[1] || '';
    setSelectedPlate(plate);
    setNewPlateLetters(letters);
    setNewPlateNumbers(numbers);
    setIsAddPlateMode(false);
  };

  const handleUpdatePlate = async () => {
    if (user?.role !== 'admin') {
      toast.error('غير مصرح لك بتنفيذ هذا الإجراء.');
      return;
    }

    if (!selectedPlate) {
      toast.error('لم يتم اختيار لوحة للتعديل.');
      return;
    }

    const lettersRegex = /^[ء-ي\s]+$/;
    const numbersRegex = /^\d{1,4}$/;

    if (!newPlateLetters.trim() || !newPlateNumbers.trim()) {
      toast.error('الرجاء إدخال الأحرف والأرقام.');
      return;
    }

    if (!lettersRegex.test(newPlateLetters.trim())) {
      toast.error('حقل الأحرف يجب أن يحتوي على حروف عربية ومسافات فقط.');
      return;
    }

    if (!numbersRegex.test(newPlateNumbers.trim())) {
      toast.error('حقل الأرقام يجب أن يحتوي على 1 إلى 4 أرقام فقط.');
      return;
    }

    try {
      const response = await fetch('/api/addlicense', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedPlate.id,
          letters: newPlateLetters.trim(),
          numbers: newPlateNumbers.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.error.includes('already exists')) {
          toast.error('هذه اللوحة موجودة بالفعل.');
        } else {
          throw new Error(errorData.error || 'فشل في تعديل اللوحة.');
        }
        return;
      }

      const data = await response.json();
      const updatedPlate = { id: data.result.id, Name: data.result.fields.Name };
      setPlates(plates.map((plate) => (plate.id === selectedPlate.id ? updatedPlate : plate)));
      setFilteredPlates(filteredPlates.map((plate) => (plate.id === selectedPlate.id ? updatedPlate : plate)));
      setSelectedPlate(null);
      setNewPlateLetters('');
      setNewPlateNumbers('');
      toast.success('تم تعديل اللوحة بنجاح!');
    } catch (err: any) {
      console.error('Error updating plate:', err);
      toast.error(
        err.message.includes('Failed to fetch')
          ? 'فشل الاتصال بالخادم. تحقق من الشبكة وحاول مرة أخرى.'
          : err.message || 'حدث خطأ أثناء تعديل اللوحة.'
      );
    }
  };

  const confirmDeletePlate = (plateId: string) => {
    setPlateToDelete(plateId);
    setEmployeeToDelete(null);
    setCarToDelete(null);
    setBranchToDelete(null);
    setIsDeleteConfirmModalOpen(true);
  };

  const handleDeletePlate = async () => {
    if (user?.role !== 'admin') {
      toast.error('غير مصرح لك بتنفيذ هذا الإجراء.');
      return;
    }

    if (!plateToDelete) {
      toast.error('لم يتم اختيار لوحة للحذف.');
      return;
    }

    try {
      const response = await fetch('/api/addlicense', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: plateToDelete }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'فشل في حذف اللوحة.');
      }

      setPlates(plates.filter((plate) => plate.id !== plateToDelete));
      setFilteredPlates(filteredPlates.filter((plate) => plate.id !== plateToDelete));
      closeDeleteConfirmModal();
      toast.success('تم حذف اللوحة بنجاح!');
    } catch (err: any) {
      console.error('Error deleting plate:', err);
      toast.error(
        err.message.includes('Failed to fetch')
          ? 'فشل الاتصال بالخادم. تحقق من الشبكة وحاول مرة أخرى.'
          : err.message || 'حدث خطأ أثناء حذف اللوحة.'
      );
    }
  };

  const handleAddBranch = async () => {
    if (user?.role !== 'admin') {
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
      setBranches([...branches, { id: data.result.id, Name: data.result.fields.Name }]);
      setNewBranchName('');
      setIsAddBranchMode(false);
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
    toast.info(`جاري تعد نگهط الفرع: ${branch.Name}`);
  };

  const handleUpdateBranch = async () => {
    if (user?.role !== 'admin') {
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
      setBranches(
        branches.map((branch) =>
          branch.id === selectedBranch.id ? { id: data.result.id, Name: data.result.fields.Name } : branch
        )
      );
      setSelectedBranch(null);
      setNewBranchName('');
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
    setCarToDelete(null);
    setPlateToDelete(null);
    setIsDeleteConfirmModalOpen(true);
  };

  const handleDeleteBranch = async () => {
    if (user?.role !== 'admin') {
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
        if (errorData.error.includes('موظفين')) {
          toast.error('لا يمكن حذف الفرع لأنه يحتوي على موظفين. يرجى نقل الموظفين أو حذفهم أولاً.');
        } else {
          throw new Error(errorData.error || 'فشل في حذف الفرع.');
        }
        return;
      }

      setBranches(branches.filter((branch) => branch.id !== branchToDelete));
      closeDeleteConfirmModal();
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

  const handleAddCar = async () => {
    if (user?.role !== 'admin') {
      toast.error('غير مصرح لك بتنفيذ هذا الإجراء.');
      return;
    }

    if (!newCarCompany.trim() || !newCarModel.trim()) {
      toast.error('الرجاء إدخال اسم الشركة والموديل.');
      return;
    }

    try {
      const response = await fetch('/api/addcars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company: newCarCompany.trim(),
          model: newCarModel.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.error.includes('already exists')) {
          toast.error('هذه السيارة موجودة بالفعل.');
        } else {
          throw new Error(errorData.error || 'فشل في إضافة السيارة.');
        }
        return;
      }

      const data = await response.json();
      setCars([...cars, { id: data.result.id, Name: data.result.fields.Name }]);
      setNewCarCompany('');
      setNewCarModel('');
      setIsAddCarMode(false);
      toast.success('تمت إضافة السيارة بنجاح!');
    } catch (err: any) {
      console.error('Error adding car:', err);
      toast.error(
        err.message.includes('Failed to fetch')
          ? 'فشل الاتصال بالخادم. تحقق من الشبكة وحاول مرة أخرى.'
          : err.message || 'حدث خطأ أثناء إضافة السيارة.'
      );
    }
  };

  const handleAddEmployee = async () => {
    if (user?.role !== 'admin') {
      toast.error('غير مصرح لك بتنفيذ هذا الإجراء.');
      return;
    }

    if (!newEmployee.Name.trim() || !newEmployee.password.trim() || !newEmployee.branch.trim()) {
      toast.error('الرجاء ملء جميع الحقول المطلوبة (الاسم، كلمة المرور، الفرع).');
      return;
    }

    if (!['admin', 'employee'].includes(newEmployee.role)) {
      toast.error('الدور يجب أن يكون إما admin أو employee.');
      return;
    }

    if (isNaN(newEmployee.EmID) || newEmployee.EmID <= 0) {
      toast.error('معرف الموظف يجب أن يكون رقمًا صالحًا وأكبر من 0.');
      return;
    }

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
            role: newEmployee.role,
            branch: newEmployee.branch.trim(),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.error.includes('already exists')) {
          toast.error('معرف الموظف هذا مستخدم بالفعل.');
        } else {
          throw new Error(errorData.error || 'فشل في إضافة الموظف.');
        }
        return;
      }

      const data = await response.json();
      setEmployees([...employees, { id: data.result.id, ...data.result.fields }]);
      setNewEmployee({ id: '', Name: '', EmID: 0, password: '', role: 'employee', branch: branches[0]?.Name || '' });
      setIsAddEmployeeMode(false);
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
    setIsAddEmployeeMode(false);
    toast.info(`جاري تعديل الموظف: ${employee.Name}`);
  };

  const handleUpdateEmployee = async () => {
    if (user?.role !== 'admin') {
      toast.error('غير مصرح لك بتنفيذ هذا الإجراء.');
      return;
    }

    if (!selectedEmployee) {
      toast.error('لم يتم اختيار موظف للتعديل.');
      return;
    }

    if (!selectedEmployee.Name.trim() || !selectedEmployee.password.trim() || !selectedEmployee.branch.trim()) {
      toast.error('الرجاء ملء جميع الحقول المطلوبة (الاسم، كلمة المرور، الفرع).');
      return;
    }

    if (!['admin', 'employee'].includes(selectedEmployee.role)) {
      toast.error('الدور يجب أن يكون إما admin أو employee.');
      return;
    }

    if (isNaN(selectedEmployee.EmID) || selectedEmployee.EmID <= 0) {
      toast.error('معرف الموظف يجب أن يكون رقمًا صالحًا وأكبر من 0.');
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
            password: selectedEmployee.password.trim(),
            role: selectedEmployee.role,
            branch: selectedEmployee.branch.trim(),
          },
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
      setEmployees(
        employees.map((emp) =>
          emp.id === selectedEmployee.id ? { id: data.result.id, ...data.result.fields } : emp
        )
      );
      setSelectedEmployee(null);
      toast.success('تم تحديث الموظف بنجاح!');
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
    if (employeeToDelete?.role === 'admin' && user?.EmID !== 1) {
      toast.error('فقط د.عبدالرحمن العوفي يمكنه حذف المديرين.');
      return;
    }
  
    setEmployeeToDelete(employeeId);
    setCarToDelete(null);
    setPlateToDelete(null);
    setBranchToDelete(null);
    setIsDeleteConfirmModalOpen(true);
  };

  const handleDeleteEmployee = async () => {
    if (user?.role !== 'admin') {
      toast.error('غير مصرح لك بتنفيذ هذا الإجراء.');
      return;
    }

    if (!employeeToDelete) {
      toast.error('لم يتم اختيار موظف للحذف.');
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

      setEmployees(employees.filter((emp) => emp.id !== employeeToDelete));
      closeDeleteConfirmModal();
      toast.success('تم حذف الموظف بنجاح!');
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
    setCarToDelete(carId);
    setEmployeeToDelete(null);
    setPlateToDelete(null);
    setBranchToDelete(null);
    setIsDeleteConfirmModalOpen(true);
  };

  const handleDeleteCar = async () => {
    if (user?.role !== 'admin') {
      toast.error('غير مصرح لك بتنفيذ هذا الإجراء.');
      return;
    }

    if (!carToDelete) {
      toast.error('لم يتم اختيار سيارة للحذف.');
      return;
    }

    try {
      const response = await fetch('/api/addcars', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: carToDelete }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'فشل في حذف السيارة.');
      }

      setCars(cars.filter((car) => car.id !== carToDelete));
      closeDeleteConfirmModal();
      toast.success('تم حذف السيارة بنجاح!');
    } catch (err: any) {
      console.error('Error deleting car:', err);
      toast.error(
        err.message.includes('Failed to fetch')
          ? 'فشل الاتصال بالخادم. تحقق من الشبكة وحاول مرة أخرى.'
          : err.message || 'حدث خطأ أثناء حذف السيارة.'
      );
    }
  };

  if (!user) return null;

  return (
    <div dir="rtl" className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

          <Link href="/cheak-out">
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow duration-300">
              <div className="text-blue-600 mb-4">
                <FaCar className="inline-block text-4xl" />
                <FaArrowLeft className="inline-block text-2xl ml-2" />
              </div>
              <h2 className="text-xl font-medium text-gray-800 mb-2">تشييك خروج السيارة</h2>
              <p className="text-sm text-gray-600">تسجيل بيانات خروج السيارة مع الصور</p>
            </div>
          </Link>

          {user.role === 'admin' && (
            <div
              onClick={openPlateModal}
              className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            >
              <div className="text-blue-600 mb-4">
                <FaTag className="inline-block text-4xl" />
              </div>
              <h2 className="text-xl font-medium text-gray-800 mb-2">إدارة اللوحات</h2>
              <p className="text-sm text-gray-600">اضافة و حذف و تعديل اللوحات</p>
            </div>
          )}

          {user.role === 'admin' && (
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
          )}

          {user.role === 'admin' && (
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
          )}

          {user.role === 'admin' && (
            <div
              onClick={openCarModal}
              className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            >
              <div className="text-blue-600 mb-4">
                <FaCarSide className="inline-block text-4xl" />
              </div>
              <h2 className="text-xl font-medium text-gray-800 mb-2">إدارة السيارات</h2>
              <p className="text-sm text-gray-600">إضافة وحذف السيارات</p>
            </div>
          )}
        </div>
      </div>

      {/* Plate Modal */}
      {isPlateModalOpen && user.role === 'admin' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-[500px] h-[500px] flex flex-col relative">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold text-gray-800">إدارة اللوحات</h2>
              <button
                onClick={closePlateModal}
                className="text-gray-600 hover:text-gray-800 focus:outline-none"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>

            {selectedPlate ? (
              <div className="flex-1 overflow-y-auto">
                <h3 className="text-lg font-medium text-gray-800 mb-2">تعديل لوحة</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الأحرف</label>
                    <input
                      type="text"
                      value={newPlateLetters}
                      onChange={(e) => setNewPlateLetters(e.target.value)}
                      placeholder="مثال: ب ر ا"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الأرقام</label>
                    <input
                      type="text"
                      value={newPlateNumbers}
                      onChange={(e) => setNewPlateNumbers(e.target.value)}
                      placeholder="مثال: 2792"
                      maxLength={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-3">
                  <button
                    onClick={() => setSelectedPlate(null)}
                    className="px-3 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleUpdatePlate}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    تحديث
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                {isAddPlateMode ? (
                  <div className="flex-1 overflow-y-auto">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">إضافة لوحة جديدة</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الأحرف</label>
                        <input
                          type="text"
                          value={newPlateLetters}
                          onChange={(e) => setNewPlateLetters(e.target.value)}
                          placeholder="مثال: ب ر ا"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الأرقام</label>
                        <input
                          type="text"
                          value={newPlateNumbers}
                          onChange={(e) => setNewPlateNumbers(e.target.value)}
                          placeholder="مثال: 2792"
                          maxLength={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-3">
                      <button
                        onClick={() => setIsAddPlateMode(false)}
                        className="px-3 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={handleAddPlate}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        إضافة
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex-1 mr-2">
                        <input
                          type="text"
                          value={searchPlateTerm}
                          onChange={(e) => setSearchPlateTerm(e.target.value)}
                          placeholder="ابحث عن لوحة (أحرف أو أرقام)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <button
                        onClick={() => setIsAddPlateMode(true)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        إضافة لوحة جديدة
                      </button>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-800 mb-2">قائمة اللوحات</h3>
                      <div
                        className="border border-gray-200 max-h-[250px] overflow-y-auto"
                        style={{ borderRadius: 0 }}
                      >
                        {filteredPlates.length === 0 ? (
                          <p className="text-sm text-gray-600 p-3">
                            {plates.length === 0 ? 'لا توجد لوحات متاحة.' : 'لا توجد لوحات مطابقة للبحث.'}
                          </p>
                        ) : (
                          <table className="min-w-full bg-white">
                            <thead className="sticky top-0 bg-white">
                              <tr>
                                <th className="px-3 py-2 border-b text-right">اللوحة</th>
                                <th className="px-3 py-2 border-b text-right">إجراءات</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredPlates.map((plate) => (
                                <tr key={plate.id}>
                                  <td className="px-3 py-2 border-b text-right">{plate.Name}</td>
                                  <td className="px-3 py-2 border-b text-right">
                                    <button
                                      onClick={() => handleEditPlate(plate)}
                                      className="text-blue-600 hover:underline mx-1"
                                    >
                                      تعديل
                                    </button>
                                    <button
                                      onClick={() => confirmDeletePlate(plate.id)}
                                      className="text-red-600 hover:underline mx-1"
                                    >
                                      حذف
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Branch Modal */}
      {isBranchModalOpen && user.role === 'admin' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-[500px] h-[500px] flex flex-col relative">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold text-gray-800">إدارة الفروع</h2>
              <button
                onClick={closeBranchModal}
                className="text-gray-600 hover:text-gray-800 focus:outline-none"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>

            {selectedBranch ? (
              <div className="flex-1 overflow-y-auto">
                <h3 className="text-lg font-medium text-gray-800 mb-2">تعديل فرع</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">اسم الفرع</label>
                    <input
                      type="text"
                      value={newBranchName}
                      onChange={(e) => setNewBranchName(e.target.value)}
                      placeholder="مثال: فرع الرياض"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-3">
                  <button
                    onClick={() => setSelectedBranch(null)}
                    className="px-3 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleUpdateBranch}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    تحديث
                  </button>
                </div>
              </div>
            ) : isAddBranchMode ? (
              <div className="flex-1 overflow-y-auto">
                <h3 className="text-lg font-medium text-gray-800 mb-2">إضافة فرع جديد</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">اسم الفرع</label>
                    <input
                      type="text"
                      value={newBranchName}
                      onChange={(e) => setNewBranchName(e.target.value)}
                      placeholder="مثال: فرع الرياض"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-3">
                  <button
                    onClick={() => setIsAddBranchMode(false)}
                    className="px-3 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleAddBranch}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    إضافة
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <div className="flex justify-end items-center mb-3">
                  <button
                    onClick={() => setIsAddBranchMode(true)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    إضافة فرع جديد
                  </button>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">قائمة الفروع</h3>
                  <div
                    className="border border-gray-200 max-h-[300px] overflow-y-auto"
                    style={{ borderRadius: 0 }}
                  >
                    {branches.length === 0 ? (
                      <p className="text-sm text-gray-600 p-3">لا توجد فروع متاحة.</p>
                    ) : (
                      <table className="min-w-full bg-white">
                        <thead className="sticky top-0 bg-white">
                          <tr>
                            <th className="px-3 py-2 border-b text-right">اسم الفرع</th>
                            <th className="px-3 py-2 border-b text-right">إجراءات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {branches.map((branch) => (
                            <tr key={branch.id}>
                              <td className="px-3 py-2 border-b text-right">{branch.Name}</td>
                              <td className="px-3 py-2 border-b text-right">
                                <button
                                  onClick={() => handleEditBranch(branch)}
                                  className="text-blue-600 hover:underline mx-1"
                                >
                                  تعديل
                                </button>
                                <button
                                  onClick={() => confirmDeleteBranch(branch.id)}
                                  className="text-red-600 hover:underline mx-1"
                                >
                                  حذف
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Employee Modal */}
      {isEmployeeModalOpen && user.role === 'admin' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-[650px] h-[500px] flex flex-col relative">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold text-gray-800">إدارة الموظفين</h2>
              <button
                onClick={closeEmployeeModal}
                className="text-gray-600 hover:text-gray-800 focus:outline-none"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>

            {selectedEmployee ? (
              <div className="flex-1 overflow-y-auto">
                <h3 className="text-lg font-medium text-gray-800 mb-2">تعديل موظف</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
    <input
      type="text"
      value={selectedEmployee.Name}
      onChange={(e) =>
        setSelectedEmployee({ ...selectedEmployee, Name: e.target.value })
      }
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">معرف الموظف</label>
    <input
      type="number"
      value={selectedEmployee.EmID}
      onChange={(e) =>
        setSelectedEmployee({ ...selectedEmployee, EmID: parseInt(e.target.value) })
      }
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
  {user?.EmID === 1 && (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
    <input
      type="text"
      value={selectedEmployee.password}
      onChange={(e) =>
        setSelectedEmployee({ ...selectedEmployee, password: e.target.value })
      }
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
)}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">الدور</label>
    <select
      value={selectedEmployee.role}
      onChange={(e) =>
        setSelectedEmployee({ ...selectedEmployee, role: e.target.value })
      }
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="admin">مدير</option>
      <option value="employee">موظف</option>
    </select>
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">الفرع</label>
    <select
      value={selectedEmployee.branch}
      onChange={(e) =>
        setSelectedEmployee({ ...selectedEmployee, branch: e.target.value })
      }
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {branches.map((branch) => (
        <option key={branch.id} value={branch.Name}>
          {branch.Name}
        </option>
      ))}
    </select>
  </div>
</div>
                <div className="flex justify-end gap-3 mt-3">
                  <button
                    onClick={() => setSelectedEmployee(null)}
                    className="px-3 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleUpdateEmployee}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    تحديث
                  </button>
                </div>
              </div>
            ) : isAddEmployeeMode ? (
              <div className="flex-1 overflow-y-auto">
                <h3 className="text-lg font-medium text-gray-800 mb-2">إضافة موظف جديد</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                    <input
                      type="text"
                      value={newEmployee.Name}
                      onChange={(e) => setNewEmployee({ ...newEmployee, Name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">معرف الموظف</label>
                    <input
                      type="number"
                      value={newEmployee.EmID}
                      onChange={(e) => setNewEmployee({ ...newEmployee, EmID: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
                    <input
                      type="text"
                      value={newEmployee.password}
                      onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الدور</label>
                    <select
                      value={newEmployee.role}
                      onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="admin">مدير</option>
                      <option value="employee">موظف</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الفرع</label>
                    <select
                      value={newEmployee.branch}
                      onChange={(e) => setNewEmployee({ ...newEmployee, branch: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.Name}>
                          {branch.Name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-3">
                  <button
                    onClick={() => setIsAddEmployeeMode(false)}
                    className="px-3 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleAddEmployee}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    إضافة
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <div className="flex justify-end items-center mb-3">
                  <button
                    onClick={() => setIsAddEmployeeMode(true)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    إضافة موظف جديد
                  </button>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">قائمة الموظفين</h3>
                  <div
                    className="border border-gray-200 max-h-[300px] overflow-y-auto"
                    style={{ borderRadius: 0 }}
                  >
                    {employees.length === 0 ? (
                      <p className="text-sm text-gray-600 p-3">لا توجد موظفين متاحين.</p>
                    ) : (
                      <table className="min-w-full bg-white">
                        <thead className="sticky top-0 bg-white">
                          <tr>
                            <th className="px-3 py-2 border-b text-right">الاسم</th>
                            <th className="px-3 py-2 border-b text-right">معرف الموظف</th>
                            <th className="px-3 py-2 border-b text-right">الدور</th>
                            <th className="px-3 py-2 border-b text-right">الفرع</th>
                            <th className="px-3 py-2 border-b text-right">إجراءات</th>
                          </tr>
                        </thead>
                        <tbody>
  {employees
    .filter((employee) => user?.EmID === 1 || employee.EmID !== 1)
    .map((employee) => (
      <tr key={employee.id}>
        <td className="px-3 py-2 border-b text-right">{employee.Name}</td>
        <td className="px-3 py-2 border-b text-right">{employee.EmID}</td>
        <td className="px-3 py-2 border-b text-right">
          {employee.role === 'admin' ? 'مدير' : 'موظف'}
        </td>
        <td className="px-3 py-2 border-b text-right">{employee.branch}</td>
        <td className="px-3 py-2 border-b text-right">
          <button
            onClick={() => handleEditEmployee(employee)}
            className="text-blue-600 hover:underline mx-1"
          >
            تعديل
          </button>
          <button
            onClick={() => confirmDeleteEmployee(employee.id)}
            className="text-red-600 hover:underline mx-1"
          >
            حذف
          </button>
        </td>
      </tr>
    ))}
</tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Car Modal */}
      {isCarModalOpen && user.role === 'admin' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-[500px] h-[500px] flex flex-col relative">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold text-gray-800">إدارة السيارات</h2>
              <button
                onClick={closeCarModal}
                className="text-gray-600 hover:text-gray-800 focus:outline-none"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>

            {isAddCarMode ? (
              <div className="flex-1 overflow-y-auto">
                <h3 className="text-lg font-medium text-gray-800 mb-2">إضافة سيارة جديدة</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الشركة</label>
                    <input
                      type="text"
                      value={newCarCompany}
                      onChange={(e) => setNewCarCompany(e.target.value)}
                      placeholder="مثال: هيونداي"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الموديل</label>
                    <input
                      type="text"
                      value={newCarModel}
                      onChange={(e) => setNewCarModel(e.target.value)}
                      placeholder="مثال: اكسنت"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-3">
                  <button
                    onClick={() => setIsAddCarMode(false)}
                    className="px-3 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleAddCar}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    إضافة
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <div className="flex justify-end items-center mb-3">
                  <button
                    onClick={() => setIsAddCarMode(true)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    إضافة سيارة جديدة
                  </button>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">قائمة السيارات</h3>
                  <div
                    className="border border-gray-200 max-h-[300px] overflow-y-auto"
                    style={{ borderRadius: 0 }}
                  >
                    {cars.length === 0 ? (
                      <p className="text-sm text-gray-600 p-3">لا توجد سيارات متاحة.</p>
                    ) : (
                      <table className="min-w-full bg-white">
                        <thead className="sticky top-0 bg-white">
                          <tr>
                            <th className="px-3 py-2 border-b text-right">اسم السيارة</th>
                            <th className="px-3 py-2 border-b text-right">إجراءات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cars.map((car) => (
                            <tr key={car.id}>
                              <td className="px-3 py-2 border-b text-right">{car.Name}</td>
                              <td className="px-3 py-2 border-b text-right">
                                <button
                                  onClick={() => confirmDeleteCar(car.id)}
                                  className="text-red-600 hover:underline mx-1"
                                >
                                  حذف
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">تأكيد الحذف</h2>
            <p className="text-sm text-gray-600 mb-4">
              هل أنت متأكد من أنك تريد حذف{' '}
              {employeeToDelete
                ? 'هذا الموظف'
                : carToDelete
                ? 'هذه السيارة'
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
                  else if (carToDelete) handleDeleteCar();
                  else if (plateToDelete) handleDeletePlate();
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