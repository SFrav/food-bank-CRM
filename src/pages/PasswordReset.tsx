import { useState, useCallback } from 'react';
import { Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';
import { usePasswordReset } from '@/hooks/usePasswordReset'; 

export default function PasswordReset() {
  const { toast } = useToast();
  const { loading, executeChangeByPassword } = usePasswordReset();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast({ title: 'Error', description: 'All password fields are required', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Error', description: 'New password and confirmation must match', variant: 'destructive' });
      return;
    }
    if (newPassword === oldPassword) {
      toast({ title: 'Error', description: 'New password must differ from the current password', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      await executeChangeByPassword(oldPassword, newPassword);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast({ title: 'Error', description: 'Failed to reset password', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  }, [oldPassword, newPassword, confirmPassword, executeChangeByPassword]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password Reset</CardTitle>
        <CardDescription>
          Securely update your account password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="old_password" className="flex items-center gap-2">
              <Lock className="size-4" />
              Current Password
            </Label>
            <Input
              id="old_password"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter current password"
              className="max-w-[250px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new_password" className="flex items-center gap-2">
              <Lock className="size-4" />
              New Password
            </Label>
            <Input
              id="new_password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="max-w-[250px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password" className="flex items-center gap-2">
              <Lock className="size-4" />
              Confirm New Password
            </Label>
            <Input
              id="confirm_password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="max-w-[250px]"
              required
            />
          </div>

           <div className="flex items-left"> {/*justify-end */}
            <Button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full md:w-auto"
            >
              {isSubmitting ? 'Updating...' : 'Reset Password'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}