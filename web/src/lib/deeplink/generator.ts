import { DeepLinkConfig, IOSConfig, AndroidConfig, Platform } from '../db/schema';

export class DeepLinkGenerator {
  generateIOSLink(config: IOSConfig): string {
    if (config.universalLink) {
      return config.universalLink;
    }
    if (config.customScheme) {
      return config.customScheme;
    }
    if (config.appStoreId) {
      return `https://apps.apple.com/app/id${config.appStoreId}`;
    }
    throw new Error('No valid iOS link configuration provided');
  }

  generateAndroidLink(config: AndroidConfig): string {
    if (config.appLink) {
      return config.appLink;
    }
    if (config.customScheme) {
      return config.customScheme;
    }
    if (config.packageName) {
      return `https://play.google.com/store/apps/details?id=${config.packageName}`;
    }
    throw new Error('No valid Android link configuration provided');
  }

  generateFallbackLink(platform: Platform, config: DeepLinkConfig): string {
    try {
      if (platform === 'ios' && config.ios) {
        return this.generateIOSLink(config.ios);
      }
      if (platform === 'android' && config.android) {
        return this.generateAndroidLink(config.android);
      }
      return 'https://example.com/download'; // デフォルトのダウンロードページ
    } catch (error) {
      return 'https://example.com/download'; // エラー時もデフォルトページへ
    }
  }

  generateDeepLink(platform: Platform, config: DeepLinkConfig): string {
    try {
      switch (platform) {
        case 'ios':
          return config.ios ? this.generateIOSLink(config.ios) : this.generateFallbackLink(platform, config);
        case 'android':
          return config.android ? this.generateAndroidLink(config.android) : this.generateFallbackLink(platform, config);
        default:
          return this.generateFallbackLink(platform, config);
      }
    } catch (error) {
      return this.generateFallbackLink(platform, config);
    }
  }
}
