# Hackathon_

피로그래밍 25기 해커톤 2조 프로젝트입니다.

## 서비스명

**천천히 키오스크**

중장년층과 노년층이 심리적 부담 없이 키오스크 사용법을 익힐 수 있도록 돕는 키오스크 튜토리얼 웹 서비스입니다.

## 핵심 기능

- 홈 화면
- 단계별 키오스크 튜토리얼
- 기본 튜토리얼 3개
  - Step 1: 기본 주문
  - Step 2: 옵션 선택
  - Step 3: 실전 주문
- 심화 튜토리얼 2개
  - 쿠폰 사용
  - 포인트 적립
- 글씨 크기 조절
  - 보통
  - 크게
  - 왕크게
- 진도율 저장
- 이어서 학습하기
- 오답노트
- 오답 기록 localStorage 저장

## 기술 스택

- Django
- HTML
- CSS
- JavaScript
- localStorage

## 저장 방식

본 프로젝트는 별도의 로그인 없이 사용할 수 있도록 설계합니다.

학습 진도율과 오답노트 데이터는 서버 DB가 아닌 브라우저 `localStorage`에 저장합니다.

저장되는 데이터 예시는 다음과 같습니다.

```js
{
  progress: {
    "step1": 100,
    "step2": 50,
    "step3": 0
  },
  wrongNotes: [
    {
      id: "1720780000000-ab12cd",
      stepId: "step2",
      stepTitle: "2단계: 옵션 선택",
      reason: "온도 옵션을 다시 확인해 주세요.",
      details: [{ mistakeType: "temperature", label: "온도" }],
      status: "unresolved",
      retryUrl: "/tutorial/?step=step2&mode=practice&retry=1720780000000-ab12cd",
      date: "2026. 7. 12.",
      attemptCount: 1
    }
  ]
}
```

## 팀 역할 분담

### 공통 디자인 및 프로젝트 기반

- **신은아**
  - 전체 디자인 시스템 및 피그마 화면 설계
  - 색상·버튼·카드 스타일과 노인 친화 UI 기준 정리
  - 서비스 로고 제작
- **홍연우**
  - Django 프로젝트 기본 구조 세팅
  - 공통 템플릿과 URL 라우팅 구성
  - `static`·`templates` 디렉터리 구조 정리

### 👥 A조: 메인 페이지 및 진도율 시스템 (2명)

담당 범위: 홈/메인 템플릿, 글씨 크기 제어, `localStorage` 기반 진도율 연동

#### 홍연우 — 템플릿 및 UI/UX

- `base.html` 공통 레이아웃 구성
- 상단 네비게이션 바 구현
  - 홈
  - 오답노트
  - 연습 시작
- 메인 화면과 공통 CSS 구조 구현
- 전역 글씨 크기 조절 기능 구현
  - 보통
  - 크게
  - 왕크게
- 선택한 글씨 크기를 `localStorage`에 저장하고 페이지 이동 시 복원
- Django View 및 URL 라우팅
  - 홈 화면 렌더링
  - 튜토리얼 및 자율 연습 페이지 연결
- 오답노트 기본 레이아웃 및 목록 영역 스타일링

#### 이아린 — 뷰 로직 및 진도율 관리

- 기본 튜토리얼 3개 구현 및 진도율 스크립트 완성
  - Step 1: 기본 주문
  - Step 2: 옵션 선택
  - Step 3: 실전 주문
- 튜토리얼과 실습 완료 상태를 `localStorage`에 저장
- 홈 화면 진입 시 단계별 진도율 표시
- `이어서 학습하기` 버튼에 다음 학습 위치 반영

### 👥 B조: 키오스크 튜토리얼 및 오답노트 (2명)

담당 범위: 가상 키오스크 인터랙션, 오답 판별, `localStorage` 기반 오답노트 저장 및 출력

#### 신은아 — 시뮬레이터 UI 및 템플릿

- 상단 미션 가이드와 가상 키오스크 UI를 HTML/CSS 컴포넌트로 구현
  - 메뉴 및 카테고리 선택
  - 온도·크기·수량·매장/포장 옵션
  - 장바구니와 결제 화면
- 이아린과 협업하여 기본 튜토리얼 3개 및 진도율 연동
- 심화 튜토리얼 2개와 로고 제작
  - 쿠폰 사용
  - 포인트 적립

#### 서영은 — 시뮬레이터 로직 및 오답 데이터 처리

- 메뉴·옵션·결제 흐름의 미션 판별 JavaScript 구현
- 기본 및 심화 단계의 성공/실패 판정
- 튜토리얼 오답 행동 차단 및 안내 팝업 처리
- 오답 사유와 상세 항목을 JSON 객체로 구성
- 오답 기록을 `localStorage` 배열에 누적 저장
- 오답노트 데이터를 DOM으로 동적 렌더링
- 오답노트의 다시 연습 및 복습 완료 처리

## 프로젝트 폴더 구조

