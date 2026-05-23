import { Settings2, Search, Filter, Save, Check, X } from 'lucide-react';
import { PermissionGuard } from '@/components/PermissionGuard';
import { AuditLogViewer } from '@/components/AuditLogViewer';

export default function AdminLogs() {
  return (
    <div className="space-y-6">
      {/* <div className="flex items-center gap-2">
        <Settings2 className="size-8 text-primary" />
        <h1 className="text-3xl font-semibold text-foreground">Admin Dashboard</h1>
      </div> */}

      <PermissionGuard permission="canAccessUserManagement">
        <div className="space-y-6">
          
          <AuditLogViewer />
          
        </div>
      </PermissionGuard>
    </div>
  );
}