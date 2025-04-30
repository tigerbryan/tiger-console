import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth';
import { prisma } from '@lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session data:', session);

    if (!session?.user?.username) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const { name, email, avatar } = await request.json();
    console.log('Update data:', { name, email, avatar });

    try {
      const updatedUser = await prisma.user.update({
        where: {
          username: session.user.username
        },
        data: {
          name: name || undefined,
          email: email || undefined,
          image: avatar || undefined,
          avatar: avatar || undefined,
        }
      });

      console.log('Updated user:', updatedUser);

      return NextResponse.json({
        message: '更新成功',
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          name: updatedUser.name,
          email: updatedUser.email,
          avatar: updatedUser.avatar || updatedUser.image
        }
      });
    } catch (error) {
      console.error('Update error:', error);
      return NextResponse.json({ error: '更新失败' }, { status: 500 });
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
} 