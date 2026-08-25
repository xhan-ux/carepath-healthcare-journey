// Static-demo login refresh fix.
// The app's auth setter changes the active view but historically did not re-render
// the controls, leaving the first patient/staff action disabled after login.
(() => {
  const patientForm = document.querySelector('#patient-login-form');
  const staffForm = document.querySelector('#staff-login-form');
  const enableAfterLogin = (role) => {
    setTimeout(() => {
      if (role === 'patient') {
        const button = document.querySelector('#patient-action');
        if (button) button.disabled = false;
      } else {
        document.querySelectorAll('#staff-controls .sim-control').forEach((button, index) => {
          // At the initial state only registration/check-in is a valid staff action.
          button.disabled = index !== 0;
        });
      }
    }, 0);
  };
  patientForm?.addEventListener('submit', () => enableAfterLogin('patient'), true);
  staffForm?.addEventListener('submit', () => enableAfterLogin('staff'), true);
})();
