// localStorage에 저장된 오답노트를 화면에 출력한다.

(function () {
  "use strict";

  const GROUP_ORDER = ["메뉴 선택", "옵션 선택", "결제 선택"];

  function createElement(tagName, className, text) {
    const element = document.createElement(tagName);

    if (className) {
      element.className = className;
    }

    if (text !== undefined && text !== null) {
      element.textContent = String(text);
    }

    return element;
  }

  function groupDetails(details) {
    const groups = new Map();

    details.forEach(detail => {
      const section = GROUP_ORDER.includes(detail.section)
        ? detail.section
        : "옵션 선택";

      if (!groups.has(section)) {
        groups.set(section, []);
      }

      groups.get(section).push(detail);
    });

    return groups;
  }

  function createDetailArea(note) {
    if (!Array.isArray(note.details) || note.details.length === 0) {
      return null;
    }

    const container = createElement("div", "wrong-note-details");
    const groups = groupDetails(note.details);

    GROUP_ORDER.forEach(groupName => {
      const groupItems = groups.get(groupName);

      if (!groupItems?.length) {
        return;
      }

      const section = createElement("section", "wrong-note-detail-group");
      const title = createElement("h4", "wrong-note-detail-title", groupName);
      const list = createElement("ul", "wrong-note-detail-list");

      groupItems.forEach(detail => {
        const item = createElement("li", "wrong-note-detail-item");
        const label = detail.label ? `${detail.label}: ` : "";
        item.textContent = `${label}${detail.reason ?? "선택한 내용을 다시 확인해 주세요."}`;
        list.append(item);
      });

      section.append(title, list);
      container.append(section);
    });

    return container;
  }

  function createWrongNoteCard(note) {
    const isResolved = note.status === "resolved";
    const card = createElement(
      "article",
      isResolved
        ? "history-card is-correct"
        : "history-card is-wrong"
    );

    const content = createElement("div", "history-content");
    const meta = createElement("div", "history-meta");
    const badge = createElement(
      "span",
      "status-badge",
      isResolved ? "완료" : "오답"
    );
    const info = createElement(
      "span",
      null,
      `${note.stepTitle || note.stepId} · ${note.date || ""}`
    );
    const reason = createElement(
      "h3",
      null,
      note.reason || "선택한 내용을 다시 확인해 주세요."
    );

    meta.append(badge, info);
    content.append(meta, reason);

    const details = createDetailArea(note);
    if (details) {
      content.append(details);
    }

    const button = createElement(
      "button",
      isResolved ? "review-complete-button" : "retry-button",
      isResolved ? "복습 완료" : "다시 연습"
    );
    button.type = "button";

    if (isResolved) {
      button.disabled = true;
    } else {
      button.addEventListener("click", () => {
        window.location.href = note.retryUrl ||
          `/tutorial/?step=${encodeURIComponent(note.stepId)}`;
      });
    }

    card.append(content, button);
    return card;
  }

  function renderWrongNotes() {
    const list = document.getElementById("wrong-note-list");

    if (!list) {
      return;
    }

    const notes = typeof getWrongNotes === "function"
      ? getWrongNotes()
      : [];

    list.replaceChildren();

    if (notes.length === 0) {
      const emptyCard = createElement(
        "article",
        "history-card is-correct"
      );
      const content = createElement("div");
      const meta = createElement("div", "history-meta");
      const badge = createElement("span", "status-badge", "안내");
      const message = createElement("h3", null, "아직 기록된 오답이 없어요.");

      meta.append(badge);
      content.append(meta, message);
      emptyCard.append(content);
      list.append(emptyCard);
      return;
    }

    notes.forEach(note => {
      list.append(createWrongNoteCard(note));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderWrongNotes);
  } else {
    renderWrongNotes();
  }
})();