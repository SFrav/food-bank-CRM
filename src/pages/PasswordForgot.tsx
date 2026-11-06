import { useState, useEffect } from 'react';
// import { supabase } from '@/integrations/supabase/client';
import { Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { usePasswordReset } from '@/hooks/usePasswordReset'; 

export default function RecoverPassword() {
  const { loading, setSession, executeChangeByLink } = usePasswordReset();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes('session[')) {
      window.location.href = '/auth';
      return;
    }
    const params = new URLSearchParams(hash.slice(1));
    const accessToken = params.get('session[access_token]');
    const refreshToken = params.get('session[refresh_token]');
    if (accessToken) {
      setSession(accessToken, refreshToken);
    }
  });

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus('error');
      return;
    }
    try {
      await executeChangeByLink(newPassword);
      setStatus('success');
      setTimeout(() => window.location.href = '/dashboard', 2000);
    } catch {
      setStatus('error');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recover Password</CardTitle>
        <CardDescription>Enter your new secure password below.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="new_password" className="flex items-center gap-2">
              <Lock className="size-4" /> New Password
            </Label>
            <Input id="new_password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" className="max-w-[250px]" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_password" className="flex items-center gap-2">
              <Lock className="size-4" /> Confirm New Password
            </Label>
            <Input id="confirm_password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="max-w-[250px]" required />
          </div>
          {status === 'error' && <p className="text-sm text-red-500 text-center">Failed to update password. Please try again.</p>}
          {status === 'success' && <p className="text-sm text-green-600 text-center">Password updated successfully. Redirecting...</p>}
          <Button type="submit" disabled={loading || status === 'success'} className="w-full md:w-auto">
            {loading ? 'Updating...' : 'Reset Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}