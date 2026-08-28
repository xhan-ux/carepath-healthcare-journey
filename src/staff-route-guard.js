/* Keep the staff console on its own route while the shared patient journey changes.
   The patient and staff browsers share the server journey, but a patient event must
   never navigate the staff device into the patient visit screen. */
(() => {
  const ROLE_KEYS = ["carepath:role:v6", "carepath:role:v2"];
  const LAST_ROUTE_KEY = "carepath:last-staff-route:v1";
  const isStaff = () => {
    try {
      return ROLE_KEYS.some((key) => sessionStorage.getItem(key) === "staff");
    } catch {
      return false;
    }
  };
  const currentRoute = () => location.hash.replace(/^#\/?/, "") || "services";
  const isPatientVisitRoute = (route) => route === "healthcare/visit" || route.startsWith("healthcare/visit/");
  const rememberStaffRoute = () => {
    if (!isStaff()) return;
    const route = currentRoute();
    if (!isPatientVisitRoute(route) && route !== "services" && route !== "login") {
      try { sessionStorage.setItem(LAST_ROUTE_KEY, route); } catch {}
    }
  };
  const restoreStaffRoute = () => {
    if (!isStaff() || !isPatientVisitRoute(currentRoute())) return;
    let route = "";
    try { route = sessionStorage.getItem(LAST_ROUTE_KEY) || ""; } catch {}
    if (!route || isPatientVisitRoute(route)) route = "healthcare/staff";
    if (currentRoute() !== route) {
      history.replaceState(null, "", `#/${route}`);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
  };

  rememberStaffRoute();
  window.addEventListener("hashchange", () => {
    if (isPatientVisitRoute(currentRoute()) && isStaff()) {
      setTimeout(restoreStaffRoute, 0);
    } else {
      rememberStaffRoute();
    }
  }, true);
  window.addEventListener("carepath:route-rendered", () => {
    if (isStaff() && isPatientVisitRoute(currentRoute())) setTimeout(restoreStaffRoute, 0);
  });
  setTimeout(restoreStaffRoute, 0);
})();
