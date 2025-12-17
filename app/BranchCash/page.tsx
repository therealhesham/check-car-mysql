'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FaWallet, FaHandHoldingUsd, FaHistory, FaPlus, FaSave, FaList, FaCheck, FaTimes, FaTrash,FaChevronDown,FaExclamationTriangle,FaEdit } from 'react-icons/fa';
import Navbar from '@/public/components/navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import { PermissionGuard } from '../ROLE/PermissionGuard';
import { usePermissions } from '../ROLE/usePermissions';


// تعريف خيارات التنسيق لضمان توقيت السعودية (GMT+3)
const SAUDI_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  timeZone: 'Asia/Riyadh',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true // (لعرض صباحاً/مساءً)
};

// ... (Interfaces: ExpenseItem, CashHistoryEntry, PendingHandoverData)
// (الرجاء التأكد من وجود هذه الـ interfaces لديك من الخطوات السابقة)

interface ExpenseItem {
  id?: number;
  contractNumber: string;
  notes: string;
  amount: string; 
}

interface CashHistoryEntry {
    id: number;
    amount: number;
    notes: string | null;
    timestamp: string; 
    createdAt: string;
    type: 'receive' | 'handover'; 
   sender_employee: { id: number, Name: string } | null;
    receiver_employee: { id: number, Name: string } | null;
    status: 'accepted' | 'pending' | 'rejected'; // <-- (جديد)
    rejection_reason: string | null; // <-- (جديد)
    expenses?: ExpenseItem[];
    requires_review: boolean; // (للتنبيه)
  }

interface PendingHandoverData {
  id: number;
  amount: number;
  notes: string | null;
  timestamp: string;
  employee: string; 
  expenses?: ExpenseItem[];
  type: 'feed' | 'handover';
}
// ---------------------------------------------------------------


export default function BranchCashPage() {
  const { hasRole } = usePermissions();
  const isAccountant = hasRole('accountant');
  // --- حالات الواجهة (UI States) ---
  const [isLoading, setIsLoading] = useState(true);
  const [handoverNotes, setHandoverNotes] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [isExpensesOpen, setIsExpensesOpen] = useState<boolean>(false);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    { contractNumber: '', notes: '', amount: '' },
  ]);

  // --- حالات البيانات (Data States) ---
  const [history, setHistory] = useState<CashHistoryEntry[]>([]);
  const [employeesList, setEmployeesList] = useState<{ id: string; name: string }[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<PendingHandoverData[]>([]);

  // ▼▼▼ 1. (تم الإرجاع) حالة العهدة الحالية ▼▼▼
  const [currentCash, setCurrentCash] = useState<number | ''>('');
  const [branchName, setBranchName] = useState<string>('');
  const [isFeedModalOpen, setIsFeedModalOpen] = useState(false);
  const [feedAmount, setFeedAmount] = useState<number | ''>('');
  const [feedEmployeeId, setFeedEmployeeId] = useState<string>('');
  const [feedNotes, setFeedNotes] = useState('تغذية عهدة من الإدارة/المحاسب');

  
 // ▼▼▼ حالات "القبول مع تصحيح" ▼▼▼
   const [correctingCardId, setCorrectingCardId] = useState<number | null>(null); // (ID الكرت المفتوح للتصحيح)
   const [correctionAmount, setCorrectionAmount] = useState<number | ''>(''); // (المبلغ المصحح)
  // (جديد) حالات "حل الإشكالية"
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolveAmount, setResolveAmount] = useState<number | ''>('');
  const [resolveEmployeeId, setResolveEmployeeId] = useState<string>(''); 
  const [resolveNotes, setResolveNotes] = useState('لقد تم حل الاشكالية وتغذية الفرع من جديد');
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [branchStatus, setBranchStatus] = useState('ok'); // (ok, rejected)
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
  
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  


  // ▼▼▼ (جديد) حالات خاصة بداش بورد المحاسب ▼▼▼
  // هل نحن في وضع عرض القائمة أم التفاصيل؟ (للموظف العادي دائماً تفاصيل)
  const [viewMode, setViewMode] = useState<'overview' | 'detail'>('detail'); 
  // قائمة ملخص الفروع (للعرض في الصفحة الرئيسية للمحاسب)
  const [branchesSummary, setBranchesSummary] = useState<any[]>([]);
  // الفرع الذي يقوم المحاسب باستعراضه حالياً
  const [selectedBranchForAccountant, setSelectedBranchForAccountant] = useState<string | null>(null);


  // ... (getAuthData, getAuthHeaders - تأكد أنها تستخدم 'selectedBranch' والتشفير)
  const getAuthData = () => {
    if (typeof window === 'undefined') return null;
    const userDataString = localStorage.getItem('user');
    if (!userDataString) {
      toast.error('لم يتم العثور على بيانات الموظف. الرجاء تسجيل الدخول.');
      return null;
    }
    const userData = JSON.parse(userDataString);
    if (!userData.id || !userData.selectedBranch) { // <-- التأكد من استخدام selectedBranch
      toast.error('بيانات الموظف غير مكتملة أو لم يتم اختيار الفرع.');
      return null;
    }
    setBranchName(userData.selectedBranch);
    setCurrentUserId(parseInt(userData.id, 10)); // (تخزين ID المستخدم الحالي)
    return {
      userId: userData.id,
      userBranch: userData.selectedBranch, 
    };
  };

  
const getAuthHeaders = useCallback(() => {
  const authData = getAuthData();
  if (!authData) return null;

  const headers: any = {
    'Content-Type': 'application/json',
    'x-user-id': authData.userId,
    'x-user-branch': encodeURIComponent(authData.userBranch), // الفرع الأصلي دائماً موجود
  };

  // ▼▼▼ التعديل الجوهري هنا ▼▼▼
  // إذا كان المستخدم محاسب + يشاهد التفاصيل + يوجد فرع مختار => نرسل الفرع المستهدف
  if (isAccountant && viewMode === 'detail' && selectedBranchForAccountant) {
      headers['x-target-branch'] = encodeURIComponent(selectedBranchForAccountant);
  }

  return headers;
}, [isAccountant, viewMode, selectedBranchForAccountant]); // ⚠️ هام جداً: إضافة الاعتماديات هنا

