'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { UserRole } from '../../app/ROLE/types';
import { PermissionGuard } from '../../app/ROLE/PermissionGuard';


// واجهة User
interface User {
  id: string;
  Name: string;
  EmID: number;
  role: UserRole; // ✅ الآن فقط الأدوار المعرفة مسموحة
  branch: string;
  selectedBranch: string;
}

// الأنماط (StyledWrapper)
const StyledWrapper = styled.div`
  /* تنسيق زر تسجيل الخروج */
  .Btn {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 45px;
    height: 45px;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition-duration: 0.3s;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.199);
    background-color: white;
  }

  .sign {
    width: 100%;
    transition-duration: 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sign svg {
    width: 17px;
  }

  .sign svg path {
    fill: black;
  }

  .text {
    position: absolute;
    left: 0%;
    width: 0%;
    opacity: 0;
    color: white;
    font-size: 0.75em;
    font-weight: 600;
    transition-duration: 0.3s;
    white-space: nowrap;
  }

  .Btn:hover {
    background-color: black;
    width: 125px;
    border-radius: 40px;
    transition-duration: 0.3s;
  }

  .Btn:hover .sign {
    width: 30%;
    transition-duration: 0.3s;
    padding-right: 20px;
  }

  .Btn:hover .sign svg path {
    fill: white;
  }

  .Btn:hover .text {
    opacity: 1;
    width: 70%;
    transition-duration: 0.3s;
    padding-left: 8px;
  }

  .Btn:active {
    transform: translate(2px, 2px);
  }

  /* تنسيق زر المستخدم */
  #btn-user {
    --text-color: #000;
    --bg-color-sup: #d2d2d2;
    --bg-color: #f4f4f4;
    --bg-hover-color: #ffffff;
    --online-status: #00da00;
    --font-size: 16px;
    --btn-transition: all 0.2s ease-out;
  }

  .button-user {
    display: flex;
    justify-content: center;
    align-items: center;
    font: 400 var(--font-size) Helvetica Neue, sans-serif;
    box-shadow: 0 0 2.17382px rgba(0, 0, 0, 0.049),
      0 1.75px 6.01034px rgba(0, 0, 0, 0.07),
      0 3.63px 14.4706px rgba(0, 0, 0, 0.091), 0 22px 48px rgba(0, 0, 0, 0.14);
    background-color: var(--bg-color);
    border-radius: 68px;
    cursor: pointer;
    padding: 6px 10px 6px 6px;
    width: fit-content;
    height: 40px;
    border: 0;
    overflow: hidden;
    position: relative;
    transition: var(--btn-transition);
  }

  .button-user:hover {
    height: 56px;
    padding: 8px 20px 8px 10px;
    background-color: var(--bg-hover-color);
    transition: var(--btn-transition);
  }

  .button-user:active {
    transform: scale(0.98);
  }

  .content-avatar {
    width: 30px;
    height: 30px;
    margin: 0;
    transition: var(--btn-transition);
    position: relative;
  }

  .button-user:hover .content-avatar {
    width: 40px;
    height: 40px;
  }

  .avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
    background-color: var(--bg-color-sup);
  }

  .user-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .status-user {
    position: absolute;
    width: 6px;
    height: 6px;
    right: 1px;
    bottom: 1px;
    border-radius: 50%;
    outline: 2px solid var(--bg-color);
    background-color: var(--online-status);
    transition: var(--btn-transition);
    animation: active-status 2s ease-in-out infinite;
  }

  .button-user:hover .status-user {
    width: 10px;
    height: 10px;
    right: 1px;
    bottom: 1px;
    outline: 3px solid var(--bg-hover-color);
  }

  .notice-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    padding-left: 10px;
    padding-right: 10px;
    text-align: center;
    color: var(--text-color);
    min-width: 100px;
  }

  .username {
    letter-spacing: -6px;
    height: 0;
    opacity: 0;
    transform: translateY(-20px);
    transition: var(--btn-transition);
    font-size: 14px;
    width: 100%;
    text-align: center;
  }

  .user-id {
    font-size: 12px;
    letter-spacing: -6px;
    height: 0;
    opacity: 0;
    transform: translateY(10px);
    transition: var(--btn-transition);
    width: 100%;
    text-align: center;
  }

  .label-user {
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 1;
    transform: scaleY(1);
    transition: var(--btn-transition);
    font-size: 14px;
    width: 100%;
  }

  .button-user:hover .username {
    height: auto;
    letter-spacing: normal;
    opacity: 1;
    transform: translateY(0);
    transition: var(--btn-transition);
  }

  .button-user:hover .user-id {
    height: auto;
    letter-spacing: normal;
    opacity: 1;
    transform: translateY(0);
    transition: var(--btn-transition);
  }

  .button-user:hover .label-user {
    height: 0;
    transform: scaleY(0);
    transition: var(--btn-transition);
  }

  .label-user,
  .username {
    font-weight: 600;
  }

  @keyframes active-status {
    0% {
      background-color: var(--online-status);
    }
    33.33% {
      background-color: #93e200;
    }
    66.33% {
      background-color: #93e200;
    }
    100% {
      background-color: var(--online-status);
    }
  }
`;

