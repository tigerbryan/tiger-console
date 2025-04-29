import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { users } from "@/app/lib/auth";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("Missing credentials");
            return null;
          }
          
          const user = users.find(u => u.email === credentials.email);
          console.log("Found user:", user?.email);
          
          if (user && user.password === credentials.password) {
            console.log("Login successful");
            return {
              id: user.id,
              name: user.name,
              email: user.email,
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
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  debug: true,
});

export { handler as GET, handler as POST }; 