import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { users } from "@/app/lib/auth";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "用户名", type: "text" },
        password: { label: "密码", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.username || !credentials?.password) {
            console.log("Missing credentials");
            return null;
          }
          
          const user = users.find(u => u.username === credentials.username);
          console.log("Found user:", user?.username);
          
          if (user && user.password === credentials.password) {
            console.log("Login successful");
            return {
              id: user.id,
              username: user.username,
              name: user.name,
              email: user.email,
              avatar: user.avatar,
            };
          }
          
          console.log("Invalid credentials");
          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    }),
  ],
  pages: {
    signIn: "/auth/login",
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
});

export { handler as GET, handler as POST }; 