export default function Navbar() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [showBranchModal, setShowBranchModal] = useState<boolean>(false);
  const [branches, setBranches] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const router = useRouter();

 // ✅ اسم قاعدة البيانات المستخدمة في المشروع
const DB_NAME = 'carImagesDB'; // ✅ تم التصحيح
const STORE_NAME = 'pendingUploads';

const openDatabase = (): Promise<IDBDatabase | null> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1); // يتم فتح قاعدة البيانات، لا إنشاء جديد

    request.onerror = () => {
      console.error('فشل في فتح carImagesDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      const db = request.result;
      // ✅ تأكد أن المتجر موجود (لكن لا تُنشئ قاعدة بيانات جديدة)
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        console.warn('المتجر pendingUploads غير موجود في carImagesDB');
        // ❌ لا نُنشئ objectStore هنا، لأن السيرفر هو من يتحكم في الهيكل
        // فقط نُرجع الاتصال، ونسمح للعملية بالاستمرار
      }
      resolve(db);
    };

    // ❌ لا نستخدم onupgradeneeded لإنشاء متجر جديد
    // لأننا لا نريد تعديل هيكل قاعدة البيانات
    request.onupgradeneeded = (event) => {
      const db = request.result;
      // ❌ لا تفعل شيئًا هنا
      // إذا لم يكن المتجر موجودًا، نتعامل معه في الدالة التي تستخدمه
      console.warn('onupgradeneeded تم استدعاؤه، لكن لا يتم إنشاء متجر جديد');
    };
  });
};

