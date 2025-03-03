// components/LinkList/index.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, Smartphone, Globe, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { getLinks } from '@/app/links';
import { Link, Platform } from '@/lib/db/schema';

export function LinkList() {
  const [links, setLinks] = React.useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    async function fetchLinks() {
      try {
        const fetchedLinks = await getLinks();
        setLinks(fetchedLinks);
      } catch (error) {
        console.error('Error fetching links:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLinks();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }
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
                  <div className="mt-2 text-sm text-gray-500 flex items-center space-x-4">
                    <span className="flex items-center">
                      <Activity className="h-4 w-4 mr-1" />
                      クリック数: {link.clicks}
                    </span>
                    <span className="flex items-center">
                      {link.platform === 'web' ? (
                        <Globe className="h-4 w-4 mr-1" />
                      ) : (
                        <Smartphone className="h-4 w-4 mr-1" />
                      )}
                      {link.platform === 'ios' ? 'iOS' : link.platform === 'android' ? 'Android' : 'Web'}
                    </span>
                    <span>
                      作成日: {new Date(link.createdAt).toLocaleDateString()}
                    </span>
                    <span>
                      ステータス: {link.status === 'active' ? '有効' : link.status === 'inactive' ? '無効' : '期限切れ'}
                    </span>
                  </div>
                  {link.platform !== 'web' && (
                    <div className="mt-2 text-xs text-gray-400">
                      {link.platform === 'ios' && link.deepLinkConfig.ios?.universalLink && (
                        <div>Universal Link: {link.deepLinkConfig.ios.universalLink}</div>
                      )}
                      {link.platform === 'android' && link.deepLinkConfig.android?.appLink && (
                        <div>App Link: {link.deepLinkConfig.android.appLink}</div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
