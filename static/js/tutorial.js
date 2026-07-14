//  키오스크 화면 렌더링 (탭 / 메뉴 그리드 / 장바구니 / 결제 팝업)
//  + 튜토리얼/실습 mode 스위치 + 안내/하이라이트 표시
//  "올바른 메뉴/시간초과" 판정 로직은 judgeXxx() 훅으로 연결만 해둠
//  (지금은 흐름 확인용 최소 구현)

//  현재 상태 
const state = {
    stepId: "step1",
    activeCat: "reco",
    cart: [],            // [{ menuId, qty, options }]
    pendingMenu: null,   // 옵션 팝업에서 담는 중인 메뉴
    pendingOpt: null,    // { temp, size, qty, place }
    timeLeft: 120,
    timerId: null,
    // 심화 단계(쿠폰/포인트) 전용 — advanced_tutorial.js 에서 사용
    appliedCoupon: null,
    pointPhone: null,
    phase: "tutorial",   // "tutorial" | "practice" — 심화 단계에서만 의미 있음
    advStage: "shopping", // "shopping" | "couponAsk" | "barcode" | "pointAsk" | "keypad" | "payConfirm"
};

//  DOM 
const wrap = document.getElementById("wrap");
const missionText = document.getElementById("missionText");
const tabList = document.getElementById("tabList");
const menuGrid = document.getElementById("menuGrid");
const cartList = document.getElementById("cartList");
const cartCount = document.getElementById("cartCount");
const payTotal = document.getElementById("payTotal");
const timerNum = document.getElementById("timerNum");
const btnPay = document.getElementById("btnPay");

const optionModal = document.getElementById("optionModal");
const optionTitle = document.getElementById("optionTitle");
const optionBody = document.getElementById("optionBody");
const payModal = document.getElementById("payModal");

const MENU_BY_ID = Object.fromEntries(MENUS.map(m => [m.id, m]));
const STEP_ORDER = ["step1", "step2", "step3"];

//  진입점
function startStep(stepId) {
    state.stepId = stepId;
    state.activeCat = "reco";
    state.cart = [];
    state.pendingMenu = null;
    state.pendingOpt = null;
    state.appliedCoupon = null;
    state.pointPhone = null;
    state.phase = "tutorial";
    state.advStage = "shopping";
    missionText.textContent = MISSIONS[stepId].title;
    closeModals();
    startTimer(MISSIONS[stepId].timeLimit || 120);
    render();
}

//  전체 렌더
function render() {
    // 화면을 그리기 전에 mode(tutorial/practice)를 먼저 확정한다.
    // renderGrid/updateSummary 가 guideFor()로 mode 를 읽으므로 순서가 중요.
    wrap.dataset.mode = state.phase;
    renderTabs();
    renderGrid();
    renderCart();
    updateSummary();
    // 심화 단계(쿠폰/포인트) UI 동기화 — advanced_tutorial.js 가 로드된 경우에만 실행
    if (typeof renderAdvancedUI === "function") renderAdvancedUI();
}

// ---- 카테고리 탭 
function renderTabs() {
    tabList.innerHTML = CATEGORIES.map(c =>
        `<button class="tab-btn${c.id === state.activeCat ? " active" : ""}" data-cat="${c.id}">${c.label}</button>`
    ).join("");
    tabList.querySelectorAll(".tab-btn").forEach(el => {
        el.onclick = () => { state.activeCat = el.dataset.cat; render(); };
    });
}

//  메뉴 그리드 
function renderGrid() {
    // 아직 안 담았을 때만 메뉴 안내/하이라이트. 담으면 다음(결제) 안내로 넘어감.
    const g = state.cart.length === 0 ? guideFor("menu") : null;
    const items = MENUS.filter(m => m.cats.includes(state.activeCat));

    let html = guideHTML(g);
    html += items.map(item => {
        const selected = state.cart.some(c => c.menuId === item.id) ? " selected" : "";
        const hl = (g && g.highlight === item.id) ? " hl" : "";
        return `
      <button class="menu-item${selected}${hl}" data-menu="${item.id}">
        <span class="m-thumb">${item.icon}</span>
        <span class="m-name">${item.name}</span>
        <span class="m-price">${item.price.toLocaleString()}원</span>
      </button>`;
    }).join("");

    menuGrid.innerHTML = html;
    menuGrid.querySelectorAll(".menu-item").forEach(el => {
        el.onclick = () => onSelectMenu(el.dataset.menu);
    });
}

