import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      username?: string;
      name?: string | null;
      email?: string | null;
      avatar?: string | null;
      image?: string | null;
    }
  }
} 