//  심화 단계(쿠폰 사용 / 포인트 적립) 전용 로직
//  tutorial.js / missions.js 는 그대로 두고, 이 파일에서 동작만 추가로 얹는다.
//
//  화면 흐름:
//   1) 메뉴 선택 → 옵션 → 담기 → 결제하기            (기존 kiosk 화면 그대로 재사용)
//   2) 결제하기를 누르면 쿠폰/포인트 사용 여부부터 묻는다
//      - 쿠폰: 사용하기 → (키오스크 화면 바깥) 바코드 찍기 → 결제하시겠습니까?
//              사용 안 하기 → 결제하시겠습니까?
//      - 포인트: 적립하기 → 화면 키패드로 전화번호 입력 → 결제하시겠습니까?
//                적립 안 하기 → 결제하시겠습니까?
//   3) "예"를 누르면 기존 결제수단 팝업(payModal)으로 이어져 결제를 완료한다
//
//  tutorial → practice 2단계 구조 (심화 단계에만 적용):
//   - phase "tutorial": 안내 문구 + 하이라이트 + 화면 딤(스포트라이트) 처리
//   - phase "practice": 안내 없이 같은 흐름을 한 번 더 수행해야 완료
//   - 건너뛰기: tutorial → practice로 즉시 전환. practice에서는 건너뛰기 버튼이 사라짐

const ADV_STEPS = ["coupon", "point"];
function isAdvStep() { return ADV_STEPS.includes(state.stepId); }

//  ---- 오답노트 연동 훅 — 지금은 로그만 남기고, 추후 오답노트 기능이 여기서 실제 기록을 붙이면 됨 ----
function recordAdvancedAction(action, detail) {
    console.log("[심화-확정행동]", state.stepId, state.phase, action, detail || "");
}

//  ---- DOM ----
const btnSkip = document.getElementById("btnSkip");
const tutorialDim = document.getElementById("tutorialDim");

const couponAskModal = document.getElementById("couponAskModal");
const couponAskGuide = document.getElementById("couponAskGuide");
const couponYesBtn = document.getElementById("couponYesBtn");
const couponNoBtn = document.getElementById("couponNoBtn");

const barcodePanel = document.getElementById("barcodePanel");
const barcodeGuide = document.getElementById("barcodeGuide");
const barcodeBtn = document.getElementById("barcodeBtn");

const pointAskModal = document.getElementById("pointAskModal");
const pointAskGuide = document.getElementById("pointAskGuide");
const pointYesBtn = document.getElementById("pointYesBtn");
const pointNoBtn = document.getElementById("pointNoBtn");

const keypadModal = document.getElementById("keypadModal");
const keypadGuide = document.getElementById("keypadGuide");
const keypadDisplay = document.getElementById("keypadDisplay");
const keypadConfirm = document.getElementById("keypadConfirm");

const payConfirmModal = document.getElementById("payConfirmModal");
const payConfirmGuide = document.getElementById("payConfirmGuide");
const payConfirmYes = document.getElementById("payConfirmYes");
const payConfirmNo = document.getElementById("payConfirmNo");

const resultModal = document.getElementById("resultModal");
const resultEmoji = document.getElementById("resultEmoji");
const resultTitle = document.getElementById("resultTitle");
const resultChecklist = document.getElementById("resultChecklist");
const resultBtn = document.getElementById("resultBtn");


//  ---- 화면 동기화 — tutorial.js 의 render() 끝에서 훅으로 호출됨 ----
function renderAdvancedUI() {
    // 이전 렌더에서 남은 스포트라이트(hl-pop) 정리 후 현재 강조 요소로 다시 계산
    document.querySelectorAll(".hl-pop").forEach(el => el.classList.remove("hl-pop"));

    if (!isAdvStep()) {
        // 1·2단계는 tutorial→practice 2단계로 진행, 3단계(가이드 없음)는 tutorial 고정
        const hasGuide = !!MISSIONS[state.stepId].guide;
        wrap.dataset.mode = hasGuide ? state.phase : "tutorial";
        // 스포트라이트는 튜토리얼 단계에서만 (실습에선 딤/하이라이트 없음)
        const spotlight = hasGuide && state.phase === "tutorial";
        tutorialDim.hidden = !spotlight;
        if (spotlight) {
            document.querySelectorAll(".menu-item.hl, #btnPay.hl").forEach(el => el.classList.add("hl-pop"));
        }
        btnSkip.hidden = state.phase === "practice";
        return;
    }

    wrap.dataset.mode = state.phase;
    tutorialDim.hidden = state.phase !== "tutorial";
    btnSkip.hidden = state.phase === "practice";

    // 메뉴/결제 버튼은 모달이 아닌 일반 화면 위에 있어 딤 오버레이에 가려지므로 별도로 끌어올림
    document.querySelectorAll(".menu-item.hl, #btnPay.hl").forEach(el => el.classList.add("hl-pop"));
}

