const ORS_WEBSITE = "https://ors.gov.in/";
const ORS_APP = "https://play.google.com/store/apps/details?id=in.nic.nextgenors";

const route = () => location.hash.replace(/^#\/?/, "") || "services";
const go = (path) => { location.hash = `/${path}`; };

const extraStyles = `
  .branch-guide-panel{background:#fffdf8;border:1px solid rgba(12,102,107,.14);border-radius:28px;padding:28px;box-shadow:0 24px 60px rgba(18,56,58,.08)}
  .branch-guide-row{display:flex;gap:18px;padding:20px 0;border-bottom:1px solid rgba(12,102,107,.12)}
  .branch-guide-row:last-of-type{border-bottom:0}
  .branch-guide-row>span{width:38px;height:38px;flex:0 0 38px;border-radius:50%;display:grid;place-items:center;background:#0c7b7c;color:#fff;font-weight:800}
  .branch-guide-row b{display:block;font-size:18px;margin-bottom:5px}
  .branch-guide-row small{display:block;color:#5f7a7c;line-height:1.45}
  .branch-link-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}
  .branch-link{display:inline-flex;align-items:center;justify-content:space-between;gap:18px;border:1px solid rgba(12,102,107,.2);border-radius:14px;padding:14px 16px;text-decoration:none;color:#103d40;background:#fff;font-weight:800;min-width:220px}
  .branch-link.primary{background:#0c7b7c;color:#fff;border-color:#0c7b7c}
  .branch-link small{font-weight:600;opacity:.72;display:block;margin-top:2px}
  .branch-choice{display:flex;flex-direction:column;gap:10px;margin-top:22px}
  .branch-choice button{border:1px solid rgba(12,102,107,.18);background:#fff;border-radius:14px;padding:15px 17px;text-align:left;font:inherit;font-weight:800;color:#123f42;cursor:pointer}
  .branch-choice button:hover{border-color:#0c7b7c;transform:translateY(-1px)}
  .branch-back{display:inline-flex;margin-top:18px;color:#0c666b;font-weight:800;text-decoration:none}
`;

function injectStyles(){
  if(document.getElementById("branch-fix-styles")) return;
  const style=document.createElement("style");
  style.id="branch-fix-styles";
  style.textContent=extraStyles;
  document.head.appendChild(style);
}

function shell(eyebrow,title,em,body,panel){
  return `<header class="topbar"><a class="brand" href="#/healthcare"><span class="brand-mark">+</span>CarePath</a><span class="prototype-chip">SYNTHETIC PUBLIC-SERVICE PROTOTYPE</span><div class="top-actions"><button class="icon-button" aria-label="Back to services" data-branch-home>⌂</button></div></header><main class="page split-page"><section class="split-copy"><p class="eyebrow">${eyebrow}</p><h1>${title}<br><em>${em}</em></h1><p>${body}</p><div class="notice"><b>CarePath is a guide, not the government service.</b><span>We explain the next step in plain language and point you to the official service when one is needed.</span></div></section>${panel}</main>`;
}

function testPage(){
  const panel=`<section class="branch-guide-panel"><div class="panel-kicker">TEST / LAB GUIDE</div>
    <div class="branch-guide-row"><span>01</span><div><b>Check what your doctor asked for</b><small>Keep the prescription, test request, or hospital instruction with you.</small></div></div>
    <div class="branch-guide-row"><span>02</span><div><b>Confirm where the test is done</b><small>Use the hospital's lab or diagnostics counter listed on your referral or appointment information.</small></div></div>
    <div class="branch-guide-row"><span>03</span><div><b>Bring the information they need</b><small>Carry your appointment or referral details and any identification the hospital asks for.</small></div></div>
    <div class="branch-guide-row"><span>04</span><div><b>Follow the hospital's instructions</b><small>Some tests need preparation or a specific time. The hospital remains the source of truth.</small></div></div>
    <a class="branch-back" href="#/healthcare">← Back to healthcare</a>
  </section>`;
  return shell("HEALTHCARE · TEST / LAB","Need a test?","We’ll help you find the next step.","CarePath helps you understand what to prepare and where the hospital's diagnostics process fits. It does not replace the hospital's clinical instructions.",panel);
}

function referralPage(){
  const panel=`<section class="branch-guide-panel"><div class="panel-kicker">REFERRAL GUIDE</div>
    <div class="branch-guide-row"><span>01</span><div><b>Keep your referral ready</b><small>Bring the referral or prescription from the doctor who sent you.</small></div></div>
    <div class="branch-guide-row"><span>02</span><div><b>Check the department</b><small>Your referral should indicate the specialty or service you need. If it is unclear, ask the hospital help desk.</small></div></div>
    <div class="branch-guide-row"><span>03</span><div><b>Bring your appointment details</b><small>If the referral already includes an appointment, keep the confirmation with it. Otherwise, follow the hospital's booking process.</small></div></div>
    <div class="branch-guide-row"><span>04</span><div><b>Show the referral when you arrive</b><small>The hospital will confirm the correct counter or department for the next step.</small></div></div>
    <a class="branch-back" href="#/healthcare">← Back to healthcare</a>
  </section>`;
  return shell("HEALTHCARE · REFERRAL","Have a referral?","Let’s make the next step clear.","You do not need to figure out the hospital process alone. CarePath helps you understand what the referral is for and what to carry with you.",panel);
}

function unsurePage(){
  const panel=`<section class="branch-guide-panel"><div class="panel-kicker">HELP ME UNDERSTAND</div><h2>What are you trying to do?</h2><p class="panel-foot">Pick the closest match and we'll take you to the right healthcare path.</p><div class="branch-choice">
    <button data-branch-choice="doctor">I need to see a doctor →</button>
    <button data-branch-choice="appointment">I already have an appointment →</button>
    <button data-branch-choice="test">I need a test / lab →</button>
    <button data-branch-choice="referral">I have a referral →</button>
  </div></section>`;
  return shell("HEALTHCARE · START HERE","Not sure where to start?","That’s okay.","Tell us what you are trying to do. You don't need to know the name of the government service first.",panel);
}

function renderCustom(){
  injectStyles();
  const r=route();
  let html="";
  if(r==="healthcare/guide/test") html=testPage();
  if(r==="healthcare/guide/referral") html=referralPage();
  if(r==="healthcare/guide/unsure") html=unsurePage();
  if(!html) return;
  const app=document.querySelector("#app");
  if(app) app.innerHTML=html;
}

function patchAppointmentGuide(){
  const button=document.querySelector('[data-action="guide-next"]');
  if(!button) return;
  button.textContent="";
  const label=document.createElement("span");
  label.textContent="Open official appointment service";
  const arrow=document.createElement("span");
  arrow.textContent="→";
  button.append(label,arrow);
  button.title="Open the government Online Registration System";

  if(document.querySelector(".ors-external-links")) return;
  const links=document.createElement("div");
  links.className="ors-external-links branch-link-row";
  links.innerHTML=`<a class="branch-link primary" href="${ORS_WEBSITE}" target="_blank" rel="noopener">Government website <span>↗</span></a><a class="branch-link" href="${ORS_APP}" target="_blank" rel="noopener"><span>NextGen ORS app<small>National Informatics Centre</small></span><span>↗</span></a>`;
  button.parentElement?.insertBefore(links,button.nextSibling);
}

function intercept(event){
  const choice=event.target.closest?.("[data-choice]");
  if(choice){
    event.preventDefault();
    event.stopImmediatePropagation();
    const id=choice.dataset.choice;
    if(id==="doctor") go("healthcare/understand");
    else if(id==="appointment") go("healthcare/login");
    else if(id==="test") go("healthcare/guide/test");
    else if(id==="referral") go("healthcare/guide/referral");
    else if(id==="unsure") go("healthcare/guide/unsure");
    return;
  }

  const branchChoice=event.target.closest?.("[data-branch-choice]");
  if(branchChoice){
    event.preventDefault();
    event.stopImmediatePropagation();
    const id=branchChoice.dataset.branchChoice;
    if(id==="doctor") go("healthcare/understand");
    else if(id==="appointment") go("healthcare/login");
    else go(`healthcare/guide/${id}`);
    return;
  }

  const guide=event.target.closest?.('[data-action="guide-next"]');
  if(guide){
    event.preventDefault();
    event.stopImmediatePropagation();
    window.open(ORS_WEBSITE,"_blank","noopener");
    return;
  }
}

document.addEventListener("click",intercept,true);
window.addEventListener("hashchange",()=>setTimeout(()=>{renderCustom();patchAppointmentGuide();},0));
window.addEventListener("DOMContentLoaded",()=>setTimeout(()=>{renderCustom();patchAppointmentGuide();},0));
setTimeout(()=>{renderCustom();patchAppointmentGuide();},0);
