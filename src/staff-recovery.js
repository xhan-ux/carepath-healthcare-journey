/* Last-resort staff boot recovery for the demo.
   The staff console is a separate experience. If another module clears #app during
   startup or after a shared patient event, re-run the normal route renderer rather
   than leaving the staff device blank. This does not own patient routes. */
(() => {
  const isStaff = () => {
    try {
      return ["carepath:role:v6","carepath:role:v2","carepath:demo-role:v2"].some(k => sessionStorage.getItem(k) === "staff");
    } catch { return false; }
  };
  const route = () => location.hash.replace(/^#\/?/, "") || "services";
  let recovering = false;

  function kick() {
    if (!isStaff() || route() !== "staff" || recovering) return;
    const app = document.querySelector("#app");
    if (!app) return;
    const shell = app.querySelector(".cp-staff-command");
    if (shell && shell.querySelector(".cp-staff-content")) return;
    recovering = true;
    /* Let the already-loaded app/staff modules handle their normal route. */
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    setTimeout(() => { recovering = false; }, 180);
  }

  /* Startup: module evaluation order can race with the first app render. */
  [80, 250, 600, 1200].forEach(ms => setTimeout(kick, ms));

  /* Shared SSE/state updates must never leave staff blank. */
  window.addEventListener("carepath:route-rendered", () => setTimeout(kick, 40));
  window.addEventListener("hashchange", () => setTimeout(kick, 80));
  new MutationObserver(() => {
    if (isStaff() && route() === "staff") {
      const shell = document.querySelector("#app .cp-staff-command");
      if (!shell) setTimeout(kick, 30);
    }
  }).observe(document.body, { childList: true, subtree: true });
})();
