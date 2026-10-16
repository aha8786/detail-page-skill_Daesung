# 상세페이지 제작 스킬 (detail-page)

Claude Code에서 한국 이커머스 상세페이지(가로 610px)를 **기획부터 이미지 출력까지** 만들어 주는 스킬입니다.
스마트스토어·쿠팡 등에 올릴 상세 이미지를 블록 단위로 만들고, 전체 한 장 이미지와 블록별 이미지, 확인용 페이지, zip까지 한 번에 뽑아 줍니다.

수산물·농산물 상세페이지를 만들면서 다듬은 블록과 규칙이 들어 있지만, 다른 상품에도 쓸 수 있습니다.

---

## 무엇을 하나요?

| 작업 | 이렇게 말하면 | 결과 |
|---|---|---|
| **A. 블록 분석** | "이 상세페이지 블록 분석해줘" + URL 또는 캡처 | 참고 페이지를 블록으로 나눠 구조만 `blocks/`에 md로 저장 (원본 문구·사진은 옮기지 않음) |
| **B. 상세페이지 만들기** | "갑오징어 상세페이지 만들어줘" + 상품 설명·사진 폴더 | 질문 → 기획안 → (확인 후) HTML → PNG 출력 → QA |
| **수정** | "바지락 1kg 60미 내외 빼고 당일 경매 기준으로 바꿔줘" | 해당 페이지를 찾아 고친 뒤 다시 출력 |

### 작업 B 진행 순서
1. 상품 정보 정리, 빠진 필수 정보 확인 (산지·중량·보관법 등은 지어내지 않고 `[확인 필요]`로 표시)
2. 사진 폴더를 한 장씩 보고 어느 블록에 어떤 사진을 쓸지 배치
3. 저장된 블록 중에서 구성 추천 → 확인
4. **기획안**(`output/<상품명>/기획안.md`)을 보여 주고 확인받기
5. HTML 제작 → PNG 출력 → 블록별 이미지 직접 확인(QA)
6. 결과 전달: 전체 이미지, 블록별 이미지, `review.html`(확인·다운로드 페이지), 전체 zip

질문에는 항상 A/B/C 선택지와 `(추천)`이 붙고, 직접 입력도 할 수 있습니다. "추천으로", "알아서 해줘"라고 하면 질문을 줄이고 추천값으로 진행합니다.

---

## 준비물

