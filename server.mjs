import http from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { applyEvent, canApplyEvent, EventType, initialJourney } from "./src/state.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "0.0.0.0";
const clients = new Set();
let journey = structuredClone(initialJourney);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.6-luna";

const mimeTypes = { ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".css":"text/css; charset=utf-8", ".json":"application/json; charset=utf-8", ".svg":"image/svg+xml", ".png":"image/png", ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".ico":"image/x-icon" };

function json(res,status,payload){res.writeHead(status,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","Access-Control-Allow-Origin":"*"});res.end(JSON.stringify(payload));}
function broadcast(eventName,payload){const message=`event: ${eventName}\ndata: ${JSON.stringify(payload)}\n\n`;for(const res of clients)res.write(message);}
function readBody(req){return new Promise((resolve,reject)=>{let body="";req.on("data",chunk=>{body+=chunk;if(body.length>100_000){reject(new Error("Request body too large."));req.destroy();}});req.on("end",()=>{try{resolve(body?JSON.parse(body):{});}catch{reject(new Error("Invalid JSON body."));}});req.on("error",reject);});}
function isKnownRole(role){return role==="patient"||role==="staff";}
function roleCanSend(role,type){if(role==="patient")return type===EventType.PATIENT_ARRIVED;if(role==="staff")return [EventType.CHECKED_IN,EventType.QUEUE_ADVANCED,EventType.ROOM_CHANGED,EventType.CALL_PATIENT,EventType.START_CONSULTATION,EventType.COMPLETE_CONSULTATION,EventType.COMPLETE_LAB,EventType.COMPLETE_PHARMACY].includes(type);return false;}

function extractOutputText(data){
  if(typeof data?.output_text==="string")return data.output_text.trim();
  const parts=[];
  for(const item of data?.output||[])for(const content of item?.content||[])if(typeof content?.text==="string")parts.push(content.text);
  return parts.join("\n").trim();
}

async function answerWithAI(question,context){
  if(!OPENAI_API_KEY)return null;
  const safeContext={
    state:context?.state,
    appointment:context?.appointment,
    visit:context?.visit,
    room:context?.room,
    queueAhead:context?.queueAhead,
    lastUpdated:context?.lastUpdated
  };
  const system=`You are CarePath Assistant, a calm public-service journey guide inside a synthetic healthcare prototype. Explain the user's current journey in simple, short language. Use the supplied journey state when answering questions like where to go next, token, room, registration, or what happens after consultation. Never invent live hospital information, availability, medical results, diagnoses, prescriptions, wait-time predictions, or official instructions. The hospital/government service is the source of truth. You may explain process but must not give medical advice. If asked about symptoms or treatment, say CarePath cannot provide medical advice and suggest following the clinician or official hospital guidance. Mention synthetic/demo status only when relevant. Keep answers to 2-5 short sentences.`;
  const prompt=`Current synthetic journey context:\n${JSON.stringify(safeContext,null,2)}\n\nUser question:\n${question}`;
  const response=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${OPENAI_API_KEY}`},body:JSON.stringify({model:OPENAI_MODEL,instructions:system,input:prompt})});
  if(!response.ok)throw new Error(`AI request failed (${response.status})`);
  const data=await response.json();
  const text=extractOutputText(data);
  if(!text)throw new Error("AI returned no text");
  return text;
}

function serveStatic(req,res){let requestPath;try{requestPath=decodeURIComponent(new URL(req.url,`http://${req.headers.host||"localhost"}`).pathname);}catch{res.writeHead(400);res.end("Bad request");return;}if(requestPath==="/")requestPath="/index.html";const normalized=path.normalize(requestPath).replace(/^([.][.][\\/])+/,"");const filePath=path.join(__dirname,normalized);if(!filePath.startsWith(__dirname)||!existsSync(filePath)||!statSync(filePath).isFile()){res.writeHead(404,{"Content-Type":"text/plain; charset=utf-8"});res.end("Not found");return;}const ext=path.extname(filePath).toLowerCase();readFile(filePath).then(data=>{res.writeHead(200,{"Content-Type":mimeTypes[ext]||"application/octet-stream","Cache-Control":"no-cache"});res.end(data);}).catch(()=>{res.writeHead(500);res.end("Could not read file");});}

const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url,`http://${req.headers.host||"localhost"}`);
  if(req.method==="OPTIONS"){res.writeHead(204,{"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET,POST,OPTIONS","Access-Control-Allow-Headers":"Content-Type"});res.end();return;}
  if(req.method==="GET"&&url.pathname==="/api/state"){json(res,200,{journey});return;}
  if(req.method==="GET"&&url.pathname==="/api/events"){res.writeHead(200,{"Content-Type":"text/event-stream; charset=utf-8","Cache-Control":"no-cache, no-transform","Connection":"keep-alive","Access-Control-Allow-Origin":"*","X-Accel-Buffering":"no"});res.write(": connected\n\n");res.write(`event: journey\ndata: ${JSON.stringify({journey})}\n\n`);clients.add(res);req.on("close",()=>clients.delete(res));return;}
  if(req.method==="POST"&&url.pathname==="/api/assistant"){
    try{const body=await readBody(req);const question=String(body.question||"").trim();if(!question)return json(res,400,{error:"Ask a question first."});const answer=await answerWithAI(question,body.journey||journey);if(!answer)return json(res,503,{error:"AI mode is not configured."});return json(res,200,{answer,model:OPENAI_MODEL});}
    catch(error){console.warn("CarePath AI:",error.message);return json(res,502,{error:"The AI assistant is temporarily unavailable."});}
  }
  if(req.method==="POST"&&url.pathname==="/api/event"){
    try{const body=await readBody(req);const {role,type,...extra}=body;if(!isKnownRole(role))return json(res,403,{error:"Choose a demo role first."});if(!Object.values(EventType).includes(type))return json(res,400,{error:"Unknown journey event."});if(!roleCanSend(role,type))return json(res,403,{error:"That role cannot trigger this event."});if(!canApplyEvent(journey,type))return json(res,409,{error:`That action is not available while the journey is ${journey.state}.`});journey=applyEvent(journey,{type,...extra});broadcast("journey",{journey});return json(res,200,{journey});}
    catch(error){return json(res,400,{error:error.message||"Could not update the journey."});}
  }
  if(req.method==="POST"&&url.pathname==="/api/reset"){
    try{const body=await readBody(req);if(body.role!=="staff")return json(res,403,{error:"Only staff can reset the synthetic journey."});journey=structuredClone(initialJourney);broadcast("reset",{journey});return json(res,200,{journey});}
    catch(error){return json(res,400,{error:error.message||"Could not reset the journey."});}
  }
  serveStatic(req,res);
});

setInterval(()=>{for(const res of clients)res.write(": heartbeat\n\n");},20_000).unref();
server.listen(PORT,HOST,()=>{console.log(`\nCarePath demo server running on http://localhost:${PORT}`);console.log(`Open the same URL on the patient laptop and the staff phone using this computer's LAN IP.`);console.log(`AI assistant: ${OPENAI_API_KEY?`enabled (${OPENAI_MODEL})`:`fallback mode — set OPENAI_API_KEY to enable AI`}`);console.log(`Example: http://192.168.1.10:${PORT}\n`);});
