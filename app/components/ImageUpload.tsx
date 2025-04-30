'use client';

import { useState, useRef } from 'react';
import { DEFAULT_AVATAR } from '@lib/constants';

interface ImageUploadProps {
  currentImage?: string;
  onUpload: (url: string) => void;
  className?: string;
}

export default function ImageUpload({ currentImage, onUpload, className = '' }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(currentImage || DEFAULT_AVATAR);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setError('只能上传图片文件');
      return;
    }

    // 验证文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      setError('文件大小不能超过 5MB');
      return;
    }

    try {
      setIsUploading(true);
      setError('');

      // 上传文件
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '上传失败');
      }

      setPreview(data.url);
      onUpload(data.url);
    } catch (err: any) {
      setError(err.message);
      setPreview(currentImage || DEFAULT_AVATAR);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) return;

    try {
      setIsUploading(true);
      setError('');

      // 验证图片 URL 是否可访问
      const img = new Image();
      img.src = imageUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('无法加载图片，请检查 URL'));
      });

      setPreview(imageUrl);
      onUpload(imageUrl);
      setShowUrlInput(false);
      setImageUrl('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center space-x-4">
        <div
          onClick={handleClick}
          className="relative w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
        >
          <img
            src={preview}
            alt="Avatar"
            className="w-full h-full object-cover rounded-lg"
          />

          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={handleClick}
            disabled={isUploading}
            className="text-sm text-blue-600 hover:text-blue-800 block"
          >
            上传图片
          </button>
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            disabled={isUploading}
            className="text-sm text-blue-600 hover:text-blue-800 block"
          >
            {showUrlInput ? '取消' : '使用图片链接'}
          </button>
          {currentImage && currentImage !== DEFAULT_AVATAR && (
            <button
              type="button"
              onClick={() => {
                setPreview(DEFAULT_AVATAR);
                onUpload(DEFAULT_AVATAR);
              }}
              disabled={isUploading}
              className="text-sm text-red-600 hover:text-red-800 block"
            >
              恢复默认头像
            </button>
          )}
        </div>
      </div>

      {showUrlInput && (
        <form onSubmit={handleUrlSubmit} className="space-y-2">
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="输入图片 URL"
            className="block w-full max-w-md rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          <button
            type="submit"
            disabled={!imageUrl || isUploading}
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isUploading ? '设置中...' : '设置'}
          </button>
        </form>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
} 