const cleanupOldData = async (): Promise<void> => {
  let db: IDBDatabase | null = null;
  try {
    db = await openDatabase();
    if (!db) {
      console.warn('تعذر فتح carImagesDB');
      return;
    }

    // ✅ التأكد من وجود المتجر قبل الحذف
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      console.warn('المتجر pendingUploads غير موجود، لا حاجة للتنظيف');
      return;
    }

    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    // ✅ حذف كل المحتوى
    const request = store.clear();

    await new Promise<void>((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    console.log('تم تنظيف جميع الصور المؤقتة من carImagesDB');
  } catch (error) {
    console.error('فشل في تنظيف carImagesDB:', error);
  } finally {
    if (db) {
      try {
        db.close();
      } catch (closeError) {
        console.warn('فشل في إغلاق carImagesDB:', closeError);
      }
    }
  }
};

  // دالة لتحديد نص الفرع
  const getBranchDisplay = (branch: string, role: UserRole, selectedBranch: string) => {
    // أولًا: حدد النص حسب الدور
    let roleText = '';
    switch (role) {
      case 'owner':
        roleText = 'مالك';
        break;
      case 'super_admin':
        roleText = 'سوبر مدير';
        break;
      case 'admin':
        roleText = 'مدير';
        break;
        case 'accountant': 
        roleText = 'محاسب';
        break;
      case 'employee':
        roleText = 'موظف';
        break;
      default:
        roleText = 'مستخدم';
    }
  
    // ثانيًا: حدد الفرع
    if (selectedBranch) {
      return `${roleText} في ${selectedBranch}`;
    }
  
    const branches = branch
      .split(',')
      .map((b) => b.trim())
      .filter((b) => b);
  
    if (branches.length > 1) {
      return `${roleText} في عدة فروع`;
    }
  
    const branchName = branches[0] || 'بدون فرع';
    return `${roleText} في ${branchName}`;
  };

  // استرجاع بيانات المستخدم من localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    console.log('Stored user:', storedUser);
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        console.log('Parsed user data:', parsedUser);
        setUser(parsedUser);
        const userBranches = parsedUser.branch
          ? parsedUser.branch.split(',').map((b: string) => b.trim()).filter((b: string) => b)
          : [];
        setBranches(userBranches);
        setSelectedBranch(parsedUser.selectedBranch || '');
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        router.push('/login');
      }
    }
  }, [router]);

  // دالة تسجيل الخروج
 // دالة تسجيل الخروج
