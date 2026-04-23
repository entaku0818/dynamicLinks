import { adminDb } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { generateUniqueShortcode, isValidCustomPath, isValidUrl, normalizeUrl } from './url';
import { Link, Platform, DeepLinkConfig, RedirectRule, Status, PlanType } from './schema';

const LINKS_COLLECTION = 'links';

export async function createLinkAdmin(
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

    if (customPath) {
      const docSnap = await adminDb.collection(LINKS_COLLECTION).doc(customPath).get();
      if (docSnap.exists) {
        return { error: 'このカスタムパスは既に使用されています' };
      }
    }

    const now = new Date();
    const newLink: Link = {
      id,
      originalUrl: normalizeUrl(originalUrl),
      ...(customPath ? { customPath } : {}),
      createdAt: now,
      updatedAt: now,
      clicks: 0,
      platform,
      deepLinkConfig: deepLinkConfig || { ios: {}, android: {} },
      redirectRules: redirectRules || [],
      analytics: { platforms: {}, devices: {}, browsers: {}, regions: {} },
      status,
      planType,
    };

    await adminDb.collection(LINKS_COLLECTION).doc(id).set(newLink);
    return { link: newLink };
  } catch (error) {
    console.error('Link creation error:', error);
    return { error: 'リンクの作成中にエラーが発生しました' };
  }
}

export async function getLinksAdmin(): Promise<Link[]> {
  try {
    const snapshot = await adminDb.collection(LINKS_COLLECTION).get();
    return snapshot.docs.map(d => {
      const data = d.data();
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Link;
    });
  } catch (error) {
    console.error('Get links error:', error);
    return [];
  }
}

export async function getLinkAdmin(id: string): Promise<Link | null> {
  try {
    const docSnap = await adminDb.collection(LINKS_COLLECTION).doc(id).get();
    if (!docSnap.exists) return null;
    const data = docSnap.data()!;
    return {
      id: data.id,
      originalUrl: data.originalUrl,
      ...(data.customPath ? { customPath: data.customPath } : {}),
      clicks: data.clicks,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      platform: data.platform || 'web',
      deepLinkConfig: data.deepLinkConfig || { ios: {}, android: {} },
      redirectRules: data.redirectRules || [],
      analytics: data.analytics || { platforms: {}, devices: {}, browsers: {}, regions: {} },
      status: data.status || 'active',
      planType: data.planType || 'free',
    } as Link;
  } catch (error) {
    console.error('Get link error:', error);
    return null;
  }
}

export async function updateLinkStatusAdmin(id: string, status: Status) {
  await adminDb.collection(LINKS_COLLECTION).doc(id).update({ status, updatedAt: new Date() });
}

export async function deleteLinkAdmin(id: string) {
  await updateLinkStatusAdmin(id, 'inactive');
}

export async function incrementClickCountAdmin(id: string) {
  await adminDb.collection(LINKS_COLLECTION).doc(id).update({
    clicks: FieldValue.increment(1),
    updatedAt: new Date(),
  });
}
