// extension.js

(async () => {
  // Grab references to your status and spinner elements
  const statusEl = document.getElementById('status');
  const spinner  = document.getElementById('spinner');

  // Helper functions for UI feedback
  const setStatus = txt => statusEl.textContent = txt;
  const showSpinner = () => { spinner.style.display = 'inline-block'; };
  const hideSpinner = () => { spinner.style.display = 'none'; };

  // If loaded in a regular browser (outside Tableau), bail out gracefully
  if (typeof tableau === 'undefined' || !tableau.extensions) {
    setStatus('Loaded outside Tableau – drop onto a Dashboard to run.');
    hideSpinner();
    return;
  }

  // Try to initialise the Tableau Extensions API
  try {
    await tableau.extensions.initializeAsync();
    document.getElementById('export')
            .addEventListener('click', exportAllTables);
    setStatus('Ready. Click “Download All as Excel” to begin.');
  } catch (err) {
    console.error('initializeAsync() failed:', err);
    setStatus(`Init failed: ${err.message || err}`);
    hideSpinner();
    return;
  }

  // Main export function
  async function exportAllTables() {
    const sheets = tableau.extensions.dashboardContent.dashboard.worksheets;
    const total  = sheets.length;
    const wb     = XLSX.utils.book_new();

    showSpinner();
    setStatus(`Starting export of ${total} sheet${total > 1 ? 's' : ''}…`);

    for (let i = 0; i < sheets.length; i++) {
      const sheet = sheets[i];
      try {
        setStatus(`Fetching (${i + 1}/${total}): “${sheet.name}”`);
        const tableData = await sheet.getSummaryDataAsync({ maxRows: 1000000 });

        // Build array-of-arrays: header row + data rows
        const headers = tableData.columns.map(c => c.fieldName);
        const rows    = tableData.data.map(r => r.map(cell => cell.formattedValue));
        const aoa     = [headers, ...rows];

        // Convert to SheetJS worksheet and append
        const ws        = XLSX.utils.aoa_to_sheet(aoa);
        const safeName  = sheet.name.substring(0, 31); // Excel limit
        XLSX.utils.book_append_sheet(wb, ws, safeName);
      } catch (sheetErr) {
        console.warn(`Failed to fetch "${sheet.name}":`, sheetErr);
        // Continue with next sheet
      }
    }

    setStatus('Generating .xlsx file…');
    try {
      XLSX.writeFile(wb, 'all-tables-export.xlsx');
      setStatus('Export complete!');
    } catch (writeErr) {
      console.error('Write failed:', writeErr);
      setStatus('Error generating file.');
    } finally {
      hideSpinner();
    }
  }
})();
