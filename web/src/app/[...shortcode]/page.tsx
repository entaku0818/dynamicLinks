import { redirect, RedirectType } from 'next/navigation';
import { headers } from 'next/headers';
import { getLink } from '../links';
import { PlatformDetector } from '@/lib/platform/detector';
import { DeepLinkGenerator } from '@/lib/deeplink/generator';
import { incrementClickCount, updateAnalytics } from '@/lib/db/links';

export default async function ShortCodePage({
  params,
}: {
  params: { shortcode: string[] };
}) {
  const { shortcode: paramValue } = params;
  const code = paramValue[0];
  
  // ヘッダー情報の取得
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  
  // リンク情報の取得
  const link = await getLink(code);
  if (!link) {
    return redirect('/', RedirectType.replace);
  }

  // プラットフォーム判定
  const detector = new PlatformDetector(userAgent);
  const deviceInfo = detector.getDeviceInfo();

  // ディープリンク生成
  const generator = new DeepLinkGenerator();
  let targetUrl = link.originalUrl;

  try {
    // リダイレクトルールの適用
    if (link.redirectRules && link.redirectRules.length > 0) {
      const matchingRule = link.redirectRules
        .sort((a, b) => b.priority - a.priority)
        .find(rule => {
          const platformMatch = !rule.condition.platform || rule.condition.platform === deviceInfo.platform;
          const deviceMatch = !rule.condition.device || rule.condition.device === deviceInfo.device;
          const browserMatch = !rule.condition.browser || rule.condition.browser === deviceInfo.browser;
          return platformMatch && deviceMatch && browserMatch;
        });

      if (matchingRule) {
        targetUrl = matchingRule.targetUrl;
      } else {
        // プラットフォームに応じたディープリンク生成
        targetUrl = generator.generateDeepLink(deviceInfo.platform, link.deepLinkConfig);
      }
    }

    // クリック数のインクリメントと分析データの更新
    await incrementClickCount(code);
    await updateAnalytics(code, {
      platform: deviceInfo.platform,
      browser: deviceInfo.browser,
      device: deviceInfo.device
    });

    // リダイレクト実行
    return redirect(targetUrl, RedirectType.replace);
  } catch (error) {
    console.error('Redirect error:', error);
    // エラー時はオリジナルURLにリダイレクト
    return redirect(link.originalUrl, RedirectType.replace);
  }
}
