import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, Settings, Crown, Users, Target, User } from 'lucide-react';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EntityManagement } from '@/components/EntityManagement';

export const GlobalSettings = () => {
  const {
    loading,
    getEntityMode,
    getDashboardDisplay,
    setEntityMode,
    setDashboardDisplay
  } = useSystemSettings();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Entity Mode State
  const [entityMode, setEntityModeState] = useState<'single' | 'multi'>('single');

  // Dashboard Display State
  const [showTitleAndRegion, setShowTitleAndRegion] = useState(false);

  useEffect(() => {
    if (!loading) {
      const entitySettings = getEntityMode();
      const dashboardSettings = getDashboardDisplay();

      setEntityModeState(entitySettings.mode);
      setShowTitleAndRegion(dashboardSettings.showTitleAndRegion);
    }
  }, [loading, getEntityMode, getDashboardDisplay]);

  const handleSaveEntityMode = async () => {
    setIsSubmitting(true);
    const { error } = await setEntityMode(entityMode);

    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Success',
        description: 'Entity mode updated successfully'
      });
    }
    setIsSubmitting(false);
  };

  const handleSaveDashboardDisplay = async () => {
    setIsSubmitting(true);
    const { error } = await setDashboardDisplay(showTitleAndRegion);

    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Success',
        description: 'Dashboard display settings updated successfully'
      });
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="size-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">

      {/* Entity Mode Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="size-5" />
            Entity Mode Configuration
          </CardTitle>
          <CardDescription>
            Configure how your organization handles multiple entities and business units.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-medium">Entity Mode</Label>
            <RadioGroup
              value={entityMode}
              onValueChange={(value: 'single' | 'multi') => setEntityModeState(value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="single" id="entity-single" />
                <Label htmlFor="entity-single" className="cursor-pointer">
                  <div>
                    <div className="font-medium">Single Entity (Default)</div>
                    <div className="text-sm text-muted-foreground">
                      One organizational entity. All Managers auto-linked to Head.
                    </div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="multi" id="entity-multi" />
                <Label htmlFor="entity-multi" className="cursor-pointer">
                  <div>
                    <div className="font-medium">Multi Entity</div>
                    <div className="text-sm text-muted-foreground">
                      Multiple entities. Admin must assign Managers to specific Head/Entity.
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Alert>
            <AlertDescription>
              <strong>Assignment Rules:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li><strong>Branch Manager:</strong> Admin picks Manager (auto-inherits Head + Entity)</li>
                <li><strong>Manager:</strong> Admin picks Head (auto-inherits Entity)</li>
                <li><strong>Head:</strong> {entityMode === 'single' ? 'Automatically covers all Managers' : 'Admin selects Entity and assigns Managers'}</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Button
            onClick={handleSaveEntityMode}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : null}
            Save Entity Mode
          </Button>
        </CardContent>
      </Card>

      {/* Entity Management - Show when in multi-entity mode */}
      {entityMode === 'multi' && <EntityManagement />}

      {/* Dashboard Display Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="size-5" />
            Dashboard Display Options
          </CardTitle>
          <CardDescription>
            Configure what additional information appears on dashboard headers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Show Title & Region on Dashboards</Label>
              <div className="text-sm text-muted-foreground">
                When ON, dashboard headers show Role + Badge + (Title, Region)
              </div>
            </div>
            <Switch
              checked={showTitleAndRegion}
              onCheckedChange={setShowTitleAndRegion}
            />
          </div>

          <Alert>
            <AlertDescription>
              <strong>Examples:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li><strong>OFF:</strong> "Team Dashboard: Operational Leader"</li>
                <li><strong>ON:</strong> "Team Dashboard: Operational Leader (Retail, APAC)"</li>
              </ul>
              <div className="mt-2">
                <strong>Note:</strong> Badges remain fixed per role and are never user-editable.
                Titles/Regions are dropdowns only (no free-text) and managed by Admin.
              </div>
            </AlertDescription>
          </Alert>

          <Button
            onClick={handleSaveDashboardDisplay}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : null}
            Save Dashboard Display
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};