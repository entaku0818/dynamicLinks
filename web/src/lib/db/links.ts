import { db } from '@/lib/db/firebase';
import { collection, doc, getDoc, setDoc, updateDoc, increment, getDocs } from 'firebase/firestore';
import { generateUniqueShortcode, isValidCustomPath, isValidUrl, normalizeUrl } from './url';
import { Link, Platform, DeepLinkConfig, RedirectRule, Status, PlanType } from './schema';

const LINKS_COLLECTION = 'links';

export async function createLink(
  originalUrl: string, 
  customPath?: string, 
  platform: Platform = 'web',
  deepLinkConfig?: DeepLinkConfig,
  redirectRules?: RedirectRule[],
  status: Status = 'active',
  planType: PlanType = 'free'
) {
  try {
    if (!isValidUrl(normalizeUrl(originalUrl))) {
      return { error: '有効なURLを入力してください' };
    }

    if (customPath && !isValidCustomPath(customPath)) {
      return { error: 'カスタムパスには英数字、ハイフン、アンダースコアのみ使用できます' };
    }

    const id = customPath || await generateUniqueShortcode();
    
    // カスタムパスが既に使用されているかチェック
    if (customPath) {
      const docRef = doc(db, LINKS_COLLECTION, customPath);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { error: 'このカスタムパスは既に使用されています' };
      }
    }

    const now = new Date();
    const newLink: Link = {
      id,
      originalUrl: normalizeUrl(originalUrl),
      customPath: customPath || undefined,
      createdAt: now,
      updatedAt: now,
      clicks: 0,
      // 新しいフィールド
      platform,
      deepLinkConfig: deepLinkConfig || { ios: {}, android: {} },
      redirectRules: redirectRules || [],
      analytics: { platforms: {}, devices: {}, browsers: {}, regions: {} },
      status,
      planType
    };

    await setDoc(doc(db, LINKS_COLLECTION, id), newLink);

    return { link: newLink };
  } catch (error) {
    console.error('Link creation error:', error);
    return { error: 'リンクの作成中にエラーが発生しました' };
  }
}



export async function incrementClickCount(id: string) {
  try {
    const docRef = doc(db, LINKS_COLLECTION, id);
    await updateDoc(docRef, {
      clicks: increment(1),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Click increment error:', error);
  }
}

export async function checkLinkExists(id: string): Promise<boolean> {
    const docRef = doc(db, 'links', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
}

export async function updateAnalytics(id: string, deviceInfo: { platform: Platform; browser: string; device: string; region?: string }) {
  try {
    const docRef = doc(db, LINKS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const analytics = data.analytics || { platforms: {}, devices: {}, browsers: {}, regions: {} };
      
      // 各カテゴリのカウントを更新
      const platform = deviceInfo.platform;
      analytics.platforms[platform] = (analytics.platforms[platform] || 0) + 1;
      
      const device = deviceInfo.device;
      analytics.devices[device] = (analytics.devices[device] || 0) + 1;
      
      const browser = deviceInfo.browser;
      analytics.browsers[browser] = (analytics.browsers[browser] || 0) + 1;
      
      if (deviceInfo.region) {
        const region = deviceInfo.region;
        analytics.regions[region] = (analytics.regions[region] || 0) + 1;
      }
      
      await updateDoc(docRef, {
        analytics,
        updatedAt: new Date()
      });
    }
  } catch (error) {
    console.error('Analytics update error:', error);
  }
}
