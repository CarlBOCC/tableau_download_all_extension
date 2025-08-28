/* public/assets/app.js */
(async function () {
  const statusEl = document.getElementById("status");
  const exportBtn = document.getElementById("export");

  function setStatus(msg) {
    statusEl.textContent = msg;
  }

  async function init() {
    try {
      await tableau.extensions.initializeAsync();
      setStatus("Extension initialised.");
    } catch (e) {
      setStatus("Failed to initialise: " + e.message);
    }
  }

  exportBtn.addEventListener("click", async () => {
    try {
      setStatus("Exporting…");
      const dashboard = tableau.extensions.dashboardContent.dashboard;
      // TODO: your “export each worksheet” logic here.
      // e.g., iterate dashboard.worksheets and call getSummaryDataAsync, then bundle to XLSX.
      setStatus("Export complete.");
    } catch (e) {
      setStatus("Export failed: " + e.message);
    }
  });

  init();
})();
