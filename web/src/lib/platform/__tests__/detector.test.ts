import { PlatformDetector, DeviceInfo } from '../detector';

describe('PlatformDetector', () => {
  describe('detectPlatform', () => {
    it('should detect iOS platform', () => {
      const iosUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1';
      const detector = new PlatformDetector(iosUserAgent);
      expect(detector.detectPlatform()).toBe('ios');
    });

    it('should detect Android platform', () => {
      const androidUserAgent = 'Mozilla/5.0 (Linux; Android 10; SM-A505FN) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.105 Mobile Safari/537.36';
      const detector = new PlatformDetector(androidUserAgent);
      expect(detector.detectPlatform()).toBe('android');
    });

    it('should detect web platform for desktop browsers', () => {
      const webUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36';
      const detector = new PlatformDetector(webUserAgent);
      expect(detector.detectPlatform()).toBe('web');
    });
  });

  describe('detectBrowser', () => {
    it('should detect Chrome browser', () => {
      const chromeUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36';
      const detector = new PlatformDetector(chromeUserAgent);
      expect(detector.detectBrowser()).toBe('chrome');
    });

    it('should detect Safari browser', () => {
      const safariUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15';
      const detector = new PlatformDetector(safariUserAgent);
      expect(detector.detectBrowser()).toBe('safari');
    });

    it('should detect Firefox browser', () => {
      const firefoxUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:86.0) Gecko/20100101 Firefox/86.0';
      const detector = new PlatformDetector(firefoxUserAgent);
      expect(detector.detectBrowser()).toBe('firefox');
    });

    it('should detect Edge browser', () => {
      const edgeUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36 Edg/89.0.774.57';
      const detector = new PlatformDetector(edgeUserAgent);
      expect(detector.detectBrowser()).toBe('edge');
    });
  });

  describe('detectDevice', () => {
    it('should detect mobile device', () => {
      const mobileUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1';
      const detector = new PlatformDetector(mobileUserAgent);
      expect(detector.detectDevice()).toBe('mobile');
    });

    it('should detect tablet device', () => {
      const tabletUserAgent = 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1';
      const detector = new PlatformDetector(tabletUserAgent);
      expect(detector.detectDevice()).toBe('tablet');
    });

    it('should detect desktop device', () => {
      const desktopUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36';
      const detector = new PlatformDetector(desktopUserAgent);
      expect(detector.detectDevice()).toBe('desktop');
    });
  });

  describe('getDeviceInfo', () => {
    it('should return complete device info for iOS mobile', () => {
      const iosUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1';
      const detector = new PlatformDetector(iosUserAgent);
      const expectedInfo: DeviceInfo = {
        platform: 'ios',
        browser: 'safari',
        device: 'mobile'
      };
      expect(detector.getDeviceInfo()).toEqual(expectedInfo);
    });

    it('should return complete device info for Android tablet', () => {
      const androidUserAgent = 'Mozilla/5.0 (Linux; Android 10; SM-T500) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.105 Safari/537.36';
      const detector = new PlatformDetector(androidUserAgent);
      const expectedInfo: DeviceInfo = {
        platform: 'android',
        browser: 'chrome',
        device: 'tablet'
      };
      expect(detector.getDeviceInfo()).toEqual(expectedInfo);
    });
  });
});