```txt
slow_kiosk/
├─ manage.py
├─ config/
│  ├─ settings.py
│  ├─ urls.py
│  └─ wsgi.py
│
├─ kiosk/
│  ├─ views.py
│  ├─ urls.py
│  └─ models.py
│
├─ templates/
│  ├─ base.html
│  ├─ home.html
│  ├─ tutorial.html
│  ├─ practice_free.html
│  └─ wrong_note.html
│
├─ static/
│  ├─ css/
│  │  ├─ reset.css
│  │  ├─ base.css
│  │  ├─ home.css
│  │  ├─ tutorial.css
│  │  ├─ practice_free.css
│  │  └─ wrong_note.css
│  │
│  └─ js/
│     ├─ missions.js
│     ├─ progress.js
│     ├─ storage.js
│     ├─ tutorial.js
│     ├─ advanced_tutorial.js
│     ├─ practice_free.js
│     ├─ font_size.js
│     └─ wrong_note.js
│
└─ db.sqlite3
```

## 주요 파일 역할

### templates

- `base.html`
  - 공통 레이아웃
  - 네비게이션 바
  - 공통 CSS/JS 연결

- `home.html`
  - 메인 화면
  - 단계별 카드
  - 진도율 표시
  - 이어서 학습하기 버튼

- `tutorial.html`
  - 기본 및 심화 튜토리얼 화면
  - 가상 키오스크와 완료 화면

- `practice_free.html`
  - 미션 제한 없이 반복할 수 있는 자율 연습 화면

- `wrong_note.html`
  - 오답노트 화면
  - localStorage에 저장된 오답 목록 출력

### static/css

- `base.css`
  - 공통 스타일
  - 색상
  - 버튼
  - 카드
  - 글씨 크기 클래스

- `home.css`
  - 홈 화면 전용 스타일

- `tutorial.css`
  - 튜토리얼 화면 전용 스타일

- `practice_free.css`
  - 자율 연습 키오스크 화면 전용 스타일

- `wrong_note.css`
  - 오답노트 화면 전용 스타일

### static/js

- `storage.js`
  - `localStorage` 공통 함수
  - 오답노트 저장/불러오기

- `missions.js`
  - 메뉴·옵션·단계별 미션 데이터
  - 기본 단계 랜덤 미션 생성

- `progress.js`
  - 단계별 진도율 저장 및 홈 화면 반영

- `tutorial.js`
  - 기본 튜토리얼·실습 화면 동작
  - 메뉴·옵션·결제 판정

- `advanced_tutorial.js`
  - 쿠폰 및 포인트 심화 단계 흐름
  - 심화 단계 성공·실패 판정과 오답 저장

- `practice_free.js`
  - 자율 연습 화면의 주문·결제 흐름

- `font_size.js`
  - 전역 글씨 크기 설정 저장 및 복원

- `wrong_note.js`
  - 오답노트 데이터 렌더링
  - 다시 연습 버튼 처리

## 브랜치 전략

```txt
main
develop
feature/home-layout
feature/progress
feature/tutorial-ui
feature/practice-logic
feature/wrong-note
```

### 브랜치별 역할

- `feature/home-layout`
  - 공통 레이아웃
  - 홈 화면
  - 글씨 크기 조절

- `feature/progress`
  - 진도율 저장
  - 이어서 학습하기

- `feature/tutorial-ui`
  - 튜토리얼/키오스크 화면 UI

- `feature/practice-logic`
  - 미션 판별
  - 성공/실패 로직
  - 오답 저장

- `feature/wrong-note`
  - 오답노트 화면
  - 오답 목록 출력

## 공통 데이터 규칙

### Step ID

```txt
step1
step2
step3
coupon
point
```

### localStorage key

```txt
slowkiosk.progress
slowKioskWrongNotes
slowKioskFontSize
practiceFreeKioskSize
```

### 오답 데이터 예시

```js
{
  id: "1720780000000-ab12cd",
  stepId: "step2",
  stepTitle: "2단계: 옵션 선택",
  reason: "온도 옵션을 다시 확인해 주세요.",
  details: [{ mistakeType: "temperature", label: "온도" }],
  status: "unresolved",
  retryUrl: "/tutorial/?step=step2&mode=practice&retry=1720780000000-ab12cd",
  date: "2026. 7. 12.",
  attemptCount: 1
}
```

## 개발 우선순위

1. Django 기본 구조 세팅
2. `base.html` 공통 레이아웃
3. 홈 화면
4. 키오스크 튜토리얼 UI
5. 진도율 저장
6. 오답 저장
7. 오답노트 화면 출력
8. 글씨 크기 조절
9. 최종 디자인 정리

## localStorage 초기화

개발·테스트 중 저장된 학습 기록을 초기화하려면 브라우저 개발자 도구(`F12`)의 콘솔에서 다음 명령을 실행합니다.

```js
localStorage.clear();
location.reload();
```

> `localStorage.clear()`는 현재 도메인에 저장된 모든 로컬 데이터를 삭제하므로 운영 환경에서는 주의해서 사용해야 합니다.
