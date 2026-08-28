/* Device stability: keep the staff console on its own device route.
   Shared journey events may update the staff data, but must never navigate the
   staff browser into the patient visit route. */
(() => {
  const ROLE_KEY = "carepath:role:v6";
  const getRole = () => { try { return sessionStorage.getItem(ROLE_KEY); } catch { return null; } };
  const getRoute = () => location.hash.replace(/^#\/?/, "") || "services";
  const isStaff = () => getRole() === "staff";
  const isPatientVisit = (r) => r === "healthcare/visit" || r.startsWith("healthcare/visit/");

  function lockStaffRoute() {
    if (!isStaff() || !isPatientVisit(getRoute())) return;
    /* app.js understands #/staff. Do not use #/healthcare/staff. */
    history.replaceState(null, "", "#/staff");
  }

  /* This runs before app.js's normal hashchange handler, so the staff page is
     never rendered as the patient page even for one frame. */
  window.addEventListener("hashchange", lockStaffRoute, true);
  lockStaffRoute();
})();
