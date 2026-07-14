const state = {
    activeCat: "reco",
    cart: [],            // [{ menuId, qty, options }]
    pendingMenu: null,   // 옵션 팝업에서 담는 중인 메뉴
    pendingOpt: null,    // { temp, size, qty, place }
    appliedCoupon: false,
    pointPhone: null,
    timeLeft: 120,
    timerId: null,
};

const tabList = document.getElementById("tabList");
const menuGrid = document.getElementById("menuGrid");
const cartList = document.getElementById("cartList");
const cartCount = document.getElementById("cartCount");
const payTotal = document.getElementById("payTotal");
const btnPay = document.getElementById("btnPay");
const optionModal = document.getElementById("optionModal");
const optionTitle = document.getElementById("optionTitle");
const optionBody = document.getElementById("optionBody");
const payModal = document.getElementById("payModal");
const timerNum = document.getElementById("timerNum");
const couponAskModal = document.getElementById("couponAskModal");
const barcodePanel = document.getElementById("barcodePanel");
const pointAskModal = document.getElementById("pointAskModal");
const keypadModal = document.getElementById("keypadModal");
const keypadDisplay = document.getElementById("keypadDisplay");
const payConfirmModal = document.getElementById("payConfirmModal");
const MENU_BY_ID = Object.fromEntries(MENUS.map(menu => [menu.id, menu]));

