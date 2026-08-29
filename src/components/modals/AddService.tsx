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


  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

  const handleServiceChange = useCallback((v: string) => setFormData(prev => (
      {...prev, service: v})
    ), []);

  const handleInputAddressChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, address: {...prev.address, [name]: value }}));
    }, []);

  const handleRegionChange = useCallback((v: string) => {
    setFormData(prev =>({ ...prev, region_id: v }));
    setFormData(prev => ({...prev, address: {...prev.address, city: regions.find(r=>r.id===v)?.name ?? prev.address.city}}));
    }, [regions]);


  const handleSubmit = useCallback(async (e?: React.SubmitEvent<HTMLFormElement>) => {
    e?.preventDefault();
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
      region_id: formData.region_id || null,
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
  }, [createService, formData]);

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

  const handleCancel = () => {
    handleReset();
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    handleReset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {'Add New Service'}
          </DialogTitle>
          <DialogDescription> </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={'Enter service name'}
              />
            </div>



            <div className="space-y-2">
              <Label htmlFor="service">Service</Label>
              <Select 
                name="service"
                value={formData.service} 
                onValueChange={handleServiceChange}
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
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+44 7000 111 000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
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
                  name="street"
                  value={formData.address.street}
                  onChange={handleInputAddressChange}
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
              <div className="max-w-[200px]">
                <Label htmlFor="region">Region*</Label>
                <Select
                  required={true}
                  disabled={false}
                  value={formData.region_id || ""}
                  onValueChange={handleRegionChange}
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
                    name="state"
                    value={formData.address.state}
                    onChange={handleInputAddressChange}
                    placeholder="State"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="postcode">Postal Code</Label>
                  <Input 
                    id="postcode"
                    name="postcode"
                    value={formData.address.postcode}
                    onChange={handleInputAddressChange}
                    placeholder="Postcode"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input 
                    id="country"
                    name="country"
                    value={formData.address.country}
                    onChange={handleInputAddressChange}
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
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Additional notes about this service..."
            rows={3}
          />
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 pt-6 gap-3">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            // onClick={handleSubmit} 
            disabled={!formData.name.trim() || isLoading}
          >
            {isLoading ? 'Creating...' : 'Create service'}
          </Button>
        </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}