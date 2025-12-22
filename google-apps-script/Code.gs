/**
 * Google Apps Script Web App for PingPong Stats Tracker
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1dULWW8j8ExvL5b-yMM7TP9kA5QABWWU7YQ9vGPi9HRI
 * 2. Go to Extensions > Apps Script
 * 3. Delete any existing code and paste this entire file
 * 4. Click "Deploy" > "New deployment"
 * 5. Click the gear icon next to "Select type" and choose "Web app"
 * 6. Configure:
 *    - Description: "PingPong Stats API"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (or "Anyone with Google account" for more security)
 * 7. Click "Deploy"
 * 8. Copy the "Web app URL" (it will look like: https://script.google.com/macros/s/...)
 * 9. Paste this URL into your environment.ts and environment.prod.ts files as webAppUrl
 * 10. You may need to authorize the script - follow the prompts
 */

/**
 * Handle POST requests from the Angular app
 */
function doPost(e) {
  try {
    let data;
    
    // Try to parse JSON from different possible sources
    if (e.postData && e.postData.contents) {
      // Direct JSON POST
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter && e.parameter.data) {
      // Form data with 'data' field
      data = JSON.parse(e.parameter.data);
    } else if (e.parameters && e.parameters.data) {
      // Alternative form data format
      data = JSON.parse(e.parameters.data[0]);
    } else {
      return createCORSResponse(false, 'No data received. PostData: ' + JSON.stringify(e.postData) + ', Parameters: ' + JSON.stringify(e.parameter));
    }
    
    // Open the spreadsheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Sheet1');
    
    if (!sheet) {
      return createCORSResponse(false, 'Sheet not found');
    }
    
    // Prepare the row data: [Date, Dad, Luc, Alex, Mom]
    const rowData = [
      data.dateTime || new Date().toLocaleString(),
      data.dad || '',
      data.luc || '',
      data.alex || '',
      data.mom || ''
    ];
    
    // Append the row to the sheet
    sheet.appendRow(rowData);
    
    return createCORSResponse(true, 'Match added successfully', rowData);
    
  } catch (error) {
    return createCORSResponse(false, 'Error: ' + error.toString() + ' Stack: ' + error.stack);
  }
}

/**
 * Handle GET requests (optional - for testing)
 */
function doGet(e) {
  return createCORSResponse(true, 'PingPong Stats API is running. Use POST to submit data.');
}

/**
 * Create a JSON response with CORS headers
 */
function createCORSResponse(success, message, data) {
  const response = {
    success: success,
    message: message,
    data: data || null,
    timestamp: new Date().toISOString()
  };
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Test function - run this to verify the script works
 * (Tools > Script Editor > Select this function > Click Run)
 */
function testAppendRow() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Sheet1');
  
  const testData = [
    new Date().toLocaleString(),
    '11', // Dad
    '',   // Luc
    '',   // Alex
    '8'   // Mom
  ];
  
  sheet.appendRow(testData);
  Logger.log('Test row added successfully!');
}
