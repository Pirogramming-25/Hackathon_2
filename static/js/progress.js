//  단계 진행도 저장/조회 (홈 progress-line & 튜토리얼 완료 기록 공용)
//  진행도 규칙:
//    0   → 아무것도 안 함
//    50  → 튜토리얼만 완료
//    100 → 실습(또는 3단계 실전) 완료  ※ 튜토리얼을 건너뛰고 실습만 해도 100
//  ※ 오답노트용 storage.js(개발자4)와 별개 키. 추후 통합 가능.

const PROGRESS_KEY = "slowkiosk.progress";

function getProgressAll() {
    try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}"); }
    catch { return {}; }
}

//  값은 내려가지 않도록 기존값과 max 로 저장
function setStepProgress(step, pct) {
    const all = getProgressAll();
    all[step] = Math.max(all[step] || 0, pct);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
}

//  홈 화면: step-card 의 progress-line 너비를 진행도(%)로 채운다
function applyProgressToHome() {
    const all = getProgressAll();
    document.querySelectorAll(".step-card").forEach(card => {
        const m = (card.getAttribute("href") || "").match(/step=(step\d)/);
        const bar = card.querySelector(".progress-line > div");
        if (!bar) return;
        const pct = m ? (all[m[1]] || 0) : 0;
        bar.style.width = pct + "%";
    });
}

//  홈 상단의 '이어서 학습하기' 카드를 저장된 진행도에 맞게 갱신한다.
function applyContinueToHome() {
    const stepEl = document.getElementById("continue-step");
    const titleEl = document.getElementById("continue-title");
    const linkEl = document.getElementById("continue-link");
    if (!stepEl || !titleEl || !linkEl) return;

    const all = getProgressAll();
    const steps = [
        { id: "step1", badge: "1단계", title: "기본 주문" },
        { id: "step2", badge: "2단계", title: "옵션 선택" },
        { id: "step3", badge: "3단계", title: "실전 주문" },
    ];
    const nextStep = steps.find(step => (all[step.id] || 0) < 100);

    if (!nextStep) {
        stepEl.textContent = "학습 완료";
        titleEl.textContent = "자유 연습";
        linkEl.textContent = "자유롭게 연습하기 >";
        linkEl.href = "/practice/free/";
        return;
    }

    const progress = all[nextStep.id] || 0;
    stepEl.textContent = nextStep.badge;
    titleEl.textContent = nextStep.title;
    linkEl.textContent = progress > 0 ? "이어서 학습하기 >" : "학습 시작하기 >";
    linkEl.href = `/tutorial/?step=${nextStep.id}`;
}

//  홈에 step-card 가 있으면 자동 적용 (튜토리얼 페이지엔 없으므로 무해)
document.addEventListener("DOMContentLoaded", () => {
    applyProgressToHome();
    applyContinueToHome();
});
