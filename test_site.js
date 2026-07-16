const { execSync } = require('child_process');
execSync('npm run build', { stdio: 'inherit' });
const http = require('http');
const fs = require('fs');
const path = require('path');
const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, 'dist', req.url === '/' ? 'index.html' : req.url);
  let extname = path.extname(filePath);
  let contentType = 'text/html';
  switch (extname) {
    case '.js': contentType = 'text/javascript'; break;
    case '.css': contentType = 'text/css'; break;
  }
  fs.readFile(filePath, (error, content) => {
    if (error) { res.writeHead(404); res.end('Error'); }
    else { res.writeHead(200, { 'Content-Type': contentType }); res.end(content, 'utf-8'); }
  });
});
server.listen(8080, async () => {
  console.log('Server running');
  try {
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
    await page.goto('http://localhost:8080');
    await new Promise(r => setTimeout(r, 2000));
    await browser.close();
  } catch (e) {
    console.log('Puppeteer failed:', e.message);
  }
  server.close();
  process.exit(0);
});
