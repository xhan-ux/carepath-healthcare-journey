/* Live mock keypad phone: once a phone is enrolled, show each synthetic journey update as the route advances. */
(() => {
  const KEY = "carepath:keypad-updates:v1";
  const LANG_KEY = "carepath:language:v3";
  const messages = {
    en:{"appointment-confirmed":"Appointment confirmed. Bring your appointment ID to OPD Block A.",arrived:"You have arrived. Please complete registration at Counter 3.",waiting:"Registration complete. Please wait for your turn.",called:"Your turn. Please go to the consultation room now.",consultation:"Consultation in progress.",lab:"Consultation complete. Please complete the lab step.",pharmacy:"Lab complete. Please go to pharmacy.",completed:"Your visit is complete."},
    hi:{"appointment-confirmed":"अपॉइंटमेंट की पुष्टि हो गई। अपना ID OPD Block A में रखें।",arrived:"आप अस्पताल पहुंच गए हैं। Counter 3 पर रजिस्ट्रेशन पूरा करें।",waiting:"रजिस्ट्रेशन पूरा हो गया। अपनी बारी का इंतज़ार करें।",called:"आपकी बारी है। अभी consultation room में जाएं।",consultation:"consultation चल रहा है।",lab:"consultation पूरा हुआ। अब lab का चरण पूरा करें।",pharmacy:"lab पूरा हुआ। अब pharmacy जाएं।",completed:"आपकी visit पूरी हो गई है।"},
    kn:{"appointment-confirmed":"ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ದೃಢವಾಗಿದೆ. ನಿಮ್ಮ ID ಅನ್ನು OPD Block A ಗೆ ತಂದುಕೊಳ್ಳಿ.",arrived:"ನೀವು ಆಸ್ಪತ್ರೆಗೆ ಬಂದಿದ್ದೀರಿ. Counter 3 ನಲ್ಲಿ ನೋಂದಣಿ ಪೂರ್ಣಗೊಳಿಸಿ.",waiting:"ನೋಂದಣಿ ಪೂರ್ಣಗೊಂಡಿದೆ. ನಿಮ್ಮ ಸರದಿಗಾಗಿ ಕಾಯಿರಿ.",called:"ನಿಮ್ಮ ಸರದಿ ಬಂದಿದೆ. ಈಗ consultation room ಗೆ ಹೋಗಿ.",consultation:"consultation ನಡೆಯುತ್ತಿದೆ.",lab:"consultation ಪೂರ್ಣಗೊಂಡಿದೆ. ಈಗ lab ಹಂತವನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ.",pharmacy:"lab ಪೂರ್ಣಗೊಂಡಿದೆ. ಈಗ pharmacy ಗೆ ಹೋಗಿ.",completed:"ನಿಮ್ಮ ಭೇಟಿ ಪೂರ್ಣಗೊಂಡಿದೆ."}
  };
  const labels={en:{phone:"KEYPAD PHONE",live:"LIVE JOURNEY UPDATE",active:"Updates active",hide:"Hide phone"},hi:{phone:"कीपैड फोन",live:"लाइव यात्रा अपडेट",active:"अपडेट सक्रिय",hide:"फोन छुपाएं"},kn:{phone:"ಕೀಪ್ಯಾಡ್ ಫೋನ್",live:"ಲೈವ್ ಪ್ರಯಾಣ ಅಪ್‌ಡೇಟ್",active:"ಅಪ್‌ಡೇಟ್ ಸಕ್ರಿಯ",hide:"ಫೋನ್ ಮರೆಮಾಡಿ"}};
  let hidden=false;
  function state(){const m=location.hash.match(/healthcare\/visit\/([^/?#]+)/);return m?m[1]:null}
  function render(){
    const route=state(); const saved=JSON.parse(sessionStorage.getItem(KEY)||"null");
    document.getElementById("cp-live-phone")?.remove();
    if(!route||!saved||hidden)return;
    const lang=localStorage.getItem(LANG_KEY)||"en"; const text=(messages[lang]||messages.en)[route]||messages.en[route]; const l=labels[lang]||labels.en;
    const el=document.createElement("aside"); el.id="cp-live-phone"; el.setAttribute("aria-label",l.phone); el.innerHTML=`<div class="cp-live-phone-shell"><div class="cp-live-phone-top"><strong>${l.phone}</strong><span>▮▮ 100%</span></div><div class="cp-live-screen"><small>${l.live}</small><div>${text}</div></div><div class="cp-live-meta">${l.active}<br><b>${saved.mobile}</b> · ${saved.id}</div><button type="button" data-cp-live-hide>${l.hide}</button></div>`;
    document.body.appendChild(el);
  }
  function style(){if(document.getElementById("cp-live-style"))return;const s=document.createElement("style");s.id="cp-live-style";s.textContent=`#cp-live-phone{position:fixed;left:18px;bottom:18px;z-index:80;width:260px;filter:drop-shadow(0 16px 30px rgba(12,48,50,.22))}.cp-live-phone-shell{background:#12383a;border:5px solid #0b2527;border-radius:18px;padding:10px;color:#fff}.cp-live-phone-top{display:flex;justify-content:space-between;font:700 10px/1.2 Arial;letter-spacing:.06em}.cp-live-screen{margin-top:8px;background:#dbe7d8;color:#142d2e;border-radius:7px;border:2px solid #8ba59c;padding:11px;font-family:"Courier New",monospace}.cp-live-screen small{display:block;font-size:8px;font-weight:900;margin-bottom:7px}.cp-live-screen div{font-size:14px;line-height:1.3;font-weight:700}.cp-live-meta{font:11px/1.4 Arial;margin-top:8px;color:#d8e8e5}.cp-live-phone-shell button{margin-top:8px;border:0;background:transparent;color:#d8e8e5;text-decoration:underline;font:700 10px Arial;cursor:pointer;padding:2px 0}@media(max-width:600px){#cp-live-phone{left:10px;bottom:10px;width:220px}.cp-live-screen div{font-size:12px}}`;document.head.appendChild(s)}
  document.addEventListener("click",e=>{if(e.target.closest?.("[data-cp-live-hide]")){hidden=true;document.getElementById("cp-live-phone")?.remove()}});
  window.addEventListener("hashchange",()=>setTimeout(render,40)); window.addEventListener("carepath:route-rendered",()=>setTimeout(render,40)); window.addEventListener("carepath:language-changed",()=>setTimeout(render,40));
  style(); render();
})();
