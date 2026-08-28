/* Final demo fix: let the called patient confirm they are on the way,
   and show that signal on the staff device without changing journey state. */
(() => {
  const AUTH_KEY = "carepath:role:v6";
  const isPatient = () => sessionStorage.getItem(AUTH_KEY) === "patient";
  const isStaff = () => sessionStorage.getItem(AUTH_KEY) === "staff";
  const buttonText = button => (button?.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
  let sending = false;
  let lastNotice = "";

  function findOnWayButton() {
    if (!isPatient()) return null;
    return [...document.querySelectorAll("button")].find(button => buttonText(button).includes("i’m on my way") || buttonText(button).includes("i'm on my way")) || null;
  }

  function armPatientButton() {
    const button = findOnWayButton();
    if (!button) return;
    if (button.disabled) button.disabled = false;
    button.dataset.onWayReady = "true";
    button.title = "Tell the staff desk that you are on your way.";
  }

  async function sendOnWay(button) {
    if (sending) return;
    sending = true;
    button.disabled = true;
    const original = button.innerHTML;
    button.innerHTML = "Sending to staff…";
    try {
      const response = await fetch("/api/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "patient", type: "PATIENT_ON_WAY", description: "Ravi is on the way to the consultation room" })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not notify staff.");
      button.innerHTML = "Staff notified ✓";
      setTimeout(() => {
        button.innerHTML = original;
        button.disabled = false;
      }, 2200);
    } catch (error) {
      button.innerHTML = original;
      button.disabled = false;
      const toast = document.querySelector("#toast");
      if (toast) {
        toast.textContent = error.message;
        toast.hidden = false;
        setTimeout(() => { toast.hidden = true; }, 2600);
      }
    } finally {
      sending = false;
    }
  }

  function showStaffNotice(journey) {
    if (!isStaff() || !journey?.events?.length) return;
    const event = journey.events[journey.events.length - 1];
    if (event.type !== "PATIENT_ON_WAY") return;
    const key = `${journey.patient?.id || ""}|${event.at || ""}`;
    if (key === lastNotice) return;
    lastNotice = key;

    let toast = document.querySelector("#carepath-on-way-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "carepath-on-way-toast";
      toast.setAttribute("role", "status");
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span>→</span><span><b>${journey.patient?.name || "Patient"} is on the way</b><small>Token ${journey.visit?.token || "42"} · Room ${journey.room || "202"}</small></span>`;
    toast.classList.add("show");
    clearTimeout(window.__carepathOnWayToast);
    window.__carepathOnWayToast = setTimeout(() => toast.classList.remove("show"), 4500);
  }

  function connectStaff() {
    if (!isStaff() || !window.EventSource || !location.protocol.startsWith("http")) return;
    try {
      const stream = new EventSource("/api/events");
      stream.addEventListener("journey", event => { try { showStaffNotice(JSON.parse(event.data).journey); } catch {} });
      stream.addEventListener("reset", () => { lastNotice = ""; });
    } catch {}
  }

  document.addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button || button.dataset.onWayReady !== "true") return;
    event.preventDefault();
    event.stopImmediatePropagation();
    sendOnWay(button);
  }, true);

  const observer = new MutationObserver(armPatientButton);
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["disabled"] });

  window.addEventListener("DOMContentLoaded", () => { armPatientButton(); connectStaff(); });
  setTimeout(() => { armPatientButton(); connectStaff(); }, 500);
})();
