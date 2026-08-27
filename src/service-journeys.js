/* Adaptive public-service journeys: the user chooses an outcome first, then CarePath builds the route around it. */
(() => {
  const LANG_KEY = "carepath:language:v3";
  const SESSION_KEY = "carepath:service-context:v2";
  const official = {
    pension: "https://services.india.gov.in/service/listing?cat_id=36&ln=en",
    certificate: "https://services.india.gov.in/service/listing?cat_id=53&ln=en",
    grievance: "https://www.pgportal.gov.in/",
    grievanceTrack: "https://www.pgportal.gov.in/Status"
  };

  const data = {
    pension: {
      icon: "₹",
      en: {
        eyebrow: "PENSION · CAREPATH",
        title: "Tell us what you’re trying to do.",
        em: "We’ll build your pension route.",
        body: "You do not need to know the pension department first. Pick the outcome you want and CarePath will show what to prepare, where to go, and what to do after you submit.",
        choicesTitle: "WHAT DO YOU NEED?",
        choices: [
          ["apply", "I want to apply for a pension", "Start a new pension application"],
          ["track", "I already applied", "Find out where my application is"],
          ["update", "I need to update my details", "Change information on an existing benefit"],
          ["verify", "I was asked to complete verification", "Understand what to take or do next"]
        ],
        stages: {
          apply: [
            ["Choose the right pension", "Tell us the pension or benefit you are trying to get. The exact scheme and eligibility depend on the responsible government department.", "Choose the scheme/service on the official portal before filling the real form.", "Scheme or benefit name, basic identity details"],
            ["Check eligibility & documents", "Use the official service requirements as the source of truth. CarePath turns them into a short preparation checklist.", "Have your identity, address, bank details and scheme-specific documents ready.", "Identity/address proof, bank details, supporting certificate if required"],
            ["Prepare before applying", "Check names, dates, bank details and supporting documents before you leave CarePath.", "Do one final check so you do not have to restart the real application.", "Your documents and contact number"],
            ["Apply on the official service", "Open the Government Services Portal and choose the pension service that matches your scheme and state.", "Submit the real application there. CarePath never submits it for you.", "Use the official portal; keep the application/reference number"],
            ["Save your reference", "Your reference number is the key to finding the application again.", "Save it in your phone, on paper, or with a trusted helper.", "Official application/reference number"],
            ["Track & understand the status", "Return here when a status is confusing. The official portal remains the source of truth; CarePath helps explain what the status means and what action is next.", "Open the official pension service and check the latest status.", "Reference number and the latest official status"]
          ],
          track: [
            ["Find your application", "Start with the application/reference number you received when you applied.", "Use the same reference and identity details the official service asks for.", "Application/reference number"],
            ["Open the official pension service", "CarePath takes you to the official Government Services Portal pension area so you can find the correct department/service.", "Do not rely on a third-party status page.", "Reference number and registered details"],
            ["Check the current status", "Look for the latest status, date and any request for documents or action.", "Take a screenshot or note the exact status if you need help later.", "Latest official status"],
            ["If something is requested", "A pending or clarification status may mean the department needs information or verification.", "Follow the exact request shown by the official service.", "Only the documents explicitly requested by the official authority"],
            ["If it is approved", "Check the official instructions for payment/benefit activation and keep the approval/reference details.", "Do not assume a payment date from CarePath; use the official status.", "Approval/reference details"],
            ["If it is rejected or delayed", "Keep the official reason. CarePath can help you understand the next route, such as correction, resubmission or an available grievance channel.", "Follow the remedy provided by the responsible authority.", "Official reason and reference number"]
          ],
          update: [
            ["Identify what changed", "Choose the exact detail you need to update so you do not accidentally start a new application.", "Keep the existing pension/account reference ready.", "Existing pension/account reference"],
            ["Check whether online update is available", "The responsible scheme or department decides which details can be changed online.", "Use the official service to confirm the available update route.", "Reference and identity details"],
            ["Prepare the supporting proof", "Some changes need a document or verification. Only use the documents requested by the official service.", "Check names and numbers before submitting.", "Updated detail plus supporting proof if requested"],
            ["Update on the official service", "CarePath hands you to the official government route for the real change.", "Submit the update there and save the acknowledgement/reference.", "Official acknowledgement/reference"],
            ["Check verification", "Some updates remain pending until the responsible authority verifies them.", "Follow any official request rather than submitting the same change again.", "Latest official status"],
            ["Confirm the change", "Return to the official record and make sure the updated detail is reflected.", "If it is still wrong, use the official correction/grievance route.", "Updated official record/reference"]
          ],
          verify: [
            ["Read the verification request", "Start with the exact message from the official department. Do not guess what they need.", "Keep the request/reference number visible.", "Official verification message"],
            ["Collect only what was requested", "CarePath helps you make a small checklist from the official request.", "Do not upload unrelated documents.", "Only requested proof/documents"],
            ["Check the details", "Make sure your name, reference and supporting document match the official record.", "Fix obvious errors before submitting the verification response.", "Matching identity/reference details"],
            ["Complete verification officially", "Use the official portal or office route named in the request.", "CarePath does not verify or submit documents for you.", "Official verification route"],
            ["Save the acknowledgement", "Keep the acknowledgement or updated reference after you finish.", "This is what you use to check progress later.", "Verification acknowledgement/reference"],
            ["Check what happens next", "Return to the official status when the authority has processed the verification.", "If the status changes to another request, follow that request exactly.", "Latest official status"]
          ]
        }
      }
    },
    certificate: {
      icon: "▤",
      en: {
        eyebrow: "CERTIFICATES · CAREPATH",
        title: "Which certificate are you trying to get?",
        em: "We’ll find the right route.",
        body: "Certificate services differ by document and state. Tell CarePath the outcome first, then we’ll help you prepare and find the official service.",
        choicesTitle: "WHAT DO YOU NEED?",
        choices: [
          ["birth", "Birth or death certificate", "Apply for or find a civil registration record"],
          ["income", "Income certificate", "Prove income for an official purpose"],
          ["caste", "Caste / community certificate", "Apply for a certificate issued by the responsible authority"],
          ["domicile", "Domicile / residence certificate", "Prove residence or domicile"],
          ["other", "Another certificate", "Find the right service without knowing the department"]
        ],
        stages: {}
      }
    },
    grievance: {
      icon: "!",
      en: {
        eyebrow: "GRIEVANCE · CAREPATH",
        title: "What went wrong?",
        em: "We’ll help you find the next route.",
        body: "You do not need government wording. Tell CarePath what happened, then we’ll help you prepare the complaint, reach the official grievance system and understand what happens after submission.",
        choicesTitle: "CHOOSE WHAT BEST DESCRIBES IT",
        choices: [
          ["delayed", "My service/application is delayed", "Something has not happened when expected"],
          ["rejected", "My application was rejected", "I need to understand the reason and next route"],
          ["staff", "I had a problem with a service or staff", "Report a public-service experience"],
          ["online", "I cannot access the service", "A portal, process or access problem"],
          ["other", "Something else happened", "Start with the facts and we’ll guide you"]
        ],
        stages: {}
      }
    }
  };

  const common = {
    en: {
      nav: "YOUR JOURNEY",
      start: "Start with me",
      official: "Open official service ↗",
      track: "Track official status ↗",
      next: "Next step",
      back: "← Back",
      exit: "Exit journey",
      restart: "Start again",
      choose: "Choose another service",
      finish: "Finish journey",
      complete: "JOURNEY COMPLETE",
      completeTitle: "Your next step is clear.",
      completeBody: "Keep your official reference. CarePath stays beside you as a guide, but the government service remains the source of truth for the real transaction and live status.",
      demo: "Synthetic demonstration — CarePath does not submit or approve government applications.",
      where: "WHERE YOU ARE",
      need: "WHAT YOU NEED NOW",
      nextAction: "NEXT ACTION",
      progress: "Journey progress",
      reference: "Demo reference",
      statusHelp: "If the official status is confusing, keep the exact status and reference number. CarePath can help explain the next route.",
      state: "State / area (optional)",
      stateHint: "This helps you choose the correct state service. The official portal remains the source of truth.",
      save: "Save this choice"
    }
  };

  const translations = {
    hi: {
      common: {
        nav:"आपकी यात्रा",start:"मेरे साथ शुरू करें",official:"आधिकारिक सेवा खोलें ↗",track:"आधिकारिक स्थिति ट्रैक करें ↗",next:"अगला कदम",back:"← वापस",exit:"यात्रा से बाहर निकलें",restart:"फिर से शुरू करें",choose:"दूसरी सेवा चुनें",finish:"यात्रा पूरी करें",complete:"यात्रा पूरी",completeTitle:"आपका अगला कदम साफ़ है।",completeBody:"अपना आधिकारिक संदर्भ सुरक्षित रखें। CarePath मार्गदर्शन देता है, लेकिन वास्तविक लेन-देन और लाइव स्थिति के लिए सरकारी सेवा ही सही स्रोत है।",demo:"सिंथेटिक डेमो — CarePath सरकारी आवेदन जमा या स्वीकृत नहीं करता।",where:"आप यहाँ हैं",need:"अभी आपको क्या चाहिए",nextAction:"अगला कदम",progress:"यात्रा की प्रगति",reference:"डेमो संदर्भ",statusHelp:"अगर आधिकारिक स्थिति समझ में नहीं आ रही है, तो वही स्थिति और संदर्भ संख्या रखें। CarePath अगले रास्ते को समझाने में मदद कर सकता है।",state:"राज्य / क्षेत्र (वैकल्पिक)",stateHint:"यह सही राज्य सेवा चुनने में मदद करता है। आधिकारिक पोर्टल ही सही स्रोत है।",save:"यह विकल्प सुरक्षित करें"
      },
      pension:{eyebrow:"पेंशन · CAREPATH",title:"आप क्या करना चाहते हैं?",em:"हम आपकी पेंशन यात्रा बनाएँगे।",body:"आपको पहले पेंशन विभाग जानने की जरूरत नहीं है। अपना लक्ष्य चुनें और CarePath बताएगा कि क्या तैयार करना है, कहाँ जाना है और आवेदन के बाद क्या करना है।",choicesTitle:"आपको क्या चाहिए?",choices:[["apply","मैं पेंशन के लिए आवेदन करना चाहता/चाहती हूँ","नया पेंशन आवेदन शुरू करें"],["track","मैं पहले ही आवेदन कर चुका/चुकी हूँ","जानें आपका आवेदन कहाँ है"],["update","मुझे अपनी जानकारी अपडेट करनी है","मौजूदा लाभ की जानकारी बदलें"],["verify","मुझसे सत्यापन पूरा करने को कहा गया है","क्या करना या साथ ले जाना है समझें"]]},
      certificate:{eyebrow:"प्रमाणपत्र · CAREPATH",title:"आपको कौन-सा प्रमाणपत्र चाहिए?",em:"हम सही रास्ता खोजेंगे।",body:"प्रमाणपत्र सेवाएँ दस्तावेज़ और राज्य के अनुसार बदलती हैं। पहले अपना लक्ष्य बताएं, फिर CarePath तैयारी और आधिकारिक सेवा तक पहुँचने में मदद करेगा।",choicesTitle:"आपको क्या चाहिए?",choices:[["birth","जन्म या मृत्यु प्रमाणपत्र","सिविल रिकॉर्ड के लिए आवेदन या खोज"],["income","आय प्रमाणपत्र","किसी आधिकारिक उद्देश्य के लिए आय साबित करें"],["caste","जाति / समुदाय प्रमाणपत्र","जिम्मेदार प्राधिकरण से प्रमाणपत्र के लिए आवेदन"],["domicile","निवास / डोमिसाइल प्रमाणपत्र","निवास या डोमिसाइल साबित करें"],["other","कोई दूसरा प्रमाणपत्र","विभाग जाने बिना सही सेवा खोजें"]]},
      grievance:{eyebrow:"शिकायत · CAREPATH",title:"क्या गलत हुआ?",em:"हम अगला रास्ता खोजने में मदद करेंगे।",body:"आपको सरकारी भाषा जानने की जरूरत नहीं है। बताएं क्या हुआ, फिर CarePath शिकायत तैयार करने, आधिकारिक शिकायत प्रणाली तक पहुँचने और जमा करने के बाद की स्थिति समझने में मदद करेगा।",choicesTitle:"जो सबसे सही लगे चुनें",choices:[["delayed","मेरी सेवा/आवेदन में देरी है","कुछ अपेक्षित समय पर नहीं हुआ"],["rejected","मेरा आवेदन अस्वीकार हुआ है","कारण और अगला रास्ता समझना है"],["staff","सेवा या कर्मचारी के साथ समस्या हुई","सार्वजनिक सेवा का अनुभव दर्ज करें"],["online","मैं सेवा तक पहुँच नहीं पा रहा/रही हूँ","पोर्टल, प्रक्रिया या पहुँच की समस्या"],["other","कुछ और हुआ है","तथ्यों से शुरू करें और हम मार्गदर्शन करेंगे"]]}
    },
    kn: {
      common: {
        nav:"ನಿಮ್ಮ ಪ್ರಯಾಣ",start:"ನನ್ನ ಜೊತೆ ಪ್ರಾರಂಭಿಸಿ",official:"ಅಧಿಕೃತ ಸೇವೆ ತೆರೆಯಿರಿ ↗",track:"ಅಧಿಕೃತ ಸ್ಥಿತಿಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ ↗",next:"ಮುಂದಿನ ಹಂತ",back:"← ಹಿಂದೆ",exit:"ಪ್ರಯಾಣದಿಂದ ಹೊರಬನ್ನಿ",restart:"ಮತ್ತೆ ಪ್ರಾರಂಭಿಸಿ",choose:"ಮತ್ತೊಂದು ಸೇವೆ ಆಯ್ಕೆ ಮಾಡಿ",finish:"ಪ್ರಯಾಣ ಪೂರ್ಣಗೊಳಿಸಿ",complete:"ಪ್ರಯಾಣ ಪೂರ್ಣ",completeTitle:"ನಿಮ್ಮ ಮುಂದಿನ ಹಂತ ಸ್ಪಷ್ಟವಾಗಿದೆ.",completeBody:"ನಿಮ್ಮ ಅಧಿಕೃತ ಉಲ್ಲೇಖ ಸಂಖ್ಯೆಯನ್ನು ಉಳಿಸಿಕೊಳ್ಳಿ. CarePath ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತದೆ; ನಿಜವಾದ ವ್ಯವಹಾರ ಮತ್ತು ಲೈವ್ ಸ್ಥಿತಿಗೆ ಸರ್ಕಾರಿ ಸೇವೆಯೇ ಮೂಲ ಸತ್ಯ.",demo:"ಸಿಂಥೆಟಿಕ್ ಡೆಮೋ — CarePath ಸರ್ಕಾರಿ ಅರ್ಜಿಯನ್ನು ಸಲ್ಲಿಸುವುದಿಲ್ಲ ಅಥವಾ ಅನುಮೋದಿಸುವುದಿಲ್ಲ.",where:"ನೀವು ಇಲ್ಲಿ ಇದ್ದೀರಿ",need:"ಈಗ ನಿಮಗೆ ಬೇಕಾಗಿರುವುದು",nextAction:"ಮುಂದಿನ ಕ್ರಮ",progress:"ಪ್ರಯಾಣದ ಪ್ರಗತಿ",reference:"ಡೆಮೋ ಉಲ್ಲೇಖ",statusHelp:"ಅಧಿಕೃತ ಸ್ಥಿತಿ ಅರ್ಥವಾಗದಿದ್ದರೆ, ಅದೇ ಸ್ಥಿತಿ ಮತ್ತು ಉಲ್ಲೇಖ ಸಂಖ್ಯೆಯನ್ನು ಉಳಿಸಿ. ಮುಂದಿನ ಮಾರ್ಗವನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು CarePath ಸಹಾಯ ಮಾಡುತ್ತದೆ.",state:"ರಾಜ್ಯ / ಪ್ರದೇಶ (ಐಚ್ಛಿಕ)",stateHint:"ಸರಿಯಾದ ರಾಜ್ಯ ಸೇವೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಲು ಇದು ಸಹಾಯ ಮಾಡುತ್ತದೆ. ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ವೇ ಮೂಲ ಸತ್ಯ.",save:"ಈ ಆಯ್ಕೆಯನ್ನು ಉಳಿಸಿ"
      },
      pension:{eyebrow:"ಪಿಂಚಣಿ · CAREPATH",title:"ನೀವು ಏನು ಮಾಡಲು ಪ್ರಯತ್ನಿಸುತ್ತಿದ್ದೀರಿ?",em:"ನಿಮ್ಮ ಪಿಂಚಣಿ ಮಾರ್ಗವನ್ನು ನಾವು ರೂಪಿಸುತ್ತೇವೆ.",body:"ಮೊದಲು ಪಿಂಚಣಿ ಇಲಾಖೆಯನ್ನು ತಿಳಿದಿರಬೇಕಾಗಿಲ್ಲ. ನಿಮ್ಮ ಗುರಿಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ; ಏನು ಸಿದ್ಧಪಡಿಸಬೇಕು, ಎಲ್ಲಿಗೆ ಹೋಗಬೇಕು ಮತ್ತು ಅರ್ಜಿಯ ನಂತರ ಏನು ಮಾಡಬೇಕು ಎಂಬುದನ್ನು CarePath ತೋರಿಸುತ್ತದೆ.",choicesTitle:"ನಿಮಗೆ ಏನು ಬೇಕು?",choices:[["apply","ನಾನು ಪಿಂಚಣಿಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಬೇಕು","ಹೊಸ ಪಿಂಚಣಿ ಅರ್ಜಿ ಪ್ರಾರಂಭಿಸಿ"],["track","ನಾನು ಈಗಾಗಲೇ ಅರ್ಜಿ ಸಲ್ಲಿಸಿದ್ದೇನೆ","ನನ್ನ ಅರ್ಜಿ ಎಲ್ಲಿದೆ ಎಂದು ತಿಳಿಯಿರಿ"],["update","ನನ್ನ ವಿವರಗಳನ್ನು ನವೀಕರಿಸಬೇಕು","ಈಗಿರುವ ಲಾಭದ ಮಾಹಿತಿಯನ್ನು ಬದಲಾಯಿಸಿ"],["verify","ಪರಿಶೀಲನೆ ಪೂರ್ಣಗೊಳಿಸಲು ಕೇಳಲಾಗಿದೆ","ಮುಂದೇನು ಮಾಡಬೇಕು ಅಥವಾ ಏನು ತೆಗೆದುಕೊಂಡು ಹೋಗಬೇಕು ತಿಳಿಯಿರಿ"]]},
      certificate:{eyebrow:"ಪ್ರಮಾಣಪತ್ರಗಳು · CAREPATH",title:"ನಿಮಗೆ ಯಾವ ಪ್ರಮಾಣಪತ್ರ ಬೇಕು?",em:"ಸರಿಯಾದ ಮಾರ್ಗವನ್ನು ಹುಡುಕೋಣ.",body:"ಪ್ರಮಾಣಪತ್ರ ಸೇವೆಗಳು ದಾಖಲೆ ಮತ್ತು ರಾಜ್ಯದ ಪ್ರಕಾರ ಬದಲಾಗುತ್ತವೆ. ಮೊದಲು ನಿಮ್ಮ ಗುರಿಯನ್ನು ಹೇಳಿ; ನಂತರ CarePath ಸಿದ್ಧತೆ ಮತ್ತು ಅಧಿಕೃತ ಸೇವೆಯತ್ತ ಕರೆದೊಯ್ಯುತ್ತದೆ.",choicesTitle:"ನಿಮಗೆ ಏನು ಬೇಕು?",choices:[["birth","ಜನನ ಅಥವಾ ಮರಣ ಪ್ರಮಾಣಪತ್ರ","ನಾಗರಿಕ ದಾಖಲೆಗಾಗಿ ಅರ್ಜಿ ಅಥವಾ ಹುಡುಕಾಟ"],["income","ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ","ಅಧಿಕೃತ ಉದ್ದೇಶಕ್ಕಾಗಿ ಆದಾಯವನ್ನು ಸಾಬೀತುಪಡಿಸಿ"],["caste","ಜಾತಿ / ಸಮುದಾಯ ಪ್ರಮಾಣಪತ್ರ","ಜವಾಬ್ದಾರಿ ಪ್ರಾಧಿಕಾರದಿಂದ ಪ್ರಮಾಣಪತ್ರಕ್ಕೆ ಅರ್ಜಿ"],["domicile","ನಿವಾಸ / ಡೊಮಿಸೈಲ್ ಪ್ರಮಾಣಪತ್ರ","ನಿವಾಸವನ್ನು ಸಾಬೀತುಪಡಿಸಿ"],["other","ಮತ್ತೊಂದು ಪ್ರಮಾಣಪತ್ರ","ವಿಭಾಗದ ಹೆಸರು ತಿಳಿಯದೆ ಸರಿಯಾದ ಸೇವೆ ಹುಡುಕಿ"]]},
      grievance:{eyebrow:"ದೂರು · CAREPATH",title:"ಏನು ತಪ್ಪಾಗಿದೆ?",em:"ಮುಂದಿನ ಮಾರ್ಗವನ್ನು ಹುಡುಕಲು ನಾವು ಸಹಾಯ ಮಾಡುತ್ತೇವೆ.",body:"ಸರ್ಕಾರಿ ಭಾಷೆ ತಿಳಿದಿರಬೇಕಾಗಿಲ್ಲ. ಏನಾಯಿತು ಎಂದು ಹೇಳಿ; ನಂತರ CarePath ದೂರು ಸಿದ್ಧಪಡಿಸಲು, ಅಧಿಕೃತ ದೂರು ವ್ಯವಸ್ಥೆಗೆ ಹೋಗಲು ಮತ್ತು ಸಲ್ಲಿಸಿದ ನಂತರದ ಸ್ಥಿತಿಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.",choicesTitle:"ಹೆಚ್ಚು ಹೊಂದುವದನ್ನು ಆಯ್ಕೆ ಮಾಡಿ",choices:[["delayed","ನನ್ನ ಸೇವೆ/ಅರ್ಜಿಯಲ್ಲಿ ವಿಳಂಬವಾಗಿದೆ","ನಿರೀಕ್ಷಿಸಿದ ಸಮಯದಲ್ಲಿ ಕೆಲಸ ಆಗಿಲ್ಲ"],["rejected","ನನ್ನ ಅರ್ಜಿ ತಿರಸ್ಕರಿಸಲಾಗಿದೆ","ಕಾರಣ ಮತ್ತು ಮುಂದಿನ ಮಾರ್ಗ ತಿಳಿಯಬೇಕು"],["staff","ಸೇವೆ ಅಥವಾ ಸಿಬ್ಬಂದಿಯೊಂದಿಗೆ ಸಮಸ್ಯೆಯಾಗಿದೆ","ಸಾರ್ವಜನಿಕ ಸೇವೆಯ ಅನುಭವವನ್ನು ವರದಿ ಮಾಡಿ"],["online","ನನಗೆ ಸೇವೆ ಪ್ರವೇಶಿಸಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ","ಪೋರ್ಟಲ್, ಪ್ರಕ್ರಿಯೆ ಅಥವಾ ಪ್ರವೇಶದ ಸಮಸ್ಯೆ"],["other","ಬೇರೆ ಏನೋ ಸಂಭವಿಸಿದೆ","ತಥ್ಯಗಳಿಂದ ಪ್ರಾರಂಭಿಸಿ; ನಾವು ಮಾರ್ಗದರ್ಶನ ಮಾಡುತ್ತೇವೆ"]]}
    }
  };

  const extra = {
    hi: {
      stages: {
        pension: {
          apply:["सही पेंशन चुनें","जिस पेंशन या लाभ के लिए आवेदन करना है उसे पहचानें। सही योजना और पात्रता संबंधित सरकारी विभाग पर निर्भर करती है।","आधिकारिक पोर्टल पर योजना/सेवा चुनें।","योजना का नाम और पहचान विवरण"],
          track:["अपना आवेदन खोजें","आवेदन करते समय मिली संदर्भ संख्या से शुरुआत करें।","वही संदर्भ और विवरण इस्तेमाल करें जो आधिकारिक सेवा मांगे।","आवेदन/संदर्भ संख्या"],
          update:["क्या बदलना है पहचानें","सिर्फ वही जानकारी चुनें जिसे अपडेट करना है ताकि नया आवेदन न बन जाए।","मौजूदा पेंशन/खाता संदर्भ तैयार रखें।","मौजूदा संदर्भ संख्या"],
          verify:["सत्यापन अनुरोध पढ़ें","सरकारी विभाग के सटीक संदेश से शुरुआत करें। अनुमान न लगाएं।","अनुरोध/संदर्भ संख्या सामने रखें।","आधिकारिक सत्यापन संदेश"]
        },
        certificate:{birth:["सही राज्य सेवा खोजें","जन्म/मृत्यु रिकॉर्ड की सेवा राज्य और स्थानीय निकाय के अनुसार बदल सकती है।","अपना राज्य/क्षेत्र चुनें और आधिकारिक खोज सेवा खोलें।","राज्य/क्षेत्र और रिकॉर्ड का प्रकार"],income:["सही राज्य सेवा खोजें","आय प्रमाणपत्र की सेवा राज्य के अनुसार अलग हो सकती है।","अपना राज्य/क्षेत्र चुनें और आधिकारिक सेवा खोजें।","राज्य/क्षेत्र और आय प्रमाणपत्र का उद्देश्य"],caste:["सही प्रमाणपत्र सेवा खोजें","जाति/समुदाय प्रमाणपत्र के लिए जिम्मेदार प्राधिकरण राज्य के अनुसार अलग हो सकता है।","राज्य/क्षेत्र के अनुसार आधिकारिक सेवा खोजें।","राज्य/क्षेत्र और प्रमाणपत्र प्रकार"],domicile:["निवास सेवा खोजें","डोमिसाइल/निवास सेवा आपके राज्य और स्थानीय प्राधिकरण पर निर्भर करती है।","राज्य/क्षेत्र के अनुसार आधिकारिक सेवा खोजें।","राज्य/क्षेत्र और निवास विवरण"],other:["प्रमाणपत्र की पहचान करें","पहले यह साफ करें कि प्रमाणपत्र किस उद्देश्य के लिए चाहिए।","सरकारी सेवा पोर्टल में प्रमाणपत्र के नाम से खोजें।","प्रमाणपत्र का नाम और राज्य/क्षेत्र"]},
        grievance:{delayed:["देरी का सबूत रखें","सेवा का नाम, आवेदन/reference number और अपेक्षित तारीख लिखें।","पहले संबंधित आधिकारिक status देखें।","आवेदन संख्या और तारीख"],rejected:["अस्वीकृति का कारण रखें","अधिकारी द्वारा दिया गया exact reason ही अगले कदम का आधार है।","कारण और reference number सुरक्षित रखें।","अस्वीकृति कारण और reference"],staff:["घटना साफ़ लिखें","क्या हुआ, कब, कहाँ और किस सेवा से जुड़ा था लिखें।","तथ्यों पर रहें और व्यक्तिगत आरोपों से बचें।","तारीख, स्थान, सेवा और उपलब्ध प्रमाण"],online:["पहले access problem दर्ज करें","Portal का नाम, error और आपने क्या कोशिश की यह लिखें।","अगर official help channel है तो उसे पहले देखें।","Portal name, error और reference if any"],other:["तथ्य लिखें","क्या हुआ, कहाँ, कब और किस सरकारी सेवा से जुड़ा है लिखें।","सरकारी सेवा/विभाग का नाम पता हो तो जोड़ें।","घटना के मुख्य तथ्य"]}
      }
    },
    kn: {
      stages: {
        pension: {
          apply:["ಸರಿಯಾದ ಪಿಂಚಣಿ ಆಯ್ಕೆ ಮಾಡಿ","ಯಾವ ಪಿಂಚಣಿ ಅಥವಾ ಲಾಭಕ್ಕೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಬೇಕೆಂದು ಗುರುತಿಸಿ. ಯೋಜನೆ ಮತ್ತು ಅರ್ಹತೆ ಸಂಬಂಧಿತ ಸರ್ಕಾರಿ ಇಲಾಖೆಯ ಮೇಲೆ ಅವಲಂಬಿತವಾಗಿದೆ.","ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಯೋಜನೆ/ಸೇವೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ.","ಯೋಜನೆಯ ಹೆಸರು ಮತ್ತು ಗುರುತಿನ ವಿವರಗಳು"],
          track:["ನಿಮ್ಮ ಅರ್ಜಿಯನ್ನು ಹುಡುಕಿ","ಅರ್ಜಿ ಸಲ್ಲಿಸಿದಾಗ ಸಿಕ್ಕ ಉಲ್ಲೇಖ ಸಂಖ್ಯೆಯಿಂದ ಪ್ರಾರಂಭಿಸಿ.","ಅಧಿಕೃತ ಸೇವೆ ಕೇಳುವ ಅದೇ ಉಲ್ಲೇಖ ಮತ್ತು ವಿವರಗಳನ್ನು ಬಳಸಿ.","ಅರ್ಜಿ/ಉಲ್ಲೇಖ ಸಂಖ್ಯೆ"],
          update:["ಏನು ಬದಲಾಯಿಸಬೇಕು ಗುರುತಿಸಿ","ಹೊಸ ಅರ್ಜಿ ಆರಂಭವಾಗದಂತೆ ಬದಲಾಯಿಸಬೇಕಾದ ವಿವರವನ್ನು ಮಾತ್ರ ಆಯ್ಕೆ ಮಾಡಿ.","ಈಗಿರುವ ಪಿಂಚಣಿ/ಖಾತೆ ಉಲ್ಲೇಖವನ್ನು ಸಿದ್ಧವಾಗಿಡಿ.","ಈಗಿರುವ ಉಲ್ಲೇಖ ಸಂಖ್ಯೆ"],
          verify:["ಪರಿಶೀಲನಾ ವಿನಂತಿಯನ್ನು ಓದಿ","ಸರ್ಕಾರಿ ಇಲಾಖೆಯ ನಿಖರ ಸಂದೇಶದಿಂದ ಪ್ರಾರಂಭಿಸಿ. ಊಹಿಸಬೇಡಿ.","ವಿನಂತಿ/ಉಲ್ಲೇಖ ಸಂಖ್ಯೆಯನ್ನು ಮುಂದೆ ಇಡಿ.","ಅಧಿಕೃತ ಪರಿಶೀಲನಾ ಸಂದೇಶ"]
        },
        certificate:{birth:["ಸರಿಯಾದ ರಾಜ್ಯ ಸೇವೆ ಹುಡುಕಿ","ಜನನ/ಮರಣ ದಾಖಲೆ ಸೇವೆ ರಾಜ್ಯ ಮತ್ತು ಸ್ಥಳೀಯ ಸಂಸ್ಥೆಯ ಪ್ರಕಾರ ಬದಲಾಗಬಹುದು.","ನಿಮ್ಮ ರಾಜ್ಯ/ಪ್ರದೇಶ ಆಯ್ಕೆ ಮಾಡಿ ಮತ್ತು ಅಧಿಕೃತ ಹುಡುಕಾಟ ಸೇವೆ ತೆರೆಯಿರಿ.","ರಾಜ್ಯ/ಪ್ರದೇಶ ಮತ್ತು ದಾಖಲೆ ಪ್ರಕಾರ"],income:["ಸರಿಯಾದ ರಾಜ್ಯ ಸೇವೆ ಹುಡುಕಿ","ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ ಸೇವೆ ರಾಜ್ಯದ ಪ್ರಕಾರ ಬದಲಾಗಬಹುದು.","ರಾಜ್ಯ/ಪ್ರದೇಶ ಆಯ್ಕೆ ಮಾಡಿ ಅಧಿಕೃತ ಸೇವೆಯನ್ನು ಹುಡುಕಿ.","ರಾಜ್ಯ/ಪ್ರದೇಶ ಮತ್ತು ಉದ್ದೇಶ"],caste:["ಸರಿಯಾದ ಪ್ರಮಾಣಪತ್ರ ಸೇವೆ ಹುಡುಕಿ","ಜಾತಿ/ಸಮುದಾಯ ಪ್ರಮಾಣಪತ್ರದ ಜವಾಬ್ದಾರಿ ಪ್ರಾಧಿಕಾರ ರಾಜ್ಯದ ಪ್ರಕಾರ ಬದಲಾಗಬಹುದು.","ರಾಜ್ಯ/ಪ್ರದೇಶದ ಅಧಿಕೃತ ಸೇವೆಯನ್ನು ಹುಡುಕಿ.","ರಾಜ್ಯ/ಪ್ರದೇಶ ಮತ್ತು ಪ್ರಮಾಣಪತ್ರ ಪ್ರಕಾರ"],domicile:["ನಿವಾಸ ಸೇವೆ ಹುಡುಕಿ","ಡೊಮಿಸೈಲ್/ನಿವಾಸ ಸೇವೆ ರಾಜ್ಯ ಮತ್ತು ಸ್ಥಳೀಯ ಪ್ರಾಧಿಕಾರದ ಮೇಲೆ ಅವಲಂಬಿತವಾಗಿದೆ.","ರಾಜ್ಯ/ಪ್ರದೇಶದ ಅಧಿಕೃತ ಸೇವೆಯನ್ನು ಹುಡುಕಿ.","ರಾಜ್ಯ/ಪ್ರದೇಶ ಮತ್ತು ನಿವಾಸ ವಿವರಗಳು"],other:["ಪ್ರಮಾಣಪತ್ರವನ್ನು ಗುರುತಿಸಿ","ಯಾವ ಉದ್ದೇಶಕ್ಕಾಗಿ ಪ್ರಮಾಣಪತ್ರ ಬೇಕು ಎಂಬುದನ್ನು ಮೊದಲು ಸ್ಪಷ್ಟಪಡಿಸಿ.","ಸರ್ಕಾರಿ ಸೇವಾ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಪ್ರಮಾಣಪತ್ರದ ಹೆಸರಿನಿಂದ ಹುಡುಕಿ.","ಪ್ರಮಾಣಪತ್ರದ ಹೆಸರು ಮತ್ತು ರಾಜ್ಯ/ಪ್ರದೇಶ"]},
        grievance:{delayed:["ವಿಳಂಬದ ಸಾಕ್ಷ್ಯ ಉಳಿಸಿ","ಸೇವೆಯ ಹೆಸರು, ಅರ್ಜಿ/ಉಲ್ಲೇಖ ಸಂಖ್ಯೆ ಮತ್ತು ನಿರೀಕ್ಷಿತ ದಿನಾಂಕವನ್ನು ಬರೆಯಿರಿ.","ಮೊದಲು ಸಂಬಂಧಿತ ಅಧಿಕೃತ ಸ್ಥಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ.","ಅರ್ಜಿ ಸಂಖ್ಯೆ ಮತ್ತು ದಿನಾಂಕ"],rejected:["ತಿರಸ್ಕಾರದ ಕಾರಣ ಉಳಿಸಿ","ಅಧಿಕಾರಿ ನೀಡಿದ ನಿಖರ ಕಾರಣವೇ ಮುಂದಿನ ಹಂತಕ್ಕೆ ಆಧಾರ.","ಕಾರಣ ಮತ್ತು ಉಲ್ಲೇಖ ಸಂಖ್ಯೆಯನ್ನು ಉಳಿಸಿ.","ತಿರಸ್ಕಾರದ ಕಾರಣ ಮತ್ತು ಉಲ್ಲೇಖ"],staff:["ಘಟನೆಯನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಬರೆಯಿರಿ","ಏನು, ಯಾವಾಗ, ಎಲ್ಲಿ ಮತ್ತು ಯಾವ ಸೇವೆಗೆ ಸಂಬಂಧಿಸಿದೆ ಎಂದು ಬರೆಯಿರಿ.","ತಥ್ಯಗಳಲ್ಲೇ ಇರಿ.","ದಿನಾಂಕ, ಸ್ಥಳ, ಸೇವೆ ಮತ್ತು ಲಭ್ಯ ಸಾಕ್ಷ್ಯ"],online:["ಪ್ರವೇಶ ಸಮಸ್ಯೆಯನ್ನು ದಾಖಲಿಸಿ","ಪೋರ್ಟಲ್ ಹೆಸರು, ದೋಷ ಮತ್ತು ನೀವು ಮಾಡಿದ ಪ್ರಯತ್ನಗಳನ್ನು ಬರೆಯಿರಿ.","ಅಧಿಕೃತ ಸಹಾಯ ಮಾರ್ಗವಿದ್ದರೆ ಮೊದಲು ಅದನ್ನು ಬಳಸಿ.","ಪೋರ್ಟಲ್ ಹೆಸರು, ದೋಷ ಮತ್ತು ಉಲ್ಲೇಖ ಇದ್ದರೆ"],other:["ತಥ್ಯಗಳನ್ನು ಬರೆಯಿರಿ","ಏನು, ಎಲ್ಲಿ, ಯಾವಾಗ ಮತ್ತು ಯಾವ ಸರ್ಕಾರಿ ಸೇವೆಗೆ ಸಂಬಂಧಿಸಿದೆ ಎಂದು ಬರೆಯಿರಿ.","ಗೊತ್ತಿದ್ದರೆ ಸರ್ಕಾರಿ ಸೇವೆ/ವಿಭಾಗದ ಹೆಸರನ್ನು ಸೇರಿಸಿ.","ಘಟನೆಯ ಮುಖ್ಯ ತಥ್ಯಗಳು"]}
      }
    }
  };

  const statusStages = {
    en: {
      pension: ["Check eligibility & documents","Prepare before applying","Apply on the official service","Save your reference","Track & understand the status"],
      certificate: ["Prepare your details","Check the official requirements","Apply through the official service","Save your reference","Track verification/status","Receive or correct the certificate"],
      grievance: ["Write the facts","Prepare your complaint","Submit through CPGRAMS","Save your registration number","Track the grievance","Understand response / appeal"]
    },
    hi: {
      pension: ["पात्रता और दस्तावेज़ जाँचें","आवेदन से पहले तैयारी करें","आधिकारिक सेवा पर आवेदन करें","संदर्भ सुरक्षित रखें","स्थिति ट्रैक और समझें"],
      certificate: ["अपनी जानकारी तैयार करें","आधिकारिक आवश्यकताएँ जाँचें","आधिकारिक सेवा से आवेदन करें","संदर्भ सुरक्षित रखें","सत्यापन/स्थिति ट्रैक करें","प्रमाणपत्र प्राप्त या सुधारें"],
      grievance: ["तथ्य लिखें","शिकायत तैयार करें","CPGRAMS से जमा करें","पंजीकरण संख्या सुरक्षित रखें","शिकायत ट्रैक करें","जवाब / अपील समझें"]
    },
    kn: {
      pension: ["ಅರ್ಹತೆ ಮತ್ತು ದಾಖಲೆ ಪರಿಶೀಲಿಸಿ","ಅರ್ಜಿ ಮೊದಲು ಸಿದ್ಧರಾಗಿ","ಅಧಿಕೃತ ಸೇವೆಯಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ","ಉಲ್ಲೇಖ ಸಂಖ್ಯೆಯನ್ನು ಉಳಿಸಿ","ಸ್ಥಿತಿಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ ಮತ್ತು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ"],
      certificate: ["ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಸಿದ್ಧಪಡಿಸಿ","ಅಧಿಕೃತ ಅಗತ್ಯಗಳನ್ನು ಪರಿಶೀಲಿಸಿ","ಅಧಿಕೃತ ಸೇವೆಯಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ","ಉಲ್ಲೇಖ ಸಂಖ್ಯೆಯನ್ನು ಉಳಿಸಿ","ಪರಿಶೀಲನೆ/ಸ್ಥಿತಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ","ಪ್ರಮಾಣಪತ್ರ ಪಡೆಯಿರಿ ಅಥವಾ ಸರಿಪಡಿಸಿ"],
      grievance: ["ತಥ್ಯಗಳನ್ನು ಬರೆಯಿರಿ","ದೂರು ಸಿದ್ಧಪಡಿಸಿ","CPGRAMS ಮೂಲಕ ಸಲ್ಲಿಸಿ","ನೋಂದಣಿ ಸಂಖ್ಯೆಯನ್ನು ಉಳಿಸಿ","ದೂರು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ","ಉತ್ತರ / ಮೇಲ್ಮನವಿ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ"]
    }
  };

  const css = `.cp-service-detail{max-width:1160px;margin:30px auto 70px;padding:0 22px}.cp-service-detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start}.cp-service-detail .split-copy{padding:24px 8px}.cp-service-panel{background:#fffdf8;border:1px solid rgba(12,102,107,.14);border-radius:26px;padding:26px;box-shadow:0 20px 55px rgba(18,56,58,.08)}.cp-choice-list{display:grid;gap:8px;margin-top:12px}.cp-choice{width:100%;display:grid;grid-template-columns:42px 1fr 24px;gap:12px;align-items:center;text-align:left;border:1px solid rgba(12,102,107,.13);background:#fffdf8;border-radius:15px;padding:15px;cursor:pointer;color:#12383a}.cp-choice:hover,.cp-choice:focus-visible{border-color:#0c8084;box-shadow:0 8px 20px rgba(12,102,107,.08);outline:none}.cp-choice>span:first-child{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#e1f2ee;color:#0c7074;font-weight:900;font-size:11px}.cp-choice b{display:block}.cp-choice small{display:block;color:#617b7d;margin-top:3px;line-height:1.45}.cp-choice .arrow{font-size:20px}.cp-context{background:#edf8f5;border-left:3px solid #0c8084;padding:15px;margin:18px 0}.cp-context b,.cp-context span{display:block}.cp-context span{color:#557274;line-height:1.5;margin-top:5px}.cp-field{display:block;margin-top:15px}.cp-field span{display:block;font-size:13px;font-weight:800;margin-bottom:7px}.cp-field input{width:100%;box-sizing:border-box;border:1px solid rgba(12,102,107,.2);border-radius:12px;padding:13px 14px;font:inherit;background:#fff}.cp-field small{display:block;color:#617b7d;margin-top:6px;line-height:1.4}.cp-journey-rail{display:flex;gap:7px;margin:12px 0 22px}.cp-journey-rail span{height:6px;flex:1;border-radius:99px;background:#e3eeeb}.cp-journey-rail span.active{background:#0c8084}.cp-service-stage{display:flex;gap:15px;padding:15px 0;border-bottom:1px solid rgba(12,102,107,.1)}.cp-service-stage>span{width:38px;height:38px;flex:0 0 38px;border-radius:50%;display:grid;place-items:center;background:#e1f2ee;color:#0c7074;font-weight:900;font-size:12px}.cp-service-stage b{display:block;margin-bottom:5px}.cp-service-stage small{display:block;color:#617b7d;line-height:1.55}.cp-service-current{background:#edf8f5;border-radius:16px;padding:16px;margin:18px 0}.cp-service-current b{display:block;margin-bottom:5px}.cp-service-current span{color:#486b6d;font-size:13px;line-height:1.5}.cp-service-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}.cp-service-actions a,.cp-service-actions button{min-height:46px}.cp-service-back{display:inline-flex;margin-top:18px;color:#0c666b;font-weight:800;text-decoration:none}.cp-service-ref{background:#edf8f5;border-radius:16px;padding:16px;margin:18px 0}.cp-service-ref strong{display:block;font-size:20px;color:#0c7074;letter-spacing:.05em;margin-top:5px}.cp-service-complete{max-width:780px;margin:55px auto;background:#fffdf8;border:1px solid rgba(12,102,107,.14);border-radius:28px;padding:34px;box-shadow:0 20px 55px rgba(18,56,58,.08)}.cp-status-list{display:grid;gap:9px;margin-top:14px}.cp-status-list div{padding:11px 13px;border-radius:11px;background:#f1f7f5;color:#315c5e;font-size:13px}.cp-status-list div.current{background:#dff2ee;color:#0c666b;font-weight:800}@media(max-width:800px){.cp-service-detail-grid{grid-template-columns:1fr}.cp-service-detail{padding:0 16px}.cp-service-detail .split-copy{padding:12px 0}}`;

  function lang(){return ["en","hi","kn"].includes(localStorage.getItem(LANG_KEY))?localStorage.getItem(LANG_KEY):"en"}
  function t(id){const l=lang();return translations[l]?.common?.[id] || common.en[id]}
  function serviceText(id){const l=lang();return translations[l]?.[id] || data[id].en}
  function state(){try{return JSON.parse(sessionStorage.getItem(SESSION_KEY)||"{}")}catch{return {}}}
  function saveContext(ctx){sessionStorage.setItem(SESSION_KEY,JSON.stringify(ctx))}
  function esc(v){return String(v??"").replace(/[&<>\"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]))}
  function inject(){if(document.getElementById("cp-service-journeys"))return;const s=document.createElement("style");s.id="cp-service-journeys";s.textContent=css;document.head.appendChild(s)}
  function stageFor(id,choice,index){
    if(id==="pension"){
      const base=data.pension.en.stages[choice]||data.pension.en.stages.apply;
      if(index===0){const l=lang();return l==="en"?base[0]:(extra[l]?.stages?.pension?.[choice]||base)[0]||base[0]}
      return base[Math.min(index,base.length-1)];
    }
    const generic = id==="certificate" ? {
      birth:[["Choose the state service","Birth/death records are handled through state and local services. Choose your state or area before applying.","Open the official Government Services Portal and search for the certificate service in your area.","State/area and record type"], ["Check the exact requirements","Requirements can differ by state and local authority.","Prepare the documents listed by the official service.","Identity/address details and supporting record"], ["Prepare the application","Check names, dates, parents/spouse details and contact information before submitting.","Use the official form and follow its required fields.","Correct personal and record details"], ["Apply through the official service","CarePath hands you to the official government service for the real application.","Submit there and save the acknowledgement/reference number.","Official acknowledgement/reference"], ["Track verification/status","Use the official reference to check whether the record is under review, approved or needs correction.","Follow only the action shown by the official service.","Reference number and official status"], ["Receive or correct the certificate","Once approved, follow the official download/collection instructions. If a correction is requested, follow the official correction route.","Keep the issued certificate and reference safely.","Issued certificate or correction request"]],
      income:[["Choose the state service","Income certificate services vary by state. Choose your state/area before applying.","Search the official Government Services Portal for your state service.","State/area and purpose"], ["Check eligibility & documents","The responsible authority decides the accepted proof and eligibility.","Use the official checklist; do not guess documents.","Identity/address and income proof if requested"], ["Prepare the application","Check your name, address, income details and supporting proof.","Make sure the information matches your documents.","Matching personal and income details"], ["Apply through the official service","Open the official government service and submit the real application there.","Save the acknowledgement/reference number.","Official acknowledgement/reference"], ["Track verification/status","Check the official status using the reference number.","If clarification is requested, follow the exact request.","Reference and latest status"], ["Receive or correct the certificate","Follow official download/collection instructions or the correction route if something is wrong.","Keep the final certificate safely.","Issued certificate or correction request"]],
      caste:[["Choose the state service","Caste/community certificate routes depend on the state and responsible authority.","Use the official Government Services Portal to find your state service.","State/area and certificate type"],["Check eligibility & documents","The official authority decides eligibility and accepted supporting proof.","Use the official checklist exactly.","Identity, address and supporting proof if requested"],["Prepare the application","Check names and supporting details before submitting.","Make sure the details match your official records.","Matching identity details"],["Apply through the official service","CarePath hands you to the official service for the real application.","Save the acknowledgement/reference.","Official acknowledgement/reference"],["Track verification/status","The authority may verify your details before issuing the certificate.","Follow any official request for clarification.","Reference and latest status"],["Receive or correct the certificate","Follow the official delivery/download or correction instructions.","Keep the issued certificate and reference.","Issued certificate or correction request"]],
      domicile:[["Choose the state service","Residence/domicile services are state-specific.","Find your state service on the official Government Services Portal.","State/area and residence details"],["Check eligibility & documents","The responsible authority decides which residence proof is accepted.","Use the official checklist.","Identity and accepted residence proof"],["Prepare the application","Check address, duration of residence and other required details.","Make sure the information matches your proof.","Matching residence details"],["Apply through the official service","Submit the real application through the official government service.","Save the acknowledgement/reference.","Official acknowledgement/reference"],["Track verification/status","Use the reference to see whether verification is pending, complete or needs action.","Follow only the official request shown.","Reference and latest status"],["Receive or correct the certificate","Follow official download/collection instructions or the correction route.","Keep the final certificate safely.","Issued certificate or correction request"]],
      other:[["Name the certificate","Start with the outcome instead of the department name.","Use the official Government Services Portal search to identify the service.","Certificate name and state/area"],["Check the official requirements","The service page tells you eligibility, documents, fees and delivery method when available.","Use the official service page as the source of truth.","Official checklist"],["Prepare your details","Check names, addresses, dates and supporting documents.","Make sure the information matches your records.","Matching identity/details"],["Apply through the official service","Open the identified government service and submit the real application there.","Save the acknowledgement/reference.","Official acknowledgement/reference"],["Track verification/status","Use the official reference to check progress.","Follow any request for correction or verification.","Reference and latest status"],["Receive or correct the certificate","Follow the official instructions for download, collection or correction.","Keep the final certificate and reference.","Issued certificate or correction request"]]
    } : {
      delayed:[["Keep the delay evidence","Write down the service name, application/reference number and expected date.","Check the related official status first.","Application number and date"],["Check the original service","CarePath helps you return to the official service that owns the transaction.","Do not create a duplicate application just because it is delayed.","Official service and reference"],["Prepare the complaint","Describe what you applied for, when you applied, what happened and what you need now.","Keep the complaint factual and short.","Timeline, reference and supporting evidence"],["Submit through CPGRAMS","Use the official Centralized Public Grievance Redress and Monitoring System for the real complaint.","Submit there and save the registration number.","CPGRAMS registration number"],["Track the grievance","Use the official status page with the registration number.","Keep the latest official response.","Registration number and latest status"],["Understand response / appeal","If the response does not resolve the issue, check the official appeal/remedy route shown by CPGRAMS or the responsible authority.","Follow the official response rather than guessing the next step.","Official response and registration number"]],
      rejected:[["Keep the rejection reason","The exact official reason is the starting point for your next action.","Save the reason and reference number.","Rejection reason and reference"],["Check the official correction route","Some services allow correction or resubmission; the responsible authority decides.","Use the official service instructions.","Reference and official instructions"],["Prepare the complaint if needed","If you need to report a service problem, explain the decision, date, reference and what outcome you need.","Attach only relevant supporting evidence.","Decision, reference and evidence"],["Submit through CPGRAMS","Use the official grievance system for the real complaint.","Save the registration number.","CPGRAMS registration number"],["Track the grievance","Check the official status using the registration number.","Keep the latest response.","Registration number and status"],["Understand response / appeal","If you are not satisfied, use the official appeal facility when available for that grievance.","Follow the official appeal instructions.","Official response and appeal number if issued"]],
      staff:[["Write what happened","Record what happened, when, where and which public service was involved.","Keep the description factual and specific.","Date, location, service and evidence"],["Identify the service","Name the department/service if you know it. If you do not, describe the service outcome.","You do not need government wording.","Service/department and reference if any"],["Prepare the complaint","Turn the facts into a short complaint with the outcome you want.","Avoid unrelated personal information.","Short timeline and desired outcome"],["Submit through CPGRAMS","Use the official CPGRAMS portal for the real complaint.","Save the registration number after submission.","CPGRAMS registration number"],["Track the grievance","Use the official status service to see the response.","Keep the exact response text if you need further help.","Registration number and latest status"],["Understand response / appeal","If the response is not satisfactory, check whether an official appeal route is available.","Use the official appeal option when provided.","Official response and appeal details"]],
      online:[["Record the access problem","Write the portal name, error message and what you tried.","Check the official help/contact route before opening a grievance.","Portal name, error and reference if any"],["Try the official recovery route","Some access problems have password, OTP, browser or help-desk steps.","Follow the official instructions first.","Official help instructions"],["Prepare the complaint if needed","If the service is still inaccessible, explain the failed steps and the service you need.","Include screenshots only when appropriate and safe.","Error, date/time and service name"],["Submit through CPGRAMS","Use the official grievance system if a public-service issue remains unresolved.","Save the registration number.","CPGRAMS registration number"],["Track the grievance","Use the official status page to see the response.","Follow any clarification request.","Registration number and status"],["Understand response / appeal","If the response does not resolve the access problem, follow the official remedy or appeal route shown.","Do not repeatedly submit duplicate complaints.","Official response and next instruction"]],
      other:[["Write the facts","Say what happened, where, when and which public service is involved.","Start with the facts; you do not need department language.","Main facts and reference if any"],["Identify the service","Name the service or department if you know it.","If you do not know it, keep the problem description clear.","Service/department if known"],["Prepare the complaint","Add dates, references and relevant supporting evidence.","State the outcome you want.","Short timeline and desired outcome"],["Submit through CPGRAMS","Use the official CPGRAMS portal for the real complaint.","Save the registration number.","CPGRAMS registration number"],["Track the grievance","Check the official status with the registration number.","Keep the latest official response.","Registration number and status"],["Understand response / appeal","If needed, use the official appeal/remedy route provided by the authority.","Follow the official response.","Official response and appeal details"]]
    };
    return generic[choice]||generic.other;
  }

  function stageText(id,choice,index){
    const base=stageFor(id,choice,index);
    const l=lang();
    if(index===0){
      const translated=extra[l]?.stages?.[id]?.[choice];
      if(translated)return [translated[0],translated[1],translated[2],translated[3]];
    }
    if(l!=="en"){
      const names=statusStages[l][id]||[];
      const translatedName=names[index];
      if(translatedName)return [translatedName,base[1],base[2],base[3]];
    }
    return base;
  }

  function start(id){
    const d=serviceText(id); inject();
    document.querySelector("#app").innerHTML=`<main class="cp-service-detail"><div class="cp-service-detail-grid"><section class="split-copy"><p class="eyebrow">${d.eyebrow}</p><h1>${d.title}<br><em>${d.em}</em></h1><p>${d.body}</p><div class="cp-context"><b>${t("demo")}</b><span>${t("statusHelp")}</span></div></section><section class="cp-service-panel"><div class="panel-kicker">${d.choicesTitle}</div><div class="cp-choice-list">${d.choices.map((c,i)=>`<button class="cp-choice" type="button" data-service-choice="${id}" data-choice="${c[0]}"><span>${String(i+1).padStart(2,"0")}</span><div><b>${esc(c[1])}</b><small>${esc(c[2])}</small></div><span class="arrow">→</span></button>`).join("")}</div><label class="cp-field"><span>${t("state")}</span><input data-service-state value="${esc(state().state||"")}" placeholder="Bengaluru / Karnataka"/><small>${t("stateHint")}</small></label><a class="cp-service-back" href="#/services">${t("choose")}</a></section></div></main>`;
    window.dispatchEvent(new Event("carepath:route-rendered"));
  }

  function renderStage(id,choice,index){
    const d=serviceText(id), st=stageText(id,choice,index), total=6, pct=Math.round(((index+1)/total)*100), last=index===total-1, ctx=state(); inject();
    const isApply=id!=="grievance"&&index===3, isTrack=(id==="pension"||id==="certificate")&&index===5, isGrievance=id==="grievance"&&index===3;
    const applyLink=id==="certificate"?`https://services.india.gov.in/service/search?kw=${encodeURIComponent(choice==="birth"?"birth certificate":choice==="income"?"income certificate":choice==="caste"?"caste certificate":choice==="domicile"?"domicile certificate":"certificate")}`:official[id];
    const actionLink=isGrievance?official.grievance:isTrack?official[id]:applyLink;
    const actionText=isGrievance?t("official"):(isTrack||id==="pension"&&index===5||id==="certificate"&&index===5)?t("track"):t("official");
    document.querySelector("#app").innerHTML=`<main class="cp-service-detail"><div class="cp-service-detail-grid"><section class="split-copy"><p class="eyebrow">${d.eyebrow}</p><h1>${esc(st[0])}<br><em>${index===0?(lang()==="en"?"Let’s do this together.":lang()==="hi"?"इसे साथ में करते हैं।":"हे आपण एकत्र करूया."):last?(lang()==="en"?"Here’s what happens next.":lang()==="hi"?"अब आगे यह होगा।":"ಮುಂದೆ ಹೀಗೆ ನಡೆಯುತ್ತದೆ."):(lang()==="en"?"You’re here. I’ll stay with you.":lang()==="hi"?"आप यहाँ हैं। मैं आपके साथ हूँ।":"ನೀವು ಇಲ್ಲಿ ಇದ್ದೀರಿ. ನಾನು ನಿಮ್ಮ ಜೊತೆಗಿದ್ದೇನೆ.")}</em></h1><p>${esc(st[1])}</p><div class="cp-context"><b>${t("where")}: Step ${index+1} / ${total}</b><span>${pct}% · ${esc(st[2])}</span></div></section><section class="cp-service-panel"><div class="panel-kicker">${t("nav")}</div><div class="cp-journey-rail" aria-label="${t("progress")}">${Array.from({length:total},(_,i)=>`<span class="${i<=index?"active":""}"></span>`).join("")}</div><div class="cp-service-current"><b>${esc(st[0])}</b><span>${esc(st[2])}</span></div><div class="cp-service-stage"><span>${String(index+1).padStart(2,"0")}</span><div><b>${t("need")}</b><small>${esc(st[3])}</small></div></div><div class="cp-context"><b>${t("nextAction")}</b><span>${esc(st[2])}</span></div>${(isApply||isGrievance||isTrack)?`<div class="cp-service-actions"><a class="primary-button" href="${actionLink}" target="_blank" rel="noopener">${actionText} <span>↗</span></a></div>`:""}<div class="cp-service-actions">${index>0?`<button class="secondary-button" type="button" data-service-prev="${id}" data-choice="${choice}" data-index="${index}">${t("back")}</button>`:""}<button class="primary-button" type="button" data-service-next="${id}" data-choice="${choice}" data-index="${index}">${last?t("finish"):t("next")} <span>→</span></button></div><a class="cp-service-back" href="#/services">${t("exit")}</a></section></div></main>`;
    saveContext({...ctx,id,choice,index,state:document.querySelector("[data-service-state]")?.value||ctx.state||""});
    window.dispatchEvent(new Event("carepath:route-rendered"));
  }

  function complete(id,choice){const d=serviceText(id), ref={pension:"CARE-PEN-001",certificate:"CARE-CERT-001",grievance:"CARE-GRV-001"}[id]; inject(); document.querySelector("#app").innerHTML=`<main class="cp-service-complete"><p class="eyebrow">${t("complete")}</p><h1>${d.title}<br><em>${t("completeTitle")}</em></h1><p>${t("completeBody")}</p><div class="cp-service-ref"><b>${t("reference")}</b><strong>${ref}</strong></div><div class="cp-status-list"><div class="current">${statusStages[lang()][id]?.[5]||statusStages.en[id][5]}</div><div>${t("statusHelp")}</div></div><div class="cp-service-actions"><a class="primary-button" href="${id==="grievance"?official.grievanceTrack:official[id]}" target="_blank" rel="noopener">${t("track")} <span>↗</span></a><button class="secondary-button" type="button" data-service-restart="${id}">${t("restart")}</button><a class="secondary-button" href="#/services">${t("choose")}</a></div></main>`; window.dispatchEvent(new Event("carepath:route-rendered"));}

  function route(){
    const m=location.hash.replace(/^#\/?/,"").match(/^service\/(pension|certificate|grievance)(?:\/([^/]+)\/([0-9]+))?$/);
    if(!m)return;
    const id=m[1];
    if(m[2]===undefined)return start(id);
    const choice=decodeURIComponent(m[2]); const index=Math.min(Number(m[3]),5); if(index<0)return start(id); renderStage(id,choice,index);
  }

  document.addEventListener("click",e=>{
    const choice=e.target.closest?.("[data-service-choice]");
    if(choice){e.preventDefault();e.stopImmediatePropagation();const id=choice.dataset.serviceChoice, picked=choice.dataset.choice, stateInput=document.querySelector("[data-service-state]");saveContext({id,choice:picked,state:stateInput?.value||""});location.hash=`/service/${id}/${encodeURIComponent(picked)}/0`;return}
    const next=e.target.closest?.("[data-service-next]");
    if(next){e.preventDefault();e.stopImmediatePropagation();const id=next.dataset.serviceNext,choice=next.dataset.choice,i=Number(next.dataset.index);if(i>=5)complete(id,choice);else location.hash=`/service/${id}/${encodeURIComponent(choice)}/${i+1}`;return}
    const prev=e.target.closest?.("[data-service-prev]");
    if(prev){e.preventDefault();e.stopImmediatePropagation();const i=Math.max(0,Number(prev.dataset.index)-1);location.hash=`/service/${prev.dataset.servicePrev}/${encodeURIComponent(prev.dataset.choice)}/${i}`;return}
    const restart=e.target.closest?.("[data-service-restart]");
    if(restart){e.preventDefault();e.stopImmediatePropagation();location.hash=`/service/${restart.dataset.serviceRestart}`;return}
  },true);
  document.addEventListener("change",e=>{if(e.target.matches("[data-service-state]")){const ctx=state();saveContext({...ctx,state:e.target.value})}});
  window.addEventListener("hashchange",()=>setTimeout(route,0));
  window.addEventListener("carepath:language-changed",()=>setTimeout(route,0));
  inject(); route();
})();
