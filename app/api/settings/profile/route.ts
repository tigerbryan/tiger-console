import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth';
import { prisma } from '@lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session data:', JSON.stringify(session, null, 2));
    
    if (!session?.user?.id) {
      console.log('No user session:', session?.user);
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const { name, email, avatar } = await request.json();
    console.log('Update data:', { name, email, avatar });

    try {
      // 先检查用户是否存在
      const existingUser = await prisma.user.findUnique({
        where: {
          id: session.user.id
        }
      });

      console.log('Found user:', existingUser);

      if (!existingUser) {
        console.log('User not found with ID:', session.user.id);
        
        // 尝试通过用户名查找
        const userByUsername = await prisma.user.findUnique({
          where: {
            username: session.user.username
          }
        });

        if (userByUsername) {
          console.log('Found user by username:', userByUsername);
          // 更新 session 中的用户 ID
          session.user.id = userByUsername.id;
        } else {
          return NextResponse.json({ error: '用户不存在' }, { status: 404 });
        }
      }

      // 如果提供了新邮箱，检查是否已被使用
      if (email && email !== existingUser?.email) {
        const emailUser = await prisma.user.findUnique({
          where: {
            email,
            NOT: {
              id: session.user.id
            }
          }
        });

        if (emailUser) {
          return NextResponse.json({ error: '邮箱已被使用' }, { status: 400 });
        }
      }

      // 更新用户信息
      const updateData = {
        ...(name && { name }),
        ...(email && { email }),
        ...(avatar && { avatar, image: avatar })
      };

      console.log('Updating user with data:', updateData);

      const updatedUser = await prisma.user.update({
        where: {
          id: session.user.id
        },
        data: updateData
      });

      console.log('User updated:', updatedUser);

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
      console.error('Database error:', error);
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