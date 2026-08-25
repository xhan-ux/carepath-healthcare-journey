const CP_STAFF_STEPS=["Appointment","Arrive","Registration","Called","Consultation","Lab","Pharmacy","Complete"];
function cpStaffRole(){try{return sessionStorage.getItem("carepath:role:v6")==="staff"}catch{return false}}
function cpStaffText(){return (document.querySelector("#app")?.innerText||"").toLowerCase()}
function cpStaffState(){const t=cpStaffText();if(t.includes("consultation in progress"))return 4;if(t.includes("your turn")||t.includes("called"))return 3;if(t.includes("registration complete")||t.includes("checked in"))return 2;if(t.includes("you’re at the hospital")||t.includes("check in"))return 1;return 0}
function cpFindButton(words){const buttons=[...document.querySelectorAll("#app button")];return buttons.find(b=>words.some(w=>b.textContent.toLowerCase().includes(w)))}
function cpStaffView(){
  if(!cpStaffRole()||document.querySelector(".cp-staff-command"))return;
  const shell=document.createElement("section");shell.className="cp-staff-command";
  const state=cpStaffState();
  shell.innerHTML=`<div class="cp-staff-sidebar"><div class="cp-staff-hospital"><span>✚</span><div><b>City Government Hospital</b><small>Orthopaedics OPD</small></div></div><nav><button class="active">⌂ <span>Dashboard</span></button><button>◷ <span>Queue</span></button><button>♙ <span>Patients</span></button><button>◌ <span>Announcements</span></button><button>⚙ <span>Settings</span></button></nav><p>All data is synthetic.</p></div><div class="cp-staff-main"><div class="cp-staff-top"><div><p>STAFF PANEL · SYNTHETIC</p><h2>Good morning, Staff.</h2><span>Help desk · Orthopaedics · Dr. Mehta</span></div><div class="cp-staff-user">STAFF-ORTHO <b>●</b></div></div><div class="cp-staff-grid"><article class="cp-staff-card cp-state-card"><div class="cp-card-title"><span>CURRENT VISIT</span><b>Ravi Kumar</b></div><div class="cp-staff-stats"><div><small>Status</small><strong>${CP_STAFF_STEPS[state]}</strong></div><div><small>Doctor</small><strong>Dr. Mehta</strong></div><div><small>Room</small><strong>204</strong></div><div><small>Token</small><strong>42</strong></div></div></article><article class="cp-staff-card"><div class="cp-card-title"><span>ACTIONS</span><b>Update the journey</b></div><div class="cp-staff-actions"><button data-cp-staff="call">Call next patient</button><button data-cp-staff="room">Change room</button><button data-cp-staff="hold">Hold / pause</button><button data-cp-staff="complete">Complete consultation</button><button class="muted" data-cp-staff="sms">Send SMS update</button></div></article></div><div class="cp-staff-journey"><div class="cp-card-title"><span>PATIENT JOURNEY</span><b>Same journey, staff side</b></div><div class="cp-staff-rail">${CP_STAFF_STEPS.map((x,i)=>`<div class="${i<state?"done ":i===state?"current ":""}"><span>${i<state?"✓":i+1}</span><small>${x}</small></div>`).join("")}</div></div></div>`;
  const app=document.querySelector("#app");app.prepend(shell);
  shell.querySelectorAll("[data-cp-staff]").forEach(btn=>btn.addEventListener("click",()=>{
    const type=btn.dataset.cpStaff;
    const map={call:["call next patient","call patient","i’m on my way"],room:["change room","room"],hold:["hold","pause"],complete:["complete consultation","consultation complete"],sms:["send sms","sms update"]};
    const target=cpFindButton(map[type]||[]);
    if(target){target.click();setTimeout(cpRefreshStaff,120)}
    else if(type==="room"){const t=cpFindButton(["change room","room"]);if(t)t.click()}
  }));
}
function cpRefreshStaff(){document.querySelector(".cp-staff-command")?.remove();cpStaffView()}
window.addEventListener("DOMContentLoaded",()=>setTimeout(cpStaffView,120));
window.addEventListener("hashchange",()=>setTimeout(()=>{if(cpStaffRole())cpRefreshStaff()},180));
setTimeout(cpStaffView,250);
