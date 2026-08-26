const LANG_KEY="carepath:language:v1";
const labels={
 en:{access:"Accessibility",language:"Language",voice:"Read aloud",stop:"Stop reading",home:"Services",patient:"Patient",staff:"Staff"},
 hi:{access:"सुलभता",language:"भाषा",voice:"पढ़कर सुनाएँ",stop:"पढ़ना रोकें",home:"सेवाएँ",patient:"मरीज़",staff:"स्टाफ"},
 kn:{access:"ಪ್ರವೇಶಸಾಧ್ಯತೆ",language:"ಭಾಷೆ",voice:"ಓದಿ ಕೇಳಿಸಿ",stop:"ಓದುವುದನ್ನು ನಿಲ್ಲಿಸಿ",home:"ಸೇವೆಗಳು",patient:"ರೋಗಿ",staff:"ಸಿಬ್ಬಂದಿ"}
};
let lang=localStorage.getItem(LANG_KEY)||"en";
function t(k){return labels[lang]?.[k]||labels.en[k]||k}
function inject(){
 if(document.querySelector(".carepath-nav-tools"))return;
 const top=document.querySelector(".top-actions"); if(!top)return;
 const wrap=document.createElement("div");wrap.className="carepath-nav-tools";wrap.innerHTML=`
 <button class="nav-tool" type="button" data-nav-a11y aria-haspopup="dialog">♿ <span>${t("access")}</span></button>
 <label class="nav-language"><span class="sr-only">${t("language")}</span><select data-nav-language aria-label="${t("language")}"><option value="en">EN</option><option value="hi">हिं</option><option value="kn">ಕನ್ನಡ</option></select></label>
 <button class="nav-tool nav-voice" type="button" data-nav-voice>🔊 <span>${t("voice")}</span></button>`;
 top.prepend(wrap);
 wrap.querySelector("[data-nav-language]").value=lang;
 wrap.querySelector("[data-nav-language]").addEventListener("change",e=>{lang=e.target.value;localStorage.setItem(LANG_KEY,lang);applyLanguageShell();});
 wrap.querySelector("[data-nav-a11y]").addEventListener("click",()=>document.querySelector(".accessibility-trigger")?.click());
 wrap.querySelector("[data-nav-voice]").addEventListener("click",()=>{if(!("speechSynthesis" in window))return; if(speechSynthesis.speaking){speechSynthesis.cancel();return;} const main=document.querySelector("main"); if(!main)return; const text=[...main.querySelectorAll("h1,h2,h3,p,b,strong,button,li")].map(x=>x.innerText.trim()).filter(Boolean).join(". "); const u=new SpeechSynthesisUtterance(text);u.lang=lang==="hi"?"hi-IN":lang==="kn"?"kn-IN":"en-IN";u.rate=.92;speechSynthesis.speak(u);});
}
function applyLanguageShell(){
 document.querySelectorAll("[data-nav-language]").forEach(x=>x.value=lang);
 const a=document.querySelector("[data-nav-a11y] span");if(a)a.textContent=t("access");
 const v=document.querySelector("[data-nav-voice] span");if(v)v.textContent=t("voice");
 const l=document.querySelector(".nav-language .sr-only");if(l)l.textContent=t("language");
 const sel=document.querySelector("[data-nav-language]");if(sel)sel.setAttribute("aria-label",t("language"));
}
const observer=new MutationObserver(()=>{inject();applyLanguageShell()});observer.observe(document.body,{childList:true,subtree:true});
window.addEventListener("hashchange",()=>setTimeout(()=>{inject();applyLanguageShell()},20));
setTimeout(inject,50);
