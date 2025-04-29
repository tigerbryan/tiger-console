'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import QRCode from 'qrcode';

export default function Setup2FA() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const email = searchParams.get('email');
    if (!email) return;

    fetch('/api/auth/setup-2fa', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setSecret(data.secret);
        const otpAuthUrl = `otpauth://totp/TigerConsole:${email}?secret=${data.secret}&issuer=TigerConsole`;
        return QRCode.toDataURL(otpAuthUrl);
      })
      .then(url => url && setQrCode(url))
      .catch(() => setError('获取二维码失败'));
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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
          email: searchParams.get('email'),
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        router.push('/');
      }
    } catch (error) {
      setError('验证过程中发生错误');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            设置两步验证
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            请使用 Google Authenticator 扫描下方二维码
          </p>
        </div>

        {qrCode && (
          <div className="flex justify-center">
            <img src={qrCode} alt="QR Code" className="w-64 h-64" />
          </div>
        )}

        <div className="mt-4">
          <p className="text-sm text-gray-600 text-center">
            密钥（如果无法扫描二维码，请手动输入）：
            <br />
            <code className="bg-gray-100 px-2 py-1 rounded">{secret}</code>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="code" className="sr-only">
              验证码
            </label>
            <input
              id="code"
              type="text"
              required
              className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="请输入验证器中的 6 位验证码"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              pattern="[0-9]{6}"
              maxLength={6}
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={isLoading || code.length !== 6}
            >
              {isLoading ? '验证中...' : '验证并完成设置'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 