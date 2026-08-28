/* Demo stability layer.
   IMPORTANT: this file must never hide #app or the login page.
   The staff route is protected by staff-route-guard.js; this layer only
   provides a patient fallback if a renderer leaves the app empty. */
(() => {
  const ROLE_KEYS = ["carepath:role:v6", "carepath:demo-role:v2", "carepath:role:v2"];
  const isPatient = () => ROLE_KEYS.some((key) => {
    try { return sessionStorage.getItem(key) === "patient"; } catch { return false; }
  });
  const route = () => location.hash.replace(/^#\/?/, "") || "services";

  async function patientFallback() {
    if (!isPatient() || !route().startsWith("healthcare/visit")) return;
    const app = document.querySelector("#app");
    if (!app || app.children.length) return;
    try {
      const response = await fetch("/api/state", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      const j = data.journey;
      if (!j?.patient || !j?.visit) return;
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
      app.innerHTML = `<main class="page patient-fallback"><section class="split-page"><section class="split-copy"><p class="eyebrow">YOUR HOSPITAL VISIT</p><h1>${copy[0]}</h1><p>${copy[1]}</p><div class="notice"><b>NEXT</b><span>${copy[2]}</span></div></section><section class="confirmation-card"><p class="eyebrow">CURRENT VISIT</p><h2>${j.patient.name}</h2><p>Token ${j.visit.token} · ${j.appointment?.department || "Orthopaedics"}</p><dl><div><dt>WHERE</dt><dd>${copy[3]}</dd></div><div><dt>STATUS</dt><dd>${String(j.state).replaceAll("_"," ")}</dd></div><div><dt>UPDATED</dt><dd>${j.lastUpdated || "Just now"}</dd></div></dl></section></section></main>`;
    } catch {}
  }

  patientFallback();
  window.addEventListener("hashchange", () => setTimeout(patientFallback, 100));
  window.addEventListener("carepath:route-rendered", () => setTimeout(patientFallback, 100));
})();
