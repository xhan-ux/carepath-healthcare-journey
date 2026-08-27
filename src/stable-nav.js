/* CarePath stable shell.
   The navbar lives outside #app so route renders cannot replace it.
   It owns only shell controls; page content remains owned by app.js.
*/
(() => {
  const LANG_KEY = "carepath:language:v3";
  const A11Y_KEY = "carepath:accessibility:v3";
  const AUTH_KEY = "carepath:role:v6";
  const app = document.querySelector("#app");

  const langLabels = {
    en: { access: "Accessibility", voice: "Read aloud", home: "Home", logout: "Log out" },
    hi: { access: "सुलभता", voice: "पढ़कर सुनाएँ", home: "होम", logout: "लॉग आउट" },
    kn: { access: "ಪ್ರವೇಶಸಾಧ್ಯತೆ", voice: "ಓದಿ ಕೇಳಿಸಿ", home: "ಮುಖಪುಟ", logout: "ಲಾಗ್ ಔಟ್" }
  };

  let lang = localStorage.getItem(LANG_KEY) || "en";
  let settings = { size: "normal", contrast: false, motion: false, underline: false };
  try { settings = { ...settings, ...JSON.parse(localStorage.getItem(A11Y_KEY) || "{}") }; } catch {}

  function saveA11y() { localStorage.setItem(A11Y_KEY, JSON.stringify(settings)); }
  function applyA11y() {
    document.body.classList.toggle("a11y-large", settings.size === "large");
    document.body.classList.toggle("a11y-xlarge", settings.size === "xlarge");
    document.body.classList.toggle("a11y-high-contrast", !!settings.contrast);
    document.body.classList.toggle("a11y-reduce-motion", !!settings.motion);
    document.body.classList.toggle("a11y-underline", !!settings.underline);
  }

  function shellMarkup() {
    const labels = langLabels[lang] || langLabels.en;
    const role = sessionStorage.getItem(AUTH_KEY);
    return `<header id="carepath-shell" class="topbar carepath-stable-shell">
      <a class="brand" href="#/services" aria-label="CarePath home"><span class="brand-mark">+</span>CarePath</a>
      <span class="prototype-chip">SYNTHETIC PUBLIC-SERVICE PROTOTYPE</span>
      <nav class="carepath-shell-nav" aria-label="CarePath controls">
        <button class="shell-tool" type="button" data-shell-a11y aria-haspopup="dialog">♿ <span>${labels.access}</span></button>
        <label class="shell-language"><span class="sr-only">Language</span><select data-shell-language aria-label="Language">
          <option value="en" ${lang === "en" ? "selected" : ""}>EN</option>
          <option value="hi" ${lang === "hi" ? "selected" : ""}>हिन्दी</option>
          <option value="kn" ${lang === "kn" ? "selected" : ""}>ಕನ್ನಡ</option>
        </select></label>
        <button class="shell-tool" type="button" data-shell-read>${labels.voice}</button>
        ${role ? `<span class="role-chip">${role === "staff" ? "Staff simulator" : "Patient journey"}</span><button class="ghost-button" data-shell-logout type="button">${labels.logout}</button>` : `<button class="icon-button" data-shell-home type="button" aria-label="${labels.home}">⌂</button>`}
      </nav>
    </header>`;
  }

  function renderShell() {
    if (!document.body) return;
    const existing = document.querySelector("#carepath-shell");
    if (existing) existing.outerHTML = shellMarkup();
    else document.body.insertAdjacentHTML("afterbegin", shellMarkup());
    applyA11y();
  }

  function ensureLegacyHeaderHidden() {
    if (!app) return;
    app.querySelectorAll(":scope > .topbar").forEach(el => { el.hidden = true; el.setAttribute("aria-hidden", "true"); });
  }

  function setLanguage(next) {
    lang = next === "hi" || next === "kn" ? next : "en";
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang;
    renderShell();
    location.reload();
  }

  function openA11y() {
    let panel = document.querySelector("#carepath-stable-a11y");
    if (!panel) {
      panel = document.createElement("section");
      panel.id = "carepath-stable-a11y";
      panel.className = "stable-a11y-panel";
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-modal", "false");
      panel.innerHTML = `<div class="stable-a11y-head"><div><span class="eyebrow">CAREPATH</span><h2>Accessibility</h2></div><button type="button" data-a11y-close aria-label="Close">×</button></div>
        <p>Adjust the journey to make it easier to read, see and use.</p>
        <div class="stable-a11y-options">
          <button type="button" data-a11y-size="normal">Normal text</button>
          <button type="button" data-a11y-size="large">Larger text</button>
          <button type="button" data-a11y-size="xlarge">Extra-large text</button>
          <button type="button" data-a11y-contrast>High contrast</button>
          <button type="button" data-a11y-motion>Reduce motion</button>
          <button type="button" data-a11y-underline>Underline links</button>
        </div>
        <button class="secondary-button" type="button" data-a11y-reset>Reset settings</button>`;
      document.body.appendChild(panel);
    }
    panel.hidden = false;
  }

  function closeA11y() {
    const panel = document.querySelector("#carepath-stable-a11y");
    if (panel) panel.hidden = true;
  }

  document.addEventListener("click", event => {
    const el = event.target.closest("[data-shell-a11y],[data-shell-read],[data-shell-home],[data-shell-logout],[data-a11y-close],[data-a11y-reset],[data-a11y-size],[data-a11y-contrast],[data-a11y-motion],[data-a11y-underline]");
    if (!el) return;
    if (el.matches("[data-shell-a11y]")) return openA11y();
    if (el.matches("[data-shell-read]")) {
      const text = document.querySelector("#app main")?.innerText || document.body.innerText;
      if ("speechSynthesis" in window) { speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(text.slice(0, 5000))); }
      return;
    }
    if (el.matches("[data-shell-home]")) { location.hash = "/services"; return; }
    if (el.matches("[data-shell-logout]")) { sessionStorage.removeItem(AUTH_KEY); location.hash = "/services"; renderShell(); return; }
    if (el.matches("[data-a11y-close]")) return closeA11y();
    if (el.matches("[data-a11y-size]")) settings.size = el.dataset.a11ySize;
    if (el.matches("[data-a11y-contrast]")) settings.contrast = !settings.contrast;
    if (el.matches("[data-a11y-motion]")) settings.motion = !settings.motion;
    if (el.matches("[data-a11y-underline]")) settings.underline = !settings.underline;
    if (el.matches("[data-a11y-reset]")) settings = { size: "normal", contrast: false, motion: false, underline: false };
    saveA11y(); applyA11y();
  });

  document.addEventListener("change", event => {
    if (event.target.matches("[data-shell-language]")) setLanguage(event.target.value);
  });

  window.addEventListener("hashchange", () => { renderShell(); ensureLegacyHeaderHidden(); });
  const observer = new MutationObserver(() => ensureLegacyHeaderHidden());
  if (app) observer.observe(app, { childList: true });

  document.documentElement.lang = lang;
  renderShell();
  ensureLegacyHeaderHidden();
})();
