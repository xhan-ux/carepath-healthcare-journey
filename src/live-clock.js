/* Keep the citizen-facing "Updated" label tied to the device's real clock. */
(() => {
  const formatNow = () => new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date());

  const update = () => {
    const el = document.querySelector(".visit-page .visit-status small");
    if (!el) return;
    const value = `Updated ${formatNow()}`;
    if (el.textContent !== value) el.textContent = value;
  };

  update();
  setInterval(update, 1000);

  const app = document.querySelector("#app");
  if (app) {
    new MutationObserver(() => requestAnimationFrame(update)).observe(app, {
      childList: true,
      subtree: true
    });
  }
})();
