'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import QRCode from 'qrcode';

export default function SecuritySettings() {
  const { data: session } = useSession();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSetup2FA, setShowSetup2FA] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [qrCode, setQrCode] = useState('');

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
        setSuccess('密码已更新');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      setError('更新失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetup2FA = async () => {
    if (!session?.user?.email) return;
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/setup-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: session.user.email }),
      });

      const data = await response.json();
      if (data.error) {
        setError(data.error);
        return;
      }

      setSecret(data.secret);
      const otpAuthUrl = `otpauth://totp/TigerConsole:${session.user.email}?secret=${data.secret}&issuer=TigerConsole`;
      const url = await QRCode.toDataURL(otpAuthUrl);
      setQrCode(url);
      setShowSetup2FA(true);
    } catch (error) {
      setError('设置过程中发生错误');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.email) return;
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/verify-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          secret,
          email: session.user.email,
        }),
      });

      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setSuccess('两步验证已启用');
        setIs2FAEnabled(true);
        setShowSetup2FA(false);
        setCode('');
      }
    } catch (error) {
      setError('验证失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!session?.user?.email) return;
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/disable-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: session.user.email }),
      });

      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setSuccess('两步验证已禁用');
        setIs2FAEnabled(false);
      }
    } catch (error) {
      setError('操作失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="divide-y divide-gray-200">
      {/* 密码设置 */}
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">更改密码</h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>请确保使用足够强度的密码以保护您的账户安全。</p>
        </div>
        <form onSubmit={handleChangePassword} className="mt-5 space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
              当前密码
            </label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              required
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
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              required
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
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isLoading ? '更新中...' : '更新密码'}
            </button>
          </div>
        </form>
      </div>

      {/* 两步验证 */}
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">两步验证</h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>启用两步验证以增强账户安全性。</p>
        </div>
        <div className="mt-5">
          {!is2FAEnabled && !showSetup2FA && (
            <button
              type="button"
              onClick={handleSetup2FA}
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              启用两步验证
            </button>
          )}

          {is2FAEnabled && (
            <div className="space-y-4">
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      两步验证已启用
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDisable2FA}
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                禁用两步验证
              </button>
            </div>
          )}

          {showSetup2FA && (
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-medium text-gray-900">
                  使用身份验证器应用扫描二维码
                </h4>
                <div className="mt-4">
                  {qrCode && (
                    <div className="inline-block p-4 bg-white rounded-lg shadow-sm">
                      <Image src={qrCode} alt="QR Code" width={200} height={200} />
                    </div>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  或手动输入密钥：
                  <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-sm">
                    {secret}
                  </code>
                </p>
              </div>

              <form onSubmit={handleVerify2FA} className="space-y-4">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                    验证码
                  </label>
                  <input
                    type="text"
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    placeholder="输入 6 位验证码"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {isLoading ? '验证中...' : '验证并启用'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* 错误和成功提示 */}
      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mt-4 rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">{success}</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 