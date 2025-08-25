// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import Cookies from 'js-cookie';

// interface User {
//   id: string;
//   Name: string;
//   EmID: number;
//   role: string;
//   branch: string;
//   selectedBranch: string;
// }

// export default function LoginPage() {
//   const [emId, setEmId] = useState<string | ''>('');
//   const [password, setPassword] = useState<string>('');
//   const [error, setError] = useState<string>('');
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [showBranchModal, setShowBranchModal] = useState<boolean>(false);
//   const [branches, setBranches] = useState<string[]>([]);
//   const [selectedBranch, setSelectedBranch] = useState<string>('');
//   const router = useRouter();

//   // التحقق من وجود رسائل خطأ في URL عند تحميل الصفحة
//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const errorParam = urlParams.get('error');

//     if (errorParam === 'session_expired') {
//       setError('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.');
//     }
//   }, []);

//   const clearTokens = () => {
//     Cookies.remove('accessToken');
//     Cookies.remove('refreshToken');
//     localStorage.removeItem('user');
//   };

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     clearTokens();

//     if (!emId) {
//       setError('يجب إدخال معرف الموظف');
//       return;
//     }

//     if (isNaN(Number(emId))) {
//       setError('يجب أن يكون معرف الموظف رقمًا صحيحًا');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const response = await fetch('/api/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ emId: Number(emId), password }),
//       });

//       const data = await response.json();
//       console.log('API response:', data);

//       if (response.ok && data.success && data.user) {
//         const user: Omit<User, 'selectedBranch'> = data.user;
//         localStorage.setItem('user', JSON.stringify(user));

//         const userBranches = (typeof user.branch === 'string' && user.branch)
//           ? user.branch.split(',').map((b: string) => b.trim()).filter((b: string) => b)
//           : [];

//         setBranches(userBranches);

//         if (userBranches.length > 1) {
//           setShowBranchModal(true);
//         } else {
//           const userData: User = { ...user, selectedBranch: userBranches[0] || '' };
//           localStorage.setItem('user', JSON.stringify(userData));
//           router.push('/');
//         }
//       } else {
//         setError(data.message || 'معرف الموظف أو كلمة المرور غير صحيحة');
//         clearTokens();
//       }
//     } catch (err) {
//       setError('حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى.');
//       console.error('Login error:', err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleBranchSelection = () => {
//     if (!selectedBranch) {
//       setError('يرجى اختيار فرع.');
//       return;
//     }

//     const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
//     const userData: User = { ...storedUser, selectedBranch };
//     localStorage.setItem('user', JSON.stringify(userData));
//     setShowBranchModal(false);
//     router.push('/');
//   };

//   const handleCancel = () => {
//     setShowBranchModal(false);
//     setIsLoading(false);
//     clearTokens();
//     setError('');
//   };

