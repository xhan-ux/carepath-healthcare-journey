const serviceJourneys={
  pension:{icon:"₹",eyebrow:"PENSION · START",title:"Need help with a pension service?",em:"Start with the outcome.",body:"CarePath turns a complicated pension process into a small set of understandable steps, then points you to the official service.",steps:[
    ["01","Understand your pension need","Are you applying, checking status, updating details, or completing verification?"],
    ["02","Prepare what you need","Keep your pension or account reference, identity details, and any required certificate ready."],
    ["03","Use the official service","CarePath points you to the appropriate government portal instead of asking you to repeat information here."],
    ["04","Track the next step","Save the reference number and return to CarePath when you need help understanding what happens next."]
  ],cta:"Start pension journey"},
  certificate:{icon:"▤",eyebrow:"CERTIFICATES · START",title:"Need a certificate?",em:"We’ll help you find the right route.",body:"Birth, income, caste, domicile and other certificates can involve different departments. CarePath helps you identify the service before you start filling forms.",steps:[
    ["01","Choose the certificate","Tell us what you need instead of searching through department names."],
    ["02","Check eligibility & documents","See a plain-language checklist of the information normally required."],
    ["03","Open the official service","Continue to the relevant government portal or e-District service."],
    ["04","Save your reference","Keep the application number so you can understand status updates later."]
  ],cta:"Start certificate journey"},
  grievance:{icon:"!",eyebrow:"GRIEVANCE · START",title:"Need to report a problem?",em:"Make the next step clear.",body:"CarePath helps you understand what information to include, where the grievance belongs, and how to keep the tracking reference.",steps:[
    ["01","Describe the problem","Use simple words: what happened, where, and who is affected."],
    ["02","Choose the department","CarePath helps narrow down the public service or authority involved."],
    ["03","Submit through the official channel","Use the appropriate government grievance system to create the real case."],
    ["04","Track the reference","Keep the grievance number and use status updates to know what happens next."]
  ],cta:"Start grievance journey"}
};
const serviceStyle=`
.cp-service-detail{max-width:1160px;margin:30px auto 70px;padding:0 22px}.cp-service-detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start}.cp-service-detail .split-copy{padding:24px 8px}.cp-service-panel{background:#fffdf8;border:1px solid rgba(12,102,107,.14);border-radius:26px;padding:26px;box-shadow:0 20px 55px rgba(18,56,58,.08)}.cp-service-step{display:flex;gap:16px;padding:17px 0;border-bottom:1px solid rgba(12,102,107,.1)}.cp-service-step:last-child{border-bottom:0}.cp-service-step>span{width:36px;height:36px;flex:0 0 36px;border-radius:50%;display:grid;place-items:center;background:#e1f2ee;color:#0c7074;font-weight:900;font-size:12px}.cp-service-step b{display:block;margin-bottom:4px}.cp-service-step small{display:block;color:#617b7d;line-height:1.5}.cp-service-detail .source-card{margin-top:20px}.cp-service-back{display:inline-flex;margin-top:18px;color:#0c666b;font-weight:800;text-decoration:none}.cp-service-access{margin-top:22px;background:#f1f7f5;border-radius:16px;padding:15px}.cp-service-access b{display:block;margin-bottom:5px}.cp-service-access span{font-size:12px;color:#617b7d}
@media(max-width:800px){.cp-service-detail-grid{grid-template-columns:1fr}.cp-service-detail{padding:0 16px}.cp-service-detail .split-copy{padding:12px 0}}
`;
function inject(){if(document.getElementById("cp-service-journeys"))return;const s=document.createElement("style");s.id="cp-service-journeys";s.textContent=serviceStyle;document.head.appendChild(s)}
function go(path){location.hash=`/${path}`}
function render(id){const data=serviceJourneys[id];if(!data)return;inject();document.querySelector("#app").innerHTML=`<header class="topbar"><a class="brand" href="#/services"><span class="brand-mark">+</span>CarePath</a><span class="prototype-chip">SYNTHETIC PUBLIC-SERVICE PROTOTYPE</span><div class="top-actions"><a class="ghost-button" href="#/services">All services</a></div></header><main class="cp-service-detail"><div class="cp-service-detail-grid"><section class="split-copy"><p class="eyebrow">${data.eyebrow}</p><h1>${data.title}<br><em>${data.em}</em></h1><p>${data.body}</p><div class="notice"><b>CarePath is the navigation layer.</b><span>The official government service remains the source of truth. This journey is a synthetic demonstration.</span></div><div class="cp-service-access"><b>Designed for real-world access</b><span>Plain language · mobile-first · clear next steps · no need to understand department names first.</span></div></section><section class="cp-service-panel"><div class="panel-kicker">YOUR JOURNEY</div>${data.steps.map(([n,t,d])=>`<div class="cp-service-step"><span>${n}</span><div><b>${t}</b><small>${d}</small></div></div>`).join("")}<button class="primary-button" data-service-action="${id}" type="button">${data.cta} <span>→</span></button><a class="cp-service-back" href="#/services">← Choose another public service</a></section></div></main>`}
function intercept(e){const card=e.target.closest?.("[data-service]");if(!card)return;const id=card.dataset.service;if(!serviceJourneys[id])return;e.preventDefault();e.stopImmediatePropagation();go(`service/${id}`)}
document.addEventListener("click",intercept,true);
function current(){return location.hash.replace(/^#\/?/,"")}
function renderRoute(){const m=current().match(/^service\/(pension|certificate|grievance)$/);if(m)render(m[1])}
window.addEventListener("hashchange",()=>setTimeout(renderRoute,0));setTimeout(renderRoute,0);
