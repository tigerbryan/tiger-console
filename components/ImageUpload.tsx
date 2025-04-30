'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
  currentImage?: string;
  onUpload: (url: string) => void;
  className?: string;
}

const DEFAULT_AVATAR = '/avatars/default.png';

export default function ImageUpload({ currentImage, onUpload, className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      if (data.url) {
        onUpload(data.url);
      }
    } catch (err) {
      setError('上传失败，请稍后重试');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const url = new FormData(form).get('url') as string;

    if (!url) {
      setError('请输入图片链接');
      return;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        setError('无法访问该图片链接');
        return;
      }
      onUpload(url);
      form.reset();
    } catch (err) {
      setError('无效的图片链接');
      console.error('URL validation error:', err);
    }
  };

  const handleReset = () => {
    onUpload(DEFAULT_AVATAR);
    setError('');
  };

  return (
    <div className={className}>
      <div className="flex items-center space-x-4">
        <div className="relative w-20 h-20">
          <Image
            src={currentImage || DEFAULT_AVATAR}
            alt="Avatar"
            className="rounded-full object-cover"
            fill
            sizes="80px"
          />
        </div>
        <div className="flex-1">
          <div className="flex flex-col space-y-2">
            <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
              <span>上传图片</span>
              <input
                type="file"
                className="sr-only"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
            <form onSubmit={handleUrlSubmit} className="flex space-x-2">
              <input
                type="url"
                name="url"
                placeholder="或输入图片链接"
                className="block w-full rounded-md border border-gray-300 py-1.5 px-3 text-sm"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500"
              >
                使用
              </button>
            </form>
            <button
              type="button"
              onClick={handleReset}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              恢复默认头像
            </button>
          </div>
        </div>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
      {isUploading && (
        <p className="mt-2 text-sm text-gray-500">上传中...</p>
      )}
    </div>
  );
} 