// 공통: 설치된 Chrome(없으면 Edge)으로 헤드리스 브라우저 실행
const fs = require('fs');
const puppeteer = require('puppeteer-core');

const CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA && process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
].filter(Boolean);

function findBrowser() {
  const found = CANDIDATES.find((p) => fs.existsSync(p));
  if (!found) throw new Error('Chrome 또는 Edge를 찾지 못했습니다.');
  return found;
}

function launch() {
  return puppeteer.launch({
    executablePath: findBrowser(),
    headless: true,
    args: ['--allow-file-access-from-files', '--font-render-hinting=none'],
  });
}

// --key value / --flag 형태의 인자 파싱
function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) args[key] = true;
      else { args[key] = next; i++; }
    } else args._.push(a);
  }
  return args;
}

const IMAGE_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.avif'];
const UNSUPPORTED_EXT = ['.heic', '.heif', '.tif', '.tiff'];

module.exports = { launch, parseArgs, IMAGE_EXT, UNSUPPORTED_EXT };
