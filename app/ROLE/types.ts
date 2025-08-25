// ROLE/types.ts

export const USER_ROLES = {
    EMPLOYEE: 'employee',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin',
    OWNER: 'owner'
  } as const;
  
  export type UserRole = 'employee' | 'admin' | 'super_admin' | 'owner';
  
  export const ROLE_HIERARCHY = [
    'employee',
    'admin',
    'super_admin',
    'owner'
  ] as const;
  
  export type PermissionKey = 
    | 'canViewDashboard'
    | 'canManageCheckInOut'
    | 'canViewHistory'
    | 'canManageBranches'
    | 'canDeleteBranches'
    | 'canManageEmployees'
    | 'canManageCars'
    | 'canManagePlates'
    | 'canManageAdmins'
    | 'canManageSuperAdmins';
  
  export const ROLE_PERMISSIONS = {
    employee: {
      canViewDashboard: true,
      canManageCheckInOut: true,
      canViewHistory: true,
      canManageBranches: false,
      canManageEmployees: false,
      canDeleteBranches : false,
      canManageCars: false,
      canManagePlates: false,
      canManageAdmins: false,
      canManageSuperAdmins: false
    },
    admin: {
      canViewDashboard: true,
      canManageCheckInOut: true,
      canViewHistory: true,
      canManageBranches: true,
      canDeleteBranches : false,
      canManageEmployees: true,
      canManageCars: true,
      canManagePlates: true,
      canManageAdmins: false,
      canManageSuperAdmins: false
    },
    super_admin: {
      canViewDashboard: true,
      canManageCheckInOut: true,
      canViewHistory: true,
      canManageBranches: true,
      canDeleteBranches : false,
      canManageEmployees: true,
      canManageCars: true,
      canManagePlates: true,
      canManageAdmins: true,
      canManageSuperAdmins: false
    },
    owner: {
      canViewDashboard: true,
      canManageCheckInOut: true,
      canViewHistory: true,
      canManageBranches: true,
      canDeleteBranches : true,
      canManageEmployees: true,
      canManageCars: true,
      canManagePlates: true,
      canManageAdmins: true,
      canManageSuperAdmins: true
    }
  } as const;
  
  export interface User {
    id: string;
    name: string;
    EmID: number;
    role: UserRole;
    branch: string;
  }