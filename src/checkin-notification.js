/* Visible staff-side toast when any patient checks in. */
(() => {
  const ROLE_KEY = "carepath:role:v6";
  let lastToastKey = "";

  function show(patient) {
    if (sessionStorage.getItem(ROLE_KEY) !== "staff" || !patient) return;
    const key = `${patient.id}|${patient.updated}|${patient.state}`;
    if (key === lastToastKey) return;
    lastToastKey = key;

    let toast = document.querySelector("#carepath-checkin-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "carepath-checkin-toast";
      toast.setAttribute("role", "status");
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span class="cp-checkin-icon">✓</span><span><b>${patient.name} checked in</b><small>Token ${patient.token} · ${patient.queueAhead ?? 0} patients ahead</small></span>`;
    toast.classList.add("show");
    clearTimeout(window.__carepathCheckinToast);
    window.__carepathCheckinToast = setTimeout(() => toast.classList.remove("show"), 4500);
  }

  window.addEventListener("carepath:patient-checked-in", event => show(event.detail?.patient));
})();
