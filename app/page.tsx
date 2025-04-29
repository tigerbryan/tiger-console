"use client";

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return <div>加载中...</div>;
  }

  if (!session) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Tiger Console</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/settings/profile" 
                className="text-gray-700 hover:text-gray-900"
              >
                个人设置
              </Link>
              <Link 
                href="/settings/security" 
                className="text-gray-700 hover:text-gray-900"
              >
                安全设置
              </Link>
              <div className="flex items-center space-x-2">
                {session.user?.avatar && (
                  <div className="relative h-8 w-8 rounded-full overflow-hidden">
                    <Image
                      src={session.user.avatar}
                      alt="Avatar"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <span className="text-gray-500">{session.user?.name}</span>
              </div>
              <button
                onClick={() => signOut()}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4">
            <h2 className="text-2xl font-bold mb-4">欢迎回来！</h2>
            <p>您已成功登录 Tiger Console。</p>
          </div>
        </div>
      </main>
    </div>
  );
}
