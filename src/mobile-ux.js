(() => {
  const MOBILE = () => window.matchMedia('(max-width: 760px)').matches;

  function hideByHeading(text) {
    if (!MOBILE()) return;
    document.querySelectorAll('section, article, div').forEach((node) => {
      if (node.dataset.mobileSimplified === 'true') return;
      const heading = node.querySelector('h2,h3,h4,.eyebrow,.cp-card-title span,.cp-artifacts-head span,.cp-journey-rail-head span');
      if (!heading) return;
      const value = (heading.textContent || '').trim().toUpperCase();
      if (!value.includes(text)) return;
      const target = node.closest('section') || node;
      target.dataset.mobileSimplified = 'true';
      target.hidden = true;
    });
  }

  function addJourneyStyles() {
    if (document.querySelector('#carepath-mobile-journey-style')) return;
    const style = document.createElement('style');
    style.id = 'carepath-mobile-journey-style';
    style.textContent = `
      @media (max-width:760px) {
        .cp-journey-rail.mobile-focus-rail .cp-journey-track { display:block !important; overflow:visible !important; }
        .cp-journey-rail.mobile-focus-rail .cp-journey-step { display:none !important; }
        .cp-journey-rail.mobile-focus-rail .cp-journey-step.mobile-visible { display:flex !important; align-items:center; gap:12px; text-align:left; padding:10px 0; }
        .cp-journey-rail.mobile-focus-rail .cp-journey-step.mobile-visible span { flex:0 0 34px; width:34px; height:34px; margin:0; }
        .cp-journey-rail.mobile-focus-rail .cp-journey-step.mobile-visible small { margin:0; font-size:12px; line-height:1.25; font-weight:800; color:#173f42; }
        .cp-journey-rail.mobile-focus-rail .cp-journey-step.mobile-current { background:#eef8f6; border-radius:12px; padding:10px 12px; }
        .cp-journey-rail.mobile-focus-rail .cp-journey-step.mobile-current small::before { content:'NOW · '; color:#0c7b7c; letter-spacing:.08em; font-size:9px; }
        .cp-journey-rail.mobile-focus-rail .cp-journey-step.mobile-context small::before { content:'NEXT · '; color:#789092; letter-spacing:.08em; font-size:9px; }
        .cp-journey-rail.mobile-focus-rail .cp-journey-step.mobile-context span { background:#edf2f1; color:#567174; }
        .cp-journey-rail.mobile-focus-rail .cp-journey-step.mobile-visible::after { display:none !important; }
        .cp-journey-rail.mobile-focus-rail .cp-journey-track::after { display:none; }
      }
    `;
    document.head.appendChild(style);
  }

  function simplifyJourneyRail() {
    if (!MOBILE()) return;
    addJourneyStyles();
    document.querySelectorAll('.cp-journey-rail').forEach((rail) => {
      rail.classList.add('mobile-focus-rail');
      const steps = [...rail.querySelectorAll('.cp-journey-step')];
      if (!steps.length) return;

      steps.forEach((step) => step.classList.remove('mobile-visible', 'mobile-current', 'mobile-context'));
      let currentIndex = steps.findIndex((step) => step.classList.contains('current') || step.getAttribute('aria-current') === 'step');
      if (currentIndex < 0) currentIndex = steps.map((step) => step.classList.contains('done')).lastIndexOf(true);
      if (currentIndex < 0) currentIndex = 0;

      const current = steps[currentIndex];
      const next = steps[currentIndex + 1];
      current.classList.add('mobile-visible', 'mobile-current');
      if (next) next.classList.add('mobile-visible', 'mobile-context');
    });
  }

  function markMobileStaff() {
    document.body.classList.toggle('carepath-mobile', MOBILE());
  }

  function apply() {
    markMobileStaff();
    if (!MOBILE()) return;
    hideByHeading('LATEST VERIFIED EVENTS');
    hideByHeading('ASSISTED JOURNEY TRACKING');
    simplifyJourneyRail();
  }

  const observer = new MutationObserver(() => apply());
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('resize', apply, { passive: true });
  window.addEventListener('hashchange', () => setTimeout(apply, 0));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply, { once: true });
  else apply();
})();
