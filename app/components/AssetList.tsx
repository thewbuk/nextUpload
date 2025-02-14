'use client';
import * as React from 'react';
import type { Asset } from '@/app/types/asset';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';

export function AssetList() {
  const [assets, setAssets] = React.useState<Asset[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [companyId, setCompanyId] = React.useState('');
  const { toast } = useToast();

  const fetchAssets = React.useCallback(async (filterCompanyId?: string) => {
    try {
      setLoading(true);
      const url = `/api/assets${filterCompanyId ? `?companyId=${filterCompanyId}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch assets');
      }

      const data = await response.json();
      setAssets(data);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to fetch assets'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Expose the refresh function globally
  React.useEffect(() => {
    window.refreshAssets = () => fetchAssets(companyId);
  }, [fetchAssets, companyId]);

  React.useEffect(() => {
    fetchAssets();
    return () => {
      // Cleanup
      delete window.refreshAssets;
    };
  }, [fetchAssets]);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAssets(companyId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset List</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFilter} className="flex gap-2 mb-4">
          <Input
            type="text"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            placeholder="Filter by Company ID"
          />
          <Button type="submit">Filter</Button>
          {companyId && (
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setCompanyId('');
                fetchAssets();
              }}
            >
              Clear
            </Button>
          )}
        </form>

        {loading ? (
          <div className="flex justify-center py-8">Loading...</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Address</TableHead>
                  <TableHead>Latitude</TableHead>
                  <TableHead>Longitude</TableHead>
                  <TableHead>Company ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset, index) => (
                  <TableRow key={index}>
                    <TableCell>{asset.address}</TableCell>
                    <TableCell>{asset.latitude}</TableCell>
                    <TableCell>{asset.longitude}</TableCell>
                    <TableCell>{asset.companyId}</TableCell>
                  </TableRow>
                ))}
                {assets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No assets found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
