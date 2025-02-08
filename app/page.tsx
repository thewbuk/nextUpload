import * as React from 'react';
import { AssetUploader } from './components/AssetUploader';
import { AssetList } from './components/AssetList';
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold text-center mb-8">Asset Management</h1>
      <div className="max-w-7xl mx-auto grid gap-8 md:grid-cols-[400px_1fr]">
        <AssetUploader />
        <AssetList />
      </div>
      <Toaster />
    </div>
  );
}
