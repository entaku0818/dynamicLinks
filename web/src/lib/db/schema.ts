export type Platform = 'ios' | 'android' | 'web';
export type Status = 'active' | 'inactive' | 'expired';
export type PlanType = 'free' | 'starter' | 'business';

export interface IOSConfig {
  universalLink?: string;
  customScheme?: string;
  appStoreId?: string;
  minimumVersion?: string;
}

export interface AndroidConfig {
  appLink?: string;
  customScheme?: string;
  packageName?: string;
  minimumVersion?: string;
}

export interface DeepLinkConfig {
  ios?: IOSConfig;
  android?: AndroidConfig;
}

export interface RedirectRule {
  priority: number;
  condition: {
    platform?: string;
    device?: string;
    browser?: string;
    region?: string;
  };
  targetUrl: string;
}

export interface Analytics {
  platforms: Record<string, number>;
  devices: Record<string, number>;
  browsers: Record<string, number>;
  regions: Record<string, number>;
}

export interface Link {
  id: string;  // shortcode
  originalUrl: string;
  customPath?: string;
  createdAt: Date;
  updatedAt: Date;
  clicks: number;
  platform: Platform;
  deepLinkConfig: DeepLinkConfig;
  redirectRules: RedirectRule[];
  analytics: Analytics;
  status: Status;
  planType: PlanType;
}

export type NewLink = Omit<Link, 'id' | 'createdAt' | 'updatedAt' | 'clicks' | 'analytics'>;
