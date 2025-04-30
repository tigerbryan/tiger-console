'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  ArrowLeftIcon,
  UserIcon,
  ShieldCheckIcon,
  KeyIcon,
  BellIcon,
  UsersIcon,
  ServerIcon,
  CogIcon,
  InboxIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import { DEFAULT_AVATAR } from '@/lib/constants';

const navigation = [
  {
    name: '个人资料',
    href: '/settings/profile',
    icon: UserIcon,
    description: '更新您的个人信息和头像'
  },
  {
    name: '安全设置',
    href: '/settings/security',
    icon: ShieldCheckIcon,
    description: '管理密码和两步验证'
  },
  {
    name: '用户管理',
    href: '/settings/users',
    icon: UsersIcon,
    description: '管理用户和访问权限'
  },
  {
    name: '服务管理',
    href: '/settings/services',
    icon: ServerIcon,
    description: '管理 Jellyfin 等服务'
  },
  {
    name: '邀请管理',
    href: '/settings/invites',
    icon: InboxIcon,
    description: '管理邀请码和用户注册'
  },
  {
    name: '系统设置',
    href: '/settings/system',
    icon: CogIcon,
    description: '管理系统配置和服务器设置'
  },
  {
    name: '访问令牌',
    href: '/settings/tokens',
    icon: KeyIcon,
    description: '管理 API 访问令牌'
  },
  {
    name: '通知设置',
    href: '/settings/notifications',
    icon: BellIcon,
    description: '配置通知偏好设置'
  }
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link
                href="/"
                className="flex items-center text-gray-500 hover:text-gray-700"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                返回主页
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="relative h-8 w-8 rounded-full overflow-hidden">
                  <Image
                    src={session.user?.avatar || DEFAULT_AVATAR}
                    alt="Avatar"
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-gray-900 font-medium">
                  {session.user?.name || '管理员'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
} 