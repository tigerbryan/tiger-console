import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth';
import { prisma } from '@lib/prisma';
import { Prisma } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session data:', JSON.stringify(session, null, 2));

    if (!session?.user?.username) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const { name, email, avatar } = await request.json();
    console.log('Update data:', { name, email, avatar });
    console.log('Current user:', session.user);

    try {
      // 先检查用户是否存在
      const user = await prisma.user.findUnique({
        where: { username: session.user.username }
      });

      if (!user) {
        console.error('User not found:', session.user.username);
        return NextResponse.json({ error: '用户不存在' }, { status: 404 });
      }

      console.log('Found user:', user);

      // 如果提供了新邮箱，检查是否已被使用
      if (email && email !== user.email) {
        const existingEmail = await prisma.user.findUnique({
          where: { email }
        });

        if (existingEmail) {
          return NextResponse.json({ error: '邮箱已被使用' }, { status: 400 });
        }
      }

      // 准备更新数据
      const updateData: Prisma.UserUpdateInput = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (avatar) {
        updateData.avatar = avatar;
        updateData.image = avatar;
      }

      console.log('Update data prepared:', updateData);

      const updatedUser = await prisma.user.update({
        where: { username: session.user.username },
        data: updateData
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
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma error code:', error.code);
        console.error('Prisma error message:', error.message);
        if (error.code === 'P2002') {
          return NextResponse.json({ error: '邮箱已被使用' }, { status: 400 });
        }
      }
      return NextResponse.json({ 
        error: '更新失败',
        details: error instanceof Error ? error.message : '未知错误'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: '服务器错误',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
} 