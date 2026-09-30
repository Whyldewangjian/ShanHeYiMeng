// 武侠文字游戏 · 局域网静态服务器
// 配合「启动局域网服务器.bat」使用：双击 .bat 即可启动。
// 手机连同一 WiFi，用浏览器打开下面打印出的地址即可游玩。
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = __dirname;   // 服务本目录（即游戏目录）
const PORT = 8000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

function lanIPs() {
  const out = [];
  const ifs = os.networkInterfaces();
  for (const name in ifs) {
    for (const it of ifs[name] || []) {
      if (it.family === 'IPv4' && !it.internal) out.push(it.address);
    }
  }
  return out;
}

const server = http.createServer(function (req, res) {
  let p = decodeURIComponent((req.url || '/').split('?')[0].split('#')[0]);
  if (p === '/') p = '/index.html';
  const file = path.normalize(path.join(ROOT, p));
  if (file !== ROOT && file.indexOf(ROOT + path.sep) !== 0) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }
  fs.readFile(file, function (err, data) {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found: ' + p);
      return;
    }
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', function () {
  console.log('');
  console.log('====================================================');
  console.log('  武侠文字游戏 · 局域网服务已启动');
  console.log('====================================================');
  console.log('  本机访问：http://localhost:' + PORT);
  const ips = lanIPs();
  if (ips.length) {
    console.log('  手机访问（需连同一 WiFi，浏览器打开下面任一地址）：');
    ips.forEach(function (ip) {
      console.log('    http://' + ip + ':' + PORT);
    });
  } else {
    console.log('  未检测到局域网 IP，请确认电脑已连接 WiFi。');
  }
  console.log('----------------------------------------------------');
  console.log('  直接关闭本窗口即可停止服务。');
  console.log('====================================================');
  console.log('');
});
