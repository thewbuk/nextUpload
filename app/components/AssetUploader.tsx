'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type FormData = {
  companyId: string;
  assetFile: FileList;
};

const schema = z.object({
  companyId: z.string().min(1, 'Company ID is required'),
  assetFile: z.any().refine((files) => files?.length === 1, 'Asset file is required'),
});

export function AssetUploader() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogConfig, setDialogConfig] = React.useState<{
    title: string;
    description: string;
    action: () => Promise<void>;
  } | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const checkCompanyExists = async (companyId: string) => {
    const response = await fetch(`/api/assets?companyId=${companyId}`);
    if (!response.ok) {
      throw new Error('Failed to check company');
    }
    const assets = await response.json();
    return assets.length > 0;
  };

  const handleUpload = async (data: FormData, exists: boolean) => {
    const formData = new FormData();
    formData.append('companyId', data.companyId);
    formData.append('assetFile', data.assetFile[0]);

    const response = await fetch('/api/assets', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Upload failed');
    }

    toast({
      title: "Success",
      description: `Successfully ${exists ? 'updated' : 'added'} ${result.count} assets for company ${data.companyId}`,
    });
    form.reset();
    
    if (window.refreshAssets) {
      window.refreshAssets();
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (!data.assetFile?.[0]) {
        throw new Error('No file selected');
      }

      const file = data.assetFile[0];
      if (file.type !== 'application/json') {
        throw new Error('File must be JSON format');
      }

      const exists = await checkCompanyExists(data.companyId);
      
      if (exists) {
        setDialogConfig({
          title: 'Update Company Assets',
          description: `Company ID "${data.companyId}" already exists. Do you want to update its assets?`,
          action: () => handleUpload(data, true),
        });
        setDialogOpen(true);
      } else {
        // For new companies, upload directly
        await handleUpload(data, false);
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : 'Upload failed',
      });
    }
  };

  const handleConfirm = async () => {
    try {
      if (dialogConfig) {
        await dialogConfig.action();
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : 'Upload failed',
      });
    } finally {
      setDialogOpen(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Upload Assets</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company ID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assetFile"
                render={({ field: { onChange } }) => (
                  <FormItem>
                    <FormLabel>Asset File (JSON)</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".json"
                        onChange={(e) => {
                          onChange(e.target.files);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Uploading..." : "Upload"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogConfig?.title}</DialogTitle>
            <DialogDescription>
              {dialogConfig?.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
