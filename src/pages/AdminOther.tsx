import { RegionManagement } from '@/components/RegionManagement';
import { PermissionGuard } from '@/components/PermissionGuard';
import { EntityManagement } from '@/components/EntityManagement';
import { EntitySettingsTable } from '@/components/EntitySettings';
// import { GlobalSettings } from '@/components/GlobalSettings';
import { DivisionManagement } from '@/components/DivisionManagement';
import { DivisionSettingsTable } from '@/components/DivisionSettings';
import { DivisionOpenTable } from '@/components/DivisionOpen';


export default function AdminOther() {
  return (
    <div className="space-y-6">
      
        <div className="space-y-6">
          <PermissionGuard permission="canCreateEntities">
            <div className="grid gap-6 md:grid-cols-2">
              <RegionManagement />
            </div>
              
            <EntityManagement />
          </PermissionGuard>

          <PermissionGuard permission="canEditEntityDivSettings">
          <EntitySettingsTable />
          </PermissionGuard>

          <PermissionGuard permission="canEditEntityDivSettings">
            <DivisionManagement />     
          </PermissionGuard>

          <PermissionGuard permission="canManageDivisionOpen">
            <DivisionSettingsTable />
            <DivisionOpenTable />
          </PermissionGuard>
          
          {/* <GlobalSettings /> */}
                 
        </div>
      
    </div>
  );
}