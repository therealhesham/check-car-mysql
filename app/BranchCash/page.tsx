'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FaWallet, FaHandHoldingUsd, FaHistory, FaPlus, FaSave, FaList, FaCheck, FaTimes, FaTrash,FaChevronDown } from 'react-icons/fa';
import Navbar from '@/public/components/navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import { PermissionGuard } from '../ROLE/PermissionGuard';


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
    sender_employee: { Name: string } | null;
    receiver_employee: { Name: string } | null;
    status: 'accepted' | 'pending' | 'rejected'; // <-- (جديد)
    rejection_reason: string | null; // <-- (جديد)
    expenses?: ExpenseItem[];
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

  
  // ▼▼▼ حالات سبب الرفض▼▼▼
  const [rejectingCardId, setRejectingCardId] = useState<number | null>(null); // ID الكرت المفتوح للرفض
  const [rejectionReasonText, setRejectionReasonText] = useState(''); // نص سبب الرفض
  const [branchStatus, setBranchStatus] = useState('ok'); // (ok, rejected)
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);


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
    return {
      userId: userData.id,
      userBranch: userData.selectedBranch, // <-- استخدام الفرع المختار
    };
  };

  const getAuthHeaders = () => {
    const authData = getAuthData();
    if (!authData) return null;
    return {
      'Content-Type': 'application/json',
      'x-user-id': authData.userId,
      'x-user-branch': encodeURIComponent(authData.userBranch), // <-- استخدام التشفير
    };
  };
  // ---------------------------------------------------------------


  // --- (تعديل) دالة جلب البيانات الرئيسية (GET) ---
  const fetchPageData = useCallback(async () => {
    setIsLoading(true);
    const headers = getAuthHeaders();
    if (!headers) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/Branch_Cash', { // (تأكد من المسار)
        method: 'GET',
        headers: headers,
      });

      if (!response.ok) {
        throw new Error('فشل في جلب البيانات');
      }
      

      const data = await response.json();
      setBranchStatus(data.branchStatus || 'ok');
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
              
              // (التاريخ المعروض خارجياً: هو وقت المعالجة، أو وقت الإنشاء إذا كانت معلقة)
              timestamp: new Date(item.processed_at || item.created_at).toLocaleString('ar-EG', SAUDI_TIME_OPTIONS),
              // (التاريخ المعروض داخلياً: هو وقت الإنشاء دائماً)
              createdAt: new Date(item.created_at).toLocaleString('ar-EG', SAUDI_TIME_OPTIONS),
      
              type: item.type === 'feed' ? 'receive' : 'handover',
              sender_employee: item.sender_employee,
              receiver_employee: item.receiver_employee,
              status: item.status,
              rejection_reason: item.rejection_reason,
              expenses: item.expenses.map((exp: any) => ({
                  id: exp.id,
                  notes: exp.notes,
                  amount: parseFloat(exp.amount).toString(),
                  contractNumber: exp.contract_number || '', 
              })),
            })));

    // ج. تحديث العهد المعلقة)
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
      setPendingTransactions([]); // إذا لم توجد، اجعلها مصفوفة فارغة
    }
  

      setCurrentCash(data.currentCash || 0);

    } catch (error) {
      console.error(error);
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ... (useEffect [fetchPageData])
  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);


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
  
  // (جديد) دالة لإلغاء عملية الرفض (إغلاق حقل الإدخال)
  const handleCancelReject = () => {
    setRejectingCardId(null);
    setRejectionReasonText('');
  };

  // (جديد) دالة لتأكيد الرفض (ترسل البيانات للـ API)
  const handleConfirmReject = async () => {
    const headers = getAuthHeaders();
    // 1. التأكد من وجود الطلب والسبب
    if (!headers || !rejectingCardId) return;
    if (!rejectionReasonText.trim()) {
      toast.error('الرجاء إدخال سبب الرفض.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/Branch_Cash', {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({
          action: 'reject' as const,
          transactionId: rejectingCardId, // 2. استخدام ID من الحالة
          rejection_reason: rejectionReasonText,   // 3. استخدام السبب من الحالة
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'فشل في رفض العهدة');
      }

      toast.info('تم رفض العهدة بنجاح');
      handleCancelReject(); // 4. إغلاق الحقل بعد النجاح
      await fetchPageData(); // إعادة تحميل البيانات

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
          notes: 'تغذية عهدة من الإدارة/المحاسب',
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'فشل في إرسال التغذية');
      }

      toast.success('تم إرسال التغذية بنجاح (بانتظار قبول الموظف)');
      
      // إغلاق المودال وإعادة تعيين الحقول
      setIsFeedModalOpen(false);
      setFeedAmount('');
      setFeedEmployeeId('');
      
      // (لا نحتاج لإعادة جلب البيانات هنا لأن الرصيد لن يتغير
      // إلا بعد قبول الموظف)

    } catch (error) {
      console.error(error);
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
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

  const hasPendingHandover = pendingTransactions.some(t => t.type === 'handover');
  // (جديد) تحديد ما إذا كان قسم التسليم معطلاً
  const isHandoverDisabled = hasPendingHandover || branchStatus === 'rejected';
  
  // (جديد) تحديد رسالة التعطيل المناسبة
  let handoverDisabledMessage = '';
  if (branchStatus === 'rejected') {
    handoverDisabledMessage = 'الفرع مجمد بسبب رفض العهدة. يرجى التواصل مع الإدارة.';
  } else if (hasPendingHandover) {
    handoverDisabledMessage = 'يجب معالجة طلب استلام الوردية أولاً.';
  }


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
        {/* ... (Header) ... */}
        <div className="container mx-auto px-4 pt-8 pb-6 bg-gray-50 border-b border-gray-200">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 text-center">إدارة العهدة</h1>
          <p className="text-sm text-gray-600 text-center">إدارة العهدة الحالية وتسليمها وعرض السجل</p>
        </div>


        <div className="container mx-auto px-4 py-8">
          
       
          {/* ▼▼▼ القسم 1: العهدة الحالية (معدل) ▼▼▼ */}
          <div className="flex justify-start mb-8">
            <div className="w-full max-w-md">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                
                {/* 1. رأس الكارد (العنوان والأيقونة) */}
                <div className="flex justify-between items-center gap-3 mb-4">
                  {/* ... (كود العنوان والأيقونة كما هو) ... */}
                   <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <FaWallet className="text-green-600 text-2xl" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      عهدة: <span className="text-blue-600">{branchName}</span>
                    </h2>
                  </div>
                </div>
                
                {/* 2. عرض الرصيد (المنطق الجديد) */}
                
                {/* ▼▼▼ هذا هو التغليف الجديد ▼▼▼ */}
                {branchStatus === 'rejected' ? (
                  // (الحالة 1: تم الرفض) - إظهار رسالة الخطأ
                  <div className="text-center py-4 border-t border-gray-50 mt-4 text-red-700">
                    <FaTimes className="text-4xl mx-auto mb-3 opacity-50" />
                    <p className="font-semibold text-lg">تم رفض استلام العهدة</p>
                    <p className="text-sm">الرصيد 0. يرجى التواصل مع الإدارة فوراً.</p>
                  </div>

                ) : pendingTransactions.some(t => t.type === 'handover') ? (
                  // (الحالة 2: بانتظار الموافقة) - إظهار رسالة الانتظار
                  <div className="text-center py-4 border-t border-gray-50 mt-4 text-orange-600">
                    <FaHistory className="text-4xl mx-auto mb-3 opacity-50" />
                    <p className="font-semibold">عهدة الفرع معلقة بانتظار الموافقة</p>
                  </div>

                ) : (
                  // (الحالة 3: العرض الطبيعي للرصيد)
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
                  </>
                )}
                {/* ▲▲▲ نهاية التغليف ▲▲▲ */}
                
              {/* 3. الزر (في الأسفل، جهة اليسار - مغلف بالحماية) */}
<div className="mt-4 flex justify-end">
  <PermissionGuard permission="canFeedCash">
    <button
      onClick={() => setIsFeedModalOpen(true)}
      className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
      title="تغذية العهدة"
    >
      <FaSave />
      <span>تغذية</span>
    </button>
  </PermissionGuard>
</div>

              </div>
            </div>
          </div>
          {/* ▲▲▲ نهاية القسم 1 ▲▲▲ */}
          
          {/* القسم 2: تسليم واستلام العهدة */}
          <div className="mb-8">
            {/* ... (باقي كود القسم 2 كما هو) ... */}
             <div className="bg-white rounded-xl border border-gray-200 p-6">
               <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">إدارة التسليم والاستلام</h2>
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
           {/* ▼▼▼ (تعديل) القسم الفرعي 1: تسليم العهدة ▼▼▼ */}
           <div className="pb-6 lg:pb-0 lg:border-l lg:border-gray-200 lg:pl-6">
                  
                  {/* 1. العنوان (دائماً ظاهر) */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <FaHandHoldingUsd className="text-blue-600 text-2xl" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">تسليم العهدة للوردية التالية</h3>
                  </div>

                  {/* 2. غلاف المحتوى (للتعطيل) */}
                  <div className="relative">
                    
                    {/* 3. الرسالة التي تظهر عند التعطيل (تستخدم المتغيرات الجديدة) */}
                    {isHandoverDisabled && (
                      <div className="absolute inset-0 bg-gray-100 bg-opacity-80 flex items-center justify-center z-10 rounded-lg border">
                        <p className="text-gray-700 font-semibold p-4 text-center">
                          {handoverDisabledMessage} {/* <-- رسالة ديناميكية */}
                        </p>
                      </div>
                    )}

                    {/* 4. المحتوى الفعلي (يستخدم المتغير الجديد للتعطيل) */}
                    <div className={isHandoverDisabled ? 'opacity-40 pointer-events-none' : ''}>
                      
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
                        className="w-full flex items-center justify-center gap-2 bg-amber-100 text-amber-800 py-2.5 rounded-lg hover:bg-amber-200 transition-colors mb-6"
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
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors mt-4"
                      >
                        <FaHandHoldingUsd /> تسليم العهدة
                      </button>
                    </div>
                  </div>
                </div>
                {/* ▲▲▲ نهاية القسم 1 ▲▲▲ */}
 
               
                {/* القسم الفرعي 2: استلام العهدة */}
                <div className="lg:pr-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <FaHandHoldingUsd className="text-green-600 text-2xl" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">استلام العهدة من الوردية السابقة</h3>
                  </div>

                  {/* ▼▼▼ عرض جميع العهد المعلقة ▼▼▼ */}
                  {pendingTransactions.length > 0 ? (
                    <div className="space-y-6"> {/* فواصل بين الكروت */}
                      {pendingTransactions.map((item) => {
                        
                        const isActionDisabled = (item.type === 'feed' && hasPendingHandover);
                        
                        return (
                          // كارد لكل طلب معلق
                          <div key={item.id} className="space-y-4 text-sm p-4 border rounded-lg shadow-sm bg-gray-50">
                            
                            {/* نوع الطلب */}
                            <h4 className={`text-lg font-semibold ${item.type === 'feed' ? 'text-green-700' : 'text-blue-700'}`}>
                              {item.type === 'feed' ? 'طلب تغذية' : 'طلب استلام وردية'}
                            </h4>
                            
                            {/* التفاصيل */}
                            <div>
                              <p className="text-gray-600">المبلغ:</p>
                              <p className="font-bold text-gray-800">{item.amount.toLocaleString()} ر.س</p>
                            </div>
                            <div>
                              <p className="text-gray-600">من الموظف:</p>
                              <p className="font-medium text-gray-800">{item.employee || 'غير معروف'}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">الملاحظات:</p>
                              <p className="text-gray-700">{item.notes || 'لا توجد ملاحظات'}</p>
                            </div>

                            {/* عرض المصروفات */}
                            {item.expenses && item.expenses.length > 0 && (
                              <div>
                                <p className="text-gray-600 mb-2">المصروفات:</p>
                                <ul className="space-y-1">
                                  {item.expenses.map((exp: ExpenseItem, idx: number) => (
                                    <li key={idx} className="text-xs bg-white p-2 rounded border border-gray-200">
                                      <span className="font-medium">رقم العقد:</span> {exp.contractNumber || '—'} | 
                                      <span className="font-medium"> المبلغ:</span> {exp.amount || '0'} ر.س <br />
                                      <span className="text-gray-600">ملاحظات:</span> {exp.notes || '—'}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* أزرار القبول والرفض */}
                           {/* أزرار القبول والرفض / أو حقل إدخال السبب */}
                           <div className="pt-3 border-t">
                              {rejectingCardId === item.id ? (
                                // (الحالة 1: عند الضغط على رفض - يظهر هذا)
                                <div className="space-y-3">
                                  <label className="block text-sm font-medium text-gray-700">
                                    سبب الرفض (إجباري):
                                  </label>
                                  <textarea
                                    value={rejectionReasonText}
                                    onChange={(e) => setRejectionReasonText(e.target.value)}
                                    placeholder="مثال: المبلغ غير مطابق..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    rows={2}
                                    autoFocus // للتركيز التلقائي على الحقل
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={handleCancelReject} // <-- زر الإلغاء
                                      className="flex-1 py-2 bg-gray-300 text-gray-800 rounded-lg text-sm"
                                      disabled={isLoading}
                                    >
                                      إلغاء
                                    </button>
                                    <button
                                      onClick={handleConfirmReject} // <-- زر تأكيد الرفض
                                      className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm"
                                      disabled={isLoading || !rejectionReasonText.trim()}
                                    >
                                      {isLoading ? 'جاري الرفض...' : 'تأكيد الرفض'}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                // (الحالة 2: العرض العادي - يظهر هذا)
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleAccept(item.id)}
                                    className={`flex-1 flex items-center justify-center gap-1 py-2 text-white rounded-lg text-sm transition-colors ${
                                      isActionDisabled 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-green-600 hover:bg-green-700'
                                    }`}
                                    disabled={isActionDisabled}
                                    title={isActionDisabled ? "يجب معالجة استلام الوردية أولاً" : "قبول"}
                                  >
                                    <FaCheck /> قبول
                                  </button>
                                  <button
                                    onClick={() => setRejectingCardId(item.id)} // <-- التعديل هنا: يفتح حقل السبب
                                    className={`flex-1 flex items-center justify-center gap-1 py-2 text-white rounded-lg text-sm transition-colors ${
                                      isActionDisabled 
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-red-600 hover:bg-red-700'
                                    }`}
                                    disabled={isActionDisabled}
                                    title={isActionDisabled ? "يجب معالجة استلام الوردية أولاً" : "رفض"}
                                  >
                                    <FaTimes /> رفض
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* رسالة التحذير */}
                            {isActionDisabled && (
                              <p className="text-xs text-red-600 mt-2 text-center">
                                لا يمكن معالجة التغذية قبل معالجة طلب استلام الوردية.
                              </p>
                            )}
                          </div> // <-- (هذا إغلاق الكارد)
                        );
                      })}
                    </div> // <-- (هذا إغلاق space-y-6)
                  ) : (
                    // (في حال عدم وجود أي طلبات معلقة)
                    <div className="text-center py-6 text-gray-500">
                      <FaHandHoldingUsd className="text-3xl mx-auto mb-2 opacity-50" />
                      <p>لا توجد عهدة معلقة للاستلام</p>
                    </div>
                  )}
                  {/* ▲▲▲ نهاية التعديل ▲▲▲ */}
                </div> 
               </div>
             </div>
          </div>


         {/* ▼▼▼ (تعديل) القسم 3: السجل ▼▼▼ */}
         <div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <FaHistory className="text-purple-600 text-2xl" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">سجل العهدة</h2>
              </div>

              {history.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FaHistory className="text-4xl mx-auto mb-3 opacity-50" />
                  <p>لا توجد سجلات حتى الآن</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    
                    {/* 1. تعديل رأس الجدول (Header) */}
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">النوع</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">المبلغ</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">المرسل (من)</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">المستلم (إلى)</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">الحالة</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">الملاحظات</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">الوقت</th>
                        {/* (تم نقل عمود الزر إلى هنا) */}
                        <th className="px-2 py-3 w-12">التفاصيل</th> 
                      </tr>
                    </thead>
                    
                    {/* 2. تعديل محتوى الجدول (Body) */}
                    <tbody className="divide-y divide-gray-200">
                      {history.map((item) => (
                        <React.Fragment key={item.id}>
                          <tr className="hover:bg-gray-50">
                            
                            {/* (النوع) */}
                            <td className="px-4 py-3 whitespace-nowrap text-right">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  // (الأخضر للتغذية، الأزرق للتسليم)
                                  item.type === 'receive' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {item.type === 'receive' ? <FaWallet /> : <FaHandHoldingUsd />}
                                
                                {/* (تغيير النص بناءً على طلبك) */}
                                {item.type === 'receive' ? 'تغذية' : 'تسليم واستلام'}
                              </span>
                            </td>
                            
                            {/* (باقي الحقول) */}
                            <td className="px-4 py-3 text-right font-medium text-gray-800">{item.amount.toLocaleString()} ر.س</td>
                            <td className="px-4 py-3 text-right text-sm text-gray-600">{item.sender_employee?.Name || 'N/A'}</td>
                            <td className="px-4 py-3 text-right text-sm text-gray-600">{item.receiver_employee?.Name || 'N/A'}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  item.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                  item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}
                              >
                                {item.status === 'accepted' ? 'مقبولة' : item.status === 'pending' ? 'معلقة' : 'مرفوضة'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-sm text-gray-600 max-w-xs truncate" 
                                title={item.status === 'rejected' ? item.rejection_reason || 'مرفوض' : item.notes || ''}>
                              {item.status === 'rejected' 
                                ? <span className="text-red-700">{item.rejection_reason || 'مرفوض'}</span>
                                : (item.notes || '—')
                              }
                            </td>
                            <td className="px-4 py-3 text-right text-sm text-gray-500 whitespace-nowrap">{item.timestamp}</td>
                            
                            {/* ▼▼▼ (تعديل) زر الفتح - يظهر دائماً ▼▼▼ */}
                            <td className="px-2 py-3 text-center">
                              {/* (تم حذف الشرط السابق) */}
                              <button
                                onClick={() => setExpandedRowId(expandedRowId === item.id ? null : item.id)}
                                className="p-1 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-100"
                                title="عرض التفاصيل"
                              >
                                {expandedRowId === item.id ? <FaChevronDown /> : <FaChevronDown className="transform rotate-[90deg]" />}
                              </button>
                            </td>
                            {/* ▲▲▲ نهاية التعديل ▲▲▲ */}

                          </tr>

                          {/* ▼▼▼ (الصف المنسدل - معدل) ▼▼▼ */}
                          {expandedRowId === item.id && (
                            <tr className="bg-gray-50 dark:bg-gray-800">
                              <td colSpan={8} className="p-4">
                                <div className="pl-12 pr-4 space-y-4"> {/* (للفصل بين القسمين) */}
                                  
                                  {/* 1. وقت الإنشاء (يظهر دائماً) */}
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-800">وقت إنشاء الطلب:</h4>
                                    <span className="text-xs text-gray-600">{item.createdAt}</span>
                                  </div>

                                  {/* 2. بنود الصرف (تظهر بشرط) */}
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
                                  {/* (نهاية قسم بنود الصرف) */}
                                  
                                </div>
                              </td>
                            </tr>
                          )}
                          {/* ▲▲▲ نهاية الصف المنسدل ▲▲▲ */}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          {/* ▲▲▲ نهاية القسم 3 ▲▲▲ */}
          
        </div>
      </div>
      {isFeedModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
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
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={() => setIsFeedModalOpen(false)}
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