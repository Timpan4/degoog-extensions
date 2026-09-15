// @bun
// extensions/plugins/google-recovery/index.js
var google_recovery_default = {
  name: "Google recovery",
  description: "Open the shared CAPTCHA recovery browser and add a recovery link to failed Google searches. Requires the wall-e recovery frontend.",
  trigger: "!google-recovery",
  async execute() {
    return { title: "Google recovery", html: '<a href="/recovery" target="_blank" rel="noopener">Open Google recovery</a>' };
  }
};
var searchBarActions = [{ id: "google-recovery", label: "Google recovery", type: "navigate", url: "/recovery" }];
export {
  searchBarActions,
  google_recovery_default as default
};
