'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';

export default function SecuritySettings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    // 获取当前 2FA 状态
    if (session?.user?.email) {
      fetch('/api/auth/2fa-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: session.user.email }),
      })
        .then(res => res.json())
        .then(data => setIs2FAEnabled(data.enabled))
        .catch(() => setError('获取两步验证状态失败'));
    }
  }, [session]);

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
      setShowSetup(true);
    } catch (error) {
      setError('设置过程中发生错误');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
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
        setSuccess('两步验证设置成功！');
        setIs2FAEnabled(true);
        setShowSetup(false);
        setCode('');
      }
    } catch (error) {
      setError('验证过程中发生错误');
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
      setError('操作过程中发生错误');
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
              安全设置
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
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-medium text-gray-900">两步验证</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    使用 Google Authenticator 增强账户安全性
                  </p>
                </div>
                {is2FAEnabled ? (
                  <button
                    type="button"
                    onClick={handleDisable2FA}
                    disabled={isLoading}
                    className="ml-3 inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    {isLoading ? '处理中...' : '禁用'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSetup2FA}
                    disabled={isLoading}
                    className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {isLoading ? '处理中...' : '设置'}
                  </button>
                )}
              </div>

              {showSetup && (
                <div className="mt-6 space-y-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-4">
                      请使用 Google Authenticator 扫描以下二维码：
                    </p>
                    {qrCode && (
                      <div className="flex justify-center">
                        <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-2">
                      或手动输入以下密钥：
                    </p>
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                      {secret}
                    </code>
                  </div>

                  <form onSubmit={handleVerify} className="space-y-4">
                    <div>
                      <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                        验证码
                      </label>
                      <input
                        type="text"
                        id="code"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="输入 6 位验证码"
                        required
                        pattern="[0-9]{6}"
                        maxLength={6}
                        disabled={isLoading}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading || code.length !== 6}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {isLoading ? '验证中...' : '验证并启用'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 