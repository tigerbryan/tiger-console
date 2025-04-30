import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const { email } = await request.json();

    // 验证新邮箱格式
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: '邮箱格式不正确' }, { status: 400 });
    }

    // 检查新邮箱是否已被使用
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.email !== session.user.email) {
      return NextResponse.json({ error: '该邮箱已被使用' }, { status: 400 });
    }

    // 更新用户邮箱
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { email },
    });

    return NextResponse.json({ 
      success: true,
      user
    });
  } catch (error) {
    console.error('Email update error:', error);
    return NextResponse.json(
      { error: '更新失败，请稍后重试' },
      { status: 500 }
    );
  }
} 