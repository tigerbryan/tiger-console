import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';

// 上传目录配置
const UPLOAD_DIR = '/usr/share/nginx/html/avatars';
const PUBLIC_URL = 'http://43.100.16.213/avatars'; // 使用服务器 IP

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

    try {
      // 生成文件名
      const ext = file.name.split('.').pop() || '';
      const filename = `${session.user.username}-${Date.now()}.${ext}`;
      const filepath = join(UPLOAD_DIR, filename);

      // 将文件转换为 Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 写入文件
      await writeFile(filepath, buffer);
      console.log('文件已保存:', filepath);

      // 生成访问 URL
      const url = `${PUBLIC_URL}/${filename}`;

      return NextResponse.json({
        url,
        success: true
      });
    } catch (fsError) {
      console.error('文件系统错误:', fsError);
      return NextResponse.json({ 
        error: '文件保存失败',
        details: fsError instanceof Error ? fsError.message : '未知错误'
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