//  장바구니 목록 
function renderCart() {
    if (!state.cart.length) {
        cartList.innerHTML = `<div class="cart-empty">담은 메뉴가 없습니다</div>`;
        return;
    }
    cartList.innerHTML = state.cart.map((c, i) => {
        const m = MENU_BY_ID[c.menuId];
        return `
      <div class="cart-row">
        <button class="cart-x" data-i="${i}" aria-label="삭제">✕</button>
        <span class="cart-name">${m.name}</span>
        <span class="cart-qty">
          <button class="qty-btn" data-i="${i}" data-d="-1">−</button>
          <span class="qty-num">${c.qty}개</span>
          <button class="qty-btn" data-i="${i}" data-d="1">＋</button>
        </span>
        <span class="cart-price">${(m.price * c.qty).toLocaleString()}원</span>
      </div>`;
    }).join("");

    cartList.querySelectorAll(".cart-x").forEach(el => {
        el.onclick = () => { state.cart.splice(Number(el.dataset.i), 1); render(); };
    });
    cartList.querySelectorAll(".qty-btn").forEach(el => {
        el.onclick = () => {
            const c = state.cart[Number(el.dataset.i)];
            c.qty = Math.max(1, c.qty + Number(el.dataset.d));
            render();
        };
    });
}

//  하단 요약(개수/합계/결제 하이라이트) 
function updateSummary() {
    const count = state.cart.reduce((s, c) => s + c.qty, 0);
    const total = state.cart.reduce((s, c) => s + MENU_BY_ID[c.menuId].price * c.qty, 0);
    cartCount.textContent = count;
    payTotal.textContent = total.toLocaleString();

    // 음료를 담은 뒤에만 결제하기 안내를 띄운다 (담기 전엔 메뉴 안내가 우선)
    const g = state.cart.length > 0 ? guideFor("cart") : null;
    btnPay.classList.toggle("hl", !!(g && g.highlight === "btnPay"));
}

//  담기 흐름
//  1단계(flow)는 클릭 흐름만 익히므로 옵션 팝업 없이 바로 담는다.
//  2·3단계(및 심화)는 옵션 팝업(온도·크기·수량·포장)을 거쳐 담는다.
function onSelectMenu(menuId) {
    if (MISSIONS[state.stepId].judge === "flow") {
        addToCart(menuId, 1, null);
        return;
    }
    openOptionModal(menuId);
}

function addToCart(menuId, qty, options) {
    const exist = state.cart.find(c => c.menuId === menuId);
    if (exist) exist.qty += qty;
    else state.cart.push({ menuId, qty, options });
    render();
}

//  옵션 팝업 
function openOptionModal(menuId) {
    state.pendingMenu = menuId;
    // 아이스 전용 메뉴(스무디·프라페)는 온도를 'ice'로 고정, 그 외엔 미선택
    const iceOnly = MENU_BY_ID[menuId].iceOnly;
    state.pendingOpt = { temp: iceOnly ? "ice" : null, size: null, qty: 1, place: null };
    optionTitle.textContent = MENU_BY_ID[menuId].name + " 옵션";
    renderOptionBody();
    optionModal.hidden = false;
}

