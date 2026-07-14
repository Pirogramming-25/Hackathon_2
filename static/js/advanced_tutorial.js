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
        btnSkip.hidden = !hasGuide || state.phase === "practice";
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
    const expectedMenu = MENU_BY_ID[m.correctMenu];
    const item = state.cart.length === 1 ? state.cart[0] : null;
    const isCorrectMenu = !!item && item.menuId === m.correctMenu;
    const selectedOptions = isCorrectMenu ? (item.options || {}) : {};
    const checks = [];

    checks.push({
        label: `${expectedMenu.name}만 담기`,
        ok: state.cart.length === 1 && isCorrectMenu,
        mistakeType: "menu",
        errorLabel: "메뉴",
        reason: state.cart.length > 1
            ? `장바구니에는 ‘${expectedMenu.name}’ 메뉴만 담아 주세요.`
            : `‘${expectedMenu.name}’ 메뉴를 담아 주세요.`
    });

    const optionChecks = [
        {
            key: "temp",
            label: "온도",
            mistakeType: "temperature",
            expectedLabel: optLabel("temp", t.temp)
        },
        {
            key: "size",
            label: "크기",
            mistakeType: "size",
            expectedLabel: optLabel("size", t.size)
        },
        {
            key: "place",
            label: "매장·포장",
            mistakeType: "orderType",
            expectedLabel: optLabel("place", t.place)
        }
    ];

    optionChecks.forEach(option => {
        if (t[option.key] === undefined) return;

        const selectedValue = selectedOptions[option.key];
        const selectedLabel = selectedValue
            ? optLabel(option.key, selectedValue)
            : "선택하지 않음";

        checks.push({
            label: `${option.label} ${option.expectedLabel}`,
            ok: isCorrectMenu && selectedValue === t[option.key],
            mistakeType: option.mistakeType,
            errorLabel: option.label,
            reason: `${option.label}에서 ‘${selectedLabel}’을 선택했어요. 미션 조건은 ‘${option.expectedLabel}’입니다.`
        });
    });

    checks.push({
        label: `수량 ${t.qty}개`,
        ok: isCorrectMenu && Number(item.qty) === Number(t.qty),
        mistakeType: "quantity",
        errorLabel: "수량",
        reason: `수량을 ${t.qty}개로 선택해 주세요.`
    });
    if (t.useCoupon) {
        checks.push({
            label: "쿠폰 사용하기",
            ok: state.appliedCoupon === true,
            mistakeType: "coupon",
            errorLabel: "쿠폰 사용",
            reason: "쿠폰을 사용하지 않았어요. 쿠폰을 적용한 뒤 결제해 주세요."
        });
    }
    if (t.usePoint) {
        checks.push({
            label: "포인트 적립하기",
            ok: !!state.pointPhone,
            mistakeType: "point",
            errorLabel: "포인트 적립",
            reason: "포인트를 적립하지 않았어요. 전화번호를 입력해 주세요."
        });
    }
    checks.push({ label: "결제 완료하기", ok: true });

    const errors = checks
        .filter(check => !check.ok)
        .map(check => ({
            section: state.stepId === "coupon" ? "쿠폰 사용" : "포인트 적립",
            mistakeType: check.mistakeType,
            label: check.errorLabel,
            reason: check.reason
        }));

    return {
        pass: checks.every(check => check.ok),
        checks,
        errors
    };
}

// 심화 실습의 오답을 기본 단계와 같은 저장소에 기록한다.
// 일반 실습에서는 새 오답을 만들고, 오답노트 재연습 중이면 기존 카드를 갱신한다.
function saveAdvancedWrongNote(errors) {
    if (
        !Array.isArray(errors) ||
        errors.length === 0 ||
        typeof saveWrongNote !== "function"
    ) {
        return;
    }

    saveWrongNote({
        stepId: state.stepId,
        stepTitle: MISSIONS[state.stepId].title,
        reason: errors.map(error => error.reason).join(" / "),
        details: errors,
        retryNoteId: state.retryNoteId,
        retryUrl: `/tutorial/?step=${encodeURIComponent(state.stepId)}`
    });
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
        showAdvDoneScreen();
        return;
    }
    resetAdvancedRun();
    render();
}
resultBtn.onclick = closeResult;
document.getElementById("resultClose").onclick = closeResult;

//  ---- 심화 단계(쿠폰/포인트) 통과 시 완료 화면 ----
const advDoneScreen = document.getElementById("advDoneScreen");
const advDoneText = document.getElementById("advDoneText");
const advDoneCouponBtn = document.getElementById("advDoneCouponBtn");
const advDonePointBtn = document.getElementById("advDonePointBtn");
function showAdvDoneScreen() {
    clearInterval(state.timerId);   // 타이머 정지
    closeModals();
    const doneLabel = state.stepId === "coupon" ? "쿠폰 사용" : "포인트 적립";
    advDoneText.textContent = doneLabel + " 단계를 끝내셨습니다!";
    // 방금 끝낸 심화 단계 버튼은 감추고, 아직 안 해본 나머지 단계만 보여준다
    advDoneCouponBtn.hidden = state.stepId === "coupon";
    advDonePointBtn.hidden = state.stepId === "point";
    advDoneScreen.hidden = false;
}

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
    // tutorial과 practice 모두 결제 완료 시점의 실제 상태를 미션 target과 비교한다.
    const { pass, checks, errors } = judgeAdvanced();

    if (!pass) {
        // 오답노트는 안내가 없는 실습에서 틀린 경우에만 기록한다.
        if (state.phase === "practice") {
            saveAdvancedWrongNote(errors);
        }

        // 기본 단계와 동일하게 첫 번째 핵심 오답만 검은 안내창으로 보여 준다.
        const popupMessage = typeof getShortWrongMessage === "function"
            ? getShortWrongMessage(errors)
            : "주문 내용을 다시 확인해 주세요";

        recordAdvancedAction(`fail-${state.phase}`, checks);
        resetAdvancedRun();
        render();
        flash("❌ " + popupMessage);
        return;
    }

    if (state.phase === "tutorial") {
        recordAdvancedAction("complete-tutorial", "tutorial->practice");
        state.phase = "practice";
        resetAdvancedRun();
        flash("잘하셨어요! 이번엔 안내 없이 직접 해볼까요?");
        render();
        return;
    }

    if (
        state.retryNoteId &&
        typeof markWrongNoteResolved === "function"
    ) {
        // 오답노트의 '다시 연습'으로 들어온 경우에만 완료 처리한다.
        markWrongNoteResolved(state.retryNoteId);
        state.retryNoteId = null;
    }

    recordAdvancedAction("complete-practice", checks);
    openResult(true, checks);
}

//  초기 동기화 (이 스크립트는 tutorial.js 의 최초 startStep() 이후에 로드됨)
renderAdvancedUI();
