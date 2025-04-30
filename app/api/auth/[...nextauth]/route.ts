import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { users, verifyTOTP } from "@/app/lib/auth";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "用户名", type: "text" },
        password: { label: "密码", type: "password" },
        code: { label: "验证码", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("用户名和密码不能为空");
        }

        const user = users.find(u => u.username === credentials.username);

        if (!user) {
          throw new Error("用户不存在");
        }

        if (user.password !== credentials.password) {
          throw new Error("密码错误");
        }

        // 如果启用了两步验证，但没有提供验证码
        if (user.twoFactorEnabled && !credentials.code) {
          throw new Error("requires2FA");
        }

        // 如果启用了两步验证，验证验证码
        if (user.twoFactorEnabled && credentials.code) {
          const isValidCode = verifyTOTP(credentials.code, user.twoFactorSecret || "");
          if (!isValidCode) {
            throw new Error("验证码无效");
          }
        }

        return {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          image: user.image
        };
      }
    })
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/login"
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.avatar = user.avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.avatar = token.avatar as string;
      }
      return session;
    },
  },
  debug: true,
  secret: process.env.NEXTAUTH_SECRET
});

export { handler as GET, handler as POST }; 