//  ---- 쿠폰 사용 여부 ----
function openCouponAsk() {
    state.advStage = "couponAsk";
    const g = guideFor("couponAsk");
    couponAskGuide.innerHTML = guideHTML(g);
    couponYesBtn.classList.toggle("hl", !!(g && g.highlight === "couponYesBtn"));
    couponAskModal.hidden = false;
}
couponYesBtn.onclick = () => {
    recordAdvancedAction("coupon-ask", "사용하기");
    couponAskModal.hidden = true;
    openBarcodePanel();
};
couponNoBtn.onclick = () => {
    recordAdvancedAction("coupon-ask", "사용 안 하기");
    state.appliedCoupon = false;
    couponAskModal.hidden = true;
    openPayConfirm();
};
document.getElementById("couponAskClose").onclick = closeModals;
couponAskModal.onclick = (e) => { if (e.target === couponAskModal) closeModals(); };

//  ---- 바코드 찍기 (키오스크 화면 바깥 장치) ----
function openBarcodePanel() {
    state.advStage = "barcode";
    const g = guideFor("barcode");
    barcodeGuide.innerHTML = guideHTML(g);
    barcodeBtn.classList.toggle("hl-pop", !!g);
    barcodePanel.hidden = false;
}
barcodeBtn.onclick = () => {
    recordAdvancedAction("barcode-scan", "완료");
    state.appliedCoupon = true;
    barcodePanel.hidden = true;
    openPayConfirm();
};
document.getElementById("barcodeClose").onclick = closeModals;

//  ---- 포인트 적립 여부 ----
function openPointAsk() {
    state.advStage = "pointAsk";
    const g = guideFor("pointAsk");
    pointAskGuide.innerHTML = guideHTML(g);
    pointYesBtn.classList.toggle("hl", !!(g && g.highlight === "pointYesBtn"));
    pointAskModal.hidden = false;
}
pointYesBtn.onclick = () => {
    recordAdvancedAction("point-ask", "적립하기");
    pointAskModal.hidden = true;
    openKeypad();
};
pointNoBtn.onclick = () => {
    recordAdvancedAction("point-ask", "적립 안 하기");
    state.pointPhone = false;
    pointAskModal.hidden = true;
    openPayConfirm();
};
document.getElementById("pointAskClose").onclick = closeModals;
pointAskModal.onclick = (e) => { if (e.target === pointAskModal) closeModals(); };

//  ---- 화면 키패드로 전화번호 입력 ----
let keypadDigits = "";
function openKeypad() {
    state.advStage = "keypad";
    keypadDigits = "";
    updateKeypadDisplay();
    const g = guideFor("keypad");
    keypadGuide.innerHTML = guideHTML(g);
    keypadConfirm.classList.toggle("hl", !!(g && g.highlight === "keypadConfirm"));
    keypadModal.hidden = false;
}
function updateKeypadDisplay() {
    keypadDisplay.textContent = keypadDigits || "010-0000-0000";
}
keypadModal.querySelectorAll(".keypad-num").forEach(el => {
    el.onclick = () => {
        if (keypadDigits.length >= 11) return;
        keypadDigits += el.dataset.num;
        updateKeypadDisplay();
    };
});
document.getElementById("keypadBackspace").onclick = () => {
    keypadDigits = keypadDigits.slice(0, -1);
    updateKeypadDisplay();
};
document.getElementById("keypadClear").onclick = () => {
    keypadDigits = "";
    updateKeypadDisplay();
};
keypadConfirm.onclick = () => {
    if (keypadDigits.length < 10) { flash("전화번호를 정확히 입력해 주세요"); return; }
    recordAdvancedAction("point-keypad", keypadDigits);
    state.pointPhone = keypadDigits;
    keypadModal.hidden = true;
    openPayConfirm();
};
document.getElementById("keypadClose").onclick = closeModals;
keypadModal.onclick = (e) => { if (e.target === keypadModal) closeModals(); };

//  ---- 결제하시겠습니까? (쿠폰/포인트 공용) ----
function openPayConfirm() {
    state.advStage = "payConfirm";
    const g = guideFor("payConfirm");
    payConfirmGuide.innerHTML = guideHTML(g);
    payConfirmYes.classList.toggle("hl", !!(g && g.highlight === "payConfirmYes"));
    payConfirmModal.hidden = false;
}
payConfirmYes.onclick = () => {
    recordAdvancedAction("pay-confirm", "예");
    payConfirmModal.hidden = true;
    payModal.hidden = false;
};
payConfirmNo.onclick = () => {
    recordAdvancedAction("pay-confirm", "아니요");
    payConfirmModal.hidden = true;
    state.advStage = "shopping";
};
document.getElementById("payConfirmClose").onclick = closeModals;
payConfirmModal.onclick = (e) => { if (e.target === payConfirmModal) closeModals(); };

