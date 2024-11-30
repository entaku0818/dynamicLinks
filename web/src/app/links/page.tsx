import { LinkList } from '@/components/LinkList';

export default function LinksPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          リンク一覧
        </h1>
        <LinkList />
      </div>
    </main>
  );
}
