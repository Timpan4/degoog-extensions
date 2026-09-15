function addRecoveryLinks() {
  for (const retry of document.querySelectorAll('.engine-stat-row.engine-failed .engine-retry-link[data-engine="Google"]')) {
    const row = retry.closest(".engine-stat-row");
    if (row.querySelector(".google-recovery-link")) continue;
    const link = document.createElement("a");
    link.className = "google-recovery-link degoog-link";
    link.href = "/recovery";
    link.target = "_blank";
    link.rel = "noopener";
    // Use the engine identity, not a translated error string. The recovery
    // page only releases CAPTCHA suspensions; other errors keep their cooldown.
    link.textContent = "Google recovery";
    row.querySelector(".engine-stat-info").append(link);
  }
}
addRecoveryLinks();
new MutationObserver(addRecoveryLinks).observe(document.body, { childList: true, subtree: true });
