'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, Smartphone, Globe, Activity, ChevronDown, ChevronUp, Trash2, Power } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from '@/lib/db/schema';

function PlatformBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-16 text-gray-500 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-16 text-right text-gray-500">{count} ({pct}%)</span>
    </div>
  );
}

function LinkAnalytics({ analytics }: { analytics: Link['analytics'] }) {
  const totalPlatform = Object.values(analytics.platforms).reduce((a, b) => a + b, 0);
  const totalDevice = Object.values(analytics.devices).reduce((a, b) => a + b, 0);

  if (totalPlatform === 0) {
    return <p className="text-xs text-gray-400 mt-2">まだアクセスデータがありません</p>;
  }

  return (
    <div className="mt-3 space-y-3 border-t pt-3">
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-gray-600">プラットフォーム</p>
        <PlatformBar label="iOS" count={analytics.platforms.ios || 0} total={totalPlatform} color="bg-blue-400" />
        <PlatformBar label="Android" count={analytics.platforms.android || 0} total={totalPlatform} color="bg-green-400" />
        <PlatformBar label="Web" count={analytics.platforms.web || 0} total={totalPlatform} color="bg-purple-400" />
      </div>
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-gray-600">デバイス</p>
        <PlatformBar label="Mobile" count={analytics.devices.mobile || 0} total={totalDevice} color="bg-orange-400" />
        <PlatformBar label="Tablet" count={analytics.devices.tablet || 0} total={totalDevice} color="bg-yellow-400" />
        <PlatformBar label="Desktop" count={analytics.devices.desktop || 0} total={totalDevice} color="bg-gray-400" />
      </div>
    </div>
  );
}

export function LinkList() {
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/links')
      .then((r) => r.json())
      .then((data) => setLinks(data.links || []))
      .catch((e) => console.error('Error fetching links:', e))
      .finally(() => setIsLoading(false));
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('コピーしました');
    } catch {
      toast.error('コピーに失敗しました');
    }
  };

  const toggleExpand = (id: string) => setExpandedId((prev) => (prev === id ? null : id));

  const toggleStatus = async (link: Link) => {
    const newStatus = link.status === 'active' ? 'inactive' : 'active';
    setPendingId(link.id);
    try {
      await fetch(`/api/links/${link.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setLinks((prev) => prev.map((l) => l.id === link.id ? { ...l, status: newStatus } : l));
      toast.success(newStatus === 'active' ? 'リンクを有効にしました' : 'リンクを無効にしました');
    } catch {
      toast.error('更新に失敗しました');
    } finally {
      setPendingId(null);
    }
  };

  const handleDelete = async (link: Link) => {
    if (!confirm(`「${window.location.origin}/${link.id}」を削除しますか？`)) return;
    setPendingId(link.id);
    try {
      await fetch(`/api/links/${link.id}`, { method: 'DELETE' });
      setLinks((prev) => prev.filter((l) => l.id !== link.id));
      toast.success('リンクを削除しました');
    } catch {
      toast.error('削除に失敗しました');
    } finally {
      setPendingId(null);
    }
  };

  if (isLoading) return <div className="text-center text-gray-500 py-12">読み込み中...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>作成したリンク一覧</CardTitle>
      </CardHeader>
      <CardContent>
        {links.length === 0 ? (
          <p className="text-center text-gray-500 py-8">まだリンクが作成されていません</p>
        ) : (
          <div className="space-y-3">
            {links.map((link) => {
              const shortUrl = `${window.location.origin}/${link.id}`;
              const isExpanded = expandedId === link.id;
              const isPending = pendingId === link.id;
              const isInactive = link.status !== 'active';

              return (
                <Card key={link.id} className={`transition-opacity ${isInactive ? 'opacity-60' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <p className="font-medium truncate">{shortUrl}</p>
                        <p className="text-sm text-gray-500 truncate">{link.originalUrl}</p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button variant="outline" size="icon" onClick={() => copyToClipboard(shortUrl)} title="コピー">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => window.open(link.originalUrl, '_blank')} title="開く">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => toggleStatus(link)}
                          disabled={isPending}
                          title={link.status === 'active' ? '無効にする' : '有効にする'}
                          className={link.status === 'active' ? 'text-green-600' : 'text-gray-400'}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(link)}
                          disabled={isPending}
                          title="削除"
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => toggleExpand(link.id)} title="詳細">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="mt-2 text-sm text-gray-500 flex flex-wrap gap-3">
                      <span className="flex items-center gap-1">
                        <Activity className="h-4 w-4" />
                        {link.clicks} クリック
                      </span>
                      <span className="flex items-center gap-1">
                        {link.platform === 'web' ? <Globe className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
                        {link.platform === 'ios' ? 'iOS' : link.platform === 'android' ? 'Android' : 'Web'}
                      </span>
                      <span>{new Date(link.createdAt).toLocaleDateString('ja-JP')}</span>
                      <span className={link.status === 'active' ? 'text-green-600 font-medium' : 'text-red-400'}>
                        {link.status === 'active' ? '有効' : link.status === 'inactive' ? '無効' : '期限切れ'}
                      </span>
                    </div>

                    {isExpanded && <LinkAnalytics analytics={link.analytics} />}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
