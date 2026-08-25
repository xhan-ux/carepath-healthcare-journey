const CP_AI_KB = [
  { keys:["opd","out patient","outpatient"], answer:"OPD means Outpatient Department. It is where you see a doctor without being admitted to the hospital." },
  { keys:["appointment","book","booking","ors"], answer:"For a new OPD appointment, CarePath explains the route and then sends you to the official Online Registration System. There you verify your mobile number, choose the hospital and department, select an available slot, and save the confirmation. CarePath does not book the appointment itself." },
  { keys:["mobile","otp"], answer:"Keep the mobile number you use for the appointment nearby. The official booking service may send an OTP to verify it. Never share an OTP with CarePath." },
  { keys:["arrive","arrival"], answer:"When you arrive, CarePath shows the next verified action. In this demo that means taking your appointment ID to Counter 3 in OPD Block A, Ground Floor." },
  { keys:["registration","register","counter"], answer:"Registration is the hospital check-in step. In this demo, go to Counter 3 with your appointment details; once staff complete registration, your token and queue position appear here." },
  { keys:["queue","token","wait"], answer:"Your token is your place in the hospital's calling sequence. CarePath shows the latest verified queue information, but it does not predict an exact waiting time." },
  { keys:["room","change","moved"], answer:"If staff change the consultation room, CarePath shows the new room and tells you what changed. The hospital remains the source of truth for the actual location." },
  { keys:["called","turn","consultation","doctor"], answer:"When your token is called, go to the displayed room. During consultation, CarePath explains the visit state but does not provide diagnosis or medical advice." },
  { keys:["lab","test","diagnostic","report"], answer:"After consultation, a patient may be directed to a lab or diagnostics counter. Follow the hospital's prescription or instructions for preparation and location. CarePath should only show a report reference when the prototype has one." },
  { keys:["pharmacy","medicine","medicines"], answer:"If the visit includes pharmacy, CarePath can show the pharmacy as the next step. The prescription and hospital are the source of truth for medicines." },
  { keys:["pension"], answer:"The same journey model can help with pensions: understand the need, find the official service, learn what is required, submit there, and track the result." },
  { keys:["certificate","birth certificate","document"], answer:"For certificates, CarePath can explain which official service to use, what to prepare, how to submit, and how to track the request. The official service remains the source of truth." },
  { keys:["grievance","complaint","problem","report"], answer:"For a grievance, the journey can be: choose the category, submit through the official service, save the reference ID, and track the resolution." },
  { keys:["staff","help desk"], answer:"Staff use the synthetic simulator to update the same patient journey. Calling a patient, changing a room, or completing a step changes what the patient sees." },
  { keys:["carepath","what is this"], answer:"CarePath is a synthetic public-service journey layer. It explains the official process, what to prepare, and the next step without pretending to replace the government or hospital system." }
];

let cpJourney = null;
async function cpLoadJourney(){
  try{const r=await fetch("/api/state",{cache:"no-store"});if(!r.ok)throw new Error();const data=await r.json();cpJourney=data.journey||null;return cpJourney;}catch{return cpJourney;}
}

function cpLocalAnswer(question,journey=cpJourney){
  const q=question.toLowerCase().trim();
  if(!q)return "Ask me what to do next, what to bring, where to go, or how any CarePath step works.";
  if(/where.*(go|next)|what.*(do|next)|next step|what now/.test(q) && journey){
    const s=journey.state;
    if(s==="APPOINTMENT_CONFIRMED")return `Your appointment is confirmed for ${journey.appointment.department} with ${journey.appointment.clinician}. Next: arrive at ${journey.visit.building} and take your appointment ID to ${journey.visit.registrationCounter}.`;
    if(s==="ARRIVED")return `You’re at the hospital. Next: go to ${journey.visit.registrationCounter} in ${journey.visit.building} and show your appointment ID.`;
    if(s==="WAITING")return `Registration is complete. Your token is ${journey.visit.token}. Stay near ${journey.appointment.department}; ${journey.queueAhead ?? 0} patients are ahead of you.`;
    if(s==="CALLED")return `It’s your turn. Please go to ${journey.appointment.department}, Room ${journey.room} now.`;
    if(s==="CONSULTATION")return `You’re with ${journey.appointment.clinician} in Room ${journey.room}. The next verified step will appear after consultation.`;
    if(s==="LAB")return "Your consultation is complete. Follow the hospital instruction to the lab or diagnostics counter.";
    if(s==="PHARMACY")return "Your lab step is complete. Go to the pharmacy counter and follow the hospital prescription.";
    if(s==="COMPLETED")return "Your synthetic visit is complete. There are no further CarePath steps for this demo.";
  }
  if(/bring|prepare|carry/.test(q))return "Before your visit, keep your appointment confirmation or ID, the mobile number used for booking, and any identification or referral the hospital asks for. Do not share OTPs with CarePath.";
  const hit=CP_AI_KB.find(item=>item.keys.some(k=>q.includes(k)));
  if(hit)return hit.answer;
  return "I can explain CarePath's healthcare journey and the current next step. Ask me things like ‘Where do I go next?’, ‘What is my token?’, ‘What should I bring?’, ‘How do I book?’, or ‘What happens after consultation?’";
}

