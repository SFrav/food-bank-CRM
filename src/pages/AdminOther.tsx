import { Settings2, Search, Filter, Save, Check, X } from 'lucide-react';
import { TitleManagement } from '@/components/TitleManagement';
import { RegionManagement } from '@/components/RegionManagement';
import { PermissionGuard } from '@/components/PermissionGuard';
import { EntityManagement } from '@/components/EntityManagement';
import { GlobalSettings } from '@/components/GlobalSettings';
import { DivisionDepartmentManagement } from '@/components/DivisionDepartmentManagement';

export default function AdminOther() {
  return (
    <div className="space-y-6">
      {/* <div className="flex items-center gap-2">
        <Settings2 className="size-8 text-primary" />
        <h1 className="text-3xl font-semibold text-foreground">Admin Dashboard</h1>
      </div> */}

      <PermissionGuard permission="canAccessUserManagement">
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <TitleManagement />
            <RegionManagement />
          </div>

          <DivisionDepartmentManagement />     
               
          <EntityManagement />
          
          <GlobalSettings />
                 
        </div>
      </PermissionGuard>
    </div>
  );
}