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
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
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
        description: `Successfully uploaded ${result.count} assets`,
      });
      form.reset();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : 'Upload failed',
      });
    }
  };

  return (
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
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Asset File (JSON)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        onChange(e.target.files);
                      }}
                      {...field}
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
  );
}
