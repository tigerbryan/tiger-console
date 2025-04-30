import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth';
import { prisma } from '@lib/prisma';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

async function connectWithRetry() {
  let retries = 0;
  while (retries < MAX_RETRIES) {
    try {
      await prisma.$connect();
      console.log('Database connection successful');
      return true;
    } catch (error) {
      console.error(`Connection attempt ${retries + 1} failed:`, error);
      retries++;
      if (retries < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY}ms...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }
  return false;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.username) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const { name, email, avatar } = await request.json();
    console.log('Received update request:', { name, email, avatar });

    // 尝试连接数据库，最多重试3次
    const connected = await connectWithRetry();
    if (!connected) {
      return NextResponse.json({ 
        error: '无法连接到数据库服务器，请稍后重试',
        details: '数据库连接失败，已重试3次'
      }, { status: 503 });
    }

    try {
      // 如果提供了邮箱，检查邮箱是否已被使用
      if (email && email !== session.user.email) {
        const existingUser = await prisma.user.findUnique({
          where: {
            email,
            NOT: {
              username: session.user.username
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
          username: session.user.username
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
      try {
        await prisma.$disconnect();
      } catch (error) {
        console.error('Error disconnecting from database:', error);
      }
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