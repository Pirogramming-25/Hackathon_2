// ============================================================
//  tutorial.js
//  키오스크 화면 렌더링 (탭 / 메뉴 그리드 / 장바구니 / 결제 팝업)
//  + 튜토리얼/실습 mode 스위치 + 안내/하이라이트 표시
//
//  ※ 역할 경계
//    - 이 파일(개발자 3): 화면 그리기, 안내/하이라이트, 담기/장바구니 등 표시용 상호작용
//    - "올바른 메뉴/시간초과" 판정 로직(개발자 4)은 judgeXxx() 훅으로 연결만 해둠
//      (지금은 흐름 확인용 최소 구현. 실제 판정 JS는 개발자 4가 채움)
// ============================================================

// ---------- 현재 상태 ----------
const state = {
    stepId: "step1",
    activeCat: "reco",
    cart: [],            // [{ menuId, qty, options }]
    pendingMenu: null,   // 옵션 팝업에서 담는 중인 메뉴
    pendingOpt: null,    // { temp, size, qty, place }
    timeLeft: 120,
    timerId: null,
};

// ---------- DOM ----------
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

// ============================================================
//  진입점
// ============================================================
function startStep(stepId) {
    state.stepId = stepId;
    state.activeCat = "reco";
    state.cart = [];
    state.pendingMenu = null;
    state.pendingOpt = null;
    missionText.textContent = MISSIONS[stepId].title;
    closeModals();
    startTimer(MISSIONS[stepId].timeLimit || 120);
    render();
}

// ============================================================
//  전체 렌더
// ============================================================
function render() {
    renderTabs();
    renderGrid();
    renderCart();
    updateSummary();
}

// ----- 카테고리 탭 -----
function renderTabs() {
    tabList.innerHTML = CATEGORIES.map(c =>
        `<button class="tab-btn${c.id === state.activeCat ? " active" : ""}" data-cat="${c.id}">${c.label}</button>`
    ).join("");
    tabList.querySelectorAll(".tab-btn").forEach(el => {
        el.onclick = () => { state.activeCat = el.dataset.cat; render(); };
    });
}

