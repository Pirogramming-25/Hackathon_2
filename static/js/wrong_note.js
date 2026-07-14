function escapeHTML(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
}

function renderWrongNotes() {
    const list = document.getElementById("wrong-note-list");
    if (!list) return;
    const notes = typeof getWrongNotes === "function" ? getWrongNotes() : [];
    if (!notes.length) {
        list.innerHTML = `<article class="history-card is-correct"><div><div class="history-meta"><span class="status-badge">안내</span></div><h3>아직 기록된 오답이 없어요.</h3></div></article>`;
        return;
    }
    list.innerHTML = notes.map(note => `
      <article class="history-card is-wrong">
        <div>
          <div class="history-meta"><span class="status-badge">오답</span><span>${escapeHTML(note.stepTitle || note.stepId)} · ${escapeHTML(note.date || "")}</span></div>
          <h3>${escapeHTML(note.reason)}</h3>
        </div>
        <button type="button" data-retry-url="${escapeHTML(note.retryUrl || "/tutorial/")}">다시 연습</button>
      </article>`).join("");
    list.querySelectorAll("[data-retry-url]").forEach(button => {
        button.onclick = () => { window.location.href = button.dataset.retryUrl; };
    });
}

document.addEventListener("DOMContentLoaded", renderWrongNotes);
