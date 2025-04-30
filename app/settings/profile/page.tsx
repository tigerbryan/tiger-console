'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/app/components/ImageUpload';

export default function ProfileSettings() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatar: '',
    username: ''
  });

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        email: session.user.email || '',
        avatar: session.user.avatar || '',
        username: session.user.username || ''
      });
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/settings/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setSuccess('个人资料已更新');
        await update({
          ...session,
          user: {
            ...session?.user,
            ...formData,
          },
        });
        router.refresh();
      }
    } catch (err) {
      setError('更新失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="divide-y divide-gray-200">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">个人资料</h3>
        <p className="mt-1 text-sm text-gray-500">
          这些信息将会公开显示，请谨慎填写。
        </p>
      </div>

      <div className="px-4 py-5 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 头像上传组件 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">头像</label>
            <div className="mt-1">
              <ImageUpload
                currentImage={formData.avatar}
                onUpload={(url) => setFormData({ ...formData, avatar: url })}
                className="w-full"
              />
              <p className="mt-1 text-xs text-gray-500">
                支持 JPEG、PNG、GIF 格式，文件大小不超过 5MB
              </p>
            </div>
          </div>

          {/* 用户名 */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              用户名
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm bg-gray-50"
                disabled
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              用户名不可更改
            </p>
          </div>

          {/* 名称 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              名称
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              这是您的显示名称
            </p>
          </div>

          {/* 邮箱 */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              邮箱
            </label>
            <div className="mt-1">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              用于接收通知和重置密码
            </p>
          </div>

          {/* 错误和成功提示 */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">{success}</h3>
                </div>
              </div>
            </div>
          )}

          {/* 提交按钮 */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? '保存中...' : '保存更改'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 