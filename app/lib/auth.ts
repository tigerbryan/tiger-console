export const users = [
  {
    id: "1",
    name: "Tiger Admin",
    email: "admin@tigerkits.com",
    password: "tiger@2024", // 在实际生产环境中应该使用加密的密码
  },
] as const;

export type User = (typeof users)[number]; 