import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Chrome, Clock, LogOut } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [formData, setFormData] = useState({ email: '', password: '', fullName: '' });

  const justSignedIn = useRef(false);
  const justSignedUp = useRef(false);
  const [showPendingModal, setShowPendingModal] = useState(false);

  useEffect(() => {
    if (!user || profileLoading) return;
    if (justSignedUp.current) return; 
    if (!profile) return;

    if (profile.role === 'pending') {
      if (justSignedIn.current || justSignedUp.current) {
        setShowPendingModal(true);
      }
      return;
    }

    navigate('/', { replace: true });
  }, [user, profile, profileLoading, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(formData.email, formData.password);
    if (error) {
      toast.error(error.message);
    } else {
      justSignedIn.current = true;
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(formData.email, formData.password, formData.fullName);
    if (error) {
      toast.error(error.message);
    } else {
      justSignedUp.current = true;
      setShowPendingModal(true);
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  const handlePendingDismiss = () => {
    setShowPendingModal(false);
    justSignedIn.current = false;
    justSignedUp.current = false;
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-background">
      {/* Left pane */}
      <div className="relative hidden lg:flex flex-col justify-between bg-gray-900 p-8 text-white">
        <div className="absolute inset-0 z-0">
          <img
            alt=""
            src="/auth-background.png"
            className="h-full w-full object-cover opacity-30"
          />
        </div>
        <div className="relative z-10">
          <span className="text-xl font-semibold">Food bank CRM</span>
        </div>
        <div className="relative z-10">
          <h1 className="text-xl font-semibold leading-tight tracking-tight">Scotland's food bank network</h1>
          <p className="mt-2 max-w-md text-base text-gray-300">
            Short-term support for people in crisis 
          </p>
        </div>
      </div>

      {/* Right form pane */}
      <div className="flex w-full items-center justify-center bg-background p-6 sm:p-8">
        <div className="w-full max-w-md space-y-8">
          {tab === 'signin' ? (
            <div>
              <p className="text-xl font-black tracking-tight">Welcome</p>
              <p className="text-base text-muted-foreground">Sign in to continue to your dashboard</p>
            </div>
          ) : (
            <div>
              <p className="text-xl font-black tracking-tight">Create an Account</p>
              <p className="text-base text-muted-foreground">Your account will be reviewed before activation</p>
            </div>
          )}

          <Tabs value={tab} onValueChange={(v) => setTab(v as 'signin' | 'signup')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-6">
              <form onSubmit={handleSignIn} className="space-y-4">
                <label className="flex flex-col">
                  <p className="pb-2 text-sm font-medium">Email Address</p>
                  <Input name="email" type="email" value={formData.email}
                    onChange={handleInputChange} placeholder="you@example.com" required className="h-12" />
                </label>
                <label className="flex flex-col">
                  <p className="pb-2 text-sm font-medium">Password</p>
                  <Input name="password" type="password" value={formData.password}
                    onChange={handleInputChange} placeholder="Enter your password" required className="h-12" />
                </label>
                <Button type="submit" className="w-full h-12" disabled={loading}>
                  {loading ? <><Loader2 className="mr-2 size-4 animate-spin" />Signing in…</> : 'Sign In'}
                </Button>
              </form>
              <p className="text-center text-sm text-muted-foreground">
                No account?{' '}
                <button type="button" className="font-medium text-primary underline"
                  onClick={() => setTab('signup')}>Sign Up</button>
              </p>
            </TabsContent>

            <TabsContent value="signup" className="space-y-6">
              <form onSubmit={handleSignUp} className="space-y-4">
                <label className="flex flex-col">
                  <p className="pb-2 text-sm font-medium">Full Name</p>
                  <Input name="fullName" type="text" value={formData.fullName}
                    onChange={handleInputChange} placeholder="Your full name" className="h-12" />
                </label>
                <label className="flex flex-col">
                  <p className="pb-2 text-sm font-medium">Email</p>
                  <Input name="email" type="email" value={formData.email}
                    onChange={handleInputChange} placeholder="you@example.com" required className="h-12" />
                </label>
                <label className="flex flex-col">
                  <p className="pb-2 text-sm font-medium">Password</p>
                  <Input name="password" type="password" value={formData.password}
                    onChange={handleInputChange} placeholder="Create a strong password" required className="h-12" />
                </label>
                <Button type="submit" className="w-full h-12" disabled={loading}>
                  {loading ? <><Loader2 className="mr-2 size-4 animate-spin" />Creating account…</> : 'Create Account'}
                </Button>
              </form>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <button type="button" className="font-medium text-primary underline"
                  onClick={() => setTab('signin')}>Sign In</button>
              </p>
            </TabsContent>
          </Tabs>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button variant="outline" onClick={handleGoogleSignIn} disabled={loading} className="w-full h-12">
            <Chrome className="mr-2 size-4" />Google
          </Button>
        </div>
      </div>

      {/* Pending modal — new signups and returning pending users */}
      <Dialog open={showPendingModal} onOpenChange={(open) => { if (!open) handlePendingDismiss(); }}>
        <DialogContent className="sm:max-w-md max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-center mb-2">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                <Clock className="size-7 text-yellow-600" />
              </div>
            </div>
            <DialogTitle className="text-center">Account Pending Approval</DialogTitle>
            <DialogDescription className="text-center">
              Your account has been created and is awaiting role assignment by an administrator.
              This usually takes 1–2 business days.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-sm text-muted-foreground py-2">
            <p>Once approved you'll receive access to your dashboard. In the meantime:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>A system administrator will review your account</li>
              <li>You'll be assigned to the appropriate role and team</li>
              <li>Contact your administrator if you have any questions</li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;