const handleLogout = async () => {
  console.log('Logout clicked');

  try {
    // 1. تنظيف الصور المؤقتة من IndexedDB
    await cleanupOldData();

    // 2. حذف بيانات المستخدم من localStorage
    localStorage.removeItem('user');

    // 3. حذف الكوكيز
    ['accessToken', 'refreshToken', 'selectedBranch'].forEach((cookie) => {
      document.cookie = `${cookie}=; path=/; max-age=0`;
    });

    // 4. تحديث الحالة
    setUser(null);

    // 5. التوجيه إلى صفحة تسجيل الدخول
    router.push('/login');
  } catch (error) {
    console.error('Error during logout:', error);
    // حتى لو فشل التنظيف، نُكمل عملية تسجيل الخروج
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  }
};

  // دالة فتح نافذة تغيير الفرع
  const handleOpenBranchModal = () => {
    if (branches.length > 1) {
      setShowBranchModal(true);
    }
  };

  // دالة تأكيد اختيار الفرع
  const handleBranchSelection = () => {
    if (!selectedBranch) {
      alert('يرجى اختيار فرع.');
      return;
    }
    if (user) {
      const updatedUser: User = { ...user, selectedBranch };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('Updated user:', updatedUser);
      setShowBranchModal(false);
    }
  };

  // إذا لم يتم تحميل بيانات المستخدم بعد، لا تعرض شيئًا
  if (!user) return null;

  return (
    <nav className="bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="text-white text-2xl font-bold">
          <a href="/">Rawaes</a>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex space-x-6 items-center text-white">
          <a href="/" className="hover:text-gray-400">
            الرئيسية
          </a>

          {/* (تم التغليف) */}
          <PermissionGuard permission="canViewHistory">
            <a href="/history" className="hover:text-gray-400">
              السجل
            </a>
          </PermissionGuard>

          {/* (تم التغليف) */}
          <PermissionGuard permission="canManageCheckInOut">
            <a href="/cheak-in" className="hover:text-gray-400">
              تشييك دخول
            </a>
          </PermissionGuard>

          {/* (تم التغليف) */}
          <PermissionGuard permission="canManageCheckInOut">
            <a href="/cheak-out" className="hover:text-gray-400">
              تشييك خروج
            </a>
          </PermissionGuard>

          {/* (تم التغليف - هذا الرابط سيظهر للمحاسب) */}
          <PermissionGuard permission="canManageCash">
            <a href="/BranchCash" className="hover:text-gray-400">
            العهدة
            </a>
          </PermissionGuard>
          {/* زر المستخدم */}
          <StyledWrapper>
            <button id="btn-user" className="button-user" onClick={handleOpenBranchModal}>
              <div className="content-avatar">
                <div className="status-user" />
                <div className="avatar">
                  <svg className="user-img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M12,12.5c-3.04,0-5.5,1.73-5.5,3.5s2.46,3.5,5.5,3.5,5.5-1.73,5.5-3.5-2.46-3.5-5.5-3.5Zm0-.5c1.66,0,3-1.34,3-3s-1.34-3-3-3-3,1.34-3,3,1.34,3,3,3Z" />
                  </svg>
                </div>
              </div>
              <div className="notice-content">
                <div className="username">{user.Name}</div>
                <div className="label-user">{user.Name}</div>
                <div className="user-id">{getBranchDisplay(user.branch, user.role, user.selectedBranch)}</div>
              </div>
            </button>
          </StyledWrapper>
          {/* زر تسجيل الخروج */}
          <StyledWrapper>
            <button className="Btn" onClick={handleLogout}>
              <div className="sign">
                <svg viewBox="0 0 512 512">
                  <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z" />
                </svg>
              </div>
              <div className="text">تسجيل الخروج</div>
            </button>
          </StyledWrapper>
        </div>

        {/* Hamburger for Mobile */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white md:hidden focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Mobile Nav Links */}
      {isOpen && (
        <div className="md:hidden bg-gray-900 text-white px-4 py-2 space-y-4">
          <a href="/" className="block hover:text-gray-400">
            الرئيسية
          </a>

          {/* (تم التغليف) */}
          <PermissionGuard permission="canViewHistory">
            <a href="/history" className="block hover:text-gray-400">
              السجل
            </a>
          </PermissionGuard>

          {/* (تم التغليف) */}
          <PermissionGuard permission="canManageCheckInOut">
            <a href="/cheak-in" className="block hover:text-gray-400">
              تشييك دخول
            </a>
          </PermissionGuard>

          {/* (تم التغليف) */}
          <PermissionGuard permission="canManageCheckInOut">
            <a href="/cheak-out" className="block hover:text-gray-400">
              تشييك خروج
            </a>
          </PermissionGuard>

          {/* (تم التغليف - هذا الرابط سيظهر للمحاسب) */}
          <PermissionGuard permission="canManageCash">
            <a href="/BranchCash" className="block hover:text-gray-400">
              إدارة العهدة
            </a>
          </PermissionGuard>
          {/* زر المستخدم */}
          <StyledWrapper>
            <button id="btn-user" className="button-user" onClick={handleOpenBranchModal}>
              <div className="content-avatar">
                <div className="status-user" />
                <div className="avatar">
                  <svg className="user-img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M12,12.5c-3.04,0-5.5,1.73-5.5,3.5s2.46,3.5,5.5,3.5,5.5-1.73,5.5-3.5-2.46-3.5-5.5-3.5Zm0-.5c1.66,0,3-1.34,3-3s-1.34-3-3-3-3,1.34-3,3,1.34,3,3,3Z" />
                  </svg>
                </div>
              </div>
              <div className="notice-content">
                <div className="username">{user.Name}</div>
                <div className="label-user">{user.Name}</div>
                <div className="user-id">{getBranchDisplay(user.branch, user.role, user.selectedBranch)}</div>
              </div>
            </button>
          </StyledWrapper>
          {/* زر تسجيل الخروج */} 
          <StyledWrapper>
            <button className="Btn" onClick={handleLogout}>
              <div className="sign">
                <svg viewBox="0 0 512 512">
                  <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z" />
                </svg>
              </div>
              <div className="text">تسجيل الخروج</div>
            </button>
          </StyledWrapper>
        </div>
      )}

      {/* نافذة منبثقة لتغيير الفرع */}
      {showBranchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">تغيير الفرع</h2>
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
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowBranchModal(false);
                  setSelectedBranch(user.selectedBranch || '');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleBranchSelection}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}