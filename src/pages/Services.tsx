import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, Search, Plus, Phone, Mail } from "lucide-react";
import AddServiceModal from "@/components/modals/AddServiceModal";
import { toast } from "@/hooks/use-toast";

const Services = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: services, isLoading, refetch } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const filteredServices = services?.filter((service) =>
    service.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.industry?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search support services …"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="size-4 mr-2" />
              Add Service
            </Button>            
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading &hellip;</div>
          ) : filteredServices && filteredServices.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredServices.map((service) => (
                <Card key={service.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Building className="size-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{service.name}</h3>
                        {/* {service.industry && (
                          <Badge variant="secondary" className="mt-1">
                            {service.industry}
                          </Badge>
                        )} */}
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                      {service.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="size-4 flex-shrink-0" />
                          <span>{service.phone}</span>
                        </div>
                      )}
                      {service.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="size-4 flex-shrink-0" />
                          <span className="truncate">{service.email}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Building className="size-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "No support service found" : "No support service yet"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <AddServiceModal
        isOpen={showAddModal}
        onOpenChange={setShowAddModal}
      />
    </div>
  );
};

export default Services;
