import { PermissionGuard } from '@/components/PermissionGuard';
import { CountryManagement } from '@/components/CountryManagement';
import { RegionManagement } from '@/components/RegionManagement';
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
            <div className="grid gap-0 md:grid-cols-[45%_55%]">
              <CountryManagement />
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