- [Claude Code](https://claude.com/claude-code)
- [Node.js](https://nodejs.org) 18 이상
- Chrome 또는 Edge (PNG 출력에 사용)
- **Windows** (zip 묶기와 브라우저 경로가 Windows 기준입니다)

## 설치

Claude Code의 개인 스킬 폴더(`~/.claude/skills/`)에 내려받고, 도구 패키지를 설치합니다.

```powershell
git clone https://github.com/aha8786/detail-page-skill.git "$env:USERPROFILE\.claude\skills\detail-page"
npm install --prefix "$env:USERPROFILE\.claude\skills\detail-page\tools"
```

설치 후 Claude Code를 다시 시작하면 어느 폴더에서든 `/detail-page`로 불러올 수 있습니다.
"상세페이지 만들어줘"처럼 말해도 자동으로 쓰입니다.

업데이트:
```powershell
git -C "$env:USERPROFILE\.claude\skills\detail-page" pull
```

## 사용법

### 1. 작업 폴더 만들기
상품 사진과 결과물이 쌓일 폴더를 하나 만들고 그 안에서 Claude Code를 실행합니다.

```
내작업폴더/
├─ photos/        ← 상품별 사진 폴더 (예: photos/갑오징어/)
├─ references/    ← 블록 분석용 참고 페이지 이미지 (자동 생성)
└─ output/        ← 결과물 (자동 생성)
   └─ 갑오징어/
      ├─ 기획안.md
      ├─ index.html
      ├─ 갑오징어_full.png
      ├─ block-01.png …
      ├─ review.html
      └─ 갑오징어_전체.zip
```

### 2. 말 거는 예시

```text
/detail-page 갑오징어 상세페이지 만들어줘.
국내산, 수협 당일 입찰, 당일 발송, 손질 안 한 통 갑오징어. 사진은 photos/갑오징어 폴더
```

```text
/detail-page 이 페이지 블록 분석해줘 https://...
```

```text
병어 상세페이지에서 미수는 당일 경매에 따라 다르다고 바꿔줘
```

### 3. 결과 확인
`output/<상품명>/review.html`을 브라우저로 열면 블록 이미지를 순서대로 보고, 블록별·전체 다운로드를 할 수 있습니다.

---

## 들어 있는 것

```
detail-page/
├─ SKILL.md      스킬 진입점 (Claude가 처음 읽는 파일)
├─ rules.md      작업 A/B 전체 규칙: 질문 방식, 준법 필터, 기획안 형식, QA
├─ settings.md   기본 설정 (rules.md보다 우선) — 내 상황에 맞게 고쳐 쓰세요
├─ blocks/       블록 라이브러리 (_index.md에 목록)
└─ tools/
   ├─ grab-page.js      URL에서 상세 이미지 수집
   ├─ slice.js          긴 이미지를 610px 기준으로 자르기
   ├─ contact-sheet.js  사진 폴더 미리보기 시트
   └─ render.js         HTML → 전체/블록별 PNG, review.html, zip
```

### 저장된 블록

| 블록 | 역할 | 설명 |
|---|---|---|
| block_hero_01 | hero | 말풍선 문구 + 2줄 대형 헤드라인 + 손에 든 클로즈업 사진 |
| block_hero_02 | hero | 산지 풍경 배경 + 하늘 여백 헤드라인 + 원형 혜택 배지 |
| block_hero_03 | hero | 꽉 찬 클로즈업 사진 + 2색 대형 상품명 + 설명 5줄 |
| block_point_01 | point | 2줄 헤드라인 + 생산 현장 사진 2장 |
| block_point_02 | point | "약속" 헤드라인 + 형광 키워드 번호 목록 5줄 |
| block_point_03 | point | CHECK POINT 번호 + 산지 현장 사진 3장 |
| block_detail_01 | detail | 2줄 헤드라인 + 강조 설명 4줄 + 구성품 사진 |
| block_usage_01 | usage | "맛있게 먹는 방법" + 플레이팅 사진 세로 나열 |
| block_info_01 | info | 보관방법 체크 칩 + 아이콘 카드 |
| block_info_02 | info | 제품 상세정보 목록 + 알레르기·교환 고지 |
| block_info_03 | info | 포장 방법 (빙장·냉장·냉동·활) |
| block_option_01·02 | option | 옵션·가격 안내 (기본 설정에서 사용 안 함) |
| block_faq_01·02 | faq | 꽃게 전용 Q&A |

작업 A로 참고 페이지를 분석하면 블록이 계속 늘어납니다.

### 기본 설정 (settings.md)
- 가격·옵션 블록은 넣지 않음
- hero는 `block_hero_03` 우선 추천
- 한 페이지의 색은 포인트색 하나에서 만든 4가지로 통일
- 사진 사용 권한은 묻지 않음
- 경매 수산물은 미수를 단정하지 않고 "당일 경매에 따라 달라질 수 있음"으로 표기

필요 없는 항목은 `settings.md`에서 지우거나 고치면 됩니다.

---

## 주의

- 산지·성분·인증·수치·리뷰·순위·가격·효능은 지어내지 않습니다. 모르는 정보는 `[확인 필요]`로 남깁니다.
- 식품은 질병 예방·치료 표현, 근거 없는 1위·최저가·만족도 수치를 자동으로 빼거나 완화합니다. 맛·식감 표현("입에서 살살 녹는")은 그대로 씁니다.
- 참고 페이지는 **구조만** 가져옵니다. 원본 문구·사진·브랜드는 블록에 옮기지 않습니다.
- 사진과 결과물(`photos/`, `output/`, `references/`)은 저장소에 올리지 않습니다 (`.gitignore`).

## 참고
- 규칙 일부는 [aisyncclub/detail_page_codex_skill](https://github.com/aisyncclub/detail_page_codex_skill)을 참고해 다듬었습니다. 자세한 내용은 `rules.md` 마지막 부분을 보세요.
