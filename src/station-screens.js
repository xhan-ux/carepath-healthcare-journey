/* Station-specific staff screens: Registration, Doctor, Lab, Pharmacy. */
(() => {
  const STATION_KEY = "carepath:staff:station:v1";
  const labels = {
    registration: { eyebrow:"REGISTRATION DESK", title:"Registration & check-in", body:"Handle arrival, registration, and the waiting queue.", actions:[["context","Complete registration"],["advance","Advance queue"],["hold","Hold / pause patient"]] },
    doctor: { eyebrow:"DOCTOR DESK", title:"Doctor & consultation", body:"Call patients, manage rooms, and move consultations forward.", actions:[["call","Call next patient"],["context","Start / complete consultation"],["room","Change consultation room"]] },
    lab: { eyebrow:"LAB DESK", title:"Lab & diagnostics", body:"See patients waiting for tests and mark the lab step complete.", actions:[["context","Complete lab step"]] },
    pharmacy: { eyebrow:"PHARMACY DESK", title:"Pharmacy & completion", body:"Complete medicine collection and close the patient's visit.", actions:[["context","Complete pharmacy step"]] }
  };
  let lastSignature = "";
  const station = () => localStorage.getItem(STATION_KEY) || "registration";
  function existing(kind){ const shell=document.querySelector(".cp-staff-command"); if(!shell)return; const b=kind==="context"?shell.querySelector("[data-cp-context]"):shell.querySelector(`[data-cp-staff="${kind}"]`); if(b)b.click(); }
  function render(){
    const shell=document.querySelector(".cp-staff-command"); if(!shell)return;
    let host=shell.querySelector(".cp-station-screen");
    if(!host){ host=document.createElement("div"); host.className="cp-station-screen"; const content=shell.querySelector(".cp-staff-content"); if(!content)return; content.insertAdjacentElement("afterbegin",host); }
    const key=station(), c=labels[key]||labels.registration;
    const patient=shell.querySelector(".cp-state-card");
    const name=patient?.querySelector(".cp-card-title b")?.textContent||"Current patient";
    const signature=`${key}|${name}`;
    if(signature===lastSignature && host.childElementCount)return;
    lastSignature=signature;
    host.innerHTML=`<article class="cp-station-workspace"><div class="cp-station-workspace-head"><div><span>${c.eyebrow}</span><h3>${c.title}</h3><p>${c.body}</p></div><strong>${name}</strong></div><div class="cp-station-actions">${c.actions.map(([kind,text])=>`<button type="button" data-station-action="${kind}">${text}<span>→</span></button>`).join("")}</div></article>`;
    host.querySelectorAll("[data-station-action]").forEach(b=>b.addEventListener("click",()=>existing(b.dataset.stationAction)));
  }
  window.addEventListener("storage",e=>{if(e.key===STATION_KEY){lastSignature="";render();}});
  document.addEventListener("click",e=>{const b=e.target.closest("[data-cp-station]");if(b){setTimeout(()=>{lastSignature="";render();},0);}});
  setInterval(()=>render(),500);
  setTimeout(render,350);
})();
