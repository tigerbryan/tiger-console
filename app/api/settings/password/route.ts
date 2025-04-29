import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { users } from '@/app/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();
    const user = users.find(u => u.id === session.user.id);
    
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    if (user.password !== currentPassword) {
      return NextResponse.json({ error: '当前密码错误' }, { status: 400 });
    }

    user.password = newPassword;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Password update error:', error);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
} 