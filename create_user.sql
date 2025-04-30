-- 创建初始用户
INSERT INTO "User" (
  "id",
  "username",
  "name",
  "email",
  "emailVerified",
  "image",
  "avatar",
  "password",
  "twoFactorEnabled",
  "twoFactorSecret",
  "createdAt",
  "updatedAt"
) VALUES (
  'clhz2n9ko0000qwl8kf0p1p1p',  -- 使用 cuid 格式的 ID
  'admin',                       -- 用户名
  'Admin User',                  -- 显示名称
  'admin@example.com',          -- 邮箱
  NOW(),                        -- 邮箱验证时间
  NULL,                         -- 图片
  NULL,                         -- 头像
  NULL,                         -- 密码（如果使用第三方认证可以为空）
  false,                        -- 2FA 禁用
  NULL,                         -- 2FA 密钥
  NOW(),                        -- 创建时间
  NOW()                         -- 更新时间
); 