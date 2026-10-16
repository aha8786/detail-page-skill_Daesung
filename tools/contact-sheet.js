// 사진 폴더 미리보기(컨택트 시트) 만들기
// 사용법: node tools/contact-sheet.js <사진폴더> [--out 출력폴더] [--cols 4] [--per 20]
// - 하위 폴더까지 이미지 파일을 모두 찾아 번호·파일명·크기 목록을 출력하고
//   번호와 파일명이 붙은 미리보기 PNG를 만든다. (사진이 많으면 여러 장으로 나눔)
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { launch, parseArgs, IMAGE_EXT, UNSUPPORTED_EXT } = require('./browser');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

(async () => {
  const args = parseArgs(process.argv.slice(2));
  const dir = args._[0];
  if (!dir || !fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    console.error(`폴더를 찾을 수 없습니다: ${dir || '(경로 없음)'}`);
    process.exit(1);
  }
  const root = path.resolve(dir);
  const outDir = path.resolve(args.out || path.join(root, '_contact'));
  const cols = Number(args.cols || 4);
  const per = Number(args.per || 20);

  const all = walk(root).filter((p) => !p.startsWith(outDir));
  const images = all.filter((p) => IMAGE_EXT.includes(path.extname(p).toLowerCase())).sort();
  const unsupported = all.filter((p) => UNSUPPORTED_EXT.includes(path.extname(p).toLowerCase()));

  if (unsupported.length) {
    console.log(`[지원 안 됨] 아래 파일은 브라우저에서 열 수 없어 제외했습니다. JPG/PNG로 변환해 주세요.`);
    unsupported.forEach((p) => console.log('  - ' + path.relative(root, p)));
  }
  if (!images.length) {
    console.error(`이미지 파일이 없습니다: ${root}`);
    process.exit(2);
  }
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await launch();
  const page = await browser.newPage();
  const cell = 260;
  await page.setViewport({ width: cols * cell + 16, height: 100 });

  const list = [];
  for (let s = 0; s * per < images.length; s++) {
    const chunk = images.slice(s * per, (s + 1) * per);
    const html = `<!doctype html><meta charset="utf-8"><style>
      body{margin:0;padding:8px;background:#222;font-family:'Malgun Gothic',sans-serif}
      .g{display:grid;grid-template-columns:repeat(${cols},${cell - 8}px);gap:8px}
      figure{margin:0;background:#333;color:#eee;font-size:12px}
      .box{width:${cell - 8}px;height:${cell - 8}px;display:flex;align-items:center;justify-content:center;background:#111}
      img{max-width:100%;max-height:100%}
      figcaption{padding:4px 6px;word-break:break-all}
      b{color:#ffcf40;font-size:14px}
    </style><div class="g">${chunk
      .map((p, i) => `<figure><div class="box"><img src="${pathToFileURL(p).href}"></div>
        <figcaption><b>#${s * per + i + 1}</b> ${esc(path.relative(root, p))} <span class="wh"></span></figcaption></figure>`)
      .join('')}</div>`;
    const tmp = path.join(outDir, `_sheet_${s + 1}.html`);
    fs.writeFileSync(tmp, html);
    await page.goto(pathToFileURL(tmp).href, { waitUntil: 'load' });
    const sizes = await page.evaluate(async () => {
      const imgs = [...document.images];
      await Promise.all(imgs.map((im) => (im.complete ? 0 : new Promise((r) => { im.onload = im.onerror = r; }))));
      return imgs.map((im, i) => {
        const wh = im.naturalWidth ? `${im.naturalWidth}x${im.naturalHeight}` : '열기 실패';
        document.querySelectorAll('.wh')[i].textContent = `(${wh})`;
        return wh;
      });
    });
    chunk.forEach((p, i) => list.push({ no: s * per + i + 1, file: path.relative(root, p), size: sizes[i] }));
    const png = path.join(outDir, `contact_${String(s + 1).padStart(2, '0')}.png`);
    await page.screenshot({ path: png, fullPage: true });
    fs.unlinkSync(tmp);
    console.log(`[미리보기] ${png}`);
  }
  await browser.close();

  console.log(`\n이미지 ${list.length}장 (폴더: ${root})`);
  list.forEach((r) => console.log(`#${r.no}\t${r.file}\t${r.size}`));
})().catch((e) => { console.error(e.message); process.exit(1); });
