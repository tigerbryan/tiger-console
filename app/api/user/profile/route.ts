import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const { name, email, avatar } = await request.json();

    // 验证必填字段
    if (!name || !email) {
      return NextResponse.json({ error: '用户名和邮箱不能为空' }, { status: 400 });
    }

    // 验证邮箱格式
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: '邮箱格式不正确' }, { status: 400 });
    }

    // 检查新邮箱是否已被使用（如果邮箱有变化）
    if (email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json({ error: '该邮箱已被使用' }, { status: 400 });
      }
    }

    // 更新用户信息
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name,
        email,
        avatar,
      },
    });

    return NextResponse.json({ 
      success: true,
      user
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: '更新失败，请稍后重试' },
      { status: 500 }
    );
  }
} 