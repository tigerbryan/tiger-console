import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth';

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

    // 生成文件名
    const ext = file.type.split('/')[1];
    const filename = `${session.user.username}-${Date.now()}.${ext}`;

    // 上传到 Vercel Blob Storage
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    console.log('文件上传成功:', blob);

    return NextResponse.json({
      url: blob.url,
      success: true
    });
  } catch (error) {
    console.error('文件上传错误:', error);
    return NextResponse.json({ 
      error: '文件上传失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
} 