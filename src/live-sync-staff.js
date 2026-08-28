/* Live two-device bridge for the synthetic CarePath demo. */
(() => {
  const STAFF_KEY = "carepath:staff:patients:v2";
  const STATION_KEY = "carepath:staff:station:v1";
  const LIVE_KEY = "carepath:last-live-journey:v1";
  const defaultPatients = [
    {id:"DEMO-042",name:"Ravi Kumar",token:"42",state:"APPOINTMENT_CONFIRMED",doctor:"Dr. Mehta",room:"202",queueAhead:null,appointment:"10:30 AM",updated:"10:12 AM",hold:false},
    {id:"DEMO-043",name:"Priya Shah",token:"43",state:"WAITING",doctor:"Dr. Mehta",room:"204",queueAhead:2,appointment:"10:40 AM",updated:"10:15 AM",hold:false},
    {id:"DEMO-044",name:"Arjun Mehta",token:"44",state:"WAITING",doctor:"Dr. Mehta",room:"204",queueAhead:3,appointment:"10:50 AM",updated:"10:16 AM",hold:false},
    {id:"DEMO-045",name:"Neha Rao",token:"45",state:"ARRIVED",doctor:"Dr. Mehta",room:"202",queueAhead:null,appointment:"11:00 AM",updated:"10:18 AM",hold:false},
    {id:"DEMO-046",name:"Karan Singh",token:"46",state:"CALLED",doctor:"Dr. Mehta",room:"204",queueAhead:0,appointment:"11:10 AM",updated:"10:20 AM",hold:false},
    {id:"DEMO-047",name:"Ananya Das",token:"47",state:"CONSULTATION",doctor:"Dr. Mehta",room:"204",queueAhead:null,appointment:"11:20 AM",updated:"10:21 AM",hold:false},
    {id:"DEMO-048",name:"Vikram Patel",token:"48",state:"COMPLETED",doctor:"Dr. Mehta",room:"204",queueAhead:null,appointment:"11:30 AM",updated:"10:05 AM",hold:false}
  ];
  const stations = [
    ["registration", "Registration", "Check-in, registration & queue"],
    ["doctor", "Doctor", "Calling & consultation"],
    ["lab", "Lab", "Tests & diagnostics"],
    ["pharmacy", "Pharmacy", "Medicines & completion"]
  ];
  let busy = false;
  let lastJourneyKey = "";

  function readPatients() {
    try { return JSON.parse(localStorage.getItem(STAFF_KEY) || "null"); } catch { return null; }
  }

  function syncStaff(journey) {
    if(!journey?.patient?.id) return;
    let patients = readPatients();
    if(!Array.isArray(patients) || patients.length !== 7) patients = structuredClone(defaultPatients);
    const i = patients.findIndex(p => p.id === journey.patient.id);
    if(i < 0) return;
    patients[i] = {...patients[i],state:journey.state,room:journey.room,queueAhead:journey.queueAhead,updated:journey.lastUpdated};
    const value = JSON.stringify(patients);
    localStorage.setItem(STAFF_KEY,value);
    window.dispatchEvent(new StorageEvent("storage",{key:STAFF_KEY,newValue:value}));
  }

  function stationForState(state) {
    return ({APPOINTMENT_CONFIRMED:"registration",ARRIVED:"registration",WAITING:"registration",CALLED:"doctor",CONSULTATION:"doctor",LAB:"lab",PHARMACY:"pharmacy",COMPLETED:"pharmacy"})[state] || "registration";
  }

  function updateStationUI(state) {
    const shell=document.querySelector(".cp-staff-command");
    if(!shell) return;
    const active=localStorage.getItem(STATION_KEY)||stationForState(state);
    shell.querySelectorAll("[data-cp-station]").forEach(b=>b.classList.toggle("active",b.dataset.cpStation===active));
  }

  function addStations() {
    const shell=document.querySelector(".cp-staff-command");
    if(!shell||shell.querySelector(".cp-stations")) return;
    const top=shell.querySelector(".cp-staff-top");
    if(!top) return;
    const wrap=document.createElement("section");
    wrap.className="cp-stations";
    wrap.innerHTML=`<div class="cp-stations-head"><div><span>STAFF WORKSTATIONS</span><b>Choose the part of the journey you manage</b></div><small>All stations update the same patient journey.</small></div><div class="cp-station-tabs">${stations.map(([id,name,hint])=>`<button type="button" data-cp-station="${id}"><strong>${name}</strong><span>${hint}</span></button>`).join("")}</div>`;
    top.insertAdjacentElement("afterend",wrap);
    wrap.querySelectorAll("[data-cp-station]").forEach(button=>button.addEventListener("click",()=>{localStorage.setItem(STATION_KEY,button.dataset.cpStation);updateStationUI(button.dataset.cpStation);}));
    updateStationUI();
  }

  function applyJourney(journey) {
    if(!journey) return;
    const key=`${journey.state}|${journey.room}|${journey.queueAhead}|${journey.lastUpdated}`;
    if(key===lastJourneyKey) return;
    lastJourneyKey=key;
    syncStaff(journey);
    updateStationUI(journey.state);
    const role=sessionStorage.getItem("carepath:role:v6");
    const patientPage=role==="patient"&&location.hash.startsWith("#/healthcare/visit/");
    const previous=sessionStorage.getItem(LIVE_KEY);
    sessionStorage.setItem(LIVE_KEY,key);
    if(patientPage&&previous&&previous!==key) location.reload();
  }

  async function pull() {
    if(busy||!location.protocol.startsWith("http")) return;
    busy=true;
    try{const response=await fetch("/api/state",{cache:"no-store"});if(response.ok){const data=await response.json();if(data.journey)applyJourney(data.journey);}}catch{}finally{busy=false;}
  }

  function connect() {
    if(!window.EventSource||!location.protocol.startsWith("http")) return;
    try{const stream=new EventSource("/api/events");stream.addEventListener("journey",event=>{try{applyJourney(JSON.parse(event.data).journey);}catch{}});stream.addEventListener("reset",event=>{try{applyJourney(JSON.parse(event.data).journey);}catch{}});}catch{}
  }

  const observer=new MutationObserver(()=>addStations());
  observer.observe(document.body,{childList:true,subtree:true});
  window.addEventListener("DOMContentLoaded",()=>{addStations();pull();connect();setInterval(pull,2000);});
  setTimeout(()=>{addStations();pull();},500);
})();
