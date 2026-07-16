const { exec } = require('child_process');
const server = exec('npm run dev');
setTimeout(async () => {
  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  await page.goto('http://localhost:5173');
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
  server.kill();
  process.exit(0);
}, 2000);
