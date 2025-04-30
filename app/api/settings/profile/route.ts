import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const { name, email, avatar } = await request.json();

    // 如果提供了邮箱，检查邮箱是否已被使用
    if (email && email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: {
          email,
          NOT: {
            email: session.user.email
          }
        }
      });

      if (existingUser) {
        return NextResponse.json({ error: '邮箱已被使用' }, { status: 400 });
      }
    }

    // 更新用户信息
    const updatedUser = await prisma.user.update({
      where: {
        email: session.user.email
      },
      data: {
        name: name || undefined,
        email: email || undefined,
        avatar: avatar || undefined,
      }
    });

    return NextResponse.json({
      message: '更新成功',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
} 