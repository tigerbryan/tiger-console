"use client";
import { useState } from "react";

export default function ConsoleHome() {
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (email === "admin@tigerkits.com" && password === "123456") {
      setAuthenticated(true);
    } else {
      alert("登录失败，请检查账号密码");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {!authenticated ? (
        <div className="w-full max-w-sm p-6 bg-white shadow rounded space-y-4">
          <h1 className="text-xl font-bold">Tiger 控制台登录</h1>
          <input
            className="w-full border p-2 rounded"
            placeholder="邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full border p-2 rounded"
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            onClick={handleLogin}
          >
            登录
          </button>
        </div>
      ) : (
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold">🎯 Tiger 控制台主页</h2>
          <p>欢迎回来，您可以从此管理 Jellyfin、Tunnel 或上传内容。</p>
          <div className="space-x-4">
            <button className="px-4 py-2 border rounded">Jellyfin 状态</button>
            <button className="px-4 py-2 border rounded">Tunnel 配置</button>
            <button className="px-4 py-2 border rounded">媒体上传</button>
          </div>
        </div>
      )}
    </div>
  );
}
