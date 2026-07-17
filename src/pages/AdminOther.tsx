import { RegionManagement } from '@/components/RegionManagement';
import { PermissionGuard } from '@/components/PermissionGuard';
import { EntityManagement } from '@/components/EntityManagement';
import { EntitySettingsTable } from '@/components/EntitySettings';
// import { GlobalSettings } from '@/components/GlobalSettings';
import { DivisionDepartmentManagement } from '@/components/DivisionDepartmentManagement';
import { DivisionSettingsTable } from '@/components/DivisionSettings';

export default function AdminOther() {
  return (
    <div className="space-y-6">
      <PermissionGuard permission="canAccessUserManagement">
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <RegionManagement />
          </div>
              
          <EntityManagement />

          <EntitySettingsTable />

          <DivisionDepartmentManagement />   

          <DivisionSettingsTable />  
          
          {/* <GlobalSettings /> */}
                 
        </div>
      </PermissionGuard>
    </div>
  );
}