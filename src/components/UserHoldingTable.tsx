import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCountries } from '@/hooks/useCountries';
import { useRegions } from '@/hooks/useRegions';
import { useProfile } from '@/hooks/useProfile';
import { useApprove } from '@/hooks/useApprove';
import { PermissionGuard } from '@/components/PermissionGuard';
import AddAuthModal from '@/components/modals/AddAuth';

interface HoldingCombined {
  id: string;
  email: string;
  full_name: string;
  role: string;
  country_id: string;
  region_id: string;
  entity_id: string | null;
  entity_name: string | null;
  entity_code: string | null;
  entity_is_referrer: boolean | null;
  created_at: string;
}

type RoleFilter = 'all' | 'head' | 'pending';

export default function UserHoldingTable() {
  const { profile } = useProfile();
  const { holdingUsers, holdingCombined, loading, refetch } = useApprove();
  const { countries, loading: countryLoading } = useCountries();
  const { regions, loading: regionLoading } = useRegions();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [selectedCountry, setSelectedCountry] = useState<string | 'all'>('all');
  const [selectedRegion, setSelectedRegion] = useState<string | 'all'>('all');
  const [selectedRow, setSelectedRow] = useState<HoldingCombined | null>(null);

  useEffect(() => {
      if (!profile) return;
      refetch();
    }, [profile]);

  const filteredData = useMemo(() => {
    if (!holdingCombined || ! holdingUsers) return [];
    return holdingCombined.filter(row => {
      const matchesSearch = row.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            row.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || row.role === roleFilter;
      const matchesCountry = selectedCountry === 'all' || row.country_id === selectedCountry;
      const matchesRegion = selectedRegion === 'all' || row.region_id === selectedRegion;
      return matchesSearch && matchesRole && matchesCountry && matchesRegion;
    });
  }, [holdingUsers, holdingCombined, searchQuery, roleFilter, selectedCountry, selectedRegion]);

  const handleRowClick = useCallback((e: React.MouseEvent, row: HoldingCombined) => {
    e.stopPropagation();
    setSelectedRow(row);
  }, []);

  return (
    <div className="space-y-6">
      <PermissionGuard permission="canAccessUserManagement">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <CardTitle className="text-xl">Pending Applications</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <Input placeholder="Search by name or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 w-full sm:w-64" />
                </div>
                <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as RoleFilter)}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="head">Head</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Select value={selectedCountry} onValueChange={(v) => setSelectedCountry(v === 'all' ? 'all' : v)}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {countries?.filter(c => c.is_active).map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedRegion} onValueChange={(v) => setSelectedRegion(v === 'all' ? 'all' : v)}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {regions?.filter(r => r.is_active).map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[140px]">Name</TableHead>
                      <TableHead className="min-w-[180px] hidden sm:table-cell">Email</TableHead>
                      <TableHead className="w-[200px]">Role</TableHead>
                      <TableHead className="w-[100px]">Country</TableHead>
                      <TableHead className="w-[100px]">Region</TableHead>
                      <TableHead className="min-w-[120px] text-right text-muted-foreground text-xs font-normal">Entity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    { filteredData.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No applications found</TableCell></TableRow>
                    ) : filteredData.map((row) => (
                      <TableRow
                        key={row.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={(e) => handleRowClick(e, row)}
                      >
                        <TableCell className="font-medium">{row.full_name || '—'}</TableCell>
                        <TableCell className="text-muted-foreground hidden sm:table-cell">{row.email || '—'}</TableCell>
                        <TableCell>{row.role}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{countries?.find(c => c.id === row.country_id)?.name || '—'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{regions?.find(r => r.id === row.region_id)?.name || '—'}</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">{row.entity_name || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </PermissionGuard>
      {selectedRow && (
        <AddAuthModal
          data={selectedRow}
          isOpen={!!selectedRow}
          onClose={() => setSelectedRow(null)}
        />
      )}
    </div>
  );
}