// ----- 메뉴 그리드 -----
function renderGrid() {
    const g = guideFor("menu");
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

// ----- 장바구니 목록 -----
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

// ----- 하단 요약(개수/합계/결제 하이라이트) -----
function updateSummary() {
    const count = state.cart.reduce((s, c) => s + c.qty, 0);
    const total = state.cart.reduce((s, c) => s + MENU_BY_ID[c.menuId].price * c.qty, 0);
    cartCount.textContent = count;
    payTotal.textContent = total.toLocaleString();

    const g = guideFor("cart");
    btnPay.classList.toggle("hl", !!(g && g.highlight === "btnPay"));
}

// ============================================================
//  담기 흐름
// ============================================================
function onSelectMenu(menuId) {
    const m = MISSIONS[state.stepId];

    // Step2/Step3: 옵션 팝업을 거쳐 담기
    if (m.judge === "strict" || m.judge === "real") {
        openOptionModal(menuId);
        return;
    }
    // Step1(flow): 바로 담기
    addToCart(menuId, 1, null);
}

function addToCart(menuId, qty, options) {
    const exist = state.cart.find(c => c.menuId === menuId);
    if (exist) exist.qty += qty;
    else state.cart.push({ menuId, qty, options });
    render();
}

// ----- 옵션 팝업 -----
function openOptionModal(menuId) {
    state.pendingMenu = menuId;
    state.pendingOpt = { temp: null, size: null, qty: 1, place: null };
    optionTitle.textContent = MENU_BY_ID[menuId].name + " 옵션";
    renderOptionBody();
    optionModal.hidden = false;
}

function renderOptionBody() {
    const opts = MISSIONS[state.stepId].options;
    const sel = state.pendingOpt;
    const g = guideFor("option");

    let html = guideHTML(g);
    html += optBlock("온도", opts.temp, sel.temp, "temp");
    html += optBlock("크기", opts.size, sel.size, "size");
    html += `
    <div class="opt-block">
      <div class="opt-label">수량</div>
      <div class="opt-qty">
        <button class="qty-btn" data-d="-1">−</button>
        <span class="qty-num">${sel.qty}개</span>
        <button class="qty-btn" data-d="1">＋</button>
      </div>
    </div>`;
    html += optBlock("포장/매장", opts.place, sel.place, "place");
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

function optBlock(label, opts, current, group) {
    let h = `<div class="opt-block"><div class="opt-label">${label}</div><div class="opt-row">`;
    opts.forEach(op => {
        const on = current === op.id ? " on" : "";
        h += `<button class="opt-btn${on}" data-group="${group}" data-val="${op.id}">${op.label}</button>`;
    });
    return h + `</div></div>`;
}

// 옵션 팝업의 "담기"
document.getElementById("optionAdd").onclick = () => {
    const m = MISSIONS[state.stepId];
    const o = state.pendingOpt;

    // (개발자4) Step2/Step3 조합 판정 훅
    if (!judgeStrict(m, o)) return;   // 지금은 항상 통과. 실제 판정은 개발자4가 채움

    addToCart(state.pendingMenu, o.qty, { ...o });
    closeModals();
};

// ============================================================
//  결제 흐름
// ============================================================
btnPay.onclick = () => {
    if (!state.cart.length) { flash("메뉴를 먼저 담아 주세요"); return; }
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

// ============================================================
//  판정 훅 (개발자 4 영역) — 지금은 흐름 확인용 stub
// ============================================================
function judgeStrict(m, o) {
    // TODO(개발자4): m.target 과 o 조합 비교 후 오답이면 reportWrong + return false
    return true;
}
function reportWrong(reason) {
    flash("❌ " + reason);
    console.log("[오답]", state.stepId, reason);
}
function reportRecord(sec) {
    console.log("[기록]", state.stepId, sec + "초");
}
function passStep() {
    flash("잘하셨어요!");
    console.log("[통과]", state.stepId);
    const idx = STEP_ORDER.indexOf(state.stepId);
    if (idx < STEP_ORDER.length - 1) setTimeout(() => startStep(STEP_ORDER[idx + 1]), 1300);
    else setTimeout(() => flash("🎉 튜토리얼을 모두 마쳤어요!"), 1300);
}

// ============================================================
//  타이머 (표시용 — 시간초과 판정은 아직)
// ============================================================
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

// ============================================================
//  튜토리얼/실습 안내 헬퍼
//  practice 모드면 guide 를 안 넘겨 하이라이트도 꺼짐
// ============================================================
function isTutorial() { return wrap.dataset.mode === "tutorial"; }

function guideFor(screenKey) {
    if (!isTutorial()) return null;
    const g = MISSIONS[state.stepId].guide;
    return g ? g[screenKey] : null;
}
function guideHTML(g) {
    return g ? `<p class="screen-guide">👉 ${g.text}</p>` : "";
}

// ============================================================
//  유틸 / 이벤트
// ============================================================
function closeModals() {
    optionModal.hidden = true;
    payModal.hidden = true;
    optionBody.innerHTML = "";   // 숨긴 옵션 팝업에 이전 내용/안내 남지 않도록 비움
}
function flash(msg) {
    const t = document.createElement("div");
    t.textContent = msg;
    t.style.cssText = "position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#111;color:#fff;padding:14px 24px;border-radius:12px;font-size:18px;font-weight:700;z-index:99";
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 1400);
}

document.getElementById("optionClose").onclick = closeModals;
document.getElementById("payClose").onclick = closeModals;
[optionModal, payModal].forEach(m => {
    m.onclick = (e) => { if (e.target === m) closeModals(); };
});

document.getElementById("btnClear").onclick = () => { state.cart = []; render(); };
document.getElementById("btnExit").onclick = () => { window.location.href = "/"; };
document.getElementById("btnSkip").onclick = () => {
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

// ---------- 시작 ----------
// 홈에서 넘어온 ?step= 파라미터로 시작 단계 결정 (없으면 step1)
const startParam = new URLSearchParams(location.search).get("step");
startStep(STEP_ORDER.includes(startParam) ? startParam : "step1");

// 콘솔 테스트: startStep('step2') / wrap.dataset.mode='practice'
window.startStep = startStep;