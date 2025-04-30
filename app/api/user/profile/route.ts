import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const data = await request.json();
    
    // 更新用户信息
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        avatar: data.avatar,
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