function renderOptionBody() {
    const m = MISSIONS[state.stepId];
    const opts = m.options;
    const sel = state.pendingOpt;
    const g = guideFor("option");
    const iceOnly = MENU_BY_ID[state.pendingMenu].iceOnly;
    // 옵션 조합이 정확해야 하는 단계(step2=strict)의 튜토리얼에서만 정답 옵션 버튼에 가이드라인.
    // 1단계(flow)·실습·실전에는 적용 안 함.
    const t = (g && m.target && m.judge === "strict") ? m.target : null;

    let html = guideHTML(g);
    // 아이스 전용 메뉴는 온도 선택 버튼 대신 '차가운 메뉴' 안내만 표시
    if (iceOnly) {
        html += `<div class="opt-block"><div class="opt-label">온도</div><p class="opt-fixed">🧊 차가운 메뉴예요</p></div>`;
    } else {
        html += optBlock("온도", opts.temp, sel.temp, "temp", t && t.temp);
    }
    html += optBlock("크기", opts.size, sel.size, "size", t && t.size);
    // 수량: 목표보다 적으면 ＋, 많으면 − 에 가이드라인
    const qtyHlPlus = (t && sel.qty < t.qty) ? " hl" : "";
    const qtyHlMinus = (t && sel.qty > t.qty) ? " hl" : "";
    html += `
    <div class="opt-block">
      <div class="opt-label">수량</div>
      <div class="opt-qty">
        <button class="qty-btn${qtyHlMinus}" data-d="-1">−</button>
        <span class="qty-num">${sel.qty}개</span>
        <button class="qty-btn${qtyHlPlus}" data-d="1">＋</button>
      </div>
    </div>`;
    html += optBlock("포장/매장", opts.place, sel.place, "place", t && t.place);
    optionBody.innerHTML = html;

    optionBody.querySelectorAll(".opt-btn").forEach(el => {
        el.onclick = () => { state.pendingOpt[el.dataset.group] = el.dataset.val; renderOptionBody(); };
    });
    optionBody.querySelectorAll(".qty-btn").forEach(el => {
        el.onclick = () => {
            state.pendingOpt.qty = Math.max(1, state.pendingOpt.qty + Number(el.dataset.d));
            renderOptionBody();
        };
    });
}

function optBlock(label, opts, current, group, targetVal) {
    let h = `<div class="opt-block"><div class="opt-label">${label}</div><div class="opt-row">`;
    opts.forEach(op => {
        const on = current === op.id ? " on" : "";
        // 튜토리얼: 정답 버튼을 아직 안 골랐을 때만 가이드라인 (고르면 하이라이트 사라짐)
        const hl = (targetVal && op.id === targetVal && current !== targetVal) ? " hl" : "";
        h += `<button class="opt-btn${on}${hl}" data-group="${group}" data-val="${op.id}">${op.label}</button>`;
    });
    return h + `</div></div>`;
}

// 옵션 팝업의 "담기"
document.getElementById("optionAdd").onclick = () => {
    const m = MISSIONS[state.stepId];
    const o = state.pendingOpt;

    if (!judgeStrict(m, o)) return;   // 지금은 항상 통과. 실제 판정은 개발자4가 채움

    addToCart(state.pendingMenu, o.qty, { ...o });
    closeModals();
};

//  결제 흐름
btnPay.onclick = () => {
    if (!state.cart.length) { flash("메뉴를 먼저 담아 주세요"); return; }
    // 심화 단계: 결제수단 팝업 전에 쿠폰/포인트 사용 여부부터 묻는다 (advanced_tutorial.js)
    if (state.stepId === "coupon" && typeof openCouponAsk === "function") { openCouponAsk(); return; }
    if (state.stepId === "point" && typeof openPointAsk === "function") { openPointAsk(); return; }
    payModal.hidden = false;
};

payModal.querySelectorAll(".pay-method").forEach(el => {
    el.onclick = () => onPay(el.dataset.pay);
});

function onPay(payId) {
    const m = MISSIONS[state.stepId];
    if (m.judge === "real") {
        const sec = (m.timeLimit || 120) - state.timeLeft;
        reportRecord(sec);
    }
    closeModals();
    passStep();
}

function shouldSaveMistake(mission) {
  // Step 3는 가이드 없는 실전이므로 바로 저장
  if (mission.judge === "real") {
    return true;
  }

  // Step 2·쿠폰·포인트는 practice에서만 저장
  return state.phase === "practice";
}

function saveMissionErrors(mission, result) {
  if (!shouldSaveMistake(mission)) {
    return;
  }

  const errors = result.errors ?? [];

  if (errors.length === 0) {
    return;
  }

  const isNumberedStep =
    state.stepId.startsWith("step");

  const stepNumber = isNumberedStep
    ? Number(state.stepId.replace("step", ""))
    : null;

  SlowKioskStorage.saveMistake({
    missionId: state.stepId,
    step: stepNumber,
    practiceType: mission.judge,

    mistakeType:
      errors.length === 1
        ? errors[0].mistakeType
        : "multiple",

    mission: mission.title,

    reason:
      errors.length === 1
        ? errors[0].reason
        : `확인이 필요한 항목이 ${errors.length}개 있어요.`,

    // 세부 오답 목록
    errors: errors.map(error => ({
      mistakeType: error.mistakeType,
      reason: error.reason,
      selectedValue: error.selectedValue,
      expectedValue: error.expectedValue,
      retryAction: error.retryAction
    })),

    selectedValue:
      errors.map(error => error.selectedValue),

    expectedValue:
      errors.map(error => error.expectedValue),

    retryPage: "tutorial",
    retryAction: "retry-mission"
  });
}

