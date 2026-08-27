/* Assisted Journey Tracking: a registration desk, caregiver, or family member can check a synthetic patient's current visit using a keypad. */
(() => {
  const copy = {
    en: { kicker:"ASSISTED JOURNEY TRACKING", title:"Helping someone track their visit?", body:"A family member, caregiver, or registration staff member can check a patient's current step here — useful when the patient does not have a smartphone.", mobile:"Patient mobile number", id:"Appointment ID", keypad:"Open keypad", closeKeypad:"Hide keypad", check:"Check journey", clear:"Clear", back:"Back", result:"Journey found", current:"Current step", location:"Location", next:"Next step", demo:"Synthetic demo only — no real patient data or SMS is used.", examples:"Try a synthetic patient", invalid:"We couldn't find that synthetic visit. Check the mobile number and appointment ID.", digits:"Numeric keypad" },
    hi: { kicker:"सहायता से यात्रा ट्रैकिंग", title:"किसी की यात्रा ट्रैक करने में मदद कर रहे हैं?", body:"परिवार का सदस्य, देखभालकर्ता या पंजीकरण स्टाफ यहाँ मरीज का वर्तमान चरण देख सकता है — खासकर जब मरीज के पास स्मार्टफोन न हो।", mobile:"मरीज का मोबाइल नंबर", id:"अपॉइंटमेंट ID", keypad:"कीपैड खोलें", closeKeypad:"कीपैड छिपाएँ", check:"यात्रा देखें", clear:"साफ़ करें", back:"वापस", result:"यात्रा मिल गई", current:"वर्तमान चरण", location:"स्थान", next:"अगला चरण", demo:"सिर्फ सिंथेटिक डेमो — कोई वास्तविक मरीज डेटा या SMS नहीं।", examples:"सिंथेटिक मरीज आज़माएँ", invalid:"यह सिंथेटिक विज़िट नहीं मिली। मोबाइल नंबर और अपॉइंटमेंट ID जाँचें।", digits:"न्यूमेरिक कीपैड" },
    kn: { kicker:"ಸಹಾಯಿತ ಪ್ರಯಾಣ ಟ್ರ್ಯಾಕಿಂಗ್", title:"ಯಾರಾದರೂ ತಮ್ಮ ಭೇಟಿಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಲು ಸಹಾಯ ಮಾಡುತ್ತಿದ್ದೀರಾ?", body:"ಕುಟುಂಬದವರು, ಆರೈಕೆದಾರರು ಅಥವಾ ನೋಂದಣಿ ಸಿಬ್ಬಂದಿ ಇಲ್ಲಿ ರೋಗಿಯ ಪ್ರಸ್ತುತ ಹಂತವನ್ನು ನೋಡಬಹುದು — ವಿಶೇಷವಾಗಿ ರೋಗಿಯ ಬಳಿ ಸ್ಮಾರ್ಟ್‌ಫೋನ್ ಇಲ್ಲದಿದ್ದಾಗ.", mobile:"ರೋಗಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ", id:"ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ID", keypad:"ಕೀಪ್ಯಾಡ್ ತೆರೆಯಿರಿ", closeKeypad:"ಕೀಪ್ಯಾಡ್ ಮರೆಮಾಡಿ", check:"ಪ್ರಯಾಣ ನೋಡಿ", clear:"ತೆರವುಗೊಳಿಸಿ", back:"ಹಿಂದೆ", result:"ಪ್ರಯಾಣ ಕಂಡುಬಂದಿದೆ", current:"ಪ್ರಸ್ತುತ ಹಂತ", location:"ಸ್ಥಳ", next:"ಮುಂದಿನ ಹಂತ", demo:"ಸಿಂಥೆಟಿಕ್ ಡೆಮೋ ಮಾತ್ರ — ಯಾವುದೇ ನಿಜವಾದ ರೋಗಿ ಡೇಟಾ ಅಥವಾ SMS ಬಳಸಲಾಗುವುದಿಲ್ಲ.", examples:"ಸಿಂಥೆಟಿಕ್ ರೋಗಿಯನ್ನು ಪ್ರಯತ್ನಿಸಿ", invalid:"ಈ ಸಿಂಥೆಟಿಕ್ ಭೇಟಿಯನ್ನು ಕಂಡುಹಿಡಿಯಲಾಗಲಿಲ್ಲ. ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಮತ್ತು ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ID ಪರಿಶೀಲಿಸಿ.", digits:"ಸಂಖ್ಯಾ ಕೀಪ್ಯಾಡ್" }
  };

  const patients = {
    "DEMO-042": { mobile:"9000000000", name:"Ravi Kumar", state:"Waiting", location:"Orthopaedics · Room 202", next:"Wait for your turn" },
    "DEMO-043": { mobile:"9000000001", name:"Priya Shah", state:"Waiting", location:"Orthopaedics · Room 204", next:"Wait for your turn" },
    "DEMO-044": { mobile:"9000000002", name:"Arjun Mehta", state:"Waiting", location:"Orthopaedics · Room 204", next:"Wait for your turn" },
    "DEMO-045": { mobile:"9000000003", name:"Neha Rao", state:"Arrived", location:"OPD Block A · Counter 3", next:"Complete registration" },
    "DEMO-046": { mobile:"9000000004", name:"Karan Singh", state:"Called", location:"Orthopaedics · Room 202", next:"Go to Room 202" },
    "DEMO-047": { mobile:"9000000005", name:"Meera Iyer", state:"Consultation", location:"Orthopaedics · Room 204", next:"Complete consultation" },
    "DEMO-048": { mobile:"9000000006", name:"Vikram Rao", state:"Completed", location:"Visit complete", next:"No further step" }
  };

  let lang = localStorage.getItem("carepath:language:v3") || "en";
  let keypadOpen = false;
  let selectedField = "mobile";

  const css = `.cp-sms-card{margin-top:22px;background:#fffdf8;border:1px solid rgba(12,102,107,.14);border-radius:22px;padding:22px;box-shadow:0 16px 40px rgba(18,56,58,.06)}.cp-sms-card h2{margin:4px 0 8px;font-size:22px}.cp-sms-card p{color:#617b7d;line-height:1.55}.cp-sms-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}.cp-sms-field label{display:block;font-size:12px;font-weight:800;color:#31585a;margin-bottom:6px}.cp-sms-field input{width:100%;min-height:46px;border:1px solid #d7e4e1;border-radius:12px;padding:0 12px;font:inherit;background:#fff}.cp-sms-field input:focus{outline:3px solid rgba(231,160,38,.32);border-color:#0c666b}.cp-sms-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.cp-sms-actions button{min-height:44px}.cp-sms-keypad{margin-top:12px;padding:12px;background:#f3f8f6;border-radius:16px;display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.cp-sms-keypad button{min-height:44px;border:1px solid #d7e4e1;background:#fff;border-radius:10px;font-weight:800;cursor:pointer}.cp-sms-keypad button:focus{outline:3px solid rgba(231,160,38,.32)}.cp-sms-examples{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.cp-sms-example{border:1px solid #d7e4e1;background:#fff;border-radius:12px;padding:9px 11px;cursor:pointer;text-align:left}.cp-sms-example strong,.cp-sms-example small{display:block}.cp-sms-example small{color:#617b7d;margin-top:2px}.cp-sms-status{margin-top:16px;padding:15px;border-radius:16px;background:#edf8f5}.cp-sms-status strong{display:block;margin-bottom:4px}.cp-sms-status.error{background:#fff4ed}.cp-sms-result{margin-top:16px;padding:18px;border:1px solid #d7e4e1;border-radius:16px;background:#fff}.cp-sms-result-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.cp-sms-result dl{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:16px 0 0}.cp-sms-result dt{font-size:10px;font-weight:800;letter-spacing:.12em;color:#6b8586}.cp-sms-result dd{margin:4px 0 0;font-weight:700}.cp-sms-note{display:block;margin-top:12px;font-size:11px;color:#6b8586}@media(max-width:700px){.cp-sms-grid{grid-template-columns:1fr}.cp-sms-result dl{grid-template-columns:1fr}.cp-sms-card{padding:18px}}`;

  function labels(){ return copy[lang] || copy.en; }
  function ensureStyle(){ if(document.getElementById("cp-sms-style")) return; const s=document.createElement("style"); s.id="cp-sms-style"; s.textContent=css; document.head.appendChild(s); }
  function currentCard(){ return document.getElementById("cp-sms-card"); }

  function render(){
    const main=document.querySelector("#app main.visit-page");
    if(!main){ currentCard()?.remove(); return; }
    ensureStyle();
    let card=currentCard();
    if(!card){ card=document.createElement("section"); card.id="cp-sms-card"; card.className="cp-sms-card"; main.appendChild(card); }
    const l=labels();
    const status=card.dataset.status||"";
    const result=card.dataset.result?JSON.parse(card.dataset.result):null;
    const keypad=keypadOpen?`<div class="cp-sms-keypad" role="group" aria-label="${l.digits}">${[1,2,3,4,5,6,7,8,9,0].map(n=>`<button type="button" data-key="${n}">${n}</button>`).join("")}<button type="button" data-key="clear">${l.clear}</button><button type="button" data-key="backspace">←</button></div>`:"";
    const resultHtml=result?`<div class="cp-sms-result" aria-live="polite"><div class="cp-sms-result-head"><div><p class="eyebrow">${l.result}</p><h3>${result.name}</h3><small>${result.id}</small></div><strong>${result.state}</strong></div><dl><div><dt>${l.current}</dt><dd>${result.state}</dd></div><div><dt>${l.location}</dt><dd>${result.location}</dd></div><div><dt>${l.next}</dt><dd>${result.next}</dd></div></dl><div class="cp-sms-actions"><button class="secondary-button" type="button" data-sms-reset>${l.back}</button></div></div>`:"";
    card.innerHTML=`<p class="eyebrow">${l.kicker}</p><h2>${l.title}</h2><p>${l.body}</p><div class="cp-sms-grid"><div class="cp-sms-field"><label for="cp-sms-mobile">${l.mobile}</label><input id="cp-sms-mobile" inputmode="numeric" maxlength="10" autocomplete="off" data-field="mobile"></div><div class="cp-sms-field"><label for="cp-sms-id">${l.id}</label><input id="cp-sms-id" value="" autocomplete="off" data-field="id"></div></div><div class="cp-sms-actions"><button class="secondary-button" type="button" data-sms-keypad>${keypadOpen?l.closeKeypad:l.keypad}</button><button class="primary-button" type="button" data-sms-check>${l.check} <span>→</span></button></div>${keypad}${status?`<div class="cp-sms-status ${card.dataset.error?"error":""}" role="status">${status}</div>`:""}${resultHtml}<div class="cp-sms-examples"><strong style="width:100%">${l.examples}</strong>${Object.entries(patients).slice(0,4).map(([id,p])=>`<button class="cp-sms-example" type="button" data-example="${id}"><strong>${p.name}</strong><small>${id} · ${p.state}</small></button>`).join("")}</div><small class="cp-sms-note">${l.demo}</small>`;
  }

  function fillExample(id){
    const p=patients[id]; if(!p)return;
    const card=currentCard();
    document.getElementById("cp-sms-mobile").value=p.mobile;
    document.getElementById("cp-sms-id").value=id;
    card.dataset.status=""; delete card.dataset.error; card.dataset.result=JSON.stringify({...p,id});
    render();
  }

  function check(){
    const card=currentCard();
    const mobile=document.getElementById("cp-sms-mobile")?.value.trim()||"";
    const id=document.getElementById("cp-sms-id")?.value.trim().toUpperCase()||"";
    const p=patients[id];
    delete card.dataset.result; delete card.dataset.error;
    if(!p || p.mobile!==mobile){ card.dataset.status=labels().invalid; card.dataset.error="1"; render(); return; }
    card.dataset.status=""; card.dataset.result=JSON.stringify({...p,id}); render();
  }

  function onClick(e){
    const card=currentCard(); if(!card)return;
    const example=e.target.closest?.("[data-example]");
    if(example){ fillExample(example.dataset.example); return; }
    const toggle=e.target.closest?.("[data-sms-keypad]");
    if(toggle){ keypadOpen=!keypadOpen; render(); return; }
    const reset=e.target.closest?.("[data-sms-reset]");
    if(reset){ delete card.dataset.result; card.dataset.status=""; delete card.dataset.error; render(); return; }
    const checkButton=e.target.closest?.("[data-sms-check]");
    if(checkButton){ check(); return; }
    const key=e.target.closest?.("[data-key]");
    if(key){
      const input=document.getElementById(selectedField==="id"?"cp-sms-id":"cp-sms-mobile");
      if(!input)return;
      if(key.dataset.key==="clear") input.value="";
      else if(key.dataset.key==="backspace") input.value=input.value.slice(0,-1);
      else if(selectedField==="mobile" && input.value.length<10) input.value+=key.dataset.key;
      input.focus();
    }
  }

  document.addEventListener("focusin",e=>{const field=e.target.closest?.("[data-field]");if(field)selectedField=field.dataset.field;});
  document.addEventListener("click",onClick);
  window.addEventListener("carepath:language-changed",e=>{lang=e.detail?.lang||localStorage.getItem("carepath:language:v3")||"en";setTimeout(render,0)});
  window.addEventListener("carepath:route-rendered",()=>setTimeout(render,0));
  window.addEventListener("hashchange",()=>setTimeout(render,0));
  render();
})();
