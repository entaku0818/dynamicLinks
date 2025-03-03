import { Platform } from '../db/schema';

export type Browser = 'chrome' | 'safari' | 'firefox' | 'edge' | 'other';
export type Device = 'mobile' | 'tablet' | 'desktop';

export interface DeviceInfo {
  platform: Platform;
  browser: Browser;
  device: Device;
  region?: string;
}

export class PlatformDetector {
  private readonly userAgent: string;

  constructor(userAgent: string) {
    this.userAgent = userAgent.toLowerCase();
  }

  detectPlatform(): Platform {
    if (this.userAgent.includes('iphone') || this.userAgent.includes('ipad') || this.userAgent.includes('ipod')) {
      return 'ios';
    }
    if (this.userAgent.includes('android')) {
      return 'android';
    }
    return 'web';
  }

  detectBrowser(): Browser {
    if (this.userAgent.includes('chrome') && !this.userAgent.includes('edg')) {
      return 'chrome';
    }
    if (this.userAgent.includes('safari') && !this.userAgent.includes('chrome')) {
      return 'safari';
    }
    if (this.userAgent.includes('firefox')) {
      return 'firefox';
    }
    if (this.userAgent.includes('edg')) {
      return 'edge';
    }
    return 'other';
  }

  detectDevice(): Device {
    // タブレット判定
    if (
      this.userAgent.includes('ipad') ||
      (this.userAgent.includes('android') && !this.userAgent.includes('mobile'))
    ) {
      return 'tablet';
    }
    // モバイル判定
    if (
      this.userAgent.includes('iphone') ||
      this.userAgent.includes('ipod') ||
      this.userAgent.includes('android')
    ) {
      return 'mobile';
    }
    // それ以外はデスクトップ
    return 'desktop';
  }

  getDeviceInfo(): DeviceInfo {
    return {
      platform: this.detectPlatform(),
      browser: this.detectBrowser(),
      device: this.detectDevice()
    };
  }

  // アプリがインストールされているかの判定（実装例）
  async isAppInstalled(platform: Platform, config: { ios?: { universalLink?: string }, android?: { appLink?: string } }): Promise<boolean> {
    // 実際の実装では、プラットフォーム固有の方法でアプリのインストール状態を確認する必要があります
    // 例: Universal LinksやApp Linksを使用した判定
    // この実装は簡略化されています
    return new Promise((resolve) => {
      if (platform === 'ios' && config.ios?.universalLink) {
        // iOSの場合の判定ロジック
        resolve(true);
      } else if (platform === 'android' && config.android?.appLink) {
        // Androidの場合の判定ロジック
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }
}

// ユーティリティ関数
export function parseUserAgent(userAgent: string): DeviceInfo {
  const detector = new PlatformDetector(userAgent);
  return detector.getDeviceInfo();
}
