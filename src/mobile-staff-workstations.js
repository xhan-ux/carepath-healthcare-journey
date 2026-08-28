/* Mobile-only staff workstation presentation layer. Reuses the existing staff DOM/actions and shared journey. */
(() => {
  const KEY = "carepath:staff:station:v1";
  const MOBILE = () => window.matchMedia("(max-width:760px)").matches;
  const labels = {
    registration: { title:"Registration", hint:"Check-in, registration & queue" },
    doctor: { title:"Doctor", hint:"Calling, rooms & consultation" },
    lab: { title:"Lab", hint:"Tests & diagnostics" },
    pharmacy: { title:"Pharmacy", hint:"Medicines & dispensing" }
  };
  let journeyOpen = false;
  let lastRender = "";

  function stateText(shell) {
    return (shell.querySelector(".cp-state-card .cp-staff-stats div:first-child strong")?.textContent || "").trim().toUpperCase();
  }

  function station() { try { return localStorage.getItem(KEY) || "registration"; } catch { return "registration"; } }
  function setStation(value) {
    try { localStorage.setItem(KEY, value); } catch {}
    window.dispatchEvent(new StorageEvent("storage", { key: KEY, newValue: value }));
    lastRender = "";
    render();
  }

  function clickExisting(selector) {
    const button = document.querySelector(`.cp-staff-command ${selector}`);
    if (button && !button.disabled) button.click();
  }

  function contextActionFor(state, key) {
    if (key === "registration") {
      if (state === "APPOINTMENT CONFIRMED") return ["Check in patient", "[data-cp-context]"];
      if (state === "ARRIVED") return ["Complete registration", "[data-cp-context]"];
      if (state === "WAITING") return ["Advance queue", "[data-cp-context]"];
      return ["Registration complete", null];
    }
    if (key === "doctor") {
      if (state === "WAITING") return ["Call next patient", '[data-cp-staff="call"]'];
      if (state === "CALLED") return ["Start consultation", "[data-cp-context]"];
      if (state === "CONSULTATION") return ["Complete consultation", "[data-cp-context]"];
      return ["Doctor step not ready", null];
    }
    if (key === "lab") {
      return state === "LAB" ? ["Complete lab step", "[data-cp-context]"] : ["Lab step not ready", null];
    }
    if (key === "pharmacy") {
      return state === "PHARMACY" ? ["Complete pharmacy", "[data-cp-context]"] : ["Pharmacy step not ready", null];
    }
    return ["Continue", null];
  }

  function ensureSelector(shell) {
    let wrap = shell.querySelector(".cp-mobile-workstation-selector");
    if (!wrap) {
      wrap = document.createElement("section");
      wrap.className = "cp-mobile-workstation-selector";
      const top = shell.querySelector(".cp-staff-top");
      if (!top) return null;
      top.insertAdjacentElement("afterend", wrap);
    }
    const active = station();
    wrap.innerHTML = `<div class="cp-mobile-workstation-head"><div><span>WORKSTATION</span><b>${labels[active].title}</b></div><small>Same patient journey across every desk</small></div><div class="cp-mobile-workstation-tabs">${Object.entries(labels).map(([id,c]) => `<button type="button" class="${id===active?"active":""}" data-mobile-station="${id}"><strong>${c.title}</strong><span>${c.hint}</span></button>`).join("")}</div>`;
    wrap.querySelectorAll("[data-mobile-station]").forEach(b => b.addEventListener("click", () => setStation(b.dataset.mobileStation)));
    return wrap;
  }

  function renderWorkspace(shell) {
    let host = shell.querySelector(".cp-station-screen");
    if (!host) return;
    const key = station();
    const state = stateText(shell);
    const [primary, selector] = contextActionFor(state, key);
    const secondary = key === "registration" ? [["Advance queue", '[data-cp-staff="advance"]'],["Hold / pause", '[data-cp-staff="hold"]']] : key === "doctor" ? [["Change room", '[data-cp-staff="room"]']] : [];
    const signature = `${key}|${state}|${primary}|${journeyOpen}`;
    if (signature === lastRender) return;
    lastRender = signature;
    host.innerHTML = `<article class="cp-mobile-station-workspace"><div class="cp-mobile-station-eyebrow">${labels[key].title.toUpperCase()} DESK</div><div class="cp-mobile-station-title"><b>${primary}</b><span>${state || "Current journey state"}</span></div>${selector ? `<button class="cp-mobile-primary" type="button" data-mobile-primary>${primary}<span>→</span></button>` : `<div class="cp-mobile-unavailable">${primary}</div>`}${secondary.length ? `<div class="cp-mobile-secondary-actions">${secondary.map(([text,sel]) => `<button type="button" data-mobile-secondary="${sel}">${text}<span>→</span></button>`).join("")}</div>` : ""}<div class="cp-mobile-station-note">Actions here use the existing shared patient journey.</div></article>`;
    host.querySelector("[data-mobile-primary]")?.addEventListener("click", () => clickExisting(selector));
    host.querySelectorAll("[data-mobile-secondary]").forEach(b => b.addEventListener("click", () => clickExisting(b.dataset.mobileSecondary)));
  }

  function compactJourney(shell) {
    const section = shell.querySelector(".cp-staff-journey");
    const rail = section?.querySelector(".cp-staff-rail");
    if (!section || !rail) return;
    let toggle = section.querySelector(".cp-mobile-journey-toggle");
    const steps = [...rail.children];
    const current = steps.findIndex(x => x.classList.contains("current"));
    const index = current >= 0 ? current : Math.max(0, steps.findIndex(x => x.classList.contains("done")));
    const currentLabel = steps[index]?.querySelector("small")?.textContent || "Current step";
    const nextLabel = steps[index + 1]?.querySelector("small")?.textContent || "Complete";
    if (!toggle) {
      toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "cp-mobile-journey-toggle";
      section.querySelector(".cp-card-title")?.insertAdjacentElement("afterend", toggle);
      toggle.addEventListener("click", () => { journeyOpen = !journeyOpen; lastRender = ""; render(); });
    }
    toggle.innerHTML = `<span>Journey progress</span><b>${index + 1} / ${steps.length}</b><small>${currentLabel}${nextLabel ? ` · Next: ${nextLabel}` : ""}</small><i>${journeyOpen ? "⌃" : "⌄"}</i>`;
    rail.hidden = !journeyOpen;
  }

  function render() {
    if (!MOBILE()) return;
    const shell = document.querySelector(".cp-staff-command");
    if (!shell) return;
    ensureSelector(shell);
    renderWorkspace(shell);
    compactJourney(shell);
  }

  const observer = new MutationObserver(() => { if (MOBILE()) render(); });
  observer.observe(document.body, { childList:true, subtree:true });
  window.addEventListener("resize", () => render(), { passive:true });
  window.addEventListener("storage", e => { if (e.key === KEY) { lastRender = ""; render(); } });
  setTimeout(render, 400);
  setInterval(render, 350);
})();
