"use client";

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  UserIcon,
  ServerIcon,
  UsersIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';

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

  const quickLinks = [
    {
      name: '个人资料',
      href: '/profile',
      icon: UserIcon,
      description: '查看和更新您的个人信息',
      color: 'bg-blue-500',
    },
    {
      name: 'Jellyfin',
      href: '/services',
      icon: ServerIcon,
      description: '管理您的媒体服务',
      color: 'bg-purple-500',
    },
    {
      name: '用户管理',
      href: '/users',
      icon: UsersIcon,
      description: '管理系统用户',
      color: 'bg-green-500',
    },
    {
      name: '邀请管理',
      href: '/invites',
      icon: InboxIcon,
      description: '创建和管理邀请码',
      color: 'bg-yellow-500',
    },
  ];

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
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">
              欢迎回来，{session.user?.name || '管理员'}
            </h1>
            <p className="mt-4 text-xl text-gray-600">
              从这里开始管理您的服务和用户
            </p>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {quickLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-200"
                >
                  <div>
                    <span className={`rounded-lg inline-flex p-3 ring-4 ring-white ${link.color}`}>
                      <link.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium">
                      <span className="absolute inset-0" aria-hidden="true" />
                      {link.name}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      {link.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900">系统状态</h2>
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    活跃用户
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    12
                  </dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Jellyfin 在线用户
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    3
                  </dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    可用邀请码
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    5
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
