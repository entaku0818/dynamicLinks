// src/app/[...shortcode]/page.tsx
import { getDoc, doc } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { redirect } from 'next/navigation';
import { getLink } from '@/lib/db/links';


export default async function ShortCodePage({
    params,
  }: {
    params: { shortcode: string[] };
  }) {
    const shortcode = params.shortcode[0];
    
    try {
      const link = await getLink(shortcode);
  
      if (!link) {
        redirect('/');
      }

  
      redirect(link.originalUrl);
    } catch (error) {
      console.error('Redirect error:', error);
      redirect('/');
    }
  }