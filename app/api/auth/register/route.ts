import { NextResponse } from 'next/server';
import * as bcrypt from 'bcryptjs';
import { prisma } from '@lib/prisma';
import { z } from 'zod';

const registerSchema = z.object({
  username: z.string()
    .min(3, '用户名至少需要3个字符')
    .max(20, '用户名不能超过20个字符')
    .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),
  email: z.string()
    .email('请输入有效的邮箱地址'),
  password: z.string()
    .min(6, '密码至少需要6个字符')
    .max(50, '密码不能超过50个字符'),
  name: z.string()
    .min(2, '昵称至少需要2个字符')
    .max(20, '昵称不能超过20个字符'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 验证输入数据
    const validatedData = registerSchema.parse(body);
    
    // 检查用户名是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username: validatedData.username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '用户名已被使用' },
        { status: 400 }
      );
    }

    // 检查邮箱是否已存在
    const existingEmail = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: '邮箱已被注册' },
        { status: 400 }
      );
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username: validatedData.username,
        email: validatedData.email,
        name: validatedData.name,
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      message: '注册成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
} 