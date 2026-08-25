const CP_AI_KB = [
  { keys:["opd","out patient","outpatient"], answer:"OPD means Outpatient Department. It is where you see a doctor without being admitted to the hospital." },
  { keys:["appointment","book","booking","ors"], answer:"For a new OPD appointment, CarePath explains the steps and then sends you to the official Online Registration System. There you verify your mobile number, choose the hospital and department, select an available slot, and save the confirmation. CarePath does not book the appointment itself." },
  { keys:["mobile","otp"], answer:"Keep the mobile number you use for the appointment nearby. The official booking service may send an OTP to verify it. Never share an OTP with CarePath or another person." },
  { keys:["arrive","arrival","hospital"], answer:"When you arrive, CarePath's demo tells you the next action, such as which counter or area to go to. Bring your appointment confirmation and the identification the hospital asks for." },
  { keys:["registration","register","counter"], answer:"Registration is the hospital's check-in step. In this prototype, the patient is guided to the registration counter and then shown the next step once registration is complete." },
  { keys:["queue","token","wait"], answer:"Queue or token information is contextual here, not a queue-management system. CarePath only shows it when it helps explain what the patient should do next." },
  { keys:["room","change","moved"], answer:"If the room changes, CarePath can show the updated room and tell the patient where to go. The hospital remains the source of truth for the actual location." },
  { keys:["called","turn","consultation","doctor"], answer:"When the patient is called, the next step is to go to the displayed room. During consultation, CarePath simply explains the current visit state; it does not provide a diagnosis or medical advice." },
  { keys:["lab","test","diagnostic"], answer:"After consultation, a patient may be directed to a lab or diagnostics counter. Follow the hospital's prescription or instructions for preparation and location." },
  { keys:["pharmacy","medicine","medicines"], answer:"If the visit includes pharmacy, the patient is shown that pharmacy is next and can be guided to the relevant counter. The hospital or prescription is the source of truth for medicines." },
  { keys:["pension"], answer:"The same public-service journey idea can be used for pensions: understand the need, find the official service, learn the required steps, submit there, and track the result." },
  { keys:["certificate","birth certificate","document"], answer:"For certificates, CarePath can explain which official service to use, what information or documents to prepare, how to submit, and how to track the request. The official government service remains the source of truth." },
  { keys:["grievance","complaint","problem","report"], answer:"For a grievance, the journey can be: choose the complaint category, submit it through the official service, save the reference ID, and track the resolution." },
  { keys:["staff","help desk"], answer:"Staff use the synthetic simulator to advance the same patient journey state. Actions such as calling a patient or changing a room update what the patient sees on the other device." },
  { keys:["carepath","what is this"], answer:"CarePath is a synthetic public-service journey layer. It helps people understand the official service, what to prepare, and the next step without pretending to replace the government or hospital system." }
];

function cpAnswer(question){
  const q=question.toLowerCase().trim();
  if(!q) return "Ask me about OPD, appointments, arrival, registration, tokens, room changes, consultation, labs, pharmacy, staff actions, pensions, certificates, or grievances.";
  const hit=CP_AI_KB.find(item=>item.keys.some(k=>q.includes(k)));
  if(hit) return hit.answer;
  return "I can explain the CarePath prototype and its public-service journey, but I don't have access to live hospital records. Try asking: ‘What is OPD?’, ‘What do I do after arrival?’, ‘How do I book an appointment?’, or ‘What happens after consultation?’";
}

function cpAssistant(){
  if(document.querySelector(".cp-ai-launcher")) return;
  const launcher=document.createElement("button");
  launcher.className="cp-ai-launcher";
  launcher.type="button";
  launcher.setAttribute("aria-label","Open CarePath assistant");
  launcher.innerHTML='<span class="cp-ai-spark">✦</span><span>Ask CarePath</span>';

  const panel=document.createElement("section");
  panel.className="cp-ai-panel";
  panel.hidden=true;
  panel.innerHTML=`<div class="cp-ai-head"><div><p>CAREPATH ASSISTANT</p><strong>What can I explain?</strong></div><button type="button" class="cp-ai-close" aria-label="Close assistant">×</button></div><div class="cp-ai-note">Synthetic local assistant · no API key or credits required. Not medical advice.</div><div class="cp-ai-messages"><div class="cp-ai-msg assistant">Hi! I can explain the journey in simple words. What are you trying to do?</div></div><div class="cp-ai-chips"><button type="button">What is OPD?</button><button type="button">How do I book?</button><button type="button">What happens after arrival?</button><button type="button">Where do I go next?</button></div><form class="cp-ai-form"><input aria-label="Ask CarePath" placeholder="Ask anything…" autocomplete="off"><button type="submit" aria-label="Send">↗</button></form>`;
  document.body.append(launcher,panel);
  const messages=panel.querySelector(".cp-ai-messages");
  const input=panel.querySelector("input");
  function add(text,who){const el=document.createElement("div");el.className=`cp-ai-msg ${who}`;el.textContent=text;messages.appendChild(el);messages.scrollTop=messages.scrollHeight;}
  function ask(text){if(!text.trim())return;add(text,"user");setTimeout(()=>add(cpAnswer(text),"assistant"),90);input.value="";}
  launcher.addEventListener("click",()=>{panel.hidden=!panel.hidden;if(!panel.hidden)input.focus();});
  panel.querySelector(".cp-ai-close").addEventListener("click",()=>panel.hidden=true);
  panel.querySelector(".cp-ai-form").addEventListener("submit",e=>{e.preventDefault();ask(input.value);});
  panel.querySelectorAll(".cp-ai-chips button").forEach(b=>b.addEventListener("click",()=>ask(b.textContent)));
}

window.addEventListener("DOMContentLoaded",cpAssistant);
window.addEventListener("hashchange",cpAssistant);
setTimeout(cpAssistant,150);
