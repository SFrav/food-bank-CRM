import { useProfile } from './useProfile';

export interface PermissionSet {
  canAccessUserManagement: boolean;
  canAccessAllReports: boolean;
  canAccessAnalytics: boolean;
  canDeleteRecords: boolean;
  canCreateOrganizations: boolean;
  canApproveOrganizations: boolean;
  canAssignBeneficiaries: boolean;
  canApproveBeneficiaries: boolean;
  canSetManagerTargets: boolean;
  canSetAccountManagerTargets: boolean;
  canViewAllManagerReports: boolean;
  canViewAllAccountManagerReports: boolean;
  canProposeReassignments: boolean;
  canApproveReassignments: boolean;
  canCrudContacts: boolean;
  canCrudTasks: boolean;
}

const NO_PERMISSIONS: PermissionSet = {
  canAccessUserManagement: false,
  canAccessAllReports: false,
  canAccessAnalytics: false,
  canDeleteRecords: false,
  canCreateOrganizations: false,
  canApproveOrganizations: false,
  canAssignBeneficiaries: false,
  canApproveBeneficiaries: false,
  canSetManagerTargets: false,
  canSetAccountManagerTargets: false,
  canViewAllManagerReports: false,
  canViewAllAccountManagerReports: false,
  canProposeReassignments: false,
  canApproveReassignments: false,
  canCrudContacts: false,
  canCrudTasks: false,
};

const BASE_CRUD: Partial<PermissionSet> = {
  canCrudContacts: true,
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
        canAssignBeneficiaries: true,
        canApproveBeneficiaries: true,
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
        canAssignBeneficiaries: true,
        canApproveBeneficiaries: true,
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
        canApproveOrganizations: true,
        canApproveBeneficiaries: true,
        canAssignBeneficiaries: true,
        canProposeReassignments: true,
        canApproveReassignments: false,
      } as PermissionSet;

    case 'branch_manager':
      return {
        ...BASE_CRUD,
        canAccessUserManagement: false,
        canAccessAnalytics: false,
        canDeleteRecords: false,
        canApproveOrganizations: true,
        canAssignBeneficiaries: true,
        canApproveBeneficiaries: true,
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
        canAssignBeneficiaries: false,
        canApproveBeneficiaries: false,
        canProposeReassignments: false,
        canApproveReassignments: false,
      } as PermissionSet;

    case 'referrer':
      return {
        ...BASE_CRUD,
        canAccessUserManagement: false,
        canAccessAnalytics: false,
        canDeleteRecords: false,
        canApproveOrganizations: false,
        canAssignBeneficiaries: true,
        canApproveBeneficiaries: false,
        canProposeReassignments: false,
        canApproveReassignments: false,
      } as PermissionSet;

    default:
      return NO_PERMISSIONS;
  }
};
