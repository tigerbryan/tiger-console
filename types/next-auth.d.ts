import 'next-auth';

declare module 'next-auth' {
  interface User {
    id?: string;
    username?: string;
    name?: string | null;
    email?: string | null;
    avatar?: string | null;
    image?: string | null;
  }

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