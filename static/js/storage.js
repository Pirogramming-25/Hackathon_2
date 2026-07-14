// 오답노트는 로그인 없이 브라우저 localStorage에 저장한다.

(function (global) {
  "use strict";

  const WRONG_NOTE_KEY = "slowKioskWrongNotes";
  const MAX_WRONG_NOTES = 50;

  function normalizeNote(note) {
    return {
      ...note,
      id: note.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      stepId: note.stepId ?? "step1",
      stepTitle: note.stepTitle ?? note.stepId ?? "키오스크 연습",
      reason: note.reason ?? "선택한 내용을 다시 확인해 주세요.",
      details: Array.isArray(note.details)
        ? note.details
        : Array.isArray(note.errors)
          ? note.errors
          : [],
      status: note.status === "resolved" ? "resolved" : "unresolved",
      retryUrl: note.retryUrl ?? `/tutorial/?step=${encodeURIComponent(note.stepId ?? "step1")}`,
      createdAt: note.createdAt ?? new Date().toISOString(),
      date: note.date ?? new Date().toLocaleDateString("ko-KR"),
      attemptCount: Number(note.attemptCount ?? 1)
    };
  }

  function getWrongNotes() {
    try {
      const parsed = JSON.parse(
        localStorage.getItem(WRONG_NOTE_KEY) || "[]"
      );

      return Array.isArray(parsed)
        ? parsed.map(normalizeNote)
        : [];
    } catch (error) {
      console.error("오답노트를 불러오지 못했습니다.", error);
      return [];
    }
  }

  function writeWrongNotes(notes) {
    localStorage.setItem(
      WRONG_NOTE_KEY,
      JSON.stringify(notes.slice(0, MAX_WRONG_NOTES))
    );
  }

  function createRetryUrl(stepId, noteId, retryUrl) {
    const url = new URL(retryUrl || "/tutorial/", location.origin);

    url.searchParams.set("step", stepId);
    url.searchParams.set("mode", "practice");
    url.searchParams.set("retry", noteId);

    return `${url.pathname}${url.search}`;
  }

  function saveWrongNote({
    stepId,
    stepTitle,
    reason,
    retryUrl,
    details = [],
    retryNoteId = null
  }) {
    const notes = getWrongNotes();
    const now = new Date();

    // 오답노트에서 다시 연습하다가 또 틀린 경우 기존 카드를 갱신한다.
    if (retryNoteId) {
      const noteIndex = notes.findIndex(note => note.id === retryNoteId);

      if (noteIndex >= 0) {
        const previous = notes[noteIndex];

        notes[noteIndex] = normalizeNote({
          ...previous,
          stepId,
          stepTitle,
          reason,
          details,
          status: "unresolved",
          date: now.toLocaleDateString("ko-KR"),
          lastAttemptAt: now.toISOString(),
          attemptCount: previous.attemptCount + 1,
          retryUrl: createRetryUrl(stepId, retryNoteId, retryUrl)
        });

        const updated = notes.splice(noteIndex, 1)[0];
        notes.unshift(updated);
        writeWrongNotes(notes);
        return updated;
      }
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const note = normalizeNote({
      id,
      stepId,
      stepTitle,
      reason,
      details,
      status: "unresolved",
      retryUrl: createRetryUrl(stepId, id, retryUrl),
      createdAt: now.toISOString(),
      date: now.toLocaleDateString("ko-KR"),
      attemptCount: 1
    });

    notes.unshift(note);
    writeWrongNotes(notes);

    return note;
  }

  function markWrongNoteResolved(noteId) {
    const notes = getWrongNotes();
    const noteIndex = notes.findIndex(note => note.id === noteId);

    if (noteIndex < 0) {
      return false;
    }

    notes[noteIndex] = {
      ...notes[noteIndex],
      status: "resolved",
      resolvedAt: new Date().toISOString()
    };

    writeWrongNotes(notes);
    return true;
  }

  function getWrongNoteById(noteId) {
    return getWrongNotes().find(note => note.id === noteId) ?? null;
  }

  function clearWrongNotes() {
    localStorage.removeItem(WRONG_NOTE_KEY);
  }

  global.getWrongNotes = getWrongNotes;
  global.saveWrongNote = saveWrongNote;
  global.markWrongNoteResolved = markWrongNoteResolved;
  global.getWrongNoteById = getWrongNoteById;
  global.clearWrongNotes = clearWrongNotes;
})(window);