// (تعديل) عند ضغط المحاسب على "عرض التفاصيل"
const handleViewBranchDetails = (targetBranchName: string) => {
  setIsLoading(true);
  setSelectedBranchForAccountant(targetBranchName);
  
  // ▼▼▼ التعديل هنا: نغير الاسم المعروض ليصبح اسم الفرع المختار ▼▼▼
  setBranchName(targetBranchName); 
  
  setViewMode('detail');
  // (ملاحظة: fetchPageData سيتم استدعاؤها تلقائياً عبر الـ useEffect كما اتفقنا سابقاً)
};
 // (تعديل) العودة للقائمة الرئيسية
 const handleBackToOverview = () => {
  setSelectedBranchForAccountant(null);
  setViewMode('overview');
  
  // ▼▼▼ التعديل هنا: إعادة الاسم لفرع المحاسب الأصلي (من التوكن/Local Storage) ▼▼▼
  const authData = getAuthData();
  if (authData) {
      setBranchName(authData.userBranch);
  }
  
  fetchBranchesSummary(); 
};
  // ---------------------------------------------------------------


  // --- (تعديل) دالة جلب البيانات الرئيسية (GET) ---
  // --- (تعديل) دالة جلب البيانات الرئيسية (GET) ---
  const fetchPageData = useCallback(async () => {
    // 1. شرط جديد: إذا كان محاسب وفي وضع التفاصيل ولم يختر فرعاً بعد، نتوقف
    if (isAccountant && viewMode === 'detail' && !selectedBranchForAccountant) {
      return;
    }

    setIsLoading(true);
    // سيقوم بجلب الهيدر الصحيح (بما في ذلك x-target-branch) بناءً على التعديلات السابقة
    const headers = getAuthHeaders(); 
    
    if (!headers) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/Branch_Cash', { 
        method: 'GET',
        headers: headers,
      });

      if (!response.ok) {
        throw new Error('فشل في جلب البيانات');
      }
      
      const data = await response.json();
      // إذا كنا محاسباً ولدينا فرع مختار، نثبت الاسم عليه
if (isAccountant && selectedBranchForAccountant) {
  setBranchName(selectedBranchForAccountant);
}
      
      // تحديث الحالات
      setBranchStatus(data.branchStatus || 'ok');
      setTimeRemaining(data.timeRemainingForFreeze || null);

      // أ. تحديث قائمة الموظفين
      setEmployeesList(data.employeesList.map((emp: any) => ({
        id: String(emp.id),
        name: emp.Name,
      })));
      
      // ب. تحديث السجل
      setHistory(data.history.map((item: any) => ({
          id: item.id,
          amount: parseFloat(item.amount),
          notes: item.notes,
          
          // (التاريخ المعروض خارجياً)
          timestamp: new Date(item.processed_at || item.created_at).toLocaleString('ar-EG', SAUDI_TIME_OPTIONS),
          // (التاريخ المعروض داخلياً)
          createdAt: new Date(item.created_at).toLocaleString('ar-EG', SAUDI_TIME_OPTIONS),
          
          type: item.type === 'feed' ? 'receive' : 'handover',
          sender_employee: item.sender_employee,
          receiver_employee: item.receiver_employee,
          status: item.status,
          requires_review: item.requires_review, 
          rejection_reason: item.rejection_reason,
          expenses: item.expenses.map((exp: any) => ({
              id: exp.id,
              notes: exp.notes,
              amount: parseFloat(exp.amount).toString(),
              contractNumber: exp.contract_number || '', 
          })),
      })));

      // ج. تحديث العهد المعلقة
      if (data.pendingTransactions && Array.isArray(data.pendingTransactions)) {
        setPendingTransactions(data.pendingTransactions.map((tx: any) => ({
          id: tx.id,
          amount: parseFloat(tx.amount),
          notes: tx.notes,
          employee: tx.sender_employee.Name,
          timestamp: new Date(tx.created_at).toLocaleString('ar-EG', SAUDI_TIME_OPTIONS),
          type: tx.type, // 'feed' or 'handover'
          expenses: tx.expenses.map((exp: any) => ({
            id: exp.id,
            notes: exp.notes,
            amount: parseFloat(exp.amount).toString(),
            contractNumber: exp.contract_number || '',
          })),
        })));
      } else {
        setPendingTransactions([]); 
      }
      
      setCurrentCash(data.currentCash || 0);

    } catch (error) {
      console.error(error);
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders, isAccountant, viewMode, selectedBranchForAccountant]); // ⚠️ تم إضافة الاعتماديات الجديدة هنا

// (تعديل) دالة لجلب ملخص أرصدة كل الفروع للمحاسب
const fetchBranchesSummary = async () => {
  setIsLoading(true);
  try {
    const authData = getAuthData();
    if (!authData) return;
    
    // ▼▼▼ التعديل هنا: إضافة ?action=get_all_branches_summary للرابط ▼▼▼
    const response = await fetch('/api/Branch_Cash?action=get_all_branches_summary', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': authData.userId,
        'x-user-branch': encodeURIComponent(authData.userBranch), 
      },
    });

    if (response.ok) {
      const data = await response.json();
      // التأكد من أن البيانات موجودة وإلا وضع مصفوفة فارغة
      setBranchesSummary(data.branches || []); 
    } else {
      // إضافة التعامل مع الخطأ في حال لم تكن الاستجابة OK
      console.error("Failed to fetch branches summary");
      toast.error('فشل في جلب قائمة الفروع');
    }
  } catch (error) {
    console.error(error);
    toast.error('فشل في جلب ملخص الفروع');
  } finally {
    setIsLoading(false);
  }
};

  // (معدل) تحديد وضع العرض الأولي وجلب البيانات المناسبة
  useEffect(() => {
    if (isAccountant) {
      setViewMode('overview'); // المحاسب يبدأ بصفحة الفروع
      fetchBranchesSummary();  // جلب ملخص الأرصدة
    } else {
      setViewMode('detail');   // الموظف يبدأ بصفحته فوراً
      fetchPageData();
    }
  }, [isAccountant]); // يتم التنفيذ عند تغيير الدور أو التحميل

  // أضف هذا الـ Effect الجديد
