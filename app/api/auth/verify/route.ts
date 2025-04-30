import { NextResponse } from 'next/server';
import { users, verifyTOTP } from '@lib/auth';

export async function POST(request: Request) {
  try {
    const { code, email } = await request.json();

    const user = users.find(u => u.email === email);
    if (!user || !user.twoFactorSecret) {
      return NextResponse.json({ error: '用户不存在或未启用两步验证' }, { status: 400 });
    }

    const isValid = verifyTOTP(code, user.twoFactorSecret);
    if (!isValid) {
      return NextResponse.json({ error: '验证码无效或已过期' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: '验证过程中发生错误' }, { status: 500 });
  }
} 