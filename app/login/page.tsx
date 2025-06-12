// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';

// export default function LoginPage() {
//   const [emId, setEmId] = useState<number | ''>('');
//   const [password, setPassword] = useState<string>('');
//   const [error, setError] = useState<string>('');
//   const [isLoading, setIsLoading] = useState(false);
//   const router = useRouter();

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');

//     if (typeof emId !== 'number') {
//       setError('يجب أن يكون معرف الموظف رقمًا');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const response = await fetch('/api/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ emId, password }),
//       });

//       const data = await response.json();
//       if (data.success) {
//         console.log('Login successful:', data.user);
//         localStorage.setItem('user',JSON.stringify(data.user));
//         router.push('/');
//       } else {
//         setError(data.message || 'معرف الموظف أو كلمة المرور غير صحيحة');
//       }
//     } catch (err) {
//       setError('حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div dir="rtl" className="flex justify-center items-center min-h-screen bg-gray-100">
//       <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
//         <h1 className="text-2xl font-semibold text-center text-gray-900 mb-4">تسجيل الدخول</h1>
//         <form onSubmit={handleLogin}>
//           <div className="mb-4">
//             <label htmlFor="emId" className="block text-sm font-medium text-gray-700 mb-1">
//               معرف الموظف
//             </label>
//             <input
//               id="emId"
//               type="number"
//               value={emId}
//               onChange={(e) => setEmId(e.target.value ? parseInt(e.target.value) : '')}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md"
//               required
//               aria-required="true"
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
//               className="w-full px-3 py-2 border border-gray-300 rounded-md"
//               required
//               aria-required="true"
//             />
//           </div>
//           {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
//           <button
//             type="submit"
//             disabled={isLoading}
//             className={`w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
//           >
//             {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';

// // واجهة User
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

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');

//     if (!emId || isNaN(Number(emId))) {
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
//       console.log('API response:', data); // سجل لتصحيح الأخطاء

//       if (data.success && data.user) {
//         const user: User = data.user;
//         console.log('Login successful:', user);

//         // التحقق من وجود branch
//         const branch = typeof user.branch === 'string' ? user.branch : '';
//         const userBranches = branch
//           .split(',')
//           .map((b: string) => b.trim()) // تحديد نوع b كـ string
//           .filter((b: string) => b); // تحديد نوع b كـ string

//         setBranches(userBranches);

//         if (userBranches.length > 1) {
//           // تخزين بيانات المستخدم مؤقتًا
//           localStorage.setItem('user', JSON.stringify(user));
//           setShowBranchModal(true);
//         } else {
//           const userData = { ...user, selectedBranch: userBranches[0] || '' };
//           localStorage.setItem('user', JSON.stringify(userData));
//           router.push('/');
//         }
//       } else {
//         setError(data.message || 'معرف الموظف أو كلمة المرور غير صحيحة');
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

//     // تحديث بيانات المستخدم مع الفرع المختار
//     const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
//     const userData = { ...storedUser, selectedBranch };
//     localStorage.setItem('user', JSON.stringify(userData));
//     setShowBranchModal(false);
//     router.push('/');
//   };

//   return (
//     <div dir="rtl" className="flex justify-center items-center min-h-screen bg-gray-100">
//       <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
//         <h1 className="text-2xl font-semibold text-center text-gray-900 mb-4">تسجيل الدخول</h1>
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
//               className="w-full px-3 py-2 border border-gray-300 rounded-md"
//               required
//               aria-required="true"
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
//               className="w-full px-3 py-2 border border-gray-300 rounded-md"
//               required
//               aria-required="true"
//             />
//           </div>
//           {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
//           <button
//             type="submit"
//             disabled={isLoading}
//             className={`w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
//           >
//             {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
//           </button>
//         </form>
//       </div>

//       {showBranchModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 w-full max-w-md">
//             <h2 className="text-lg font-semibold text-gray-900 mb-4">اختر الفرع</h2>
//             <select
//               value={selectedBranch}
//               onChange={(e) => setSelectedBranch(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
//             >
//               <option value="">اختر الفرع</option>
//               {branches.map((branch, index) => (
//                 <option key={index} value={branch}>
//                   {branch}
//                 </option>
//               ))}
//             </select>
//             {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
//             <div className="flex justify-end space-x-2">
//               <button
//                 type="button"
//                 onClick={() => {
//                   setShowBranchModal(false);
//                   setIsLoading(false);
//                   localStorage.removeItem('user');
//                 }}
//                 className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
//               >
//                 إلغاء
//               </button>
//               <button
//                 type="button"
//                 onClick={handleBranchSelection}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//                 disabled={isLoading}
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

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// واجهة User
interface User {
  id: string;
  Name: string;
  EmID: number;
  role: string;
  branch: string;
  selectedBranch: string;
}

export default function LoginPage() {
  const [emId, setEmId] = useState<string | ''>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showBranchModal, setShowBranchModal] = useState<boolean>(false);
  const [branches, setBranches] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!emId || isNaN(Number(emId))) {
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

      if (data.success && data.user) {
        const user: Omit<User, 'selectedBranch'> = data.user;
        console.log('Login successful:', user);

        // التحقق من وجود branch
        const branch = typeof user.branch === 'string' ? user.branch : '';
        const userBranches = branch
          .split(',')
          .map((b: string) => b.trim())
          .filter((b: string) => b);

        setBranches(userBranches);

        if (userBranches.length > 1) {
          // تخزين بيانات المستخدم مؤقتًا بدون selectedBranch
          localStorage.setItem('user', JSON.stringify(user));
          setShowBranchModal(true);
        } else {
          const userData: User = { ...user, selectedBranch: userBranches[0] || '' };
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('Stored user:', userData);
          router.push('/');
        }
      } else {
        setError(data.message || 'معرف الموظف أو كلمة المرور غير صحيحة');
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

    // تحديث بيانات المستخدم مع الفرع المختار
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userData: User = { ...storedUser, selectedBranch };
    localStorage.setItem('user', JSON.stringify(userData));
    console.log('Stored user after branch selection:', userData);
    setShowBranchModal(false);
    router.push('/');
  };

  return (
    <div dir="rtl" className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-semibold text-center text-gray-900 mb-4">تسجيل الدخول</h1>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="emId" className="block text-sm font-medium text-gray-700 mb-1">
              معرف الموظف
            </label>
            <input
              id="emId"
              type="text"
              inputMode="numeric"
              value={emId}
              onChange={(e) => setEmId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
              aria-required="true"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              كلمة المرور
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
              aria-required="true"
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>
      </div>

      {showBranchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">اختر الفرع</h2>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            >
              <option value="">اختر الفرع</option>
              {branches.map((branch, index) => (
                <option key={index} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowBranchModal(false);
                  setIsLoading(false);
                  localStorage.removeItem('user');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleBranchSelection}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={isLoading}
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