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
    console.log('完整的 session 数据:', JSON.stringify(session, null, 2));
    
    if (!session?.user?.username) {
      console.log('未找到用户名，session.user:', session?.user);
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const { name, email, avatar } = await request.json();
    console.log('接收到的更新请求数据:', { name, email, avatar });
    console.log('当前用户名:', session.user.username);

    // 尝试连接数据库
    const connected = await connectWithRetry();
    if (!connected) {
      return NextResponse.json({ 
        error: '无法连接到数据库服务器，请稍后重试',
        details: '数据库连接失败，已重试3次'
      }, { status: 503 });
    }

    try {
      // 先检查用户是否存在
      const existingUser = await prisma.user.findFirst({
        where: {
          username: session.user.username
        }
      });

      console.log('数据库中找到的用户:', existingUser);

      if (!existingUser) {
        // 尝试查找所有用户，用于调试
        const allUsers = await prisma.user.findMany({
          select: {
            id: true,
            username: true,
            email: true
          }
        });
        console.log('数据库中的所有用户:', allUsers);
        
        console.error('在数据库中未找到用户，username:', session.user.username);
        return NextResponse.json({ error: '用户不存在' }, { status: 404 });
      }

      // 如果提供了新邮箱，检查邮箱是否已被使用
      if (email && email !== existingUser.email) {
        const emailUser = await prisma.user.findFirst({
          where: {
            email,
            NOT: {
              username: existingUser.username
            }
          }
        });

        if (emailUser) {
          return NextResponse.json({ error: '邮箱已被使用' }, { status: 400 });
        }
      }

      // 更新用户信息
      console.log('准备更新用户，用户信息:', {
        id: existingUser.id,
        username: existingUser.username,
        currentEmail: existingUser.email,
        newEmail: email,
        currentName: existingUser.name,
        newName: name,
        currentAvatar: existingUser.avatar,
        newAvatar: avatar
      });

      const updatedUser = await prisma.user.update({
        where: {
          username: existingUser.username
        },
        data: {
          name: name || undefined,
          email: email || undefined,
          image: avatar || undefined,
          avatar: avatar || undefined,
        }
      });

      console.log('用户更新成功:', updatedUser);

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
      console.error('数据库更新错误:', error);
      if (error instanceof Error) {
        console.error('错误详情:', {
          message: error.message,
          stack: error.stack
        });
      }
      return NextResponse.json({ 
        error: '更新失败，请稍后重试',
        details: error instanceof Error ? error.message : '未知错误'
      }, { status: 500 });
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error('Profile update error:', error);
    if (error instanceof Error) {
      console.error('错误详情:', {
        message: error.message,
        stack: error.stack
      });
    }
    return NextResponse.json({ 
      error: '更新失败，请稍后重试',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
} 