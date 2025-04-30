import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import { authenticator } from 'otplib';

export interface User {
  id: string;
  username: string;
  name: string | null;
  email: string | null;
  password: string;
  avatar?: string | null;
  image?: string | null;
  twoFactorSecret?: string;
  twoFactorEnabled: boolean;
}

// 临时用户数据，后续会迁移到数据库
export const users: User[] = [
  {
    id: "1",
    username: "tiger",
    name: "tiger",
    email: "admin@tigerkits.com",
    password: "tiger@2024",
    avatar: "/avatars/default.png",
    image: "/avatars/default.png",
    twoFactorSecret: authenticator.generateSecret(),
    twoFactorEnabled: false,
  }
];

export function verifyTOTP(token: string, secret: string): boolean {
  return authenticator.verify({ token, secret });
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: '用户名', type: 'text' },
        password: { label: '密码', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('请输入用户名和密码');
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
            password: true,
            avatar: true,
            image: true,
            twoFactorEnabled: true,
            twoFactorSecret: true,
          }
        });

        if (!user || !user.password) {
          console.error('用户不存在:', credentials.username);
          throw new Error('用户不存在');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          console.error('密码错误:', credentials.username);
          throw new Error('密码错误');
        }

        console.log('用户登录成功:', {
          id: user.id,
          username: user.username,
          email: user.email
        });

        return {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          avatar: user.avatar || user.image,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log('JWT 回调 - 用户数据:', user);
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
        token.name = user.name;
        token.avatar = user.avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        console.log('Session 回调 - token 数据:', token);
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.avatar = token.avatar as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  debug: true, // 启用调试模式
  secret: process.env.NEXTAUTH_SECRET,
}; 