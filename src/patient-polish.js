const CP_ORS_WEB = "https://ors.gov.in/";
const CP_ORS_APP = "https://play.google.com/store/apps/details?id=in.nic.nextgenors";

function cpGuideEnhance(){
  const page=document.querySelector(".guide-page"); if(!page) return;
  const copy=[
    "Open ORS and choose Book Appointment. CarePath does not submit the government appointment request for you.",
    "Enter the mobile number you will use and complete the OTP sent to that number. Keep the phone nearby.",
    "Choose the state, hospital and department/OPD you need. Availability depends on onboarded hospitals.",
    "Review available dates and times, then choose a suitable slot. ORS is the source of truth for availability.",
    "Keep the appointment ID/slip and confirmation message. You will need these details at the hospital."
  ];
  page.querySelectorAll(".guide-row small").forEach((el,i)=>{if(copy[i])el.textContent=copy[i]});
  const actions=page.querySelector(".guide-actions");
  if(actions&&!actions.dataset.cpEnhanced){
    actions.dataset.cpEnhanced="true";
    actions.innerHTML=`<a class="primary-button cp-official-primary" href="${CP_ORS_WEB}" target="_blank" rel="noopener noreferrer">Open official appointment service <span>↗</span></a><div class="cp-official-links"><a class="cp-official-link app" href="${CP_ORS_APP}" target="_blank" rel="noopener noreferrer"><span><strong>NextGen ORS app</strong><small>Official Android app · National Informatics Centre</small></span><b>↗</b></a><div class="cp-official-link"><span><strong>What happens there?</strong><small>Verify mobile → choose hospital & department → choose slot → save confirmation</small></span><b>✓</b></div></div><button class="secondary-button" data-action="already-confirmed" type="button">Already have confirmation?</button>`;
  }
  if(!page.querySelector(".cp-guide-detail")){
    const detail=document.createElement("div"); detail.className="cp-guide-detail";
    detail.innerHTML=`<b>Before you open ORS</b><p>Have your mobile phone ready. If you already have an ABHA ID, you may also be able to use it for identification. CarePath will not ask for or store those credentials.</p><div class="cp-guide-note">You are leaving CarePath for the official government service. Complete the booking there, then return with your appointment confirmation to continue the hospital journey.</div>`;
    page.querySelector(".guide-panel")?.appendChild(detail);
  }
}
function cpPolish(){cpGuideEnhance();const visit=document.querySelector(".visit-page");if(visit){const note=visit.querySelector(".supporting-note");if(note)note.textContent="Appointment ID: DEMO-042 · Synthetic information for a prototype. Staff-side events update this journey in the demo.";}}
const observer=new MutationObserver(()=>queueMicrotask(cpPolish));
const app=document.querySelector("#app"); if(app)observer.observe(app,{childList:true,subtree:true});
window.addEventListener("hashchange",()=>setTimeout(cpPolish,0)); setTimeout(cpPolish,0);
