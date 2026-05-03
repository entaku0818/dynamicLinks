import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/config';
import { adminDb } from '@/lib/db/firebase-admin';
import Stripe from 'stripe';

const SUBSCRIPTIONS_COLLECTION = 'subscriptions';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      await adminDb.collection(SUBSCRIPTIONS_COLLECTION).doc(session.customer as string).set({
        customerId: session.customer,
        plan: session.metadata?.plan,
        subscriptionId: session.subscription,
        status: 'active',
        updatedAt: new Date(),
      });
      break;
    }
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      await adminDb.collection(SUBSCRIPTIONS_COLLECTION).doc(sub.customer as string).set({
        customerId: sub.customer,
        subscriptionId: sub.id,
        status: sub.status === 'active' ? 'active' : 'inactive',
        updatedAt: new Date(),
      }, { merge: true });
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      await adminDb.collection(SUBSCRIPTIONS_COLLECTION).doc(sub.customer as string).set({
        status: 'canceled',
        plan: 'free',
        updatedAt: new Date(),
      }, { merge: true });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
