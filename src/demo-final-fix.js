/* Final demo presentation fix: show an explicit registration confirmation without taking ownership of the staff app shell. */
(() => {
  const ROLE_KEYS = ["carepath:role:v6", "carepath:demo-role:v2", "carepath:role:v2"];
  const role = () => ROLE_KEYS.map(k => { try { return sessionStorage.getItem(k); } catch { return null; } }).find(Boolean) || null;
  const route = () => location.hash.replace(/^#\/?/, "") || "services";

  function style() {
    if (document.getElementById("cp-final-demo-style")) return;
    const s = document.createElement("style");
    s.id = "cp-final-demo-style";
    s.textContent = `
      /* Staff shell visibility is handled by demo-stability-fix.js. This layer must never hide #app. */
      .cp-registration-confirmation {
        margin: 18px 10px 0;
        padding: 22px 22px 20px;
        border: 1px solid rgba(12,102,107,.14);
        border-radius: 22px;
        background: #e8f6f2;
        box-shadow: 0 8px 24px rgba(12,102,107,.07);
      }
      .cp-registration-confirmation .cp-confirm-top {
        display:flex; align-items:center; gap:12px; margin-bottom:16px;
      }
      .cp-registration-confirmation .cp-confirm-icon {
        width:38px; height:38px; border-radius:50%; display:grid; place-items:center;
        background:#0c8084; color:#fff; font-weight:800; font-size:20px; flex:none;
      }
      .cp-registration-confirmation .cp-confirm-label {
        margin:0; font-size:12px; letter-spacing:.14em; text-transform:uppercase;
        font-weight:800; color:#0c7074;
      }
      .cp-registration-confirmation h2 { margin:2px 0 7px; font-size:22px; color:#123f43; }
      .cp-registration-confirmation p { margin:0; color:#476568; line-height:1.55; }
      .cp-registration-confirmation .cp-confirm-grid {
        display:grid; grid-template-columns:1fr 1fr; margin-top:18px;
        border-top:1px solid rgba(12,102,107,.14);
      }
      .cp-registration-confirmation .cp-confirm-cell { padding:14px 12px 0 0; }
      .cp-registration-confirmation .cp-confirm-cell + .cp-confirm-cell { padding-left:14px; border-left:1px solid rgba(12,102,107,.14); }
      .cp-registration-confirmation small { display:block; text-transform:uppercase; letter-spacing:.12em; font-weight:800; color:#668084; margin-bottom:5px; }
      .cp-registration-confirmation strong { color:#123f43; }
      @media(max-width:700px){
        .cp-registration-confirmation { margin:14px 10px 0; padding:19px; border-radius:20px; }
      }
    `;
    document.head.appendChild(s);
  }

  function registrationConfirmation() {
    const app = document.querySelector("#app");
    if (!app || role() !== "patient") return;
    const isWaiting = route() === "healthcare/visit/waiting";
    const existing = document.querySelector(".cp-registration-confirmation");
    if (!isWaiting) { existing?.remove(); return; }
    if (existing) return;

    const anchor = app.firstElementChild;
    if (!anchor) return;
    const card = document.createElement("section");
    card.className = "cp-registration-confirmation";
    card.setAttribute("aria-live", "polite");
    card.innerHTML = `
      <div class="cp-confirm-top">
        <span class="cp-confirm-icon">✓</span>
        <p class="cp-confirm-label">Registration confirmed</p>
      </div>
      <h2>You're checked in.</h2>
      <p>Your registration is complete. Your token is now in the Orthopaedics queue. You can simply wait for your turn.</p>
      <div class="cp-confirm-grid">
        <div class="cp-confirm-cell"><small>Token</small><strong>42</strong></div>
        <div class="cp-confirm-cell"><small>Next</small><strong>Wait for your turn</strong></div>
      </div>`;
    anchor.prepend(card);
  }

  function sync() { style(); registrationConfirmation(); }
  sync();
  new MutationObserver(() => sync()).observe(document.body, { childList:true, subtree:true });
  window.addEventListener("hashchange", () => setTimeout(sync, 30));
  window.addEventListener("carepath:route-rendered", () => setTimeout(sync, 30));
})();
