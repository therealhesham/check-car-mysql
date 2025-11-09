// ROLE/usePermissions.ts
import { useState, useEffect } from 'react';
import { 
  UserRole, 
  ROLE_HIERARCHY, 
  ROLE_PERMISSIONS, 
  PermissionKey,
  User
} from './types';

// واجهة بيانات المستخدم كما يتم تخزينها في localStorage
interface StoredUser {
  id: string;
  Name: string;
  EmID: number;
  role: string; // هنا سيكون النوع string وليس UserRole
  branch: string;
  selectedBranch: string;
}

export const usePermissions = () => {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // جلب بيانات المستخدم من localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser: StoredUser = JSON.parse(storedUser);
      
      // تحويل البيانات إلى تنسيق User المتوقع مع التحقق من صحة الدور
      const userRole = parsedUser.role as UserRole;
      const validRoles: UserRole[] = ['employee', 'accountant', 'admin', 'super_admin', 'owner'];
      
      if (validRoles.includes(userRole)) {
        const formattedUser: User = {
          id: parsedUser.id,
          name: parsedUser.Name,
          EmID: parsedUser.EmID,
          role: userRole,
          branch: parsedUser.branch
        };
        
        setUser(formattedUser);
      } else {
        console.error('دور مستخدم غير صالح:', parsedUser.role);
        setUser(null);
      }
    }
  }, []); // التشغيل مرة واحدة عند تحميل المكون
  
  // التحقق من صلاحية محددة
  const hasPermission = (permission: PermissionKey): boolean => {
    if (!user) return false;
    return ROLE_PERMISSIONS[user.role]?.[permission] || false;
  };

  // التحقق من دور محدد
  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  // التحقق من أن دور المستخدم على الأقل نفس المستوى أو أعلى
  const isAtLeastRole = (role: UserRole): boolean => {
    if (!user) return false;
    const userRoleIndex = ROLE_HIERARCHY.indexOf(user.role);
    const requiredRoleIndex = ROLE_HIERARCHY.indexOf(role);
    return userRoleIndex >= requiredRoleIndex;
  };

  // التحقق من أن دور المستخدم أعلى من دور معين
  const isHigherRole = (role: UserRole): boolean => {
    if (!user) return false;
    const userRoleIndex = ROLE_HIERARCHY.indexOf(user.role);
    const targetRoleIndex = ROLE_HIERARCHY.indexOf(role);
    return userRoleIndex > targetRoleIndex;
  };

  // التحقق من أن المستخدم هو نفسه (للحماية من تعديل/حذف الذاتي)
  const isSelf = (userId: string): boolean => {
    return user?.id === userId;
  };

  // دالة لتحديث بيانات المستخدم (مفيدة عند تغيير الصلاحيات)
  const refreshUser = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser: StoredUser = JSON.parse(storedUser);
      const userRole = parsedUser.role as UserRole;
      const validRoles: UserRole[] = ['employee', 'accountant', 'admin', 'super_admin', 'owner'];
      
      if (validRoles.includes(userRole)) {
        const formattedUser: User = {
          id: parsedUser.id,
          name: parsedUser.Name,
          EmID: parsedUser.EmID,
          role: userRole,
          branch: parsedUser.branch
        };
        
        setUser(formattedUser);
      } else {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  return { 
    hasPermission, 
    hasRole, 
    isAtLeastRole, 
    isHigherRole,
    isSelf,
    user,
    refreshUser
  };
};