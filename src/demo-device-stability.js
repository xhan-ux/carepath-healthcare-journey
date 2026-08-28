/* Device stability: keep the staff console on its own device route.
   This runs after the app modules and uses capture-phase hashchange handling so
   a shared patient event can never briefly render the patient route on staff. */
(() => {
  const ROLE_KEY = "carepath:role:v6";
  const LAST_STAFF_ROUTE = "carepath:last-staff-route:v1";
  const getRole = () => { try { return sessionStorage.getItem(ROLE_KEY); } catch { return null; } };
  const getRoute = () => location.hash.replace(/^#\/?/, "") || "services";
  const isPatientVisit = (r) => r === "healthcare/visit" || r.startsWith("healthcare/visit/");
  const isStaff = () => getRole() === "staff";

  function staffRoute() {
    try {
      const saved = sessionStorage.getItem(LAST_STAFF_ROUTE);
      return saved && !isPatientVisit(saved) ? saved : "healthcare/staff";
    } catch { return "healthcare/staff"; }
  }

  function remember() {
    if (!isStaff()) return;
    const r = getRoute();
    if (r === "healthcare/staff" || r === "staff") {
      try { sessionStorage.setItem(LAST_STAFF_ROUTE, r); } catch {}
    }
  }

  function lockStaffRoute() {
    if (!isStaff() || !isPatientVisit(getRoute())) return;
    const target = staffRoute();
    history.replaceState(null, "", `#/${target}`);
  }

  /* Capture phase runs before the app's normal hashchange renderer. */
  window.addEventListener("hashchange", () => {
    if (isStaff() && isPatientVisit(getRoute())) lockStaffRoute();
    else remember();
  }, true);

  /* Prevent the runtime-recovery layer from interpreting a valid staff shell
     outside #app as a broken blank app. */
  function keepStaffAnchor() {
    if (!isStaff()) return;
    const app = document.querySelector("#app");
    const shell = document.querySelector(".cp-staff-command");
    if (!app || !shell) return;
    if (!app.children.length) {
      const anchor = document.createElement("div");
      anchor.className = "cp-staff-runtime-anchor";
      anchor.setAttribute("aria-hidden", "true");
      anchor.style.cssText = "display:none!important";
      app.appendChild(anchor);
    }
  }

  function sync() {
    if (isStaff()) {
      lockStaffRoute();
      remember();
      keepStaffAnchor();
    }
  }

  sync();
  new MutationObserver(sync).observe(document.body, { childList: true, subtree: true });
})();
