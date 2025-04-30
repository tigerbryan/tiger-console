import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth';
import { prisma } from '@lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('=== 开始处理个人资料更新请求 ===');
    console.log('Session 数据:', JSON.stringify(session, null, 2));
    
    if (!session?.user?.username) {
      console.log('未找到用户名，session.user:', session?.user);
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const { name, email, avatar } = await request.json();
    console.log('接收到的更新数据:', { name, email, avatar });
    console.log('当前用户名:', session.user.username);

    try {
      // 先检查用户是否存在
      const existingUser = await prisma.user.findUnique({
        where: { username: session.user.username }
      });

      console.log('数据库查询结果:', existingUser);

      if (!existingUser) {
        console.log('在数据库中未找到用户:', {
          searchedUsername: session.user.username,
          allFields: existingUser
        });
        
        // 查询所有用户用于调试
        const allUsers = await prisma.user.findMany({
          select: {
            username: true,
            email: true
          }
        });
        console.log('数据库中的所有用户:', allUsers);
        
        return NextResponse.json({ 
          error: '用户不存在',
          debug: {
            searchedUsername: session.user.username,
            sessionUser: session.user,
            databaseUsers: allUsers
          }
        }, { status: 404 });
      }

      // 准备更新数据
      const updateData = {
        name: name || undefined,
        email: email || undefined,
        avatar: avatar || undefined,
        image: avatar || undefined,
      };
      console.log('准备更新的数据:', updateData);

      const updatedUser = await prisma.user.update({
        where: { username: session.user.username },
        data: updateData
      });

      console.log('更新成功，更新后的用户数据:', updatedUser);

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
      console.error('数据库操作错误:', error);
      if (error instanceof Error) {
        console.error('错误详情:', {
          message: error.message,
          stack: error.stack
        });
      }
      return NextResponse.json({ 
        error: '更新失败',
        details: error instanceof Error ? error.message : '未知错误',
        debug: {
          sessionUser: session.user,
          errorType: error instanceof Error ? error.constructor.name : typeof error
        }
      }, { status: 500 });
    }
  } catch (error) {
    console.error('API 错误:', error);
    if (error instanceof Error) {
      console.error('错误堆栈:', error.stack);
    }
    return NextResponse.json({ 
      error: '服务器错误',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
} 