'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import ImageUpload from '../components/ImageUpload';

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');

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

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      setError('');
      setSuccess('');

      const response = await fetch('/api/user/email', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newEmail }),
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
          email: newEmail,
        },
      });

      setSuccess('邮箱更新成功');
      setIsEditingEmail(false);
      setNewEmail('');
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
            currentImage={session?.user?.avatar || undefined}
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
          {isEditingEmail ? (
            <form onSubmit={handleEmailUpdate} className="space-y-2">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="输入新邮箱"
                className="block w-full max-w-md rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {isUpdating ? '更新中...' : '保存'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingEmail(false);
                    setNewEmail('');
                    setError('');
                  }}
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  取消
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="text-gray-900">
                {session?.user?.email}
              </div>
              <button
                onClick={() => {
                  setIsEditingEmail(true);
                  setNewEmail(session?.user?.email || '');
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                修改
              </button>
            </div>
          )}
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