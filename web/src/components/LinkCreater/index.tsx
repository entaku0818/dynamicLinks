// components/LinkCreator/index.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Copy, ArrowRight } from 'lucide-react';
import { LinkPreview } from './LinkPreview';
import { createLink } from '@/lib/db/links';
import { Platform, DeepLinkConfig, RedirectRule, IOSConfig, AndroidConfig } from '@/lib/db/schema';

export function LinkCreator() {
  const [step, setStep] = useState(1);
  const [originalUrl, setOriginalUrl] = useState('');
  const [customPath, setCustomPath] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // 新しいフィールド
  const [platform, setPlatform] = useState<Platform>('web');
  const [deepLinkConfig, setDeepLinkConfig] = useState<DeepLinkConfig>({
    ios: {},
    android: {}
  });
  const [redirectRules, setRedirectRules] = useState<RedirectRule[]>([]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const result = await createLink(
        originalUrl, 
        customPath, 
        platform,
        deepLinkConfig,
        redirectRules
      );
      
      if (result.error) {
        toast.error(result.error);
        return;
      }
  
      if (result.link) {
        const shortUrl = `${window.location.origin}/${result.link.id}`;
        setGeneratedLink(shortUrl);
        setStep(3);
      }
    } catch (error) {
      toast.error('エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  // iOS設定の更新
  const updateIOSConfig = (field: keyof IOSConfig, value: string) => {
    setDeepLinkConfig(prev => ({
      ...prev,
      ios: {
        ...prev.ios,
        [field]: value
      }
    }));
  };

  // Android設定の更新
  const updateAndroidConfig = (field: keyof AndroidConfig, value: string) => {
    setDeepLinkConfig(prev => ({
      ...prev,
      android: {
        ...prev.android,
        [field]: value
      }
    }));
  };
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      toast.success('コピーしました');
    } catch (error) {
      toast.error('コピーに失敗しました');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl text-center">
          {step === 1 ? "リンクを作成" : 
           step === 2 ? "カスタマイズ (任意)" : 
           "リンクの準備ができました！"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 1 && (
          <div className="space-y-4">
            <Input 
              placeholder="リンク先のURLを入力"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
            />
            <Button 
              className="w-full"
              onClick={() => setStep(2)}
              disabled={!originalUrl || isLoading}
            >
              次へ <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="text-gray-500">{window.location.origin}/</div>
              <Input 
                placeholder="カスタムパス (任意)"
                value={customPath}
                onChange={(e) => setCustomPath(e.target.value)}
              />
            </div>
            {customPath && <LinkPreview path={customPath} />}
            
            {/* プラットフォーム選択 */}
            <div className="mt-4">
              <div className="text-sm font-medium mb-2">プラットフォーム</div>
              <div className="flex space-x-2">
                {(['web', 'ios', 'android'] as Platform[]).map((p) => (
                  <Button
                    key={p}
                    type="button"
                    variant={platform === p ? "default" : "outline"}
                    onClick={() => setPlatform(p)}
                    className="flex-1"
                  >
                    {p === 'web' ? 'Web' : p === 'ios' ? 'iOS' : 'Android'}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* 詳細設定トグル */}
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="w-full text-sm"
            >
              {showAdvancedOptions ? '詳細設定を隠す' : '詳細設定を表示'}
            </Button>
            
            {/* 詳細設定 */}
            {showAdvancedOptions && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                {platform === 'ios' && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">iOS設定</div>
                    <Input
                      placeholder="Universal Link"
                      value={deepLinkConfig.ios?.universalLink || ''}
                      onChange={(e) => updateIOSConfig('universalLink', e.target.value)}
                      className="mb-2"
                    />
                    <Input
                      placeholder="カスタムスキーム (例: myapp://)"
                      value={deepLinkConfig.ios?.customScheme || ''}
                      onChange={(e) => updateIOSConfig('customScheme', e.target.value)}
                      className="mb-2"
                    />
                    <Input
                      placeholder="App Store ID"
                      value={deepLinkConfig.ios?.appStoreId || ''}
                      onChange={(e) => updateIOSConfig('appStoreId', e.target.value)}
                    />
                  </div>
                )}
                
                {platform === 'android' && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Android設定</div>
                    <Input
                      placeholder="App Link"
                      value={deepLinkConfig.android?.appLink || ''}
                      onChange={(e) => updateAndroidConfig('appLink', e.target.value)}
                      className="mb-2"
                    />
                    <Input
                      placeholder="カスタムスキーム (例: myapp://)"
                      value={deepLinkConfig.android?.customScheme || ''}
                      onChange={(e) => updateAndroidConfig('customScheme', e.target.value)}
                      className="mb-2"
                    />
                    <Input
                      placeholder="パッケージ名"
                      value={deepLinkConfig.android?.packageName || ''}
                      onChange={(e) => updateAndroidConfig('packageName', e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}
            
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                onClick={() => setStep(1)}
                disabled={isLoading}
              >
                戻る
              </Button>
              <Button 
                className="flex-1"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                リンクを生成
              </Button>
            </div>
          </div>
        )}

        {step === 3 && generatedLink && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="font-medium">{generatedLink}</div>
              <Button variant="outline" size="icon" onClick={copyToClipboard}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={() => {
                  setStep(1);
                  setOriginalUrl('');
                  setCustomPath('');
                  setGeneratedLink('');
                }}
              >
                新しいリンクを作成
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-center space-x-2 mt-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full ${
                i === step ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
