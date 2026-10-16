// 상세페이지 HTML → PNG 출력 + 확인용 페이지 + 전체 zip (B-6, B-8)
// 사용법: node tools/render.js <html파일> [--name 상품명] [--x2]
// - 출력 위치는 html 파일이 있는 폴더.
//   [상품명]_full.png, block-01.png …, (--x2면 2x/ 폴더에 1220px 버전),
//   review.html(확인·다운로드 페이지), [상품명]_전체.zip
// - 블록은 <section> 단위로 자른다. 가로 610px이 아닌 블록, 가로 넘침, 안 불러와진 이미지를 경고한다.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { pathToFileURL } = require('url');
const { launch, parseArgs } = require('./browser');

const WIDTH = 610;
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

async function capture(browser, htmlPath, outDir, name, scale) {
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: 1000, deviceScaleFactor: scale });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle0', timeout: 60000 });
  const check = await page.evaluate(async (W) => {
    await document.fonts.ready;
    const imgs = [...document.images];
    await Promise.all(imgs.map((im) => (im.complete ? 0 : new Promise((r) => { im.onload = im.onerror = r; }))));
    return {
      scrollWidth: document.documentElement.scrollWidth,
      sections: [...document.querySelectorAll('section')].map((s, i) => ({
        no: i + 1, id: s.id || s.dataset.block || '', w: Math.round(s.getBoundingClientRect().width),
        h: Math.round(s.getBoundingClientRect().height),
      })),
      brokenImages: imgs.filter((im) => !im.naturalWidth).map((im) => im.getAttribute('src')),
      fontsLoaded: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family),
      W,
    };
  }, WIDTH);

  fs.mkdirSync(outDir, { recursive: true });
  const files = [];
  const full = path.join(outDir, `${name}_full.png`);
  await page.screenshot({ path: full, fullPage: true });
  files.push(full);
  const els = await page.$$('section');
  for (let i = 0; i < els.length; i++) {
    const p = path.join(outDir, `block-${String(i + 1).padStart(2, '0')}.png`);
    await els[i].screenshot({ path: p });
    files.push(p);
  }
  await page.close();
  return { check, files };
}

(async () => {
  const args = parseArgs(process.argv.slice(2));
  const htmlPath = args._[0] && path.resolve(args._[0]);
  if (!htmlPath || !fs.existsSync(htmlPath)) {
    console.error(`HTML 파일을 찾을 수 없습니다: ${args._[0] || '(경로 없음)'}`);
    process.exit(1);
  }
  const dir = path.dirname(htmlPath);
  const name = args.name || path.parse(htmlPath).name;

  const browser = await launch();
  const { check, files } = await capture(browser, htmlPath, dir, name, 1);
  let files2x = [];
  if (args.x2) files2x = (await capture(browser, htmlPath, path.join(dir, '2x'), name, 2)).files;
  await browser.close();

  // 점검 결과
  const warn = [];
  if (!check.sections.length) warn.push('<section>이 없습니다. 블록마다 <section>으로 나눠야 블록별 이미지가 나옵니다.');
  if (check.scrollWidth > WIDTH) warn.push(`가로 넘침: 페이지 폭이 ${check.scrollWidth}px입니다 (${WIDTH}px이어야 함).`);
  check.sections.filter((s) => s.w !== WIDTH).forEach((s) => warn.push(`블록 ${s.no}${s.id ? ` (${s.id})` : ''} 가로 ${s.w}px`));
  check.brokenImages.forEach((s) => warn.push(`이미지 불러오기 실패: ${s}`));
  console.log('블록:', check.sections.map((s) => `${s.no}${s.id ? `(${s.id})` : ''} ${s.w}x${s.h}`).join(', '));
  console.log('불러온 폰트:', [...new Set(check.fontsLoaded)].join(', ') || '(웹폰트 없음)');
  console.log(warn.length ? '[경고]\n - ' + warn.join('\n - ') : '[점검] 폭·이미지 이상 없음');

  // 전체 zip
  const zip = path.join(dir, `${name}_전체.zip`);
  const zipItems = [...files, htmlPath, ...(files2x.length ? [path.join(dir, '2x')] : [])];
  if (fs.existsSync(zip)) fs.unlinkSync(zip);
  execFileSync('powershell', ['-NoProfile', '-Command',
    `Compress-Archive -LiteralPath ${zipItems.map((p) => `'${p.replace(/'/g, "''")}'`).join(',')} -DestinationPath '${zip.replace(/'/g, "''")}' -Force`]);

  // 확인용 페이지
  const rel = (p) => path.relative(dir, p).split(path.sep).join('/');
  const blocks = files.slice(1);
  const review = `<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(name)} 상세페이지</title><style>
body{margin:0;background:#eceff1;font-family:'Pretendard','Malgun Gothic',sans-serif;color:#222}
header{position:sticky;top:0;background:#fff;padding:12px 16px;border-bottom:1px solid #ddd;display:flex;gap:8px;flex-wrap:wrap;align-items:center;z-index:1}
h1{font-size:17px;margin:0 auto 0 0}
a.btn{background:#1f6f43;color:#fff;text-decoration:none;padding:8px 14px;border-radius:6px;font-size:14px}
a.sub{background:#fff;color:#1f6f43;border:1px solid #1f6f43}
main{max-width:${WIDTH}px;margin:16px auto;padding:0 0 40px}
.blk{background:#fff;margin-bottom:12px;box-shadow:0 1px 3px rgba(0,0,0,.1)}
.blk img{display:block;width:100%}
.bar{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;font-size:13px}
.bar a{color:#1f6f43}
</style>
<header><h1>${esc(name)} 상세페이지 (${blocks.length}블록)</h1>
<a class="btn" href="${encodeURI(rel(zip))}" download>전체 다운로드</a>
<a class="btn sub" href="${encodeURI(rel(files[0]))}" download>한 장 이미지</a></header>
<main>${blocks.map((p, i) => `<div class="blk"><img src="${encodeURI(rel(p))}" alt="블록 ${i + 1}">
<div class="bar"><span>블록 ${i + 1}${check.sections[i] && check.sections[i].id ? ` · ${esc(check.sections[i].id)}` : ''}</span>
<span><a href="${encodeURI(rel(p))}" download>다운로드</a>${files2x[i + 1] ? ` · <a href="${encodeURI(rel(files2x[i + 1]))}" download>2배율</a>` : ''}</span></div></div>`).join('\n')}</main></html>`;
  fs.writeFileSync(path.join(dir, 'review.html'), review);

  console.log(`\n출력 폴더: ${dir}`);
  console.log(`- ${path.basename(files[0])}, block-01~${String(blocks.length).padStart(2, '0')}.png${files2x.length ? ', 2x/' : ''}`);
  console.log(`- review.html (확인·다운로드 페이지)`);
  console.log(`- ${path.basename(zip)}`);
})().catch((e) => { console.error(e.message); process.exit(1); });
