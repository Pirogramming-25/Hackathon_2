// 오답노트는 로그인 없이 브라우저에 저장한다.
const WRONG_NOTE_KEY = "slowKioskWrongNotes";

function getWrongNotes() {
    try {
        const notes = JSON.parse(localStorage.getItem(WRONG_NOTE_KEY) || "[]");
        return Array.isArray(notes) ? notes : [];
    } catch {
        return [];
    }
}

function saveWrongNote({ stepId, stepTitle, reason, retryUrl }) {
    const notes = getWrongNotes();
    const now = new Date();
    notes.unshift({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        stepId,
        stepTitle,
        reason,
        retryUrl,
        date: now.toLocaleDateString("ko-KR"),
    });
    localStorage.setItem(WRONG_NOTE_KEY, JSON.stringify(notes.slice(0, 50)));
}
