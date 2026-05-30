import { useProfile } from './useProfile';

export interface PermissionSet {
  canAccessUserManagement: boolean;
  canAccessAllReports: boolean;
  canAccessAnalytics: boolean;
  canDeleteRecords: boolean;
  canCreateOrganizations: boolean;
  canApproveOrganizations: boolean;
  canApproveDealsOver1B: boolean;
  canApproveDeals500MTo1B: boolean;
  canApproveAllDeals: boolean;
  canSetManagerTargets: boolean;
  canSetAccountManagerTargets: boolean;
  canViewAllManagerReports: boolean;
  canViewAllAccountManagerReports: boolean;
  canProposeReassignments: boolean;
  canApproveReassignments: boolean;
  canCrudCustomers: boolean;
  canCrudDeals: boolean;
  canCrudTasks: boolean;
}

const NO_PERMISSIONS: PermissionSet = {
  canAccessUserManagement: false,
  canAccessAllReports: false,
  canAccessAnalytics: false,
  canDeleteRecords: false,
  canCreateOrganizations: false,
  canApproveOrganizations: false,
  canApproveDealsOver1B: false,
  canApproveDeals500MTo1B: false,
  canApproveAllDeals: false,
  canSetManagerTargets: false,
  canSetAccountManagerTargets: false,
  canViewAllManagerReports: false,
  canViewAllAccountManagerReports: false,
  canProposeReassignments: false,
  canApproveReassignments: false,
  canCrudCustomers: false,
  canCrudDeals: false,
  canCrudTasks: false,
};

const BASE_CRUD: Partial<PermissionSet> = {
  canCrudCustomers: true,
  canCrudDeals: true,
  canCrudTasks: true,
  canCreateOrganizations: true,
};

export const usePermissions = (): PermissionSet => {
  const { profile } = useProfile();

  if (!profile || profile.role === 'pending') return NO_PERMISSIONS;

  switch (profile.role) {
    case 'admin':
      return {
        ...BASE_CRUD,
        canAccessUserManagement: true,
        canAccessAnalytics: true,
        canDeleteRecords: true,
        canApproveOrganizations: true,
        canViewAllManagerReports: true,
        canProposeReassignments: true,
        canApproveReassignments: true,
      } as PermissionSet;

    case 'head':
      return {
        ...BASE_CRUD,
        canAccessUserManagement: true,
        canAccessAnalytics: true,
        canDeleteRecords: false,
        canApproveOrganizations: false,
        canViewAllManagerReports: true,
        canProposeReassignments: false,
        canApproveReassignments: true,
      } as PermissionSet;

    case 'manager':
      return {
        ...BASE_CRUD,
        canAccessUserManagement: true,
        canAccessAnalytics: true,
        canDeleteRecords: false,
        canApproveOrganizations: false,
        canProposeReassignments: true,
        canApproveReassignments: false,
      } as PermissionSet;

    case 'branch_manager':
      return {
        ...BASE_CRUD,
        canAccessUserManagement: false,
        canAccessAnalytics: false,
        canDeleteRecords: false,
        canApproveOrganizations: false,
        canProposeReassignments: false,
        canApproveReassignments: false,
      } as PermissionSet;

    case 'staff':
      return {
        ...BASE_CRUD,
        canAccessUserManagement: false,
        canAccessAnalytics: false,
        canDeleteRecords: false,
        canApproveOrganizations: false,
        canProposeReassignments: false,
        canApproveReassignments: false,
      } as PermissionSet;

    default:
      return NO_PERMISSIONS;
  }
};
