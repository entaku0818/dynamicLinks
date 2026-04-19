import { redirect, RedirectType, notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { getLink } from '../links';
import { PlatformDetector } from '@/lib/platform/detector';
import { incrementClickCount, updateAnalytics } from '@/lib/db/links';
import { Link } from '@/lib/db/schema';

export default async function ShortCodePage({
  params,
}: {
  params: { shortcode: string[] };
}) {
  const { shortcode: paramValue } = params;
  const code = paramValue[0];

  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';

  const link = await getLink(code);
  if (!link || link.status !== 'active') {
    return notFound();
  }

  const detector = new PlatformDetector(userAgent);
  const deviceInfo = detector.getDeviceInfo();

  let targetUrl = resolveTargetUrl(link, deviceInfo.platform);

  try {
    await Promise.all([
      incrementClickCount(code),
      updateAnalytics(code, {
        platform: deviceInfo.platform,
        browser: deviceInfo.browser,
        device: deviceInfo.device,
      }),
    ]);
  } catch (error) {
    console.error('Analytics error:', error);
  }

  return redirect(targetUrl, RedirectType.replace);
}

function resolveTargetUrl(link: Link, platform: 'ios' | 'android' | 'web'): string {
  // 優先度順にカスタムルールをチェック
  if (link.redirectRules?.length > 0) {
    const matchingRule = [...link.redirectRules]
      .sort((a, b) => b.priority - a.priority)
      .find((rule) => {
        const platformMatch = !rule.condition.platform || rule.condition.platform === platform;
        return platformMatch;
      });

    if (matchingRule) return matchingRule.targetUrl;
  }

  // プラットフォーム別のディープリンク設定を適用
  if (platform === 'ios' && link.deepLinkConfig?.ios) {
    const ios = link.deepLinkConfig.ios;
    if (ios.universalLink) return ios.universalLink;
    if (ios.customScheme) return ios.customScheme;
    if (ios.appStoreId) return `https://apps.apple.com/app/id${ios.appStoreId}`;
  }

  if (platform === 'android' && link.deepLinkConfig?.android) {
    const android = link.deepLinkConfig.android;
    if (android.appLink) return android.appLink;
    if (android.customScheme) return android.customScheme;
    if (android.packageName) return `https://play.google.com/store/apps/details?id=${android.packageName}`;
  }

  return link.originalUrl;
}
