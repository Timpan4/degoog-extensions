// @bun
// extensions/plugins/google-recovery/index.js
var google_recovery_default = {
  name: "Google recovery",
  description: "Open the shared browser automatically when Google reports a CAPTCHA, then retry from the search page. Requires the wall-e recovery frontend.",
  trigger: "google-recovery",
  async execute() {
    return { title: "Google recovery", html: '<a class="google-recovery-link" href="/recovery">Open Google recovery</a>' };
  }
};
var searchBarActions = [{ id: "google-recovery", label: "Google recovery", type: "custom" }];
export {
  searchBarActions,
  google_recovery_default as default
};
