'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

export default function ProfileSettings() {
  const { data: session, status } = useSession();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '');
      setAvatar(session.user.avatar || '/avatars/default.png');
    }
  }, [session]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/settings/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, avatar }),
      });

      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setSuccess('个人资料更新成功');
      }
    } catch (error) {
      setError('更新过程中发生错误');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      setError('新密码和确认密码不匹配');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/settings/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setSuccess('密码更新成功');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      setError('更新过程中发生错误');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return <div>加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              个人资料设置
            </h3>

            {success && (
              <div className="mt-4 p-4 bg-green-50 rounded-md">
                <p className="text-green-700">{success}</p>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 rounded-md">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <div className="mt-6">
              <form onSubmit={handleUpdateProfile}>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">
                      头像
                    </label>
                    <div className="mt-1 flex items-center">
                      <div className="relative h-16 w-16 rounded-full overflow-hidden">
                        <Image
                          src={avatar}
                          alt="Avatar"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <input
                        type="text"
                        id="avatar"
                        value={avatar}
                        onChange={(e) => setAvatar(e.target.value)}
                        className="ml-4 flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="头像 URL"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      显示名称
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {isLoading ? '保存中...' : '保存更改'}
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-8">
              <h4 className="text-base font-medium text-gray-900">更改密码</h4>
              <form onSubmit={handleChangePassword} className="mt-4">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                      当前密码
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                      新密码
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      确认新密码
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {isLoading ? '更新中...' : '更新密码'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 