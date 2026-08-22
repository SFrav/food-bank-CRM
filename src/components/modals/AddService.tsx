import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {useServices, Service} from "@/hooks/useServices"
import { useRegions, Region } from '@/hooks/useRegions';
// import { toast } from "sonner";

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
  region_id: string;
}

interface AddServiceModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onServiceAdded: () => void;
}

export default function AddServiceModal({ isOpen, onOpenChange, onServiceAdded}: AddServiceModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const {createService} = useServices();
  const { regions } = useRegions();
  
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
    },
    region_id: ''
  });

  const handleSubmit = useCallback(async () => {
    if(!formData.name.trim()) return;

    setIsLoading(true);
    const newService: Service = {
      id: '', 
      name: formData.name.trim(),
      org_type: 'ngo', 
      service: formData.service.trim() || null,
      address: {
        street: formData.address.street.trim(),
        city: formData.address.city.trim(),
        state: formData.address.state.trim(),
        postcode: formData.address.postcode.trim(),
        country: formData.address.country.trim(),
      },
      region_id: formData.region_id,
      website: formData.website.trim() || null,
      phone: formData.phone.trim() || null,
      email: formData.email.trim() || null,
      approval_status: null, 
      is_active: true,      
      notes: formData.notes.trim() || null,
      created_by: null,     
      created_at: '',     
    };

    const { success, error } = await createService(newService);
    if(success){
      handleReset();
      onOpenChange(false);
      onServiceAdded();
    };
    setIsLoading(false);
  }, [createService]);

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
      },
      region_id: ''
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

  const handleClose = () => {
    onOpenChange(false);
    handleReset();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {'Add New Service'}
          </DialogTitle>
          <DialogDescription> </DialogDescription>
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
            
            {/* Address */}
            <div className="space-y-3">
              {/* <h4 className="font-medium">Address</h4> */}
              
              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input 
                  id="street"
                  value={formData.address.street}
                  onChange={(e) => setFormData(prev => ({
                    ...prev, 
                    address: {...prev.address, street: e.target.value}
                  }))}
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
              <div className="max-w-[200px]">
                <Label htmlFor="region">Region *</Label>
                <Select
                  required={true}
                  value={formData.region_id || "none"}
                  onValueChange={v => {
                    setFormData({ ...formData, region_id: v });
                    setFormData(prev => ({...prev, address: {...prev.address, city: regions.find(r=>r.id===v)?.name ?? prev.address.city}}))
                  }}
                >
                  <SelectTrigger >
                    <SelectValue placeholder="Select Region"/>
                  </SelectTrigger>
                  <SelectContent>
                    {regions.filter((r) => r.is_active === true).map(re => (
                      <SelectItem key={re.id} value={re.id}>
                        {re.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
                {/* <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city"
                    value={formData.address.city}
                    onChange={(e) => setFormData(prev => ({
                      ...prev, 
                      address: {...prev.address, city: e.target.value}
                    }))}
                    placeholder="City"
                  />
                </div> */}
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input 
                    id="state"
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
                  <Label htmlFor="postcode">Postal Code</Label>
                  <Input 
                    id="postcode"
                    value={formData.address.postcode}
                    onChange={(e) => setFormData(prev => ({
                      ...prev, 
                      address: {...prev.address, postcode: e.target.value}
                    }))}
                    placeholder="Postcode"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input 
                    id="country"
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
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!formData.name.trim() || isLoading}
          >
            {isLoading ? 'Creating...' : 'Create service'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}