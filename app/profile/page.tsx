'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ImageUpload from '../components/ImageUpload';

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatar: '',
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        email: session.user.email || '',
        avatar: session.user.avatar || '',
      });
    }
  }, [session]);

  const handleAvatarUpload = (url: string) => {
    setFormData(prev => ({ ...prev, avatar: url }));
    setHasChanges(true);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, email: e.target.value }));
    setHasChanges(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, name: e.target.value }));
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      setError('');
      setSuccess('');

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '更新失败');
      }

      // 更新 session 中的用户信息
      await update({
        ...session,
        user: {
          ...session?.user,
          ...formData,
        },
      });

      setSuccess('个人资料更新成功');
      setHasChanges(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900">个人资料</h3>
          <p className="mt-1 text-sm text-gray-500">
            更新您的个人信息和头像
          </p>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <ImageUpload
                currentImage={formData.avatar}
                onUpload={handleAvatarUpload}
                className="w-20 h-20"
              />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">头像</h3>
              </div>
              <p className="text-sm text-gray-500">
                建议使用正方形图片，支持 JPG、PNG 格式
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              用户名
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleNameChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              邮箱
            </label>
            <div className="mt-1">
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleEmailChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">出错了</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => {
            setFormData({
              name: session?.user?.name || '',
              email: session?.user?.email || '',
              avatar: session?.user?.avatar || '',
            });
            setHasChanges(false);
          }}
          disabled={!hasChanges || isUpdating}
          className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={!hasChanges || isUpdating}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isUpdating ? '保存中...' : '保存更改'}
        </button>
      </div>
    </form>
  );
} 