// components/LinkList/index.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface Link {
  id: string;
  originalUrl: string;
  customPath?: string;
  clicks: number;
  createdAt: Date;
}

export function LinkList() {
  const [links, setLinks] = React.useState<Link[]>([]);

  const copyToClipboard = async (shortUrl: string) => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      toast.success('コピーしました');
    } catch (error) {
      toast.error('コピーに失敗しました');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>作成したリンク一覧</CardTitle>
      </CardHeader>
      <CardContent>
        {links.length === 0 ? (
          <p className="text-center text-gray-500">まだリンクが作成されていません</p>
        ) : (
          <div className="space-y-4">
            {links.map((link) => (
              <Card key={link.id} className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">
                        {window.location.origin}/{link.id}
                      </p>
                      <p className="text-sm text-gray-500">
                        {link.originalUrl}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(`${window.location.origin}/${link.id}`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => window.open(link.originalUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    クリック数: {link.clicks} / 作成日: {new Date(link.createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}