const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testUpload() {
  try {
    // 创建测试图片
    const imageBuffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    const testImagePath = path.join(__dirname, 'test.gif');
    fs.writeFileSync(testImagePath, imageBuffer);

    // 创建表单数据
    const form = new FormData();
    form.append('file', fs.createReadStream(testImagePath), {
      filename: 'test.gif',
      contentType: 'image/gif'
    });

    // 发送请求到 API
    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      headers: {
        // 添加认证信息（需要先登录获取）
        'Cookie': 'next-auth.session-token=你的会话token'
      },
      body: form
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);

    // 如果上传成功，测试文件访问
    if (data.url) {
      console.log('Testing file access...');
      const fileResponse = await fetch(data.url);
      console.log('File access status:', fileResponse.status);
    }

    // 清理测试文件
    fs.unlinkSync(testImagePath);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// 运行测试
console.log('Starting upload test...');
testUpload().then(() => {
  console.log('Test completed');
}); 