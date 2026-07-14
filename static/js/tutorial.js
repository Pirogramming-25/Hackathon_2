// 오답 데이터 저장·조회·삭제

(function () {
  "use strict";

  const STORAGE_KEYS = {
    MISTAKES: "slowKioskMistakes",
    ATTEMPTS: "slowKioskAttempts"
  };

  // 고유 ID 만들기
  function createId(prefix) {
    if (window.crypto && window.crypto.randomUUID) {
      return `${prefix}-${window.crypto.randomUUID()}`;
    }

    return `${prefix}-${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}`;
  }

  // localStorage에서 배열 불러오기
  function loadArray(key) {
    try {
      const savedData = localStorage.getItem(key);

      if (!savedData) {
        return [];
      }

      const parsedData = JSON.parse(savedData);

      return Array.isArray(parsedData) ? parsedData : [];
    } catch (error) {
      console.error(`${key} 데이터를 불러오지 못했습니다.`, error);
      return [];
    }
  }

  // localStorage에 배열 저장하기
  function saveArray(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`${key} 데이터를 저장하지 못했습니다.`, error);
      return false;
    }
  }

  /* =========================
     오답 기록
  ========================= */

  function getMistakes() {
    return loadArray(STORAGE_KEYS.MISTAKES);
  }

  function getMistakeById(id) {
    return getMistakes().find(mistake => mistake.id === id) ?? null;
  }

  function saveMistake(mistakeData) {
    const mistakes = getMistakes();
    const now = new Date().toISOString();

    /*
     같은 미션에서 같은 종류의 미해결 오답이 있으면
     새로 계속 추가하지 않고 발생 횟수만 증가시킨다.
    */
    const existingMistake = mistakes.find(mistake =>
      mistake.missionId === mistakeData.missionId &&
      mistake.mistakeType === mistakeData.mistakeType &&
      mistake.status === "unresolved"
    );

    if (existingMistake) {
      existingMistake.reason = mistakeData.reason;
      existingMistake.selectedValue =
        mistakeData.selectedValue ?? null;
      existingMistake.expectedValue =
        mistakeData.expectedValue ?? null;
      existingMistake.occurrenceCount =
        (existingMistake.occurrenceCount ?? 1) + 1;
      existingMistake.lastOccurredAt = now;

      const saved = saveArray(
        STORAGE_KEYS.MISTAKES,
        mistakes
      );

      return saved ? existingMistake : null;
    }

    const newMistake = {
      id: createId("mistake"),
      missionId: mistakeData.missionId,
      step: mistakeData.step,
      practiceType: mistakeData.practiceType,
      mistakeType: mistakeData.mistakeType,
      mission: mistakeData.mission,
      reason: mistakeData.reason,
      selectedValue: mistakeData.selectedValue ?? null,
      expectedValue: mistakeData.expectedValue ?? null,

      // 다시 연습할 페이지와 항목
      retryPage: mistakeData.retryPage,
      retryAction: mistakeData.retryAction,

      status: "unresolved",
      occurrenceCount: 1,
      createdAt: now,
      lastOccurredAt: now,
      resolvedAt: null
    };

    mistakes.push(newMistake);

    const saved = saveArray(
      STORAGE_KEYS.MISTAKES,
      mistakes
    );

    return saved ? newMistake : null;
  }

  // 다시 연습해서 맞히면 완료 상태로 변경
  function resolveMistake(id) {
    const mistakes = getMistakes();
    const targetMistake = mistakes.find(
      mistake => mistake.id === id
    );

    if (!targetMistake) {
      return false;
    }

    targetMistake.status = "resolved";
    targetMistake.resolvedAt = new Date().toISOString();

    return saveArray(
      STORAGE_KEYS.MISTAKES,
      mistakes
    );
  }

  function deleteMistake(id) {
    const mistakes = getMistakes();
    const remainingMistakes = mistakes.filter(
      mistake => mistake.id !== id
    );

    return saveArray(
      STORAGE_KEYS.MISTAKES,
      remainingMistakes
    );
  }

  function clearMistakes() {
    localStorage.removeItem(STORAGE_KEYS.MISTAKES);
  }

  /* =========================
     실전 학습 이력
  ========================= */

  function getAttempts() {
    return loadArray(STORAGE_KEYS.ATTEMPTS);
  }

  function saveAttempt(attemptData) {
    const attempts = getAttempts();

    const newAttempt = {
      id: createId("attempt"),
      missionId: attemptData.missionId,
      step: attemptData.step,
      practiceType: attemptData.practiceType,

      // 자유 연습인지 구분
      mode: attemptData.mode ?? "mission",

      completed: attemptData.completed ?? true,
      elapsedSeconds: attemptData.elapsedSeconds ?? null,
      mistakeCount: attemptData.mistakeCount ?? 0,
      selfCorrectionCount:
        attemptData.selfCorrectionCount ?? 0,
      hintCount: attemptData.hintCount ?? 0,

      completedAt: new Date().toISOString()
    };

    attempts.push(newAttempt);

    const saved = saveArray(
      STORAGE_KEYS.ATTEMPTS,
      attempts
    );

    return saved ? newAttempt : null;
  }

  function clearAttempts() {
    localStorage.removeItem(STORAGE_KEYS.ATTEMPTS);
  }

  /*
   다른 JS 파일에서 아래와 같이 사용:
   SlowKioskStorage.saveMistake(...)
  */
  window.SlowKioskStorage = {
    getMistakes,
    getMistakeById,
    saveMistake,
    resolveMistake,
    deleteMistake,
    clearMistakes,
    getAttempts,
    saveAttempt,
    clearAttempts
  };
})();