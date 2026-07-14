// 오답노트 카드에 틀린 이유만 간단하게 표시한다.

(function () {
  "use strict";

  const SIMPLE_REASON_BY_TYPE = {
    menu: "메뉴를 잘못 선택했습니다.",
    temperature: "온도를 잘못 선택했습니다.",
    temp: "온도를 잘못 선택했습니다.",
    size: "크기를 잘못 선택했습니다.",
    quantity: "수량을 잘못 선택했습니다.",
    qty: "수량을 잘못 선택했습니다.",
    orderType: "매장·포장을 잘못 선택했습니다.",
    place: "매장·포장을 잘못 선택했습니다.",
    paymentMethod: "결제 방법을 잘못 선택했습니다.",
    payment: "결제 방법을 잘못 선택했습니다.",
    coupon: "쿠폰 사용을 잘못 선택했습니다.",
    point: "포인트 적립을 잘못 선택했습니다."
  };

  const LEGACY_REASON_PATTERNS = [
    ["메뉴", "메뉴를 잘못 선택했습니다."],
    ["온도", "온도를 잘못 선택했습니다."],
    ["크기", "크기를 잘못 선택했습니다."],
    ["수량", "수량을 잘못 선택했습니다."],
    ["포장", "매장·포장을 잘못 선택했습니다."],
    ["매장", "매장·포장을 잘못 선택했습니다."],
    ["결제", "결제 방법을 잘못 선택했습니다."],
    ["쿠폰", "쿠폰 사용을 잘못 선택했습니다."],
    ["포인트", "포인트 적립을 잘못 선택했습니다."]
  ];

  const REASON_LABELS = [
    "결제 방법",
    "쿠폰 사용",
    "포인트 적립",
    "매장·포장",
    "메뉴",
    "온도",
    "크기",
    "수량"
  ];

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

  function unique(values) {
    return [...new Set(values.filter(Boolean))];
  }

  function getSimpleReasons(note) {
    if (Array.isArray(note.details) && note.details.length > 0) {
      const detailReasons = note.details.map(detail => {
        return SIMPLE_REASON_BY_TYPE[detail.mistakeType]
          ?? (detail.label ? `${detail.label} 항목을 잘못 선택했습니다.` : null);
      });

      const simplified = unique(detailReasons);

      if (simplified.length > 0) {
        return simplified;
      }
    }

    // 이전 저장 형식에는 details가 없으므로 reason의 단어를 이용한다.
    const originalReason = String(note.reason ?? "");
    const legacyReasons = LEGACY_REASON_PATTERNS
      .filter(([keyword]) => originalReason.includes(keyword))
      .map(([, message]) => message);

    const simplifiedLegacy = unique(legacyReasons);

    if (simplifiedLegacy.length > 0) {
      return simplifiedLegacy;
    }

    return [originalReason || "주문 내용을 다시 확인해 주세요."];
  }

  function createReasonArea(note) {
    const reasons = getSimpleReasons(note);
    const list = createElement("ul", "wrong-note-simple-list");

    reasons.forEach(reason => {
      const item = createElement("li", "wrong-note-simple-item");
      const label = REASON_LABELS.find(candidate =>
        reason.startsWith(candidate)
      );

      if (!label) {
        item.textContent = reason;
      } else {
        const highlightedLabel = createElement(
          "span",
          "wrong-note-reason-label",
          label
        );

        item.append(
          highlightedLabel,
          document.createTextNode(reason.slice(label.length))
        );
      }

      list.append(item);
    });

    return list;
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
      "history-info",
      `${note.stepTitle || note.stepId} · ${note.date || ""}`
    );

    meta.append(badge, info);
    content.append(meta, createReasonArea(note));

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
        const retryUrl = new URL(
          note.retryUrl || "/tutorial/",
          window.location.origin
        );

        retryUrl.searchParams.set("step", note.stepId);
        retryUrl.searchParams.set("mode", "practice");
        retryUrl.searchParams.set("retry", note.id);

        window.location.href =
          retryUrl.pathname + retryUrl.search + retryUrl.hash;
      });
    }

    card.append(content, button);
    return card;
  }

  function renderEmptyState(list) {
    const card = createElement("article", "history-card is-correct");
    const content = createElement("div", "history-content");
    const meta = createElement("div", "history-meta");
    const badge = createElement("span", "status-badge", "안내");
    const message = createElement(
      "p",
      "wrong-note-empty-message",
      "아직 기록된 오답이 없어요."
    );

    meta.append(badge);
    content.append(meta, message);
    card.append(content);
    list.append(card);
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
      renderEmptyState(list);
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