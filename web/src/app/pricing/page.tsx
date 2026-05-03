'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { toast } from 'sonner';

const PLANS = [
  {
    key: 'free',
    name: '無料',
    price: 0,
    features: ['1アプリまで', '月間1,000クリック', '基本分析'],
    cta: '現在のプラン',
    disabled: true,
  },
  {
    key: 'starter',
    name: 'スターター',
    price: 980,
    features: ['3アプリまで', '月間10,000クリック', '基本的な条件分岐', '標準分析'],
    cta: 'スタートする',
    disabled: false,
    highlighted: false,
  },
  {
    key: 'business',
    name: 'ビジネス',
    price: 4980,
    features: ['無制限アプリ', '無制限クリック', '高度な条件分岐', '詳細分析', 'APIアクセス', 'カスタムドメイン'],
    cta: 'ビジネスにする',
    disabled: false,
    highlighted: true,
  },
];

function PricingContent() {
  const [loading, setLoading] = useState<string | null>(null);
  const searchParams = useSearchParams();

  if (searchParams.get('success') === 'true') {
    toast.success('プランのアップグレードが完了しました');
  }
  if (searchParams.get('canceled') === 'true') {
    toast.error('お支払いがキャンセルされました');
  }

  const handleCheckout = async (planKey: string) => {
    setLoading(planKey);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('エラーが発生しました');
      }
    } catch {
      toast.error('エラーが発生しました');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {PLANS.map((plan) => (
        <Card key={plan.key} className={plan.highlighted ? 'border-blue-500 border-2 relative' : ''}>
          {plan.highlighted && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
              おすすめ
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-lg">{plan.name}</CardTitle>
            <p className="text-3xl font-bold">
              ¥{plan.price.toLocaleString()}
              <span className="text-sm font-normal text-gray-500">/月</span>
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              className="w-full"
              variant={plan.highlighted ? 'default' : 'outline'}
              disabled={plan.disabled || loading === plan.key}
              onClick={() => !plan.disabled && handleCheckout(plan.key)}
            >
              {loading === plan.key ? '処理中...' : plan.cta}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function PricingPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold">料金プラン</h1>
          <p className="text-gray-500 mt-2">シンプルな月額料金。いつでもキャンセル可能。</p>
        </div>
        <Suspense>
          <PricingContent />
        </Suspense>
      </div>
    </main>
  );
}
