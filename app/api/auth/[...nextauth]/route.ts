import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { users } from "@/app/lib/auth";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "用户名", type: "text" },
        password: { label: "密码", type: "password" }
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
    signIn: "/auth/signin",
    error: "/auth/signin"
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