//   return (
//     <div dir="rtl" className="flex justify-center items-center min-h-screen bg-gray-100">
//       <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
//         <h1 className="text-2xl font-semibold text-center text-gray-900 mb-4">تسجيل الدخول</h1>
//         {new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('returnTo') && (
//           <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
//             <p className="text-sm text-blue-700">
//               يرجى تسجيل الدخول للوصول إلى الصفحة المطلوبة
//             </p>
//           </div>
//         )}
//         <form onSubmit={handleLogin}>
//           <div className="mb-4">
//             <label htmlFor="emId" className="block text-sm font-medium text-gray-700 mb-1">
//               معرف الموظف
//             </label>
//             <input
//               id="emId"
//               type="text"
//               inputMode="numeric"
//               value={emId}
//               onChange={(e) => setEmId(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//               aria-required="true"
//               disabled={isLoading}
//             />
//           </div>
//           <div className="mb-4">
//             <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
//               كلمة المرور
//             </label>
//             <input
//               id="password"
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//               aria-required="true"
//               disabled={isLoading}
//             />
//           </div>
//           {error && (
//             <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
//               <p className="text-red-600 text-sm">{error}</p>
//             </div>
//           )}
//           <button
//             type="submit"
//             disabled={isLoading}
//             className={`w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
//               isLoading ? 'opacity-50 cursor-not-allowed' : ''
//             }`}
//           >
//             {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
//           </button>
//         </form>
//       </div>
//       {showBranchModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
//             <h2 className="text-lg font-semibold text-gray-900 mb-4">اختر الفرع</h2>
//             <p className="text-sm text-gray-600 mb-4">
//               لديك صلاحية الوصول إلى عدة فروع. يرجى اختيار الفرع الذي تريد العمل عليه.
//             </p>
//             <select
//               value={selectedBranch}
//               onChange={(e) => setSelectedBranch(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
//               disabled={isLoading}
//             >
//               <option value="">اختر الفرع</option>
//               {branches.map((branch, index) => (
//                 <option key={index} value={branch}>
//                   {branch}
//                 </option>
//               ))}
//             </select>
//             {error && (
//               <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
//                 <p className="text-red-600 text-sm">{error}</p>
//               </div>
//             )}
//             <div className="flex justify-end space-x-2 gap-2">
//               <button
//                 type="button"
//                 onClick={handleCancel}
//                 className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
//                 disabled={isLoading}
//               >
//                 إلغاء
//               </button>
//               <button
//                 type="button"
//                 onClick={handleBranchSelection}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
//                 disabled={isLoading || !selectedBranch}
//               >
//                 تأكيد
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { FaEdit,FaPlus,FaSave,FaTrash,FaList,FaUser,FaIdCard,FaLock,FaUserTag,FaChevronDown,FaSignOutAlt,FaBuilding} from 'react-icons/fa';

interface User {
  id: string;
  Name: string;
  EmID: number;
  role: string;
  branch: string;
}

