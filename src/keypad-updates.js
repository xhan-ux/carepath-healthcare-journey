/* Assisted low-connectivity updates: a helper/staff member enrolls a keypad phone to receive each synthetic journey step. */
(() => {
  const KEY = "carepath:keypad-updates:v1";
  const LANG_KEY = "carepath:language:v3";
  const copy = {
    en: {
      link: "Set up keypad-phone updates",
      kicker: "LOW-CONNECTIVITY · KEYPAD PHONE",
      title: "Keep someone updated without a smartphone.",
      body: "A family member, caregiver or registration staff can enter the patient's mobile number and appointment ID. The keypad phone then receives the journey one step at a time.",
      mobile: "Patient mobile number",
      id: "Appointment ID",
      keypad: "Open keypad",
      clear: "Clear",
      backspace: "←",
      start: "Start journey updates",
      demo: "Synthetic demo only — no real SMS is sent.",
      phone: "KEYPAD PHONE",
      waiting: "Waiting for the next update",
      registered: "Updates are active",
      current: "CURRENT UPDATE",
      next: "Next journey step",
      back: "← Back to visit login",
      invalidMobile: "Enter a valid 10-digit mobile number.",
      invalidId: "For this demo, use appointment ID DEMO-042.",
      active: "Updates active for",
      noUpdate: "The phone will show the next update as the synthetic journey advances."
    },
    hi: {
      link: "कीपैड फोन अपडेट सेट करें",
      kicker: "कम कनेक्टिविटी · कीपैड फोन",
      title: "स्मार्टफोन के बिना भी किसी को अपडेट रखें।",
      body: "परिवार का सदस्य, देखभाल करने वाला या रजिस्ट्रेशन स्टाफ मरीज का मोबाइल नंबर और अपॉइंटमेंट ID दर्ज कर सकता है। कीपैड फोन पर यात्रा का हर चरण एक-एक करके दिखेगा।",
      mobile: "मरीज का मोबाइल नंबर",
      id: "अपॉइंटमेंट ID",
      keypad: "कीपैड खोलें",
      clear: "साफ़ करें",
      backspace: "←",
      start: "यात्रा अपडेट शुरू करें",
      demo: "सिर्फ सिंथेटिक डेमो — कोई वास्तविक SMS नहीं भेजा जाता।",
      phone: "कीपैड फोन",
      waiting: "अगले अपडेट का इंतज़ार",
      registered: "अपडेट सक्रिय हैं",
      current: "वर्तमान अपडेट",
      next: "अगला यात्रा चरण",
      back: "← विज़िट लॉगिन पर वापस जाएं",
      invalidMobile: "10 अंकों का मोबाइल नंबर दर्ज करें।",
      invalidId: "इस डेमो में DEMO-042 इस्तेमाल करें।",
      active: "अपडेट सक्रिय हैं",
      noUpdate: "सिंथेटिक यात्रा आगे बढ़ने पर फोन अगला अपडेट दिखाएगा।"
    },
    kn: {
      link: "ಕೀಪ್ಯಾಡ್ ಫೋನ್ ಅಪ್‌ಡೇಟ್‌ಗಳನ್ನು ಹೊಂದಿಸಿ",
      kicker: "ಕಡಿಮೆ ಸಂಪರ್ಕ · ಕೀಪ್ಯಾಡ್ ಫೋನ್",
      title: "ಸ್ಮಾರ್ಟ್‌ಫೋನ್ ಇಲ್ಲದವರಿಗೂ ಅಪ್‌ಡೇಟ್ ನೀಡಿ.",
      body: "ಕುಟುಂಬದವರು, ಆರೈಕೆದಾರರು ಅಥವಾ ನೋಂದಣಿ ಸಿಬ್ಬಂದಿ ರೋಗಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಮತ್ತು ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ID ನಮೂದಿಸಬಹುದು. ಕೀಪ್ಯಾಡ್ ಫೋನ್‌ನಲ್ಲಿ ಪ್ರಯಾಣದ ಪ್ರತಿಯೊಂದು ಹಂತವೂ ಒಂದೊಂದಾಗಿ ತೋರಿಸುತ್ತದೆ.",
      mobile: "ರೋಗಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
      id: "ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ID",
      keypad: "ಕೀಪ್ಯಾಡ್ ತೆರೆಯಿರಿ",
      clear: "ತೆರವುಗೊಳಿಸಿ",
      backspace: "←",
      start: "ಪ್ರಯಾಣ ಅಪ್‌ಡೇಟ್‌ಗಳನ್ನು ಪ್ರಾರಂಭಿಸಿ",
      demo: "ಸಿಂಥೆಟಿಕ್ ಡೆಮೋ ಮಾತ್ರ — ಯಾವುದೇ ನಿಜವಾದ SMS ಕಳುಹಿಸಲಾಗುವುದಿಲ್ಲ.",
      phone: "ಕೀಪ್ಯಾಡ್ ಫೋನ್",
      waiting: "ಮುಂದಿನ ಅಪ್‌ಡೇಟ್‌ಗಾಗಿ ಕಾಯುತ್ತಿದೆ",
      registered: "ಅಪ್‌ಡೇಟ್‌ಗಳು ಸಕ್ರಿಯವಾಗಿವೆ",
      current: "ಪ್ರಸ್ತುತ ಅಪ್‌ಡೇಟ್",
      next: "ಮುಂದಿನ ಪ್ರಯಾಣ ಹಂತ",
      back: "← ವಿಸಿಟ್ ಲಾಗಿನ್‌ಗೆ ಹಿಂತಿರುಗಿ",
      invalidMobile: "10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.",
      invalidId: "ಈ ಡೆಮೋಗಾಗಿ DEMO-042 ಬಳಸಿ.",
      active: "ಅಪ್‌ಡೇಟ್‌ಗಳು ಸಕ್ರಿಯ",
      noUpdate: "ಸಿಂಥೆಟಿಕ್ ಪ್ರಯಾಣ ಮುಂದುವರಿದಂತೆ ಫೋನ್ ಮುಂದಿನ ಅಪ್‌ಡೇಟ್ ತೋರಿಸುತ್ತದೆ."
    }
  };
  const messages = {
    en: {
      "appointment-confirmed": "CAREPATH: Appointment confirmed. Bring your appointment ID to OPD Block A.",
      arrived: "CAREPATH: You have arrived. Please complete registration at Counter 3.",
      waiting: "CAREPATH: Registration complete. Please wait for your turn.",
      called: "CAREPATH: Your turn. Please go to the consultation room now.",
      consultation: "CAREPATH: Consultation in progress.",
      lab: "CAREPATH: Consultation complete. Please complete the lab step.",
      pharmacy: "CAREPATH: Lab complete. Please go to pharmacy.",
      completed: "CAREPATH: Your visit is complete."
    },
    hi: {
      "appointment-confirmed": "CAREPATH: अपॉइंटमेंट की पुष्टि हो गई। अपना ID OPD Block A में रखें।",
      arrived: "CAREPATH: आप अस्पताल पहुंच गए हैं। Counter 3 पर रजिस्ट्रेशन पूरा करें।",
      waiting: "CAREPATH: रजिस्ट्रेशन पूरा हो गया। अपनी बारी का इंतज़ार करें।",
      called: "CAREPATH: आपकी बारी है। अभी consultation room में जाएं।",
      consultation: "CAREPATH: consultation चल रहा है।",
      lab: "CAREPATH: consultation पूरा हुआ। अब lab का चरण पूरा करें।",
      pharmacy: "CAREPATH: lab पूरा हुआ। अब pharmacy जाएं।",
      completed: "CAREPATH: आपकी visit पूरी हो गई है।"
    },
    kn: {
      "appointment-confirmed": "CAREPATH: ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ದೃಢವಾಗಿದೆ. ನಿಮ್ಮ ID ಅನ್ನು OPD Block A ಗೆ ತಂದುಕೊಳ್ಳಿ.",
      arrived: "CAREPATH: ನೀವು ಆಸ್ಪತ್ರೆಗೆ ಬಂದಿದ್ದೀರಿ. Counter 3 ನಲ್ಲಿ ನೋಂದಣಿ ಪೂರ್ಣಗೊಳಿಸಿ.",
      waiting: "CAREPATH: ನೋಂದಣಿ ಪೂರ್ಣಗೊಂಡಿದೆ. ನಿಮ್ಮ ಸರದಿಗಾಗಿ ಕಾಯಿರಿ.",
      called: "CAREPATH: ನಿಮ್ಮ ಸರದಿ ಬಂದಿದೆ. ಈಗ consultation room ಗೆ ಹೋಗಿ.",
      consultation: "CAREPATH: consultation ನಡೆಯುತ್ತಿದೆ.",
      lab: "CAREPATH: consultation ಪೂರ್ಣಗೊಂಡಿದೆ. ಈಗ lab ಹಂತವನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ.",
      pharmacy: "CAREPATH: lab ಪೂರ್ಣಗೊಂಡಿದೆ. ಈಗ pharmacy ಗೆ ಹೋಗಿ.",
      completed: "CAREPATH: ನಿಮ್ಮ ಭೇಟಿ ಪೂರ್ಣಗೊಂಡಿದೆ."
    }
  };
  let lang = localStorage.getItem(LANG_KEY) || "en";
  let keypadOpen = false;
  let active = false;

  function currentState() {
    const match = location.hash.match(/healthcare\/visit\/([^/?#]+)/);
    return match ? match[1] : "appointment-confirmed";
  }
  function l() { return copy[lang] || copy.en; }
  function msg() { return (messages[lang] || messages.en)[currentState()] || (messages.en[currentState()] || messages.en["appointment-confirmed"]); }
  function escapeHtml(v) { return String(v).replace(/[&<>\"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }
  function injectLink() {
    if (location.hash.replace(/^#\/?/, "") !== "healthcare/login") { document.getElementById("cp-keypad-login-link")?.remove(); return; }
    const form = document.getElementById("patient-form");
    if (!form || document.getElementById("cp-keypad-login-link")) return;
    const a = document.createElement("button");
    a.type = "button";
    a.id = "cp-keypad-login-link";
    a.className = "cp-keypad-login-link";
    a.textContent = l().link;
    a.addEventListener("click", () => { location.hash = "/healthcare/keypad-updates"; });
    form.parentElement.appendChild(a);
  }
  function style() {
    if (document.getElementById("cp-keypad-style")) return;
    const s = document.createElement("style"); s.id = "cp-keypad-style";
    s.textContent = `.cp-keypad-login-link{display:block;margin:12px auto 0;padding:4px 0;border:0;background:none;color:#0c7477;text-decoration:underline;font:inherit;font-size:13px;font-weight:700;cursor:pointer}.cp-keypad-page{max-width:1160px;margin:0 auto;padding:72px 24px 100px}.cp-keypad-layout{display:grid;grid-template-columns:1.05fr .95fr;gap:28px;align-items:start}.cp-keypad-card,.cp-phone{background:#fffdf8;border:1px solid rgba(12,102,107,.14);border-radius:24px;box-shadow:0 18px 45px rgba(18,56,58,.07)}.cp-keypad-card{padding:28px}.cp-keypad-card h1{font-size:clamp(38px,5vw,64px);line-height:.98;margin:8px 0 18px;color:#12383a}.cp-keypad-card h1 em{font-family:Georgia,serif;color:#0c7b7e;font-weight:400}.cp-keypad-card p{color:#617b7d;line-height:1.6}.cp-kicker{font-size:12px;font-weight:900;letter-spacing:.14em;color:#0c666b}.cp-fields{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:22px}.cp-fields label{font-size:12px;font-weight:800;color:#31585a}.cp-fields input{display:block;width:100%;box-sizing:border-box;margin-top:6px;min-height:48px;border:1px solid #d7e4e1;border-radius:12px;padding:0 12px;font:inherit;background:#fff}.cp-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}.cp-actions button{min-height:46px}.cp-keypad{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px;padding:12px;background:#f3f8f6;border-radius:16px}.cp-keypad button{min-height:46px;border:1px solid #d7e4e1;background:#fff;border-radius:10px;font-weight:900;cursor:pointer}.cp-phone{padding:22px;background:#163f41;color:#fff}.cp-phone-shell{background:#dce8dc;color:#142d2e;border-radius:20px;padding:18px;max-width:390px;margin:auto;border:6px solid #0d282a;box-shadow:inset 0 0 0 2px #8ea8a2}.cp-phone-top{display:flex;justify-content:space-between;font-size:11px;font-weight:900;letter-spacing:.08em}.cp-screen{margin-top:14px;background:#d9e7d7;border:2px solid #8ba59c;border-radius:8px;padding:16px;min-height:210px;font-family:"Courier New",monospace}.cp-screen-label{font-size:10px;font-weight:900;margin-bottom:12px}.cp-screen-message{font-size:18px;line-height:1.35;font-weight:700;word-break:break-word}.cp-phone-hint{margin-top:14px;font-size:12px;line-height:1.5;color:#d6e8e4}.cp-active{margin-top:14px;padding:12px;border-radius:12px;background:#edf8f5;color:#245557;font-size:13px}.cp-back{margin-top:18px;display:inline-block;color:#0c7477;font-weight:800;text-decoration:none}.cp-error{margin-top:12px;color:#a33b34;font-weight:700;font-size:13px}@media(max-width:800px){.cp-keypad-layout{grid-template-columns:1fr}.cp-fields{grid-template-columns:1fr}.cp-keypad-page{padding-top:40px}}`;
    document.head.appendChild(s);
  }
  function render() {
    style();
    if (location.hash.replace(/^#\/?/, "") === "healthcare/login") { injectLink(); return; }
    if (location.hash.replace(/^#\/?/, "") !== "healthcare/keypad-updates") return;
    const app = document.querySelector("#app"); if (!app) return;
    const saved = JSON.parse(sessionStorage.getItem(KEY) || "null");
    const labels = l();
    const keypad = keypadOpen ? `<div class="cp-keypad" role="group" aria-label="${escapeHtml(labels.keypad)}">${[1,2,3,4,5,6,7,8,9,0].map(n => `<button type="button" data-cp-key="${n}">${n}</button>`).join("")}<button type="button" data-cp-key="clear">${escapeHtml(labels.clear)}</button><button type="button" data-cp-key="back">${escapeHtml(labels.backspace)}</button></div>` : "";
    const current = saved ? msg() : labels.noUpdate;
    app.innerHTML = `<main class="cp-keypad-page"><div class="cp-keypad-layout"><section class="cp-keypad-card"><div class="cp-kicker">${escapeHtml(labels.kicker)}</div><h1>Keep someone<br><em>in the loop.</em></h1><p>${escapeHtml(labels.body)}</p><div class="cp-fields"><label>${escapeHtml(labels.mobile)}<input id="cp-mobile" inputmode="numeric" maxlength="10" value="${escapeHtml(saved?.mobile || "")}"></label><label>${escapeHtml(labels.id)}<input id="cp-id" value="${escapeHtml(saved?.id || "DEMO-042")}"></label></div><div class="cp-actions"><button class="secondary-button" type="button" data-cp-keypad>${escapeHtml(labels.keypad)}</button><button class="primary-button" type="button" data-cp-start>${escapeHtml(labels.start)} <span>→</span></button></div>${keypad}<div id="cp-error" class="cp-error" hidden></div><small style="display:block;margin-top:14px;color:#6b8586">${escapeHtml(labels.demo)}</small><a class="cp-back" href="#/healthcare/login">${escapeHtml(labels.back)}</a></section><aside class="cp-phone"><div class="cp-phone-shell"><div class="cp-phone-top"><span>${escapeHtml(labels.phone)}</span><span>▮▮ 100%</span></div><div class="cp-screen"><div class="cp-screen-label">${escapeHtml(labels.current)}</div><div class="cp-screen-message">${escapeHtml(current)}</div></div>${saved ? `<div class="cp-active"><strong>${escapeHtml(labels.active)}</strong><br>${escapeHtml(saved.mobile)} · ${escapeHtml(saved.id)}<br><span>${escapeHtml(labels.waiting)}</span></div>` : ""}</div><p class="cp-phone-hint">${escapeHtml(labels.noUpdate)}</p></aside></div></main>`;
  }
  function click(e) {
    const keypadToggle = e.target.closest?.("[data-cp-keypad]");
    if (keypadToggle) { keypadOpen = !keypadOpen; render(); return; }
    const key = e.target.closest?.("[data-cp-key]");
    if (key) { const input = document.getElementById("cp-mobile"); if (!input) return; const v=input.value; if(key.dataset.cpKey==="clear") input.value=""; else if(key.dataset.cpKey==="back") input.value=v.slice(0,-1); else if(v.length<10) input.value=v+key.dataset.cpKey; input.focus(); return; }
    const start = e.target.closest?.("[data-cp-start]");
    if (start) { const mobile=document.getElementById("cp-mobile")?.value.trim()||""; const id=(document.getElementById("cp-id")?.value.trim()||"").toUpperCase(); const err=document.getElementById("cp-error"); if(!/^\d{10}$/.test(mobile)){err.textContent=l().invalidMobile;err.hidden=false;return} if(id!=="DEMO-042"){err.textContent=l().invalidId;err.hidden=false;return} sessionStorage.setItem(KEY,JSON.stringify({mobile,id,startedAt:Date.now()})); active=true; render(); }
  }
  window.addEventListener("carepath:language-changed", e => { lang=e.detail?.lang || localStorage.getItem(LANG_KEY) || "en"; render(); });
  window.addEventListener("carepath:route-rendered", () => setTimeout(render,0));
  window.addEventListener("hashchange", () => setTimeout(render,0));
  window.addEventListener("carepath:journey-updated", () => setTimeout(render,0));
  document.addEventListener("click", click);
  setInterval(() => { if(active && location.hash.includes("healthcare/visit/")) render(); }, 900);
  render();
})();
