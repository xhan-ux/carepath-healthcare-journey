/* CarePath shared navigation.
   Owns the visible navbar shell so route re-renders cannot make controls disappear.
   Language is persisted to both legacy/new keys, then the page reloads so every
   translator starts from the same language state. */
(function(){
  const LANG_KEY="carepath:language:v1";
  const A11Y_LANG_KEY="carepath:language:v3";
  const LANGS={en:"EN",hi:"हिं",kn:"ಕನ್ನಡ"};
  const LABELS={
    en:{access:"Accessibility",language:"Language",voice:"Read aloud"},
    hi:{access:"सुलभता",language:"भाषा",voice:"पढ़कर सुनाएँ"},
    kn:{access:"ಪ್ರವೇಶಸಾಧ್ಯತೆ",language:"ಭಾಷೆ",voice:"ಓದಿ ಕೇಳಿಸಿ"}
  };
  const getLang=()=>localStorage.getItem(LANG_KEY)||localStorage.getItem(A11Y_LANG_KEY)||"en";
  const validLang=()=>Object.prototype.hasOwnProperty.call(LANGS,getLang())?getLang():"en";
  const labels=()=>LABELS[validLang()]||LABELS.en;

  function navMarkup(){
    const l=labels();
    return `<div class="carepath-nav-tools" data-shared-nav>
      <button class="nav-tool" type="button" data-nav-a11y aria-haspopup="dialog"><span aria-hidden="true">♿</span><span>${l.access}</span></button>
      <label class="nav-language"><span class="sr-only">${l.language}</span><select data-nav-language aria-label="${l.language}"><option value="en">EN</option><option value="hi">हिं</option><option value="kn">ಕನ್ನಡ</option></select></label>
      <button class="nav-tool nav-voice" type="button" data-nav-voice><span aria-hidden="true">🔊</span><span>${l.voice}</span></button>
    </div>`;
  }

  function ensure(){
    document.querySelectorAll(".top-actions").forEach(top=>{
      let nav=top.querySelector("[data-shared-nav]");
      if(!nav){
        top.querySelectorAll(".carepath-nav-tools").forEach(el=>el.remove());
        top.insertAdjacentHTML("afterbegin",navMarkup());
        nav=top.querySelector("[data-shared-nav]");
      }
      const select=nav?.querySelector("[data-nav-language]");
      if(select)select.value=validLang();
    });
    document.documentElement.lang=validLang();
    document.body.dataset.language=validLang();
  }

  function setLanguage(lang){
    if(!LANGS[lang])return;
    localStorage.setItem(LANG_KEY,lang);
    localStorage.setItem(A11Y_LANG_KEY,lang);
    location.reload();
  }

  document.addEventListener("change",e=>{
    if(e.target.matches?.("[data-nav-language]"))setLanguage(e.target.value);
  });

  document.addEventListener("click",e=>{
    const voice=e.target.closest?.("[data-nav-voice]");
    if(voice){
      if(!window.speechSynthesis)return;
      if(speechSynthesis.speaking){speechSynthesis.cancel();return;}
      const main=document.querySelector("main");
      if(!main)return;
      const text=[...main.querySelectorAll("h1,h2,h3,p,b,strong,button,li")].map(x=>x.innerText.trim()).filter(Boolean).join(". ");
      const u=new SpeechSynthesisUtterance(text);
      u.lang=validLang()==="hi"?"hi-IN":validLang()==="kn"?"kn-IN":"en-IN";
      u.rate=.92;
      speechSynthesis.speak(u);
    }
  });

  const observer=new MutationObserver(()=>queueMicrotask(ensure));
  observer.observe(document.body,{childList:true,subtree:true});
  window.addEventListener("hashchange",()=>setTimeout(ensure,0));
  window.addEventListener("storage",e=>{if(e.key===LANG_KEY||e.key===A11Y_LANG_KEY)ensure();});
  setTimeout(ensure,0);
})();
