# 상세페이지 제작 스킬 (detail-page)

Claude Code에서 한국 이커머스 상세페이지(가로 610px)를 **기획부터 이미지 출력까지** 만들어 주는 스킬입니다.
스마트스토어·쿠팡 등에 올릴 상세 이미지를 블록 단위로 만들고, 전체 한 장 이미지와 블록별 이미지, 확인용 페이지, zip까지 한 번에 뽑아 줍니다.

수산물·농산물 상세페이지를 만들면서 다듬은 블록과 규칙이 들어 있지만, 다른 상품에도 쓸 수 있습니다.

**목차**
1. [무엇을 하나요?](#1-무엇을-하나요)
2. [설치하기 (처음 한 번)](#2-설치하기-처음-한-번)
3. [사용하기](#3-사용하기)
4. [업데이트·삭제](#4-업데이트삭제)
5. [문제가 생겼을 때](#5-문제가-생겼을-때)
6. [들어 있는 것](#6-들어-있는-것)
7. [주의](#7-주의)

---

## 1. 무엇을 하나요?

| 작업 | 이렇게 말하면 | 결과 |
|---|---|---|
| **A. 블록 분석** | "이 상세페이지 블록 분석해줘" + URL 또는 캡처 | 참고 페이지를 블록으로 나눠 구조만 `blocks/`에 저장 (원본 문구·사진은 옮기지 않음) |
| **B. 상세페이지 만들기** | "갑오징어 상세페이지 만들어줘" + 상품 설명·사진 폴더 | 질문 → 기획안 → (확인 후) HTML → PNG 출력 → 점검 |
| **수정** | "바지락 1kg 60미 내외 빼고 당일 경매 기준으로 바꿔줘" | 해당 페이지를 찾아 고친 뒤 다시 출력 |

---

## 2. 설치하기 (처음 한 번)

> **Windows PC 기준**입니다. 아래 순서대로 한 번만 하면 됩니다.

### 2-1. 필요한 프로그램 설치

| 프로그램 | 용도 | 설치 방법 |
|---|---|---|
| **Claude Code** | 스킬을 실행하는 AI 도구 | https://claude.com/claude-code 에서 설치 (Claude 유료 요금제 필요) |
| **Node.js** | 이미지 출력 도구 실행 | https://nodejs.org 에서 **LTS** 버전 내려받아 설치 (계속 "다음") |
| **Git** | 스킬 내려받기 | https://git-scm.com/download/win 에서 설치 (계속 "다음") |
| **Chrome 또는 Edge** | 상세페이지를 PNG로 찍기 | Windows에는 Edge가 기본으로 있어서 보통 따로 설치할 필요 없음 |

> 💡 `winget`을 쓸 수 있으면 PowerShell에서 한 번에 설치할 수 있습니다.
> ```powershell
> winget install OpenJS.NodeJS.LTS Git.Git
> ```

설치가 끝나면 **PowerShell 창을 새로 열어서** 아래 두 줄로 확인합니다. 버전 숫자가 나오면 성공입니다.

```powershell
node --version
git --version
```

### 2-2. 스킬 내려받기

PowerShell(윈도우 키 → `powershell` 입력 → **Windows PowerShell**)을 열고 아래 두 줄을 차례로 붙여 넣고 Enter를 누릅니다.

```powershell
git clone https://github.com/aha8786/detail-page-skill_Daesung.git "$env:USERPROFILE\.claude\skills\detail-page"
```

```powershell
npm install --prefix "$env:USERPROFILE\.claude\skills\detail-page\tools"
```

- 첫 줄: 스킬을 Claude Code 개인 스킬 폴더(`C:\Users\<내이름>\.claude\skills\detail-page`)에 내려받습니다.
- 둘째 줄: 이미지 출력 도구에 필요한 부품을 설치합니다. `added 84 packages` 같은 문구가 나오면 성공입니다.

### 2-3. 설치 확인

1. Claude Code가 켜져 있었다면 **껐다가 다시 켭니다.**
2. Claude Code 입력창에 `/`를 입력했을 때 목록에 **`/detail-page`**가 보이면 설치 완료입니다.

---

## 3. 사용하기

### 3-1. 작업 폴더 준비

상품 사진과 결과물이 쌓일 폴더를 하나 만듭니다. (예: 바탕화면에 `상세페이지작업` 폴더)
그 안에 `photos` 폴더를 만들고, 상품별로 사진을 넣어 둡니다.

```
상세페이지작업/
└─ photos/
   ├─ 갑오징어/   ← 갑오징어 사진들 (jpg, png, webp)
   └─ 바지락/
```

### 3-2. 작업 폴더에서 Claude Code 실행

- **데스크톱 앱**: 새 대화를 열 때 폴더로 `상세페이지작업`을 고릅니다.
- **터미널**: 그 폴더에서 `claude`를 실행합니다.
  ```powershell
  cd "$env:USERPROFILE\Desktop\상세페이지작업"
  claude
  ```

### 3-3. 상세페이지 만들기

입력창에 상품 정보와 사진 폴더를 적습니다. `/detail-page`를 앞에 붙이면 확실하게 스킬이 쓰이고, 그냥 "상세페이지 만들어줘"라고 해도 대부분 자동으로 쓰입니다.

```text
/detail-page 갑오징어 상세페이지 만들어줘.
국내산, 수협 당일 입찰, 당일 발송, 손질 안 한 통 갑오징어.
사진은 photos/갑오징어 폴더에 있어.
```

그다음은 이렇게 진행됩니다.

| 순서 | Claude가 하는 일 | 내가 할 일 |
|---|---|---|
| 1 | 사진을 한 장씩 보고 어느 블록에 쓸지 분석 | 기다리기 |
| 2 | 빠진 정보(산지·중량·보관법 등)를 A/B/C 선택지로 질문 | 고르거나 직접 입력. 귀찮으면 **"추천으로"** |
| 3 | 블록 구성 추천 | 확인 또는 순서 변경 |
| 4 | **기획안**(`output/상품명/기획안.md`)을 보여줌 | 문구·사진 확인 → "이대로 만들어줘" 또는 수정 요청 |
| 5 | HTML 제작 → PNG 출력 → 블록별 이미지 직접 점검 | 기다리기 |
| 6 | 결과 전달 | `review.html` 열어서 확인 |

> 산지·중량·성분·인증 같은 사실은 지어내지 않습니다. 모르는 정보는 `[확인 필요]`로 표시하니, 알려 주시면 채워 넣습니다.

### 3-4. 결과물 받기

`상세페이지작업/output/상품명/` 폴더에 생깁니다.

| 파일 | 용도 |
|---|---|
| `review.html` | **더블클릭해서 브라우저로 여세요.** 블록을 순서대로 보고, 블록별·전체 다운로드 가능 |
| `상품명_full.png` | 상세페이지 전체 한 장 이미지 |
| `block-01.png` … | 블록별 이미지 (쇼핑몰에 나눠 올릴 때) |
| `상품명_전체.zip` | 위 이미지 + HTML 묶음 |
| `기획안.md` | 확정된 기획안 |
| `index.html` | 원본 HTML (수정할 때 사용) |

### 3-5. 수정하기

같은 작업 폴더에서 바꿀 내용을 그대로 말하면 됩니다. 고친 뒤 이미지도 다시 뽑아 줍니다.

```text
병어 상세페이지에서 미수는 당일 경매에 따라 다르다고 바꿔줘
갑오징어 메인 사진 바꿔줘
홍가리비 포장 사진 채워줘, 없으면 사진 없이
```

### 3-6. 블록 늘리기 (작업 A)

마음에 드는 남의 상세페이지가 있으면 구조만 가져와 블록으로 저장할 수 있습니다.

```text
/detail-page 이 상세페이지 블록 분석해줘 https://smartstore.naver.com/...
```

URL이 막히면 상세페이지를 캡처해서 `references/이름/` 폴더에 넣고 "references/이름 분석해줘"라고 하면 됩니다.
새 블록은 스킬 폴더의 `blocks/`에 저장되어 다음 상세페이지부터 쓸 수 있습니다.

### 3-7. 내 스타일로 바꾸기

스킬 폴더의 `settings.md`(`C:\Users\<내이름>\.claude\skills\detail-page\settings.md`)를 메모장으로 열어 고치면 됩니다.
예: 가격 블록도 넣고 싶으면 "가격·옵션 블록 제외" 줄을 지웁니다.

---

## 4. 업데이트·삭제

**업데이트** (새 버전 받기)
```powershell
git -C "$env:USERPROFILE\.claude\skills\detail-page" pull
npm install --prefix "$env:USERPROFILE\.claude\skills\detail-page\tools"
```
> `settings.md`나 블록을 직접 고쳤다면 업데이트할 때 충돌이 날 수 있습니다. 고친 파일은 미리 다른 곳에 복사해 두세요.

**삭제**
```powershell
Remove-Item -Recurse -Force "$env:USERPROFILE\.claude\skills\detail-page"
```

---

## 5. 문제가 생겼을 때

| 증상 | 해결 |
|---|---|
| `/detail-page`가 목록에 없음 | Claude Code를 완전히 껐다 켜기. 폴더 위치가 `C:\Users\<내이름>\.claude\skills\detail-page\SKILL.md`인지 확인 |
| `'node'/'git'은(는) ... 인식되지 않습니다` | 설치 후 PowerShell 창을 **새로** 열기. 그래도 안 되면 PC 재시작 |
| `Cannot find module 'puppeteer-core'` | 2-2의 `npm install` 줄을 다시 실행 |
| `Chrome 또는 Edge를 찾지 못했습니다` | Chrome 설치 (https://www.google.com/chrome) |
| PNG에 사진이 빠짐 / `이미지 불러오기 실패` 경고 | 사진 파일 이름·폴더가 바뀌었는지 확인. HEIC(아이폰) 사진은 jpg로 바꿔서 넣기 |
| 글씨체가 기본 글꼴로 나옴 | 인터넷 연결 확인 (Pretendard 웹폰트를 온라인으로 불러옴) |
| `git clone` 할 때 `already exists` | 이미 설치되어 있음 → 4번 업데이트 방법 사용 |

---

## 6. 들어 있는 것

```
detail-page/
├─ SKILL.md      스킬 진입점 (Claude가 처음 읽는 파일)
├─ rules.md      작업 A/B 전체 규칙: 질문 방식, 준법 필터, 기획안 형식, 점검
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
| block_hero_01 | 첫 화면 | 말풍선 문구 + 2줄 대형 헤드라인 + 손에 든 클로즈업 사진 |
| block_hero_02 | 첫 화면 | 산지 풍경 배경 + 하늘 여백 헤드라인 + 원형 혜택 배지 |
| block_hero_03 | 첫 화면 | 꽉 찬 클로즈업 사진 + 2색 대형 상품명 + 설명 5줄 (기본 추천) |
| block_point_01 | 차별점 | 2줄 헤드라인 + 생산 현장 사진 2장 |
| block_point_02 | 차별점 | "약속" 헤드라인 + 형광 키워드 번호 목록 5줄 |
| block_point_03 | 차별점 | CHECK POINT 번호 + 산지 현장 사진 3장 |
| block_detail_01 | 실물 | 2줄 헤드라인 + 강조 설명 4줄 + 구성품 사진 |
| block_usage_01 | 먹는 법 | "맛있게 먹는 방법" + 플레이팅 사진 세로 나열 |
| block_info_01 | 안내 | 보관방법 체크 칩 + 아이콘 카드 |
| block_info_02 | 안내 | 제품 상세정보 목록 + 알레르기·교환 고지 |
| block_info_03 | 안내 | 포장 방법 (빙장·냉장·냉동·활) |
| block_option_01·02 | 옵션 | 옵션·가격 안내 (기본 설정에서 사용 안 함) |
| block_faq_01·02 | 질문 | 꽃게 전용 Q&A |

### 기본 설정 (settings.md)
- 가격·옵션 블록은 넣지 않음
- 첫 화면은 `block_hero_03` 우선 추천
- 한 페이지의 색은 포인트색 하나에서 만든 4가지로 통일
- 사진 사용 권한은 묻지 않음
- 경매 수산물은 미수를 단정하지 않고 "당일 경매에 따라 달라질 수 있음"으로 표기

---

## 7. 주의

- 산지·성분·인증·수치·리뷰·순위·가격·효능은 지어내지 않습니다. 모르는 정보는 `[확인 필요]`로 남깁니다.
- 식품은 질병 예방·치료 표현, 근거 없는 1위·최저가·만족도 수치를 빼거나 완화합니다. 맛·식감 표현("입에서 살살 녹는")은 그대로 씁니다.
- 참고 페이지는 **구조만** 가져옵니다. 원본 문구·사진·브랜드는 블록에 옮기지 않습니다.
- 결과물은 반드시 직접 확인한 뒤 쇼핑몰에 올리세요. 특히 원산지·중량·알레르기 표시는 판매자 책임입니다.
- 사진과 결과물(`photos/`, `output/`, `references/`)은 이 저장소에 올라가지 않습니다 (`.gitignore`).

규칙 일부는 aisyncclub/detail_page_codex_skill을 참고해 다듬었습니다. 자세한 내용은 `rules.md` 마지막 부분을 보세요.
