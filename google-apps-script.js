// Google Apps Script for Wowealth Contact Form
// Copy this entire code into Google Apps Script (Extensions → Apps Script in your Google Sheet)

function doPost(e) {
  try {
    // Handle case where e might be undefined or null
    if (!e) {
      e = { parameter: {} };
    }
    if (!e.parameter) {
      e.parameter = {};
    }
    
    // Get the active spreadsheet and sheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getActiveSheet();
    
    // Ensure headers exist (check if first row is empty or doesn't have headers)
    const headerRow = sheet.getRange(1, 1, 1, 6).getValues()[0];
    const hasHeaders = headerRow[0] && headerRow[0].toString().toLowerCase().includes('timestamp');
    
    if (!hasHeaders) {
      // Set headers if they don't exist
      sheet.getRange(1, 1, 1, 6).setValues([['Timestamp', 'Name', 'Email', 'Phone', 'Service', 'Message']]);
      // Format header row
      sheet.getRange(1, 1, 1, 6).setFontWeight('bold');
      sheet.getRange(1, 1, 1, 6).setBackground('#4285f4');
      sheet.getRange(1, 1, 1, 6).setFontColor('#ffffff');
    }
    
    // Log what we received for debugging
    Logger.log('=== doPost called ===');
    Logger.log('Raw e object: ' + JSON.stringify(e));
    Logger.log('e.parameter: ' + JSON.stringify(e.parameter));
    Logger.log('e.parameter type: ' + typeof e.parameter);
    Logger.log('e.parameter keys: ' + (e.parameter ? Object.keys(e.parameter).join(', ') : 'null'));
    
    if (e.postData) {
      Logger.log('e.postData exists');
      Logger.log('e.postData.type: ' + e.postData.type);
      Logger.log('e.postData.contents: ' + e.postData.contents);
      Logger.log('e.postData.length: ' + e.postData.length);
      
      // Parse form-encoded POST data
      if (e.postData.contents) {
        Logger.log('Parsing postData.contents');
        try {
          const contents = e.postData.contents;
          const params = contents.split('&');
          Logger.log('Found ' + params.length + ' parameters in postData');
          
          params.forEach(param => {
            const parts = param.split('=');
            if (parts.length === 2) {
              const key = decodeURIComponent(parts[0]);
              const value = decodeURIComponent(parts[1].replace(/\+/g, ' '));
              e.parameter[key] = value;
              Logger.log('Added parameter: ' + key + ' = ' + value);
            }
          });
          
          Logger.log('Parsed parameters from postData: ' + JSON.stringify(e.parameter));
        } catch (parseError) {
          Logger.log('Error parsing postData: ' + parseError.toString());
        }
      }
    } else {
      Logger.log('No postData received');
    }
    
    // Parse incoming data - handle both form-encoded and JSON
    let name, email, phone, service, message, timestamp;
    
    // First, try to get from e.parameter (form-encoded POST data)
    // For Google Apps Script, form-encoded POST data should be in e.parameter automatically
    if (e.parameter && Object.keys(e.parameter).length > 0) {
      name = e.parameter.name || '';
      email = e.parameter.email || '';
      phone = e.parameter.phone || '';
      service = e.parameter.service || '';
      message = e.parameter.message || '';
      timestamp = e.parameter.timestamp || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      
      Logger.log('Data extracted from e.parameter');
      Logger.log('e.parameter keys: ' + Object.keys(e.parameter).join(', '));
    } else {
      Logger.log('e.parameter is empty or has no keys');
    }
    
    // If e.parameter is empty, try parsing from postData.contents
    if ((!name && !email && !phone) && e.postData && e.postData.contents) {
      Logger.log('Trying to parse from postData.contents');
      
      // Try JSON first
      if (e.postData.type === 'application/json') {
        try {
          const data = JSON.parse(e.postData.contents);
          name = data.name || name || '';
          email = data.email || email || '';
          phone = data.phone || phone || '';
          service = data.service || service || '';
          message = data.message || message || '';
          timestamp = data.timestamp || timestamp || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
          Logger.log('Data extracted from JSON postData');
        } catch (jsonError) {
          Logger.log('JSON parse error: ' + jsonError.toString());
        }
      }
      
      // Try form-encoded data (application/x-www-form-urlencoded)
      if (e.postData.type === 'application/x-www-form-urlencoded' || (!name && !email)) {
        try {
          // Parse URL-encoded string manually
          const params = e.postData.contents.split('&');
          const data = {};
          params.forEach(param => {
            const parts = param.split('=');
            if (parts.length === 2) {
              data[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1].replace(/\+/g, ' '));
            }
          });
          
          name = data.name || name || '';
          email = data.email || email || '';
          phone = data.phone || phone || '';
          service = data.service || service || '';
          message = data.message || message || '';
          timestamp = data.timestamp || timestamp || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
          Logger.log('Data extracted from form-encoded postData');
        } catch (formError) {
          Logger.log('Form-encoded parse error: ' + formError.toString());
        }
      }
    }
    
    // If still no data, use defaults
    if (!timestamp) {
      timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    }
    
    // Log received data for debugging
    Logger.log('Final parsed data: ' + JSON.stringify({name, email, phone, service, message, timestamp}));
    
    // Add the data to the sheet
    sheet.appendRow([
      timestamp,
      name,
      email,
      phone,
      service,
      message
    ]);
    
    // Log success
    Logger.log('Data successfully added to sheet');
    
    // Send email notification
    try {
      // UPDATE THIS EMAIL ADDRESS to your email where you want to receive notifications
      const recipientEmail = 'Sandannkgp@gmail.com'; // Change this to your email
      
      const subject = 'New Form Submission - Wowealth Website';
      const emailBody = `
        <h2>New Contact Form Submission</h2>
        <p><strong>Timestamp:</strong> ${timestamp}</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Service Interest:</strong> ${service || 'Not specified'}</p>
        <p><strong>Message:</strong></p>
        <p>${message || 'No message provided'}</p>
        <hr>
        <p><small>This is an automated notification from your Wowealth website contact form.</small></p>
      `;
      
      MailApp.sendEmail({
        to: recipientEmail,
        subject: subject,
        htmlBody: emailBody
      });
      
      Logger.log('Email notification sent to ' + recipientEmail);
    } catch (emailError) {
      // Log email error but don't fail the form submission
      Logger.log('Error sending email notification: ' + emailError.toString());
    }
    
    // Return success response
    return HtmlService.createHtmlOutput('<html><body><h2>Thank you! Form submitted successfully.</h2><script>setTimeout(function(){window.top.close();}, 1000);</script></body></html>');
    
  } catch (error) {
    // Log detailed error for debugging
    Logger.log('Error in doPost: ' + error.toString());
    Logger.log('Error stack: ' + error.stack);
    if (e && e.parameter) {
      Logger.log('Parameters received: ' + JSON.stringify(e.parameter));
    } else {
      Logger.log('No parameters received - e is: ' + JSON.stringify(e));
    }
    if (e && e.postData) {
      Logger.log('Post data: ' + e.postData.contents);
    }
    
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      'result': 'error',
      'message': error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    // Log what we received
    Logger.log('=== doGet called ===');
    Logger.log('doGet e object: ' + JSON.stringify(e));
    Logger.log('doGet e.parameter: ' + JSON.stringify(e.parameter));
    
    // Handle form submissions via GET (URL parameters)
    if (e && e.parameter && (e.parameter.name || e.parameter.email || e.parameter.phone)) {
      Logger.log('Form submission detected in doGet, processing directly');
      
      // Get the active spreadsheet and sheet
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      let sheet = ss.getActiveSheet();
      
      // Ensure headers exist
      const headerRow = sheet.getRange(1, 1, 1, 6).getValues()[0];
      const hasHeaders = headerRow[0] && headerRow[0].toString().toLowerCase().includes('timestamp');
      
      if (!hasHeaders) {
        // Set headers if they don't exist
        sheet.getRange(1, 1, 1, 6).setValues([['Timestamp', 'Name', 'Email', 'Phone', 'Service', 'Message']]);
        // Format header row
        sheet.getRange(1, 1, 1, 6).setFontWeight('bold');
        sheet.getRange(1, 1, 1, 6).setBackground('#4285f4');
        sheet.getRange(1, 1, 1, 6).setFontColor('#ffffff');
      }
      
      // Extract form data from URL parameters
      const name = e.parameter.name || '';
      const email = e.parameter.email || '';
      const phone = e.parameter.phone || '';
      const service = e.parameter.service || '';
      const message = e.parameter.message || '';
      const timestamp = e.parameter.timestamp || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      
      Logger.log('Form data extracted: ' + JSON.stringify({name, email, phone, service, message, timestamp}));
      
      // Add the data to the sheet
      sheet.appendRow([
        timestamp,
        name,
        email,
        phone,
        service,
        message
      ]);
      
      Logger.log('Data successfully added to sheet via doGet');
      
      // Send email notification
      try {
        const recipientEmail = 'Sandannkgp@gmail.com';
        const subject = 'New Form Submission - Wowealth Website';
        const emailBody = `
          <h2>New Contact Form Submission</h2>
          <p><strong>Timestamp:</strong> ${timestamp}</p>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Service Interest:</strong> ${service || 'Not specified'}</p>
          <p><strong>Message:</strong></p>
          <p>${message || 'No message provided'}</p>
          <hr>
          <p><small>This is an automated notification from your Wowealth website contact form.</small></p>
        `;
        
        MailApp.sendEmail({
          to: recipientEmail,
          subject: subject,
          htmlBody: emailBody
        });
        
        Logger.log('Email notification sent to ' + recipientEmail);
      } catch (emailError) {
        Logger.log('Error sending email notification: ' + emailError.toString());
      }
      
      // Return success response (for iframe)
      return HtmlService.createHtmlOutput('<html><body><h2>Thank you! Form submitted successfully.</h2><script>setTimeout(function(){if(window.top && window.top !== window){window.top.close();}}, 1000);</script></body></html>');
    }
    
    // Otherwise, return test/status information
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getActiveSheet();
    const sheetName = sheet.getName();
    
    return ContentService.createTextOutput(
      "Wowealth Form Handler is running!\n\n" +
      "Spreadsheet: " + ss.getName() + "\n" +
      "Active Sheet: " + sheetName + "\n" +
      "Last row: " + sheet.getLastRow() + "\n\n" +
      "Parameters received: " + JSON.stringify(e.parameter)
    );
  } catch (error) {
    Logger.log('Error in doGet: ' + error.toString());
    Logger.log('Error stack: ' + error.stack);
    return ContentService.createTextOutput("Error: " + error.toString());
  }
}

// Test function - run this manually to verify setup
function testFormSubmission() {
  const testData = {
    parameter: {
      name: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
      service: 'Loan',
      message: 'This is a test submission',
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    }
  };
  
  const result = doPost(testData);
  Logger.log('Test result: ' + result);
}

