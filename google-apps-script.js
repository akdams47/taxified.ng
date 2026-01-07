/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║         TAXIFIED.NG - GOOGLE SHEETS LEAD CAPTURE              ║
 * ╠═══════════════════════════════════════════════════════════════╣
 * ║                                                               ║
 * ║  SETUP INSTRUCTIONS (10-15 minutes):                          ║
 * ║                                                               ║
 * ║  1. Create a new Google Sheet (sheets.google.com)             ║
 * ║                                                               ║
 * ║  2. Click: Extensions > Apps Script                           ║
 * ║                                                               ║
 * ║  3. Delete ALL the default code in the editor                 ║
 * ║                                                               ║
 * ║  4. Copy and paste THIS ENTIRE FILE into the editor           ║
 * ║                                                               ║
 * ║  5. Click the blue "Deploy" button (top right)                ║
 * ║                                                               ║
 * ║  6. Select "New deployment"                                   ║
 * ║                                                               ║
 * ║  7. Click the gear icon ⚙️ and select "Web app"               ║
 * ║                                                               ║
 * ║  8. Set these options:                                        ║
 * ║     - Description: "Lead Capture" (or anything)               ║
 * ║     - Execute as: "Me"                                        ║
 * ║     - Who has access: "Anyone"  ⬅️ IMPORTANT!                 ║
 * ║                                                               ║
 * ║  9. Click "Deploy"                                            ║
 * ║                                                               ║
 * ║  10. Click "Authorize access" and follow the prompts          ║
 * ║      (You may need to click "Advanced" > "Go to..." if        ║
 * ║       Google shows a warning - this is normal)                ║
 * ║                                                               ║
 * ║  11. Copy the "Web app URL" that appears                      ║
 * ║      (It looks like: https://script.google.com/macros/s/...)  ║
 * ║                                                               ║
 * ║  12. Open config.js and paste the URL as the endpoint value   ║
 * ║                                                               ║
 * ║  DONE! Leads will now appear in your Google Sheet.            ║
 * ║                                                               ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

// ================== CODE STARTS HERE ==================
// (Don't modify unless you know what you're doing)

const SHEET_NAME = 'Leads';

function doPost(e) {
  try {
    const sheet = getOrCreateSheet();
    const data = JSON.parse(e.postData.contents);

    // Add the lead to the spreadsheet
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.name || '',
      data.phone || '',
      data.email || '',
      data.service || '',
      data.package || '',
      data.message || '',
      data.source || 'website'
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'ok',
      message: 'Taxified.ng Lead Capture is ready!'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);

    // Set up headers
    const headers = ['Timestamp', 'Name', 'Phone', 'Email', 'Service', 'Package', 'Message', 'Source'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    // Style the header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#2563EB');
    headerRange.setFontColor('white');

    // Set column widths for better readability
    sheet.setColumnWidth(1, 180); // Timestamp
    sheet.setColumnWidth(2, 150); // Name
    sheet.setColumnWidth(3, 140); // Phone
    sheet.setColumnWidth(4, 200); // Email
    sheet.setColumnWidth(5, 140); // Service
    sheet.setColumnWidth(6, 140); // Package
    sheet.setColumnWidth(7, 300); // Message
    sheet.setColumnWidth(8, 100); // Source

    // Freeze the header row
    sheet.setFrozenRows(1);
  }

  return sheet;
}

// Run this function to test that everything is set up correctly
function testSetup() {
  const sheet = getOrCreateSheet();
  Logger.log('Setup successful! Sheet name: ' + sheet.getName());
  Logger.log('You can now deploy this script as a Web App.');
}