async function cpAiAnswer(question){
  const journey=await cpLoadJourney();
  try{
    const response=await fetch("/api/assistant",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question,journey})});
    if(response.ok){const data=await response.json();if(data.answer)return data.answer;}
  }catch{}
  return cpLocalAnswer(question,journey);
}

function cpAssistant(){
  if(document.querySelector(".cp-ai-launcher"))return;
  const launcher=document.createElement("button");launcher.className="cp-ai-launcher";launcher.type="button";launcher.setAttribute("aria-label","Open CarePath assistant");launcher.innerHTML='<span class="cp-ai-spark">✦</span><span>Ask CarePath</span>';
  const panel=document.createElement("section");panel.className="cp-ai-panel";panel.hidden=true;
  panel.innerHTML=`<div class="cp-ai-head"><div><p>CAREPATH ASSISTANT</p><strong>What can I explain?</strong></div><button type="button" class="cp-ai-close" aria-label="Close assistant">×</button></div><div class="cp-ai-note">AI journey assistant · uses the current synthetic visit when available. Not medical advice.</div><div class="cp-ai-messages"><div class="cp-ai-msg assistant">Hi! I can explain your CarePath journey in simple words. What are you trying to do?</div></div><div class="cp-ai-chips"><button type="button">Where do I go next?</button><button type="button">What is my token?</button><button type="button">What should I bring?</button><button type="button">How do I book?</button></div><form class="cp-ai-form"><input aria-label="Ask CarePath" placeholder="Ask anything…" autocomplete="off"><button type="submit" aria-label="Send">↗</button></form>`;
  document.body.append(launcher,panel);
  const messages=panel.querySelector(".cp-ai-messages"),input=panel.querySelector("input");
  function add(text,who){const el=document.createElement("div");el.className=`cp-ai-msg ${who}`;el.textContent=text;messages.appendChild(el);messages.scrollTop=messages.scrollHeight;return el;}
  function typing(){const el=document.createElement("div");el.className="cp-ai-msg assistant cp-ai-typing";el.innerHTML='<span></span><span></span><span></span>';messages.appendChild(el);messages.scrollTop=messages.scrollHeight;return el;}
  async function ask(text){if(!text.trim())return;add(text.trim(),"user");input.value="";input.disabled=true;panel.querySelector(".cp-ai-form button").disabled=true;const indicator=typing();const started=Date.now();const answerPromise=cpAiAnswer(text.trim());let answer;try{answer=await answerPromise;}catch{answer=cpLocalAnswer(text.trim());}const wait=Math.max(0,2200-(Date.now()-started));setTimeout(()=>{indicator.remove();add(answer,"assistant");input.disabled=false;panel.querySelector(".cp-ai-form button").disabled=false;input.focus();},wait);}
  launcher.addEventListener("click",()=>{panel.hidden=!panel.hidden;if(!panel.hidden){cpLoadJourney();input.focus();}});
  panel.querySelector(".cp-ai-close").addEventListener("click",()=>panel.hidden=true);
  panel.querySelector(".cp-ai-form").addEventListener("submit",e=>{e.preventDefault();ask(input.value);});
  panel.querySelectorAll(".cp-ai-chips button").forEach(b=>b.addEventListener("click",()=>ask(b.textContent)));
}

window.addEventListener("DOMContentLoaded",cpAssistant);
window.addEventListener("hashchange",cpAssistant);
setTimeout(cpAssistant,150);
