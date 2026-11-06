import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/useToast';
import { useCountries } from '@/hooks/useCountries';
import { useRegions } from '@/hooks/useRegions';
import { useEntities } from '@/hooks/useEntities';
import { useApplication, ApplicationResult } from '@/hooks/useApplication';
import { usePasswordReset } from '@/hooks/usePasswordReset';
import ForgotPasswordRequestModal from '@/components/modals/ForgotPasswordRequest';

// Types for form data
interface FormData {
  email: string;
  password: string;
  fullName: string;
  countryId: string;
  regionId: string;
  entityId: string;
  entityName: string;
}

const Auth = () => {
  const { user, signIn, loading: profileLoading } = useAuth();
  const { profile } = useProfile();
  const { status, resetEmail, setResetEmail, validateResetEmail, executeResetByEmail, loading: resetLoading } = usePasswordReset();
  const { toast } = useToast();
  const { countries, loading: loadingCountries } = useCountries();
  const { regions } = useRegions();
  const { entities } = useEntities();
  const { application, loading: applicationLoading, error: applicationError, reset } = useApplication();

  const navigate = useNavigate();

  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [isEntityApplication, setIsEntityApplication] = useState(false);
  const [isReferrerApplication, setIsReferrerApplication] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '', password: '', fullName: '', countryId: '', regionId: '', entityId: '', entityName: ''
  });
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const justSignedIn = useRef(false);
  const justSignedUp = useRef(false);

  useEffect(() => {
    if (!user || profileLoading) return;
    if (justSignedUp.current) return;
    if (tab === 'signin') justSignedUp.current = false; 
    navigate('/', { replace: true });

    if (profile) {
      if (profile.role === 'pending') {
        if (justSignedIn.current || justSignedUp.current) {
          setShowPendingModal(true);
        }
        return;
      }
      navigate('/', { replace: true });
    }
  }, [user, profile, profileLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const filteredRegions = useMemo(() => {
    if (!countries || !regions || !formData.countryId) return [];
    return regions.filter(r => r.country_id === formData.countryId);
  }, [countries, regions, formData.countryId]);

  const filteredEntities = useMemo(() => {
    if (!countries || !entities || !formData.countryId) return [];  
    if (isReferrerApplication) return entities.filter(e => e.country_id === formData.countryId && e.is_active && e.is_referrer);
    return entities.filter(e => e.country_id === formData.countryId && e.is_active && !e.is_referrer);
  }, [countries, entities, formData.countryId]);
  

  const handleSignUp = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (applicationLoading) return;

    const result: ApplicationResult = await application(
      formData.email,
      formData.fullName,
      formData.countryId,
      formData.regionId || null,
      isEntityApplication ? null : formData.entityId,
      isEntityApplication ? formData.entityName : null,
      isReferrerApplication,
      isEntityApplication
    );

    if (result.error) {
      toast({ title: 'Application Error', description: result.error, variant: 'destructive' });
    } else {
      justSignedUp.current = true;
      setShowPendingModal(true);
      reset();
      setFormData({ email: '', password: '', fullName: '', countryId: '', regionId: '', entityId: '', entityName: '' });
      setIsEntityApplication(false);
      setIsReferrerApplication(false);
    }
  };

  const handleSignIn = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (profileLoading) return;

    const { error } = await signIn(formData.email, formData.password);
    if (error) {
      toast({ title: 'Error', description: error.message || 'Failed to sign-in', variant: 'destructive' });
    } else {
      justSignedIn.current = true;
      justSignedUp.current = false;
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
          <img alt="" src="/auth-background.png" className="h-full w-full object-cover opacity-30" />
        </div>
        <div className="relative z-10">
          <span className="text-xl font-semibold">Food bank CRM</span>
        </div>
        <div className="relative z-10">
          <h1 className="text-xl font-semibold leading-tight tracking-tight">Scotland's food bank network</h1>
          <p className="mt-2 max-w-md text-base text-gray-300">Short-term support for people in crisis</p>
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

          <Tabs value={tab} onValueChange={(v) => { 
            setTab(v as 'signin' | 'signup'); 
            if (v === 'signin') {
              justSignedUp.current = false;
            }
            if (v === 'signup') {
              justSignedIn.current = false;
            }
            setFormData({ email: '', password: '', fullName: '', countryId: '', regionId: '', entityId: '', entityName: '' });
          }} 
          className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* Sign In Content */}
            <TabsContent value="signin" className="space-y-6">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="pb-2 text-sm font-medium">Email Address</label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    required
                    className="h-12"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="pb-2 text-sm font-medium">Password</label>
                  <Input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    required
                    className="h-12"
                  />
                </div>
                <div className="text-center mt-1">
                  <button
                    type="button"
                    className="text-sm text-primary underline"
                    onClick={() => setShowResetModal(true)}
                  >
                    Reset password
                  </button>
                </div>
                <div className="text-center" >
                <Button type="submit" className="w-[150px] text-center">
                  {profileLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Signing in…
                    </div>
                  ) : 'Sign In'}
                </Button>
                </div>
              </form>
              <p className="text-center text-sm text-muted-foreground">
                No account?{' '}
                <button
                  type="button"
                  className="font-medium text-primary underline"
                  onClick={() => setTab('signup')}
                >
                  Sign Up
                </button>
              </p>
            </TabsContent>

            {/* Sign Up Content */}
            <TabsContent value="signup" className="space-y-6">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="flex items-center gap-2 mt-4">
                  <input type='checkbox'
                    checked={isEntityApplication}
                    onChange={(e) => {
                      setIsEntityApplication((e.target as unknown as HTMLInputElement).checked);
                      setFormData(prev => ({ ...prev, entityId: '' }));
                      setFormData(prev => ({ ...prev, entityName: '' }));
                      setIsReferrerApplication(false);
                    }
                  }
                  />
                  <label className="text-sm w-full">Application for new organisation (org. head details)</label>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    checked={isReferrerApplication}
                    onChange={(e) => setIsReferrerApplication((e.target as HTMLInputElement).checked)}
                  />
                  <label className="text-sm">Referrers only (not managing a foodbank)</label>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="pb-2 text-sm font-medium w-[250px]">Full Name</label>
                  <Input
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    className="h-12"
                  />
                </div>
                <div className="flex flex-col gap-2 w-[250px]">
                  <label className="pb-2 text-sm font-medium">Email</label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    required
                    className="h-12"
                  />
                </div>
                {/* <div className="flex flex-col gap-2">
                  <label className="pb-2 text-sm font-medium">Password</label>
                  <Input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Create a strong password"
                    required
                    className="h-12"
                  />
                </div> */}

                <div className="flex flex-col gap-2">
                  <label className="pb-2 text-sm font-medium">Country*</label>
                  <Select
                    value={formData.countryId}
                    onValueChange={(v) => handleSelectChange('countryId', v)}
                  >
                    <SelectTrigger className="w-[240px]">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries?.filter(c => c.is_active).map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <label className="pb-2 text-sm font-medium">Region</label>
                  <Select
                    value={formData.regionId}
                    onValueChange={(v) => handleSelectChange('regionId', v)}
                    disabled={formData.countryId === ''}
                  >
                    <SelectTrigger className="w-[240px]">
                      <SelectValue placeholder="Select region"/>
                    </SelectTrigger>
                    <SelectContent>
                      {filteredRegions.map((r) => (
                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4 pt-4">                  
                  {isEntityApplication ? (
                    <div className="flex flex-col gap-2">
                      <label className="pb-2 text-sm font-medium w-[250px]">Entity Name</label>
                      <Input
                        name="entityName"
                        type="text"
                        value={formData.entityName}
                        onChange={handleInputChange}
                        placeholder="Entity name"
                        className="h-12"
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <label className="pb-2 text-sm font-medium">Organisation</label>
                      <Select
                        value={formData.entityId}
                        onValueChange={(v) => handleSelectChange('entityId', v)}
                        disabled={formData.countryId === ''}
                      >
                        <SelectTrigger className="w-[240px] sm:w-auto sm:min-w-auto">
                           <SelectValue placeholder="Select organisation"/>
                        </SelectTrigger>
                        <SelectContent>
                          {filteredEntities.map((e) => (
                            <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-[150px]" disabled={applicationLoading}>
                  {applicationLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Submitting Application…
                    </div>
                  ) : 'Submit Application'}
                </Button>
                {/* {applicationError && <p className="text-sm text-red-500 text-center">{applicationError}</p>} */}
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Pending modal */}
      <Dialog open={showPendingModal} onOpenChange={(open) => { if (!open) setShowPendingModal(false); }}>
        <DialogContent className="sm:max-w-md max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-center mb-2">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                <Clock className="size-7 text-yellow-600" />
              </div>
            </div>
            <DialogTitle className="text-center">Account Pending Approval</DialogTitle>
            <DialogDescription className="text-center">
              Your application has been submitted and is under review.
              This usually takes 1–2 business days.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-sm text-muted-foreground py-2">
            <p>Once approved you'll receive access to your dashboard. In the meantime:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>A system administrator will review your account</li>
              <li>You'll be assigned to the appropriate role</li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Password Modal */}
          <ForgotPasswordRequestModal
            isOpen={showResetModal}
            onClose={() => {setShowResetModal(false);}}
            email={resetEmail}
            setEmail={setResetEmail}
            validateEmail={validateResetEmail}
            status={status}
            loading={resetLoading}
            onReset={executeResetByEmail}
          />
    </div>
  );
};

export default Auth;