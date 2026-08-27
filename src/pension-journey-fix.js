/* Keep Pension fully actionable even when the legacy service-journey renderer is present. */
(() => {
  const OFFICIAL = "https://services.india.gov.in/service/listing?cat_id=36&ln=en";
  const LANG_KEY = "carepath:language:v3";
  const flows = {
    en: {
      eyebrow: "PENSION · CAREPATH", title: "What are you trying to do?", em: "We’ll build the route with you.",
      body: "Choose the outcome you need. CarePath explains what to prepare, where to go, and what to do next without asking you to know the department first.",
      choices: [
        ["apply", "I want to apply for a pension", "Start a new pension application"],
        ["track", "I already applied", "Find out where the application is"],
        ["update", "I need to update my details", "Change information on an existing benefit"],
        ["verify", "I was asked to complete verification", "Understand what to take or do next"]
      ],
      steps: {
        apply: [
          ["Choose the right pension", "Identify the pension or benefit you are trying to get. The exact scheme and eligibility depend on the responsible government department.", "Choose the matching scheme/service on the official portal before filling the real form.", "Scheme or benefit name and basic identity details"],
          ["Check eligibility & documents", "Use the official service requirements as the source of truth and turn them into a short preparation checklist.", "Have identity, address, bank details and scheme-specific proof ready if requested.", "Identity/address proof, bank details, supporting certificate if required"],
          ["Prepare before applying", "Check names, dates, bank details and supporting documents before leaving CarePath.", "Do one final check so you do not have to restart the real application.", "Documents and contact number"],
          ["Apply on the official service", "CarePath now hands you to the Government Services Portal. Select the pension service that matches your scheme and state.", "Submit the real application there. CarePath never submits it for you.", "Official portal and application/reference number"],
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
      }
    },
    hi: {
      eyebrow: "पेंशन · CAREPATH", title: "आप क्या करना चाहते हैं?", em: "हम आपके साथ रास्ता बनाएँगे।", body: "अपना लक्ष्य चुनें। CarePath बताएगा कि क्या तैयार करना है, कहाँ जाना है और आगे क्या करना है।", choices: [["apply","मैं पेंशन के लिए आवेदन करना चाहता/चाहती हूँ","नया पेंशन आवेदन शुरू करें"],["track","मैं पहले ही आवेदन कर चुका/चुकी हूँ","आवेदन की स्थिति जानें"],["update","मुझे अपनी जानकारी अपडेट करनी है","मौजूदा लाभ की जानकारी बदलें"],["verify","मुझसे सत्यापन पूरा करने को कहा गया है","क्या करना है समझें"]],
      steps: {}
    },
    kn: {
      eyebrow: "ಪಿಂಚಣಿ · CAREPATH", title: "ನೀವು ಏನು ಮಾಡಲು ಬಯಸುತ್ತೀರಿ?", em: "ನಾವು ನಿಮ್ಮೊಂದಿಗೆ ದಾರಿ ತೋರಿಸುತ್ತೇವೆ.", body: "ನಿಮಗೆ ಬೇಕಾದ ಫಲಿತಾಂಶವನ್ನು ಆಯ್ಕೆಮಾಡಿ. CarePath ಏನು ಸಿದ್ಧಪಡಿಸಬೇಕು, ಎಲ್ಲಿಗೆ ಹೋಗಬೇಕು ಮತ್ತು ಮುಂದೆ ಏನು ಮಾಡಬೇಕು ಎಂದು ತೋರಿಸುತ್ತದೆ.", choices: [["apply","ನಾನು ಪಿಂಚಣಿಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಬೇಕು","ಹೊಸ ಪಿಂಚಣಿ ಅರ್ಜಿ ಪ್ರಾರಂಭಿಸಿ"],["track","ನಾನು ಈಗಾಗಲೇ ಅರ್ಜಿ ಸಲ್ಲಿಸಿದ್ದೇನೆ","ಅರ್ಜಿಯ ಸ್ಥಿತಿ ತಿಳಿಯಿರಿ"],["update","ನನ್ನ ವಿವರಗಳನ್ನು ನವೀಕರಿಸಬೇಕು","ಈಗಿರುವ ಪ್ರಯೋಜನದ ವಿವರ ಬದಲಿಸಿ"],["verify","ನಾನು ಪರಿಶೀಲನೆ ಪೂರ್ಣಗೊಳಿಸಬೇಕು","ಮುಂದೆ ಏನು ಮಾಡಬೇಕು ತಿಳಿಯಿರಿ"]],
      steps: {}
    }
  };
  const common = {
    en: { back:"← Back", services:"Choose another service", next:"Next step", official:"Open official service ↗", complete:"JOURNEY COMPLETE", completeTitle:"Your next step is clear.", completeBody:"Keep your official reference. The government service remains the source of truth for the real transaction and live status.", prepare:"WHAT TO HAVE READY", action:"NEXT ACTION", progress:"Journey progress" },
    hi: { back:"← वापस", services:"दूसरी सेवा चुनें", next:"अगला कदम", official:"आधिकारिक सेवा खोलें ↗", complete:"यात्रा पूरी", completeTitle:"आपका अगला कदम साफ़ है।", completeBody:"अपना आधिकारिक संदर्भ सुरक्षित रखें। वास्तविक लेन-देन और लाइव स्थिति के लिए सरकारी सेवा ही सही स्रोत है।", prepare:"क्या तैयार रखें", action:"अगला कदम", progress:"यात्रा की प्रगति" },
    kn: { back:"← ಹಿಂದೆ", services:"ಮತ್ತೊಂದು ಸೇವೆ ಆಯ್ಕೆಮಾಡಿ", next:"ಮುಂದಿನ ಹಂತ", official:"ಅಧಿಕೃತ ಸೇವೆ ತೆರೆಯಿರಿ ↗", complete:"ಪ್ರಯಾಣ ಪೂರ್ಣ", completeTitle:"ಮುಂದಿನ ಹಂತ ಸ್ಪಷ್ಟವಾಗಿದೆ.", completeBody:"ನಿಮ್ಮ ಅಧಿಕೃತ ಉಲ್ಲೇಖವನ್ನು ಸುರಕ್ಷಿತವಾಗಿಡಿ. ನೈಜ ವಹಿವಾಟು ಮತ್ತು ಲೈವ್ ಸ್ಥಿತಿಗೆ ಸರ್ಕಾರಿ ಸೇವೆಯೇ ಮೂಲವಾಗಿದೆ.", prepare:"ಸಿದ್ಧವಾಗಿರಿಸಬೇಕಾದದ್ದು", action:"ಮುಂದಿನ ಹಂತ", progress:"ಪ್ರಯಾಣದ ಪ್ರಗತಿ" }
  };
  const app = () => document.querySelector("#app");
  const lang = () => {
    const l = localStorage.getItem(LANG_KEY) || document.documentElement.lang || "en";
    return ["en","hi","kn"].includes(l) ? l : "en";
  };
  const esc = value => String(value).replace(/[&<>\"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  const go = path => { location.hash = `/${path}`; };
  let current = { flow:null, index:0, complete:false };
  function renderStart(){
    const l = lang(), t = flows[l], c = common[l];
    const choices = t.choices.map(([id,title,meta],i) => `<button class="choice-row" data-pension-choice="${id}" type="button"><span class="choice-number">${String(i+1).padStart(2,"0")}</span><span><b>${esc(title)}</b><small>${esc(meta)}</small></span><span class="choice-arrow">→</span></button>`).join("");
    app().innerHTML = `<main class="page split-page"><section class="split-copy"><p class="eyebrow">${esc(t.eyebrow)}</p><h1>${esc(t.title)}<br><em>${esc(t.em)}</em></h1><p>${esc(t.body)}</p><div class="notice"><b>CarePath is the navigation layer.</b><span>The official government service remains the source of truth. This is a synthetic demonstration.</span></div></section><section class="choice-panel"><div class="panel-kicker">WHAT DO YOU NEED?</div>${choices}<p class="panel-foot">Choose an option and CarePath will guide the next step.</p></section></main>`;
  }
  function renderStep(){
    const l=lang(), t=flows.en, c=common[l], steps=t.steps[current.flow], s=steps[current.index];
    const progress=steps.map((_,i)=>`<span class="${i<=current.index?"active":""}"></span>`).join("");
    const final=current.index===steps.length-1;
    app().innerHTML=`<main class="page split-page"><section class="split-copy"><p class="eyebrow">PENSION · CAREPATH</p><h1>${esc(s[0])}<br><em>${esc(final?"Your next step is clear.":"One step at a time.")}</em></h1><p>${esc(s[1])}</p><div class="notice"><b>${esc(c.action)}</b><span>${esc(s[2])}</span></div></section><section class="choice-panel"><div class="panel-kicker">${esc(c.progress)} · ${current.index+1}/${steps.length}</div><div class="cp-action-progress">${progress}</div><div class="cp-action-step"><span class="cp-action-number">${String(current.index+1).padStart(2,"0")}</span><div><b>${esc(s[0])}</b><p>${esc(s[1])}</p></div></div><div class="cp-action-meta"><b>${esc(c.prepare)}</b><span>${esc(s[3])}</span></div><div class="cp-action-actions">${final?`<a class="primary-button" href="${OFFICIAL}" target="_blank" rel="noopener">${esc(c.official)} <span>↗</span></a><button class="secondary-button" data-pension-complete type="button">${esc(c.next)} <span>→</span></button>`:`<button class="primary-button" data-pension-next type="button">${esc(c.next)} <span>→</span></button>`}<button class="secondary-button" data-pension-back type="button">${esc(c.back)}</button></div><p class="panel-foot">${esc(c.completeBody)}</p></section></main>`;
  }
  function renderComplete(){
    const l=lang(), c=common[l];
    app().innerHTML=`<main class="page confirmation-page"><div class="confirmation-head"><p class="eyebrow">${esc(c.complete)}</p><h1>${esc(c.completeTitle)}</h1><p>${esc(c.completeBody)}</p></div><article class="confirmation-card"><div class="confirmed-mark">✓</div><p class="eyebrow">PENSION · CAREPATH</p><h2>CARE-PEN-001</h2><p>Demo reference — use the official government reference for the real application.</p><a class="primary-button" href="${OFFICIAL}" target="_blank" rel="noopener">${esc(c.official)} <span>↗</span></a><button class="secondary-button" data-pension-services type="button">${esc(c.services)}</button></article></main>`;
  }
  function intercept(event){
    const card=event.target.closest?.('[data-service="pension"]');
    if(card){event.preventDefault();event.stopImmediatePropagation();go("service/pension");return;}
    const choice=event.target.closest?.("[data-pension-choice]");
    if(choice){event.preventDefault();event.stopImmediatePropagation();current={flow:choice.dataset.pensionChoice,index:0,complete:false};renderStep();return;}
    if(event.target.closest?.("[data-pension-next]")){event.preventDefault();event.stopImmediatePropagation();current.index++;renderStep();return;}
    if(event.target.closest?.("[data-pension-complete]")){event.preventDefault();event.stopImmediatePropagation();current.complete=true;renderComplete();return;}
    if(event.target.closest?.("[data-pension-back]")){event.preventDefault();event.stopImmediatePropagation();renderStart();return;}
    if(event.target.closest?.("[data-pension-services]")){event.preventDefault();event.stopImmediatePropagation();go("services");}
  }
  document.addEventListener("click",intercept,true);
  function route(){return location.hash.replace(/^#\/?/,"")||"services";}
  function activate(){ if(route()==="service/pension") setTimeout(renderStart,0); }
  window.addEventListener("hashchange",activate);
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",activate,{once:true}); else activate();
})();