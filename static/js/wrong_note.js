// 오답노트 화면에 저장된 오답 출력

(function () {
  "use strict";

  const wrongNoteList =
    document.querySelector("#wrong-note-list");

  if (!wrongNoteList) {
    return;
  }

  // 오답 종류별 영역과 표시 이름
  const ERROR_TYPE_INFO = {
    menu: {
      group: "menu",
      label: "메뉴"
    },

    temperature: {
      group: "option",
      label: "온도"
    },
    temp: {
      group: "option",
      label: "온도"
    },
    size: {
      group: "option",
      label: "크기"
    },
    quantity: {
      group: "option",
      label: "수량"
    },
    qty: {
      group: "option",
      label: "수량"
    },
    orderType: {
      group: "option",
      label: "매장·포장"
    },
    place: {
      group: "option",
      label: "매장·포장"
    },

    payment: {
      group: "payment",
      label: "결제 방법"
    },
    paymentMethod: {
      group: "payment",
      label: "결제 방법"
    },
    payMethod: {
      group: "payment",
      label: "결제 방법"
    },
    coupon: {
      group: "payment",
      label: "쿠폰 사용"
    },
    barcode: {
      group: "payment",
      label: "쿠폰 바코드"
    },
    point: {
      group: "payment",
      label: "포인트 적립"
    },
    phone: {
      group: "payment",
      label: "휴대폰 번호"
    }
  };

  // 저장된 값을 사용자에게 보여줄 한글 문구로 변경
  const VALUE_LABELS = {
    americano: "아메리카노",
    latte: "카페라떼",
    mocha: "카페모카",
    hazelnut: "헤이즐넛라떼",
    condense: "연유라떼",
    tiramisu: "티라미수라떼",
    toffeenut: "토피넛라떼",
    apple_yuja: "사과유자차",
    yuja: "유자차",
    grapefruit: "자몽차",
    peach: "복숭아차",
    strawberry: "딸기스무디",
    mango: "망고프라페",
    choco: "초코프라페",

    hot: "따뜻하게",
    ice: "차갑게",

    small: "보통",
    large: "크게",

    eatin: "매장",
    takeout: "포장",

    card: "카드 결제",
    cash: "현금 결제",
    mobile: "간편결제",

    true: "사용함",
    false: "사용하지 않음"
  };

  function getStepName(mistake) {
    if (mistake.practiceType === "coupon") {
      return "심화 · 쿠폰 사용";
    }

    if (mistake.practiceType === "point") {
      return "심화 · 포인트 적립";
    }

    const stepNames = {
      1: "기본 주문",
      2: "옵션 선택",
      3: "실전 주문"
    };

    const stepName =
      stepNames[mistake.step] ?? "키오스크 연습";

    if (!mistake.step) {
      return stepName;
    }

    return `${mistake.step}단계 · ${stepName}`;
  }

  // mistakeType을 메뉴/옵션/결제 중 하나로 분류
  function getErrorTypeInfo(mistakeType) {
    if (ERROR_TYPE_INFO[mistakeType]) {
      return ERROR_TYPE_INFO[mistakeType];
    }

    const type =
      String(mistakeType ?? "").toLowerCase();

    if (type.includes("menu")) {
      return {
        group: "menu",
        label: "메뉴"
      };
    }

    if (
      type.includes("pay") ||
      type.includes("coupon") ||
      type.includes("point") ||
      type.includes("barcode") ||
      type.includes("phone")
    ) {
      return {
        group: "payment",
        label: "결제"
      };
    }

    return {
      group: "option",
      label: "선택 항목"
    };
  }

  // 저장된 값을 화면에 읽기 쉬운 문구로 변환
  function formatValue(value) {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return "선택하지 않음";
    }

    const valueKey = String(value);

    if (VALUE_LABELS[valueKey] !== undefined) {
      return VALUE_LABELS[valueKey];
    }

    if (Array.isArray(value)) {
      return value
        .map(item => formatValue(item))
        .join(", ");
    }

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return valueKey;
  }

  // 과거 방식으로 저장된 단일 오답도 화면에 표시
  function getMistakeErrors(mistake) {
    if (
      Array.isArray(mistake.errors) &&
      mistake.errors.length > 0
    ) {
      return mistake.errors;
    }

    return [
      {
        mistakeType: mistake.mistakeType,
        reason: mistake.reason,
        selectedValue: mistake.selectedValue,
        expectedValue: mistake.expectedValue,
        retryAction: mistake.retryAction
      }
    ];
  }

  // 메뉴 선택/옵션 선택/결제 선택 세부 영역 생성
  function createMistakeDetails(mistake) {
    const container =
      document.createElement("div");

    container.className =
      "mistake-detail-container";

    const groups = {
      menu: {
        title: "메뉴 선택",
        errors: []
      },
      option: {
        title: "옵션 선택",
        errors: []
      },
      payment: {
        title: "결제 선택",
        errors: []
      }
    };

    const errors = getMistakeErrors(mistake);

    errors.forEach(error => {
      const info =
        getErrorTypeInfo(error.mistakeType);

      groups[info.group].errors.push({
        ...error,
        label: info.label
      });
    });

    Object.values(groups).forEach(group => {
      if (group.errors.length === 0) {
        return;
      }

      const section =
        document.createElement("section");

      section.className =
        "mistake-detail-section";

      const title =
        document.createElement("h4");

      title.className =
        "mistake-detail-title";

      title.textContent = group.title;

      const list =
        document.createElement("ul");

      list.className =
        "mistake-detail-list";

      group.errors.forEach(error => {
        const item =
          document.createElement("li");

        item.className =
          "mistake-detail-item";

        const itemTitle =
          document.createElement("strong");

        itemTitle.textContent = error.label;

        const reason =
          document.createElement("p");

        reason.className =
          "mistake-detail-reason";

        reason.textContent =
          error.reason ??
          "선택한 내용을 다시 확인해 주세요.";

        item.append(itemTitle, reason);

        const hasComparison =
          error.selectedValue !== undefined ||
          error.expectedValue !== undefined;

        if (hasComparison) {
          const comparison =
            document.createElement("p");

          comparison.className =
            "mistake-value-comparison";

          comparison.textContent =
            `내 선택: ${formatValue(error.selectedValue)} · ` +
            `정답: ${formatValue(error.expectedValue)}`;

          item.append(comparison);
        }

        list.append(item);
      });

      section.append(title, list);
      container.append(section);
    });

    return container;
  }

  function createMistakeCard(mistake) {
    const card =
      document.createElement("article");

    const isResolved =
      mistake.status === "resolved";

    card.className = isResolved
      ? "history-card is-correct"
      : "history-card is-wrong";

    const content =
      document.createElement("div");

    const meta =
      document.createElement("div");

    meta.className = "history-meta";

    const badge =
      document.createElement("span");

    badge.className = "status-badge";
    badge.textContent =
      isResolved ? "완료" : "오답";

    const step =
      document.createElement("span");

    step.textContent = getStepName(mistake);

    const reason =
      document.createElement("h3");

    reason.textContent =
      mistake.reason ??
      "다시 확인해 볼 내용이 있어요.";

    const mission =
      document.createElement("p");

    mission.className = "mistake-mission";

    mission.textContent = mistake.mission
      ? `미션: ${mistake.mission}`
      : "";

    meta.append(badge, step);
    content.append(meta, reason);

    if (mistake.mission) {
      content.append(mission);
    }

    const mistakeDetails =
      createMistakeDetails(mistake);

    if (mistakeDetails.children.length > 0) {
      content.append(mistakeDetails);
    }

    const button =
      document.createElement("button");

    button.type = "button";
    button.dataset.mistakeId = mistake.id;

    if (isResolved) {
      button.textContent = "복습 완료";
      button.disabled = true;
    } else {
      button.textContent = "다시 연습";
      button.classList.add("retry-button");
    }

    card.append(content, button);

    return card;
  }

  function renderMistakes() {
    const mistakes =
      SlowKioskStorage
        .getMistakes()
        .sort((first, second) => {
          const firstDate =
            first.lastOccurredAt ??
            first.createdAt;

          const secondDate =
            second.lastOccurredAt ??
            second.createdAt;

          return (
            new Date(secondDate) -
            new Date(firstDate)
          );
        });

    wrongNoteList.replaceChildren();

    if (mistakes.length === 0) {
      const emptyMessage =
        document.createElement("p");

      emptyMessage.className =
        "empty-message";

      emptyMessage.textContent =
        "아직 복습할 오답이 없어요.";

      wrongNoteList.append(emptyMessage);
      return;
    }

    mistakes.forEach(mistake => {
      wrongNoteList.append(
        createMistakeCard(mistake)
      );
    });
  }

  renderMistakes();
})();