/* Functional low-connectivity SMS fallback for the patient journey. */
(() => {
  const KEY = "carepath:sms:v1";
  const copy = {
    en: { kicker:"LOW-CONNECTIVITY OPTION", title:"Get updates by SMS.", body:"Add your mobile number and appointment ID. CarePath will show the same synthetic visit update you would receive by SMS.", mobile:"Mobile number", id:"Appointment ID", send:"Send SMS update", clear:"Clear", sent:"SMS update prepared", demo:"Synthetic demo only — no real message is sent.", keypad:"Keypad" },
    hi: { kicker:"कम कनेक्टिविटी विकल्प", title:"SMS से अपडेट पाएं।", body:"अपना मोबाइल नंबर और अपॉइंटमेंट ID जोड़ें। CarePath वही सिंथेटिक विज़िट अपडेट दिखाएगा जो SMS से मिल सकता है।", mobile:"मोबाइल नंबर", id:"अपॉइंटमेंट ID", send:"SMS अपडेट भेजें", clear:"साफ़ करें", sent:"SMS अपडेट तैयार है", demo:"सिर्फ सिंथेटिक डेमो — कोई वास्तविक संदेश नहीं भेजा जाता।", keypad:"कीपैड" },
    kn: { kicker:"ಕಡಿಮೆ ಸಂಪರ್ಕ ಆಯ್ಕೆ", title:"SMS ಮೂಲಕ ಅಪ್‌ಡೇಟ್ ಪಡೆಯಿರಿ.", body:"ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಮತ್ತು ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ID ಸೇರಿಸಿ. SMS ಮೂಲಕ ಸಿಗುವ ಅದೇ ಸಿಂಥೆಟಿಕ್ ಭೇಟಿ ಅಪ್‌ಡೇಟ್ ಅನ್ನು CarePath ತೋರಿಸುತ್ತದೆ.", mobile:"ಮೊಬೈಲ್ ಸಂಖ್ಯೆ", id:"ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ID", send:"SMS ಅಪ್‌ಡೇಟ್ ಕಳುಹಿಸಿ", clear:"ತೆರವುಗೊಳಿಸಿ", sent:"SMS ಅಪ್‌ಡೇಟ್ ಸಿದ್ಧವಾಗಿದೆ", demo:"ಸಿಂಥೆಟಿಕ್ ಡೆಮೋ ಮಾತ್ರ — ಯಾವುದೇ ನಿಜವಾದ ಸಂದೇಶ ಕಳುಹಿಸಲಾಗುವುದಿಲ್ಲ.", keypad:"ಕೀಪ್ಯಾಡ್" }
  };
  const stateFromRoute = () => location.hash.replace(/^#\/?healthcare\/visit\//,"") || "appointment-confirmed";
  const messageFor = state => ({
    "appointment-confirmed":"CAREPATH: Appointment confirmed. Bring your appointment ID to OPD Block A.", arrived:"CAREPATH: You have arrived. Please complete registration at Counter 3.", waiting:"CAREPATH: Registration complete. Please wait for your turn.", called:"CAREPATH: Your turn. Please go to the consultation room now.", consultation:"CAREPATH: Consultation in progress.", lab:"CAREPATH: Consultation complete. Please complete the lab step.", pharmacy:"CAREPATH: Lab complete. Please go to pharmacy.", completed:"CAREPATH: Your visit is complete."
  }[state] || "CAREPATH: Your visit has been updated.");
  let lang = localStorage.getItem("carepath:language:v3") || "en";
  let keypadOpen = false;
  const css = `.cp-sms-card{margin-top:22px;background:#fffdf8;border:1px solid rgba(12,102,107,.14);border-radius:22px;padding:22px;box-shadow:0 16px 40px rgba(18,56,58,.06)}.cp-sms-card h2{margin:4px 0 8px;font-size:22px}.cp-sms-card p{color:#617b7d;line-height:1.55}.cp-sms-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}.cp-sms-field label{display:block;font-size:12px;font-weight:800;color:#31585a;margin-bottom:6px}.cp-sms-field input{width:100%;min-height:46px;border:1px solid #d7e4e1;border-radius:12px;padding:0 12px;font:inherit;background:#fff}.cp-sms-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.cp-sms-actions button{min-height:44px}.cp-sms-status{margin-top:14px;padding:13px 14px;background:#edf8f5;border-radius:14px}.cp-sms-status strong{display:block;margin-bottom:4px}.cp-sms-status small{color:#617b7d}.cp-sms-keypad{margin-top:12px;padding:12px;background:#f3f8f6;border-radius:16px;display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.cp-sms-keypad button{min-height:42px;border:1px solid #d7e4e1;background:#fff;border-radius:10px;font-weight:800;cursor:pointer}.cp-sms-note{display:block;margin-top:10px;font-size:11px;color:#6b8586}@media(max-width:700px){.cp-sms-grid{grid-template-columns:1fr}.cp-sms-card{padding:18px}}`;
  function ensureStyle(){if(document.getElementById("cp-sms-style"))return;const s=document.createElement("style");s.id="cp-sms-style";s.textContent=css;document.head.appendChild(s)}
  function labels(){return copy[lang]||copy.en}
  function render(){
    const main=document.querySelector("#app main.visit-page");
    if(!main){document.getElementById("cp-sms-card")?.remove();return}
    ensureStyle();
    let card=document.getElementById("cp-sms-card");
    if(!card){card=document.createElement("section");card.id="cp-sms-card";card.className="cp-sms-card";main.appendChild(card)}
    const l=labels(),saved=sessionStorage.getItem(KEY)||"";
    const keypad=keypadOpen?`<div class="cp-sms-keypad" role="group" aria-label="${l.keypad}">${[1,2,3,4,5,6,7,8,9,0].map(n=>`<button type="button" data-key="${n}">${n}</button>`).join("")}<button type="button" data-key="clear">${l.clear}</button><button type="button" data-key="back">←</button></div>`:"";
    const status=card.dataset.status?`<div class="cp-sms-status"><strong>${l.sent}</strong><small>${card.dataset.status}</small></div>`:"";
    card.innerHTML=`<p class="eyebrow">${l.kicker}</p><h2>${l.title}</h2><p>${l.body}</p><div class="cp-sms-grid"><div class="cp-sms-field"><label>${l.mobile}</label><input id="cp-sms-mobile" inputmode="numeric" maxlength="10" value="${saved}" autocomplete="tel"></div><div class="cp-sms-field"><label>${l.id}</label><input id="cp-sms-id" value="DEMO-042" autocomplete="off"></div></div><div class="cp-sms-actions"><button class="secondary-button" type="button" data-sms-keypad>${l.keypad}</button><button class="primary-button" type="button" data-sms-send>${l.send} <span>→</span></button></div>${keypad}${status}<small class="cp-sms-note">${l.demo}</small>`;
  }
  function onClick(e){
    const card=document.getElementById("cp-sms-card"); if(!card)return;
    const keypad=e.target.closest?.("[data-sms-keypad]");
    if(keypad){keypadOpen=!keypadOpen;render();return}
    const key=e.target.closest?.("[data-key]");
    if(key){const input=document.getElementById("cp-sms-mobile");if(!input)return;const value=input.value;if(key.dataset.key==="clear")input.value="";else if(key.dataset.key==="back")input.value=value.slice(0,-1);else if(value.length<10)input.value=value+key.dataset.key;input.focus();return}
    const send=e.target.closest?.("[data-sms-send]");
    if(send){const mobile=document.getElementById("cp-sms-mobile")?.value.trim()||"",id=document.getElementById("cp-sms-id")?.value.trim().toUpperCase()||"";if(!/^\d{10}$/.test(mobile)){card.dataset.status="Enter a valid 10-digit mobile number.";render();return}if(id!=="DEMO-042"){card.dataset.status="For this synthetic demo, use DEMO-042.";render();return}sessionStorage.setItem(KEY,mobile);card.dataset.status=messageFor(stateFromRoute());render()}
  }
  window.addEventListener("carepath:language-changed",e=>{lang=e.detail?.lang||localStorage.getItem("carepath:language:v3")||"en";setTimeout(render,0)});
  window.addEventListener("carepath:route-rendered",()=>setTimeout(render,0));
  window.addEventListener("hashchange",()=>setTimeout(render,0));
  document.addEventListener("click",onClick);
  render();
})();
