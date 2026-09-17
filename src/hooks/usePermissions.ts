import { useProfile } from './useProfile';

export interface PermissionSet {
  canAccessUserManagement: boolean;
  canAccessAllReports: boolean;
  canAccessAnalytics: boolean;
  canDeleteRecords: boolean;
  canCreateEntities: boolean;
  canApproveEntities: boolean;
  canManageDivisionOpen: boolean;
  canDeleteDivisions: boolean;
  canEditEntityDivSettings: boolean;
  canAssignBeneficiaries: boolean;
  canApproveBeneficiaries: boolean;
  canMergeBeneficiaries: boolean;
  canServeBeneficiaries: boolean;
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
  canCreateEntities: false,
  canApproveEntities: false,
  canManageDivisionOpen: false,
  canDeleteDivisions: false,
  canEditEntityDivSettings: false,
  canAssignBeneficiaries: false,
  canApproveBeneficiaries: false,
  canMergeBeneficiaries: false,
  canServeBeneficiaries: false,
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
        canCreateEntities: true,
        canApproveEntities: true,
        canManageDivisionOpen: true,
        canDeleteDivisions: true,
        canEditEntityDivSettings: true,
        canAssignBeneficiaries: true,
        canApproveBeneficiaries: true,
        canMergeBeneficiaries: true,
        canServeBeneficiaries: true,
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
        canCreateEntities: false,
        canApproveEntities: false,
        canManageDivisionOpen: true,
        canDeleteDivisions: true,
        canEditEntityDivSettings: true,
        canAssignBeneficiaries: true,
        canApproveBeneficiaries: true,
        canMergeBeneficiaries: true,
        canServeBeneficiaries: true,
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
        canCreateEntities: false,
        canApproveEntities: false,
        canManageDivisionOpen: true,
        canDeleteDivisions: false,
        canEditEntityDivSettings: true,
        canApproveBeneficiaries: true,
        canMergeBeneficiaries: true,
        canServeBeneficiaries: true,
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
        canCreateEntities: false,
        canApproveEntities: false,
        canManageDivisionOpen: true,
        canDeleteDivisions: false,
        canEditEntityDivSettings: false,
        canAssignBeneficiaries: true,
        canApproveBeneficiaries: true,
        canMergeBeneficiaries: true,
        canServeBeneficiaries: true,
        canProposeReassignments: false,
        canApproveReassignments: false,
      } as PermissionSet;

    case 'staff':
      return {
        ...BASE_CRUD,
        canAccessUserManagement: false,
        canAccessAnalytics: false,
        canDeleteRecords: false,
        canCreateEntities: false,
        canApproveEntities: false,
        canManageDivisionOpen: false,
        canDeleteDivisions: false,
        canEditEntityDivSettings: false,
        canAssignBeneficiaries: false,
        canApproveBeneficiaries: false,
        canMergeBeneficiaries: true,
        canServeBeneficiaries: true,
        canProposeReassignments: false,
        canApproveReassignments: false,
      } as PermissionSet;

    case 'volunteer':
      return {
        ...BASE_CRUD,
        canAccessUserManagement: false,
        canAccessAnalytics: false,
        canDeleteRecords: false,
        canCreateEntities: false,
        canApproveEntities: false,
        canManageDivisionOpen: false,
        canDeleteDivisions: false,
        canEditEntityDivSettings: false,
        canAssignBeneficiaries: false,
        canApproveBeneficiaries: false,
        canMergeBeneficiaries: false,
        canServeBeneficiaries: true,
        canProposeReassignments: false,
        canApproveReassignments: false,
      } as PermissionSet;

    case 'referrer':
      return {
        ...BASE_CRUD,
        canAccessUserManagement: false,
        canAccessAnalytics: false,
        canDeleteRecords: false,
        canApproveEntities: false,
        canManageDivisionOpen: false,
        canDeleteDivisions: false,
        canEditEntityDivSettings: false,
        canAssignBeneficiaries: true,
        canApproveBeneficiaries: false,
        canMergeBeneficiaries: true,
        canServeBeneficiaries: false,
        canProposeReassignments: false,
        canApproveReassignments: false,
      } as PermissionSet;

    default:
      return NO_PERMISSIONS;
  }
};
