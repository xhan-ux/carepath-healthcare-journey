/* Keep the citizen-facing "Updated" label tied to the device's real clock. */
(() => {
  const formatNow = () => new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date());

  const update = () => {
    const el = document.querySelector("#last-updated");
    if (el) el.textContent = `Updated ${formatNow()}`;
  };

  update();
  setInterval(update, 1000);
  new MutationObserver(update).observe(document.body, { childList: true, subtree: true });
})();
