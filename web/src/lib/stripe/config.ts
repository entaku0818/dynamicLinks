import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-04-22.dahlia',
    });
  }
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as unknown as Record<string, unknown>)[prop as string];
  },
});

export const PLANS = {
  starter: {
    name: 'スターター',
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    price: 980,
    links: 3,
    clicks: 10000,
    features: ['3アプリまで', '月間10,000クリック', '基本的な条件分岐', '標準分析'],
  },
  business: {
    name: 'ビジネス',
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID!,
    price: 4980,
    links: Infinity,
    clicks: Infinity,
    features: ['無制限アプリ', '無制限クリック', '高度な条件分岐', '詳細分析', 'APIアクセス', 'カスタムドメイン'],
  },
} as const;

export type PlanKey = keyof typeof PLANS;
