function cpInteractionFixes(){
  if(document.body.dataset.cpInteractionFixes) return;
  document.body.dataset.cpInteractionFixes="true";

  document.addEventListener("click",(event)=>{
    const close=event.target.closest?.(".cp-ai-close");
    if(close){
      event.preventDefault();
      const panel=document.querySelector(".cp-ai-panel");
      if(panel) panel.hidden=true;
      return;
    }

    const confirmed=event.target.closest?.('[data-action="already-confirmed"]');
    if(confirmed){
      event.preventDefault();
      event.stopImmediatePropagation();
      location.hash="#/healthcare/login";
      return;
    }
  },true);
}

if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",cpInteractionFixes,{once:true});
else cpInteractionFixes();
