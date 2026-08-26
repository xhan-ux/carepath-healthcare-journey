/* CarePath UX shell fix: shared navigation + real page language switching. */
const CP_LANG_KEY = "carepath:language:v1";
const CP_LANGS = { en: "English", hi: "हिन्दी", kn: "ಕನ್ನಡ" };

const CP_TRANSLATIONS = {
  hi: {
    "SYNTHETIC PUBLIC-SERVICE PROTOTYPE": "सिंथेटिक सार्वजनिक-सेवा प्रोटोटाइप",
    "PUBLIC SERVICE JOURNEY LAYER": "सार्वजनिक सेवा यात्रा परत",
    "One journey.": "एक यात्रा।",
    "Any service.": "कोई भी सेवा।",
    "CarePath helps people understand which official service to use, what to prepare, and what to do next — without replacing the government system.": "CarePath लोगों को सही सरकारी सेवा समझने, तैयारी करने और अगला कदम जानने में मदद करता है — सरकारी व्यवस्था को बदले बिना।",
    "Start with what you need.": "अपनी ज़रूरत से शुरू करें।",
    "Choose a service and CarePath will guide the journey in plain language.": "एक सेवा चुनें और CarePath आपको आसान भाषा में पूरी प्रक्रिया समझाएगा।",
    "Healthcare": "स्वास्थ्य सेवा",
    "Pension": "पेंशन",
    "Certificates": "प्रमाण पत्र",
    "Grievances": "शिकायतें",
    "Appointments, hospital visits and tests": "अपॉइंटमेंट, अस्पताल की यात्रा और जाँच",
    "Understand eligibility and application steps": "पात्रता और आवेदन के चरण समझें",
    "Know which certificate service to use": "जानें कि किस प्रमाण पत्र सेवा का उपयोग करना है",
    "Understand how to report a public-service problem": "सार्वजनिक सेवा की समस्या की शिकायत कैसे करें",
    "I need healthcare": "मुझे स्वास्थ्य सेवा चाहिए",
    "I need pension help": "मुझे पेंशन सहायता चाहिए",
    "I need a certificate": "मुझे प्रमाण पत्र चाहिए",
    "I need to report a problem": "मुझे समस्या की शिकायत करनी है",
    "Find the right service": "सही सेवा खोजें",
    "Understand the official process": "सरकारी प्रक्रिया समझें",
    "Know your next step": "अपना अगला कदम जानें",
    "Any device, low connectivity": "किसी भी डिवाइस पर, कम नेटवर्क में भी",
    "Working prototype": "कार्यशील प्रोटोटाइप",
    "Journey design": "यात्रा डिज़ाइन",
    "All services": "सभी सेवाएँ",
    "Staff simulator": "स्टाफ सिम्युलेटर",
    "Patient journey": "मरीज़ की यात्रा",
    "Log out": "लॉग आउट",
    "Back to services": "सेवाओं पर वापस जाएँ",
    "⌂": "⌂",
    "Healthcare · Start": "स्वास्थ्य सेवा · शुरुआत",
    "What do you": "आपको क्या",
    "need today?": "चाहिए आज?",
    "Tell CarePath what you are trying to do. We will explain the official service and keep the next step simple.": "CarePath को बताइए कि आपको क्या करना है। हम आधिकारिक सेवा समझाएँगे और अगला कदम आसान रखेंगे।",
    "HOW CAN WE HELP?": "हम आपकी कैसे मदद करें?",
    "I need to see a doctor": "मुझे डॉक्टर को दिखाना है",
    "I already have an appointment": "मेरी अपॉइंटमेंट पहले से है",
    "I need a test / lab": "मुझे टेस्ट / लैब चाहिए",
    "I have a referral": "मेरे पास रेफरल है",
    "I’m not sure where to start": "मुझे समझ नहीं आ रहा कहाँ से शुरू करूँ",
    "Choose an option and CarePath will take you to the appropriate next step.": "एक विकल्प चुनें और CarePath आपको सही अगले कदम तक ले जाएगा।"
  },
  kn: {
    "SYNTHETIC PUBLIC-SERVICE PROTOTYPE": "ಸಿಂಥೆಟಿಕ್ ಸಾರ್ವಜನಿಕ-ಸೇವಾ ಪ್ರೋಟೋಟೈಪ್",
    "PUBLIC SERVICE JOURNEY LAYER": "ಸಾರ್ವಜನಿಕ ಸೇವಾ ಪ್ರಯಾಣ ಪದರ",
    "One journey.": "ಒಂದು ಪ್ರಯಾಣ.",
    "Any service.": "ಯಾವುದೇ ಸೇವೆ.",
    "CarePath helps people understand which official service to use, what to prepare, and what to do next — without replacing the government system.": "CarePath ಯಾವ ಅಧಿಕೃತ ಸೇವೆಯನ್ನು ಬಳಸಬೇಕು, ಏನು ಸಿದ್ಧಪಡಿಸಬೇಕು ಮತ್ತು ಮುಂದೇನು ಮಾಡಬೇಕು ಎಂಬುದನ್ನು ಸರಳವಾಗಿ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ — ಸರ್ಕಾರಿ ವ್ಯವಸ್ಥೆಯನ್ನು ಬದಲಿಸದೆ.",
    "Start with what you need.": "ನಿಮಗೆ ಬೇಕಾದದ್ದರಿಂದ ಪ್ರಾರಂಭಿಸಿ.",
    "Choose a service and CarePath will guide the journey in plain language.": "ಒಂದು ಸೇವೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ. CarePath ಸರಳ ಭಾಷೆಯಲ್ಲಿ ನಿಮ್ಮ ಪ್ರಯಾಣವನ್ನು ಮಾರ್ಗದರ್ಶಿಸುತ್ತದೆ.",
    "Healthcare": "ಆರೋಗ್ಯ ಸೇವೆ",
    "Pension": "ಪಿಂಚಣಿ",
    "Certificates": "ಪ್ರಮಾಣಪತ್ರಗಳು",
    "Grievances": "ದೂರುಗಳು",
    "Appointments, hospital visits and tests": "ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳು, ಆಸ್ಪತ್ರೆ ಭೇಟಿಗಳು ಮತ್ತು ಪರೀಕ್ಷೆಗಳು",
    "Understand eligibility and application steps": "ಅರ್ಹತೆ ಮತ್ತು ಅರ್ಜಿ ಹಂತಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ",
    "Know which certificate service to use": "ಯಾವ ಪ್ರಮಾಣಪತ್ರ ಸೇವೆಯನ್ನು ಬಳಸಬೇಕು ಎಂದು ತಿಳಿಯಿರಿ",
    "Understand how to report a public-service problem": "ಸಾರ್ವಜನಿಕ ಸೇವೆಯ ಸಮಸ್ಯೆಯನ್ನು ಹೇಗೆ ವರದಿ ಮಾಡಬೇಕು ಎಂದು ತಿಳಿಯಿರಿ",
    "I need healthcare": "ನನಗೆ ಆರೋಗ್ಯ ಸೇವೆ ಬೇಕು",
    "I need pension help": "ನನಗೆ ಪಿಂಚಣಿ ಸಹಾಯ ಬೇಕು",
    "I need a certificate": "ನನಗೆ ಪ್ರಮಾಣಪತ್ರ ಬೇಕು",
    "I need to report a problem": "ನನಗೆ ಸಮಸ್ಯೆಯನ್ನು ವರದಿ ಮಾಡಬೇಕು",
    "Find the right service": "ಸರಿಯಾದ ಸೇವೆಯನ್ನು ಹುಡುಕಿ",
    "Understand the official process": "ಅಧಿಕೃತ ಪ್ರಕ್ರಿಯೆಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ",
    "Know your next step": "ಮುಂದಿನ ಹೆಜ್ಜೆಯನ್ನು ತಿಳಿಯಿರಿ",
    "Any device, low connectivity": "ಯಾವುದೇ ಸಾಧನದಲ್ಲಿ, ಕಡಿಮೆ ನೆಟ್‌ವರ್ಕ್‌ನಲ್ಲೂ",
    "Working prototype": "ಕಾರ್ಯನಿರ್ವಹಿಸುವ ಪ್ರೋಟೋಟೈಪ್",
    "Journey design": "ಪ್ರಯಾಣ ವಿನ್ಯಾಸ",
    "All services": "ಎಲ್ಲಾ ಸೇವೆಗಳು",
    "Staff simulator": "ಸಿಬ್ಬಂದಿ ಸಿಮ್ಯುಲೇಟರ್",
    "Patient journey": "ರೋಗಿಯ ಪ್ರಯಾಣ",
    "Log out": "ಲಾಗ್ ಔಟ್",
    "Back to services": "ಸೇವೆಗಳಿಗೆ ಹಿಂತಿರುಗಿ",
    "⌂": "⌂",
    "Healthcare · Start": "ಆರೋಗ್ಯ ಸೇವೆ · ಪ್ರಾರಂಭ",
    "What do you": "ನಿಮಗೆ ಇಂದು",
    "need today?": "ಏನು ಬೇಕು?",
    "Tell CarePath what you are trying to do. We will explain the official service and keep the next step simple.": "ನೀವು ಏನು ಮಾಡಲು ಬಯಸುತ್ತೀರಿ ಎಂದು CarePath ಗೆ ತಿಳಿಸಿ. ನಾವು ಅಧಿಕೃತ ಸೇವೆಯನ್ನು ವಿವರಿಸಿ ಮುಂದಿನ ಹೆಜ್ಜೆಯನ್ನು ಸರಳಗೊಳಿಸುತ್ತೇವೆ.",
    "HOW CAN WE HELP?": "ನಾವು ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
    "I need to see a doctor": "ನಾನು ವೈದ್ಯರನ್ನು ಭೇಟಿಯಾಗಬೇಕು",
    "I already have an appointment": "ನನಗೆ ಈಗಾಗಲೇ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಇದೆ",
    "I need a test / lab": "ನನಗೆ ಪರೀಕ್ಷೆ / ಲ್ಯಾಬ್ ಬೇಕು",
    "I have a referral": "ನನ್ನ ಬಳಿ ರೆಫರಲ್ ಇದೆ",
    "I’m not sure where to start": "ಎಲ್ಲಿ ಪ್ರಾರಂಭಿಸಬೇಕು ಎಂದು ತಿಳಿದಿಲ್ಲ",
    "Choose an option and CarePath will take you to the appropriate next step.": "ಒಂದು ಆಯ್ಕೆಯನ್ನು ಆರಿಸಿ. CarePath ನಿಮ್ಮನ್ನು ಸರಿಯಾದ ಮುಂದಿನ ಹೆಜ್ಜೆಗೆ ಕರೆದೊಯ್ಯುತ್ತದೆ."
  }
};

