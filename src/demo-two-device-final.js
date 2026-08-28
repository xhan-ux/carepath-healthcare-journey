/* Lightweight demo reset control.
   Realtime journey updates remain owned by app.js/staff-view.js.
   This file only restores the visible Start new demo action without reloading. */
(() => {
  const ROLE_KEY = "carepath:role:v6";
  const role = () => { try { return sessionStorage.getItem(ROLE_KEY); } catch { return null; } };
  const isStaff = () => role() === "staff";

  function addResetButton() {
    if (!isStaff()) return;
    const shell = document.querySelector(".cp-staff-command");
    if (!shell || shell.querySelector("[data-demo-reset]")) return;

    const button = document.createElement("button");
    button.type = "button";
    button.dataset.demoReset = "true";
    button.className = "demo-reset-button";
    button.innerHTML = `<span aria-hidden="true">↻</span><span><strong>Start new demo</strong><small>Reset patient + queue</small></span>`;

    button.addEventListener("click", async () => {
      if (button.disabled) return;
      if (!window.confirm("Start a new demo? This resets the patient journey for both devices.")) return;
      button.disabled = true;
      try {
        const response = await fetch("/api/reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: "staff" })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not reset the demo.");

        const journey = data.journey;
        if (journey?.patient?.id === "DEMO-042") {
          try {
            const patients = JSON.parse(localStorage.getItem("carepath:staff:patients:v2") || "[]");
            if (Array.isArray(patients) && patients.length === 7) {
              const i = patients.findIndex(p => p.id === "DEMO-042");
              if (i >= 0) {
                patients[i] = { ...patients[i], state: journey.state, room: journey.room, queueAhead: journey.queueAhead, updated: journey.lastUpdated };
                localStorage.setItem("carepath:staff:patients:v2", JSON.stringify(patients));
              }
            }
          } catch {}
        }

        window.dispatchEvent(new CustomEvent("carepath:demo-reset", { detail: journey }));
      } catch (error) {
        const toast = document.querySelector("#toast");
        if (toast) {
          toast.textContent = error.message || "Could not reset the demo. Try again.";
          toast.hidden = false;
          setTimeout(() => { toast.hidden = true; }, 2600);
        }
      } finally {
        button.disabled = false;
      }
    });

    const top = shell.querySelector(".cp-staff-top");
    if (top) top.insertAdjacentElement("afterend", button);
    else shell.prepend(button);
  }

  const observer = new MutationObserver(addResetButton);
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener("DOMContentLoaded", addResetButton);
  setTimeout(addResetButton, 500);
})();