window.saveMissionErrors = saveMissionErrors;

//  판정 훅  — 지금은 흐름 확인용 stub
function judgeStrict(mission, options) {
  const result =
    SlowKioskValidator.validateMission(
      mission,
      {
        menuId: state.pendingMenu,
        temp: options.temp,
        size: options.size,
        qty: options.qty,
        place: options.place
      }
    );

  if (result.isCorrect) {
    return true;
  }

  saveMissionErrors(mission, result);
  reportWrong(result.errors[0].reason);

  return false;
}

function reportWrong(reason) {
    flash("❌ " + reason);
    console.log("[오답]", state.stepId, reason);
}
function reportRecord(sec) {
    console.log("[기록]", state.stepId, sec + "초");
}
//  같은 단계 안에서 실습을 다시 시작할 때(장바구니/타이머만 초기화, 단계·phase는 유지)
function resetRun() {
    state.activeCat = "reco";
    state.cart = [];
    state.pendingMenu = null;
    state.pendingOpt = null;
    closeModals();
    startTimer(MISSIONS[state.stepId].timeLimit || 120);
    missionText.textContent = MISSIONS[state.stepId].title + (state.phase === "practice" ? " (실습)" : "");
}

function passStep() {
    // 심화 단계(쿠폰/포인트)는 1~3단계와 이어지지 않는 별도 미션
    // tutorial(안내) 통과 시 practice(안내 없음)로 전환되고, practice까지 통과해야 완료 (advanced_tutorial.js)
    if (state.stepId === "coupon" || state.stepId === "point") {
        console.log("[통과]", state.stepId, state.phase);
        if (typeof advancedPassStep === "function") { advancedPassStep(); return; }
        flash("심화 단계를 완료했어요!");
        setTimeout(() => { window.location.href = "/"; }, 1300);
        return;
    }

    // 1·2단계(가이드 있는 단계): 튜토리얼 통과 → 같은 단계 실습(안내 없음)으로 전환
    const hasGuide = !!MISSIONS[state.stepId].guide;
    if (hasGuide && state.phase === "tutorial") {
        console.log("[통과]", state.stepId, "tutorial→practice");
        if (typeof setStepProgress === "function") setStepProgress(state.stepId, 50); // 튜토리얼 완료 = 50%
        flash("잘하셨어요! 이번엔 안내 없이 직접 해볼까요?", true);
        state.phase = "practice";
        resetRun();
        render();
        return;
    }

    // 실습까지 통과했거나 3단계(가이드 없음) → 다음 단계로, 마지막이면 완료 화면
    if (typeof setStepProgress === "function") setStepProgress(state.stepId, 100); // 실습/실전 완료 = 100%
    flash("잘하셨어요!", true);
    console.log("[통과]", state.stepId, state.phase);
    const idx = STEP_ORDER.indexOf(state.stepId);
    if (idx < STEP_ORDER.length - 1) setTimeout(() => startStep(STEP_ORDER[idx + 1]), 1300);
    else setTimeout(showDoneScreen, 1200);
}

//  1~3단계 모두 통과 시 흰 배경 완료 화면 표시
function showDoneScreen() {
    clearInterval(state.timerId);   // 타이머 정지
    closeModals();
    document.getElementById("doneScreen").hidden = false;
}

//  타이머 (표시용 — 시간초과 판정은 아직)
function startTimer(sec) {
    state.timeLeft = sec;
    timerNum.textContent = sec;
    clearInterval(state.timerId);
    state.timerId = setInterval(() => {
        state.timeLeft = Math.max(0, state.timeLeft - 1);
        timerNum.textContent = state.timeLeft;
        if (state.timeLeft === 0) clearInterval(state.timerId);
    }, 1000);
}

