// src/app/[...shortcode]/page.tsx
import { redirect, RedirectType } from 'next/navigation';
import { getLink } from '../links';



export default async function ShortCodePage({
  params,
}: {
  params: { shortcode: string[] };
}) {
  const { shortcode: paramValue } = await params;
  const code = paramValue[0];
  
    const link = await getLink(code);

    if (!link) {
      return redirect('/');
    }

    redirect(link.originalUrl,RedirectType.replace);
}