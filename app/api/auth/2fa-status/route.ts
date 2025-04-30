import { NextResponse } from 'next/server';
import { users } from '@lib/auth';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    const user = users.find(u => u.email === email);
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 400 });
    }

    return NextResponse.json({ enabled: user.twoFactorEnabled });
  } catch (error) {
    console.error('2FA status error:', error);
    return NextResponse.json({ error: '获取状态失败' }, { status: 500 });
  }
} 