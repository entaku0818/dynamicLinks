import { NextRequest, NextResponse } from 'next/server';
import { getLinkAdmin, updateLinkStatusAdmin, deleteLinkAdmin } from '@/lib/db/links-admin';
import { Status } from '@/lib/db/schema';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const link = await getLinkAdmin(id);
    if (!link) {
      return NextResponse.json({ error: 'リンクが見つかりません' }, { status: 404 });
    }
    return NextResponse.json({ link });
  } catch (error) {
    console.error(`GET /api/links/${id} error:`, error);
    return NextResponse.json({ error: 'リンクの取得に失敗しました' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { status }: { status: Status } = body;

    if (!status || !['active', 'inactive', 'expired'].includes(status)) {
      return NextResponse.json({ error: '無効なステータスです' }, { status: 400 });
    }

    await updateLinkStatusAdmin(id, status);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`PATCH /api/links/${id} error:`, error);
    return NextResponse.json({ error: 'リンクの更新に失敗しました' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await deleteLinkAdmin(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/links/${id} error:`, error);
    return NextResponse.json({ error: 'リンクの削除に失敗しました' }, { status: 500 });
  }
}
