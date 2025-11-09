// ROLE/types.ts

export const USER_ROLES = {
    EMPLOYEE: 'employee',
    ACCOUNTANT: 'accountant',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin',
    OWNER: 'owner'
  } as const;
  
  export type UserRole = 'employee' | 'accountant' | 'admin' | 'super_admin' | 'owner'; 
  
  export const ROLE_HIERARCHY = [
    'employee',
    'accountant',
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
    | 'canManageSuperAdmins'
    | 'canManageCash'    
    | 'canFeedCash';
  
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
      canManageSuperAdmins: false,
      canManageCash: true, 
      canFeedCash: false
    },
    accountant: {
          canViewDashboard: true,
          canManageCheckInOut: false,
          canViewHistory: false,
          canManageBranches: true,
          canDeleteBranches : false,
          canManageEmployees: false,
          canManageCars: false,
          canManagePlates: false,
          canManageAdmins: false,
          canManageSuperAdmins: false,
          canManageCash: true,   
          canFeedCash: true    
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
      canManageSuperAdmins: false,
      canManageCash: true,   
      canFeedCash: false   
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
      canManageSuperAdmins: false,
      canManageCash: true,   
      canFeedCash: true,
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
      canManageSuperAdmins: true,
      canManageCash: true,   
      canFeedCash: true   
    }
  } as const;
  
  export interface User {
    id: string;
    name: string;
    EmID: number;
    role: UserRole;
    branch: string;
  }