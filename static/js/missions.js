//  Step별 미션 데이터 + 메뉴/카테고리 데이터.
//
//  judge 값이 곧 판정 규칙(실제 판정 JS는 영은님 담당):
//    "flow"   → 판정 없음. 정해진 클릭 흐름만 통과 (Step1)
//    "strict" → 옵션 조합이 target 과 정확히 일치해야 성공 (Step2)
//    "real"   → 실전. 옵션 조합 일치 + 시간 기록, 가이드/하이라이트 없음 (Step3)
//
//  ※ 온도(핫/아이스)는 메뉴 이름이 아니라 "옵션"에서 고른다.
//    메뉴는 기본 이름만(예: 아메리카노) 두고, 누르면 옵션 팝업에서 온도/크기/수량/포장 선택.

//  상단 카테고리 탭
const CATEGORIES = [
    { id: "reco", label: "추천메뉴" },
    { id: "coffee", label: "커피" },
    { id: "tea", label: "차·음료" },
    { id: "frappe", label: "스무디&프라페" },
];

//  메뉴 데이터 (온도 구분 없이 기본 이름만)
//  cats: 이 메뉴가 속한 탭들(복수 가능). icon 은 이미지 대체용 이모지.
const MENUS = [
    { id: "americano", name: "아메리카노", price: 3000, icon: "☕", cats: ["reco", "coffee"] },
    { id: "latte", name: "카페라떼", price: 4500, icon: "🥛", cats: ["reco", "coffee"] },
    { id: "mocha", name: "카페모카", price: 4000, icon: "☕", cats: ["reco", "coffee"] },
    { id: "hazelnut", name: "헤이즐넛라떼", price: 4500, icon: "☕", cats: ["reco", "coffee"] },
    { id: "condense", name: "연유라떼", price: 3700, icon: "🥛", cats: ["coffee"] },
    { id: "tiramisu", name: "티라미수라떼", price: 4300, icon: "🥤", cats: ["coffee"] },
    { id: "toffeenut", name: "토피넛라떼", price: 4500, icon: "🥤", cats: ["coffee"] },
    { id: "apple_yuja", name: "사과유자차", price: 3500, icon: "🍵", cats: ["reco", "tea"] },
    { id: "yuja", name: "유자차", price: 3000, icon: "🍵", cats: ["tea"] },
    { id: "grapefruit", name: "자몽차", price: 3500, icon: "🍹", cats: ["tea"] },
    { id: "peach", name: "복숭아차", price: 3000, icon: "🧋", cats: ["reco", "tea"] },
    // 스무디·프라페는 항상 차가운 메뉴 (iceOnly: 온도 선택 없이 아이스 고정)
    { id: "strawberry", name: "딸기스무디", price: 4500, icon: "🍓", cats: ["frappe"], iceOnly: true },
    { id: "mango", name: "망고프라페", price: 5000, icon: "🥭", cats: ["frappe"], iceOnly: true },
    { id: "choco", name: "초코프라페", price: 5000, icon: "🍫", cats: ["frappe"], iceOnly: true },
];

// 옵션(온도·크기·수량·포장) — 모든 Step 공용
const OPTION_SET = {
    temp: [{ id: "hot", label: "따뜻하게" }, { id: "ice", label: "차갑게" }],
    size: [{ id: "small", label: "보통" }, { id: "large", label: "크게" }],
    place: [{ id: "eatin", label: "매장" }, { id: "takeout", label: "포장" }],
};

const MISSIONS = {

    //  Step 1 : 기본 (클릭 흐름 익히기)
    step1: {
        title: "1단계: 따뜻한 아메리카노 담기",
        judge: "flow",
        timeLimit: 120,
        correctMenu: "americano",
        target: { temp: "hot", size: "small", qty: 1, place: "eatin" },
        options: OPTION_SET,
        guide: {
            menu: { text: "아메리카노를 눌러 주세요", highlight: "americano" },
            option: { text: "‘따뜻하게’를 고르고 담기를 눌러 주세요", highlight: null },
            cart: { text: "결제하기 버튼을 눌러 주세요", highlight: "btnPay" },
        },
    },

    //  Step 2 : 옵션 (조합 일치)
    step2: {
        title: "2단계: 아이스 아메리카노 · 크게 · 2잔 · 포장",
        judge: "strict",
        timeLimit: 120,
        correctMenu: "americano",
        target: { temp: "ice", size: "large", qty: 2, place: "takeout" },
        options: OPTION_SET,
        guide: {
            menu: { text: "아메리카노를 눌러 주세요", highlight: "americano" },
            option: { text: "차갑게 · 크게 · 2잔 · 포장을 골라 주세요", highlight: null },
        },
    },

    //  Step 3 : 실전 (미션 주어짐 · 가이드/하이라이트 없음)
    step3: {
        title: "3단계: 카페라떼 핫 3잔 주문하고 결제하기",
        judge: "real",
        timeLimit: 120,
        correctMenu: "latte",
        target: { temp: "hot", size: "large", qty: 3, place: "takeout" },
        options: OPTION_SET,
        guide: null,
    },

};
