import { PLANS } from '../config';

describe('PLANS', () => {
  it('starter プランが正しく定義されている', () => {
    expect(PLANS.starter.name).toBe('スターター');
    expect(PLANS.starter.price).toBe(980);
    expect(PLANS.starter.links).toBe(3);
    expect(PLANS.starter.clicks).toBe(10000);
    expect(PLANS.starter.features.length).toBeGreaterThan(0);
  });

  it('business プランが正しく定義されている', () => {
    expect(PLANS.business.name).toBe('ビジネス');
    expect(PLANS.business.price).toBe(4980);
    expect(PLANS.business.links).toBe(Infinity);
    expect(PLANS.business.clicks).toBe(Infinity);
  });

  it('business は starter より高価である', () => {
    expect(PLANS.business.price).toBeGreaterThan(PLANS.starter.price);
  });

  it('business は starter より多くのリンクを持つ', () => {
    expect(PLANS.business.links).toBeGreaterThan(PLANS.starter.links);
  });

  it('各プランに priceId キーが存在する', () => {
    expect('priceId' in PLANS.starter).toBe(true);
    expect('priceId' in PLANS.business).toBe(true);
  });

  it('すべてのプランに features 配列がある', () => {
    for (const plan of Object.values(PLANS)) {
      expect(Array.isArray(plan.features)).toBe(true);
      expect(plan.features.length).toBeGreaterThan(0);
    }
  });
});
