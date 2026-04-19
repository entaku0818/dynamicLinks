'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Copy, ArrowRight, ArrowLeft } from 'lucide-react';
import { LinkPreview } from './LinkPreview';
import { createLink } from '@/lib/db/links';
import { DeepLinkConfig, IOSConfig, AndroidConfig } from '@/lib/db/schema';

export function LinkCreator() {
  const [step, setStep] = useState(1);
  const [originalUrl, setOriginalUrl] = useState('');
  const [customPath, setCustomPath] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deepLinkConfig, setDeepLinkConfig] = useState<DeepLinkConfig>({ ios: {}, android: {} });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateIOSConfig = (field: keyof IOSConfig, value: string) =>
    setDeepLinkConfig((prev) => ({ ...prev, ios: { ...prev.ios, [field]: value } }));

  const updateAndroidConfig = (field: keyof AndroidConfig, value: string) =>
    setDeepLinkConfig((prev) => ({ ...prev, android: { ...prev.android, [field]: value } }));

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const result = await createLink(originalUrl, customPath || undefined, 'web', deepLinkConfig);
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

  const reset = () => {
    setStep(1);
    setOriginalUrl('');
    setCustomPath('');
    setGeneratedLink('');
    setDeepLinkConfig({ ios: {}, android: {} });
    setShowAdvanced(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl text-center">
          {step === 1 ? 'リンクを作成' : step === 2 ? 'カスタマイズ' : 'リンク完成！'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Step 1: URL入力 */}
        {step === 1 && (
          <div className="space-y-4">
            <Input
              placeholder="リンク先のURLを入力 (例: https://example.com)"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && originalUrl && setStep(2)}
            />
            <Button className="w-full" onClick={() => setStep(2)} disabled={!originalUrl}>
              次へ <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step 2: カスタマイズ */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 shrink-0">{typeof window !== 'undefined' ? window.location.origin : ''}/</span>
              <Input
                placeholder="カスタムパス (任意)"
                value={customPath}
                onChange={(e) => setCustomPath(e.target.value)}
              />
            </div>
            {customPath && <LinkPreview path={customPath} />}

            {/* 詳細設定トグル */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full text-sm text-gray-500 hover:text-gray-700 py-1"
            >
              {showAdvanced ? '▲ アプリ設定を隠す' : '▼ アプリへのディープリンク設定（任意）'}
            </button>

            {showAdvanced && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                {/* iOS設定 */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700">iOS</p>
                  <Input
                    placeholder="Universal Link (例: https://example.com/app)"
                    value={deepLinkConfig.ios?.universalLink || ''}
                    onChange={(e) => updateIOSConfig('universalLink', e.target.value)}
                  />
                  <Input
                    placeholder="カスタムスキーム (例: myapp://open)"
                    value={deepLinkConfig.ios?.customScheme || ''}
                    onChange={(e) => updateIOSConfig('customScheme', e.target.value)}
                  />
                  <Input
                    placeholder="App Store ID (例: 123456789)"
                    value={deepLinkConfig.ios?.appStoreId || ''}
                    onChange={(e) => updateIOSConfig('appStoreId', e.target.value)}
                  />
                </div>

                <div className="border-t pt-4 space-y-2">
                  <p className="text-sm font-semibold text-gray-700">Android</p>
                  <Input
                    placeholder="App Link (例: https://example.com/app)"
                    value={deepLinkConfig.android?.appLink || ''}
                    onChange={(e) => updateAndroidConfig('appLink', e.target.value)}
                  />
                  <Input
                    placeholder="カスタムスキーム (例: myapp://open)"
                    value={deepLinkConfig.android?.customScheme || ''}
                    onChange={(e) => updateAndroidConfig('customScheme', e.target.value)}
                  />
                  <Input
                    placeholder="パッケージ名 (例: com.example.app)"
                    value={deepLinkConfig.android?.packageName || ''}
                    onChange={(e) => updateAndroidConfig('packageName', e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} disabled={isLoading}>
                <ArrowLeft className="mr-2 h-4 w-4" /> 戻る
              </Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? '作成中...' : 'リンクを生成'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: 完成 */}
        {step === 3 && generatedLink && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg gap-2">
              <span className="font-medium truncate">{generatedLink}</span>
              <Button variant="outline" size="icon" onClick={copyToClipboard} className="shrink-0">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" className="w-full" onClick={reset}>
              新しいリンクを作成
            </Button>
          </div>
        )}

        {/* ステップインジケーター */}
        <div className="flex justify-center gap-2 pt-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full transition-colors ${i === step ? 'bg-blue-500' : 'bg-gray-200'}`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
