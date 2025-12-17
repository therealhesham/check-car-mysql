'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/public/components/navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PermissionGuard } from '../ROLE/PermissionGuard'; // (تأكد من المسار)
import { FaCheck, FaPhone, FaWhatsapp, FaSpinner, FaCar, FaCalendarAlt, FaHashtag, FaStore, FaClock, FaTimes } from 'react-icons/fa';
import { usePermissions } from '../ROLE/usePermissions'; // (1. تم إضافة هذا)

// (1) واجهة تطابق قاعدة البيانات
interface WixBooking {
  id: number;
  client_name: string;
  client_phone: string;
  client_age: number | null;
  car_category: string | null;
  booking_days: number | null;
  pickup_date: string | null;
  pickup_branch: string | null;
  status: string; 
  follow_up_note: string | null;
  created_at: string;
  updated_at: string | null;
}

// (خيارات التنسيق لضمان توقيت السعودية)
const SAUDI_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  timeZone: 'Asia/Riyadh',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true 
};

export default function BookingsPage() {
  const { isAtLeastRole } = usePermissions(); // (2. تم استدعاء الـ Hook)

  const [isLoading, setIsLoading] = useState(true);
  const [pendingBookings, setPendingBookings] = useState<WixBooking[]>([]);
  const [completedBookings, setCompletedBookings] = useState<WixBooking[]>([]);
  const [menuOpenForBookingId, setMenuOpenForBookingId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    bookingId: number | null;
    newStatus: 'confirmed' | 'cancelled' | null;
  }>({ isOpen: false, bookingId: null, newStatus: null });
  const [noteText, setNoteText] = useState('');

  // (دالة جلب الهيدرز)
  const getAuthHeaders = () => {
    if (typeof window === 'undefined') return null;
    const userDataString = localStorage.getItem('user');
    if (!userDataString) return null;
    
    const userData = JSON.parse(userDataString);
    if (!userData.id || !userData.selectedBranch) return null;

    return {
      'Content-Type': 'application/json',
      'x-user-id': userData.id,
      'x-user-branch': encodeURIComponent(userData.selectedBranch),
    };
  };

  // (دالة جلب البيانات)
  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    const headers = getAuthHeaders();
    if (!headers) {
      toast.error('خطأ في المصادقة، يرجى تسجيل الدخول مجدداً.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/bookings', {
        method: 'GET',
        headers: headers,
      });

      if (!response.ok) {
                const err = await response.json();
                if (response.status === 403) {
                  // (التعديل هنا: تصفير الحالتين الجديدتين)
                    setPendingBookings([]); 
                    setCompletedBookings([]);
                    toast.error(err.error || 'غير مصرح لك بالدخول');
                    return;
                }
                throw new Error(err.error || 'فشل في جلب الحجوزات');
              }
        
              // (التعديل هنا: استقبال المصفوفتين)
              const data = await response.json(); 
              setPendingBookings(data.pendingBookings || []);
              setCompletedBookings(data.completedBookings || []);
        
            } catch (error) {
              console.error(error);
              toast.error((error as Error).message);
            } finally {
              setIsLoading(false);
            }
          }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // (useEffect لإغلاق القائمة)
  useEffect(() => {
    const closeMenu = () => {
      setMenuOpenForBookingId(null);
    };

    document.addEventListener('click', closeMenu);
    return () => {
      document.removeEventListener('click', closeMenu);
    };
  }, []);

  // (دوال المودال: open, close, confirm)
  const openNotesModal = (bookingId: number, status: 'confirmed' | 'cancelled') => {
    setModalState({ isOpen: true, bookingId: bookingId, newStatus: status });
    setNoteText(''); // (تصفير الملاحظة)
  };

  const closeNotesModal = () => {
    setModalState({ isOpen: false, bookingId: null, newStatus: null });
    setNoteText('');
  };

  const handleConfirmStatusUpdate = async () => {
    const { bookingId, newStatus } = modalState;
    if (!bookingId || !newStatus) return;

    if (noteText.trim() === '') {
      toast.error('الملاحظة إجبارية');
      return;
    }

    const headers = getAuthHeaders();
    if (!headers) {
        toast.error('خطأ في المصادقة');
        return;
    }
    
    setUpdatingId(bookingId); // (تفعيل التحميل)
    closeNotesModal(); // (إغلاق المودال)

    try {
      const response = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({ 
            bookingId: bookingId,
            newStatus: newStatus,
            note: noteText 
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'فشل في تحديث الحجز');
      }
      
      

      const updatedBooking = await response.json();

      // (تحديث الواجهة: إزالة من "الجديد" وإضافة إلى "السجل")
      setPendingBookings(prev => prev.filter(b => b.id !== bookingId));
      setCompletedBookings(prev => [updatedBooking, ...prev]); // (إضافته في بداية السجل)
      
      toast.success('تم تحديث حالة الحجز بنجاح');
      
    } catch (error) {
      console.error(error);
      toast.error('فشل تحديث الحجز، يرجى المحاولة مجدداً.');
    } finally {
        setUpdatingId(null); // (إيقاف التحميل)
    }
  };

  // (دالة لفتح القائمة الخاصة برقم الهاتف)
  const handlePhoneClick = (e: React.MouseEvent, bookingId: number) => {
    e.nativeEvent.stopImmediatePropagation();
    setMenuOpenForBookingId(prevId => (prevId === bookingId ? null : bookingId));
  };

  // (دوال تنسيق التاريخ والوقت)
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (e) {
      return 'تاريخ خاطئ';
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('ar-EG', SAUDI_TIME_OPTIONS);
    } catch (e) {
      return 'تاريخ/وقت خاطئ';
    }
  };

  // (3. دالة حساب فرق الوقت - جديدة)
  const calculateDuration = (start: string, end: string | null) => {
    if (!end || !start) {
      return '—'; // (لم تتم المعالجة بعد)
    }
    
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const diffMs = endDate.getTime() - startDate.getTime();

      if (diffMs < 0) {
        return 'N/A'; // (خطأ)
      }

      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) {
        return `${diffDays} يوم و ${diffHours % 24} س`;
      }
      if (diffHours > 0) {
        return `${diffHours} س و ${diffMinutes % 60} د`;
      }
      if (diffMinutes > 0) {
        return `${diffMinutes} دقيقة`;
      }
      if (diffSeconds < 10) {
         return "فوري";
      }
      return `${diffSeconds} ثانية`;
    } catch (e) {
      return 'N/A';
    }
  };


  // (كومبوننت زر التواصل)
  const ContactButton = ({ booking, isSmall = false }: { booking: WixBooking, isSmall?: boolean }) => {
    if (updatingId === booking.id) {
        return <FaSpinner className="animate-spin text-blue-500 mx-auto" />;
    }

    if (booking.status === 'pending') {
        return (
            <div className={`flex ${isSmall ? 'flex-col gap-2' : 'gap-2 justify-center'}`}>
                <button 
                    onClick={() => openNotesModal(booking.id, 'confirmed')}
                    className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200" 
                    title="تم الحجز (صح)"
                >
                    <FaCheck />
                </button>
                <button 
                    onClick={() => openNotesModal(booking.id, 'cancelled')}
                    className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200" 
                    title="ملغي (غلط)"
                >
                    <FaTimes />
                </button>
            </div>
        );
    }

    if (booking.status === 'confirmed') {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <FaCheck />
                تم الحجز
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FaTimes />
            ملغي
        </span>
    );
  };
  
 // (10) (جديد) كومبوننت قائمة الهاتف (معدل لرسالة واتساب تلقائية)
 const PhoneMenu = ({ booking }: { booking: WixBooking }) => {
    
    // (1. إنشاء الرسالة)
    const rawMessage = `مرحبا ${booking.client_name}
لقد حاولنا الاتصال بك ولكن لم نتمكن من الوصول لك 
ومع ذلك مازلنا مستعدين لخدمتكم على الواتس اب بخصوص طلب تأجير سيارة 
-----------------------------
روائس لتأجير السيارات 
معكم اينما كنتم `;
    
    // (2. تشفير الرسالة للرابط)
    const encodedMessage = encodeURIComponent(rawMessage);
    
    // (3. إنشاء رابط الواتساب الكامل)
    const whatsappUrl = `https://wa.me/966${booking.client_phone}?text=${encodedMessage}`;

    return (
      <div className="relative">
        <button
          onClick={(e) => handlePhoneClick(e, booking.id)}
          className="text-blue-600 hover:underline cursor-pointer font-medium"
        >
          {booking.client_phone}
        </button>

        {/* (القائمة المنسدلة) */}
        {menuOpenForBookingId === booking.id && (
          <div 
            onClick={(e) => e.stopPropagation()}
            className="absolute z-10 p-2 bg-white shadow-lg rounded-md border border-gray-200 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2" 
          >
            <a
              href={`tel:0${booking.client_phone}`}
              className="p-2 rounded-full text-blue-500 hover:bg-blue-100"
              title="اتصال"
            >
              <FaPhone className="text-xl" />
            </a>
            <a
              href={whatsappUrl} // <-- (4. استخدام الرابط الجديد)
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full text-green-500 hover:bg-green-100"
              title="واتساب"
            >
              <FaWhatsapp className="text-xl" />
            </a>
          </div>
        )}
      </div>
    );
  };


  return (
    <div dir="rtl" className="min-h-screen bg-gray-100">
      <Navbar />
      
      {/* (الهيدر) */}
      <div className="container mx-auto px-4 pt-8 pb-6 bg-gray-50 border-b border-gray-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 text-center">
          الحجوزات الجديدة (Wix)
        </h1>
        <p className="text-sm text-gray-600 text-center">
          متابعة طلبات الحجز الواردة من الموقع الخارجي
        </p>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
          
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">
              <FaSpinner className="animate-spin text-4xl mx-auto" />
              <p className="mt-2">جاري تحميل الحجوزات...</p>
            </div>
          ) : (
            <>
              {/* ▼▼▼ (1) القسم الجديد: الحجوزات الجديدة ▼▼▼ */}
              <div className="mb-12">
                <h2 className="text-xl font-bold text-gray-800 mb-4">الحجوزات الجديدة (بانتظار المراجعة)</h2>
                {pendingBookings.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                    <p className="text-lg font-medium">لا توجد حجوزات جديدة</p>
                    <p className="text-sm">سيتم عرض الطلبات الجديدة هنا عند وصولها.</p>
                  </div>
                ) : (
                  <div>
                    {/* (الجدول للشاشات الكبيرة) */}
                    <div className="overflow-x-auto hidden md:block">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {/* (تمت إضافة ID وضبط المحاذاة) */}
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">#</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">العميل</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">الهاتف</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">السيارة</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">تاريخ الاستلام</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">الأيام</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">الفرع</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">تاريخ الطلب</th>
                            {isAtLeastRole('admin') && (
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">مدة الاستجابة</th>
                            )}
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">تم الحجز؟</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {pendingBookings.map((b) => (
                            <tr key={b.id} className="bg-white">
                              {/* (تمت إضافة ID وضبط المحاذاة) */}
                              <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{b.id}</td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{b.client_name}</td>
                              <td className="px-4 py-3 text-sm text-gray-600 text-right">
                                <PhoneMenu booking={b} />
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 text-right">{b.car_category || 'N/A'}</td>
                              <td className="px-4 py-3 text-sm text-gray-600 text-right">{formatDate(b.pickup_date)}</td>
                              <td className="px-4 py-3 text-sm text-gray-600 text-right">{b.booking_days || 'N/A'}</td>
                              <td className="px-4 py-3 text-sm text-gray-600 text-right">{b.pickup_branch || 'N/A'}</td>
                              <td className="px-4 py-3 text-sm text-gray-600 text-right">{formatDateTime(b.created_at)}</td>
                              {isAtLeastRole('admin') && (
                                <td className="px-4 py-3 text-sm text-gray-600 text-right">{calculateDuration(b.created_at, b.updated_at)}</td>
                              )}
                              <td className="px-4 py-3 text-center">
                                <ContactButton booking={b} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/* (البطاقات للجوال) */}
                    <div className="md:hidden space-y-4">
                      {pendingBookings.map((b) => (
                        <div key={b.id} className="rounded-lg shadow-md border bg-white border-gray-200">
                          <div className="flex justify-between items-center p-4 border-b">
                            <div className="flex-grow">
                              <div className="text-lg font-bold text-gray-900">{b.client_name}</div>
                              <div className="text-xs font-medium text-gray-500">رقم الطلب: {b.id}</div>
                            </div>
                            <div className="flex-shrink-0">
                              <ContactButton booking={b} isSmall={true} />
                            </div>
                          </div>
                          <div className="p-4">
                            <dl>
                              <div className="flex justify-between items-center mb-2">
                                <dt className="text-sm font-medium text-gray-600">الهاتف:</dt>
                                <dd className="text-sm text-gray-900"><PhoneMenu booking={b} /></dd>
                              </div>
                              <div className="flex justify-between mb-2">
                                <dt className="text-sm font-medium text-gray-600 flex items-center gap-1"><FaCar className="text-gray-400" />السيارة:</dt>
                                <dd className="text-sm text-gray-900">{b.car_category || 'N/A'}</dd>
                              </div>
                              <div className="flex justify-between mb-2">
                                <dt className="text-sm font-medium text-gray-600 flex items-center gap-1"><FaStore className="text-gray-400" />الفرع:</dt>
                                <dd className="text-sm text-gray-900">{b.pickup_branch || 'N/A'}</dd>
                              </div>
                              <div className="flex justify-between mb-2">
                                <dt className="text-sm font-medium text-gray-600 flex items-center gap-1"><FaCalendarAlt className="text-gray-400" />تاريخ الاستلام:</dt>
                                <dd className="text-sm text-gray-900">{formatDate(b.pickup_date)}</dd>
                              </div>
                              <div className="flex justify-between mb-2">
                                <dt className="text-sm font-medium text-gray-600 flex items-center gap-1"><FaHashtag className="text-gray-400" />الأيام:</dt>
                                <dd className="text-sm text-gray-900">{b.booking_days || 'N/A'}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-sm font-medium text-gray-600 flex items-center gap-1"><FaClock className="text-gray-400" />تاريخ الطلب:</dt>
                                <dd className="text-sm text-gray-900">{formatDateTime(b.created_at)}</dd>
                              </div>
                            </dl>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* ▲▲▲ (نهاية القسم الجديد) ▲▲▲ */}


              {/* ▼▼▼ (2) القسم الثاني: السجل ▼▼▼ */}
              <div className="mt-12">
                <h2 className="text-xl font-bold text-gray-800 mb-4">سجل الحجوزات (الطلبات المكتملة)</h2>
                {completedBookings.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                    <p className="text-lg font-medium">لا توجد سجلات</p>
                    <p className="text-sm">سيتم عرض الحجوزات المؤكدة والملغية هنا.</p>
                  </div>
                ) : (
                  <div>
                    {/* (الجدول للشاشات الكبيرة) */}
                    <div className="overflow-x-auto hidden md:block">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">#</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">العميل</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">الهاتف</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">السيارة</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">فرع الاستلام</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">الملاحظات</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">تاريخ الطلب</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">وقت التحديث</th>
                            {isAtLeastRole('admin') && (
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">مدة الاستجابة</th>
                            )}
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">تم الحجز؟</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {completedBookings.map((b) => (
                            <tr key={b.id} className={b.status === 'confirmed' ? 'bg-green-50' : 'bg-red-50'}>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{b.id}</td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{b.client_name}</td>
                              <td className="px-4 py-3 text-sm text-gray-600 text-right">
                                <PhoneMenu booking={b} />
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 text-right">{b.car_category || 'N/A'}</td>
                              <td className="px-4 py-3 text-sm text-gray-600 text-right">{b.pickup_branch || 'N/A'}</td>
                              <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate text-right" title={b.follow_up_note || ''}>
                                  {b.follow_up_note || '—'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 text-right">{formatDateTime(b.created_at)}</td>
                              <td className="px-4 py-3 text-sm text-gray-600 text-right">{formatDateTime(b.updated_at)}</td>
                              {isAtLeastRole('admin') && (
                                <td className="px-4 py-3 text-sm text-gray-600 text-right">{calculateDuration(b.created_at, b.updated_at)}</td>
                              )}
                              <td className="px-4 py-3 text-center">
                                <ContactButton booking={b} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/* (البطاقات للجوال) */}
                    <div className="md:hidden space-y-4">
                      {completedBookings.map((b) => (
                        <div key={b.id} className={`rounded-lg shadow-md border ${b.status === 'confirmed' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                          <div className="flex justify-between items-center p-4 border-b">
                            <div className="flex-grow">
                              <div className="text-lg font-bold text-gray-900">{b.client_name}</div>
                              <div className="text-xs font-medium text-gray-500">رقم الطلب: {b.id}</div>
                            </div>
                            <div className="flex-shrink-0">
                              <ContactButton booking={b} isSmall={true} />
                            </div>
                          </div>
                          <div className="p-4">
                            <dl>
                              <div className="flex justify-between items-center mb-2">
                                <dt className="text-sm font-medium text-gray-600">الهاتف:</dt>
                                <dd className="text-sm text-gray-900"><PhoneMenu booking={b} /></dd>
                              </div>
                              <div className="flex justify-between mb-2">
                                <dt className="text-sm font-medium text-gray-600 flex items-center gap-1"><FaCar className="text-gray-400" />السيارة:</dt>
                                <dd className="text-sm text-gray-900">{b.car_category || 'N/A'}</dd>
                              </div>
                              <div className="flex justify-between mb-2">
                                <dt className="text-sm font-medium text-gray-600 flex items-center gap-1"><FaStore className="text-gray-400" />الفرع:</dt>
                                <dd className="text-sm text-gray-900">{b.pickup_branch || 'N/A'}</dd>
                              </div>
                              <div className="flex justify-between mb-2">
                                <dt className="text-sm font-medium text-gray-600 flex items-center gap-1"><FaCalendarAlt className="text-gray-400" />تاريخ الاستلام:</dt>
                                <dd className="text-sm text-gray-900">{formatDate(b.pickup_date)}</dd>
                              </div>
                              <div className="flex justify-between mb-2">
                                <dt className="text-sm font-medium text-gray-600 flex items-center gap-1"><FaHashtag className="text-gray-400" />الأيام:</dt>
                                <dd className="text-sm text-gray-900">{b.booking_days || 'N/A'}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-sm font-medium text-gray-600 flex items-center gap-1"><FaClock className="text-gray-400" />تاريخ الطلب:</dt>
                                <dd className="text-sm text-gray-900">{formatDateTime(b.created_at)}</dd>
                              </div>
                              
                              {b.updated_at && ( 
                                <div className="flex justify-between mt-2 pt-2 border-t border-gray-100">
                                  <dt className="text-sm font-medium text-gray-600 flex items-center gap-1"><FaCheck className="text-gray-400" />وقت التحديث:</dt>
                                  <dd className="text-sm text-gray-900">{formatDateTime(b.updated_at)}</dd>
                                </div>
                              )}
                              
                              {isAtLeastRole('admin') && b.updated_at && ( 
                                <div className="flex justify-between mt-2 pt-2 border-t border-gray-100">
                                  <dt className="text-sm font-medium text-gray-600 flex items-center gap-1"><FaClock className="text-gray-400" />مدة الاستجابة:</dt>
                                  <dd className="text-sm text-gray-900">{calculateDuration(b.created_at, b.updated_at)}</dd>
                                </div>
                              )}

                              {b.follow_up_note && ( 
                                <div className="mt-2 pt-2 border-t border-gray-100">
                                  <dt className="text-sm font-medium text-gray-600">
                                    الملاحظة:
                                  </dt>
                                  <dd className="text-sm text-gray-900">{b.follow_up_note}</dd>
                                </div>
                              )}

                            </dl>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* ▲▲▲ (نهاية القسم الثاني) ▲▲▲ */}
            </>
          )}
        </div>
      </div>

      {/* ▼▼▼ (مودال إدخال الملاحظة) ▼▼▼ */}
      {modalState.isOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm"
          onClick={closeNotesModal}
        >
          <div 
            className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl" 
            dir="rtl"
            onClick={(e) => e.stopPropagation()} 
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {modalState.newStatus === 'confirmed' ? 'تأكيد الحجز' : 'إلغاء الحجز'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="followUpNote" className="block text-sm font-medium text-gray-700 mb-1 text-right">
                  الملاحظة (إجباري)
                </label>
                <textarea
                  id="followUpNote"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder={
                    modalState.newStatus === 'confirmed' 
                      ? 'مثال: تم تأكيد الحجز مع العميل...' 
                      : 'مثال: العميل لا يرد على الاتصال...'
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  autoFocus
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={closeNotesModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={!!updatingId}
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusUpdate}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                  modalState.newStatus === 'confirmed' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                disabled={!!updatingId || noteText.trim() === ''}
              >
                {updatingId ? 'جاري الحفظ...' : (modalState.newStatus === 'confirmed' ? 'تأكيد الحجز' : 'تأكيد الإلغاء')}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ▲▲▲ (نهاية المودال) ▲▲▲ */}

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