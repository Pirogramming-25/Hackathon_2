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

//  홈에 step-card 가 있으면 자동 적용 (튜토리얼 페이지엔 없으므로 무해)
document.addEventListener("DOMContentLoaded", applyProgressToHome);
