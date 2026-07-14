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
    "step-1": true,
    "step-2": false,
    "step-3": false,
    "coupon": false,
    "point": false
  },
  wrongNotes: [
    {
      stepId: "step-2",
      title: "아이스/핫 선택을 놓쳤어요",
      description: "옵션 선택 단계에서 온도를 선택하지 않았어요.",
      retryUrl: "/practice/step-2/",
      date: "2026-07-12"
    }
  ],
  lastStep: "step-2"
}
```

## 팀 역할 분담

### 디자인 시스템 / 피그마

담당자: 신은아

- 전체 디자인 시스템 정리
- 피그마 화면 설계
- 색상, 버튼, 카드 스타일 기준 정리
- 노인친화 UI 기준 정리

### 코드 기본 뼈대

담당자: 홍연우

- Django 프로젝트 기본 구조 세팅
- 공통 템플릿 구조 설계
- URL 라우팅 기본 연결
- static/templates 구조 정리

## A조: 메인 페이지 및 진도율 시스템

담당 범위:

- 홈/메인 템플릿 개발
- 글씨 크기 제어
- localStorage 기반 진도율 연동

### 개발자 1: 홍연우

담당: 템플릿 및 UI/UX

- `base.html` 공통 레이아웃 구성
- 상단 네비게이션 바 구현
  - 홈
  - 오답노트
  - 연습 시작
- 푸터 공통화
- 메인 화면 구현
- 공통 CSS 구조 작성
- 전역 글씨 크기 조절 스크립트 구현
  - 보통
  - 크게
  - 왕크게
- 선택된 글씨 크기를 `localStorage`에 저장
- 페이지 이동 시 저장된 글씨 크기 CSS 클래스 자동 적용
- Django View & URL 라우팅
  - 홈 화면 렌더링
  - 단계별 소개/튜토리얼 페이지 연결

### 개발자 2

담당: 진도율 관리

- localStorage 기반 진도율 저장
- 기본 튜토리얼 3개 진도 관리
  - Step 1
  - Step 2
  - Step 3
- 사용자가 단계를 완료하면 완료 상태 저장
- 홈 화면 진입 시 저장된 진도율 불러오기
- `이어서 학습하기` 버튼에 마지막 학습 위치 반영

## B조: 키오스크 튜토리얼 및 오답노트

담당 범위:

- 가상 키오스크 인터랙션 화면
- 오답 판별
- localStorage 기반 오답노트 저장 및 출력

### 개발자 3

담당: 시뮬레이터 UI 및 템플릿

- 키오스크 튜토리얼 화면 5개 구현
  - Step 1: 기본 주문
  - Step 2: 옵션 선택
  - Step 3: 실전 주문
  - 쿠폰 사용
  - 포인트 적립
- 상단 미션 가이드 UI 구현
- 가상 키오스크 화면 구현
  - 메뉴 선택 버튼
  - 옵션 선택 버튼
  - 담기 버튼
  - 결제 창
- HTML/CSS 기반 키오스크 UI 컴포넌트화

### 개발자 4: 서영은

담당: 시뮬레이터 로직 및 오답 데이터 처리

- 미션 판별 JavaScript 구현
- 사용자가 올바른 메뉴를 눌렀는지 판별
- 필수 옵션을 선택했는지 판별
- 제한 시간 초과 여부 판별
- 틀린 경우 오답 데이터 저장
- 오답 데이터를 JSON 객체로 생성
- localStorage에 오답 배열 형태로 누적 저장
- 오답노트 페이지 로드 시 localStorage 데이터 읽기
- DOM 조작으로 오답 카드 동적 렌더링
- 오답노트의 다시 연습 버튼 클릭 시 해당 단계 처음으로 이동

### 신은아

담당: 오답노트 화면 및 심화 튜토리얼 보조

- 오답노트 화면 템플릿 구현
- 오답 데이터가 들어올 리스트 영역 스타일링
- 성공/실패 배지 UI 스타일링
- 심화 튜토리얼 2개 화면 구성 보조
  - 쿠폰 사용
  - 포인트 적립

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
│  ├─ practice.html
│  └─ wrong_note.html
│
├─ static/
│  ├─ css/
│  │  ├─ base.css
│  │  ├─ home.css
│  │  ├─ tutorial.css
│  │  ├─ practice.css
│  │  └─ wrong_note.css
│  │
│  └─ js/
│     ├─ storage.js
│     ├─ tutorial.js
│     ├─ practice.js
│     └─ wrong_note.js
│
└─ db.sqlite3
```

## 주요 파일 역할

### templates

- `base.html`
  - 공통 레이아웃
  - 네비게이션 바
  - 푸터
  - 공통 CSS/JS 연결

- `home.html`
  - 메인 화면
  - 단계별 카드
  - 진도율 표시
  - 이어서 학습하기 버튼

- `tutorial.html`
  - 튜토리얼 안내 화면
  - 단계별 설명

- `practice.html`
  - 실제 키오스크 연습 화면
  - Step 1~3 및 심화 단계 화면

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

- `practice.css`
  - 키오스크 시뮬레이터 화면 전용 스타일

- `wrong_note.css`
  - 오답노트 화면 전용 스타일

### static/js

- `storage.js`
  - localStorage 공통 함수
  - 진도율 저장/불러오기
  - 오답노트 저장/불러오기

- `tutorial.js`
  - 튜토리얼 화면 동작

- `practice.js`
  - 키오스크 미션 판별
  - 성공/실패 처리
  - 오답 저장 호출

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
step-1
step-2
step-3
coupon
point
```

### localStorage key

```txt
slowKioskProgress
slowKioskWrongNotes
slowKioskFontSize
```

### 오답 데이터 예시

```js
{
  id: 1720780000000,
  stepId: "step-2",
  stepTitle: "옵션 선택",
  reason: "아이스/핫 선택을 놓쳤어요",
  retryUrl: "/practice/step-2/",
  date: "2026-07-12"
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
개발자 도구 콘솔[F12]에서 아래를 실행
localStorage.clear();
location.reload();