//  전체 렌더
function render() {
    renderTabs();
    renderGrid();
    renderCart();
    updateSummary();
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
    const items = MENUS.filter(m => m.cats.includes(state.activeCat));

    let html = "";
    html += items.map(item => {
        const selected = state.cart.some(c => c.menuId === item.id) ? " selected" : "";
        return `
      <button class="menu-item${selected}" data-menu="${item.id}">
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

}

//  담기 흐름
//  온도가 옵션으로 빠졌으므로, 모든 메뉴는 옵션 팝업(온도·크기·수량·포장)을 거쳐 담는다.
function onSelectMenu(menuId) {
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
    const opts = OPTION_SET;
    const sel = state.pendingOpt;
    const iceOnly = MENU_BY_ID[state.pendingMenu].iceOnly;

    let html = "";
    // 아이스 전용 메뉴는 온도 선택 버튼 대신 '차가운 메뉴' 안내만 표시
    if (iceOnly) {
        html += `<div class="opt-block"><div class="opt-label">온도</div><p class="opt-fixed">🧊 차가운 메뉴예요</p></div>`;
    } else {
        html += optBlock("온도", opts.temp, sel.temp, "temp");
    }
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
  const option = state.pendingOpt;

  if (!option.temp || !option.size || !option.place) {
    flash("온도, 크기, 이용 방법을 모두 선택해 주세요");
    return;
  }

  addToCart(state.pendingMenu, option.qty, { ...option });
  closeModals();
};

//  결제 흐름
btnPay.onclick = () => {
    if (!state.cart.length) { flash("메뉴를 먼저 담아 주세요"); return; }
    state.appliedCoupon = false;
    state.pointPhone = null;
    couponAskModal.hidden = false;
};

document.getElementById("couponYesBtn").onclick = () => {
    couponAskModal.hidden = true;
    barcodePanel.hidden = false;
};

document.getElementById("couponNoBtn").onclick = () => {
    state.appliedCoupon = false;
    couponAskModal.hidden = true;
    pointAskModal.hidden = false;
};

document.getElementById("barcodeBtn").onclick = () => {
    state.appliedCoupon = true;
    barcodePanel.hidden = true;
    flash("쿠폰 바코드를 인식했어요");
    pointAskModal.hidden = false;
};

document.getElementById("pointYesBtn").onclick = () => {
    pointAskModal.hidden = true;
    openKeypad();
};

document.getElementById("pointNoBtn").onclick = () => {
    state.pointPhone = null;
    pointAskModal.hidden = true;
    payConfirmModal.hidden = false;
};

let keypadDigits = "";

function openKeypad() {
    keypadDigits = "";
    updateKeypadDisplay();
    keypadModal.hidden = false;
}

function updateKeypadDisplay() {
    if (!keypadDigits) {
        keypadDisplay.textContent = "010-0000-0000";
        return;
    }
    const first = keypadDigits.slice(0, 3);
    const middle = keypadDigits.slice(3, 7);
    const last = keypadDigits.slice(7, 11);
    keypadDisplay.textContent = [first, middle, last].filter(Boolean).join("-");
}

keypadModal.querySelectorAll(".keypad-num").forEach(button => {
    button.onclick = () => {
        if (keypadDigits.length >= 11) return;
        keypadDigits += button.dataset.num;
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

document.getElementById("keypadConfirm").onclick = () => {
    if (keypadDigits.length < 10) {
        flash("전화번호를 정확히 입력해 주세요");
        return;
    }
    state.pointPhone = keypadDigits;
    keypadModal.hidden = true;
    flash("포인트 적립 정보를 입력했어요");
    payConfirmModal.hidden = false;
};

document.getElementById("payConfirmYes").onclick = () => {
    payConfirmModal.hidden = true;
    payModal.hidden = false;
};

document.getElementById("payConfirmNo").onclick = () => {
    payConfirmModal.hidden = true;
};

payModal.querySelectorAll(".pay-method").forEach(button => {
  button.onclick = () => {
    state.cart = [];
    state.appliedCoupon = false;
    state.pointPhone = null;
    closeModals();
    startTimer(120);
    render();
    flash("주문을 완료했어요!");
  };
});

function closeModals() {
    optionModal.hidden = true;
    payModal.hidden = true;
    couponAskModal.hidden = true;
    barcodePanel.hidden = true;
    pointAskModal.hidden = true;
    keypadModal.hidden = true;
    payConfirmModal.hidden = true;
    optionBody.innerHTML = "";   // 숨긴 옵션 팝업에 이전 내용/안내 남지 않도록 비움
}

function flash(message, duration = 1400) {
    const toast = document.createElement("div");
    toast.className = "practice-toast";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
}

function startTimer(seconds) {
    clearInterval(state.timerId);
    state.timeLeft = seconds;
    timerNum.textContent = state.timeLeft;

    state.timerId = setInterval(() => {
        state.timeLeft -= 1;
        timerNum.textContent = state.timeLeft;

        if (state.timeLeft > 0) return;

        clearInterval(state.timerId);
        state.cart = [];
        state.pendingMenu = null;
        state.pendingOpt = null;
        closeModals();
        render();
        flash("주문 시간이 끝났어요. 처음부터 다시 주문해 주세요", 3000);
        startTimer(120);
    }, 1000);
}

// 탭/캐러셀 좌우 화살표 (표시용 이동)
function shiftCat(dir) {
    const i = CATEGORIES.findIndex(c => c.id === state.activeCat);
    const ni = Math.min(CATEGORIES.length - 1, Math.max(0, i + dir));
    state.activeCat = CATEGORIES[ni].id;
    render();
}

document.getElementById("btnClear").onclick = () => {
  state.cart = [];
  render();
};

document.getElementById("optionClose").onclick = closeModals;
document.getElementById("payClose").onclick = closeModals;
document.getElementById("couponAskClose").onclick = closeModals;
document.getElementById("barcodeClose").onclick = closeModals;
document.getElementById("pointAskClose").onclick = closeModals;
document.getElementById("keypadClose").onclick = closeModals;
document.getElementById("payConfirmClose").onclick = closeModals;
document.getElementById("tabPrev").onclick = () => shiftCat(-1);
document.getElementById("tabNext").onclick = () => shiftCat(1);
document.getElementById("carPrev").onclick = () => shiftCat(-1);
document.getElementById("carNext").onclick = () => shiftCat(1);

[optionModal, payModal, couponAskModal, pointAskModal, keypadModal, payConfirmModal].forEach(modal => {
    modal.onclick = event => {
        if (event.target === modal) closeModals();
    };
});

render();
startTimer(120);
