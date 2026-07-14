(function () {
  "use strict";

  /* =========================
     Step 1: 기본 주문 판별
  ========================= */

  function validateBasicOrder(order, expected) {
    const errors = [];

    if (order.menu !== expected.menu) {
      errors.push({
        mistakeType: "menu",
        reason: "주문할 메뉴를 다시 확인해 주세요.",
        selectedValue: order.menu,
        expectedValue: expected.menu,
        retryAction: "select-menu"
      });
    }

    if (Number(order.quantity) !== Number(expected.quantity)) {
      errors.push({
        mistakeType: "quantity",
        reason: "주문 수량을 다시 확인해 주세요.",
        selectedValue: order.quantity,
        expectedValue: expected.quantity,
        retryAction: "select-quantity"
      });
    }

    if (order.payment !== expected.payment) {
      errors.push({
        mistakeType: "payment",
        reason: "결제 방법을 다시 확인해 주세요.",
        selectedValue: order.payment,
        expectedValue: expected.payment,
        retryAction: "select-payment"
      });
    }

    return {
      isCorrect: errors.length === 0,
      errors
    };
  }

  /* =========================
     Step 2: 옵션 주문 판별
  ========================= */

  function validateOptionOrder(order, expected) {
    const errors = [];

    if (order.menu !== expected.menu) {
      errors.push({
        mistakeType: "menu",
        reason: "주문할 메뉴를 다시 확인해 주세요.",
        selectedValue: order.menu,
        expectedValue: expected.menu,
        retryAction: "select-menu"
      });
    }

    if (order.temperature !== expected.temperature) {
      errors.push({
        mistakeType: "temperature",
        reason: getTemperatureMessage(
          order.temperature,
          expected.temperature
        ),
        selectedValue: order.temperature,
        expectedValue: expected.temperature,
        retryAction: "select-temperature"
      });
    }

    if (order.size !== expected.size) {
      errors.push({
        mistakeType: "size",
        reason: "음료 크기를 다시 확인해 주세요.",
        selectedValue: order.size,
        expectedValue: expected.size,
        retryAction: "select-size"
      });
    }

    if (Number(order.quantity) !== Number(expected.quantity)) {
      errors.push({
        mistakeType: "quantity",
        reason: "주문 수량을 다시 확인해 주세요.",
        selectedValue: order.quantity,
        expectedValue: expected.quantity,
        retryAction: "select-quantity"
      });
    }

    if (order.orderType !== expected.orderType) {
      errors.push({
        mistakeType: "orderType",
        reason: "매장/포장 선택을 다시 확인해 주세요.",
        selectedValue: order.orderType,
        expectedValue: expected.orderType,
        retryAction: "select-order-type"
      });
    }

    return {
      isCorrect: errors.length === 0,
      errors
    };
  }

  // HOT/ICE 안내 문장 만들기
  function getTemperatureMessage(selected, expected) {
    if (!selected) {
      return "HOT 또는 ICE를 선택해 주세요.";
    }

    const selectedText = String(selected).toUpperCase();
    const expectedText = String(expected).toUpperCase();

    return (
      `현재 ${selectedText}이 선택되어 있어요. ` +
      `이번 미션은 ${expectedText} 음료예요. ` +
      `${expectedText}를 선택해 주세요.`
    );
  }

  /* =========================
     쿠폰 판별 함수
  ========================= */
  function validateCouponOrder(order, expected) {
  const errors = [];

  if (order.barcodeScanned !== expected.barcodeScanned) {
    errors.push({
      mistakeType: "couponScan",
      reason: "쿠폰 바코드를 먼저 찍어 주세요.",
      selectedValue: order.barcodeScanned,
      expectedValue: expected.barcodeScanned,
      retryAction: "scan-coupon"
    });
  }

  if (order.selectedCouponId !== expected.selectedCouponId) {
    errors.push({
      mistakeType: "couponSelection",
      reason: "사용할 쿠폰을 다시 확인해 주세요.",
      selectedValue: order.selectedCouponId,
      expectedValue: expected.selectedCouponId,
      retryAction: "select-coupon"
    });
  }

  if (order.couponApplied !== expected.couponApplied) {
    errors.push({
      mistakeType: "couponApply",
      reason: "쿠폰을 적용한 후 결제를 진행해 주세요.",
      selectedValue: order.couponApplied,
      expectedValue: expected.couponApplied,
      retryAction: "apply-coupon"
    });
  }

  if (
    Number(order.discountAmount) !==
    Number(expected.discountAmount)
  ) {
    errors.push({
      mistakeType: "discountConfirm",
      reason: "할인 금액이 적용되었는지 확인해 주세요.",
      selectedValue: order.discountAmount,
      expectedValue: expected.discountAmount,
      retryAction: "confirm-discount"
    });
  }

  if (order.payment !== expected.payment) {
    errors.push({
      mistakeType: "payment",
      reason: "결제 방법을 다시 확인해 주세요.",
      selectedValue: order.payment,
      expectedValue: expected.payment,
      retryAction: "select-payment"
    });
  }

  return {
    isCorrect: errors.length === 0,
    errors
  };
}

  /* =========================
     포인트 판별 함수
  ========================= */

  function validatePointOrder(order, expected) {
  const errors = [];

  if (
    order.phoneNumberEntered !==
    expected.phoneNumberEntered
  ) {
    errors.push({
      mistakeType: "phoneInput",
      reason: "연습용 휴대폰 번호를 입력해 주세요.",
      selectedValue: order.phoneNumberEntered,
      expectedValue: expected.phoneNumberEntered,
      retryAction: "enter-phone-number"
    });
  }

  if (
    order.membershipChecked !==
    expected.membershipChecked
  ) {
    errors.push({
      mistakeType: "membershipCheck",
      reason: "회원 여부를 확인해 주세요.",
      selectedValue: order.membershipChecked,
      expectedValue: expected.membershipChecked,
      retryAction: "check-membership"
    });
  }

  if (order.isMember !== expected.isMember) {
    errors.push({
      mistakeType: "membershipResult",
      reason: "회원 조회 결과를 다시 확인해 주세요.",
      selectedValue: order.isMember,
      expectedValue: expected.isMember,
      retryAction: "check-membership"
    });
  }

  if (order.pointApplied !== expected.pointApplied) {
    errors.push({
      mistakeType: "pointApply",
      reason: expected.isMember
        ? "포인트를 적립한 후 결제를 진행해 주세요."
        : "비회원 안내를 확인해 주세요.",
      selectedValue: order.pointApplied,
      expectedValue: expected.pointApplied,
      retryAction: "apply-point"
    });
  }

  if (
    order.resultConfirmed !==
    expected.resultConfirmed
  ) {
    errors.push({
      mistakeType: "resultConfirm",
      reason: "포인트 적립 결과를 확인해 주세요.",
      selectedValue: order.resultConfirmed,
      expectedValue: expected.resultConfirmed,
      retryAction: "confirm-point-result"
    });
  }

  if (order.payment !== expected.payment) {
    errors.push({
      mistakeType: "payment",
      reason: "결제 방법을 다시 확인해 주세요.",
      selectedValue: order.payment,
      expectedValue: expected.payment,
      retryAction: "select-payment"
    });
  }

  return {
    isCorrect: errors.length === 0,
    errors
  };
}

function validateMission(mission, selection) {
  if (!mission || !selection) {
    return {
      isCorrect: false,
      errors: [
        {
          mistakeType: "mission",
          reason: "미션 정보를 확인할 수 없어요.",
          selectedValue: null,
          expectedValue: null,
          retryAction: null
        }
      ]
    };
  }

  // Step 1은 정해진 흐름을 익히는 단계이므로 판정 없음
  if (mission.judge === "flow") {
    return {
      isCorrect: true,
      errors: []
    };
  }

  const currentOrder = {
    menu: selection.menuId,
    temperature: selection.temp,
    size: selection.size,
    quantity: selection.qty,
    orderType: selection.place
  };

  const expectedOrder = {
    menu: mission.correctMenu,
    temperature: mission.target.temp,
    size: mission.target.size,
    quantity: mission.target.qty,
    orderType: mission.target.place
  };

  const supportedJudges = [
    "strict",
    "real",
    "coupon",
    "point"
  ];

  if (supportedJudges.includes(mission.judge)) {
    return validateOptionOrder(
      currentOrder,
      expectedOrder
    );
  }

  return {
    isCorrect: false,
    errors: [
      {
        mistakeType: "mission",
        reason: "지원하지 않는 미션이에요.",
        selectedValue: mission.judge,
        expectedValue: supportedJudges.join(", "),
        retryAction: null
      }
    ]
  };
}

  window.SlowKioskValidator = {
    validateBasicOrder,
    validateOptionOrder,
    validateCouponOrder,
    validatePointOrder,
    validateMission
  };
})();