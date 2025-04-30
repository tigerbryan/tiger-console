import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth';
import { ossClient, generateOssPath, getPublicUrl } from '@lib/oss';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.username) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: '未找到文件' }, { status: 400 });
    }

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: '只支持图片文件' }, { status: 400 });
    }

    // 验证文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: '文件大小不能超过 5MB' }, { status: 400 });
    }

    // 生成 OSS 文件路径
    const ext = file.name.split('.').pop() || '';
    const ossPath = generateOssPath(`${session.user.username}.${ext}`);

    try {
      // 将文件转换为 Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 上传到 OSS
      const result = await ossClient.put(ossPath, buffer, {
        headers: {
          'Content-Type': file.type,
          'Cache-Control': 'max-age=31536000', // 缓存一年
        },
      });

      console.log('文件上传成功:', result);

      // 获取文件的公共访问 URL
      const url = getPublicUrl(ossPath);

      return NextResponse.json({
        url,
        success: true
      });
    } catch (ossError) {
      console.error('OSS 上传错误:', ossError);
      return NextResponse.json({ 
        error: '文件上传失败',
        details: ossError instanceof Error ? ossError.message : '未知错误'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('请求处理错误:', error);
    return NextResponse.json({ 
      error: '服务器错误',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
} 