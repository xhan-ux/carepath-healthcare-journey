/* Small staff-side notification when the patient checks in. */
(() => {
  const LIVE_KEY = "carepath:last-live-journey:v1";
  const ROLE_KEY = "carepath:role:v6";

  function show(message) {
    const toast = document.querySelector("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(window.__carepathCheckinToast);
    window.__carepathCheckinToast = setTimeout(() => { toast.hidden = true; }, 3600);
  }

  window.addEventListener("carepath:journey-updated", (event) => {
    if (sessionStorage.getItem(ROLE_KEY) !== "staff") return;
    const journey = event.detail;
    if (!journey) return;

    const previous = sessionStorage.getItem(LIVE_KEY) || "";
    const previousState = previous.split("|")[1] || "";
    if (previousState === "ARRIVED" && journey.state === "WAITING") {
      show("✓ Ravi Kumar checked in · 3 patients ahead");
    }
  });
})();
