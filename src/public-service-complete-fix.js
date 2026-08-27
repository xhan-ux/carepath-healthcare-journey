/* Normalise completion routes so the shared journey renderer can show its final state. */
(() => {
  function normalise(){
    const r=location.hash.replace(/^#\/?/,"").split("/");
    if(r[0]==="public-service" && (r[1]==="certificate" || r[1]==="grievance") && r[2] && r[3]==="complete"){
      location.hash=`/public-service/${r[1]}/${r[2]}/7`;
    }
  }
  window.addEventListener("hashchange",normalise);
  normalise();
})();
