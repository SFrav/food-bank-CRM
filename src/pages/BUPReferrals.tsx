import React, { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserPlus, Search, Plus, Phone, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import { Contact } from '@/hooks/useContacts';
import { AddContactModal } from '@/components/modals/AddContactModal';
import { EditContactModal, ContactFormData } from '@/components/modals/EditContactModal';

const EndUsers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [restoredFormData, setRestoredFormData] = useState<ContactFormData | null>(null);  

  const { data: endUsers, isLoading, refetch } = useQuery({
    queryKey: ["end-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("status", 'pending')
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleContactUpdated = useCallback(() => {
    refetch();  
  }, [refetch]);

  const handleDuplicateAdd = useCallback((dup: Contact) => {
    setEditingContact(dup);
    setIsEditOpen(true);
  }, []);

  const handleEditContact = useCallback((contact: Contact) => {
    setRestoredFormData(null);        
    setEditingContact(contact);
    setIsEditOpen(true);
  }, []);

  const handleMinimise = useCallback(() => {
    setIsEditOpen(false);  
  }, []);

  const handleClose = useCallback(() => {
    setIsEditOpen(false);
    setEditingContact(null);
    setRestoredFormData(null);
  }, []);
  

  const filteredEndUsers = endUsers?.filter((endUser) =>
    endUser.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search beneficiaries …"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsAddOpen(true)}>
                <Plus className="size-4 mr-2" />Add Beneficiary
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading &hellip;</div>
          ) : filteredEndUsers && filteredEndUsers.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredEndUsers.map((endUser) => (
                <Card key={endUser.id} className="hover:shadow-md transition-shadow"
                  onClick={() => handleEditContact(endUser)}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <UserPlus className="size-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{endUser.name}</h3>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                      {endUser.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="size-4 flex-shrink-0" />
                          <span>{endUser.phone}</span>
                        </div>
                      )}
                      {endUser.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="size-4 flex-shrink-0" />
                          <span className="truncate">{endUser.email}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <UserPlus className="size-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "No beneficiaries found" : "No beneficiaries yet"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <AddContactModal
        isOpen={isAddOpen}
        nameInit={''}
        onDuplicateFound={handleDuplicateAdd}
        onClose={() => setIsAddOpen(false)}
        onContactAdded={refetch}
      />

      <EditContactModal
        isOpen={isEditOpen}
        isServing={false}
        onClose={handleClose}
        onContactUpdated={handleContactUpdated}
        onMinimise={handleMinimise}
        contact={editingContact}
        restoredFormData={restoredFormData} 
        maxMinimised={0}
        currentMinimisedCount={0}
      />
    </div>
  );
};

export default EndUsers;
