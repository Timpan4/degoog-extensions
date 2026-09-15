const retrySelector = '.engine-retry-link[data-engine="Google"]';
const checkedRows = new WeakSet();
let shownFor;
let recoverySearch;

function searchKey() {
  // POST searches keep their query in Degoog's history state, not the URL.
  const params = new URLSearchParams(location.search);
  const state = history.state;
  return JSON.stringify([location.pathname, state?.query ?? params.get("q"),
    state?.type ?? params.get("type"), state?.page ?? params.get("page")]);
}

const dialog = document.createElement("dialog");
dialog.id = "google-recovery-dialog";
dialog.setAttribute("aria-label", "Google CAPTCHA recovery");
dialog.innerHTML = '<div class="google-recovery-toolbar"><strong>Google recovery</strong><button type="button" autofocus>Close and keep searching</button></div>';
const frame = document.createElement("iframe");
frame.title = "Shared Google recovery browser";
frame.allow = "fullscreen";
dialog.append(frame);
document.body.append(dialog);
dialog.querySelector("button").addEventListener("click", () => dialog.close());
dialog.addEventListener("close", () => {
  // Disconnect this viewer while preserving the remote Firefox session.
  frame.removeAttribute("src");
});

function openRecovery() {
  if (dialog.open) return;
  recoverySearch = searchKey();
  shownFor = recoverySearch;
  frame.src = `/recovery?embedded=1${document.querySelector(retrySelector) ? "&retry=1" : ""}`;
  dialog.showModal();
}

window.addEventListener("message", event => {
  if (!dialog.open || event.origin !== location.origin || event.source !== frame.contentWindow ||
      event.data?.type !== "degoog-google-recovered") return;
  const retry = recoverySearch === searchKey() ? document.querySelector(retrySelector) : null;
  dialog.close();
  // Reuse Degoog's retry handler, preserving its current query and filters.
  // A repeated CAPTCHA stays visible without reopening this search's dialog.
  retry?.click();
});
window.addEventListener("search-bar-action", event => {
  if (event.detail?.actionId === "timpan4-degoog-extensions-google-recovery-google-recovery") openRecovery();
});
document.addEventListener("click", event => {
  const link = event.target.closest?.("a.google-recovery-link");
  if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  openRecovery();
});

async function inspectGoogleFailure() {
  const retry = document.querySelector(`.engine-stat-row.engine-failed ${retrySelector}`);
  if (!retry) return;
  const row = retry.closest(".engine-stat-row");
  if (!row.querySelector(".google-recovery-link")) {
    const link = document.createElement("a");
    link.className = "google-recovery-link degoog-link";
    link.href = "/recovery";
    link.textContent = "Google recovery";
    row.querySelector(".engine-stat-info").append(link);
  }
  const key = searchKey();
  if (checkedRows.has(row) || shownFor === key) return;
  checkedRows.add(row);
  try {
    const response = await fetch("/recovery/google", { credentials: "same-origin" });
    if (!response.ok) return;
    const state = await response.json();
    // An empty result or timeout is not necessarily a CAPTCHA. Confirm using
    // SearXNG's actual suspension state, independently of translated UI text.
    if (state.captcha && row.isConnected && row.classList.contains("engine-failed") &&
        key === searchKey() && shownFor !== key) openRecovery();
  } catch { /* The manual link remains available if status cannot be checked. */ }
}

inspectGoogleFailure();
new MutationObserver(inspectGoogleFailure).observe(document.body, { childList: true, subtree: true });
