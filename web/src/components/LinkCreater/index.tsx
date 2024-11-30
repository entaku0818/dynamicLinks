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

export function LinkCreator() {
  const [step, setStep] = useState(1);
  const [originalUrl, setOriginalUrl] = useState('');
  const [customPath, setCustomPath] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const result = await createLink(originalUrl, customPath);
      
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