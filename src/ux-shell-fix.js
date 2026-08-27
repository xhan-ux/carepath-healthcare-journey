/* CarePath shell stabilizer.
   Accessibility.js owns the single shared navigation + language controls.
   This file intentionally does NOT inject another navbar or translate the DOM,
   which previously caused duplicate language buttons and state getting stuck. */
(function(){
  const LANG_KEY="carepath:language:v3";
  const normalize=()=>{
    const lang=localStorage.getItem(LANG_KEY)||"en";
    document.documentElement.lang=lang==="hi"?"hi":lang==="kn"?"kn":"en";
    document.body.dataset.language=document.documentElement.lang;
  };
  const cleanLegacyControls=()=>{
    document.querySelectorAll(".carepath-legacy-language,.legacy-language-controls,[data-legacy-language]").forEach(el=>el.remove());
    document.querySelectorAll("button").forEach(btn=>{
      const text=(btn.textContent||"").trim();
      if(["GB English","IN हिन्दी","ಕನ್ನಡ"].includes(text) && !btn.closest(".carepath-nav-tools")) btn.remove();
    });
  };
  const keepBrandStable=()=>{
    document.querySelectorAll(".brand").forEach(brand=>{
      if(!brand.dataset.cpBrandBound){
        brand.dataset.cpBrandBound="1";
        brand.setAttribute("href","#/services");
        brand.addEventListener("click",e=>{e.preventDefault();location.hash="/services";});
      }
    });
  };
  const sync=()=>{normalize();cleanLegacyControls();keepBrandStable();};
  new MutationObserver(()=>queueMicrotask(sync)).observe(document.body,{childList:true,subtree:true});
  window.addEventListener("hashchange",()=>setTimeout(sync,0));
  window.addEventListener("storage",e=>{if(e.key===LANG_KEY)sync();});
  sync();
})();
