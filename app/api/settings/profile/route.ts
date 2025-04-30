import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth';
import { prisma } from '@lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const { name, email, avatar } = await request.json();
    console.log('Received update request:', { name, email, avatar });

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

    try {
      // 检查数据库连接
      await prisma.$connect();
      console.log('Database connection successful');

      // 更新用户信息
      const updatedUser = await prisma.user.update({
        where: {
          email: session.user.email
        },
        data: {
          name: name || undefined,
          email: email || undefined,
          image: avatar || undefined,
          avatar: avatar || undefined,
        }
      });

      console.log('User updated successfully:', updatedUser);

      return NextResponse.json({
        message: '更新成功',
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          avatar: updatedUser.avatar || updatedUser.image
        }
      });
    } catch (dbError) {
      console.error('Database update error:', dbError);
      if (dbError instanceof Error) {
        console.error('Error details:', {
          message: dbError.message,
          stack: dbError.stack,
          name: dbError.name
        });
        return NextResponse.json({ 
          error: `数据库更新失败: ${dbError.message}`,
          details: process.env.NODE_ENV === 'development' ? dbError.stack : undefined
        }, { status: 500 });
      }
      return NextResponse.json({ error: '数据库更新失败' }, { status: 500 });
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error('Profile update error:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      return NextResponse.json({ 
        error: `更新失败: ${error.message}`,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, { status: 500 });
    }
    return NextResponse.json({ error: '更新失败，请稍后重试' }, { status: 500 });
  }
} 