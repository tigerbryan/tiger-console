import OSS from 'ali-oss';

// OSS 客户端配置
export const ossClient = new OSS({
  region: 'oss-cn-beijing', // 根据您的 OSS 所在区域修改
  accessKeyId: process.env.OSS_ACCESS_KEY_ID!,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET!,
  bucket: process.env.OSS_BUCKET!,
  secure: true, // 使用 HTTPS
});

// 生成 OSS 文件名
export function generateOssPath(filename: string): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `avatars/${year}/${month}/${day}/${Date.now()}-${filename}`;
}

// 获取文件的公共访问 URL
export function getPublicUrl(ossPath: string): string {
  return `https://${process.env.OSS_BUCKET}.${process.env.OSS_REGION}.aliyuncs.com/${ossPath}`;
} 