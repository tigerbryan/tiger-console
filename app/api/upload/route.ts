import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';

// 配置
const UPLOAD_DIR = '/usr/share/nginx/html/avatars';
const PUBLIC_URL = 'http://43.100.16.213/avatars';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

export async function POST(request: Request) {
  try {
    // 1. 验证用户登录
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    // 2. 获取上传文件
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: '未找到文件' }, { status: 400 });
    }

    // 3. 验证文件
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: '只支持 JPG、PNG、GIF 格式' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: '文件大小不能超过 5MB' }, { status: 400 });
    }

    // 4. 生成文件名
    const ext = file.name.split('.').pop() || '';
    const filename = `${session.user.id}-${Date.now()}.${ext}`;
    const filepath = join(UPLOAD_DIR, filename);

    try {
      // 5. 保存文件
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);

      // 6. 返回访问 URL
      const url = `${PUBLIC_URL}/${filename}`;
      console.log('文件上传成功:', { filepath, url });

      return NextResponse.json({
        url,
        success: true
      });
    } catch (error) {
      console.error('文件保存错误:', error);
      return NextResponse.json({ 
        error: '文件保存失败',
        details: error instanceof Error ? error.message : '未知错误'
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