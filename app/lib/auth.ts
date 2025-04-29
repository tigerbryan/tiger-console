import { authenticator } from 'otplib';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
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
    name: "tiger",
    email: "admin@tigerkits.com",
    password: "tiger@2024",
    twoFactorSecret: generateSecret(),
    twoFactorEnabled: true,
  },
]; 