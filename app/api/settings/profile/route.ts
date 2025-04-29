import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { users } from '@/app/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { name, avatar } = await request.json();
    const user = users.find(u => u.id === session.user.id);
    
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    user.name = name;
    user.avatar = avatar;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
} 