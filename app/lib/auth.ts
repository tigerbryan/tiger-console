import { authenticator } from 'otplib';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  twoFactorSecret?: string;
  twoFactorEnabled: boolean;
}

// 生成一个新的密钥
const generateSecret = () => authenticator.generateSecret();

export const users: User[] = [
  {
    id: "1",
    name: "Tiger Admin",
    email: "admin@tigerkits.com",
    password: "tiger@2024",
    twoFactorSecret: generateSecret(),
    twoFactorEnabled: true,
  },
];

export const verifyTOTP = (token: string, secret: string) => {
  try {
    return authenticator.verify({ token, secret });
  } catch {
    return false;
  }
}; 