//  ---- 결제 완료(확정 행동) 기준 판정 — practice 단계에서만 사용 ----
//  guide 문구가 없는 practice 에서는 사용자가 직접 담고/쿠폰·포인트 처리하고/결제한 결과를
//  미션의 target 과 비교해 잘했는지 판단한다
function optLabel(group, id) {
    const found = OPTION_SET[group].find(o => o.id === id);
    return found ? found.label : id;
}
function judgeAdvanced() {
    const m = MISSIONS[state.stepId];
    const t = m.target;
    const item = state.cart.find(c => c.menuId === m.correctMenu);

    const checks = [
        { label: `${MENU_BY_ID[m.correctMenu].name} 담기`, ok: !!item },
        { label: `수량 ${t.qty}개`, ok: !!item && item.qty === t.qty },
    ];
    if (t.useCoupon) checks.push({ label: "쿠폰 사용하기", ok: state.appliedCoupon === true });
    if (t.usePoint) checks.push({ label: "포인트 적립하기", ok: !!state.pointPhone });
    checks.push({ label: "결제 완료하기", ok: true });

    return { pass: checks.every(c => c.ok), checks };
}

//  ---- 결과 창 ----
let lastResultPass = false;
function openResult(pass, checks) {
    lastResultPass = pass;
    state.advStage = "result";
    resultEmoji.textContent = pass ? "🎉" : "😅";
    resultTitle.textContent = pass ? "완벽해요!" : "다시 확인해 볼까요?";
    resultChecklist.innerHTML = checks.map(c =>
        `<li class="${c.ok ? "ok" : "bad"}">${c.ok ? "✅" : "❌"} ${c.label}</li>`
    ).join("");
    resultBtn.textContent = pass ? "다음으로" : "다시 도전하기";
    resultModal.hidden = false;
}
function closeResult() {
    resultModal.hidden = true;
    if (lastResultPass) {
        flash("심화 단계를 완료했어요!");
        setTimeout(() => { window.location.href = "/"; }, 1300);
        return;
    }
    resetAdvancedRun();
    render();
}
resultBtn.onclick = closeResult;
document.getElementById("resultClose").onclick = closeResult;

//  ---- 심화 팝업 전체 닫기 — tutorial.js 의 closeModals() 에서 훅으로 호출됨 ----
function closeAdvancedModals() {
    couponAskModal.hidden = true;
    barcodePanel.hidden = true;
    pointAskModal.hidden = true;
    keypadModal.hidden = true;
    payConfirmModal.hidden = true;
    resultModal.hidden = true;
}

//  ---- tutorial ⇄ practice 전환 ----
function resetAdvancedRun() {
    state.cart = [];
    state.appliedCoupon = null;
    state.pointPhone = null;
    state.advStage = "shopping";
    closeAdvancedModals();
    optionModal.hidden = true;
    payModal.hidden = true;
    startTimer(MISSIONS[state.stepId].timeLimit || 120);
}

//  건너뛰기: tutorial 단계에서만 동작 — practice에서는 버튼이 숨겨져 있어 호출되지 않음
function advancedSkip() {
    if (state.phase !== "tutorial") return;
    recordAdvancedAction("skip", "tutorial->practice");
    state.phase = "practice";
    resetAdvancedRun();
    flash("이제 안내 없이 직접 연습해 보세요");
    render();
}

//  실제 결제(onPay)까지 완료했을 때 호출됨 — tutorial.js의 passStep()에서 훅으로 실행
function advancedPassStep() {
    if (state.phase === "tutorial") {
        recordAdvancedAction("complete-tutorial", "tutorial->practice");
        state.phase = "practice";
        resetAdvancedRun();
        flash("잘하셨어요! 이번엔 안내 없이 직접 해볼까요?");
        render();
        return;
    }
    // practice(안내 없음) 단계: 결제하기(확정 행동) 시점의 실제 상태를 미션 target 과 비교해 판정
    const { pass, checks } = judgeAdvanced();
    recordAdvancedAction(pass ? "complete-practice" : "fail-practice", checks);
    openResult(pass, checks);
}

//  초기 동기화 (이 스크립트는 tutorial.js 의 최초 startStep() 이후에 로드됨)
renderAdvancedUI();
