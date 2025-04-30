import { NextResponse } from 'next/server';
import { users, verifyTOTP } from '@lib/auth';

export async function POST(request: Request) {
  try {
    const { code, secret, email } = await request.json();

    const user = users.find(u => u.email === email);
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 400 });
    }

    const isValid = verifyTOTP(code, secret);
    if (!isValid) {
      return NextResponse.json({ error: '验证码无效或已过期' }, { status: 400 });
    }

    // 在实际应用中，这里应该将状态保存到数据库
    user.twoFactorEnabled = true;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Verify setup error:', error);
    return NextResponse.json({ error: '验证过程中发生错误' }, { status: 500 });
  }
} 