#!/usr/bin/env node

/**
 * 通过 localtunnel 将本地服务暴露到公网
 * 使用方式：npm run tunnel
 */

import localtunnel from 'localtunnel';
import http from 'http';

const PORT = 5177; // Vite 开发服务器端口
const SUBDOMAIN = 'qi-saas-demo'; // 可选的自定义子域名

async function startTunnel() {
  try {
    console.log('🚀 正在启动隧道...');
    console.log(`📡 本地服务端口：${PORT}`);
    
    const tunnel = await localtunnel({ 
      port: PORT,
      subdomain: SUBDOMAIN
    });
    
    console.log('✅ 隧道已建立！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🌐 公网访问地址：${tunnel.url}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n💡 提示：');
    console.log('   - 其他人可以通过上面的公网 URL 访问你的本地服务');
    console.log('   - 按 Ctrl+C 停止隧道');
    console.log('   - 隧道 URL 每次运行可能会变化（除非使用固定子域名）');
    
    tunnel.on('error', (err) => {
      console.error('❌ 隧道错误:', err.message);
    });
    
    tunnel.on('close', () => {
      console.log('\n👋 隧道已关闭');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ 启动隧道失败:', error.message);
    console.error('\n💡 请检查：');
    console.error(`   1. 本地服务是否已在端口 ${PORT} 运行`);
    console.error('   2. 网络连接是否正常');
    console.error('   3. localtunnel 服务是否可用');
    process.exit(1);
  }
}

// 检查本地服务是否运行
function checkLocalService() {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${PORT}`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// 主函数
(async () => {
  const isRunning = await checkLocalService();
  if (!isRunning) {
    console.error(`❌ 本地服务未在端口 ${PORT} 运行`);
    console.error(`\n💡 请先启动 Vite 开发服务器：`);
    console.error(`   cd /Users/hanweb/Documents/qi-saas（改）/qi-saas`);
    console.error(`   npm run dev`);
    process.exit(1);
  }
  
  await startTunnel();
})();
