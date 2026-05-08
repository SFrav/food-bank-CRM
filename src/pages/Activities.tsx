import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash2, TrendingUp, Phone, Video, MapPin, CheckCircle, XCircle, Clock } from "lucide-react";
import { AddActivity } from "@/components/modals/AddActivity";
import { EditActivity } from "@/components/modals/EditActivity";
import { format, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

type SalesActivityRow = {
  id: string;
  activity_type: string;
  customer_id: string | null;
  pic_id: string | null;
  scheduled_at: string;
  status: string;
  notes: string | null;
  created_by: string;
  created_at: string;
};

interface SalesActivity {
  id: string;
  activity_type: "call" | "meeting_online" | "visit" | "go_show";
  customer_id: string;
  customer_name?: string;
  pic_id?: string;
  pic_name?: string;
  scheduled_at: string;
  status: "scheduled" | "done" | "canceled";
  notes?: string;
  created_by: string;
  created_at: string;
}

interface Organization {
  id: string;
  name: string;
}

interface Contact {
  id: string;
  full_name: string;
  source: "org" | "ctc";
  raw_id: string;
  email?: string | null;
  phone?: string | null;
}

export default function Activities() {
  const sb = supabase as any;
  const [activities, setActivities] = useState<SalesActivity[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<SalesActivity | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile } = useProfile();
  const location = useLocation();
  const navigate = useNavigate();

  /* Quick‑add logic */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("quick") === "add-activity") {
      setIsAddOpen(true);
      navigate("/activities", { replace: true });
    }
  }, [location.search, navigate]);

  /* Load data */
  useEffect(() => {
    if (user && profile) {
      loadActivities();
      loadOrganizations();
    }
  }, [user, profile]);

  const loadActivities = async () => {
    if (!user || !profile) return;
    try {

      const { data: activitiesData, error } = await sb
        .rpc("get_activities");

      if (error) throw error;
      if (!activitiesData) return;

      setActivities(activitiesData as any);
  } catch (err) {
    console.error(err);
    toast({ title: "Error", description: "Failed to load activities.", variant: "destructive" });
  } finally {
    setLoading(false);
  }
};

  const loadOrganizations = async () => {
    try {
      const { data, error } = await sb.from("organizations").select("id, name").eq("is_active", true).order("name");
      if (error) throw error;
      setOrganizations(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadContacts = async (organizationId?: string) => {
    if (!organizationId) return;
    try {
      const { data, error } = await sb
        .from("organization_contacts")
        .select("id, full_name")
        .eq("is_active", true)
        .eq("organization_id", organizationId)
        .order("full_name");
      if (error) throw error;
      const orgContacts = data?.map((c: any) => ({
        id: `org:${c.id}`,
        raw_id: c.id,
        full_name: c.full_name,
        source: "org" as const
      })) ?? [];
      setContacts(orgContacts);
    } catch (err) {
      console.error(err);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "call":
        return Phone;
      case "meeting_online":
        return Video;
      case "visit":
        return MapPin;
      case "go_show":
        return TrendingUp;
      default:
        return Phone;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return CheckCircle;
      case "canceled":
        return XCircle;
      case "scheduled":
      default:
        return Clock;
    }
  };

  const getActivityBadgeColor = (type: string) => {
    const variants = {
      call: "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100",
      meeting_online: "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100",
      visit: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
      go_show: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
    };
    return variants[type as keyof typeof variants] || variants.call;
  };

  const getStatusBadgeColor = (status: string) => {
    const variants = {
      scheduled: "bg-amber-50 text-amber-700 border-amber-200",
      done: "bg-emerald-50 text-emerald-700 border-emerald-200",
      canceled: "bg-red-50 text-red-700 border-red-200"
    };
    return variants[status as keyof typeof variants] || variants.scheduled;
  };

  const thisWeekStart = startOfWeek(new Date());
  const thisWeekEnd = endOfWeek(new Date());
  const thisWeekActivities = activities.filter(a =>
    isWithinInterval(new Date(a.scheduled_at), { start: thisWeekStart, end: thisWeekEnd })
  );

  const filteredActivities = activities.filter(activity => {
    const matchesSearch =
      activity.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.pic_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || activity.activity_type === filterType;
    const matchesStatus = filterStatus === "all" || activity.status === filterStatus;
    let matchesDate = true;
    if (dateFilter === "today") {
      matchesDate = format(new Date(activity.scheduled_at), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
    } else if (dateFilter === "week") {
      matchesDate = isWithinInterval(new Date(activity.scheduled_at), { start: thisWeekStart, end: thisWeekEnd });
    }
    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  const handleUpdateStatus = async (id: string, newStatus: "scheduled" | "done" | "canceled") => {
    try {
      const { error } = await sb.from("sales_activities").update({ status: newStatus }).eq("id", id);
      if (error) throw error;
      toast({ title: "Success", description: `Activity marked as ${newStatus}!` });
      loadActivities();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    }
  };

  const handleDeleteActivity = async (id: string) => {
    try {
      const { error } = await sb.from("sales_activities").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Success", description: "Activity deleted!" });
      loadActivities();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to delete activity.", variant: "destructive" });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading activities...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Badge className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {thisWeekActivities.length} this week
          </Badge>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Activity
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Activity</DialogTitle>
            </DialogHeader>
            <AddActivity
              organizations={organizations}
              contacts={contacts}
              loadContacts={loadContacts}
              onClose={() => setIsAddOpen(false)}
              onAdd={loadActivities}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search activities..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="call">📞 Call</SelectItem>
                  <SelectItem value="meeting_online">💻 Online Meeting</SelectItem>
                  <SelectItem value="visit">🏢 Visit</SelectItem>
                  <SelectItem value="go_show">📈 Go Show</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">⏰ Scheduled</SelectItem>
                  <SelectItem value="done">✅ Done</SelectItem>
                  <SelectItem value="canceled">❌ Canceled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Date filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Activities ({filteredActivities.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No activities found. {searchQuery || filterType !== "all" || filterStatus !== "all" || dateFilter !== "all"
                  ? "Try adjusting your filters."
                  : "Add your first activity!"}
              </div>
            ) : (
              filteredActivities.map(activity => {
                const ActivityIcon = getActivityIcon(activity.activity_type);
                const StatusIcon = getStatusIcon(activity.status);
                return (
                  <div
                    key={activity.id}
                    className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <ActivityIcon className="h-4 w-4" />
                            <Badge className={`${getActivityBadgeColor(activity.activity_type)} border`}>
                              {activity.activity_type.replace("_", " ")}
                            </Badge>
                            <Badge className={`${getStatusBadgeColor(activity.status)} border`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {activity.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-medium text-foreground">{activity.customer_name}</h4>
                          {activity.pic_name && <p className="text-sm text-muted-foreground">Contact: {activity.pic_name}</p>}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{format(new Date(activity.scheduled_at), "MMM d, yyyy 'at' HH:mm")}</span>
                        </div>

                        {activity.notes && (
                          <p className="text-sm text-muted-foreground bg-muted/50 rounded p-2">
                            {activity.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {activity.status === "scheduled" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateStatus(activity.id, "done")}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Done
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateStatus(activity.id, "canceled")}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          </>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingActivity(activity);
                            setIsEditOpen(true);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteActivity(activity.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogTrigger asChild>
          <span className="sr-only" />
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Activity</DialogTitle>
          </DialogHeader>
          {editingActivity && (
            <EditActivity
              activity={editingActivity}
              organizations={organizations}
              contacts={contacts}
              loadContacts={loadContacts}
              onClose={() => setIsEditOpen(false)}
              onUpdate={loadActivities}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}