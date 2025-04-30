import { authenticator } from 'otplib';

export interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
  password: string;
  avatar?: string;
  image?: string;
  twoFactorSecret?: string;
  twoFactorEnabled: boolean;
}

function generateSecret() {
  return authenticator.generateSecret();
}

export function verifyTOTP(token: string, secret: string) {
  return authenticator.verify({ token, secret });
}

export const users: User[] = [
  {
    id: "1",
    username: "tiger",
    name: "tiger",
    email: "admin@tigerkits.com",
    password: "tiger@2024",
    avatar: "/avatars/default.png",
    image: "/avatars/default.png",
    twoFactorSecret: generateSecret(),
    twoFactorEnabled: false,
  },
]; 