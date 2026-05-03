import { NextRequest, NextResponse } from 'next/server';
import { stripe, PLANS, PlanKey } from '@/lib/stripe/config';

export async function POST(request: NextRequest) {
  const { plan } = await request.json();

  if (!plan || !(plan in PLANS)) {
    return NextResponse.json({ error: '無効なプランです' }, { status: 400 });
  }

  const selectedPlan = PLANS[plan as PlanKey];

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: selectedPlan.priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?canceled=true`,
    metadata: { plan },
  });

  return NextResponse.json({ url: session.url });
}
