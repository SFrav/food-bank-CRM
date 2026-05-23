import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ServiceFormData {
  name: string;
  website: string;
  phone: string;
  email: string;
  service: string;
  notes: string;
  address: {
    street: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
}

interface AddServiceModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function AddServiceModal({ isOpen, onOpenChange, onSuccess}: AddServiceModalProps) {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    website: '',
    phone: '',
    email: '',
    service: '',
    notes: '',
    address: {
      street: '',
      city: '',
      state: '',
      postcode: '',
      country: 'Scotland'
    }
  });

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Service name is required');
      return;
    }

    setLoading(true);
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        toast.error('You must be logged in to create a service');
        return;
      }

      const { error } = await supabase
        .from('organizations')
        .insert({
          name: formData.name.trim(),
          website: formData.website.trim() || null,
          phone: formData.phone.trim() || null,
          email: formData.email.trim() || null,
          service: formData.service.trim() || null,
          address: formData.address,
          created_by: user.data.user.id,
          approval_status: 'draft',
          is_active: true
        });

      if (error) throw error;

      toast.success('Support service created successfully');
      onSuccess?.();
      handleReset();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating service:', error);
      toast.error(error.message || 'Failed to create service');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      website: '',
      phone: '',
      email: '',
      service: '',
      notes: '',
      address: {
        street: '',
        city: '',
        state: '',
        postcode: '',
        country: 'Scotland'
      }
    });
  };

  const services = [
    'Food bank',
    'Subsidised food',
    'Soup kitchen',
    'Advice',
    'Training',
    'Counselling',
    'Tool library',
    'Other'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {'Add New Service'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
                     
            <div className="space-y-2">
              <Label htmlFor="name">
                 Support Service Name <span className="text-destructive">*</span>
              </Label>
              <Input 
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                placeholder={'Enter service name'}
              />
            </div>



            <div className="space-y-2">
              <Label htmlFor="service">Service</Label>
              <Select 
                value={formData.service} 
                onValueChange={(value) => setFormData(prev => ({...prev, service: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map(service => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input 
                id="website"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({...prev, website: e.target.value}))}
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                placeholder="+44 7000 111 000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                placeholder="contact@service.com"
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Location of service</h3>
            
            {/* Billing Address */}
            <div className="space-y-3">
              {/* <h4 className="font-medium">Address</h4> */}
              
              <div className="space-y-2">
                <Label htmlFor="billing_street">Street Address</Label>
                <Input 
                  id="billing_street"
                  value={formData.address.street}
                  onChange={(e) => setFormData(prev => ({
                    ...prev, 
                    address: {...prev.address, street: e.target.value}
                  }))}
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="billing_city">City</Label>
                  <Input 
                    id="billing_city"
                    value={formData.address.city}
                    onChange={(e) => setFormData(prev => ({
                      ...prev, 
                      address: {...prev.address, city: e.target.value}
                    }))}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billing_state">State/Province</Label>
                  <Input 
                    id="billing_state"
                    value={formData.address.state}
                    onChange={(e) => setFormData(prev => ({
                      ...prev, 
                      address: {...prev.address, state: e.target.value}
                    }))}
                    placeholder="State"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="billing_postcode">Postal Code</Label>
                  <Input 
                    id="billing_postcode"
                    value={formData.address.postcode}
                    onChange={(e) => setFormData(prev => ({
                      ...prev, 
                      address: {...prev.address, postcode: e.target.value}
                    }))}
                    placeholder="Postcode"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billing_country">Country</Label>
                  <Input 
                    id="billing_country"
                    value={formData.address.country}
                    onChange={(e) => setFormData(prev => ({
                      ...prev, 
                      address: {...prev.address, country: e.target.value}
                    }))}
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea 
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
            placeholder="Additional notes about this service..."
            rows={3}
          />
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 pt-6 gap-3">
          <Button 
            variant="outline" 
            onClick={() => {
              handleReset();
              onOpenChange(false);
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!formData.name.trim() || loading}
          >
            {loading ? 'Creating...' : 'Create service'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}