/* Final demo stability layer.
   Keeps the staff console visually isolated from the patient login route,
   prevents shared journey events from blanking the patient screen, and gives
   the mobile staff controls one consistent visual language. */
(() => {
  const ROLE_KEYS = ["carepath:role:v6", "carepath:demo-role:v2", "carepath:role:v2"];
  const isStaff = () => ROLE_KEYS.some((key) => sessionStorage.getItem(key) === "staff");
  const isPatient = () => ROLE_KEYS.some((key) => sessionStorage.getItem(key) === "patient");
  const route = () => location.hash.replace(/^#\/?/, "") || "services";

  function installStyle() {
    if (document.getElementById("cp-demo-stability-style")) return;
    const style = document.createElement("style");
    style.id = "cp-demo-stability-style";
    style.textContent = `
      /* Staff console: never show the underlying patient login page. */
      body.cp-staff-active .login-page,
      body.cp-staff-active #app:has(.login-page) { display:none !important; }
      body.cp-staff-active .cp-staff-command { display:block !important; }

      /* Consistent, presentation-ready staff controls on small screens. */
      .cp-staff-command .cp-staff-actions{display:grid!important;grid-template-columns:1fr 1fr;gap:10px!important;margin-top:16px!important}
      .cp-staff-command .cp-staff-actions button,
      .cp-staff-command .cp-context-action button{
        box-sizing:border-box!important;
        min-height:52px!important;
        width:100%!important;
        margin:0!important;
        padding:13px 16px!important;
        border-radius:16px!important;
        border:1px solid rgba(12,102,107,.22)!important;
        background:#0c8084!important;
        color:#fff!important;
        font:inherit!important;
        font-weight:700!important;
        line-height:1.2!important;
        box-shadow:none!important;
        text-align:left!important;
      }
      .cp-staff-command .cp-context-action button{font-size:16px!important;min-height:54px!important}
      .cp-staff-command .cp-staff-actions button:nth-child(2),
      .cp-staff-command .cp-staff-actions button:nth-child(4){background:#fff!important;color:#145f63!important}
      .cp-staff-command .cp-staff-actions button:nth-child(3){background:#fff7e3!important;color:#6e5515!important;border-color:rgba(110,85,21,.18)!important}
      .cp-staff-command .cp-staff-actions button.muted{background:#eef4f3!important;color:#537173!important;border-color:rgba(12,102,107,.10)!important}
      .cp-staff-command .cp-staff-actions button span,
      .cp-staff-command .cp-context-action button span{float:right!important;font-weight:800!important}
      @media(max-width:700px){
        .cp-staff-command .cp-staff-actions{grid-template-columns:1fr!important}
        .cp-staff-command .cp-staff-actions button{min-height:54px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function syncStaffChrome() {
    installStyle();
    document.body.classList.toggle("cp-staff-active", isStaff());
    document.body.classList.toggle("cp-patient-active", isPatient());

    if (isStaff()) {
      document.querySelectorAll(".login-page").forEach((el) => { el.style.display = "none"; });
    }
  }

  /* If the shared state event changes the patient's route, do not allow the
     staff browser to become a patient page. The staff console owns that device. */
  function guardStaffRoute() {
    if (!isStaff()) return;
    const r = route();
    if (r.startsWith("healthcare/visit")) {
      const target = sessionStorage.getItem("carepath:last-staff-route:v1") || "healthcare/staff";
      if (r !== target) {
        history.replaceState(null, "", `#/${target}`);
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }
    }
  }

  /* Patient fallback: if a route renderer leaves #app empty after a shared
     event, put a small but complete journey card back on screen. */
  async function patientFallback() {
    if (!isPatient() || !route().startsWith("healthcare/visit")) return;
    const app = document.querySelector("#app");
    if (!app || app.children.length) return;
    try {
      const response = await fetch("/api/state", { cache: "no-store" });
      const data = await response.json();
      const j = data.journey;
      const copy = {
        APPOINTMENT_CONFIRMED:["Your appointment is ready.","When you reach the hospital, we’ll guide you through the next step.","Arrive at the hospital","OPD Block A · Ground Floor"],
        ARRIVED:["Check in first.","Show your appointment ID at Counter 3. You do not need to figure out the rest of the visit yet.","Register at Counter 3","OPD Block A · Ground Floor"],
        WAITING:["You’re checked in.","Your registration is complete. Stay near Orthopaedics and we’ll tell you when the next step changes.","Wait for your turn",`Orthopaedics · Room ${j.room}`],
        CALLED:[`Go to Room ${j.room}.`,`Your token ${j.visit.token} has been called. Head to the room now.`,`Go to Room ${j.room}`,`Orthopaedics · Room ${j.room}`],
        CONSULTATION:["You’re with Dr. Mehta.","Your consultation is in progress. CarePath will show the next official visit step when it ends.","Complete consultation",`Room ${j.room}`],
        LAB:["Go to the lab.","Your consultation is complete. Follow the hospital instruction to the lab.","Complete the lab step","Lab · Ground Floor"],
        PHARMACY:["Collect your medicines.","Your lab step is complete. Go to the pharmacy counter.","Complete pharmacy","Pharmacy · OPD Block B"],
        COMPLETED:["You’re done for today.","Your synthetic visit is complete. There are no further steps today.","Visit completed","City Government Hospital"]
      }[j.state] || ["Your visit is updating.","CarePath is waiting for the latest verified journey state.","Please wait","City Government Hospital"];
      app.innerHTML = `<main class="page patient-fallback"><section class="split-page"><section class="split-copy"><p class="eyebrow">YOUR HOSPITAL VISIT</p><h1>${copy[0]}</h1><p>${copy[1]}</p><div class="notice"><b>NEXT</b><span>${copy[2]}</span></div></section><section class="confirmation-card"><p class="eyebrow">CURRENT VISIT</p><h2>${j.patient.name}</h2><p>Token ${j.visit.token} · ${j.appointment.department}</p><dl><div><dt>WHERE</dt><dd>${copy[3]}</dd></div><div><dt>STATUS</dt><dd>${j.state.replaceAll("_"," ")}</dd></div><div><dt>UPDATED</dt><dd>${j.lastUpdated}</dd></div></dl></section></section></main>`;
    } catch {}
  }

  syncStaffChrome();
  guardStaffRoute();
  patientFallback();
  new MutationObserver(() => { syncStaffChrome(); guardStaffRoute(); patientFallback(); }).observe(document.body,{childList:true,subtree:true});
  window.addEventListener("hashchange",()=>{syncStaffChrome();guardStaffRoute();setTimeout(patientFallback,80);});
  window.addEventListener("carepath:route-rendered",()=>{syncStaffChrome();guardStaffRoute();setTimeout(patientFallback,80);});
})();
