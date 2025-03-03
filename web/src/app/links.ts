import { db } from '@/lib/db/firebase';
import { Link } from '@/lib/db/schema';
import { collection, doc, getDoc, setDoc, updateDoc, increment, getDocs } from 'firebase/firestore';
const LINKS_COLLECTION = 'links';

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
          const data = docSnap.data();
          return {
            id: data.id,
            originalUrl: data.originalUrl,
            customPath: data.customPath,
            clicks: data.clicks,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
            platform: data.platform || 'web',
            deepLinkConfig: data.deepLinkConfig || { ios: {}, android: {} },
            redirectRules: data.redirectRules || [],
            analytics: data.analytics || { platforms: {}, devices: {}, browsers: {}, regions: {} },
            status: data.status || 'active',
            planType: data.planType || 'free'
          } as Link;
        }
        return null;
      } catch (error) {
        console.error('Get link error:', error);
        return null;
      }
    }
