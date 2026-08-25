const CP_ORS_WEB = "https://ors.gov.in/";
const CP_ORS_APP = "https://play.google.com/store/apps/details?id=in.nic.nextgenors";

function cpGuideEnhance(){
  const page=document.querySelector(".guide-page"); if(!page||page.dataset.cpPolished) return;
  const copy=["Open ORS and choose Book Appointment. CarePath does not submit the government appointment request for you.","Enter the mobile number you will use and complete the OTP sent to that number. Keep the phone nearby.","Choose the state, hospital and department/OPD you need. Availability depends on onboarded hospitals.","Review available dates and times, then choose a suitable slot. ORS is the source of truth for availability.","Keep the appointment ID/slip and confirmation message. You will need these details at the hospital."];
  page.querySelectorAll(".guide-row small").forEach((el,i)=>{if(copy[i])el.textContent=copy[i]});
  const actions=page.querySelector(".guide-actions");
  if(actions){actions.dataset.cpEnhanced="true";actions.innerHTML=`<a class="primary-button cp-official-primary" href="${CP_ORS_WEB}" target="_blank" rel="noopener noreferrer">Open official appointment service <span>↗</span></a><div class="cp-official-links"><a class="cp-official-link app" href="${CP_ORS_APP}" target="_blank" rel="noopener noreferrer"><span><strong>NextGen ORS app</strong><small>Official Android app · National Informatics Centre</small></span><b>↗</b></a><div class="cp-official-link"><span><strong>What happens there?</strong><small>Verify mobile → choose hospital & department → choose slot → save confirmation</small></span><b>✓</b></div></div><button class="secondary-button" data-action="already-confirmed" type="button">Already have confirmation?</button>`;}
  const detail=document.createElement("div"); detail.className="cp-guide-detail";detail.innerHTML=`<b>Before you open ORS</b><p>Have your mobile phone ready. If you already have an ABHA ID, you may also be able to use it for identification. CarePath will not ask for or store those credentials.</p><div class="cp-guide-note">You are leaving CarePath for the official government service. Complete the booking there, then return with your appointment confirmation to continue the hospital journey.</div>`;page.querySelector(".guide-panel")?.appendChild(detail);page.dataset.cpPolished="true";
}

const CP_VISIT_STEPS=["Appointment","Understand","Right service","How it works","Book appointment","Before your visit","You arrive","Registration","Wait / token","Room change","Your turn","Visit complete"];
function cpVisitIndex(visit){
  const t=(visit.innerText||"").toLowerCase();
  if(t.includes("visit complete")||t.includes("journey complete")||t.includes("medicines"))return 11;
  if(t.includes("consultation")||t.includes("with dr")||t.includes("room 204"))return 10;
  if(t.includes("your turn")||t.includes("called"))return 10;
  if(t.includes("room")&&t.includes("change"))return 9;
  if(t.includes("token")||t.includes("waiting"))return 8;
  if(t.includes("registration complete")||t.includes("register"))return 7;
  if(t.includes("you’re at the hospital")||t.includes("check in")||t.includes("arrived"))return 6;
  if(t.includes("before your visit")||t.includes("appointment saved")||t.includes("appointment confirmed"))return 5;
  return 4;
}
function cpVisitRail(visit){
  if(visit.querySelector(".cp-journey-rail"))return;
  const rail=document.createElement("section");rail.className="cp-journey-rail";
  const active=cpVisitIndex(visit);
  rail.innerHTML=`<div class="cp-journey-rail-head"><span>YOUR JOURNEY</span><b>One clear next step at a time.</b></div><div class="cp-journey-track">${CP_VISIT_STEPS.map((x,i)=>`<div class="cp-journey-step ${i<active?"done ":i===active?"current ":""}"><span>${i<active?"✓":i+1}</span><small>${x}</small></div>`).join("")}</div>`;
  const card=visit.querySelector(".visit-card,.journey-card,article");
  if(card?.parentElement)card.parentElement.insertBefore(rail,card);else visit.prepend(rail);
}
function cpVisitArtifacts(visit){
  if(visit.querySelector(".cp-visit-artifacts"))return;
  const text=(visit.innerText||"").toLowerCase();
  const hasToken=text.includes("token");
  const hasRoom=text.includes("room");
  const complete=text.includes("visit complete")||text.includes("journey complete")||text.includes("medicines");
  const lab=text.includes("lab");
  const wrap=document.createElement("section");wrap.className="cp-visit-artifacts";
  const items=[
    ["APPOINTMENT ID","DEMO-042","Keep this for registration and hospital check-in."],
    ...(hasToken?[["TOKEN","42","Shown only when the hospital has registered you."]]:[]),
    ...(hasRoom?[["ROOM","204","Follow the latest verified room shown by the hospital."]]:[]),
    ...(lab?[["LAB / REPORT","Hospital source","CarePath does not invent results; use the hospital's report or instructions."]]:[]),
    ...(complete?[["VISIT SUMMARY","Available after completion","A concise record of the synthetic journey, not a medical record."]]:[])
  ];
  wrap.innerHTML=`<div class="cp-artifacts-head"><span>YOUR VISIT DETAILS</span><b>Keep the useful things together.</b></div><div class="cp-artifact-grid">${items.map(([k,v,d])=>`<div class="cp-artifact"><span>${k}</span><strong>${v}</strong><small>${d}</small></div>`).join("")}</div>`;
  const rail=visit.querySelector(".cp-journey-rail");
  if(rail?.parentElement)rail.insertAdjacentElement("afterend",wrap);else visit.prepend(wrap);
}
function cpPolish(){
  cpGuideEnhance();
  const visit=document.querySelector(".visit-page");
  if(visit){
    cpVisitRail(visit);
    cpVisitArtifacts(visit);
    const note=visit.querySelector(".supporting-note");
    if(note&&!note.dataset.cpPolished){note.textContent="Appointment ID: DEMO-042 · Synthetic information for a prototype. Staff-side events update this journey in the demo.";note.dataset.cpPolished="true";}
  }
}
const observer=new MutationObserver(()=>queueMicrotask(cpPolish));
const app=document.querySelector("#app");
if(app)observer.observe(app,{childList:true,subtree:true});
window.addEventListener("hashchange",()=>setTimeout(cpPolish,0));
setTimeout(cpPolish,0);
