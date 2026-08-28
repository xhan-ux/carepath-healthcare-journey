/* Reliable final demo bridge: one server journey, two screens. */
(() => {
  const ROLE_KEY = "carepath:role:v6";
  const STAFF_KEY = "carepath:staff:patients:v2";
  const LAST_KEY = "carepath:final-sync:last";
  const NOTICE_KEY = "carepath:final-sync:notice";
  const role = () => { try { return sessionStorage.getItem(ROLE_KEY); } catch { return null; } };
  const isStaff = () => role() === "staff";
  const isPatient = () => role() === "patient" && location.hash.includes("/healthcare/visit/");
  let busy = false;

  const key = j => `${j?.patient?.id || ""}|${j?.state || ""}|${j?.room || ""}|${j?.queueAhead ?? ""}|${j?.lastUpdated || ""}`;
  const path = j => String(j?.state || "APPOINTMENT_CONFIRMED").toLowerCase().replaceAll("_", "-");

  function saveStaff(j) {
    try {
      const raw = JSON.parse(localStorage.getItem(STAFF_KEY) || "[]");
      const patients = Array.isArray(raw) && raw.length === 7 ? raw : [
        {id:"DEMO-042",name:"Ravi Kumar",token:"42",state:"APPOINTMENT_CONFIRMED",doctor:"Dr. Mehta",room:"202",queueAhead:null,appointment:"10:30 AM",updated:j.lastUpdated,hold:false},
        {id:"DEMO-043",name:"Priya Shah",token:"43",state:"WAITING",doctor:"Dr. Mehta",room:"204",queueAhead:2,appointment:"10:40 AM",updated:j.lastUpdated,hold:false},
        {id:"DEMO-044",name:"Arjun Mehta",token:"44",state:"WAITING",doctor:"Dr. Mehta",room:"204",queueAhead:3,appointment:"10:50 AM",updated:j.lastUpdated,hold:false},
        {id:"DEMO-045",name:"Neha Rao",token:"45",state:"ARRIVED",doctor:"Dr. Mehta",room:"202",queueAhead:null,appointment:"11:00 AM",updated:j.lastUpdated,hold:false},
        {id:"DEMO-046",name:"Karan Singh",token:"46",state:"CALLED",doctor:"Dr. Mehta",room:"204",queueAhead:0,appointment:"11:10 AM",updated:j.lastUpdated,hold:false},
        {id:"DEMO-047",name:"Ananya Das",token:"47",state:"CONSULTATION",doctor:"Dr. Mehta",room:"204",queueAhead:null,appointment:"11:20 AM",updated:j.lastUpdated,hold:false},
        {id:"DEMO-048",name:"Vikram Patel",token:"48",state:"COMPLETED",doctor:"Dr. Mehta",room:"204",queueAhead:null,appointment:"11:30 AM",updated:j.lastUpdated,hold:false}
      ];
      const i = patients.findIndex(p => p.id === j.patient?.id);
      if (i >= 0) patients[i] = {...patients[i], state:j.state, room:j.room, queueAhead:j.queueAhead, updated:j.lastUpdated};
      localStorage.setItem(STAFF_KEY, JSON.stringify(patients));
    } catch {}
  }

  function showNotice(message) {
    let el = document.querySelector("#carepath-live-notice");
    if (!el) {
      el = document.createElement("div");
      el.id = "carepath-live-notice";
      document.body.appendChild(el);
    }
    el.innerHTML = `<span>✓</span><div><strong>${message}</strong><small>Live journey update</small></div>`;
    el.classList.add("show");
    clearTimeout(window.__carepathNoticeTimer);
    window.__carepathNoticeTimer = setTimeout(() => el.classList.remove("show"), 4500);
  }

  function process(j) {
    if (!j) return;
    const next = key(j);
    const previous = sessionStorage.getItem(LAST_KEY) || "";
    sessionStorage.setItem(LAST_KEY, next);
    if (isStaff()) {
      saveStaff(j);
      if (previous && previous !== next) {
        const oldState = previous.split("|")[1];
        if (j.state === "WAITING" && oldState !== "WAITING") {
          showNotice(`${j.patient?.name || "Patient"} checked in · Token ${j.visit?.token || "42"}`);
        }
      }
      return;
    }
    if (isPatient() && previous && previous !== next) {
      const target = `#/healthcare/visit/${path(j)}`;
      if (location.hash !== target) history.replaceState(null, "", target);
      setTimeout(() => location.reload(), 80);
    }
  }

  async function pull() {
    if (busy || !location.protocol.startsWith("http")) return;
    busy = true;
    try {
      const r = await fetch(`/api/state?sync=${Date.now()}`, {cache:"no-store"});
      if (r.ok) process((await r.json()).journey);
    } catch {} finally { busy = false; }
  }

  function connect() {
    try {
      const stream = new EventSource(`/api/events?sync=${Date.now()}`);
      stream.addEventListener("journey", e => { try { process(JSON.parse(e.data).journey); } catch {} });
      stream.addEventListener("reset", e => { try { process(JSON.parse(e.data).journey); } catch {} });
    } catch {}
  }

  function installSimpleStaffControls() {
    if (!isStaff()) return;
    document.body.classList.add("carepath-simple-staff");
  }

  window.addEventListener("DOMContentLoaded", () => { installSimpleStaffControls(); connect(); pull(); setInterval(pull, 1200); });
  setTimeout(() => { installSimpleStaffControls(); connect(); pull(); }, 500);
})();
