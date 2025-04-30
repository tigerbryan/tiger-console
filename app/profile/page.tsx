'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import ImageUpload from '../components/ImageUpload';

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAvatarUpload = async (url: string) => {
    try {
      setIsUpdating(true);
      setError('');
      setSuccess('');

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ avatar: url }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '更新失败');
      }

      // 更新 session 中的用户信息
      await update({
        ...session,
        user: {
          ...session?.user,
          avatar: url,
        },
      });

      setSuccess('头像更新成功');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">个人资料</h1>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            头像
          </label>
          <ImageUpload
            currentImage={session?.user?.avatar}
            onUpload={handleAvatarUpload}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            用户名
          </label>
          <div className="text-gray-900">
            {session?.user?.name}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            邮箱
          </label>
          <div className="text-gray-900">
            {session?.user?.email}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 p-3 rounded">
            {success}
          </div>
        )}
      </div>
    </div>
  );
} 