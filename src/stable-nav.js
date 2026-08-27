/* CarePath persistent global navigation.
   The shell is static in index.html so it cannot disappear if another module fails.
   This script only synchronizes its controls and never replaces the shell element. */
(() => {
  const LANG_KEY = "carepath:language:v3";
  const A11Y_KEY = "carepath:accessibility:v3";
  const AUTH_KEY = "carepath:role:v6";
  const labels = {
    en: {
      access: "Accessibility", voice: "Read aloud", home: "Home", logout: "Log out",
      a11yTitle: "Accessibility", a11yDesc: "Adjust the journey to make it easier to read, see and use.",
      normal: "Normal text", large: "Larger text", xlarge: "Extra-large text", contrast: "High contrast",
      motion: "Reduce motion", underline: "Underline links", reset: "Reset settings", close: "Close",
      patient: "Patient journey", staff: "Staff simulator", stop: "Stop reading"
    },
    hi: {
      access: "सुलभता", voice: "पढ़कर सुनाएँ", home: "होम", logout: "लॉग आउट",
      a11yTitle: "सुलभता", a11yDesc: "पढ़ने, देखने और इस्तेमाल करने को आसान बनाने के लिए यात्रा बदलें।",
      normal: "सामान्य पाठ", large: "बड़ा पाठ", xlarge: "बहुत बड़ा पाठ", contrast: "उच्च कंट्रास्ट",
      motion: "गतिशीलता कम करें", underline: "लिंक के नीचे रेखा", reset: "सेटिंग रीसेट करें", close: "बंद करें",
      patient: "मरीज़ यात्रा", staff: "स्टाफ सिम्युलेटर", stop: "पढ़ना रोकें"
    },
    kn: {
      access: "ಪ್ರವೇಶಸಾಧ್ಯತೆ", voice: "ಓದಿ ಕೇಳಿಸಿ", home: "ಮುಖಪುಟ", logout: "ಲಾಗ್ ಔಟ್",
      a11yTitle: "ಪ್ರವೇಶಸಾಧ್ಯತೆ", a11yDesc: "ಓದಲು, ನೋಡಲು ಮತ್ತು ಬಳಸಲು ಪ್ರಯಾಣವನ್ನು ಸುಲಭಗೊಳಿಸಿ.",
      normal: "ಸಾಮಾನ್ಯ ಪಠ್ಯ", large: "ದೊಡ್ಡ ಪಠ್ಯ", xlarge: "ಅತಿ ದೊಡ್ಡ ಪಠ್ಯ", contrast: "ಹೆಚ್ಚಿನ ಕಾಂಟ್ರಾಸ್ಟ್",
      motion: "ಚಲನೆ ಕಡಿಮೆ ಮಾಡಿ", underline: "ಲಿಂಕ್‌ಗಳಿಗೆ ಕೆಳಗೆ ರೇಖೆ", reset: "ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ಮರುಹೊಂದಿಸಿ", close: "ಮುಚ್ಚಿ",
      patient: "ರೋಗಿಯ ಪ್ರಯಾಣ", staff: "ಸಿಬ್ಬಂದಿ ಸಿಮ್ಯುಲೇಟರ್", stop: "ಓದುವುದನ್ನು ನಿಲ್ಲಿಸಿ"
    }
  };

  let lang = localStorage.getItem(LANG_KEY) || "en";
  let settings = { size: "normal", contrast: false, motion: false, underline: false };
  try { settings = { ...settings, ...JSON.parse(localStorage.getItem(A11Y_KEY) || "{}") }; } catch {}

  const shell = () => document.querySelector("#carepath-shell");
  const applyA11y = () => {
    document.body.classList.toggle("a11y-large", settings.size === "large");
    document.body.classList.toggle("a11y-xlarge", settings.size === "xlarge");
    document.body.classList.toggle("a11y-high-contrast", !!settings.contrast);
    document.body.classList.toggle("a11y-reduce-motion", !!settings.motion);
    document.body.classList.toggle("a11y-underline", !!settings.underline);
  };
  const updateA11yPanel = () => {
    const panel = document.querySelector("#carepath-stable-a11y");
    if (!panel) return;
    const l = labels[lang] || labels.en;
    panel.querySelector("[data-a11y-title]").textContent = l.a11yTitle;
    panel.querySelector("[data-a11y-desc]").textContent = l.a11yDesc;
    panel.querySelector("[data-a11y-size='normal']").textContent = l.normal;
    panel.querySelector("[data-a11y-size='large']").textContent = l.large;
    panel.querySelector("[data-a11y-size='xlarge']").textContent = l.xlarge;
    panel.querySelector("[data-a11y-contrast]").textContent = l.contrast;
    panel.querySelector("[data-a11y-motion]").textContent = l.motion;
    panel.querySelector("[data-a11y-underline]").textContent = l.underline;
    panel.querySelector("[data-a11y-reset]").textContent = l.reset;
    panel.querySelector("[data-a11y-close]").setAttribute("aria-label", l.close);
  };
  const syncShell = () => {
    const nav = shell();
    if (!nav) return;
    const l = labels[lang] || labels.en;
    document.documentElement.lang = lang;
    nav.querySelector("[data-shell-access]").textContent = l.access;
    const read = nav.querySelector("[data-shell-voice]");
    read.textContent = ("speechSynthesis" in window && speechSynthesis.speaking) ? l.stop : l.voice;
    const select = nav.querySelector("[data-shell-language]");
    select.value = lang;
    select.setAttribute("aria-label", lang === "hi" ? "भाषा" : lang === "kn" ? "ಭಾಷೆ" : "Language");
    const auth = nav.querySelector("[data-shell-auth]");
    const role = sessionStorage.getItem(AUTH_KEY);
    auth.innerHTML = role
      ? `<span class="role-chip">${role === "staff" ? l.staff : l.patient}</span><button class="ghost-button" data-shell-logout type="button">${l.logout}</button>`
      : "";
    const home = nav.querySelector("[data-shell-home]");
    home.setAttribute("aria-label", l.home);
    home.hidden = !!role;
    updateA11yPanel();
    applyA11y();
  };
  const setLanguage = next => {
    lang = ["en", "hi", "kn"].includes(next) ? next : "en";
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang;
    syncShell();
    window.dispatchEvent(new CustomEvent("carepath:language-changed", { detail: { lang } }));
  };
  const openA11y = () => {
    let panel = document.querySelector("#carepath-stable-a11y");
    if (!panel) {
      panel = document.createElement("section");
      panel.id = "carepath-stable-a11y";
      panel.className = "stable-a11y-panel";
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-modal", "false");
      panel.innerHTML = `<div class="stable-a11y-head"><div><span class="eyebrow">CAREPATH</span><h2 data-a11y-title>Accessibility</h2></div><button type="button" data-a11y-close aria-label="Close">×</button></div><p data-a11y-desc>Adjust the journey to make it easier to read, see and use.</p><div class="stable-a11y-options"><button type="button" data-a11y-size="normal">Normal text</button><button type="button" data-a11y-size="large">Larger text</button><button type="button" data-a11y-size="xlarge">Extra-large text</button><button type="button" data-a11y-contrast>High contrast</button><button type="button" data-a11y-motion>Reduce motion</button><button type="button" data-a11y-underline>Underline links</button></div><button class="secondary-button" type="button" data-a11y-reset>Reset settings</button>`;
      document.body.appendChild(panel);
    }
    updateA11yPanel();
    panel.hidden = false;
  };

  document.addEventListener("click", e => {
    const x = e.target.closest("[data-shell-a11y],[data-shell-read],[data-shell-home],[data-shell-logout],[data-a11y-close],[data-a11y-reset],[data-a11y-size],[data-a11y-contrast],[data-a11y-motion],[data-a11y-underline]");
    if (!x) return;
    if (x.matches("[data-shell-a11y]")) return openA11y();
    if (x.matches("[data-shell-read]")) {
      if (!("speechSynthesis" in window)) return;
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
        syncShell();
        return;
      }
      const text = document.querySelector("#app main")?.innerText || "";
      if (!text) return;
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.slice(0, 5000));
      utterance.lang = lang === "hi" ? "hi-IN" : lang === "kn" ? "kn-IN" : "en-IN";
      utterance.onend = syncShell;
      utterance.onerror = syncShell;
      speechSynthesis.speak(utterance);
      syncShell();
      return;
    }
    if (x.matches("[data-shell-home]")) { location.hash = "/services"; return; }
    if (x.matches("[data-shell-logout]")) { sessionStorage.removeItem(AUTH_KEY); location.hash = "/services"; syncShell(); return; }
    if (x.matches("[data-a11y-close]")) { x.closest("#carepath-stable-a11y").hidden = true; return; }
    if (x.matches("[data-a11y-size]")) settings.size = x.dataset.a11ySize;
    if (x.matches("[data-a11y-contrast]")) settings.contrast = !settings.contrast;
    if (x.matches("[data-a11y-motion]")) settings.motion = !settings.motion;
    if (x.matches("[data-a11y-underline]")) settings.underline = !settings.underline;
    if (x.matches("[data-a11y-reset]")) settings = { size: "normal", contrast: false, motion: false, underline: false };
    localStorage.setItem(A11Y_KEY, JSON.stringify(settings));
    applyA11y();
  });
  document.addEventListener("change", e => {
    if (e.target.matches("[data-shell-language]")) setLanguage(e.target.value);
  });
  window.addEventListener("hashchange", syncShell);
  window.addEventListener("storage", e => {
    if (e.key === LANG_KEY) { lang = localStorage.getItem(LANG_KEY) || "en"; syncShell(); }
    if (e.key === AUTH_KEY) syncShell();
  });
  window.addEventListener("carepath:auth-changed", syncShell);
  syncShell();
})();