let cpLang = localStorage.getItem(CP_LANG_KEY) || "en";
let cpLastHeader = null;

function cpTextNodes(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
}

function cpApplyTranslations(root = document) {
  const map = CP_TRANSLATIONS[cpLang];
  if (!map) return;
  cpTextNodes(root).forEach(node => {
    const raw = node.nodeValue;
    const key = raw.trim();
    if (!key || !map[key]) return;
    node.nodeValue = raw.replace(key, map[key]);
  });
  root.querySelectorAll?.("input[placeholder], textarea[placeholder], [aria-label]").forEach(el => {
    const attr = el.hasAttribute("placeholder") ? "placeholder" : "aria-label";
    const value = el.getAttribute(attr);
    if (value && map[value]) el.setAttribute(attr, map[value]);
  });
  document.documentElement.lang = cpLang === "hi" ? "hi" : cpLang === "kn" ? "kn" : "en";
}

function cpSharedHeader() {
  const logged = sessionStorage.getItem("carepath:role:v6");
  return `<header class="topbar cp-shared-topbar">
    <a class="brand" href="#/services" aria-label="CarePath home"><span class="brand-mark">+</span>CarePath</a>
    <span class="prototype-chip">SYNTHETIC PUBLIC-SERVICE PROTOTYPE</span>
    <div class="top-actions">
      <button class="lang-button" data-cp-lang="en" type="button">🇬🇧 English</button>
      <button class="lang-button" data-cp-lang="hi" type="button">🇮🇳 हिन्दी</button>
      <button class="lang-button" data-cp-lang="kn" type="button">ಕನ್ನಡ</button>
      <button class="ghost-button" data-action="accessibility" type="button" aria-label="Accessibility">◉</button>
      ${logged ? `<span class="role-chip">${logged === "staff" ? "Staff simulator" : "Patient journey"}</span><button class="ghost-button" data-action="logout" type="button">Log out</button>` : ``}
    </div>
  </header>`;
}

