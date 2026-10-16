---
name: detail-page
description: 한국 이커머스 상세페이지(가로 610px) 기획·제작 스킬. 참고 상세페이지를 블록 단위로 분석해 저장하고(작업 A), 저장된 블록과 상품 사진으로 새 상세페이지 기획안 → HTML → PNG(전체·블록별)·확인 페이지·zip까지 만든다(작업 B). "상세페이지 만들어줘", "상세페이지 블록 분석해줘", "상세페이지 수정해줘", 스마트스토어·쿠팡 상세 이미지 제작 요청에 사용한다.
---

# 상세페이지 제작 스킬

이 스킬은 두 가지 작업을 한다.

- **작업 A. 블록 분석하기**: 참고 상세페이지를 블록 단위로 분석해 재사용 가능한 블록 md로 저장
- **작업 B. 상세페이지 만들기**: 저장된 블록을 조합해 새 상세페이지를 기획하고 HTML로 만든 뒤 이미지로 출력

## 시작할 때 꼭 읽을 파일

이 SKILL.md가 있는 폴더를 **스킬 폴더**라고 부른다. 작업을 시작하면 아래 두 파일을 먼저 읽고 그대로 따른다.

1. `<스킬 폴더>/rules.md` — 작업 A/B 전체 규칙 (질문 방식, 사실·가정·확인 필요 구분, 준법 필터, 기획안 형식, QA)
2. `<스킬 폴더>/settings.md` — 기본 설정 (가격·옵션 블록 제외, 추천 hero, 색 팔레트 통일 등). rules.md와 부딪히면 **settings.md가 우선**한다.

작업 B에서는 `<스킬 폴더>/blocks/_index.md`와 고른 블록 md 파일도 읽는다.

## 폴더 약속

| 위치 | 용도 |
|---|---|
| `<스킬 폴더>/blocks/` | 블록 라이브러리와 `_index.md`. 작업 A에서 새 블록을 여기에 저장하고, 작업 B는 여기 있는 블록만 쓴다 |
| `<스킬 폴더>/tools/` | 도구 스크립트 (Node + 설치된 Chrome/Edge) |
| `<작업 폴더>/references/<이름>/` | 작업 A의 참고 상세페이지 원본 이미지 |
| `<작업 폴더>/photos/` | 사용자가 경로를 따로 주지 않았을 때 쓰는 기본 사진 폴더 |
| `<작업 폴더>/output/<상품명>/` | 작업 B 결과물: `기획안.md`, `index.html`, PNG, `review.html`, zip |

`<작업 폴더>`는 사용자가 Claude Code를 실행한 현재 폴더다.

## 도구

명령은 작업 폴더에서 실행한다. 경로에 공백·한글이 있으면 따옴표로 감싼다. 처음 쓰기 전에 `<스킬 폴더>/tools/node_modules`가 없으면 `npm install --prefix "<스킬 폴더>/tools"`를 먼저 실행한다.

| 단계 | 명령 | 하는 일 |
|---|---|---|
| A-1 URL 수집 | `node "<스킬 폴더>/tools/grab-page.js" <URL> --out references/<이름>` | 페이지를 끝까지 스크롤해 상세 이미지를 순서대로 저장. 못 찾으면 전체 스크린샷 저장 |
| A-1 긴 이미지 | `node "<스킬 폴더>/tools/slice.js" <이미지 또는 폴더> --out references/<이름>/_slices` | 가로 610px 기준으로 잘라 한 조각씩 읽을 수 있게 함 |
| A-1 / B-2 미리보기 | `node "<스킬 폴더>/tools/contact-sheet.js" <폴더>` | 하위 폴더까지 이미지를 찾아 번호·파일명·크기 목록 출력, `<폴더>/_contact/contact_XX.png` 생성 |
| B-6 출력 | `node "<스킬 폴더>/tools/render.js" output/<상품명>/index.html --name <상품명> [--x2]` | 전체 PNG, 블록별 PNG, 2배율(선택), review.html, 전체 zip 생성 + 폭·이미지 점검 |

## 작업할 때 지킬 것

- 사진·참고 이미지는 contact-sheet로 목록을 본 뒤, **Read 도구로 한 장씩 직접 열어 보고** 분석한다. 미리보기만 보고 라벨·글자 같은 세부 내용을 판단하지 않는다.
- 긴 참고 이미지는 slice로 자른 조각을 순서대로 읽고 블록을 나눈다.
- 기획안은 `output/<상품명>/기획안.md`로 저장하고 채팅에도 보여준다. 사용자가 확인하기 전에는 HTML을 만들지 않는다.
- HTML은 `output/<상품명>/index.html` 한 파일로 만들고, 블록마다 `<section data-block="block_hero_01">`처럼 블록 파일명을 붙인다. `body { margin:0; width:610px }`.
- 사진은 원본을 옮기지 말고 HTML에서 상대 경로로 참조한다.
- 웹폰트는 Pretendard CDN(`https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css`)을 쓴다.
- render 후 경고가 있으면 고치고 다시 render한다. 그다음 B-7 QA로 블록 PNG를 Read로 하나씩 열어 확인한다.
- 이미 만든 상세페이지를 고쳐 달라는 요청이면, 먼저 `output/` 아래에서 해당 상품 폴더를 찾아(폴더명이 상품명과 조금 다를 수 있으니 부분 일치로도 찾는다) `index.html`과 `기획안.md`를 함께 고친 뒤 다시 render·QA한다.
