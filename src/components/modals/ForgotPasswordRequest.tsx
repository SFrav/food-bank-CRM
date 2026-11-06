// import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { Loader2 } from 'lucide-react';

interface ForgotPasswordRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  setEmail: (val: string) => void;
  validateEmail: string | null;
  status: 'idle' | 'success' | 'error';
  loading: boolean;
  onReset: () => Promise<void>;
}

export default function ForgotPasswordRequestModal({ isOpen, onClose, email, setEmail, validateEmail, status, onReset }: ForgotPasswordRequestModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-md max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Reset Password</DialogTitle>
          <DialogDescription className="text-center">
            Enter your registered email address. A secure recovery link will be sent immediately
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex flex-col gap-2">
            <label className="pb-2 text-sm font-medium">Registered Email</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-12"
              disabled={status === 'success'}
            />
          </div>
          {validateEmail && email && (
            <p className="text-sm text-red-500 text-center">{validateEmail}</p>
          )}
          {status === 'success' && (
            <p className="text-sm text-green-600 text-center">Recovery email sent successfully.</p>
          )}
          <Button
            onClick={onReset}
            className="w-full h-12"
            disabled={!!validateEmail || status === 'success'}
          >
            'Send Recovery Email'
          </Button>
          <button
            type="button"
            className="w-full text-sm text-muted-foreground underline"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}