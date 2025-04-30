import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@lib/prisma';

// 配置
const UPLOAD_DIR = join(process.cwd(), 'public/avatars');
const PUBLIC_URL = '/avatars';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

export async function POST(request: Request) {
  try {
    // 1. 验证用户登录
    const session = await getServerSession(authOptions);
    console.log('Session data:', session);
    console.log('Upload directory:', UPLOAD_DIR);

    if (!session?.user?.id) {
      console.log('No user session found');
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    // 2. 获取上传文件
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.log('No file uploaded');
      return NextResponse.json({ error: '未找到文件' }, { status: 400 });
    }

    // 3. 验证文件
    if (!ALLOWED_TYPES.includes(file.type)) {
      console.log('Invalid file type:', file.type);
      return NextResponse.json({ error: '只支持 JPG、PNG、GIF 格式' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      console.log('File too large:', file.size);
      return NextResponse.json({ error: '文件大小不能超过 5MB' }, { status: 400 });
    }

    try {
      // 4. 确保上传目录存在
      await mkdir(UPLOAD_DIR, { recursive: true });
      console.log('Upload directory created/verified');

      // 5. 生成文件名
      const ext = file.name.split('.').pop() || '';
      const filename = `${session.user.id}-${Date.now()}.${ext}`;
      const filepath = join(UPLOAD_DIR, filename);
      console.log('Target filepath:', filepath);

      // 6. 保存文件
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);
      console.log('File saved successfully');

      // 7. 更新用户头像
      const url = `${PUBLIC_URL}/${filename}`;
      await prisma.user.update({
        where: { id: session.user.id },
        data: { 
          avatar: url,
          image: url
        }
      });
      console.log('User avatar updated:', url);

      return NextResponse.json({
        url,
        success: true
      });
    } catch (error) {
      console.error('File system error:', error);
      return NextResponse.json({ 
        error: '文件保存失败',
        details: error instanceof Error ? error.message : '未知错误'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Request error:', error);
    return NextResponse.json({ 
      error: '服务器错误',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
} 