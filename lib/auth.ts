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

export const verifyTOTP = (token: string, secret: string): boolean => {
  try {
    return authenticator.verify({ token, secret });
  } catch (error) {
    console.error('TOTP verification error:', error);
    return false;
  }
};

export const generateSecret = (): string => {
  return authenticator.generateSecret();
};

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: '用户名', type: 'text' },
        password: { label: '密码', type: 'password' },
        code: { label: '验证码', type: 'text' }
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
          throw new Error('用户不存在');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error('密码错误');
        }

        // 如果启用了两步验证，但没有提供验证码
        if (user.twoFactorEnabled && !credentials.code) {
          throw new Error('requires2FA');
        }

        // 如果启用了两步验证，验证验证码
        if (user.twoFactorEnabled && credentials.code) {
          const isValidCode = verifyTOTP(credentials.code, user.twoFactorSecret || '');
          if (!isValidCode) {
            throw new Error('验证码无效');
          }
        }

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
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
}; 