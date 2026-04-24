'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/login');
  };

  const links = [
    { href: '/', label: 'リンク作成' },
    { href: '/links', label: 'リンク一覧' },
  ];

  return (
    <nav className="border-b bg-white sticky top-0 z-10">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <span className="font-bold text-lg">Dynamic Links</span>
        <div className="flex gap-1 items-center">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname === href
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {label}
            </Link>
          ))}
          <button
            onClick={logout}
            className="px-3 py-1.5 rounded-md text-sm text-gray-400 hover:bg-gray-100 transition-colors"
          >
            ログアウト
          </button>
        </div>
      </div>
    </nav>
  );
}
