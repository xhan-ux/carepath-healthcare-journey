/* Make every non-healthcare service journey actionable.
   The service cards already route to /service/:id; this file gives the final CTA a real,
   stateful step-through flow instead of leaving it as a dead button. */
(() => {
  const flows = {
    pension: {
      steps: [
        ["Understand your pension need", "Are you applying, checking status, updating details, or completing verification?"],
        ["Prepare what you need", "Keep your pension or account reference, identity details, and any required certificate ready."],
        ["Use the official service", "CarePath points you to the appropriate government portal instead of asking you to repeat information here."],
        ["Track the next step", "Save the reference number and return to CarePath when you need help understanding what happens next."]
      ],
      reference: "CARE-PEN-001"
    },
    certificate: {
      steps: [
        ["Choose the certificate", "Tell us what you need instead of searching through department names."],
        ["Check eligibility & documents", "See a plain-language checklist of the information normally required."],
        ["Open the official service", "Continue to the relevant government portal or e-District service."],
        ["Save your reference", "Keep the application number so you can understand status updates later."]
      ],
      reference: "CARE-CERT-001"
    },
    grievance: {
      steps: [
        ["Describe the problem", "Use simple words: what happened, where, and who is affected."],
        ["Choose the department", "CarePath helps narrow down the public service or authority involved."],
        ["Submit through the official channel", "Use the appropriate government grievance system to create the real case."],
        ["Track the reference", "Keep the grievance number and use status updates to know what happens next."]
      ],
      reference: "CARE-GRV-001"
    }
  };

  const style = `
    .cp-action-page{max-width:1160px;margin:30px auto 70px;padding:0 22px}
    .cp-action-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start}
    .cp-action-copy{padding:24px 8px}
    .cp-action-card{background:#fffdf8;border:1px solid rgba(12,102,107,.14);border-radius:26px;padding:28px;box-shadow:0 20px 55px rgba(18,56,58,.08)}
    .cp-action-progress{display:flex;gap:8px;margin:10px 0 24px}
    .cp-action-progress span{height:5px;flex:1;border-radius:99px;background:#e3eeeb}
    .cp-action-progress span.active{background:#0c8084}
    .cp-action-step{display:flex;gap:16px;align-items:flex-start;padding:8px 0 20px}
    .cp-action-number{width:40px;height:40px;flex:0 0 40px;border-radius:50%;display:grid;place-items:center;background:#e1f2ee;color:#0c7074;font-weight:900;font-size:12px}
    .cp-action-step b{display:block;font-size:18px;margin-bottom:7px}
    .cp-action-step p{margin:0;color:#617b7d;line-height:1.65}
    .cp-action-meta{margin:8px 0 20px;background:#f1f7f5;border-radius:16px;padding:14px 16px}
    .cp-action-meta b{display:block;margin-bottom:4px}
    .cp-action-meta span{font-size:12px;color:#617b7d}
    .cp-action-actions{display:flex;gap:10px;flex-wrap:wrap}
    .cp-action-actions .primary-button,.cp-action-actions .secondary-button{min-height:48px}
    .cp-action-complete{border:1px solid rgba(12,128,132,.18);background:#edf8f5;border-radius:18px;padding:18px;margin-top:18px}
    .cp-action-complete strong{display:block;margin-bottom:6px}
    .cp-action-ref{font-variant-numeric:tabular-nums;letter-spacing:.08em;font-weight:900;color:#0c7074}
    .cp-service-detail .service-card-disabled{cursor:pointer!important;opacity:1!important;filter:none!important}
    @media(max-width:800px){.cp-action-grid{grid-template-columns:1fr}.cp-action-page{padding:0 16px}.cp-action-copy{padding:12px 0}}
  `;

  let injected = false;
  function inject(){
    if(injected) return;
    const s=document.createElement("style");
    s.id="cp-service-action-fix";
    s.textContent=style;
    document.head.appendChild(s);
    injected=true;
  }

  function go(path){ location.hash=`/${path}`; }

  function removeDisabledCards(){
    document.querySelectorAll(".service-card-disabled").forEach(card=>{
      card.classList.remove("service-card-disabled");
      card.removeAttribute("aria-disabled");
    });
  }

  function render(id,index=0,complete=false){
    const flow=flows[id];
    if(!flow) return;
    inject();
    const step=flow.steps[index];
    const progress=flow.steps.map((_,i)=>`<span class="${i<=index?"active":""}"></span>`).join("");
    const done=complete ? `<div class="cp-action-complete"><strong>Track the next step</strong><span>Keep this synthetic reference for the demonstration: <span class="cp-action-ref">${flow.reference}</span></span></div>` : "";
    const final=!complete && index===flow.steps.length-1;
    const action=complete
      ? `<a class="cp-service-back" href="#/services">← Choose another public service</a>`
      : final
        ? `<div class="cp-action-actions"><button class="primary-button" data-service-action-final="${id}" type="button">Use the official service <span>→</span></button><button class="secondary-button" data-service-action-back="${id}" type="button">← Track the next step</button></div>`
        : `<div class="cp-action-actions"><button class="primary-button" data-service-step-next="${id}" data-step="${index}" type="button">Track the next step <span>→</span></button><button class="secondary-button" data-service-action-back="${id}" type="button">← Choose another public service</button></div>`;

    document.querySelector("#app").innerHTML=`<main class="cp-action-page"><div class="cp-action-grid"><section class="cp-action-copy"><p class="eyebrow">YOUR JOURNEY</p><h1>${step ? step[0] : "Track the next step"}<br><em>${complete ? "Your next step is clear." : "One step at a time."}</em></h1><p>${step ? step[1] : "CarePath has prepared the route and the next action."}</p><div class="notice"><b>CarePath is the navigation layer.</b><span>The official government service remains the source of truth. This journey is a synthetic demonstration.</span></div></section><section class="cp-action-card"><div class="panel-kicker">YOUR JOURNEY</div><div class="cp-action-progress" aria-label="Journey progress">${progress}</div>${complete?done:`<div class="cp-action-step"><span class="cp-action-number">${String(index+1).padStart(2,"0")}</span><div><b>${step[0]}</b><p>${step[1]}</p></div></div>`}<div class="cp-action-meta"><b>${final||complete?"Save your reference":"Track the next step"}</b><span>${final||complete?flow.reference:"The next action is ready. No dead ends."}</span></div>${action}</section></div></main>`;
    window.dispatchEvent(new Event("carepath:route-rendered"));
  }

  document.addEventListener("click",event=>{
    const action=event.target.closest?.("[data-service-action]");
    if(action){
      event.preventDefault();
      event.stopImmediatePropagation();
      render(action.dataset.serviceAction,0,false);
      return;
    }
    const next=event.target.closest?.("[data-service-step-next]");
    if(next){
      event.preventDefault();
      event.stopImmediatePropagation();
      const id=next.dataset.serviceStepNext;
      const index=Number(next.dataset.step||0)+1;
      render(id,index,false);
      return;
    }
    const back=event.target.closest?.("[data-service-action-back]");
    if(back){
      event.preventDefault();
      event.stopImmediatePropagation();
      go("service/"+back.dataset.serviceActionBack);
      return;
    }
    const final=event.target.closest?.("[data-service-action-final]");
    if(final){
      event.preventDefault();
      event.stopImmediatePropagation();
      const id=final.dataset.serviceActionFinal;
      const flow=flows[id];
      sessionStorage.setItem(`carepath:service:${id}:reference`,flow.reference);
      render(id,flow.steps.length-1,true);
      return;
    }
  },true);

  window.addEventListener("carepath:route-rendered",removeDisabledCards);
  window.addEventListener("hashchange",()=>setTimeout(removeDisabledCards,0));
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",removeDisabledCards,{once:true});
  else removeDisabledCards();
})();
