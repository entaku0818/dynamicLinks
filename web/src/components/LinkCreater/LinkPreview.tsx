// components/LinkCreator/LinkPreview.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface LinkPreviewProps {
  path: string;
}

export function LinkPreview({ path }: LinkPreviewProps) {
  return (
    <Card className="bg-gray-50">
      <CardContent className="p-3">
        <p className="text-sm text-gray-600">プレビュー:</p>
        <p className="font-medium">{window.location.origin}/{path}</p>
      </CardContent>
    </Card>
  );
}