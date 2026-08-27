/* Keep route/render failures from leaving a blank white app on touch devices. */
(() => {
  const KEY = "carepath:runtime-recovery:v1";
  const app = document.querySelector("#app");
  if (!app) return;

  function recovery(message="CarePath hit a temporary screen error.") {
    if (app.dataset.recoveryVisible === "true") return;
    app.dataset.recoveryVisible = "true";
    app.innerHTML = `<main class="cp-runtime-recovery" role="alert"><div><p class="eyebrow">CAREPATH · RECOVERY</p><h1>Let’s get you<br><em>back on track.</em></h1><p>${message}</p><div class="cp-runtime-actions"><button type="button" data-runtime-reload>Reload CarePath</button><a href="#/services">Go home</a></div></div></main>`;
    app.querySelector("[data-runtime-reload]")?.addEventListener("click", () => {
      try { sessionStorage.setItem(KEY, "1"); } catch {}
      location.reload();
    });
  }

  function clearRecoveryFlag(){
    if (app.dataset.recoveryVisible === "true") delete app.dataset.recoveryVisible;
  }

  window.addEventListener("error", event => {
    console.error("CarePath runtime error:", event.error || event.message);
    if (!app.children.length) recovery();
  });

  window.addEventListener("unhandledrejection", event => {
    console.error("CarePath unhandled rejection:", event.reason);
    if (!app.children.length) recovery();
  });

  window.addEventListener("hashchange", () => {
    clearRecoveryFlag();
    setTimeout(() => {
      if (!app.children.length) {
        let recovered = false;
        try { recovered = sessionStorage.getItem(KEY) === "1"; } catch {}
        if (!recovered) {
          try { sessionStorage.setItem(KEY, "1"); } catch {}
          location.reload();
        } else {
          recovery();
        }
      } else {
        try { sessionStorage.removeItem(KEY); } catch {}
      }
    }, 180);
  });
})();
