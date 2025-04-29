import { NextResponse } from 'next/server';
import { users } from '@/app/lib/auth';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    const user = users.find(u => u.email === email);
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 400 });
    }

    // 在实际应用中，这里应该将状态保存到数据库
    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Disable 2FA error:', error);
    return NextResponse.json({ error: '禁用失败' }, { status: 500 });
  }
} 