// 참고 상세페이지 URL에서 상세 이미지 수집 (블록 분석 A-1용)
// 사용법: node tools/grab-page.js <URL> --out references/<이름> [--min 400]
// - 페이지를 끝까지 스크롤해 지연 로딩 이미지를 띄운 뒤, 가로 --min px 이상 이미지를 순서대로 저장한다.
// - 이미지를 못 찾으면 페이지 전체 스크린샷(page_full.png)을 대신 저장한다.
const fs = require('fs');
const path = require('path');
const { launch, parseArgs } = require('./browser');

(async () => {
  const args = parseArgs(process.argv.slice(2));
  const url = args._[0];
  if (!url || !args.out) {
    console.error('사용법: node tools/grab-page.js <URL> --out references/<이름>');
    process.exit(1);
  }
  const outDir = path.resolve(args.out);
  const min = Number(args.min || 400);
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await launch();
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36');
  await page.setViewport({ width: 1280, height: 900 });
  const res = await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  console.log(`응답 상태: ${res ? res.status() : '없음'} / 제목: ${await page.title()}`);

  await page.evaluate(async () => {
    for (let i = 0; i < 200; i++) {
      window.scrollBy(0, 800);
      await new Promise((r) => setTimeout(r, 150));
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 5) break;
    }
  });
  await new Promise((r) => setTimeout(r, 1500));

  const srcs = await page.evaluate((min) => {
    const seen = new Set();
    return [...document.images]
      .filter((im) => im.naturalWidth >= min)
      .map((im) => im.currentSrc || im.src)
      .filter((s) => s && !s.startsWith('data:') && !seen.has(s) && seen.add(s));
  }, min);

  let saved = 0;
  for (const src of srcs) {
    try {
      const buf = await page.evaluate(async (s) => {
        const r = await fetch(s);
        if (!r.ok) throw new Error(r.status);
        return Array.from(new Uint8Array(await r.arrayBuffer()));
      }, src);
      const ext = (path.extname(new URL(src).pathname).toLowerCase().match(/\.(jpe?g|png|webp|gif)$/) || ['.jpg'])[0];
      saved++;
      fs.writeFileSync(path.join(outDir, `${String(saved).padStart(2, '0')}${ext}`), Buffer.from(buf));
    } catch (e) {
      console.log(`[실패] ${src} (${e.message})`);
    }
  }

  if (!saved) {
    await page.setViewport({ width: 610, height: 900 });
    await page.screenshot({ path: path.join(outDir, 'page_full.png'), fullPage: true });
    console.log('상세 이미지를 찾지 못해 페이지 전체 스크린샷을 저장했습니다. 차단됐을 수 있으니 결과를 확인하세요.');
  }
  await browser.close();
  console.log(`이미지 ${saved}장 저장: ${outDir}`);
})().catch((e) => { console.error(e.message); process.exit(1); });
