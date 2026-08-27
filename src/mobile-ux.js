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

  function simplifyJourneyRail() {
    if (!MOBILE()) return;
    document.querySelectorAll('.cp-journey-rail').forEach((rail) => {
      rail.classList.add('mobile-focus-rail');
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
