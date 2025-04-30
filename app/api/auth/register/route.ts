import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    // 检查用户名是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '用户名已存在' },
        { status: 400 }
      );
    }

    // 创建新用户
    const hashedPassword = await hash(password, 12);
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name: username, // 设置默认名称
      }
    });

    return NextResponse.json(
      { message: '注册成功', userId: user.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    return NextResponse.json(
      { error: `注册失败: ${error.message}` },
      { status: 500 }
    );
  }
} 