'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ArrowRight, ArrowLeft, Copy, CheckCircle, Link2, Smartphone, Globe } from 'lucide-react';
import { createLink } from '@/lib/db/links';

const TOTAL_STEPS = 4;

export function Onboarding() {
  const [step, setStep] = useState(1);
  const [url, setUrl] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const createFirstLink = async () => {
    if (!url) return;
    setIsLoading(true);
    try {
      const result = await createLink(url, undefined, 'web', { ios: {}, android: {} });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.link) {
        setGeneratedLink(`${window.location.origin}/${result.link.id}`);
        setStep(3);
      }
    } catch {
      toast.error('エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      toast.success('コピーしました');
    } catch {
      toast.error('コピーに失敗しました');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex gap-1 mb-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${i < step ? 'bg-blue-500' : 'bg-gray-200'}`}
            />
          ))}
        </div>
        <p className="text-xs text-gray-400 text-center">{step} / {TOTAL_STEPS}</p>
      </CardHeader>
      <CardContent className="space-y-6">

        {step === 1 && (
          <div className="space-y-6 text-center">
            <Link2 className="w-14 h-14 text-blue-500 mx-auto" />
            <div className="space-y-2">
              <CardTitle className="text-2xl">Dynamic Linksへようこそ</CardTitle>
              <p className="text-gray-500 text-sm">
                1つのリンクでiOS・Android・Webへスマートに誘導できるサービスです。
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <Globe className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <p className="font-medium text-xs">スマートリダイレクト</p>
                <p className="text-gray-500 text-xs mt-1">デバイスに応じて最適なページへ</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <Smartphone className="w-6 h-6 mx-auto mb-2 text-green-500" />
                <p className="font-medium text-xs">ディープリンク</p>
                <p className="text-gray-500 text-xs mt-1">アプリの特定画面へ直接遷移</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <CheckCircle className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                <p className="font-medium text-xs">アクセス分析</p>
                <p className="text-gray-500 text-xs mt-1">クリック数・デバイス別の統計</p>
              </div>
            </div>
            <Button className="w-full" onClick={() => setStep(2)}>
              始める <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <CardTitle>最初のリンクを作成</CardTitle>
              <p className="text-sm text-gray-500">短縮・スマートリダイレクトしたいURLを入力してください</p>
            </div>
            <Input
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && url && createFirstLink()}
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> 戻る
              </Button>
              <Button className="flex-1" onClick={createFirstLink} disabled={!url || isLoading}>
                {isLoading ? '作成中...' : 'リンクを生成'}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <CardTitle>リンクが完成しました</CardTitle>
              <p className="text-sm text-gray-500">このリンクをシェアしましょう</p>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium truncate flex-1">{generatedLink}</span>
              <Button variant="outline" size="icon" onClick={copyToClipboard} className="shrink-0">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 border rounded-lg space-y-2 text-sm">
              <p className="font-semibold text-sm">アクセスするとデバイス別に振り分けられます</p>
              <ul className="space-y-1 text-gray-600 text-sm">
                <li>📱 iPhone → <span className="font-medium">App Store または設定済みアプリ</span></li>
                <li>🤖 Android → <span className="font-medium">Play Store または設定済みアプリ</span></li>
                <li>💻 PC・その他 → <span className="font-medium">元のURL</span></li>
              </ul>
            </div>
            <Button className="w-full" onClick={() => setStep(4)}>
              次へ: アプリ連携の設定 <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <CardTitle>アプリとの連携（任意）</CardTitle>
              <p className="text-sm text-gray-500">設定するとアプリの特定画面へ直接飛べます</p>
            </div>
            <div className="space-y-3">
              <div className="p-4 border rounded-lg space-y-2">
                <p className="font-semibold text-sm">iOS</p>
                <ol className="text-xs text-gray-600 space-y-1.5 list-decimal list-inside">
                  <li>Xcode で Associated Domains を有効化</li>
                  <li>
                    <code className="bg-gray-100 px-1 rounded">applinks:your-domain.com</code> を追加
                  </li>
                  <li>リンク作成時に Universal Link を設定</li>
                </ol>
              </div>
              <div className="p-4 border rounded-lg space-y-2">
                <p className="font-semibold text-sm">Android</p>
                <ol className="text-xs text-gray-600 space-y-1.5 list-decimal list-inside">
                  <li>AndroidManifest.xml に Intent Filter を追加</li>
                  <li>
                    <code className="bg-gray-100 px-1 rounded">android:autoVerify=&quot;true&quot;</code> を設定
                  </li>
                  <li>リンク作成時に App Link を設定</li>
                </ol>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(3)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> 戻る
              </Button>
              <Button className="flex-1" onClick={() => { window.location.href = '/'; }}>
                ダッシュボードへ <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
