import { NextResponse } from 'next/server';
import { authenticator } from 'otplib';
import { users } from '@/app/lib/auth';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    const user = users.find(u => u.email === email);
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 400 });
    }

    // 生成新的密钥
    const secret = authenticator.generateSecret();
    
    // 在实际应用中，这里应该将密钥保存到数据库
    user.twoFactorSecret = secret;

    return NextResponse.json({ secret });
  } catch (error) {
    console.error('Setup 2FA error:', error);
    return NextResponse.json({ error: '设置过程中发生错误' }, { status: 500 });
  }
} 