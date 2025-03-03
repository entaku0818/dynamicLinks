import { DeepLinkGenerator } from '../generator';
import { DeepLinkConfig, Platform } from '../../db/schema';

describe('DeepLinkGenerator', () => {
  let generator: DeepLinkGenerator;

  beforeEach(() => {
    generator = new DeepLinkGenerator();
  });

  describe('generateIOSLink', () => {
    it('should return universal link when available', () => {
      const config = {
        universalLink: 'https://example.com/app',
        customScheme: 'myapp://',
        appStoreId: '123456789'
      };
      expect(generator.generateIOSLink(config)).toBe('https://example.com/app');
    });

    it('should return custom scheme when universal link is not available', () => {
      const config = {
        customScheme: 'myapp://',
        appStoreId: '123456789'
      };
      expect(generator.generateIOSLink(config)).toBe('myapp://');
    });

    it('should return App Store link when only appStoreId is available', () => {
      const config = {
        appStoreId: '123456789'
      };
      expect(generator.generateIOSLink(config)).toBe('https://apps.apple.com/app/id123456789');
    });

    it('should throw error when no valid configuration is provided', () => {
      const config = {};
      expect(() => generator.generateIOSLink(config)).toThrow('No valid iOS link configuration provided');
    });
  });

  describe('generateAndroidLink', () => {
    it('should return app link when available', () => {
      const config = {
        appLink: 'https://example.com/android',
        customScheme: 'myapp://',
        packageName: 'com.example.app'
      };
      expect(generator.generateAndroidLink(config)).toBe('https://example.com/android');
    });

    it('should return custom scheme when app link is not available', () => {
      const config = {
        customScheme: 'myapp://',
        packageName: 'com.example.app'
      };
      expect(generator.generateAndroidLink(config)).toBe('myapp://');
    });

    it('should return Play Store link when only packageName is available', () => {
      const config = {
        packageName: 'com.example.app'
      };
      expect(generator.generateAndroidLink(config)).toBe('https://play.google.com/store/apps/details?id=com.example.app');
    });

    it('should throw error when no valid configuration is provided', () => {
      const config = {};
      expect(() => generator.generateAndroidLink(config)).toThrow('No valid Android link configuration provided');
    });
  });

  describe('generateDeepLink', () => {
    const config: DeepLinkConfig = {
      ios: {
        universalLink: 'https://example.com/ios',
        appStoreId: '123456789'
      },
      android: {
        appLink: 'https://example.com/android',
        packageName: 'com.example.app'
      }
    };

    it('should generate iOS deep link', () => {
      expect(generator.generateDeepLink('ios', config)).toBe('https://example.com/ios');
    });

    it('should generate Android deep link', () => {
      expect(generator.generateDeepLink('android', config)).toBe('https://example.com/android');
    });

    it('should return fallback link for web platform', () => {
      expect(generator.generateDeepLink('web', config)).toBe('https://example.com/download');
    });

    it('should handle missing platform configuration', () => {
      const incompleteConfig: DeepLinkConfig = {
        ios: {
          universalLink: 'https://example.com/ios'
        }
      };
      expect(generator.generateDeepLink('android', incompleteConfig)).toBe('https://example.com/download');
    });
  });
});
