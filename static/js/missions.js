//  Step별 미션 데이터 + 메뉴/카테고리 데이터.
//
//  judge 값이 곧 판정 규칙(실제 판정 JS는 영은님 담당):
//    "flow"   → 판정 없음. 정해진 클릭 흐름만 통과 (Step1)
//    "strict" → 옵션 조합이 target 과 정확히 일치해야 성공 (Step2)
//    "real"   → 실전. 옵션 조합 일치 + 시간 기록, 가이드/하이라이트 없음 (Step3)

//  상단 카테고리 탭 
const CATEGORIES = [
    { id: "reco", label: "추천메뉴" },
    { id: "hot", label: "커피(HOT)" },
    { id: "ice", label: "커피(ICE)" },
    { id: "frappe", label: "스무디&프라페" },
];

//  메뉴 데이터 
//  cats: 이 메뉴가 속한 탭들(복수 가능). icon 은 이미지 대체용 이모지.
const MENUS = [
    { id: "ice_americano", name: "(ICE)아메리카노", price: 2000, icon: "🧊", cats: ["reco", "ice"] },
    { id: "hot_latte", name: "(HOT)카페라떼", price: 4500, icon: "🥛", cats: ["reco", "hot"] },
    { id: "ice_latte", name: "(ICE)카페라떼", price: 4500, icon: "🥛", cats: ["reco", "ice"] },
    { id: "hot_mocha", name: "(HOT)카페모카", price: 4000, icon: "☕", cats: ["reco", "hot"] },
    { id: "cookie_cake", name: "떠먹는 커피쿠키케이크", price: 5500, icon: "🍰", cats: ["reco"] },
    { id: "hot_americano", name: "(HOT)아메리카노", price: 1800, icon: "☕", cats: ["reco", "hot"] },
    { id: "ice_tiramisu", name: "(ICE)티라미수라떼", price: 3600, icon: "🥤", cats: ["reco", "ice"] },
    { id: "ice_condense", name: "(ICE)연유라떼", price: 3700, icon: "🥛", cats: ["reco", "ice"] },
    { id: "hot_apple", name: "(HOT)사과유자차", price: 3500, icon: "🍵", cats: ["reco", "hot"] },
    { id: "hot_hazelnut", name: "(HOT)헤이즐넛라떼", price: 3500, icon: "☕", cats: ["reco", "hot"] },
    { id: "hot_yuja", name: "(HOT)유자차", price: 3000, icon: "🍵", cats: ["reco", "hot"] },
    { id: "peach_tea", name: "복숭아 아이스티", price: 3000, icon: "🧋", cats: ["reco", "ice"] },
    { id: "grapefruit", name: "자몽차", price: 3500, icon: "🍹", cats: ["reco", "hot"] },
    { id: "ice_toffeenut", name: "(ICE)토피넛라떼", price: 3900, icon: "🥤", cats: ["reco", "ice"] },
    { id: "strawberry_smoothie", name: "딸기스무디", price: 4500, icon: "🍓", cats: ["frappe"] },
    { id: "mango_frappe", name: "망고프라페", price: 5000, icon: "🥭", cats: ["frappe"] },
    { id: "choco_frappe", name: "초코프라페", price: 5000, icon: "🍫", cats: ["frappe"] },
];

// 옵션(온도·크기·수량·포장) — Step2/Step3 공용
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
        correctMenu: "hot_americano",   // flow 판정: 이 메뉴만 정답
        guide: {                        // tutorial 모드에서 화면별로 띄울 안내
            menu: { text: "따뜻한 아메리카노를 눌러 주세요", highlight: "hot_americano" },
            cart: { text: "결제하기 버튼을 눌러 주세요", highlight: "btnPay" },
        },
    },

    //  Step 2 : 옵션 (조합 일치) 
    step2: {
        title: "2단계: 아이스 아메리카노 · 크게 · 2잔 · 포장",
        judge: "strict",
        timeLimit: 120,
        correctMenu: "ice_americano",
        target: { temp: "ice", size: "large", qty: 2, place: "takeout" },
        options: OPTION_SET,
        guide: {
            menu: { text: "아이스 아메리카노를 눌러 주세요", highlight: "ice_americano" },
            option: { text: "차갑게 · 크게 · 2잔 · 포장을 골라 주세요", highlight: null },
        },
    },

    //  Step 3 : 실전 (미션 주어짐 · 가이드/하이라이트 없음) 
    step3: {
        title: "3단계: 카페라떼 핫 3잔 주문하고 결제하기",
        judge: "real",
        timeLimit: 120,
        correctMenu: "hot_latte",
        target: { temp: "hot", size: "large", qty: 3, place: "takeout" },
        options: OPTION_SET,
        guide: null,                    // 실전이라 안내/하이라이트 없음
    },

};
