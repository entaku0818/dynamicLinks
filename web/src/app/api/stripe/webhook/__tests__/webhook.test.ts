import { NextRequest } from 'next/server';

jest.mock('@/lib/db/firebase-admin', () => ({
  adminDb: {
    collection: jest.fn().mockReturnValue({
      doc: jest.fn().mockReturnValue({
        set: jest.fn().mockResolvedValue(undefined),
      }),
    }),
  },
}));

jest.mock('@/lib/stripe/config', () => ({
  stripe: {
    webhooks: { constructEvent: jest.fn() },
  },
}));

import { POST } from '../route';
import { stripe } from '@/lib/stripe/config';
import { adminDb } from '@/lib/db/firebase-admin';

const mockConstructEvent = stripe.webhooks.constructEvent as jest.Mock;
const mockCollection = adminDb.collection as jest.Mock;

function makeRequest(body: string, sig = 'valid-sig'): NextRequest {
  return new NextRequest('http://localhost/api/stripe/webhook', {
    method: 'POST',
    body,
    headers: { 'stripe-signature': sig },
  });
}

let mockDoc: jest.Mock;
let mockSet: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockSet = jest.fn().mockResolvedValue(undefined);
  mockDoc = jest.fn().mockReturnValue({ set: mockSet });
  mockCollection.mockReturnValue({ doc: mockDoc });
});

describe('POST /api/stripe/webhook', () => {
  describe('署名検証', () => {
    it('署名が無効な場合 400 を返す', async () => {
      mockConstructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const res = await POST(makeRequest('{}'));
      expect(res.status).toBe(400);
    });
  });

  describe('checkout.session.completed', () => {
    it('サブスクリプション情報を Firestore に保存する', async () => {
      mockConstructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            customer: 'cus_123',
            subscription: 'sub_123',
            metadata: { plan: 'starter' },
          },
        },
      });

      const res = await POST(makeRequest('{}'));
      expect(res.status).toBe(200);
      expect(mockCollection).toHaveBeenCalledWith('subscriptions');
      expect(mockDoc).toHaveBeenCalledWith('cus_123');
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: 'cus_123',
          plan: 'starter',
          subscriptionId: 'sub_123',
          status: 'active',
        })
      );
    });
  });

  describe('customer.subscription.updated', () => {
    it('アクティブなサブスクリプションを更新する', async () => {
      mockConstructEvent.mockReturnValue({
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_123',
            customer: 'cus_123',
            status: 'active',
          },
        },
      });

      const res = await POST(makeRequest('{}'));
      expect(res.status).toBe(200);
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'active' }),
        { merge: true }
      );
    });

    it('非アクティブなサブスクリプションを inactive に更新する', async () => {
      mockConstructEvent.mockReturnValue({
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_123',
            customer: 'cus_123',
            status: 'past_due',
          },
        },
      });

      const res = await POST(makeRequest('{}'));
      expect(res.status).toBe(200);
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'inactive' }),
        { merge: true }
      );
    });
  });

  describe('customer.subscription.deleted', () => {
    it('プランを free に戻す', async () => {
      mockConstructEvent.mockReturnValue({
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_123',
            customer: 'cus_123',
          },
        },
      });

      const res = await POST(makeRequest('{}'));
      expect(res.status).toBe(200);
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'canceled', plan: 'free' }),
        { merge: true }
      );
    });
  });
});
