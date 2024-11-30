'use server'

import { db } from '@/lib/db/firebase';
import { collection, doc, getDoc, setDoc, updateDoc, increment, getDocs } from 'firebase/firestore';
import { generateUniqueShortcode, isValidCustomPath, isValidUrl, normalizeUrl } from './url';
import { Link } from './schema';

const LINKS_COLLECTION = 'links';

export async function createLink(originalUrl: string, customPath?: string) {
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
      clicks: 0
    };

    await setDoc(doc(db, LINKS_COLLECTION, id), newLink);

    return { link: newLink };
  } catch (error) {
    console.error('Link creation error:', error);
    return { error: 'リンクの作成中にエラーが発生しました' };
  }
}

export async function getLinks(): Promise<Link[]> {
  try {
    const querySnapshot = await getDocs(collection(db, LINKS_COLLECTION));
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as Link[];
  } catch (error) {
    console.error('Get links error:', error);
    return [];
  }
}

export async function getLink(id: string): Promise<Link | null> {
  try {
    const docRef = doc(db, LINKS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as Link;
    }
    return null;
  } catch (error) {
    console.error('Get link error:', error);
    return null;
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