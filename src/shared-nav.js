/* CarePath shared navigation.
   Owns only the visible navbar shell + language persistence.
   Accessibility and read-aloud behavior stay in accessibility.js so there
   is exactly one click handler for each feature. */
(function(){
  const LANG_KEY="carepath:language:v1";
  const A11Y_LANG_KEY="carepath:language:v3";
  const LANGS={en:"EN",hi:"हिं",kn:"ಕನ್ನಡ"};
  const LABELS={
    en:{access:"Accessibility",language:"Language",voice:"Read aloud"},
    hi:{access:"सुलभता",language:"भाषा",voice:"पढ़कर सुनाएँ"},
    kn:{access:"ಪ್ರವೇಶಸಾಧ್ಯತೆ",language:"ಭಾಷೆ",voice:"ಓದಿ ಕೇಳಿಸಿ"}
  };
  const PANEL={
    en:{title:"Accessibility options",desc:"Adjust CarePath to make the journey easier to read, see and use.",normal:"Normal text",large:"Larger text",xlarge:"Extra-large text",contrast:"High contrast",motion:"Reduce motion",underline:"Underline links",reset:"Reset settings"},
    hi:{title:"सुलभता विकल्प",desc:"CarePath को पढ़ने, देखने और इस्तेमाल करने में आसान बनाने के लिए विकल्प चुनें।",normal:"सामान्य टेक्स्ट",large:"बड़ा टेक्स्ट",xlarge:"बहुत बड़ा टेक्स्ट",contrast:"उच्च कंट्रास्ट",motion:"एनीमेशन कम करें",underline:"लिंक के नीचे रेखा",reset:"सेटिंग रीसेट करें"},
    kn:{title:"ಪ್ರವೇಶಸಾಧ್ಯತೆ ಆಯ್ಕೆಗಳು",desc:"CarePath ಅನ್ನು ಓದಲು, ನೋಡಲು ಮತ್ತು ಬಳಸಲು ಸುಲಭವಾಗುವಂತೆ ಹೊಂದಿಸಿ.",normal:"ಸಾಮಾನ್ಯ ಪಠ್ಯ",large:"ದೊಡ್ಡ ಪಠ್ಯ",xlarge:"ಬಹಳ ದೊಡ್ಡ ಪಠ್ಯ",contrast:"ಹೆಚ್ಚಿನ ಕಾಂಟ್ರಾಸ್ಟ್",motion:"ಚಲನೆಯನ್ನು ಕಡಿಮೆ ಮಾಡಿ",underline:"ಲಿಂಕ್‌ಗಳಿಗೆ ಕೆಳಗೆ ರೇಖೆ",reset:"ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ಮರುಹೊಂದಿಸಿ"}
  };
  const getLang=()=>localStorage.getItem(LANG_KEY)||localStorage.getItem(A11Y_LANG_KEY)||"en";
  const validLang=()=>Object.prototype.hasOwnProperty.call(LANGS,getLang())?getLang():"en";

  function navMarkup(){
    const l=LABELS[validLang()];
    return `<div class="carepath-nav-tools" data-shared-nav>
      <button class="nav-tool" type="button" data-nav-a11y aria-haspopup="dialog"><span aria-hidden="true">♿</span><span>${l.access}</span></button>
      <label class="nav-language"><span class="sr-only">${l.language}</span><select data-nav-language aria-label="${l.language}"><option value="en">EN</option><option value="hi">हिं</option><option value="kn">ಕನ್ನಡ</option></select></label>
      <button class="nav-tool nav-voice" type="button" data-nav-voice><span aria-hidden="true">🔊</span><span>${l.voice}</span></button>
    </div>`;
  }

  function ensure(){
    const lang=validLang();
    document.querySelectorAll(".top-actions").forEach(top=>{
      let nav=top.querySelector("[data-shared-nav]");
      if(!nav){
        top.querySelectorAll(".carepath-nav-tools").forEach(el=>el.remove());
        top.insertAdjacentHTML("afterbegin",navMarkup());
        nav=top.querySelector("[data-shared-nav]");
      }
      const select=nav?.querySelector("[data-nav-language]");
      if(select)select.value=lang;
    });

    /* accessibility.js owns the panel DOM. Keep its labels synchronized. */
    const p=PANEL[lang];
    const panel=document.querySelector(".accessibility-panel");
    if(panel&&p){
      const heading=panel.querySelector("h2");
      const desc=panel.querySelector("p");
      const normal=panel.querySelector('[data-a11y-size="normal"]');
      const large=panel.querySelector('[data-a11y-size="large"]');
      const xlarge=panel.querySelector('[data-a11y-size="xlarge"]');
      const contrast=panel.querySelector('[data-a11y-contrast]');
      const motion=panel.querySelector('[data-a11y-motion]');
      const underline=panel.querySelector('[data-a11y-underline]');
      const reset=panel.querySelector('[data-a11y-reset]');
      if(heading)heading.textContent=p.title;
      if(desc)desc.textContent=p.desc;
      if(normal)normal.textContent=p.normal;
      if(large)large.textContent=p.large;
      if(xlarge)xlarge.textContent=p.xlarge;
      if(contrast)contrast.textContent=p.contrast;
      if(motion)motion.textContent=p.motion;
      if(underline)underline.textContent=p.underline;
      if(reset)reset.textContent=p.reset;
    }
    document.documentElement.lang=lang;
    document.body.dataset.language=lang;
  }

  function setLanguage(lang){
    if(!LANGS[lang])return;
    localStorage.setItem(LANG_KEY,lang);
    localStorage.setItem(A11Y_LANG_KEY,lang);
    /* Reload from a clean render so translation never compounds. */
    location.reload();
  }

  document.addEventListener("change",e=>{
    if(e.target.matches?.("[data-nav-language]"))setLanguage(e.target.value);
  });

  const observer=new MutationObserver(()=>queueMicrotask(ensure));
  observer.observe(document.body,{childList:true,subtree:true});
  window.addEventListener("hashchange",()=>setTimeout(ensure,0));
  window.addEventListener("storage",e=>{if(e.key===LANG_KEY||e.key===A11Y_LANG_KEY)ensure();});
  setTimeout(ensure,0);
})();
