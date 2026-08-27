/* Ensures the non-healthcare public-service cards have complete, usable journeys. */
(() => {
  const LANG_KEY = "carepath:language:v3";
  const app = () => document.querySelector("#app");
  const official = {
    certificate: "https://services.india.gov.in/service/listing?cat_id=53&ln=en",
    grievance: "https://pgportal.gov.in/Home/LodgeGrievance",
    grievanceTrack: "https://pgportal.gov.in/Status"
  };

  const content = {
    en: {
      common: { journey:"YOUR JOURNEY", start:"Start this journey", next:"Next step", back:"← Back", exit:"Exit journey", finish:"Finish journey", choose:"Choose another service", complete:"JOURNEY COMPLETE", completeTitle:"Your next step is clear.", completeBody:"Keep your official reference or acknowledgement. CarePath stays beside you as a guide; the government service remains the source of truth for the real transaction and live status.", official:"Open official service ↗", track:"Track official status ↗", where:"WHERE YOU ARE", need:"WHAT YOU NEED NOW", action:"NEXT ACTION", progress:"Journey progress", demo:"Synthetic demonstration — CarePath does not submit or approve government applications." },
      certificate: { eyebrow:"CERTIFICATES · CAREPATH", title:"Which certificate are you trying to get?", em:"We’ll build the right route.", body:"Tell CarePath the outcome first. We’ll show what to prepare, where the official service fits, what to save, and how to return for status help.", choicesTitle:"WHAT DO YOU NEED?", choices:[
        ["birth","Birth or death certificate","Apply for or find a civil registration record"],["income","Income certificate","Prove income for an official purpose"],["caste","Caste / community certificate","Apply for a certificate issued by the responsible authority"],["domicile","Domicile / residence certificate","Prove residence or domicile"],["other","Another certificate","Find the right service without knowing the department"]
      ]},
      grievance: { eyebrow:"GRIEVANCES · CAREPATH", title:"What went wrong?", em:"We’ll help you find the next route.", body:"You do not need government wording. Pick what best describes the problem, then CarePath will guide you from evidence to the official grievance system and status tracking.", choicesTitle:"CHOOSE WHAT BEST DESCRIBES IT", choices:[
        ["delayed","My service/application is delayed","Something has not happened when expected"],["rejected","My application was rejected","I need to understand the reason and next route"],["staff","I had a problem with a service or staff","Report a public-service experience"],["online","I cannot access the service","A portal, process or access problem"],["other","Something else happened","Start with the facts and we’ll guide you"]
      ]}
    },
    hi: {
      common: { journey:"आपकी यात्रा", start:"यह यात्रा शुरू करें", next:"अगला कदम", back:"← वापस", exit:"यात्रा से बाहर निकलें", finish:"यात्रा पूरी करें", choose:"दूसरी सेवा चुनें", complete:"यात्रा पूरी", completeTitle:"आपका अगला कदम साफ़ है।", completeBody:"अपना आधिकारिक संदर्भ या पावती सुरक्षित रखें। CarePath मार्गदर्शन देता है; वास्तविक लेन-देन और स्थिति के लिए सरकारी सेवा ही सही स्रोत है।", official:"आधिकारिक सेवा खोलें ↗", track:"आधिकारिक स्थिति ट्रैक करें ↗", where:"आप यहाँ हैं", need:"अभी आपको क्या चाहिए", action:"अगला कदम", progress:"यात्रा की प्रगति", demo:"सिंथेटिक डेमो — CarePath सरकारी आवेदन जमा या स्वीकृत नहीं करता।" },
      certificate: { eyebrow:"प्रमाणपत्र · CAREPATH", title:"आपको कौन-सा प्रमाणपत्र चाहिए?", em:"हम सही रास्ता बनाएँगे।", body:"पहले अपना लक्ष्य बताएं। CarePath बताएगा कि क्या तैयार करना है, आधिकारिक सेवा कहाँ है, क्या सुरक्षित रखना है और स्थिति के लिए कैसे लौटना है।", choicesTitle:"आपको क्या चाहिए?", choices:[
        ["birth","जन्म या मृत्यु प्रमाणपत्र","सिविल रिकॉर्ड के लिए आवेदन या खोज"],["income","आय प्रमाणपत्र","किसी आधिकारिक उद्देश्य के लिए आय साबित करें"],["caste","जाति / समुदाय प्रमाणपत्र","जिम्मेदार प्राधिकरण से प्रमाणपत्र के लिए आवेदन"],["domicile","निवास / डोमिसाइल प्रमाणपत्र","निवास या डोमिसाइल साबित करें"],["other","कोई दूसरा प्रमाणपत्र","विभाग जाने बिना सही सेवा खोजें"]
      ]},
      grievance: { eyebrow:"शिकायत · CAREPATH", title:"क्या गलत हुआ?", em:"हम अगला रास्ता खोजने में मदद करेंगे।", body:"आपको सरकारी भाषा जानने की जरूरत नहीं है। समस्या चुनें, फिर CarePath सबूत तैयार करने से लेकर आधिकारिक शिकायत और स्थिति ट्रैक करने तक मार्गदर्शन करेगा।", choicesTitle:"सबसे सही विकल्प चुनें", choices:[
        ["delayed","मेरी सेवा/आवेदन में देरी है","जो होना चाहिए था वह समय पर नहीं हुआ"],["rejected","मेरा आवेदन अस्वीकार हुआ","कारण और अगला रास्ता समझना है"],["staff","सेवा या कर्मचारी से समस्या हुई","सार्वजनिक सेवा की शिकायत दर्ज करें"],["online","मैं सेवा तक पहुँच नहीं पा रहा/रही हूँ","पोर्टल या प्रक्रिया में समस्या"],["other","कुछ और हुआ","तथ्यों से शुरू करें और हम मार्गदर्शन करेंगे"]
      ]}
    },
    kn: {
      common: { journey:"ನಿಮ್ಮ ಪ್ರಯಾಣ", start:"ಈ ಪ್ರಯಾಣ ಪ್ರಾರಂಭಿಸಿ", next:"ಮುಂದಿನ ಹಂತ", back:"← ಹಿಂದೆ", exit:"ಪ್ರಯಾಣದಿಂದ ಹೊರಬನ್ನಿ", finish:"ಪ್ರಯಾಣ ಪೂರ್ಣಗೊಳಿಸಿ", choose:"ಬೇರೆ ಸೇವೆ ಆಯ್ಕೆಮಾಡಿ", complete:"ಪ್ರಯಾಣ ಪೂರ್ಣ", completeTitle:"ನಿಮ್ಮ ಮುಂದಿನ ಹಂತ ಸ್ಪಷ್ಟವಾಗಿದೆ.", completeBody:"ನಿಮ್ಮ ಅಧಿಕೃತ ಉಲ್ಲೇಖ ಅಥವಾ ಸ್ವೀಕೃತಿಯನ್ನು ಉಳಿಸಿಕೊಳ್ಳಿ. CarePath ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತದೆ; ನಿಜವಾದ ವ್ಯವಹಾರ ಮತ್ತು ಸ್ಥಿತಿಗೆ ಸರ್ಕಾರಿ ಸೇವೆಯೇ ಮೂಲವಾಗಿದೆ.", official:"ಅಧಿಕೃತ ಸೇವೆ ತೆರೆಯಿರಿ ↗", track:"ಅಧಿಕೃತ ಸ್ಥಿತಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ ↗", where:"ನೀವು ಇಲ್ಲಿದ್ದೀರಿ", need:"ಈಗ ನಿಮಗೆ ಬೇಕಾದದ್ದು", action:"ಮುಂದಿನ ಕ್ರಮ", progress:"ಪ್ರಯಾಣದ ಪ್ರಗತಿ", demo:"ಸಿಂಥೆಟಿಕ್ ಡೆಮೋ — CarePath ಸರ್ಕಾರಿ ಅರ್ಜಿಯನ್ನು ಸಲ್ಲಿಸುವುದಿಲ್ಲ ಅಥವಾ ಅನುಮೋದಿಸುವುದಿಲ್ಲ." },
      certificate: { eyebrow:"ಪ್ರಮಾಣಪತ್ರಗಳು · CAREPATH", title:"ನಿಮಗೆ ಯಾವ ಪ್ರಮಾಣಪತ್ರ ಬೇಕು?", em:"ಸರಿಯಾದ ಮಾರ್ಗವನ್ನು ನಿರ್ಮಿಸೋಣ.", body:"ಮೊದಲು ನಿಮಗೆ ಬೇಕಾದ ಫಲಿತಾಂಶವನ್ನು ಆಯ್ಕೆಮಾಡಿ. ಏನು ಸಿದ್ಧಪಡಿಸಬೇಕು, ಅಧಿಕೃತ ಸೇವೆ ಎಲ್ಲಿದೆ ಮತ್ತು ನಂತರ ಸ್ಥಿತಿಯನ್ನು ಹೇಗೆ ನೋಡಬೇಕು ಎಂದು CarePath ತಿಳಿಸುತ್ತದೆ.", choicesTitle:"ನಿಮಗೆ ಏನು ಬೇಕು?", choices:[
        ["birth","ಜನನ ಅಥವಾ ಮರಣ ಪ್ರಮಾಣಪತ್ರ","ನಾಗರಿಕ ನೋಂದಣಿ ದಾಖಲೆಗೆ ಅರ್ಜಿ ಅಥವಾ ಹುಡುಕಾಟ"],["income","ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ","ಅಧಿಕೃತ ಉದ್ದೇಶಕ್ಕಾಗಿ ಆದಾಯವನ್ನು ಸಾಬೀತುಪಡಿಸಿ"],["caste","ಜಾತಿ / ಸಮುದಾಯ ಪ್ರಮಾಣಪತ್ರ","ಜವಾಬ್ದಾರಿ ಪ್ರಾಧಿಕಾರದಿಂದ ಪ್ರಮಾಣಪತ್ರಕ್ಕಾಗಿ ಅರ್ಜಿ"],["domicile","ವಾಸಸ್ಥಳ / ಡೊಮಿಸೈಲ್ ಪ್ರಮಾಣಪತ್ರ","ವಾಸಸ್ಥಳವನ್ನು ಸಾಬೀತುಪಡಿಸಿ"],["other","ಬೇರೆ ಪ್ರಮಾಣಪತ್ರ","ವಿಭಾಗ ತಿಳಿಯದಿದ್ದರೂ ಸರಿಯಾದ ಸೇವೆಯನ್ನು ಹುಡುಕಿ"]
      ]},
      grievance: { eyebrow:"ದೂರುಗಳು · CAREPATH", title:"ಏನು ತಪ್ಪಾಗಿದೆ?", em:"ಮುಂದಿನ ಮಾರ್ಗವನ್ನು ಹುಡುಕಲು ಸಹಾಯ ಮಾಡುತ್ತೇವೆ.", body:"ಸರ್ಕಾರಿ ಪದಗಳನ್ನು ತಿಳಿದಿರಬೇಕಾಗಿಲ್ಲ. ಸಮಸ್ಯೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ; ಸಾಕ್ಷ್ಯ ಸಿದ್ಧಪಡಿಸುವುದರಿಂದ ಅಧಿಕೃತ ದೂರು ಮತ್ತು ಸ್ಥಿತಿ ಟ್ರ್ಯಾಕಿಂಗ್‌ವರೆಗೆ CarePath ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತದೆ.", choicesTitle:"ಸರಿಯಾದ ಆಯ್ಕೆಯನ್ನು ಆರಿಸಿ", choices:[
        ["delayed","ನನ್ನ ಸೇವೆ/ಅರ್ಜಿಯಲ್ಲಿ ವಿಳಂಬವಾಗಿದೆ","ನಿರೀಕ್ಷಿಸಿದ ಕೆಲಸ ಸಮಯಕ್ಕೆ ಆಗಿಲ್ಲ"],["rejected","ನನ್ನ ಅರ್ಜಿ ತಿರಸ್ಕೃತವಾಗಿದೆ","ಕಾರಣ ಮತ್ತು ಮುಂದಿನ ಮಾರ್ಗ ತಿಳಿಯಬೇಕು"],["staff","ಸೇವೆ ಅಥವಾ ಸಿಬ್ಬಂದಿಯ ಬಗ್ಗೆ ಸಮಸ್ಯೆ","ಸಾರ್ವಜನಿಕ ಸೇವೆಯ ಸಮಸ್ಯೆಯನ್ನು ವರದಿ ಮಾಡಿ"],["online","ನನಗೆ ಸೇವೆ ಪ್ರವೇಶಿಸಲು ಆಗುತ್ತಿಲ್ಲ","ಪೋರ್ಟಲ್ ಅಥವಾ ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿ ಸಮಸ್ಯೆ"],["other","ಬೇರೆ ಸಮಸ್ಯೆ","ವಾಸ್ತವಾಂಶಗಳಿಂದ ಪ್ರಾರಂಭಿಸಿ, ನಾವು ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತೇವೆ"]
      ]}
    }
  };

  const stages = {
    certificate: {
      birth:[
        ["Confirm the record you need","Decide whether you need a birth record or a death record, and note the person’s name and registration details if known.","Write down the exact record and the place/date of registration.","Name, date/place of registration"],
        ["Check the responsible service","Civil registration routes can vary by state and local authority. Use the official service listing to find the correct route.","Choose the state/local service that matches the record.","State/locality and registration details"],
        ["Prepare your details","Keep identity and supporting details ready. Only provide documents the official service requests.","Check spellings, dates and registration details before applying.","Identity/supporting documents if requested"],
        ["Apply on the official service","Open the Government Services Portal and follow the certificate service for the relevant authority.","Complete the real application there; CarePath does not submit it.","Official application/acknowledgement details"],
        ["Save the acknowledgement","Keep the application number, receipt or reference so you can return to the official service.","Save it on paper or with a trusted helper if needed.","Application/reference number"],
        ["Collect or check the certificate","Use the official service instructions to see whether the certificate is downloadable, delivered, or collected.","If the status is pending or rejected, keep the exact official reason before taking the next action.","Latest official status/reference"]
      ],
      income:[
        ["Confirm why you need it","The purpose can affect which authority or certificate route applies.","Note the official purpose and any deadline.","Purpose and deadline"],
        ["Check eligibility and authority","Use the official portal to identify the correct state/local service and requirements.","Do not use an unrelated certificate service just because the name looks similar.","State/locality and purpose"],
        ["Prepare proof","Keep the income/supporting documents requested by the official service ready.","Use current documents and check that names match your identity record.","Income/supporting proof if requested"],
        ["Apply officially","Open the official Government Services Portal route and complete the real application.","CarePath only guides; the government service receives the application.","Application details"],
        ["Save your reference","Keep the acknowledgement/reference and any date for verification or collection.","Do not lose the number you will need for status questions.","Reference/acknowledgement"],
        ["Check status and receive it","Return to the official service for the current status and follow its delivery/download/collection instructions.","If something is requested, provide only what the official authority asks for.","Latest official status"]
      ],
      caste:[
        ["Confirm the certificate","Make sure the certificate type and purpose match what the requesting authority asked for.","Write down the exact wording if another application asked for it.","Requested certificate type"],
        ["Find the correct state service","Eligibility, authority and documents can vary by state. Use the official service listing for the applicable route.","Choose the service for your state and locality.","State/locality"],
        ["Prepare supporting proof","Gather only the identity, residence and community-related proof requested by the official service.","Check names and dates across documents.","Requested supporting documents"],
        ["Apply on the official service","Use the official government route to submit the real application.","CarePath does not make the eligibility decision or submit the application.","Application/reference details"],
        ["Save the acknowledgement","Keep the acknowledgement/reference number and any verification appointment details.","Use it whenever you check status or respond to a request.","Reference/verification details"],
        ["Track the decision","Use the official service to check whether verification is pending, approved, or requires more information.","Follow the authority’s exact next instruction.","Latest official status"]
      ],
      domicile:[
        ["Confirm the residence requirement","Check why the domicile/residence certificate is needed and which state/local authority is relevant.","Note the purpose and applicable state.","Purpose and state"],
        ["Find the correct official route","Use the Government Services Portal listing to find the state/local certificate service.","The official authority decides eligibility and required proof.","State/locality"],
        ["Prepare residence proof","Keep the residence/identity documents requested by the official service ready.","Make sure addresses and names are consistent.","Residence and identity proof if requested"],
        ["Apply officially","Open the official service and complete the real application there.","Save the acknowledgement immediately after submission.","Application details"],
        ["Save your reference","Keep the application/reference number and any verification appointment information.","A paper copy can help if connectivity is limited.","Reference/receipt"],
        ["Check status and collect/download","Use the official service for live status and follow its collection/download instructions.","If the application is returned or rejected, keep the exact reason.","Latest official status"]
      ],
      other:[
        ["Describe the outcome","Write the name or purpose of the certificate if you know it. If you do not, keep the request that asked for it.","Do not guess the department from the certificate name alone.","Certificate name/purpose"],
        ["Find the right official service","Use the Government Services Portal certificate listings to identify the responsible service.","Choose the state/local route when the portal asks for it.","State/locality if relevant"],
        ["Check the requirements","Read the official service requirements before preparing documents.","Only collect what the official authority asks for.","Official checklist"],
        ["Apply on the official service","Complete the real transaction on the official government service.","CarePath does not submit the application.","Application/reference details"],
        ["Save your reference","Keep the acknowledgement/reference so you can return later.","Save a paper or digital copy.","Reference/acknowledgement"],
        ["Track or collect","Use the official service instructions for status, download or collection.","If anything is unclear, keep the exact status message and reference.","Latest official status"]
      ]
    },
    grievance: {
      delayed:[
        ["Collect the facts","Write down what service you requested, when you applied, the department/office, and what has not happened.","Keep the original application/reference and dates.","Application/reference, dates"],
        ["Keep supporting evidence","Save acknowledgement messages, receipts, screenshots and any official replies.","Use only relevant evidence and remove unnecessary personal information when sharing a copy.","Relevant receipts/screenshots"],
        ["Try the service route first","If the original service has an official correction, appeal or contact route, check it before escalating where appropriate.","Follow the official service’s stated remedy if one exists.","Original service response"],
        ["Lodge the grievance officially","Open CPGRAMS and describe the issue clearly. CPGRAMS is the official public grievance platform.","Submit the real grievance on the official portal; CarePath does not submit it.","Facts, reference and evidence"],
        ["Save the registration number","CPGRAMS provides a unique registration ID for tracking the grievance.","Save the ID and the date you lodged it.","CPGRAMS registration ID"],
        ["Track and respond","Use the official status page for updates. If the resolution is unsatisfactory, follow the official feedback/appeal route.","Keep the exact status and response before deciding the next action.","Registration ID and latest status"]
      ],
      rejected:[
        ["Read the rejection reason","Keep the exact reason, date and reference from the original service.","Do not paraphrase the reason if you can keep the official wording.","Rejection message/reference"],
        ["Check the remedy","Look for an official correction, appeal, review or resubmission route in the original service.","Use the remedy named by the responsible authority when available.","Official remedy instructions"],
        ["Prepare the evidence","Collect the documents and correspondence that show what happened.","Keep only relevant supporting evidence.","Application and rejection evidence"],
        ["Lodge a grievance if needed","If a public-service grievance route is appropriate, use CPGRAMS to describe the issue and attach relevant evidence where the portal allows.","CarePath does not decide whether the grievance will succeed.","Reference, facts and evidence"],
        ["Save your grievance ID","Keep the CPGRAMS registration number and submission date.","This number is what you use to check status.","CPGRAMS registration ID"],
        ["Track the response","Check the official status and read the resolution carefully. If unsatisfied, use the official feedback/appeal option when available.","Keep the response and any appeal number.","Latest official response/status"]
      ],
      staff:[
        ["Write down what happened","Record the office/service, date, location and what the staff interaction was about.","Keep the account factual and specific.","Date, office/service, facts"],
        ["Keep your service reference","If the interaction relates to an application or visit, keep its reference number.","This helps the authority locate the underlying case.","Application/visit reference"],
        ["Collect relevant evidence","Keep receipts, acknowledgement messages or official correspondence that support the issue.","Do not include unrelated personal information.","Relevant evidence"],
        ["Use the official grievance route","Open CPGRAMS and explain the service issue clearly and respectfully.","CarePath does not submit or decide the complaint.","Facts and supporting evidence"],
        ["Save the grievance ID","Keep the unique CPGRAMS registration number and submission date.","Use it for every status check.","CPGRAMS registration ID"],
        ["Track the resolution","Use the official status page. If the response is unsatisfactory, use the official feedback/appeal route when available.","Keep the exact resolution and appeal details.","Latest official status"]
      ],
      online:[
        ["Record the access problem","Note the website/app, page, date/time, error message and what you were trying to do.","A screenshot can make the problem easier to explain.","Error message and service name"],
        ["Check the official help route","Use the service’s own support/help information before escalating.","Do not enter credentials into unofficial support pages.","Official support information"],
        ["Keep your transaction reference","If an application or payment already exists, keep its official reference.","Do not create duplicate applications just because a portal is slow.","Reference/acknowledgement"],
        ["Report the service problem officially","If the issue remains a public-service problem, use CPGRAMS and describe the access issue with the relevant service reference.","CarePath does not submit the grievance.","Facts, reference and evidence"],
        ["Save the grievance ID","Keep the unique registration number generated by CPGRAMS.","Save it somewhere accessible without a smartphone if necessary.","CPGRAMS registration ID"],
        ["Track the response","Use the official status page and follow any clarification request.","Keep the exact response and any next instruction.","Latest official status"]
      ],
      other:[
        ["Write the facts","Describe what service you used, what you expected, what happened, and when.","Keep names, dates and references accurate.","Facts and dates"],
        ["Find the original service route","Check whether the responsible service has a correction, appeal or support route.","Use the official remedy where available.","Original service information"],
        ["Collect supporting evidence","Keep relevant receipts, acknowledgements, screenshots and official replies.","Do not share unnecessary sensitive information.","Relevant evidence"],
        ["Lodge the grievance officially","Use CPGRAMS for an eligible public-service grievance and explain the issue clearly.","The official portal decides routing and handling.","Facts, reference and evidence"],
        ["Save the registration ID","Keep the unique CPGRAMS registration number and submission date.","This is your tracking key.","CPGRAMS registration ID"],
        ["Track and follow up","Use the official status page and respond to clarification requests. If dissatisfied after closure, use the official feedback/appeal route when available.","Keep the exact official response.","Latest official status"]
      ]
    }
  };

  const choiceMeta = { certificate: { birth:"01", income:"02", caste:"03", domicile:"04", other:"05" }, grievance:{ delayed:"01", rejected:"02", staff:"03", online:"04", other:"05" } };
  let lastRendered = "";
  let guard = false;

  function lang(){ const v=localStorage.getItem(LANG_KEY)||"en"; return content[v]?v:"en"; }
  function t(service){ const l=lang(); return { ...content.en.common, ...(content.en[service]||{}), ...(content[l].common||{}), ...(content[l][service]||{}) }; }
  function esc(v){return String(v).replace(/[&<>\"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));}
  function route(){ return location.hash.replace(/^#\/?/,""); }
  function go(path){ if(location.hash.replace(/^#\/?/,"")===path){ render(); } else location.hash=`/${path}`; }
  function current(){ const r=route().split("/"); if(r[0]!=="public-service") return null; return {service:r[1], choice:r[2]||null, step:r[3]?Number(r[3]):null}; }
  function save(service,choice,step){sessionStorage.setItem(`carepath:${service}:journey`,JSON.stringify({choice,step}));}
  function load(service){try{return JSON.parse(sessionStorage.getItem(`carepath:${service}:journey`)||"null")}catch{return null}}

  function injectStyle(){
    if(document.getElementById("cp-public-journey-fix-style"))return;
    const s=document.createElement("style"); s.id="cp-public-journey-fix-style"; s.textContent=`
      .cpj-page{width:min(1200px,calc(100% - 40px));margin:0 auto;padding:56px 0 90px}.cpj-grid{min-height:calc(100vh - 70px);display:grid;grid-template-columns:1fr .9fr;gap:clamp(45px,8vw,120px);align-items:center}.cpj-copy{max-width:650px}.cpj-copy h1{margin:0 0 25px;font-size:clamp(3rem,6vw,6.2rem);line-height:.92;letter-spacing:-.075em;color:#123438}.cpj-copy h1 em{font-family:Georgia,serif;font-weight:500;color:#0c7272;letter-spacing:-.06em}.cpj-copy>p:not(.cpj-eyebrow){font-size:1.05rem;line-height:1.65;color:#648084;max-width:610px}.cpj-eyebrow{margin:0 0 10px;color:#075b60;font-size:.69rem;font-weight:900;letter-spacing:.13em}.cpj-panel{padding:18px;border:1px solid #d8e7e2;border-radius:22px;background:#fffdf8;box-shadow:0 24px 70px rgba(18,52,56,.12)}.cpj-kicker{padding:6px 10px 14px;color:#0c7272;font-size:.66rem;font-weight:900;letter-spacing:.12em}.cpj-choice{width:100%;display:grid;grid-template-columns:38px 1fr 30px;gap:10px;align-items:center;padding:16px 10px;border:0;border-top:1px solid #d8e7e2;background:transparent;text-align:left;color:#123438;cursor:pointer}.cpj-choice:hover{background:#f1f8f5}.cpj-choice b{display:block;font-size:.9rem}.cpj-choice small{display:block;margin-top:4px;color:#648084;font-size:.72rem;line-height:1.45}.cpj-num{color:#0c7272;font-size:.68rem;font-weight:900}.cpj-arrow{color:#0c7272;text-align:right}.cpj-foot{margin:14px 4px 4px;color:#648084;font-size:.72rem;line-height:1.5}.cpj-step-grid{display:grid;grid-template-columns:1fr .85fr;gap:clamp(45px,8vw,120px);align-items:start;padding-top:30px}.cpj-step-copy h1{margin:0 0 24px;font-size:clamp(3rem,5.5vw,5.5rem);line-height:.92;letter-spacing:-.075em}.cpj-step-copy h1 em{font-family:Georgia,serif;font-weight:500;color:#0c7272}.cpj-notice{margin-top:28px;padding:17px 18px;border-left:3px solid #0c7272;background:#edf7f3;color:#20484b;font-size:.82rem;line-height:1.5}.cpj-notice b{display:block;margin-bottom:4px}.cpj-step-card{padding:20px;border:1px solid #d8e7e2;border-radius:22px;background:#fffdf8;box-shadow:0 24px 70px rgba(18,52,56,.12)}.cpj-step-head{display:flex;gap:14px;align-items:center;padding:4px 4px 18px;border-bottom:1px solid #d8e7e2}.cpj-step-head>span{display:grid;place-items:center;width:34px;height:34px;border-radius:50%;background:#d9f2ea;color:#0c7272;font-weight:900;font-size:.7rem}.cpj-step-head b{font-size:1rem}.cpj-step-head small{display:block;color:#648084;margin-top:3px}.cpj-info{padding:17px 6px;border-bottom:1px solid #d8e7e2}.cpj-info strong{display:block;margin-bottom:7px;font-size:.72rem;color:#0c7272;letter-spacing:.08em}.cpj-info p{margin:0;color:#648084;font-size:.82rem;line-height:1.55}.cpj-progress{margin:18px 6px}.cpj-progress-top{display:flex;justify-content:space-between;color:#648084;font-size:.68rem}.cpj-progress-bar{height:7px;margin-top:8px;border-radius:999px;background:#e5eeeb;overflow:hidden}.cpj-progress-bar i{display:block;height:100%;background:#0c7272}.cpj-actions{display:grid;gap:9px;margin-top:16px}.cpj-primary,.cpj-secondary,.cpj-text{font:inherit;cursor:pointer}.cpj-primary{width:100%;display:flex;justify-content:space-between;align-items:center;padding:15px 17px;border:0;border-radius:12px;background:#0c7272;color:#fff;font-weight:850}.cpj-secondary{padding:12px 14px;border:1px solid #d8e7e2;border-radius:11px;background:#fffdf8;color:#20484b;font-weight:800;text-align:left}.cpj-text{padding:2px 0;border:0;background:transparent;color:#0c7272;font-size:.77rem;font-weight:850;text-decoration:underline;text-align:left}.cpj-complete{max-width:900px;margin:0 auto;padding-top:70px}.cpj-complete-card{padding:34px;border:1px solid #d8e7e2;border-radius:24px;background:#fffdf8;box-shadow:0 24px 70px rgba(18,52,56,.12)}.cpj-complete-card h1{font-size:clamp(3rem,5vw,5rem);line-height:.95;letter-spacing:-.07em;margin:0 0 22px}.cpj-complete-card h1 em{font-family:Georgia,serif;font-weight:500;color:#0c7272}.cpj-reference{margin:24px 0;padding:18px;border-radius:14px;background:#edf8f4;color:#0c7272}.cpj-reference small{display:block;color:#648084;font-weight:800;margin-bottom:5px}.cpj-reference strong{font-size:1.5rem;letter-spacing:.04em}.cpj-linkrow{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}.cpj-linkrow a{display:flex;align-items:center;justify-content:space-between;padding:14px;border:1px solid #d8e7e2;border-radius:11px;background:#fff;color:#20484b;text-decoration:none;font-weight:800}.cpj-linkrow a:hover{border-color:#9fcfc4}.cpj-disclaimer{margin-top:18px;color:#8a9a9b;font-size:.68rem;line-height:1.5}@media(max-width:800px){.cpj-grid,.cpj-step-grid{grid-template-columns:1fr}.cpj-page{padding-top:35px}.cpj-linkrow{grid-template-columns:1fr}.cpj-copy h1,.cpj-step-copy h1{font-size:clamp(2.8rem,13vw,4.6rem)}}`;
    document.head.appendChild(s);
  }

  function choicePage(service){
    const c=t(service); return `<main class="cpj-page cpj-grid"><section class="cpj-copy"><p class="cpj-eyebrow">${esc(c.eyebrow)}</p><h1>${esc(c.title)}<br><em>${esc(c.em)}</em></h1><p>${esc(c.body)}</p><div class="cpj-notice"><b>${service==='grievance'?'CarePath is the navigation layer.':'CarePath is the navigation layer.'}</b>${esc(c.common?.demo||t(service).demo||content[lang()].common.demo)}</div></section><section class="cpj-panel"><div class="cpj-kicker">${esc(c.choicesTitle)}</div>${c.choices.map(([id,title,meta])=>`<button class="cpj-choice" data-cpj-choice="${service}/${id}" type="button"><span class="cpj-num">${choiceMeta[service][id]}</span><span><b>${esc(title)}</b><small>${esc(meta)}</small></span><span class="cpj-arrow">→</span></button>`).join('')}<p class="cpj-foot">Choose an option. CarePath will keep the route small and tell you what to do next.</p></section></main>`;
  }

  function stepPage(service,choice,step){
    const c=t(service); const list=stages[service][choice]; if(!list)return choicePage(service); const index=Math.max(0,Math.min(list.length-1,step-1)); const [title,body,action,need]=list[index]; const pct=Math.round(((index+1)/list.length)*100); const done=index===list.length-1; const next=done?c.finish:c.next;
    save(service,choice,index+1);
    return `<main class="cpj-page cpj-step-grid"><section class="cpj-step-copy"><p class="cpj-eyebrow">${esc(c.eyebrow)} · STEP ${index+1} OF ${list.length}</p><h1>${esc(title)}<br><em>One step at a time.</em></h1><p>${esc(body)}</p><div class="cpj-notice"><b>${esc(c.common?.action||content[lang()].common.action)}</b>${esc(action)}</div></section><section class="cpj-step-card"><div class="cpj-step-head"><span>${String(index+1).padStart(2,'0')}</span><div><b>${esc(title)}</b><small>${esc(body)}</small></div></div><div class="cpj-info"><strong>${esc(c.common?.need||content[lang()].common.need)}</strong><p>${esc(need)}</p></div><div class="cpj-info"><strong>${esc(c.common?.where||content[lang()].common.where)}</strong><p>${index<3?esc(service==='grievance'?'Prepare → Official route → Save reference':'Prepare → Official service → Save reference') : esc(service==='grievance'?'Official grievance / status':'Official certificate service / status')}</p></div><div class="cpj-progress"><div class="cpj-progress-top"><span>${esc(c.common?.progress||content[lang()].common.progress)}</span><b>${pct}%</b></div><div class="cpj-progress-bar"><i style="width:${pct}%"></i></div></div><div class="cpj-actions">${index>0?`<button class="cpj-secondary" data-cpj-back type="button">${esc(c.common?.back||content[lang()].common.back)}</button>`:''}${index===3?`<a class="cpj-primary" href="${official[service]}" target="_blank" rel="noopener">${esc(c.common?.official||content[lang()].common.official)} <span>↗</span></a>`:''}${index===4&&service==='grievance'?`<a class="cpj-secondary" href="${official.grievanceTrack}" target="_blank" rel="noopener">${esc(c.common?.track||content[lang()].common.track)} ↗</a>`:''}<button class="cpj-primary" data-cpj-next type="button">${esc(next)} <span>→</span></button><button class="cpj-text" data-cpj-exit type="button">${esc(c.common?.exit||content[lang()].common.exit)}</button></div></section></main>`;
  }

  function completePage(service,choice){
    const c=t(service); const ref=service==='grievance'?'CARE-GRV-001':`CARE-CERT-${String(choice||'001').slice(0,3).toUpperCase()}`; return `<main class="cpj-page cpj-complete"><article class="cpj-complete-card"><p class="cpj-eyebrow">${esc(c.common?.complete||content[lang()].common.complete)}</p><h1>${esc(c.common?.completeTitle||content[lang()].common.completeTitle)}<br><em>CarePath stays beside you.</em></h1><p>${esc(c.common?.completeBody||content[lang()].common.completeBody)}</p><div class="cpj-reference"><small>${service==='grievance'?'SYNTHETIC GRIEVANCE REFERENCE':'SYNTHETIC CERTIFICATE REFERENCE'}</small><strong>${ref}</strong></div><div class="cpj-linkrow"><a href="${official[service]}" target="_blank" rel="noopener">${esc(c.common?.official||content[lang()].common.official)} <span>↗</span></a>${service==='grievance'?`<a href="${official.grievanceTrack}" target="_blank" rel="noopener">${esc(c.common?.track||content[lang()].common.track)} <span>↗</span></a>`:`<a href="${official.certificate}" target="_blank" rel="noopener">${esc(c.common?.track||content[lang()].common.track)} <span>↗</span></a>`}</div><div class="cpj-actions"><button class="cpj-primary" data-cpj-restart type="button">${esc(c.common?.start||content[lang()].common.start)} <span>→</span></button><button class="cpj-secondary" data-cpj-services type="button">${esc(c.common?.choose||content[lang()].common.choose)}</button></div><p class="cpj-disclaimer">${esc(c.common?.demo||content[lang()].common.demo)}</p></article></main>`;
  }

  function render(){
    const r=current(); if(!r || !['certificate','grievance'].includes(r.service))return;
    injectStyle(); const el=app(); if(!el)return; const key=`${r.service}/${r.choice||''}/${r.step||''}/${lang()}`; if(key===lastRendered)return; lastRendered=key;
    if(r.choice && r.step && r.step>0){ const list=stages[r.service][r.choice]; if(list && r.step>list.length){ el.innerHTML=completePage(r.service,r.choice); } else el.innerHTML=stepPage(r.service,r.choice,r.step); }
    else if(r.choice && route().split('/').length>=3){ const saved=load(r.service); el.innerHTML=stepPage(r.service,r.choice,saved?.step||1); }
    else el.innerHTML=choicePage(r.service);
    window.scrollTo({top:0,behavior:'instant'});
    document.dispatchEvent(new CustomEvent('carepath:route-rendered'));
  }

  function interceptCards(e){
    const card=e.target.closest?.('[data-service="certificate"],[data-service="grievance"]'); if(!card)return; e.preventDefault(); e.stopImmediatePropagation(); go(`public-service/${card.dataset.service}`);
  }
  function click(e){
    const choice=e.target.closest?.('[data-cpj-choice]'); if(choice){ const [service,id]=choice.dataset.cpjChoice.split('/'); e.preventDefault(); go(`public-service/${service}/${id}/1`); return; }
    if(e.target.closest?.('[data-cpj-next]')){ const r=current(); if(!r)return; const list=stages[r.service][r.choice]; const next=(r.step||1)+1; go(next>list.length?`public-service/${r.service}/${r.choice}/complete`:`public-service/${r.service}/${r.choice}/${next}`); return; }
    if(e.target.closest?.('[data-cpj-back]')){ const r=current(); if(!r)return; const next=(r.step||2)-1; go(next<=0?`public-service/${r.service}`:`public-service/${r.service}/${r.choice}/${next}`); return; }
    if(e.target.closest?.('[data-cpj-exit],[data-cpj-services]')){go('services');return;}
    if(e.target.closest?.('[data-cpj-restart]')){ const r=current(); if(r)go(`public-service/${r.service}`); }
  }

  document.addEventListener('click',interceptCards,true);
  document.addEventListener('click',click);
  window.addEventListener('hashchange',()=>setTimeout(render,20));
  window.addEventListener('carepath:language-changed',()=>{lastRendered="";setTimeout(render,20)});
  document.addEventListener('change',e=>{if(e.target.matches?.('[data-shell-language]')){lastRendered="";setTimeout(render,60)}});
  injectStyle(); setTimeout(render,40);
})();
