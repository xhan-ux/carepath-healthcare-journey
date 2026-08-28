/* Station-specific staff screens: Registration, Doctor, Lab, Pharmacy. */
(() => {
  const STATION_KEY = "carepath:staff:station:v1";
  const labels = {
    registration: {
      eyebrow: "REGISTRATION DESK",
      title: "Registration & check-in",
      body: "Handle arrival, registration, and the waiting queue.",
      actions: [
        ["context", "Complete the current registration step"],
        ["advance", "Advance queue"],
        ["hold", "Hold / pause patient"]
      ]
    },
    doctor: {
      eyebrow: "DOCTOR DESK",
      title: "Doctor & consultation",
      body: "Call patients, manage rooms, and move consultations forward.",
      actions: [
        ["call", "Call next patient"],
        ["context", "Start / complete consultation"],
        ["room", "Change consultation room"]
      ]
    },
    lab: {
      eyebrow: "LAB DESK",
      title: "Lab & diagnostics",
      body: "See patients waiting for tests and mark the lab step complete.",
      actions: [
        ["context", "Complete lab step"]
      ]
    },
    pharmacy: {
      eyebrow: "PHARMACY DESK",
      title: "Pharmacy & completion",
      body: "Complete medicine collection and close the patient's visit.",
      actions: [
        ["context", "Complete pharmacy step"]
      ]
    }
  };

  function station() { return localStorage.getItem(STATION_KEY) || "registration"; }
  function clickExisting(kind) {
    const shell = document.querySelector(".cp-staff-command");
    if (!shell) return;
    if (kind === "context") shell.querySelector("[data-cp-context]")?.click();
    else shell.querySelector(`[data-cp-staff="${kind}"]`)?.click();
  }

  function renderScreen() {
    const shell = document.querySelector(".cp-staff-command");
    if (!shell) return;
    const host = shell.querySelector(".cp-station-screen");
    if (!host) return;
    const key = station();
    const c = labels[key] || labels.registration;
    const patient = shell.querySelector(".cp-state-card");
    const patientName = patient?.querySelector(".cp-card-title b")?.textContent || "Current patient";
    host.innerHTML = `<article class="cp-station-workspace">
      <div class="cp-station-workspace-head"><div><span>${c.eyebrow}</span><h3>${c.title}</h3><p>${c.body}</p></div><strong>${patientName}</strong></div>
      <div class="cp-station-actions">${c.actions.map(([kind,text]) => `<button type="button" data-station-action="${kind}">${text}<span>→</span></button>`).join("")}</div>
    </article>`;
    host.querySelectorAll("[data-station-action]").forEach(b => b.addEventListener("click", () => clickExisting(b.dataset.stationAction)));
  }

  function install() {
    const shell = document.querySelector(".cp-staff-command");
    if (!shell) return;
    if (!shell.querySelector(".cp-station-screen")) {
      const host = document.createElement("div");
      host.className = "cp-station-screen";
      const content = shell.querySelector(".cp-staff-content");
      if (content) content.insertAdjacentElement("afterbegin", host);
      const old = shell.querySelector(".cp-action-card");
      if (old) old.setAttribute("hidden", "true");
    }
    renderScreen();
  }

  window.addEventListener("storage", e => { if (e.key === STATION_KEY) renderScreen(); });
  const observer = new MutationObserver(() => install());
  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(install, 350);
})();
