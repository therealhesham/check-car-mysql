// ROLE/PermissionGuard.tsx
import React, { ReactNode } from 'react';
import { usePermissions } from './usePermissions';
import type { PermissionKey, UserRole } from './types';


interface PermissionGuardProps {
  permission?: PermissionKey;
  role?: UserRole;
  requireAtLeastRole?: UserRole;
  requireHigherRole?: UserRole;
  isSelf?: string; // userId للمقارنة
  fallback?: ReactNode;
  children?: ReactNode; // ✅ أصبح اختياريًا
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  role,
  requireAtLeastRole,
  requireHigherRole,
  isSelf,
  fallback = null,
  children
}) => {
  const { 
    hasPermission, 
    hasRole, 
    isAtLeastRole, 
    isHigherRole,
    isSelf: checkIsSelf 
  } = usePermissions();

  let hasAccess = true;

  // التحقق من الصلاحية المحددة
  if (permission) {
    hasAccess = hasAccess && hasPermission(permission);
  }

  // التحقق من الدور المحدد
  if (role) {
    hasAccess = hasAccess && hasRole(role);
  }

  // التحقق من أن دور المستخدم على الأقل نفس المستوى
  if (requireAtLeastRole) {
    hasAccess = hasAccess && isAtLeastRole(requireAtLeastRole);
  }

  // التحقق من أن دور المستخدم أعلى من دور معين
  if (requireHigherRole) {
    hasAccess = hasAccess && isHigherRole(requireHigherRole);
  }

  // التحقق من أن المستخدم هو نفسه
  if (isSelf) {
    hasAccess = hasAccess && checkIsSelf(isSelf);
  }

  return <>{hasAccess ? children : fallback}</>;
};