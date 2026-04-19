import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="container mx-auto px-4 py-24 text-center">
      <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
      <p className="text-xl text-gray-700 mb-2">リンクが見つかりません</p>
      <p className="text-sm text-gray-400 mb-8">
        このリンクは存在しないか、無効になっています。
      </p>
      <Link
        href="/"
        className="inline-block px-6 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors"
      >
        トップへ戻る
      </Link>
    </main>
  );
}