//  튜토리얼/실습 안내 헬퍼
//  practice 모드면 guide 를 안 넘겨 하이라이트도 꺼짐
function isTutorial() { return wrap.dataset.mode === "tutorial"; }

function guideFor(screenKey) {
    if (!isTutorial()) return null;
    const g = MISSIONS[state.stepId].guide;
    return g ? g[screenKey] : null;
}
function guideHTML(g) {
    return g ? `<p class="screen-guide">👉 ${g.text}</p>` : "";
}

//  유틸 / 이벤트
function closeModals() {
    optionModal.hidden = true;
    payModal.hidden = true;
    optionBody.innerHTML = "";   // 숨긴 옵션 팝업에 이전 내용/안내 남지 않도록 비움
    // 심화 단계(쿠폰/포인트) 팝업들 — advanced_tutorial.js 가 로드된 경우에만 실행
    if (typeof closeAdvancedModals === "function") closeAdvancedModals();
}
//  big=true 면 화면 중앙에 큰 축하 메시지 (단계 완료 등)
function flash(msg, big = false) {
    const t = document.createElement("div");
    t.textContent = msg;
    if (big) {
        t.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(17,17,17,0.9);color:#fff;padding:34px 56px;border-radius:20px;font-size:38px;font-weight:800;text-align:center;line-height:1.35;box-shadow:0 12px 40px rgba(0,0,0,.35);z-index:99;max-width:80vw";
    } else {
        t.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(17,17,17,0.9);color:#fff;padding:34px 56px;border-radius:20px;font-size:38px;font-weight:800;text-align:center;line-height:1.35;box-shadow:0 12px 40px rgba(0,0,0,.35);z-index:99;max-width:80vw";
    }
    document.body.appendChild(t);
    setTimeout(() => t.remove(), big ? 2000 : 1700);
}
document.getElementById("optionClose").onclick = closeModals;
document.getElementById("payClose").onclick = closeModals;
[optionModal, payModal].forEach(m => {
    m.onclick = (e) => { if (e.target === m) closeModals(); };
});

document.getElementById("btnClear").onclick = () => { state.cart = []; render(); };
document.getElementById("btnExit").onclick = () => { window.location.href = "/"; };
document.getElementById("btnSkip").onclick = () => {
    // 심화 단계(쿠폰/포인트): 건너뛰기 = tutorial 안내를 건너뛰고 practice로 전환 (advanced_tutorial.js)
    if (state.stepId === "coupon" || state.stepId === "point") {
        if (typeof advancedSkip === "function") advancedSkip();
        return;
    }
    // 1·2단계 튜토리얼: 건너뛰기 = 안내를 건너뛰고 같은 단계 실습으로
    const hasGuide = !!MISSIONS[state.stepId].guide;
    if (hasGuide && state.phase === "tutorial") {
        state.phase = "practice";
        resetRun();
        flash("이제 안내 없이 직접 연습해 보세요");
        render();
        return;
    }
    // 실습 중이거나 3단계 → 다음 단계로
    const idx = STEP_ORDER.indexOf(state.stepId);
    if (idx < STEP_ORDER.length - 1) startStep(STEP_ORDER[idx + 1]);
    else flash("마지막 단계예요");
};

// 탭/캐러셀 좌우 화살표 (표시용 이동)
function shiftCat(dir) {
    const i = CATEGORIES.findIndex(c => c.id === state.activeCat);
    const ni = Math.min(CATEGORIES.length - 1, Math.max(0, i + dir));
    state.activeCat = CATEGORIES[ni].id;
    render();
}
document.getElementById("tabPrev").onclick = () => shiftCat(-1);
document.getElementById("tabNext").onclick = () => shiftCat(1);
document.getElementById("carPrev").onclick = () => shiftCat(-1);
document.getElementById("carNext").onclick = () => shiftCat(1);

//  시작 
// 홈에서 넘어온 ?step= 파라미터로 시작 단계 결정 (없으면 step1)
const startParam = new URLSearchParams(location.search).get("step");
const VALID_STEPS = STEP_ORDER.concat(["coupon", "point"]); // 심화 단계 포함
startStep(VALID_STEPS.includes(startParam) ? startParam : "step1");

// 콘솔 테스트: startStep('step2') / wrap.dataset.mode='practice'
window.startStep = startStep;