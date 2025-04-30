'use client';

import { useSession } from 'next-auth/react';
import {
  UserIcon,
  ShieldCheckIcon,
  KeyIcon,
  BellIcon,
  UsersIcon,
  ServerIcon,
  CogIcon,
  InboxIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Providers } from './providers';
import './globals.css';

const navigation = [
  {
    name: '个人资料',
    href: '/profile',
    icon: UserIcon,
    description: '更新您的个人信息和头像'
  },
  {
    name: '安全设置',
    href: '/security',
    icon: ShieldCheckIcon,
    description: '管理密码和两步验证'
  },
  {
    name: '用户管理',
    href: '/users',
    icon: UsersIcon,
    description: '管理用户和访问权限'
  },
  {
    name: '服务管理',
    href: '/services',
    icon: ServerIcon,
    description: '管理 Jellyfin 等服务'
  },
  {
    name: '邀请管理',
    href: '/invites',
    icon: InboxIcon,
    description: '管理邀请码和用户注册'
  },
  {
    name: '系统设置',
    href: '/system',
    icon: CogIcon,
    description: '管理系统配置和服务器设置'
  },
  {
    name: '访问令牌',
    href: '/tokens',
    icon: KeyIcon,
    description: '管理 API 访问令牌'
  },
  {
    name: '通知设置',
    href: '/notifications',
    icon: BellIcon,
    description: '配置通知偏好设置'
  }
];

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  // 如果是登录或注册页面，不显示导航
  if (pathname === '/login' || pathname === '/register') {
    return children;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {session ? (
        <>
          {/* 顶部导航栏 */}
          <nav className="bg-white shadow">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between">
                <div className="flex">
                  <Link href="/" className="flex items-center">
                    <HomeIcon className="h-6 w-6 text-gray-500 hover:text-gray-700" />
                    <span className="ml-2 text-lg font-semibold text-gray-900">Tiger Console</span>
                  </Link>
                </div>
                <div className="flex items-center">
                  {session.user?.avatar ? (
                    <img
                      src={session.user.avatar}
                      alt="Avatar"
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-gray-500" />
                    </div>
                  )}
                  <span className="ml-2 text-sm text-gray-700">{session.user?.name}</span>
                </div>
              </div>
            </div>
          </nav>

          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="flex gap-8">
              {/* 侧边栏 */}
              <div className="w-72 flex-shrink-0">
                <nav className="space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`
                          group flex items-center px-3 py-2 text-sm font-medium rounded-md
                          ${isActive
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }
                        `}
                      >
                        <item.icon
                          className={`
                            mr-3 h-6 w-6
                            ${isActive
                              ? 'text-gray-500'
                              : 'text-gray-400 group-hover:text-gray-500'
                            }
                          `}
                        />
                        <div>
                          <div className={isActive ? 'text-gray-900' : 'text-gray-600'}>
                            {item.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* 主内容区 */}
              <div className="flex-1 min-w-0">
                <div className="bg-white shadow rounded-lg">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        children
      )}
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body>
        <Providers>
          <RootLayoutContent>{children}</RootLayoutContent>
        </Providers>
      </body>
    </html>
  );
} 