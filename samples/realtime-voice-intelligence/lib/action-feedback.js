// Tap/Enter action feedback: locking an id ignores repeat triggers while the
// action is in flight; actions still pending after LOADING_DELAY_MS surface
// via onPendingChange so the page can show a loading state. Short actions
// never flash a loader.
const LOADING_DELAY_MS = 200;

export function createActionFeedback({ onPendingChange } = {}) {
  const locks = new Map();

  function pendingId() {
    for (const [id, entry] of locks) {
      if (entry.pending) return id;
    }
    return '';
  }

  function notify() {
    if (onPendingChange) onPendingChange(pendingId());
  }

  function lock(id) {
    if (locks.has(id)) return false;
    const entry = { pending: false };
    entry.timer = setTimeout(() => {
      entry.pending = true;
      notify();
    }, LOADING_DELAY_MS);
    locks.set(id, entry);
    return true;
  }

  function unlock(id) {
    const entry = locks.get(id);
    if (!entry) return;
    clearTimeout(entry.timer);
    locks.delete(id);
    // Only unlocks that had shown the loader need to withdraw it.
    if (entry.pending) notify();
  }

  function unlockAll() {
    Array.from(locks.keys()).forEach(unlock);
  }

  return { lock, unlock, unlockAll };
}
