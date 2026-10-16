// 긴 상세페이지 이미지를 읽기 쉬운 조각으로 자르기 (블록 분석용)
// 사용법: node tools/slice.js <이미지 또는 폴더> [--out 출력폴더] [--width 610] [--ratio 2]
// - 가로를 --width(기본 610)로 맞춘 뒤, 가로 x ratio 높이씩 잘라 PNG로 저장한다.
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { launch, parseArgs, IMAGE_EXT } = require('./browser');

(async () => {
  const args = parseArgs(process.argv.slice(2));
  const target = args._[0];
  if (!target || !fs.existsSync(target)) {
    console.error(`파일이나 폴더를 찾을 수 없습니다: ${target || '(경로 없음)'}`);
    process.exit(1);
  }
  const files = fs.statSync(target).isDirectory()
    ? fs.readdirSync(target).filter((f) => IMAGE_EXT.includes(path.extname(f).toLowerCase())).sort().map((f) => path.join(target, f))
    : [target];
  const width = Number(args.width || 610);
  const ratio = Number(args.ratio || 2);
  const outDir = path.resolve(args.out || path.join(path.dirname(path.resolve(files[0])), '_slices'));
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await launch();
  const page = await browser.newPage();
  for (const file of files) {
    const base = path.parse(file).name;
    await page.goto(pathToFileURL(path.resolve(file)).href);
    const parts = await page.evaluate(async (width, ratio) => {
      const img = document.querySelector('img');
      await img.decode();
      const scale = width / img.naturalWidth;
      const fullH = Math.round(img.naturalHeight * scale);
      const sliceH = Math.round(width * ratio);
      const out = [];
      for (let y = 0; y < fullH; y += sliceH) {
        const h = Math.min(sliceH, fullH - y);
        const c = document.createElement('canvas');
        c.width = width; c.height = h;
        c.getContext('2d').drawImage(img, 0, y / scale, img.naturalWidth, h / scale, 0, 0, width, h);
        out.push(c.toDataURL('image/png').split(',')[1]);
      }
      return { out, fullH };
    }, width, ratio);
    parts.out.forEach((b64, i) => {
      fs.writeFileSync(path.join(outDir, `${base}_${String(i + 1).padStart(2, '0')}.png`), Buffer.from(b64, 'base64'));
    });
    console.log(`${file} → ${parts.out.length}조각 (가로 ${width}px 기준 전체 높이 ${parts.fullH}px)`);
  }
  await browser.close();
  console.log(`저장 위치: ${outDir}`);
})().catch((e) => { console.error(e.message); process.exit(1); });