function cpNormalizeHeader() {
  const header = document.querySelector(".topbar");
  if (!header || header === cpLastHeader && header.querySelector(".cp-shared-topbar")) return;
  if (header.classList.contains("cp-shared-topbar")) return;
  header.outerHTML = cpSharedHeader();
  cpLastHeader = document.querySelector(".topbar");
  cpApplyTranslations(cpLastHeader);
}

function cpSetLanguage(lang) {
  if (!CP_LANGS[lang]) return;
  cpLang = lang;
  localStorage.setItem(CP_LANG_KEY, lang);
  const current = document.querySelector("#app");
  if (current) {
    current.dataset.cpLanguage = lang;
    // Re-rendering the route is intentional: it gives template-based screens
    // a clean English source before applying the selected language.
    const hash = location.hash;
    window.dispatchEvent(new HashChangeEvent("hashchange", { oldURL: hash, newURL: hash }));
  }
  setTimeout(() => {
    cpNormalizeHeader();
    cpApplyTranslations(document.querySelector("#app") || document);
    cpApplyTranslations(document.querySelector(".topbar") || document);
  }, 30);
}

document.addEventListener("click", e => {
  const lang = e.target.closest?.("[data-cp-lang]")?.dataset.cpLang;
  if (lang) {
    e.preventDefault();
    e.stopPropagation();
    cpSetLanguage(lang);
  }
}, true);

const cpObserver = new MutationObserver(() => {
  cpNormalizeHeader();
  cpApplyTranslations(document.querySelector("#app") || document);
});
cpObserver.observe(document.body, { childList: true, subtree: true });

window.addEventListener("hashchange", () => setTimeout(() => {
  cpNormalizeHeader();
  cpApplyTranslations(document.querySelector("#app") || document);
}, 40));

setTimeout(() => {
  cpNormalizeHeader();
  cpApplyTranslations(document.querySelector("#app") || document);
}, 80);
