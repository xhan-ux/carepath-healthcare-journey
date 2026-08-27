/* Pension journey polish: use the same visual grammar as Certificate/Grievance journeys. */
(() => {
  const OFFICIAL = "https://services.india.gov.in/service/listing?cat_id=36&ln=en";
  const KEY = "carepath:language:v3";
  const steps = {
    apply: [
      ["Choose the right pension", "Identify the pension or benefit you are trying to get. The exact scheme and eligibility depend on the responsible government department.", "Choose the matching scheme/service on the official portal before filling the real form.", "Scheme or benefit name and basic identity details"],
      ["Check eligibility & documents", "Use the official service requirements as the source of truth and turn them into a short preparation checklist.", "Have identity, address, bank details and scheme-specific proof ready if requested.", "Identity/address proof, bank details, supporting certificate if required"],
      ["Prepare before applying", "Check names, dates, bank details and supporting documents before leaving CarePath.", "Do one final check so you do not have to restart the real application.", "Documents and contact number"],
      ["Apply on the official service", "CarePath hands you to the Government Services Portal. Select the pension service that matches your scheme and state.", "Submit the real application there. CarePath never submits it for you.", "Official portal and application/reference number"],
      ["Save your reference", "Your application/reference number is the key to finding the application again.", "Save it in your phone, on paper, or with a trusted helper.", "Official application/reference number"],
      ["Track & understand the status", "Use the official portal for the live status. CarePath can help you understand what a status or request means.", "Keep the exact status and reference number if you need help with the next route.", "Reference number and latest official status"]
    ],
    track: [
      ["Find your application", "Start with the application/reference number you received when you applied.", "Use the same reference and identity details the official service asks for.", "Application/reference number"],
      ["Open the official pension service", "Use the Government Services Portal pension area to find the correct department/service.", "Do not rely on a third-party status page.", "Reference and registered details"],
      ["Check the current status", "Look for the latest status, date and any request for documents or action.", "Take a screenshot or note the exact status if you need help later.", "Latest official status"],
      ["If something is requested", "A pending or clarification status may mean the department needs information or verification.", "Follow the exact request shown by the official service.", "Only the documents explicitly requested"],
      ["If it is approved", "Check the official instructions for payment or benefit activation and keep the approval details.", "Do not assume a payment date from CarePath; use the official status.", "Approval/reference details"],
      ["If it is rejected or delayed", "Keep the official reason. The next route may be correction, resubmission or an available grievance channel.", "Follow the remedy provided by the responsible authority.", "Official reason and reference number"]
    ],
    update: [
      ["Identify what changed", "Choose the exact detail you need to update so you do not accidentally start a new application.", "Keep the existing pension/account reference ready.", "Existing pension/account reference"],
      ["Check whether online update is available", "The responsible scheme or department decides which details can be changed online.", "Use the official service to confirm the available update route.", "Reference and identity details"],
      ["Prepare the supporting proof", "Some changes need a document or verification. Only use documents requested by the official service.", "Check names and numbers before submitting.", "Updated detail plus supporting proof if requested"],
      ["Update on the official service", "CarePath hands you to the official government route for the real change.", "Submit the update there and save the acknowledgement/reference.", "Official acknowledgement/reference"],
      ["Check verification", "Some updates remain pending until the responsible authority verifies them.", "Follow any official request rather than submitting the same change again.", "Latest official status"],
      ["Confirm the change", "Return to the official record and make sure the updated detail is reflected.", "If it is still wrong, use the official correction or grievance route.", "Updated official record/reference"]
    ],
    verify: [
      ["Read the verification request", "Start with the exact message from the official department. Do not guess what they need.", "Keep the request/reference number visible.", "Official verification message"],
      ["Collect only what was requested", "CarePath helps you make a small checklist from the official request.", "Do not upload unrelated documents.", "Only requested proof/documents"],
      ["Check the details", "Make sure your name, reference and supporting document match the official record.", "Fix obvious errors before submitting the verification response.", "Matching identity/reference details"],
      ["Complete verification officially", "Use the official portal or office route named in the request.", "CarePath does not verify or submit documents for you.", "Official verification route"],
      ["Save the acknowledgement", "Keep the acknowledgement or updated reference after you finish.", "This is what you use to check progress later.", "Verification acknowledgement/reference"],
      ["Check what happens next", "Return to the official status when the authority has processed the verification.", "If the status changes to another request, follow that request exactly.", "Latest official status"]
    ]
  };
  const choices = [
    ["apply", "I want to apply for a pension", "Start a new pension application"],
    ["track", "I already applied", "Find out where the application is"],
    ["update", "I need to update my details", "Change information on an existing benefit"],
    ["verify", "I was asked to complete verification", "Understand what to take or do next"]
  ];
  const esc = v => String(v).replace(/[&<>\"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  const app = () => document.querySelector("#app");
  const lang = () => localStorage.getItem(KEY) || "en";
  const go = p => { location.hash = `/${p}`; };
  let state = { flow: null, index: 0 };
  const pct = i => Math.round(((i + 1) / 6) * 100);
  function start(){
    app().innerHTML = `<main class="page split-page cp-pension-start"><section class="split-copy"><p class="eyebrow">PENSION · CAREPATH</p><h1>What are you<br><em>trying to do?</em></h1><p>Choose the outcome you need. CarePath explains what to prepare, where to go, and what to do next without asking you to know the department first.</p><div class="notice"><b>CarePath is the navigation layer.</b><span>The official government service remains the source of truth. This is a synthetic demonstration.</span></div></section><section class="choice-panel"><div class="panel-kicker">WHAT DO YOU NEED?</div>${choices.map(([id,t,m],i)=>`<button class="choice-row" data-cp-pension-choice="${id}" type="button"><span class="choice-number">${String(i+1).padStart(2,"0")}</span><span><b>${esc(t)}</b><small>${esc(m)}</small></span><span class="choice-arrow">→</span></button>`).join("")}<p class="panel-foot">Choose an option and CarePath will guide the next step.</p></section></main>`;
  }
  function journey(flow, index){
    const s=steps[flow]?.[index]; if(!s) return start();
    state={flow,index};
    const last=index===5;
    app().innerHTML = `<main class="page split-page cp-pension-journey"><section class="split-copy"><p class="eyebrow">PENSION · CAREPATH · STEP ${index+1} OF 6</p><h1>${esc(s[0])}<br><em>One step at a time.</em></h1><p>${esc(s[1])}</p><div class="cp-next-action"><b>NEXT ACTION</b><span>${esc(s[2])}</span></div></section><section class="cp-journey-card"><div class="cp-step-head"><span>${String(index+1).padStart(2,"0")}</span><div><b>${esc(s[0])}</b><p>${esc(s[1])}</p></div></div><div class="cp-divider"></div><div class="cp-field"><b>WHAT YOU NEED NOW</b><span>${esc(s[3])}</span></div><div class="cp-divider"></div><div class="cp-field"><b>WHERE YOU ARE</b><span>Prepare → Official service → Save reference</span></div><div class="cp-progress-head"><span>Journey progress</span><strong>${pct(index)}%</strong></div><div class="cp-progress"><i style="width:${pct(index)}%"></i></div><button class="primary-button" data-cp-pension-next type="button">${last ? "Open official service" : "Next step"}<span>→</span></button>${index>0?`<button class="secondary-button cp-back" data-cp-pension-back type="button">← Back</button>`:""}<button class="cp-exit" data-cp-pension-exit type="button">Exit journey</button></section></main>`;
  }
  function complete(){
    const ref=`CARE-PEN-${state.flow.toUpperCase()}-001`;
    app().innerHTML=`<main class="page split-page cp-pension-complete"><section class="split-copy"><p class="eyebrow">PENSION · CAREPATH · JOURNEY COMPLETE</p><h1>Your next step<br><em>is clear.</em></h1><p>Keep your official reference. CarePath stays beside you as a guide, but the government service remains the source of truth for the real transaction and live status.</p><div class="notice"><b>Official service</b><span>Use the Government Services Portal for the real pension application or status.</span></div></section><section class="cp-journey-card"><div class="cp-complete-mark">✓</div><p class="eyebrow">JOURNEY COMPLETE</p><h2>Ready for the official service.</h2><div class="cp-field"><b>DEMO REFERENCE</b><span class="cp-ref">${ref}</span></div><a class="primary-button cp-link" href="${OFFICIAL}" target="_blank" rel="noopener">Open official service <span>↗</span></a><button class="cp-exit" data-cp-pension-exit type="button">Choose another service</button></section></main>`;
  }
  function route(){
    const p=location.hash.replace(/^#\/?/,"").split("/");
    if(p[0]==="public-service" && p[1]==="pension" && p[2] && p[3]){
      const i=Math.max(0,Math.min(5,Number(p[3])-1)); journey(p[2],i); return true;
    }
    if(p[0]==="public-service" && p[1]==="pension" && p[2]==="complete"){ complete(); return true; }
    return false;
  }
  document.addEventListener("click", e => {
    const card=e.target.closest?.('[data-service="pension"]');
    if(card){ e.preventDefault(); e.stopImmediatePropagation(); start(); go("public-service/pension/start"); return; }
    const choice=e.target.closest?.("[data-cp-pension-choice]");
    if(choice){ e.preventDefault(); state.flow=choice.dataset.cpPensionChoice; go(`public-service/pension/${state.flow}/1`); return; }
    if(e.target.closest?.("[data-cp-pension-next]")){ e.preventDefault(); if(state.index===5) complete(); else go(`public-service/pension/${state.flow}/${state.index+2}`); return; }
    if(e.target.closest?.("[data-cp-pension-back]")){ e.preventDefault(); go(`public-service/pension/${state.flow}/${state.index}`); return; }
    if(e.target.closest?.("[data-cp-pension-exit]")){ e.preventDefault(); go("services"); return; }
  }, true);
  const style=document.createElement("style"); style.textContent=`
    .cp-pension-journey{align-items:center}
    .cp-pension-journey .split-copy{max-width:620px}
    .cp-next-action{display:grid;gap:7px;margin-top:30px;padding:17px 20px;border-left:3px solid var(--teal);background:#edf7f3;color:var(--ink-2);font-size:.82rem}
    .cp-next-action b,.cp-field b{color:var(--teal-dark);font-size:.68rem;letter-spacing:.1em}
    .cp-journey-card{padding:26px 22px;border:1px solid var(--line);border-radius:22px;background:var(--paper);box-shadow:var(--shadow);max-width:520px}
    .cp-step-head{display:flex;gap:14px;align-items:flex-start}
    .cp-step-head>span{display:grid;place-items:center;flex:0 0 36px;height:36px;border-radius:50%;background:var(--mint);color:var(--teal-dark);font-size:.7rem;font-weight:900}
    .cp-step-head b{display:block;font-size:1rem;margin-bottom:5px}.cp-step-head p{margin:0;font-size:.8rem}
    .cp-divider{height:1px;background:var(--line);margin:17px 0}
    .cp-field{display:grid;gap:7px;font-size:.8rem}.cp-field span{color:var(--muted);line-height:1.5}
    .cp-progress-head{display:flex;justify-content:space-between;margin-top:20px;font-size:.68rem;color:var(--muted)}.cp-progress-head strong{color:var(--teal-dark)}
    .cp-progress{height:7px;margin:7px 0 16px;border-radius:99px;background:#dfeae6;overflow:hidden}.cp-progress i{display:block;height:100%;border-radius:inherit;background:var(--teal)}
    .cp-back{margin-top:10px}.cp-exit{display:block;margin:13px 0 0;padding:0;border:0;background:none;color:var(--teal-dark);font-size:.76rem;font-weight:800;text-decoration:underline;cursor:pointer}
    .cp-complete-mark{display:grid;place-items:center;width:46px;height:46px;border-radius:50%;background:var(--teal);color:#fff;font-weight:900;margin-bottom:18px}.cp-journey-card h2{margin:0 0 20px;font-size:1.55rem;letter-spacing:-.045em}.cp-ref{font-weight:900!important;color:var(--teal-dark)!important;letter-spacing:.08em}.cp-link{display:flex!important;text-decoration:none;margin-top:18px}
    @media(max-width:800px){.cp-pension-journey{padding-top:20px}.cp-journey-card{max-width:none}.cp-pension-start{padding-top:20px}}
  `; document.head.appendChild(style);
  window.addEventListener("hashchange",()=>setTimeout(()=>route(),0));
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",()=>setTimeout(()=>route(),0),{once:true});
  else setTimeout(()=>route(),0);
  window.addEventListener("carepath:language-changed",()=>{ if(location.hash.includes("/pension/")) route(); });
})();