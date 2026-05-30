import { Settings2, Search, Filter, Save, Check, X } from 'lucide-react';
import { PermissionGuard } from '@/components/PermissionGuard';
import { AuditLogViewer } from '@/components/AuditLogViewer';

export default function AdminLogs() {
  return (
    <div className="space-y-6">

      <PermissionGuard permission="canAccessUserManagement">
        <div className="space-y-6">
          
          <AuditLogViewer />
          
        </div>
      </PermissionGuard>
    </div>
  );
}