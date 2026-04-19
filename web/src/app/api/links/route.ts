import { NextRequest, NextResponse } from 'next/server';
import { getLinks, createLink } from '@/lib/db/links';
import { Platform, DeepLinkConfig, RedirectRule } from '@/lib/db/schema';

export async function GET() {
  try {
    const links = await getLinks();
    return NextResponse.json({ links });
  } catch (error) {
    console.error('GET /api/links error:', error);
    return NextResponse.json({ error: 'リンクの取得に失敗しました' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      originalUrl,
      customPath,
      platform,
      deepLinkConfig,
      redirectRules,
    }: {
      originalUrl: string;
      customPath?: string;
      platform?: Platform;
      deepLinkConfig?: DeepLinkConfig;
      redirectRules?: RedirectRule[];
    } = body;

    if (!originalUrl) {
      return NextResponse.json({ error: 'URLは必須です' }, { status: 400 });
    }

    const result = await createLink(
      originalUrl,
      customPath,
      platform,
      deepLinkConfig,
      redirectRules
    );

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ link: result.link }, { status: 201 });
  } catch (error) {
    console.error('POST /api/links error:', error);
    return NextResponse.json({ error: 'リンクの作成に失敗しました' }, { status: 500 });
  }
}
