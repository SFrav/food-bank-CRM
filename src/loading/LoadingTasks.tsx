import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, TrendingUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const LoadingTasks = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Badge className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1">
            <TrendingUp className="size-3" />
            <div className="h-4 w-24 bg-muted/40 rounded animate-pulse" />
          </Badge>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={true}>
          <Plus className="size-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
              <Input placeholder="Search tasks …" className="pl-10" disabled={true} />
            </div>

            <div className="flex gap-2 ">
              <Select disabled={true}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Task filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks</SelectItem>
                </SelectContent>
              </Select>
              
              <Select disabled={true}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                </SelectContent>
              </Select>

              <Select disabled={true}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Date filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card className="bg-card border-border max-h-[calc(100vh-20rem)] overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg">Tasks</CardTitle>
        </CardHeader>
        <CardContent className="overflow-y-auto">
          <div className="space-y-4 max-h-[calc(100vh-16rem)]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="size-4 bg-muted/100 rounded animate-pulse" />
                      <div className="h-6 w-32 bg-muted/100 rounded animate-pulse" />
                      <div className="h-6 w-24 bg-muted/100 rounded animate-pulse" />
                    </div>

                    <div className="space-y-1">
                      <div className="h-4 w-48 bg-muted/100 rounded animate-pulse" />
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="h-4 w-32 bg-muted/100 rounded animate-pulse" />
                    </div>

                    <div className="h-4 w-full bg-muted/100 rounded p-2 animate-pulse" />
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <div className="h-8 w-16 bg-muted/100 rounded animate-pulse" />
                    <div className="h-8 w-16 bg-muted/100 rounded animate-pulse" />
                    <div className="h-8 w-8 bg-muted/100 rounded animate-pulse" />
                    <div className="h-8 w-8 bg-muted/100 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}