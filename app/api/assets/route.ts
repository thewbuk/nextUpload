import * as React from 'react';
import { NextResponse } from 'next/server';
import type { Asset } from '@/app/types/asset';

// In-memory storage for assets
let assets: Asset[] = [];

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const companyId = formData.get('companyId');
    const assetFile = formData.get('assetFile');

    if (!companyId || !assetFile) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!(assetFile instanceof File)) {
      return NextResponse.json(
        { error: 'Invalid file format' },
        { status: 400 }
      );
    }

    const fileContent = await assetFile.text();
    let newAssets: Asset[];

    try {
      newAssets = JSON.parse(fileContent);
      // Validate the structure of each asset
      if (!Array.isArray(newAssets) || !newAssets.every(isValidAsset)) {
        throw new Error('Invalid asset structure');
      }
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid file format or structure' },
        { status: 400 }
      );
    }

    // Add companyId to each asset
    newAssets = newAssets.map(asset => ({
      ...asset,
      companyId: companyId as string
    }));

    // Replace existing assets for this company
    assets = [...assets.filter(a => a.companyId !== companyId), ...newAssets];

    return NextResponse.json({ success: true, count: newAssets.length });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('companyId');

  if (companyId) {
    return NextResponse.json(assets.filter(asset => asset.companyId === companyId));
  }

  return NextResponse.json(assets);
}

function isValidAsset(asset: any): asset is Asset {
  return (
    typeof asset === 'object' &&
    typeof asset.address === 'string' &&
    typeof asset.latitude === 'number' &&
    typeof asset.longitude === 'number'
  );
}
