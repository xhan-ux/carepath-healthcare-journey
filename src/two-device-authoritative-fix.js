/* Authoritative staff-side bridge. Patient realtime is owned by app.js only. */
(() => {
  const KEYS=["carepath:role:v6","carepath:demo-role:v2","carepath:role:v2"];
  const role=()=>KEYS.map(k=>{try{return sessionStorage.getItem(k)}catch{return null}}).find(Boolean)||null;
  const isStaff=()=>role()==="staff";
  const RAVI="DEMO-042";
  let busy=false;
  async function state(){
    const r=await fetch(`/api/state?authoritative=${Date.now()}`,{cache:"no-store"});
    const d=await r.json().catch(()=>({}));
    if(!r.ok||!d.journey)throw new Error(d.error||"Could not read shared journey.");
    return d.journey;
  }
  const allowed={
    PATIENT_ARRIVED:["APPOINTMENT_CONFIRMED"],CHECKED_IN:["ARRIVED"],QUEUE_ADVANCED:["WAITING"],
    ROOM_CHANGED:["ARRIVED","WAITING","CALLED","CONSULTATION"],CALL_PATIENT:["WAITING"],
    START_CONSULTATION:["CALLED"],COMPLETE_CONSULTATION:["CONSULTATION"],COMPLETE_LAB:["LAB"],COMPLETE_PHARMACY:["PHARMACY"]
  };
  async function send(type,extra={}){
    if(busy)return;
    busy=true;
    try{
      const j=await state();
      if(j.patient?.id!==RAVI)throw new Error("Shared demo patient is not Ravi Kumar.");
      if(!allowed[type]?.includes(j.state))throw new Error(`Staff view was stale. Ravi is actually ${String(j.state).replaceAll("_"," ")}. Refreshing.`);
      if(type==="CALL_PATIENT"&&(j.queueAhead??0)>0)throw new Error(`Ravi still has ${j.queueAhead} patient(s) ahead.`);
      const r=await fetch("/api/event",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({role:"staff",type,...extra})});
      const d=await r.json().catch(()=>({}));
      if(!r.ok)throw new Error(d.error||"Could not update shared journey.");
      return d.journey;
    }finally{busy=false}
  }
  function selectedRavi(){return !!document.querySelector('.cp-patient-row[data-patient="DEMO-042"]')?.classList.contains("selected")}
  function notice(msg){const n=document.querySelector(".cp-staff-notice");if(!n)return;n.hidden=false;n.textContent=msg;setTimeout(()=>n.hidden=true,2600)}
  function contextType(text){
    const t=text.toLowerCase();
    if(t.includes("mark arrived"))return ["PATIENT_ARRIVED",{description:"Ravi arrived at the hospital"}];
    if(t.includes("complete registration"))return ["CHECKED_IN",{queueAhead:3,description:"Registration completed — Ravi joined the queue"}];
    if(t.includes("advance queue"))return ["QUEUE_ADVANCED",{description:"Queue advanced"}];
    if(t.includes("start consultation"))return ["START_CONSULTATION",{description:"Patient moved into consultation"}];
    if(t.includes("complete consultation"))return ["COMPLETE_CONSULTATION",{description:"Consultation completed — lab is next"}];
    if(t.includes("complete lab"))return ["COMPLETE_LAB",{description:"Lab step completed — pharmacy is next"}];
    if(t.includes("complete pharmacy"))return ["COMPLETE_PHARMACY",{description:"Pharmacy step completed — visit done"}];
    return [null,{}];
  }
  document.addEventListener("click",async e=>{
    if(!isStaff()||!selectedRavi())return;
    const c=e.target.closest?.("[data-cp-context]");
    const a=e.target.closest?.("[data-cp-staff]");
    if(!c&&!a)return;
    let type,extra;
    if(c)[type,extra]=contextType(c.textContent||"");
    else if(a.dataset.cpStaff==="call")[type,extra]=["CALL_PATIENT",{description:"Token 42 called to Room 202"}];
    else if(a.dataset.cpStaff==="room"){
      const j=await state().catch(()=>null);if(!j)return;
      [type,extra]=["ROOM_CHANGED",{room:j.room==="202"?"204":"202",description:`Consultation room changed from ${j.room} to ${j.room==="202"?"204":"202"}`}];
    }else if(a.dataset.cpStaff==="complete")[type,extra]=["COMPLETE_CONSULTATION",{description:"Consultation completed — lab is next"}];
    else return;
    if(!type)return;
    e.preventDefault();e.stopImmediatePropagation();
    try{const j=await send(type,extra);notice(`Shared journey updated · ${String(j.state).replaceAll("_"," ")}`);setTimeout(()=>location.reload(),50)}
    catch(err){notice(err.message);setTimeout(()=>location.reload(),50)}
  },true);
})();