useEffect(() => {
  // يعمل فقط إذا كنا في وضع التفاصيل
  if (viewMode === 'detail') {
    // الحالة أ: محاسب واختار فرعاً
    if (isAccountant && selectedBranchForAccountant) {
       fetchPageData();
    }
    // الحالة ب: موظف عادي (ليس محاسب)
    else if (!isAccountant) {
       fetchPageData();
    }
  }
}, [viewMode, isAccountant, selectedBranchForAccountant, fetchPageData]);

  // (جديد) هذا يراقب تغيير الفرع المختار، وبمجرد تغيره يجلب البيانات الجديدة
useEffect(() => {
  if (viewMode === 'detail' && selectedBranchForAccountant) {
    fetchPageData();
  }
}, [selectedBranchForAccountant, viewMode, fetchPageData]);


  // ... (handleHandover, handleAcceptHandover, handleRejectHandover)
  // (تأكد من وجود هذه الدوال من الكود السابق)

  const handleHandover = async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    if (remainingCashForHandover < 0) {
          toast.error('خطأ: إجمالي المصروفات أكبر من العهدة الحالية.');
          return;
      }
    if (!selectedEmployeeId) {
      toast.error('الرجاء اختيار الموظف المستلم.');
      return;
    }

    const validExpenses = expenses
      .filter(exp => exp.notes && exp.amount) 
      .map(exp => ({ ...exp, amount: String(parseFloat(exp.amount) || 0) })); 

    setIsLoading(true);
    try {
      const response = await fetch('/api/Branch_Cash', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          action: 'handover' as const,
          amount: remainingCashForHandover,
          notes: handoverNotes,
          receiver_employee_id: parseInt(selectedEmployeeId),
          expenses: validExpenses,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'فشل في تسليم العهدة');
      }

      toast.success('تم تسجيل تسليم العهدة بنجاح!');
      setHandoverNotes('');
      setSelectedEmployeeId('');
      setExpenses([{ contractNumber: '', notes: '', amount: '' }]);
      setIsExpensesOpen(false);
      
      await fetchPageData();

    } catch (error) {
      console.error(error);
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (transactionId: number) => {
    const headers = getAuthHeaders();
    if (!headers) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/Branch_Cash', {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({
          action: 'accept' as const,
          transactionId: transactionId, // <-- (استخدام المتغير)
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'فشل في قبول العهدة');
      }

      toast.success('تم قبول العهدة بنجاح');
      await fetchPageData(); // (إعادة تحميل كل البيانات)

    } catch (error) {
      console.error(error);
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };
  
 // (معدل) دالة لإلغاء عملية التصحيح
   const handleCancelCorrection = () => {
      setCorrectingCardId(null);
      setCorrectionAmount(''); // (يستخدم الحالة الصحيحة)
    };
  
    // (معدل) دالة لتأكيد التصحيح (ترسل 'reject' مع المبلغ الجديد)
    const handleConfirmCorrection = async () => {
      const headers = getAuthHeaders();
      // 1. التأكد من وجود الطلب والسبب
      if (!headers || !correctingCardId) return; // (يستخدم الحالة الصحيحة)
      
      if (typeof correctionAmount !== 'number' || correctionAmount < 0) { // (يستخدم الحالة الصحيحة)
        toast.error('الرجاء إدخال المبلغ الذي وجدته (يمكن أن يكون 0).');
        return;
      }
  
      setIsLoading(true);
      try {
        const response = await fetch('/api/Branch_Cash', {
          method: 'PATCH',
          headers: headers,
          body: JSON.stringify({
            action: 'reject' as const,
            transactionId: correctingCardId, // (يستخدم الحالة الصحيحة)
            rejection_reason: "عدم تطابق المبلغ", // (السبب التلقائي)
            actual_amount: correctionAmount, // (يستخدم الحالة الصحيحة)
          }),
        });
  
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'فشل في تصحيح العهدة');
        }
  
        toast.success('تم قبول العهدة بالمبلغ المصحح');
        handleCancelCorrection(); // (يستدعي الدالة الصحيحة)
        await fetchPageData(); 
  
      } catch (error) {
        console.error(error);
        toast.error((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    };


  /**
   * (جديد) دالة إرسال التغذية من المحاسب للموظف
   */
  const handleFeedCash = async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    // التحقق من المدخلات
    if (typeof feedAmount !== 'number' || feedAmount <= 0) {
      toast.error('الرجاء إدخال مبلغ تغذية صحيح.');
      return;
    }
    if (!feedEmployeeId) {
      toast.error('الرجاء اختيار الموظف المستلم للعهدة.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/Branch_Cash', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          action: 'feed' as const,
          amount: feedAmount,
          receiver_employee_id: parseInt(feedEmployeeId),
          notes: feedNotes, 
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'فشل في إرسال التغذية');
      }

      toast.success('تم إرسال التغذية بنجاح (بانتظار قبول الموظف)');
      
      closeFeedModal(); // (إغلاق وتنظيف المودال)
      
      // (لا نحتاج لإعادة جلب البيانات هنا لأن الرصيد لن يتغير
      // إلا بعد قبول الموظف)

    } catch (error) {
      console.error(error);
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // (جديد) دالة حل الإشكالية (للمحاسب)
  const handleResolveIssue = async () => {
    const headers = getAuthHeaders();
    if (!headers) return;
    
    if (typeof resolveAmount !== 'number' || resolveAmount <= 0) {
      toast.error('الرجاء إدخال مبلغ التسوية الصحيح.');
      return;
    }
    
    // (التحقق الجديد)
    if (!resolveEmployeeId) {
      toast.error('الرجاء اختيار الموظف المستلم للتسوية.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/Branch_Cash', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          action: 'resolve_issue' as const,
          amount: resolveAmount,
          receiver_employee_id: parseInt(resolveEmployeeId), // (تمت الإضافة)
          notes: resolveNotes, // <-- (أضف هذا السطر)
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'فشل في حل الإشكالية');
      }

      toast.success('تم إرسال التسوية للموظف بنجاح'); // (تغيير الرسالة)
      closeResolveModal(); // (إغلاق وتنظيف المودال)
      await fetchPageData(); 

    } catch (error) {
      console.error(error);
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // (جديد) دالة لإغلاق مودال التغذية (مع تنظيف الحقول)
  const closeFeedModal = () => {
    setIsFeedModalOpen(false);
    setFeedAmount('');
    setFeedEmployeeId('');
    setFeedNotes('تغذية عهدة من الإدارة/المحاسب'); // (إعادة تعيين الملاحظة)
  };

  // (جديد) دالة لإغلاق مودال حل الإشكالية (مع تنظيف الحقول)
  const closeResolveModal = () => {
    setIsResolveModalOpen(false);
    setResolveAmount('');
    setResolveEmployeeId('');
    setResolveNotes('لقد تم حل الاشكالية وتغذية الفرع من جديد'); // (إعادة تعيين الملاحظة)
  };

  
  // ---------------------------------------------------------------


  // --- (دوال مساعدة كما هي) ---
  const employeeOptions = employeesList.map((emp) => ({
    value: emp.id,
    label: emp.name,
  }));
  
  const selectedEmployeeOption = employeeOptions.find(
    (option) => option.value === selectedEmployeeId
  );

  const totalExpenses = expenses.reduce((total, exp) => {
    const amount = parseFloat(exp.amount) || 0;
    return total + amount;
  }, 0);
  const remainingCashForHandover = (typeof currentCash === 'number' ? currentCash : 0) - totalExpenses;

  const handleOpenExpenses = () => {
    setIsExpensesOpen(true);
    if (expenses.length === 0) {
      setExpenses([{ contractNumber: '', notes: '', amount: '' }]);
    }
  };

  
 
  
 // (تحديد ما إذا كان هناك طلب "استلام وردية" معلق تحديداً)
 const hasPendingHandover = pendingTransactions.some(t => t.type === 'handover');

// --- (2) منطق تعطيل قسم التسليم ---

  // (أ. هل هناك طلبات معلقة؟)
  const hasAnyPendingTransaction = pendingTransactions.length > 0;
  const hasPendingHandoverToReceive = pendingTransactions.some(t => t.type === 'handover');
  // (يتحقق من السجل بالكامل بحثاً عن أي شيء معلق)
  const hasAnyBranchPending = history.some(t => t.status === 'pending');

  // (ب. هل المستخدم هو "مالك العهدة" الحالي؟)
  // (نبحث عن آخر حركة "مقبولة" في السجل)
  const lastAcceptedTx = history.find(tx => tx.status === 'accepted');
  const lastReceiverId = lastAcceptedTx ? lastAcceptedTx.receiver_employee?.id : null;
  
  // (الشرط: أنت المالك إذا كان ID مطابقاً، أو إذا لم يكن هناك مستلم سابق (رصيد افتتاحي) وكنت مشرفاً)
  const isCashOwner = (lastReceiverId === currentUserId) || 
                      (!lastAcceptedTx && (hasRole('accountant') || hasRole('admin') || hasRole('super_admin') || hasRole('owner')));


  // (ج. الشرط النهائي للتعطيل)
  const isHandoverDisabled = hasAnyBranchPending || branchStatus === 'frozen' || isAccountant || !isCashOwner; 

  // (د. تحديد رسالة التعطيل المناسبة - الأولوية للأهم)
  let handoverDisabledMessage = '';
  if (isAccountant) {
    handoverDisabledMessage = 'كمحاسب، لا يمكنك تسليم العهدة (دورك هو التغذية/التسوية).';
  } else if (branchStatus === 'frozen') { 
    handoverDisabledMessage = 'الفرع مجمد بسبب إشكالية سابقة. يرجى التواصل مع الإدارة.';
  } else if (hasAnyBranchPending) {
    handoverDisabledMessage = 'يوجد طلب تسليم أو تغذية معلق في الفرع. يجب معالجته أولاً.';
  } else if (!isCashOwner) {
      // (إذا لم يكن المالك، نعرض له اسم المالك الحقيقي)
      const correctUser = lastAcceptedTx?.receiver_employee?.Name || 'موظف غير محدد';
      handoverDisabledMessage = `لا يمكنك تسليم العهدة. العهدة حالياً بحوزة: ${correctUser}`;
  }

  // (دالة تنسيق الوقت - كما هي)
  const formatTimeRemaining = (ms: number | null) => {
    if (ms === null || ms <= 0) return 'الوقت المتبقي: 0 (سيتم التجميد قريباً)';
    const totalHours = Math.floor(ms / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    return `الوقت المتبقي للمراجعة: ${days} يوم و ${hours} ساعة`;
  };


  // --- العرض (Render) -----------------------------------------------------------------------------------------
  return (
    <div dir="rtl" className="min-h-screen bg-gray-100">
      <Navbar />
     {/* (مؤشر تحميل معدل) */}
     {isLoading && (
        <div 
          className="fixed inset-0 flex flex-col items-center justify-center z-50"
          style={{
            // (1) خلفية بلور شفافة
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            backgroundColor: 'rgba(0, 0, 0, 0.3)' 
          }}
        >
          {/* (2) اللودر الدائري الجميل */}
          <div 
            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"
          ></div>
          {/* (3) النص المرافق) */}
          <p className="text-white text-lg mt-4">جار التحميل...</p>
        </div>
      )}

<div className="bg-white min-h-screen">
        {/* --- Header (رأس الصفحة المتغير) --- */}
        <div className="container mx-auto px-4 pt-8 pb-6 bg-gray-50 border-b border-gray-200 relative">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
             <div className="flex-1 text-center md:text-right">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                  {viewMode === 'overview' ? 'لوحة تحكم أرصدة الفروع' : `إدارة عهدة - ${branchName}`}
                </h1>
                <p className="text-sm text-gray-600">
                  {viewMode === 'overview' 
                    ? 'نظرة عامة على أرصدة وحالة جميع الفروع (للمحاسب)' 
                    : 'إدارة العهدة الحالية وتسليمها وعرض السجل'}
                </p>
             </div>
             
             {/* زر العودة للمحاسب فقط عند وجوده في صفحة التفاصيل */}
             {isAccountant && viewMode === 'detail' && (
               <button 
                 onClick={handleBackToOverview}
                 className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors shadow-sm"
               >
                 <FaHistory className="transform rotate-180" /> 
                 <span>عودة لقائمة الفروع</span>
               </button>
             )}
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          
          {/* ================================================================================= */}
          {/* ▼▼▼ الحالة 1: عرض القائمة Grid (تظهر للمحاسب فقط في البداية) ▼▼▼ */}
          {/* ================================================================================= */}
          {viewMode === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {branchesSummary.length > 0 ? (
                branchesSummary.map((branch, idx) => (
                  <div key={idx} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-gray-800">{branch.name}</h3>
                        {/* حالة الفرع */}
                        {branch.status === 'frozen' ? (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                            <FaExclamationTriangle /> مجمد
                          </span>
                        ) : branch.pending_requests > 0 ? (
                          <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                            <FaHistory /> طلبات معلقة ({branch.pending_requests})
                          </span>
                        ) : (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                            <FaCheck /> نشط
                          </span>
                        )}
                      </div>
                      
                      <div className="text-center py-6 bg-gray-50 rounded-lg mb-4 border border-gray-100">
                         <p className="text-gray-500 text-sm mb-1">الرصيد الحالي</p>
                         <p className={`text-3xl font-bold ${Number(branch.balance) < 0 ? 'text-red-600' : 'text-gray-800'}`}>
                           {Number(branch.balance).toLocaleString()} <span className="text-base font-normal text-gray-500">ر.س</span>
                         </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleViewBranchDetails(branch.name)}
                      className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 border border-blue-100"
                    >
                      <FaList /> إدارة واستعراض السجل
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                   <FaList className="text-4xl text-gray-300 mx-auto mb-3" />
                   <p className="text-gray-500">جاري تحميل الفروع أو لا توجد فروع متاحة...</p>
                </div>
              )}
            </div>
          )}


          {/* ================================================================================= */}
          {/* ▼▼▼ الحالة 2: عرض التفاصيل (الواجهة الأصلية للفرع) ▼▼▼ */}
          {/* ================================================================================= */}
          {viewMode === 'detail' && (
            <div className="animate-fade-in-up space-y-8"> 
               
            {/* 1. قسم العهدة الحالية */}
            <div className="flex justify-start">
                  <div className="w-full max-w-md">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                      
                      {/* رأس الكارد */}
                      <div className="flex justify-between items-center gap-3 mb-4">
                          <div className="flex items-center gap-3">
                          <div className="bg-green-100 p-3 rounded-lg">
                            <FaWallet className="text-green-600 text-2xl" />
                          </div>
                          <h2 className="text-xl font-semibold text-gray-800">
                            عهدة: <span className="text-blue-600">{branchName}</span>
                          </h2>
                        </div>
                      </div>
                      
                      {/* عرض الرصيد والحالة */}
                      {branchStatus === 'frozen' ? (
                        <div className="text-center py-4 border-t border-gray-50 mt-4 text-red-700">
                          <FaTimes className="text-4xl mx-auto mb-3 opacity-50" />
                          <p className="font-semibold text-lg">العهدة مجمدة</p>
                          <p className="text-sm">بسبب وجود إشكالية سابقة، الرصيد 0. يرجى التواصل مع الإدارة.</p>
                        </div>
                      ) : pendingTransactions.some(t => t.type === 'handover') ? (
                        <div className="text-center py-4 border-t border-gray-50 mt-4 text-orange-600">
                          <FaHistory className="text-4xl mx-auto mb-3 opacity-50" />
                          <p className="font-semibold">عهدة الفرع معلقة بانتظار الموافقة</p>
                        </div>
                      ) : (
                        <>
                          {typeof currentCash === 'number' && currentCash >= 0 ? (
                            <div className="text-center py-4 border-t border-gray-50 mt-4">
                              <p className="text-3xl font-bold text-gray-800">{currentCash.toLocaleString()} ر.س</p>
                              <p className="text-sm text-gray-600 mt-2">الرصيد الحالي للعهدة في الفرع</p>
                            </div>
                          ) : (
                            <div className="text-center py-4 border-t border-gray-50 mt-4 text-gray-500">
                              <FaWallet className="text-4xl mx-auto mb-3 opacity-50" />
                              <p>لا توجد عهدة حالياً</p> 
                            </div>
                          )}
                          
                          {branchStatus === 'review_pending' && (
                            <div className="text-center py-3 border-t border-yellow-200 mt-4 bg-yellow-50 rounded-lg">
                              <FaExclamationTriangle className="text-2xl mx-auto mb-2 text-yellow-500" />
                              <p className="font-semibold text-yellow-700 text-sm">العهدة تتطلب مراجعة</p>
                              <p className="text-xs text-yellow-600">{formatTimeRemaining(timeRemaining)}</p>
                            </div>
                          )}
                        </>
                      )}
                      
                      {/* أزرار التحكم (للمحاسب) */}
                      <div className="mt-4 flex justify-end">
                        <PermissionGuard permission="canFeedCash">
                          {(branchStatus === 'frozen' || branchStatus === 'review_pending') && (
                              <button
                              onClick={() => setIsResolveModalOpen(true)}
                              className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                              title="حل إشكالية العهدة"
                            >
                              <FaExclamationTriangle />
                              <span>{branchStatus === 'frozen' ? 'حل الإشكالية' : 'مراجعة وتسوية'}</span>
                            </button>
                          )}

                          {branchStatus === 'ok' && (
                            <button
                              onClick={() => setIsFeedModalOpen(true)}
                              className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                              title="تغذية العهدة"
                            >
                              <FaSave />
                              <span>تغذية</span>
                            </button>
                          )}
                        </PermissionGuard>
                      </div>

                    </div>
                  </div>
            </div>
            
            {/* 2. قسم التسليم والاستلام */}
            <div>
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">إدارة التسليم والاستلام</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                  {/* (اليمين) تسليم العهدة */}
                  <div className="pb-6 lg:pb-0 lg:border-l lg:border-gray-200 lg:pl-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="bg-blue-100 p-3 rounded-lg">
                            <FaHandHoldingUsd className="text-blue-600 text-2xl" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800">تسليم العهدة للوردية التالية</h3>
                        </div>

                        <div className="relative">
                          {isHandoverDisabled && (
                            <div className="absolute inset-0 bg-gray-50 bg-opacity-90 flex items-center justify-center z-10 rounded-lg border border-gray-200">
                              <p className="text-gray-600 font-semibold p-4 text-center text-sm leading-relaxed">
                                {handoverDisabledMessage}
                              </p>
                            </div>
                          )}

                          <div className={isHandoverDisabled ? 'opacity-40 pointer-events-none filter blur-[1px]' : ''}>
                            {/* عرض المبلغ المتبقي */}
                            <div className="space-y-4 mb-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                                  المبلغ المتبقي للتسليم (ريال)
                                </label>
                                <div className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50">
                                  <p className="text-xl font-bold text-gray-800 text-center">
                                    {remainingCashForHandover.toLocaleString()} ر.س
                                  </p>
                                  {totalExpenses > 0 && (
                                     <p className="text-xs text-gray-500 text-center mt-1">
                                       (العهدة: {typeof currentCash === 'number' ? currentCash.toLocaleString() : 0} ر.س - المصروفات: {totalExpenses.toLocaleString()} ر.س)
                                     </p>
                                  )}
                                </div>
                              </div>

                              {/* حقل الملاحظات */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">ملاحظات عامة (اختياري)</label>
                                <textarea
                                  value={handoverNotes}
                                  onChange={(e) => setHandoverNotes(e.target.value)}
                                  placeholder="مثال: تم التسليم للموظف أحمد"
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  rows={2}
                                />
                              </div>
                              
                              {/* اختيار الموظف */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">الموظف المستقبل</label>
                                <Select
                                  options={employeeOptions}
                                  value={selectedEmployeeOption}
                                  onChange={(selectedOption) =>
                                    setSelectedEmployeeId(selectedOption ? selectedOption.value : '')
                                  }
                                  placeholder="ابحث واختر موظفًا..."
                                  isSearchable={true}
                                  isRtl={true}
                                />
                              </div>
                            </div>
                            
                            {/* زر المصروفات */}
                            <button
                              type="button"
                              onClick={handleOpenExpenses}
                              className="w-full flex items-center justify-center gap-2 bg-amber-50 text-amber-700 border border-amber-200 py-2.5 rounded-lg hover:bg-amber-100 transition-colors mb-6"
                            >
                              <FaPlus /> بند المصروفات
                            </button>
          
                            {/* قسم المصروفات */}
                            {isExpensesOpen && (
                              <div className="border-t border-gray-200 pt-4 mt-4 mb-6">
                                <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center gap-2">
                                  <FaList className="text-amber-600" /> المصروفات من العهدة
                                </h3>
                                
                                {expenses.map((exp, idx) => (
                                  <div key={idx} className="flex items-start justify-between gap-3 mb-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-grow">
                                      <div>
                                        <label className="block text-xs text-gray-600 mb-1">رقم العقد</label>
                                        <input
                                          type="text"
                                          value={exp.contractNumber}
                                          onChange={(e) =>
                                            setExpenses((prev) =>
                                              prev.map((item, i) => (i === idx ? { ...item, contractNumber: e.target.value } : item))
                                            )
                                          }
                                          className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
                                          placeholder="12345"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs text-gray-600 mb-1">ملاحظات المصروف</label>
                                        <input
                                          type="text"
                                          value={exp.notes}
                                          onChange={(e) =>
                                            setExpenses((prev) =>
                                              prev.map((item, i) => (i === idx ? { ...item, notes: e.target.value } : item))
                                            )
                                          }
                                          className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
                                          placeholder="مثال: شراء وقود"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs text-gray-600 mb-1">المبلغ </label>
                                        <input
                                          type="number"
                                          value={exp.amount}
                                          onChange={(e) =>
                                            setExpenses((prev) =>
                                              prev.map((item, i) => (i === idx ? { ...item, amount: e.target.value } : item))
                                            )
                                          }
                                          className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
                                          placeholder="0.00"
                                        />
                                      </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                      <label className="block text-xs text-transparent mb-1 select-none">حذف</label>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setExpenses((prevExpenses) => { 
                                            const newExpenses = prevExpenses.filter((_, i) => i !== idx);
                                            if (newExpenses.length === 0) {
                                              setIsExpensesOpen(false);
                                            }
                                            return newExpenses;
                                          });
                                        }}
                                        className="flex-shrink-0 p-2 text-red-500 rounded-full hover:bg-red-100 transition-colors" 
                                        title="حذف المصروف"
                                      >
                                        <FaTrash className="text-sm" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                
                                {totalExpenses > 0 && (
                                  <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex justify-between items-center text-lg font-semibold text-gray-800">
                                      <span>إجمالي المصروفات:</span>
                                      <span className="text-red-600">{totalExpenses.toLocaleString()} ر.س</span>
                                    </div>
                                  </div>
                                )}

                                <button
                                  type="button"
                                  onClick={() => setExpenses((prev) => [...prev, { contractNumber: '', notes: '', amount: '' }])}
                                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium mt-4"
                                >
                                  <FaPlus className="text-xs" /> إضافة صرف آخر
                                </button>
                              </div>
                            )}
          
                            {/* زر تسليم العهدة */}
                            <button
                              onClick={handleHandover}
                              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors mt-4 shadow-md"
                            >
                              <FaHandHoldingUsd /> تسليم العهدة
                            </button>
                          </div>
                        </div>
                  </div>

                  {/* (اليسار) استلام العهدة */}
                  <div className="lg:pr-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="bg-green-100 p-3 rounded-lg">
                            <FaHandHoldingUsd className="text-green-600 text-2xl" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800">استلام العهدة من الوردية السابقة</h3>
                        </div>

                        {/* قائمة العهد المعلقة */}
                        {pendingTransactions.length > 0 ? (
                          <div className="space-y-6">
                            {pendingTransactions.map((item) => {
                              
                              const isActionDisabled = (item.type === 'feed' && hasPendingHandover);
                              
                              return (
                                <div key={item.id} className="space-y-4 text-sm p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
                                  
                                  {/* نوع الطلب */}
                                  <h4 className={`text-lg font-bold flex items-center gap-2 ${item.type === 'feed' ? 'text-green-700' : 'text-blue-700'}`}>
                                    {item.type === 'feed' ? <FaSave /> : <FaHistory />}
                                    {item.type === 'feed' ? 'طلب تغذية' : 'طلب استلام وردية'}
                                  </h4>
                                  
                                  {/* التفاصيل */}
                                  <div className="grid grid-cols-2 gap-2">
                                     <div>
                                        <p className="text-xs text-gray-500">المبلغ المُرسل</p>
                                        <p className="font-bold text-gray-800 text-lg">{item.amount.toLocaleString()} ر.س</p>
                                     </div>
                                     <div>
                                        <p className="text-xs text-gray-500">من الموظف</p>
                                        <p className="font-medium text-gray-800">{item.employee || 'غير معروف'}</p>
                                     </div>
                                  </div>
                                  
                                  <div className="bg-white p-3 rounded border border-gray-100">
                                    <p className="text-xs text-gray-500 mb-1">الملاحظات</p>
                                    <p className="text-gray-700">{item.notes || 'لا توجد ملاحظات'}</p>
                                  </div>

                                  {/* المصروفات في الطلب */}
                                  {item.expenses && item.expenses.length > 0 && (
                                    <div>
                                      <p className="text-gray-600 mb-2 font-medium">المصروفات المرفقة:</p>
                                      <ul className="space-y-2">
                                        {item.expenses.map((exp: ExpenseItem, idx: number) => (
                                          <li key={idx} className="text-xs bg-white p-2 rounded border border-gray-200">
                                            <div className="flex justify-between font-bold mb-1">
                                               <span>{exp.amount} ر.س</span>
                                               <span className="text-gray-500">عقد: {exp.contractNumber || '—'}</span>
                                            </div>
                                            <span className="text-gray-600 block">{exp.notes || '—'}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* أزرار القبول والرفض / التصحيح */}
                                  <div className="pt-3 border-t border-gray-200">
                                    {correctingCardId === item.id ? (
                                      <div className="space-y-3 bg-white p-3 rounded border border-red-100">
                                        <label className="block text-sm font-medium text-gray-700">
                                          المبلغ الفعلي الذي وجدته:
                                        </label>
                                        <input
                                          type="number"
                                          value={correctionAmount}
                                          onChange={(e) => setCorrectionAmount(e.target.value ? parseFloat(e.target.value) : '')}
                                          placeholder="أدخل المبلغ الفعلي"
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                          autoFocus 
                                        />
                                        <p className="text-xs text-gray-500">
                                          ملاحظة: سيتم اعتماد هذا المبلغ كرصيد جديد للفرع.
                                        </p>
                                        <div className="flex gap-2">
                                          <button
                                            onClick={handleCancelCorrection} 
                                            className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm hover:bg-gray-300"
                                            disabled={isLoading}
                                          >
                                            إلغاء
                                          </button>
                                          <button
                                            onClick={handleConfirmCorrection}
                                            className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                                            disabled={isLoading || typeof correctionAmount !== 'number' || correctionAmount < 0}
                                          >
                                            {isLoading ? 'جاري التأكيد...' : 'تأكيد المبلغ'}
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => handleAccept(item.id)}
                                          className={`flex-1 flex items-center justify-center gap-1 py-2 text-white rounded-lg text-sm transition-colors shadow-sm ${
                                            isActionDisabled 
                                              ? 'bg-gray-400 cursor-not-allowed' 
                                              : 'bg-green-600 hover:bg-green-700'
                                          }`}
                                          disabled={isActionDisabled}
                                          title={isActionDisabled ? "يجب معالجة استلام الوردية أولاً" : "قبول"}
                                        >
                                          <FaCheck /> قبول مطابق
                                        </button>
                                        
                                        <button
                                          onClick={() => setCorrectingCardId(item.id)}
                                          className={`flex-1 flex items-center justify-center gap-1 py-2 text-white rounded-lg text-sm transition-colors shadow-sm ${
                                            isActionDisabled 
                                              ? 'bg-gray-400 cursor-not-allowed'
                                              : 'bg-red-600 hover:bg-red-700'
                                          }`}
                                          disabled={isActionDisabled}
                                          title={isActionDisabled ? "يجب معالجة استلام الوردية أولاً" : "قبول مع ملاحظة (تصحيح المبلغ)"}
                                        >
                                          <FaEdit /> تصحيح المبلغ
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  {isActionDisabled && (
                                    <p className="text-xs text-red-600 mt-2 text-center bg-red-50 p-1 rounded">
                                      تنبيه: لا يمكن معالجة التغذية قبل استلام الوردية.
                                    </p>
                                  )}
                                </div> 
                              );
                            })}
                          </div> 
                        ) : (
                          <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            <FaHandHoldingUsd className="text-3xl mx-auto mb-2 opacity-50" />
                            <p>لا توجد عهدة معلقة للاستلام</p>
                          </div>
                        )}
                  </div>
                    </div>
                  </div>
            </div>

            {/* 3. قسم السجل */}
            <div>
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <FaHistory className="text-purple-600 text-2xl" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-800">سجل عمليات العهدة</h2>
                    </div>

                    {history.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FaHistory className="text-4xl mx-auto mb-3 opacity-50" />
                        <p>لا توجد سجلات حتى الآن</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">النوع</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">المبلغ</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">المرسل</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">المستلم</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">الحالة</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">الملاحظات</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">الوقت</th>
                              <th className="px-2 py-3 w-12">التفاصيل</th> 
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {history.map((item) => (
                              <React.Fragment key={item.id}>
                                <tr className="hover:bg-gray-50 transition-colors">
                                  <td className="px-4 py-3 whitespace-nowrap text-right"> 
                                    <span
                                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        item.type === 'receive' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                      }`}
                                    >
                                      {item.type === 'receive' ? <FaWallet /> : <FaHandHoldingUsd />}
                                      {item.type === 'receive' ? 'تغذية' : 'تسليم واستلام'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-right font-medium text-gray-800">{item.amount.toLocaleString()} ر.س</td>
                                  <td className="px-4 py-3 text-right text-sm text-gray-600">{item.sender_employee?.Name || '—'}</td>
                                  <td className="px-4 py-3 text-right text-sm text-gray-600">{item.receiver_employee?.Name || '—'}</td>
                                  
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center gap-2 justify-start">
                                      <span
                                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                          item.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                          item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-red-100 text-red-800'
                                        }`}
                                      >
                                        {item.status === 'accepted' ? 'مقبولة' : item.status === 'pending' ? 'معلقة' : 'مرفوضة'}
                                      </span>
                                      {item.requires_review && (
                                        <span title="يوجد فرق في المبلغ، يتطلب مراجعة المحاسب">
                                          <FaExclamationTriangle className="text-yellow-500" />
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  <td className="px-4 py-3 text-right text-sm text-gray-600 max-w-xs truncate" 
                                      title={item.status === 'rejected' ? item.rejection_reason || 'مرفوض' : item.requires_review ? item.notes || 'فرق مبلغ' : item.notes || ''}>
                                    {item.status === 'rejected' 
                                      ? <span className="text-red-700">{item.rejection_reason || 'مرفوض'}</span>
                                      : item.requires_review
                                      ? <span className="text-yellow-700 font-semibold">{item.notes || 'فرق مبلغ'}</span>
                                      : (item.notes || '—')
                                    }
                                  </td>
                                  
                                  <td className="px-4 py-3 text-right text-sm text-gray-500 whitespace-nowrap" dir="ltr">{item.timestamp}</td>
                                  
                                  <td className="px-2 py-3 text-center">
                                    <button
                                      onClick={() => setExpandedRowId(expandedRowId === item.id ? null : item.id)}
                                      className="p-1 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-100 transition-colors"
                                      title="عرض التفاصيل"
                                    >
                                      {expandedRowId === item.id ? <FaChevronDown /> : <FaChevronDown className="transform rotate-[90deg]" />}
                                    </button>
                                  </td>
                                </tr>

                                {expandedRowId === item.id && (
                                  <tr className="bg-gray-50 dark:bg-gray-800 animate-fade-in">
                                    <td colSpan={8} className="p-4">
                                      <div className="px-4 space-y-4"> 
                                        
                                        <div>
                                          <h4 className="text-sm font-semibold text-gray-800">وقت إنشاء الطلب:</h4>
                                          <span className="text-xs text-gray-600" dir="ltr">{item.createdAt}</span>
                                        </div>

                                        {item.type === 'handover' && item.expenses && item.expenses.length > 0 && (
                                          <div className="border-t border-gray-200 pt-4">
                                            <h4 className="text-sm font-semibold mb-3 text-gray-800">بنود الصرف الخاصة بهذه الحركة:</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                              {item.expenses?.map((exp, idx) => (
                                                <div key={idx} className="p-3 border border-gray-200 rounded-lg bg-white">
                                                  <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xs text-gray-600">المبلغ:</span>
                                                    <strong className="text-sm text-red-600">{exp.amount} ر.س</strong>
                                                  </div>
                                                  <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xs text-gray-600">الملاحظات:</span>
                                                    <span className="text-sm text-gray-900 text-left">{exp.notes}</span>
                                                  </div>
                                                  {exp.contractNumber && (
                                                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                                                      <span className="text-xs text-gray-600">رقم العقد:</span>
                                                      <span className="text-sm text-gray-900">{exp.contractNumber}</span>
                                                    </div>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
            </div>

            </div>
          )}
        
          
        </div>
      </div>
      {isFeedModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl" dir="rtl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">تغذية عهدة موظف</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                  المبلغ (ريال)
                </label>
                <input
                  type="number"
                  value={feedAmount}
                  onChange={(e) => setFeedAmount(e.target.value ? parseFloat(e.target.value) : '')}
                  placeholder="مثال: 5000"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                  الموظف المستلم
                </label>
                <Select
                  options={employeeOptions}
                  value={employeeOptions.find(opt => opt.value === feedEmployeeId)}
                  onChange={(selectedOption) =>
                    setFeedEmployeeId(selectedOption ? selectedOption.value : '')
                  }
                  placeholder="ابحث واختر الموظف المستلم..."
                  isSearchable={true}
                  isRtl={true}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                  الملاحظات (اختياري)
                </label>
                <textarea
                  value={feedNotes}  
                  onChange={(e) => setFeedNotes(e.target.value)} 
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={2}
                />
              </div>
            </div>

           

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={closeFeedModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={isLoading}
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleFeedCash}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'جاري الإرسال...' : 'تأكيد التغذية'}
              </button>
            </div>
          </div>
        </div>
      )}
   {/* ▼▼▼ (جديد) مودال حل الإشكالية ▼▼▼ */}
   {isResolveModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl" dir="rtl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">تسوية العهدة (حل الإشكالية)</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                  المبلغ الجديد للعهدة
                </label>
                <input
                  type="number"
                  value={resolveAmount}
                  onChange={(e) => setResolveAmount(e.target.value ? parseFloat(e.target.value) : '')}
                  placeholder="مثال: 5000"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">سيتم إرسال هذا المبلغ كـ "تغذية" جديدة للموظف المختار.</p>
              </div>
              
              {/* (الحقل الجديد) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                  إرسال التسوية إلى الموظف
                </label>
                <Select
                  options={employeeOptions}
                  value={employeeOptions.find(opt => opt.value === resolveEmployeeId)}
                  onChange={(selectedOption) =>
                    setResolveEmployeeId(selectedOption ? selectedOption.value : '')
                  }
                  placeholder="اختر الموظف المستلم..."
                  isSearchable={true}
                  isRtl={true}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                  الملاحظات (اختياري)
                </label>
                <textarea
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={2}
                />
              </div>

            </div>


            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={() => setIsResolveModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={isLoading}
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleResolveIssue}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                // (تحديث شروط التعطيل)
                disabled={isLoading || typeof resolveAmount !== 'number' || resolveAmount <= 0 || !resolveEmployeeId}
              >
                {isLoading ? 'جاري الإرسال...' : 'إرسال التسوية'} 
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ▲▲▲ نهاية المودال ▲▲▲ */}

      

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
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