export default function LoginPage() {
  const [emId, setEmId] = useState<string | ''>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showBranchModal, setShowBranchModal] = useState<boolean>(false);
  const [branches, setBranches] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');

    if (errorParam === 'session_expired') {
      setError('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.');
    }
  }, []);

  const clearTokensAndUserData = () => {
    // ❌ إزالة بيانات المستخدم من localStorage
    localStorage.removeItem('user');
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    Cookies.remove('selectedBranch');
    setCurrentUser(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    clearTokensAndUserData();
    
    if (!emId) {
      setError('يجب إدخال معرف الموظف');
      return;
    }
    
    if (isNaN(Number(emId))) {
      setError('يجب أن يكون معرف الموظف رقمًا صحيحًا');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emId: Number(emId), password }),
      });
      
      const data = await response.json();
      console.log('API response:', data);
      
      if (response.ok && data.success && data.user) {
        const user: User = data.user;
        
        const userBranches = (typeof user.branch === 'string' && user.branch)
          ? user.branch.split(',').map((b: string) => b.trim()).filter((b: string) => b)
          : [];
        
        setBranches(userBranches);
        
        if (userBranches.length > 1) {
          // ✅ تخزين بيانات المستخدم في localStorage للمستخدمين متعددي الفروع
          localStorage.setItem('user', JSON.stringify(user));
          setCurrentUser(user);
          setShowBranchModal(true);
        } else {
          // ✅ للمستخدمين ذوي الفرع الواحد - حفظ البيانات مع selectedBranch
          const branchToStore = userBranches[0] || '';
          
          // إنشاء كائن المستخدم مع selectedBranch
          const updatedUser = {
            ...user,
            selectedBranch: branchToStore
          };
          
          // حفظ البيانات المحدثة في localStorage
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          // تحديث الحالة
          setCurrentUser(updatedUser);
          
          // حفظ في الكوكيز
          Cookies.set('selectedBranch', branchToStore, { expires: 1/24, path: '/' });
          
          // التوجيه للصفحة الرئيسية
          router.push('/');
        }
      } else {
        setError(data.message || 'معرف الموظف أو كلمة المرور غير صحيحة');
        clearTokensAndUserData();
      }
    } catch (err) {
      setError('حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBranchSelection = () => {
    if (!selectedBranch) {
      setError('يرجى اختيار فرع.');
      return;
    }
  
    try {
      // ✅ 1. تحديث بيانات المستخدم
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        throw new Error('لم يتم العثور على بيانات المستخدم في localStorage');
      }
  
      const user = JSON.parse(storedUser);
      if (!user || typeof user !== 'object') {
        throw new Error('بيانات المستخدم غير صالحة');
      }
  
      const updatedUser = {
        ...user,
        selectedBranch: selectedBranch,
      };
  
      // ✅ 2. حفظ في localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
  
      // ✅ 3. التحقق من أن الحفظ تم بنجاح
      const verification = localStorage.getItem('user');
      if (!verification) {
        throw new Error('فشل في قراءة البيانات بعد الحفظ');
      }
  
      const verifiedUser = JSON.parse(verification);
      if (verifiedUser.selectedBranch !== selectedBranch) {
        throw new Error('تم الحفظ لكن لم يتم العثور على selectedBranch');
      }
  
      // ✅ 4. حفظ في الكوكيز
      Cookies.set('selectedBranch', selectedBranch, { expires: 1/24, path: '/' });
  
      // ✅ 5. تحديث الحالة
      setCurrentUser(updatedUser);
  
      // ✅ 6. التوجيه الآمن
      router.push('/');
    } catch (error) {
      console.error('فشل في حفظ الفرع:', error);
      setError('حدث خطأ في حفظ الفرع. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleCancel = () => {
    setShowBranchModal(false);
    setIsLoading(false);
    clearTokensAndUserData();
    setError('');
  };

  return (
    <div 
      dir="rtl" 
      className="flex justify-center items-center min-h-screen bg-gray-50 p-4"
      style={{
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
    >
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300">
        {/* رأس المربع */}
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-1">تسجيل الدخول</h1>
          <p className="text-blue-100 text-sm opacity-90">أدخل بياناتك للوصول إلى النظام</p>
        </div>
  
        {/* محتوى النموذج */}
        <div className="p-6">
          {new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('returnTo') && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                يرجى تسجيل الدخول للوصول إلى الصفحة المطلوبة
              </p>
            </div>
          )}
  
          <form onSubmit={handleLogin} className="space-y-4">
            {/* حقل معرف الموظف */}
            <div>
              <label htmlFor="emId" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                معرف الموظف
              </label>
              <div className="relative">
                <input
                  id="emId"
                  type="text"
                  inputMode="numeric"
                  value={emId}
                  onChange={(e) => setEmId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
                  placeholder="أدخل معرف الموظف"
                  required
                  aria-required="true"
                  disabled={isLoading}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
  
            {/* حقل كلمة المرور */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
                  placeholder="أدخل كلمة المرور"
                  required
                  aria-required="true"
                  disabled={isLoading}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
  
            {/* رسالة الخطأ */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg animate-pulse">
                <p className="text-sm text-red-600 dark:text-red-300 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </p>
              </div>
            )}
  
            {/* زر تسجيل الدخول */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full px-6 py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white font-medium rounded-lg shadow-md hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.01] ${
                isLoading ? 'opacity-80 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري تسجيل الدخول...
                </span>
              ) : (
                'تسجيل الدخول'
              )}
            </button>
          </form>
        </div>
      </div>
      {showBranchModal && (
  <div 
    className="fixed inset-0 flex items-center justify-center z-50"
    style={{
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
    }}
  >
    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md border border-gray-100">
      {/* رأس المودال */}
      <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 p-2 rounded-lg">
            <FaBuilding className="text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">اختر الفرع</h2>
        </div>
      </div>

      {/* المحتوى */}
      <p className="text-sm text-gray-600 mb-4">
        لديك صلاحية الوصول إلى عدة فروع. يرجى اختيار الفرع الذي تريد العمل عليه.
      </p>
      <select
        value={selectedBranch}
        onChange={(e) => setSelectedBranch(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
      >
        <option value="">اختر الفرع</option>
        {branches.map((branch) => (
          <option key={branch} value={branch}>
            {branch}
          </option>
        ))}
      </select>

      {/* أزرار التحكم */}
      <div className="flex justify-end gap-2 mt-6">
        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
        >
          إلغاء
        </button>
        <button
          onClick={handleBranchSelection}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          تأكيد
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}