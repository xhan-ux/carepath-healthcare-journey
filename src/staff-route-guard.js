/* Keep the staff console on its own route while the shared patient journey changes.
   The patient and staff browsers share the server journey, but a patient event must
   never navigate the staff device into the patient visit screen. */
(() => {
  const ROLE_KEYS = ["carepath:role:v6", "carepath:role:v2"];
  const LAST_ROUTE_KEY = "carepath:last-staff-route:v1";
  const isStaff = () => {
    try { return ROLE_KEYS.some((key) => sessionStorage.getItem(key) === "staff"); }
    catch { return false; }
  };
  const currentRoute = () => location.hash.replace(/^#\/?/, "") || "services";
  const isPatientVisitRoute = (route) => route === "healthcare/visit" || route.startsWith("healthcare/visit/");

  const rememberStaffRoute = () => {
    if (!isStaff()) return;
    const route = currentRoute();
    if (!isPatientVisitRoute(route) && route !== "services" && route !== "login" && route !== "healthcare/staff") {
      try { sessionStorage.setItem(LAST_ROUTE_KEY, route); } catch {}
    }
    if (route === "staff" || route === "healthcare/staff") {
      try { sessionStorage.setItem(LAST_ROUTE_KEY, "staff"); } catch {}
    }
  };

  const restoreStaffRoute = () => {
    if (!isStaff() || !isPatientVisitRoute(currentRoute())) return;
    /* IMPORTANT: use the real app route. "healthcare/staff" is not a route
       understood by app.js and can fall through to the public services page. */
    history.replaceState(null, "", "#/staff");
  };

  /* Capture-phase + synchronous replaceState means app.js never renders the
     patient route on a staff device, so there is no blank-frame/flicker race. */
  window.addEventListener("hashchange", () => {
    if (isStaff() && isPatientVisitRoute(currentRoute())) restoreStaffRoute();
    else rememberStaffRoute();
  }, true);

  rememberStaffRoute();
  restoreStaffRoute();
})();
