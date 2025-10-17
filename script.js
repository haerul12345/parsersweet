document.addEventListener("DOMContentLoaded", function () {

  // Application version
  const appVersion = "3.7";
  //document.getElementById("app-version").textContent = `ParserSweet Version ${appVersion} © 2025 hji`;
  document.getElementById("app-version").textContent = `Version ${appVersion} © 2025 hji`;

  // TAB
  const tab = document.getElementById('tab');
  const modal = document.getElementById('modal');
  const closeBtn = document.getElementById('closeBtn');
  const convertBtn = document.getElementById('convertBtn');
  const hexInput = document.getElementById('hexInput');
  const asciiResult = document.getElementById('asciiResult');

  // Show modal
  tab.addEventListener('click', () => {
    modal.classList.add('show');
    hexInput.focus();
  });


  // Close modal
  /*
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('show');
      asciiResult.textContent = '';
      hexInput.value = '';
    });
  */
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
      asciiResult.textContent = '';
      hexInput.value = '';
    }
  });

  // Convert hex to ASCII
  convertBtn.addEventListener('click', () => {
    const hexLines = hexInput.value.trim().split(/\r?\n/); // Split input by lines
    const isMultiline = hexLines.length > 1;

    let output = '<strong>Result:</strong><br>';
    hexLines.forEach((hex, index) => {
      if (!/^[0-9a-fA-F]+$/.test(hex) || hex.length % 2 !== 0) {
        output += `<blockquote>${isMultiline ? `Line ${index + 1}: ` : ''}Invalid hex string.</blockquote>`;
        return;
      }

      let ascii = '';
      for (let i = 0; i < hex.length; i += 2) {
        const byte = hex.substr(i, 2);
        ascii += String.fromCharCode(parseInt(byte, 16));
      }

      output += `<blockquote>${isMultiline ? `Line ${index + 1}: ` : ''}${ascii}</blockquote>`;
    });

    asciiResult.innerHTML = output;
  });

  // Button EventListener
  const buttons = document.querySelectorAll(".btn");
  buttons.forEach(button => {
    button.addEventListener("click", function () {
      const screenId = this.getAttribute("data-screen");
      console.log("Button clicked, screenId:", screenId); // Add this line
      showScreen(screenId);
    });
  });

  // JSON Input EventListener
  const jsonInput = document.getElementById("json-input");
  if (jsonInput) {
    jsonInput.addEventListener("input", parseJSON);
    console.log("Data entered, input:", jsonInput); // Add this line
  }

  // Copy Button EventListener
  const copyButton = document.getElementById("copy-button");
  if (copyButton) {
    copyButton.addEventListener("click", copyTable);
    console.log("Copy Button clicked"); // Add this line
  }

  // OK Button on Alert EventListener
  const okButton = document.getElementById('alert-ok-button');
  if (okButton) {
    okButton.addEventListener('click', closeAlert);
  }

  // DE22 Input EventListener
  const de22Input = document.getElementById('de22-input');
  if (de22Input) {
    de22Input.value = de22Input.value.toUpperCase();

    // Listen for input and auto-capitalize
    de22Input.addEventListener('input', () => {
      de22Input.value = de22Input.value.toUpperCase();
      displayParsedData();
    });
  }

  // Button Display Definition EventListener
  const defineButton = document.getElementById("defButton");
  if (defineButton) {
    defineButton.addEventListener("click", displayDefinitions);
    console.log("Definition Button clicked"); // Add this line
  }

  // MTI Input EventListener
  const mtiInput = document.getElementById("mti-data-input");
  if (mtiInput) {
    mtiInput.addEventListener("input", parseMTI);
    console.log("Data entered, input:", mtiInput); // Add this line
  }

  // Tab EventListener
  const tabs = document.querySelectorAll(".tabs .tab");
  const contents = document.querySelectorAll(".tab-content");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      // Remove active class from all tabs
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      // Hide all tab contents
      contents.forEach(content => content.style.display = "none");

      // Show the selected tab content
      const selectedTab = tab.getAttribute("data-tab");
      document.getElementById(selectedTab).style.display = "block";
    });
  });

  // Record Input or Change EventListener
  const inputRecord = document.getElementById("inputRecord");
  if (inputRecord) {
    inputRecord.addEventListener("input", parseHostRecord);
    inputRecord.addEventListener("change", parseHostRecord);
  }

  // File Input Host Data EventListener
  const fileInput = document.getElementById("fileInput");
  const openButton = document.getElementById("openFileButton");
  if (fileInput && openButton) {
    // Trigger file input when button is clicked
    openButton.addEventListener("click", () => {
      fileInput.click();
    });

    // Handle file selection
    fileInput.addEventListener("change", (event) => {
      loadFileContent(event);
    });
  }

  // Find Record Button EventListener
  const findButton = document.getElementById("findButton");
  if (findButton) {
    findButton.addEventListener("click", findRecord);
    console.log("Copy Button clicked"); // Add this line
  }

  // Refresh Button EventListener
  const refreshButton = document.getElementById("refreshButton");
  if (refreshButton) {
    refreshButton.addEventListener("click", resetView);
    console.log("Refresh Button clicked"); // Add this line
  }

  // Save Host Record Button EventListener
  const saveButton = document.getElementById("saveHostRecordButton");
  if (saveButton) {
    saveButton.addEventListener("click", validateAndSaveJSON);
  }

});

// Record Header Click EventListener
document.addEventListener('click', function (event) {
  const recordHeader = event.target.closest('.record-header');
  // Handle record header click
  if (recordHeader) {
    const recordContent = recordHeader.nextElementSibling;
    if (recordContent) {
      recordContent.style.display = recordContent.style.display === 'block' ? 'none' : 'block';
    }
  }
});

// Paste from Clipboard EventListener for JSON parser
document.getElementById("pasteButton").addEventListener("click", async () => {
  try {
    const text = await navigator.clipboard.readText();
    document.getElementById("json-input").value = text;
    parseJSON(); // Automatically parse the pasted JSON
  } catch (err) {
    console.error("Failed to read clipboard contents: ", err);
  }
});

// Paste from Clipboard EventListener for MTI parser
document.getElementById("paste-mti-btn").addEventListener("click", async () => {
  try {
    const text = await navigator.clipboard.readText();
    document.getElementById("mti-data-input").value = text;
    parseMTI(); // Automatically parse the pasted JSON
  } catch (err) {
    console.error("Failed to read clipboard contents: ", err);
  }
});

const clearBtn = document.getElementById("clear-mti-btn");
if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    const inputField = document.getElementById("mti-data-input");
    const outputField = document.getElementById("mti-data-input");

    if (inputField) inputField.value = "";
    if (outputField) outputField.innerHTML = "";

    const tableResponse = document.getElementById('responseTable');
    const tableRequest = document.getElementById('requestTable');
    if (tableResponse) {
      tableResponse.innerHTML = '';
    }
    if (tableRequest) {
      tableRequest.innerHTML = '';
    }

    showInfoAlert('MTI data cleared. Please enter new data.');
  });
}

// Append from Clipboard EventListener for MTI parser
const appendBtn = document.getElementById("append-mti-btn");
if (appendBtn) {
  appendBtn.addEventListener("click", async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();

      // Basic check: must start with {
      if (!clipboardText.trim().startsWith("{")) {
        throw new Error("Clipboard does not contain a valid JSON object.");
      }

      const inputField = document.getElementById("mti-data-input");
      const currentText = inputField.value.trim();

      // Append raw JSON block directly
      const newText = currentText + "\n" + clipboardText.trim();
      inputField.value = newText;

      if (typeof parseMTI === "function") {
        parseMTI(); // Let cbaMTI handle parsing and rendering
      }
    } catch (err) {
      console.error("Failed to append JSON: ", err.message);
      alert("Error: " + err.message);
    }
  });
}

// Screen handling
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
    document.getElementById('tabWrapper').style.display = 'none';
  });

  // Show the selected screen
  document.getElementById(screenId).classList.add('active');

  // Hide definitions if visible
  const definitionsContainer = document.getElementById('definitionsContainer');
  const definitions = document.getElementById('defButton');
  if (definitionsContainer) {
    definitionsContainer.remove();
    if (definitions) {
      definitions.textContent = 'Show Definitions';
    }
  }

  const input = document.getElementById('json-input');
  if (input) input.value = '';

  // Clear the output container
  const output = document.getElementById('json-output');
  const copyButton = document.getElementById('copy-button');
  if (output) {
    copyButton.style.display = 'none';
    output.innerHTML = '';
  }

  const tableResponse = document.getElementById('responseTable');
  const tableRequest = document.getElementById('requestTable');
  if (tableResponse) {
    tableResponse.innerHTML = '';
  }
  if (tableRequest) {
    tableRequest.innerHTML = '';
  }
  const inputMTI = document.getElementById('mti-data-input');
  if (inputMTI) inputMTI.value = '';

}

// Variable to track if DE22 input was previously filled
let jsonInputwasPreviouslyFilled = false;

// JSON Parser code
function parseJSON() {
  const input = document.getElementById('json-input').value;
  const output = document.getElementById('json-output');
  const copyButton = document.getElementById('copy-button');

  if (!input) {
    if (!jsonInputwasPreviouslyFilled) {
      showAlert("JSON data is empty. Please enter the data.", "warning");
    }
    document.getElementById('json-output').value = '';
    output.style.display = 'none'; // Hide the output container
    copyButton.style.display = 'none'; // Hide the copy button
    showInfoAlert('Data cleared. Please enter new data.');
    return;
  }
  jsonInputwasPreviouslyFilled = true;

  try {
    const jsonData = JSON.parse(input);
    // This is for axl response parser
    if (jsonData.event && jsonData.event.resource) {
      output.innerHTML = generateTable(jsonData.event.resource);
      output.style.display = 'block'; // Show the copy button
      copyButton.style.display = 'block'; // Show the copy button
      showInfoAlert(`Data parsed successfully!`);
    }
    // This is for API parser - createAt & hostResponseData
    else if (jsonData.createdAt || jsonData.hostResponseData) {
      output.innerHTML = generateTable(jsonData);
      output.style.display = 'block'; // Show the copy button
      copyButton.style.display = 'block'; // Show the copy button
      showInfoAlert(`Data parsed successfully!`);
    }
    else {
      //output.textContent = 'No resource key found in the JSON data';
      //showAlert(`No key found in the JSON data`, "error");
      //copyButton.style.display = 'none'; // Hide the copy button
      output.innerHTML = generateTable(jsonData);
      output.style.display = 'block'; // Show the copy button
      copyButton.style.display = 'block'; // Show the copy button
      showInfoAlert(`Data parsed successfully!`);

    }

  } catch (e) {
    //output.textContent = 'Invalid JSON data';
    showAlert(`Invalid format`, "error");
    output.style.display = 'none'; // Show the copy button
    copyButton.style.display = 'none'; // Hide the copy button
  }
}

// Function to generate HTML table from JSON data
function generateTable(data) {
  let table = '<table><thead><tr><th class="key-column">Key</th><th class="value-column">Value</th></thead><tbody>';
  table += formatTableRows(data);
  table += '</tbody></table>';
  return table;
}

// Function to format JSON data into table rows
function formatTableRows(data, indentLevel = 0) {
  let rows = '';
  const indent = '&nbsp;'.repeat(indentLevel * 4);

  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const value = data[key];
      if (typeof value === 'object' && value !== null) {
        //rows += `<tr><td>${indent}${key}</td><td></td></tr>`;
        //rows += formatTableRows(value, indentLevel + 1);

        if (key === 'customData' && Array.isArray(value)) {
          // Create embedded table for customData
          let customTable = `
                        <table border="1" style="margin-top:8px;">
                            <thead>
                                <tr><th>Name</th><th>Value</th></tr>
                            </thead>
                            <tbody>
                    `;
          value.forEach(item => {
            customTable += `<tr><td>${item.name}</td><td>${item.value}</td></tr>`;
          });
          customTable += `</tbody></table>`;

          rows += `<tr><td>${indent}${key}</td><td>${customTable}</td></tr>`;
        } else {
          rows += `<tr><td>${indent}${key}</td><td></td></tr>`;
          rows += formatTableRows(value, indentLevel + 1);
        }
      } else {
        // Special handling for 'iccData' key - for createdAt key
        if (key === 'iccData') {
          let rawValue = String(value);

          if (rawValue === 'null') {
            rows += `<tr><td>${indent}${key}</td><td>${value}</td></tr>`;
          } else {
            // Parse TLV
            const tlvTable = parseTLV(rawValue);
            // Combine raw value and TLV table in one cell
            const combinedValue = `<div><strong>Raw:</strong> ${rawValue}</div><div style="margin-top:8px; overflow:auto;">${tlvTable}</div>`;
            rows += `<tr><td>${indent}${key}</td><td>${combinedValue}</td></tr>`;
          }

        } else {
          rows += `<tr><td>${indent}${key}</td><td>${value}</td></tr>`;
        }
      }
    }
  }
  return rows;
}

// Function to copy the generated table to clipboard
function copyTable() {
  const table = document.querySelector('#json-output table');
  if (table) {
    const range = document.createRange();
    range.selectNode(table);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    //alert('Table copied to clipboard!');
    showAlert(`Table copied to clipboard!`, "success");
  } else {
    //alert('No table to copy');
    showAlert(`Oops!  No table to copy`, "error");
  }
}

// Alert Icons
const alertIcons = {
  error: `<div style="font-size: 2.5em; text-align: center;">  
  <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
  </div>`,

  success: `<div style="font-size: 2.5em; text-align: center;">
    <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24" fill="none" stroke="green" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20 6 9 17 4 12" />
    </svg>
  </div>`,

  warning: `<div style="font-size: 2.5em; text-align: center;">  
    
  <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24" fill="none" stroke="orange" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
  </div>`,

  info: `<div style="font-size: 2.5em; text-align: center;">
  <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24" fill="none" stroke="blue" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="7" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
  </div>`
};

// variable to store the alert callback function
let alertCallback = null;

// Alert Message function
function showAlert(message, type = 'info', callback = null) {
  const icon = alertIcons[type] || alertIcons.info;
  const alertText = document.getElementById("alertText");
  alertText.innerHTML = icon + `<div style="text-align: center;">${message}</div>`;
  document.getElementById("overlay").style.display = "block";
  document.getElementById('customAlert').style.display = 'block';
  alertCallback = callback; // Store the callback
}

// Info Alert function
function showInfoAlert(message) {
  const alertBox = document.getElementById('infoAlert');
  alertBox.innerHTML = `✅ ${message}`;
  //console.log("showInfoAlert called with message:", message); // ✅ Console log added

  alertBox.classList.add('show');
  setTimeout(() => {
    alertBox.classList.remove('show');
  }, 2500); // Show for 3 seconds
}

// Close Alert function
function closeAlert() {
  document.getElementById('customAlert').style.display = 'none';
  document.getElementById("overlay").style.display = "none";

  if (typeof alertCallback === 'function') {
    alertCallback();
    alertCallback = null; // Reset after calling
  }
}

// DE22 Parser code
function resizeparsedDataOutput() {
  const parsedDataOutput = document.getElementById('parse-output');
  parsedDataOutput.style.height = 'auto';
  parsedDataOutput.style.height = parsedDataOutput.scrollHeight + 'px';
}

// Variable to track if DE22 input was previously filled
let wasPreviouslyFilled = false;

// Function to display parsed data from DE22 input
function displayParsedData() {
  const cardData = document.getElementById('de22-input').value;

  if (!cardData) {
    if (!wasPreviouslyFilled) {
      showAlert("DE22 data is empty. Please enter the data.", ' warning');
    }
    document.getElementById('parse-output').value = '';
    return;
  }
  wasPreviouslyFilled = true;

  const parsedData = parseCardData(cardData);
  let output = '';
  for (const [key, value] of Object.entries(parsedData)) {
    output += `${key} > ${value}\n`;
  }
  document.getElementById('parse-output').value = output;
  resizeparsedDataOutput();
}

// Function to parse card data from DE22 input
function parseCardData(cardData) {
  const definitions = {
    cardDataInputCapability: {
      '0': 'Unknown',
      '1': 'Manual, no terminal',
      '2': 'Magnetic stripe read',
      '3': 'Bar code',
      '4': 'OCR',
      '5': 'Integrate circuit card (ICC)',
      '6': 'Key entered',
      'A': 'Contactless ICC',
      'B': 'Contactless magnetic stripe'
    },
    cardholderAuth: {
      '0': 'No electronic authentication',
      '1': 'PIN',
      '2': 'Electronic signature analysis',
      '3': 'Biometrics',
      '4': 'Biographic',
      '5': 'Electronic authentication inoperative',
      '6': 'Other'
    },
    cardCapture: {
      '0': 'None',
      '1': 'Capture'
    },
    operatingEnvironment: {
      '0': 'No terminal used',
      '1': 'On premises of card acceptor, attended',
      '2': 'On premises of card acceptor, unattended',
      '3': 'Off premises of card acceptor, attended',
      '4': 'Off premises of card acceptor, unattended',
      '5': 'On premises of cardholder, attended'
    },
    cardholderPresent: {
      '0': 'Cardholder present',
      '1': 'Cardholder not present, unspecified',
      '2': 'Cardholder not present, mail order',
      '3': 'Cardholder not present, telephone',
      '4': 'Cardholder not present, standing authorisation'
    },
    cardPresent: {
      '0': 'Card not present',
      '1': 'Card present'
    },
    cardDataInputMode: {
      '0': 'Unspecified',
      '1': 'Manual, no terminal',
      '2': 'Magnetic stripe read',
      '3': 'Bar code',
      '4': 'OCR',
      '5': 'Integrate circuit card (ICC)',
      '6': 'Key entered',
      '7': 'Contactless ICC',
      '8': 'Contactless magnetic stripe'
    },
    cardholderAuthMethod: {
      '0': 'Not authenticated',
      '1': 'PIN',
      '2': 'Electronic signature analysis',
      '3': 'Biometrics',
      '4': 'Biographic',
      '5': 'Manual signature verification',
      '6': 'Other manual verification'
    },
    cardholderAuthEntity: {
      '0': 'Not authenticated',
      '1': 'Integrated circuit card',
      '2': 'Terminal',
      '3': 'Authorising agent',
      '4': 'Merchant',
      '5': 'Other'
    },
    cardDataOutput: {
      '0': 'Unknown',
      '1': 'None',
      '2': 'Magnetic stripe write',
      '3': 'Integrate circuit card (ICC)'
    },
    terminalOutput: {
      '0': 'Unknown',
      '1': 'None',
      '2': 'Printing',
      '3': 'Display',
      '4': 'Printing and display'
    },
    pinCapture: {
      '0': 'No PIN capture capability',
      '1': 'Device PIN capture capability unknown',
      '4': 'Four characters',
      '5': 'Five characters',
      '6': 'Six characters',
      '7': 'Seven characters',
      '8': 'Eight characters',
      '9': 'Nine characters',
      'A': 'Ten characters',
      'B': 'Eleven characters',
      'C': 'Twelve characters'
    },
    terminalOperator: {
      '0': 'Customer operated',
      '1': 'Card acceptor operated',
      '2': 'Administrative'
    },
    terminalType: {
      '00': 'Administrative terminal',
      '01': 'POS terminal',
      '02': 'ATM',
      '03': 'Home terminal',
      '04': 'Electronic cash register (ECR)',
      '05': 'Dial terminal',
      '06': 'Travellers check machine',
      '07': 'Fuel machine',
      '08': 'Scrip machine',
      '09': 'Coupon machine',
      '10': 'Ticket machine',
      '11': 'Point-of-Banking terminal',
      '12': 'Teller',
      '13': 'Franchise teller',
      '14': 'Personal banking',
      '15': 'Public utility',
      '16': 'Vending',
      '17': 'Self-service',
      '18': 'Authorization',
      '19': 'Payment',
      '20': 'VRU',
      '21': 'Smart phone',
      '22': 'Interactive television',
      '23': 'Personal digital assistant',
      '24': 'Screen phone',
      '90': 'E-commerce - No encryption; no authentication',
      '91': 'E-commerce - SET/3D-Secure encryption; cardholder certificate not used (non-authenticated)',
      '92': 'E-commerce - SET/3D-Secure encryption; cardholder certificate used (authenticated)',
      '93': 'E-commerce - SET encryption, chip cryptogram used; cardholder certificate not used',
      '94': 'E-commerce - SET encryption, chip cryptogram used; cardholder certificate used',
      '95': 'Channel encryption (SSL); cardholder certificate not used (non-authenticated)',
      '96': 'E-commerce - Channel encryption (SSL); chip cryptogram used, cardholder certificate not used'
    }
  };

  const parsedData = {
    'Pos 1 ': `(${cardData[0]}) ${definitions.cardDataInputCapability[cardData[0]]}`,
    'Pos 2 ': `(${cardData[1]}) ${definitions.cardholderAuth[cardData[1]]}`,
    'Pos 3 ': `(${cardData[2]}) ${definitions.cardCapture[cardData[2]]}`,
    'Pos 4 ': `(${cardData[3]}) ${definitions.operatingEnvironment[cardData[3]]}`,
    'Pos 5 ': `(${cardData[4]}) ${definitions.cardholderPresent[cardData[4]]}`,
    'Pos 6 ': `(${cardData[5]}) ${definitions.cardPresent[cardData[5]]}`,
    'Pos 7 ': `(${cardData[6]}) ${definitions.cardDataInputMode[cardData[6]]}`,
    'Pos 8 ': `(${cardData[7]}) ${definitions.cardholderAuthMethod[cardData[7]]}`,
    'Pos 9 ': `(${cardData[8]}) ${definitions.cardholderAuthEntity[cardData[8]]}`,
    'Pos 10': `(${cardData[9]}) ${definitions.cardDataOutput[cardData[9]]}`,
    'Pos 11': `(${cardData[10]}) ${definitions.terminalOutput[cardData[10]]}`,
    'Pos 12': `(${cardData[11]}) ${definitions.pinCapture[cardData[11]]}`,
    'Pos 13': `(${cardData[12]}) ${definitions.terminalOperator[cardData[12]]}`,
    'Pos 14-15': `(${cardData.substring(13, 15)}) ${definitions.terminalType[cardData.substring(13, 15)]}`
  };

  return parsedData;
}

// POS Data Definitions
const posDataDefinitions = {
  '(Pos 1) The card data input capability  of the terminal': {
    '0': 'Unknown',
    '1': 'Manual, no terminal',
    '2': 'Magnetic stripe read',
    '3': 'Bar code',
    '4': 'OCR',
    '5': 'Integrate circuit card (ICC)',
    '6': 'Key entered',
    'A': 'Contactless ICC',
    'B': 'Contactless magnetic stripe'
  },
  '(Pos 2) The cardholder authentication capability of the terminal': {
    '0': 'No electronic authentication',
    '1': 'PIN',
    '2': 'Electronic signature analysis',
    '3': 'Biometrics',
    '4': 'Biographic',
    '5': 'Electronic authentication inoperative',
    '6': 'Other'
  },
  '(Pos 3) The card capture capability of the terminal': {
    '0': 'None',
    '1': 'Capture'
  },
  '(Pos 4) The operating environment of the terminal': {
    '0': 'No terminal used',
    '1': 'On premises of card acceptor, attended',
    '2': 'On premises of card acceptor, unattended',
    '3': 'Off premises of card acceptor, attended',
    '4': 'Off premises of card acceptor, unattended',
    '5': 'On premises of cardholder, attended'
  },
  '(Pos 5) Indicates whether the cardholder is present': {
    '0': 'Cardholder present',
    '1': 'Cardholder not present, unspecified',
    '2': 'Cardholder not present, mail order',
    '3': 'Cardholder not present, telephone',
    '4': 'Cardholder not present, standing authorisation'
  },
  '(Pos 6) Indicates whether the card is present': {
    '0': 'Card not present',
    '1': 'Card present'
  },
  '(Pos 7) The actual card data input mode of the transaction': {
    '0': 'Unspecified',
    '1': 'Manual, no terminal',
    '2': 'Magnetic stripe read',
    '3': 'Bar code',
    '4': 'OCR',
    '5': 'Integrate circuit card (ICC)',
    '6': 'Key entered',
    '7': 'Contactless ICC',
    '8': 'Contactless magnetic stripe'
  },
  '(Pos 8) The actual cardholder authentication method of the transaction': {
    '0': 'Not authenticated',
    '1': 'PIN',
    '2': 'Electronic signature analysis',
    '3': 'Biometrics',
    '4': 'Biographic',
    '5': 'Manual signature verification',
    '6': 'Other manual verification'
  },
  '(Pos 9) The cardholder authentication entity of the transaction': {
    '0': 'Not authenticated',
    '1': 'Integrated circuit card',
    '2': 'Terminal',
    '3': 'Authorising agent',
    '4': 'Merchant',
    '5': 'Other'
  },
  '(Pos 10) The card data output capability of the terminal': {
    '0': 'Unknown',
    '1': 'None',
    '2': 'Magnetic stripe write',
    '3': 'Integrate circuit card (ICC)'
  },
  '(Pos 11) The terminal output capability of the terminal': {
    '0': 'Unknown',
    '1': 'None',
    '2': 'Printing',
    '3': 'Display',
    '4': 'Printing and display'
  },
  '(Pos 12) The PIN capture capability of the terminal': {
    '0': 'No PIN capture capability',
    '1': 'Device PIN capture capability unknown',
    '4': 'Four characters',
    '5': 'Five characters',
    '6': 'Six characters',
    '7': 'Seven characters',
    '8': 'Eight characters',
    '9': 'Nine characters',
    'A': 'Ten characters',
    'B': 'Eleven characters',
    'C': 'Twelve characters'
  },
  '(Pos 13) Terminal operator': {
    '0': 'Customer operated',
    '1': 'Card acceptor operated',
    '2': 'Administrative'
  },
  '(Pos 14-15) Terminal type': {
    '00': 'Administrative terminal',
    '01': 'POS terminal',
    '02': 'ATM',
    '03': 'Home terminal',
    '04': 'Electronic cash register (ECR)',
    '05': 'Dial terminal',
    '06': 'Travellers check machine',
    '07': 'Fuel machine',
    '08': 'Scrip machine',
    '09': 'Coupon machine',
    '10': 'Ticket machine',
    '11': 'Point-of-Banking terminal',
    '12': 'Teller',
    '13': 'Franchise teller',
    '14': 'Personal banking',
    '15': 'Public utility',
    '16': 'Vending',
    '17': 'Self-service',
    '18': 'Authorization',
    '19': 'Payment',
    '20': 'VRU',
    '21': 'Smart phone',
    '22': 'Interactive television',
    '23': 'Personal digital assistant',
    '24': 'Screen phone',
    '90': 'E-commerce - No encryption; no authentication',
    '91': 'E-commerce - SET/3D-Secure encryption; cardholder certificate not used (non-authenticated)',
    '92': 'E-commerce - SET/3D-Secure encryption; cardholder certificate used (authenticated)',
    '93': 'E-commerce - SET encryption, chip cryptogram used; cardholder certificate not used',
    '94': 'E-commerce - SET encryption, chip cryptogram used; cardholder certificate used',
    '95': 'Channel encryption (SSL); cardholder certificate not used (non-authenticated)',
    '96': 'E-commerce - Channel encryption (SSL); chip cryptogram used, cardholder certificate not used'
  }
};

// Function to display definitions in a modal-like container
function displayDefinitions() {
  const existingContainer = document.getElementById('definitionsContainer');
  const button = document.getElementById('defButton');

  if (existingContainer) {
    existingContainer.remove();
    button.textContent = 'Show Definitions';
  } else {
    const container = document.createElement('div');
    container.id = 'definitionsContainer';
    container.style.position = 'absolute';
    container.style.bottom = '80px';
    container.style.left = '30px';
    container.style.right = '30px';
    container.style.height = '40%';
    container.style.height = container.scrollHeight + '40%';
    container.style.overflowY = 'auto';
    container.style.backgroundColor = '#f9f9f9';
    container.style.border = '1px solid #ccc';
    container.style.padding = '15px';
    container.style.width = 'auto'; // Wider to accommodate 3 columns
    container.style.zIndex = '1000';
    container.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
    container.style.fontFamily = 'monospace';
    container.style.fontSize = '10px';
    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
    container.style.gap = '15px';
    container.style.borderRadius = '5px';


    for (const [title, definitions] of Object.entries(posDataDefinitions)) {
      const section = document.createElement('div');
      section.style.flex = '1 1 calc(33.333% - 10px)';
      section.style.boxSizing = 'border-box';
      section.style.marginBottom = '10px';

      const heading = document.createElement('strong');
      heading.textContent = title;
      section.appendChild(heading);

      const list = document.createElement('ul');
      list.style.margin = '5px 0 0 15px';
      list.style.padding = '0';

      for (const [code, meaning] of Object.entries(definitions)) {
        const item = document.createElement('li');
        item.textContent = `${code}: ${meaning}`;
        list.appendChild(item);
      }

      section.appendChild(list);
      container.appendChild(section);
    }

    document.body.appendChild(container);
    button.textContent = 'Hide Definitions';
  }
}

// Tags List for TLV parsing
var tagsList = {
  _06: "Object Identifier (OID)",
  _41: "Country code and national data",
  _42: "Issuer Identification Number (IIN)",
  _43: "Card service data",
  _44: "Initial access data",
  _45: "Card issuer`s data",
  _46: "Pre-issuing data",
  _47: "Card capabilities",
  _48: "Status information",
  _4D: "Extended header list",
  _4F: "Application Identifier",
  _50: "Application Label",
  _51: "Path",
  _52: "Command to perform",
  _53: "Discretionary data",
  _56: "Track 1 Data",
  _56: "Track 1 Equivalent Data",
  _57: "Track 2 Equivalent Data",
  _58: "Track 3 Equivalent Data",
  _59: "Card expiration date",
  _5A: "Application Primary Account Number (PAN)",
  _5B: "Name of an individual",
  _5C: "Tag list",
  _5D: "Deleted",
  _5D: "Header list",
  _5E: "Proprietary login data",
  _5F20: "Cardholder Name",
  _5F21: "Track 1",
  _5F22: "Track 2",
  _5F23: "Track 3",
  _5F24: "Application Expiration Date",
  _5F25: "Application Effective Date",
  _5F26: "Date, Card Effective",
  _5F27: "Interchange control",
  _5F28: "Issuer Country Code",
  _5F29: "Interchange profile",
  _5F2A: "Transaction Currency Code",
  _5F2B: "Date of birth",
  _5F2C: "Cardholder nationality",
  _5F2D: "Language Preference",
  _5F2E: "Cardholder biometric data",
  _5F2F: "PIN usage policy",
  _5F30: "Service Code",
  _5F32: "Transaction counter",
  _5F33: "Date, Transaction",
  _5F34: "Application PAN Sequence Number (APSN)",
  _5F35: "Sex (ISO 5218)",
  _5F36: "Transaction Currency Exponent",
  _5F37: "Static internal authentication (one-step)",
  _5F38: "Static internal authentication - first associated data",
  _5F39: "Static internal authentication - second associated data",
  _5F3A: "Dynamic internal authentication",
  _5F3B: "Dynamic external authentication",
  _5F3C: "Transaction Reference Currency Code",
  _5F3C: "Dynamic mutual authentication",
  _5F3D: "Transaction Reference Currency Exponent",
  _5F40: "Cardholder portrait image",
  _5F41: "Element list",
  _5F42: "Address",
  _5F43: "Cardholder handwritten signature image",
  _5F44: "Application image",
  _5F45: "Display message",
  _5F46: "Timer",
  _5F47: "Message reference",
  _5F48: "Cardholder private key",
  _5F49: "Cardholder public key",
  _5F4A: "Public key of certification authority",
  _5F4B: "Deprecated (see note 2 below)",
  _5F4C: "Certificate holder authorization",
  _5F4D: "Integrated circuit manufacturer identifier",
  _5F4E: "Certificate content",
  _5F50: "Issuer Uniform resource locator (URL)",
  _5F53: "International Bank Account Number (IBAN)",
  _5F54: "Bank Identifier Code (BIC)",
  _5F55: "Issuer Country Code (alpha2 format)",
  _5F56: "Issuer Country Code (alpha3 format)",
  _5F57: "Account Type",
  _60: "Template, Dynamic Authentication",
  _6080: "Commitment ",
  _6081: "Challenge",
  _6082: "Response",
  _6083: "Committed challenge",
  _6084: "Authentication code",
  _6085: "Exponential",
  _60A0: "Template, Identification data",
  _61: "Application Template",
  _61: "Directory Entry",
  _62: "File Control Parameters (FCP) Template",
  _6280: "Number of data bytes in the file, excluding structural information",
  _6281: "Number of data bytes in the file, including structural information if any",
  _6282: "File descriptor byte",
  _6283: "File identifier",
  _6284: "DF name",
  _6285: "Proprietary information, primitive encoding (i.e., not coded in BER-TLV)",
  _6286: "Security attribute in proprietary format",
  _6287: "Identifier of an EF containing an extension of the file control information",
  _6288: "Short EF identifier",
  _628A: "Life cycle status byte (LCS)",
  _628B: "Security attribute referencing the expanded format",
  _628C: "Security attribute in compact format",
  _628D: "Identifier of an EF containing security environment templates",
  _62A0: "Template, Security attribute for data objects",
  _62A1: "Template, Security attribute for physical interfaces",
  _62A2: "One or more pairs of data objects, short EF identifier (tag 88) - absolute or relative path (tag 51)",
  _62A5: "Proprietary information, constructed encoding",
  _62AB: "Security attribute in expanded format",
  _62AC: "Identifier of a cryptographic mechanism",
  _63: "Wrapper",
  _64: "Template, File Management Data (FMD)",
  _65: "Cardholder related data",
  _66: "Template, Card data",
  _67: "Template, Authentication data",
  _68: "Special user requirements",
  _6A: "Template, Login",
  _6A80: "Qualifier",
  _6A81: "Telephone Number",
  _6A82: "Text",
  _6A83: "Delay indicators, for detecting an end of message",
  _6A84: "Delay indicators, for detecting an absence of response",
  _6B: "Template, Qualified name",
  _6B06: "Qualified name",
  _6B80: "Name",
  _6BA0: "Name",
  _6C: "Template, Cardholder image",
  _6D: "Template, Application image",
  _6E: "Application related data",
  _6F: "File Control Information (FCI) Template",
  _6FA5: "Template, FCI A5",
  _70: "READ RECORD Response Message Template",
  _71: "Issuer Script Template",
  _7186: "Issuer Script Command",
  _719F18: "Issuer Script Identifier",
  _72: "Issuer Script Template 2",
  _73: "Directory Discretionary Template",
  _77: "Response Message Template Format 2",
  _78: "Compatible Tag Allocation Authority",
  _79: "Coexistent Tag Allocation Authority",
  _7A: "Template, Security Support (SS)",
  _7A80: "Card session counter",
  _7A81: "Session identifier",
  _7A82: "File selection counter",
  _7A83: "File selection counter",
  _7A84: "File selection counter",
  _7A85: "File selection counter",
  _7A86: "File selection counter",
  _7A87: "File selection counter",
  _7A88: "File selection counter",
  _7A89: "File selection counter",
  _7A8A: "File selection counter",
  _7A8B: "File selection counter",
  _7A8C: "File selection counter",
  _7A8D: "File selection counter",
  _7A8E: "File selection counter",
  _7A93: "Digital signature counter",
  _7A9F2X: "Internal progression value",
  _7A9F3Y: "External progression value",
  _7B: "Template, Security Environment",
  _7B80: "SEID byte, mandatory",
  _7B8A: "LCS byte, optional",
  _7BAC: "Cryptographic mechanism identifier template, optional",
  _7BA4: "Control reference template (CRT)",
  _7BAA: "Control reference template (CRT)",
  _7BB4: "Control reference template (CRT)",
  _7BB6: "Control reference template (CRT)",
  _7BB8: "Control reference template (CRT)",
  _7D: "Template, Secure Messaging (SM)",
  _7D80: "Plain value not coded in BER-TLV",
  _7D81: "Plain value not coded in BER-TLV",
  _7D82: "Cryptogram",
  _7D83: "Cryptogram",
  _7D84: "Cryptogram",
  _7D85: "Cryptogram",
  _7D86: "Padding-content indicator byte followed by cryptogram",
  _7D87: "Padding-content indicator byte followed by cryptogram",
  _7D8E: "Cryptographic checksum (at least four bytes)",
  _7D90: "Hash-code",
  _7D91: "Hash-code",
  _7D92: "Certificate (not BER-TLV coded data)",
  _7D93: "Certificate (not BER-TLV coded data)",
  _7D94: "Security environment identifier",
  _7D95: "Security environment identifier",
  _7D96: "Number Le in the unsecured command APDU",
  _7D97: "Number Le in the unsecured command APDU",
  _7D99: "Processing status of the secured response APDU",
  _7D9A: "Input data element for the computation of a digital signature",
  _7D9B: "Input data element for the computation of a digital signature",
  _7D9C: "Public key",
  _7D9D: "Public key",
  _7D9E: "Digital signature",
  _7DA0: "Input template for the computation of a hash-code",
  _7DA1: "Input template for the computation of a hash-code",
  _7DA2: "Input template for the verification of a cryptographic checksum",
  _7DA4: "Control reference template for authentication (AT)",
  _7DA5: "Control reference template for authentication (AT)",
  _7DA8: "Input template for the verification of a digital signature",
  _7DAA: "Template, Control reference for hash-code (HT)",
  _7DAB: "Template, Control reference for hash-code (HT)",
  _7DAC: "Input template for the computation of a digital signature",
  _7DAD: "Input template for the computation of a digital signature",
  _7DAE: "Input template for the computation of a certificate",
  _7DAF: "Input template for the computation of a certificate",
  _7DB0: "Plain value coded in BER-TLV and including secure messaging data objects",
  _7DB1: "Plain value coded in BER-TLV and including secure messaging data objects",
  _7DB2: "Plain value coded in BER-TLV, but not including secure messaging data objects",
  _7DB3: "Plain value coded in BER-TLV, but not including secure messaging data objects",
  _7DB4: "Control reference template for cryptographic checksum (CCT)",
  _7DB5: "Control reference template for cryptographic checksum (CCT)",
  _7DB6: "Control reference template for digital signature (DST)",
  _7DB7: "Control reference template for digital signature (DST)",
  _7DB8: "Control reference template for confidentiality (CT)",
  _7DB9: "Control reference template for confidentiality (CT)",
  _7DBA: "Response descriptor template",
  _7DBB: "Response descriptor template",
  _7DBC: "Input template for the computation of a digital signature",
  _7DBD: "Input template for the computation of a digital signature",
  _7DBE: "Input template for the verification of a certificate (the template is certified)",
  _7E: "Template, Nesting Interindustry data objects",
  _7F20: "Display control template",
  _7F21: "Cardholder certificate",
  _7F2E: "Biometric data template",
  _7F49: "Template, Cardholder public key",
  _7F4980: "Algorithm reference",
  _7F4981: "RSA Modulus",
  _7F4982: "RSA Public exponent",
  _7F4983: "DSA Basis",
  _7F4984: "DSA Public key",
  _7F4985: "ECDSA Order",
  _7F4986: "ECDSA Public key",
  _7F4C: "Template, Certificate Holder Authorization",
  _7F4E: "Certificate Body",
  _7F4E42: "Certificate Authority Reference",
  _7F4E5F20: "Certificate Holder Reference",
  _7F4E5F24: "Expiration Date, Certificate",
  _7F4E5F25: "Effective Date, Certificate",
  _7F4E5F29: "Certificate Profile Identifier",
  _7F4E65: "Certificate Extensions",
  _7F60: "Template, Biometric information",
  _80: "Response Message Template Format 1",
  _81: "Amount, Authorised (Binary)",
  _82: "Application Interchange Profile (AIP)",
  _83: "Command Template",
  _84: "Dedicated File (DF) Name",
  _86: "Issuer Script Command",
  _87: "Application Priority Indicator",
  _88: "Short File Identifier (SFI)",
  _89: "Authorisation Code",
  _8A: "Authorisation Response Code (ARC)",
  _8C: "Card Risk Management Data Object List 1 (CDOL1)",
  _8D: "Card Risk Management Data Object List 2 (CDOL2)",
  _8E: "Cardholder Verification Method (CVM) List",
  _8F: "Certification Authority Public Key Index (PKI)",
  _90: "Issuer Public Key Certificate",
  _91: "Issuer Authentication Data",
  _92: "Issuer Public Key Remainder",
  _93: "Signed Static Application Data (SAD)",
  _94: "Application File Locator (AFL)",
  _95: "Terminal Verification Results (TVR)",
  _97: "Transaction Certificate Data Object List (TDOL)",
  _98: "Transaction Certificate (TC) Hash Value",
  _99: "Transaction Personal Identification Number (PIN) Data",
  _9A: "Transaction Date",
  _9B: "Transaction Status Information (TSI)",
  _9C: "Transaction Type",
  _9D: "Directory Definition File (DDF) Name",
  _9F01: "Acquirer Identifier",
  _9F02: "Amount, Authorised (Numeric)",
  _9F03: "Amount, Other (Numeric)",
  _9F04: "Amount, Other (Binary)",
  _9F05: "Application Discretionary Data",
  _9F06: "Application Identifier (AID), Terminal",
  _9F07: "Application Usage Control (AUC)",
  _9F08: "Application Version Number, Card",
  _9F09: "Application Version Number, Terminal",
  _9F0B: "Cardholder Name - Extended",
  _9F0D: "Issuer Action Code - Default",
  _9F0E: "Issuer Action Code - Denial",
  _9F0F: "Issuer Action Code - Online",
  _9F10: "Issuer Application Data (IAD)",
  _9F11: "Issuer Code Table Index",
  _9F12: "Application Preferred Name",
  _9F13: "Last Online Application Transaction Counter (ATC) Register",
  _9F14: "Lower Consecutive Offline Limit (LCOL)",
  _9F15: "Merchant Category Code (MCC)",
  _9F16: "Merchant Identifier",
  _9F17: "Personal Identification Number (PIN) Try Counter",
  _9F18: "Issuer Script Identifier",
  _9F19: "Deleted (see 9F49)",
  _9F1A: "Terminal Country Code",
  _9F1B: "Terminal Floor Limit",
  _9F1C: "Terminal Identification",
  _9F1D: "Terminal Risk Management Data",
  _9F1E: "Interface Device (IFD) Serial Number",
  _9F1F: "Track 1 Discretionary Data",
  _9F20: "Track 2 Discretionary Data",
  _9F21: "Transaction Time",
  _9F22: "Certification Authority Public Key Index (PKI)",
  _9F22: "Public Key Index, Certification Authority, Terminal",
  _9F23: "Upper Consecutive Offline Limit (UCOL)",
  _9F24: "Payment Account Reference (PAR) generated or linked directly to the provision request in the token vault",
  _9F26: "Application Cryptogram (AC)",
  _9F27: "Cryptogram Information Data (CID)",
  _9F29: "Extended Selection",
  _9F2A: "Kernel Identifier",
  _9F2D: "Integrated Circuit Card (ICC) PIN Encipherment Public Key Certificate",
  _9F2E: "Integrated Circuit Card (ICC) PIN Encipherment Public Key Exponent",
  _9F2F: "Integrated Circuit Card (ICC) PIN Encipherment Public Key Remainder",
  _9F32: "Issuer Public Key Exponent",
  _9F33: "Terminal Capabilities",
  _9F34: "CVM Results",
  _9F35: "Terminal Type",
  _9F36: "Application Transaction Counter (ATC)",
  _9F37: "Unpredictable Number (UN)",
  _9F38: "Processing Options Data Object List (PDOL)",
  _9F39: "Point-of-Service (POS) Entry Mode",
  _9F3A: "Amount, Reference Currency (Binary)",
  _9F3B: "Currency Code, Application Reference",
  _9F3C: "Currency Code, Transaction Reference",
  _9F3D: "Currency Exponent, Transaction Reference",
  _9F40: "Additional Terminal Capabilities (ATC)",
  _9F41: "Transaction Sequence Counter",
  _9F42: "Currency Code, Application",
  _9F43: "Currency Exponent, Application Reference",
  _9F44: "Currency Exponent, Application",
  _9F45: "Data Authentication Code",
  _9F46: "Integrated Circuit Card (ICC) Public Key Certificate",
  _9F47: "Integrated Circuit Card (ICC) Public Key Exponent",
  _9F48: "Integrated Circuit Card (ICC) Public Key Remainder",
  _9F49: "Dynamic Data Authentication Data Object List (DDOL)",
  _9F4A: "Static Data Authentication Tag List (SDA)",
  _9F4B: "Signed Dynamic Application Data (SDAD)",
  _9F4C: "ICC Dynamic Number",
  _9F4D: "Log Entry",
  _9F4E: "Merchant Name and Location",
  _9F4F: "Log Format",
  _9F50: "Offline Accumulator Balance",
  _9F51: "Application Currency Code",
  _9F52: "Application Default Action (ADA)",
  _9F53: "Consecutive Transaction Counter International Limit (CTCIL)",
  _9F53: "Transaction Category Code",
  _9F54: "Cumulative Total Transaction Amount Limit (CTTAL)",
  _9F54: "DS ODS Card",
  _9F55: "Issuer Authentication Flags",
  _9F56: "Issuer Authentication Indicator",
  _9F57: "Issuer Country Code",
  _9F58: "Consecutive Transaction Counter Limit (CTCL)",
  _9F59: "Consecutive Transaction Counter Upper Limit (CTCUL)",
  _9F5A: "Application Program Identifier (Program ID)",
  _9F5B: "Issuer Script Results",
  _9F5C: "Cumulative Total Transaction Amount Upper Limit (CTTAUL)",
  _9F5D: "Available Offline Spending Amount (AOSA)",
  _9F5E: "Consecutive Transaction International Upper Limit (CTIUL)",
  _9F5F: "Offline Balance",
  _9F60: "CVC3 (Track1)",
  _9F61: "CVC3 (Track2)",
  _9F62: "PCVC3 (Track1)",
  _9F62: "Encrypted PIN",
  _9F63: "Offline Counter Initial Value",
  _9F64: "NATC (Track1)",
  _9F65: "PCVC3 (Track2)",
  _9F66: "Terminal Transaction Qualifiers (TTQ)",
  _9F67: "MSD Offset",
  _9F68: "Card Additional Processes",
  _9F69: "Card Authentication Related Data",
  _9F6A: "Unpredictable Number (Numeric)",
  _9F6B: "Card CVM Limit",
  _9F6C: "Card Transaction Qualifiers (CTQ)",
  _9F6D: "Mag-stripe Application Version Number",
  _9F6E: "Form Factor Indicator (FFI)",
  _9F6F: "DS Slot Management Control",
  _9F70: "Card Interface Capabilities",
  _9F71: "Mobile CVM Results",
  _9F72: "Consecutive Transaction Limit",
  _9F73: "Currency Conversion Parameters",
  _9F74: "VLP Issuer Authorisation Code",
  _9F75: "Cumulative Total Transaction Amount Limit",
  _9F76: "Secondary Application Currency Code",
  _9F77: "VLP Funds Limit",
  _9F78: "VLP Single Transaction Limit",
  _9F79: "VLP Available Funds",
  _9F7A: "VLP Terminal Support Indicator",
  _9F7B: "VLP Terminal Transaction Limit",
  _9F7C: "Customer Exclusive Data (CED)",
  _9F7D: "VISA Applet Data",
  _9F7E: "Mobile Support Indicator",
  _9F7F: "Card Production Life Cycle (CPLC) Data"
};

// Function to parse TLV data from a hex string
// This function assumes the input is a valid hex string representing TLV data
function parseTLV(hex) {
  let i = 0;
  let table = '<table style="width: 100%; border-collapse: collapse;" border="1">';
  table += '<tr><th class="tag-column-fixed">Tag</th><th class="field-column-fixed">Length (Byte)</th><th>Value</th></tr>';

  // --- Scheme detection using 4F or 84 ---
  let scheme = "default"; 
  let aidValue = null;
  let hexCopy = hex;
  let j = 0;
  while (j < hexCopy.length) {
    let tag = hexCopy.substr(j, 2);
    j += 2;
    if ((parseInt(tag, 16) & 0x1F) === 0x1F) {
      tag += hexCopy.substr(j, 2);
      j += 2;
    }
    let lengthByte = parseInt(hexCopy.substr(j, 2), 16);
    j += 2;
    let length = lengthByte;
    if (lengthByte & 0x80) {
      const numBytes = lengthByte & 0x7F;
      length = parseInt(hexCopy.substr(j, numBytes * 2), 16);
      j += numBytes * 2;
    }
    const value = hexCopy.substr(j, length * 2);
    j += length * 2;
    if (tag.toUpperCase() === "4F" || tag.toUpperCase() === "84") {
      aidValue = value.toUpperCase();
      if (aidValue.startsWith("A000000004")) scheme = "paypass";
      else if (aidValue.startsWith("A000000025")) scheme = "expresspay";
      else if (aidValue.startsWith("A000000003")) scheme = "visa";
      break;
    }
  }

  i = 0; // Reset for main TLV parsing
  while (i < hex.length) {
    // Parse Tag
    let tag = hex.substr(i, 2);
    i += 2;
    if ((parseInt(tag, 16) & 0x1F) === 0x1F) {
      tag += hex.substr(i, 2);
      i += 2;
    }

    // Lookup tag name and format display
    const tagKey = "_" + tag.toUpperCase();
    const tagName = tagsList[tagKey];
    const tagDisplay = tagName ? `${tag}<br><small><i>${tagName}</i></small>` : tag;

    // Parse Length
    let lengthByte = parseInt(hex.substr(i, 2), 16);
    let lengthDisplay = hex.substr(i, 2);
    i += 2;

    let length = lengthByte;
    if (lengthByte & 0x80) {
      const numBytes = lengthByte & 0x7F;
      length = parseInt(hex.substr(i, numBytes * 2), 16);
      lengthDisplay = hex.substr(i, numBytes * 2);
      i += numBytes * 2;
    }

    // Parse Value
    const value = hex.substr(i, length * 2);
    i += length * 2;

    let valueDisplay = value;

    // Tooltip for 9F07 (Application Usage Control)
    if (tag.toUpperCase() === "9F07" && value.length === 4) {
      const byte1 = value.slice(0, 2);
      const byte2 = value.slice(2, 4);
      const bin1 = parseInt(byte1, 16).toString(2).padStart(8, '0');
      const bin2 = parseInt(byte2, 16).toString(2).padStart(8, '0');

      // Bit labels for byte 1 (first byte)
      const aucLabels1 = [
        "Bit 8: Valid for domestic cash transactions",
        "Bit 7: Valid for international cash transactions",
        "Bit 6: Valid for domestic goods",
        "Bit 5: Valid for international goods",
        "Bit 4: Valid for domestic services",
        "Bit 3: Valid for international services",
        "Bit 2: Valid at ATMs",
        "Bit 1: Valid at terminals other than ATMs"
      ];

      // Bit labels for byte 2 (second byte)
      const aucLabels2 = [
        "Bit 8: Domestic cashback allowed",
        "Bit 7: International cashback allowed",
        "Bit 6: RFU",
        "Bit 5: RFU",
        "Bit 4: RFU",
        "Bit 3: RFU",
        "Bit 2: RFU",
        "Bit 1: RFU"
      ];

      let tooltipHtml = `<div style="font-family:monospace; font-size:12px;"> `;

      tooltipHtml += `<strong>Byte 1 (${byte1}):</strong>
          <div style="height: 8px;"></div>
           <div style="display: grid; grid-template-columns: auto 1fr; gap: 6px; margin-bottom: 8px;">`
      for (let k = 0; k < bin1.length; k++) {
        tooltipHtml += `
        <input type="checkbox" disabled ${bin1[k] === "1" ? "checked" : ""} style="accent-color: black;>
        <label style="color: black; font-size:12px;>${aucLabels1[k]}</label>`;
      }
      tooltipHtml += `</div>`;

      tooltipHtml += `<strong>Byte 2 (${byte2}):</strong>
          <div style="height: 8px;"></div>
          <div style="display: grid; grid-template-columns: auto 1fr; gap: 6px;">`;
      for (let k = 0; k < bin2.length; k++) {
        tooltipHtml += `
        <input type="checkbox" disabled ${bin2[k] === "1" ? "checked" : ""} style="accent-color: black;>
        <label style="color: black; font-size:12px;>${aucLabels2[k]}</label>`;
      }
      tooltipHtml += `</div></div>`;

      valueDisplay = `<span class="cvm-tooltip" style="cursor:pointer;position:relative;" 
      onmouseover="showCVMTooltip(this, event)" 
      onmouseout="hideCVMTooltip(this)">
      ${value}
      <span class="cvm-tooltip-box" style="display:none;position:fixed;z-index:9999;background:#fff;border:1px solid #ccc;padding:8px;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.15);white-space:nowrap;">${tooltipHtml}</span>
      </span>`;
    }

    // Tooltip for 9F34 (CVM Results)
    if (tag.toUpperCase() === "9F34" && value.length === 6) {
      const byte1 = value.slice(0, 2);
      const byte2 = value.slice(2, 4);
      const byte3 = value.slice(4, 6);
      const b1 = parseByte1(byte1);
      const b2 = parseByte2(byte2);
      const b3 = parseByte3(byte3);
      const tooltipHtml = `
        <div style="font-family:monospace;">
          <div><strong style="display:inline-block;width:140px;">CVM</strong> ${b1.method}</div>
          <div><strong style="display:inline-block;width:140px;">If unsuccessful</strong> ${b1.handling}</div>
          <div><strong style="display:inline-block;width:140px;">Condition</strong> ${b2}</div>
          <div><strong style="display:inline-block;width:140px;">Result of CVM</strong> ${b3}</div>
        </div>
      `;
      valueDisplay = `<span class="cvm-tooltip" style="cursor:pointer;position:relative;" 
      onmouseover="showCVMTooltip(this, event)" 
      onmouseout="hideCVMTooltip(this)">
      ${value}
      <span class="cvm-tooltip-box" style="display:none;position:fixed;z-index:9999;background:#fff;border:1px solid #ccc;padding:8px;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.15);white-space:nowrap;">${tooltipHtml}</span>
      </span>`;
    }

    // Tooltip for 9F35 (Terminal Type) - use fixed TerminalType mapping only
    if (tag.toUpperCase() === "9F35" && value.length === 2) {
      const byte = value.slice(0, 2).toUpperCase();
      const terminalTypeMap = {
        '11': 'Attended - Online only (Operational control: Financial Institution)',
        '21': 'Attended - Online only (Operational control: Merchant)',
        '12': 'Attended - Offline with online capability (Operational control: Financial Institution)',
        '22': 'Attended - Offline with online capability (Operational control: Merchant)',
        '13': 'Attended - Offline only (Operational control: Financial Institution)',
        '23': 'Attended - Offline only (Operational control: Merchant)',
        '14': 'Unattended - Online only (Operational control: Financial Institution)',
        '24': 'Unattended - Online only (Operational control: Merchant)',
        '34': 'Unattended - Online only (operational control: Cardholder)',
        '15': 'Unattended - Offline with online capability (Operational control: Financial Institution)',
        '25': 'Unattended - Offline with online capability (Operational control: Merchant)',
        '35': 'Unattended - Offline with online capability (operational control: Cardholder)',
        '16': 'Unattended - Offline only (Operational control: Financial Institution)',
        '26': 'Unattended - Offline only (Operational control: Merchant)',
        '36': 'Unattended - Offline only (operational control: Cardholder)'
      };

      const description = terminalTypeMap[byte] ? terminalTypeMap[byte] : "Unknown or RFU";

      const tooltipHtml = `<div style="font-family:monospace; font-size:12px; color:black;">
        <strong>Terminal Type</strong><br>
        (${byte}) ${description}
      </div>`;

      valueDisplay = `<span class="cvm-tooltip" style="cursor:pointer;position:relative;"
        onmouseover="showCVMTooltip(this, event)"
        onmouseout="hideCVMTooltip(this)">
        ${value}
        <span class="cvm-tooltip-box" style="display:none;position:fixed;z-index:9999;background:#fff;border:1px solid #ccc;padding:8px;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.15);white-space:nowrap;color:black;">${tooltipHtml}</span>
      </span>`;
    }

    // Tooltip for 9B (Transaction Status Information)
    if (tag.toUpperCase() === "9B" && value.length === 4) {
      const byte1 = value.slice(0, 2);
      const byte2 = value.slice(2, 4);
      const bin1 = parseInt(byte1, 16).toString(2).padStart(8, '0');
      const bin2 = parseInt(byte2, 16).toString(2).padStart(8, '0');

      // Bit labels for byte 1
      const tsiLabels1 = [
        "Bit 8: Offline data authentication was performed",
        "Bit 7: Cardholder verification was performed",
        "Bit 6: Card risk management was performed",
        "Bit 5: Issuer authentication was performed",
        "Bit 4: Terminal risk management was performed",
        "Bit 3: Script processing was performed",
        "Bit 2: RFU",
        "Bit 1: RFU"
      ];

      // Bit labels for byte 2 (usually all RFU)
      const tsiLabels2 = [
        "Bit 8: RFU",
        "Bit 7: RFU",
        "Bit 6: RFU",
        "Bit 5: RFU",
        "Bit 4: RFU",
        "Bit 3: RFU",
        "Bit 2: RFU",
        "Bit 1: RFU"
      ];

      let tooltipHtml = `<div style="font-family:monospace; font-size:12px;">`;

      tooltipHtml += `<strong>Byte 1 (${byte1}):</strong>
           <div style="height: 8px;"></div>
           <div style="display: grid; grid-template-columns: auto 1fr; gap: 6px; margin-bottom: 8px;">`;
      for (let k = 0; k < bin1.length; k++) {
        tooltipHtml += `
         <input type="checkbox" disabled ${bin1[k] === "1" ? "checked" : ""} style="accent-color: black;">
        <label style="color: black; font-size:12px;">${tsiLabels1[k]}</label>`;
      }
      tooltipHtml += `</div>`;

      tooltipHtml += `<strong>Byte 2 (${byte2}):</strong>
      <div style="height: 8px;"></div>
      <div style="display: grid; grid-template-columns: auto 1fr; gap: 6px;">`;
      for (let k = 0; k < bin2.length; k++) {
        tooltipHtml += `
        <input type="checkbox" disabled ${bin2[k] === "1" ? "checked" : ""} style="accent-color: black;">
       <label style="color: black; font-size:12px;">${tsiLabels2[k]}</label>`;
      }
      tooltipHtml += `</div></div>`;

      valueDisplay = `<span class="cvm-tooltip" style="cursor:pointer;position:relative;" 
      onmouseover="showCVMTooltip(this, event)" 
      onmouseout="hideCVMTooltip(this)">
      ${value}
      <span class="cvm-tooltip-box" style="display:none;position:fixed;z-index:9999;background:#fff;border:1px solid #ccc;padding:8px;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.15);white-space:nowrap;">${tooltipHtml}</span>
      </span>`;
    }

    // Tooltip for 95 (Terminal Verification Results, TVR)
    if (tag.toUpperCase() === "95" && value.length === 10) {
      const bytes = [
        value.slice(0, 2),
        value.slice(2, 4),
        value.slice(4, 6),
        value.slice(6, 8),
        value.slice(8, 10)
      ];
      const bins = bytes.map(b => parseInt(b, 16).toString(2).padStart(8, '0'));

      // Bit labels for each byte (EMV Book 3)
      const tvrLabels = [
        [
          "Bit 8: Offline data authentication was not performed",
          "Bit 7: SDA failed",
          "Bit 6: ICC data missing",
          "Bit 5: Card appears on terminal exception file",
          "Bit 4: DDA failed",
          "Bit 3: CDA failed",
          "Bit 2: SDA Selected",
          "Bit 1: RFU"
        ],
        [
          "Bit 8: ICC and terminal have different application versions",
          "Bit 7: Expired application",
          "Bit 6: Application not yet effective",
          "Bit 5: Requested service not allowed for card product",
          "Bit 4: New card",
          "Bit 3: RFU",
          "Bit 2: RFU",
          "Bit 1: RFU"
        ],
        [
          "Bit 8: Cardholder verification was not successful",
          "Bit 7: Unrecognised CVM",
          "Bit 6: PIN try limit exceeded",
          "Bit 5: PIN entry required and PIN pad not present or not working",
          "Bit 4: PIN entry required, PIN pad present, but PIN was not entered",
          "Bit 3: Online PIN entered",
          "Bit 2: RFU",
          "Bit 1: RFU"
        ],
        [
          "Bit 8: Transaction exceeds floor limit",
          "Bit 7: Lower consecutive offline limit exceeded",
          "Bit 6: Upper consecutive offline limit exceeded",
          "Bit 5: Transaction selected randomly for online processing",
          "Bit 4: Merchant forced transaction online",
          "Bit 3: RFU",
          "Bit 2: RFU",
          "Bit 1: RFU"
        ],
        // Byte 5: PayPass-specific if scheme is paypass
        scheme === "paypass"
          ? [
            "Bit 8: Default TDOL was used",
            "Bit 7: Issuer authentication failed",
            "Bit 6: Script processing failed before final GENERATE AC",
            "Bit 5: Script processing failed after final GENERATE AC",
            "Bit 4: Relay resistance threshold exceeded",
            "Bit 3: Relay resistance time limits exceeded",
            "Bit 2: Relay Resistance Protocol flags meaning:",
            "Bit 1: See flags below"
          ]
          : [
            "Bit 8: Default TDOL used",
            "Bit 7: Issuer authentication failed",
            "Bit 6: Script processing failed before final GENERATE AC",
            "Bit 5: Script processing failed after final GENERATE AC",
            "Bit 4: RFU",
            "Bit 3: RFU",
            "Bit 2: RFU",
            "Bit 1: RFU"
          ]
      ];

      // --- Always show RRP flags meaning for PayPass Byte 5 ---
      let rrpFlagsHtml = "";
      if (scheme === "paypass") {
        // Bits 3-1 of Byte 5
        const rrpBits = bins[4].slice(5, 8); // bits 3-1

        let rrpMeaning = "";
        switch (rrpBits) {
          case "000": rrpMeaning = "RRP not supported"; break;
          case "001": rrpMeaning = "RRP supported but not performed"; break;
          case "010": rrpMeaning = "RRP performed successfully"; break;
          case "011": rrpMeaning = "RRP failed"; break;
          default: rrpMeaning = "Reserved for future or proprietary use"; break;
        }

        rrpFlagsHtml = `
          <div style="margin-top:8px;">
            <strong>Relay Resistance Protocol flags (Byte 5 bits 3-1):</strong> ${rrpBits}
            <br><strong>Meaning:</strong> ${rrpMeaning}
          </div>
        `;
      }

      let tooltipHtml = `<div style="font-family:monospace;">`;
      for (let i = 0; i < 5; i++) {
        tooltipHtml += `<strong>Byte ${i + 1} (${bytes[i]}):</strong><br>`;
        for (let k = 0; k < 8; k++) {
          if (bins[i][k] === "1") {
            tooltipHtml += `<div>${tvrLabels[i][k]}</div>`;
          }
        }
        tooltipHtml += `<br>`;
      }
      // Always show RRP flags meaning for PayPass
      if (rrpFlagsHtml) {
        tooltipHtml += rrpFlagsHtml;
      }
      tooltipHtml += `</div>`;

      valueDisplay = `<span class="cvm-tooltip" style="cursor:pointer;position:relative;" 
      onmouseover="showCVMTooltip(this, event)" 
      onmouseout="hideCVMTooltip(this)">
      ${value}
      <span class="cvm-tooltip-box" style="display:none;position:fixed;z-index:9999;background:#fff;border:1px solid #ccc;padding:8px;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.15);white-space:nowrap;">${tooltipHtml}</span>
      </span>`;
    }

    // Tooltip for 9F53 (Transaction Category Code)
    if (tag.toUpperCase() === "9F53" && value.length === 6) {
      const byte1 = value.slice(0, 2);
      const byte2 = value.slice(2, 4);
      const byte3 = value.slice(4, 6);
      const bin1 = parseInt(byte1, 16).toString(2).padStart(8, '0');
      const bin2 = parseInt(byte2, 16).toString(2).padStart(8, '0');
      const bin3 = parseInt(byte3, 16).toString(2).padStart(8, '0');

      const labels1 = [
        "Bit 7: CVM required by reader / N/A",
        "Bit 6: Signature supported (9F33: B3b5)",
        "Bit 5: Online PIN supported (9F33: B2b6)",
        "Bit 4: On-device CVM supported (DF1B: B3b7)",
        "Bit 3: RFU (must always be set to 0)",
        "Bit 2: Reader is a Transit Reader (DF1B: B3b6)",
        "Bit 1: EMV contact chip supported (9F33: B1b5)",
        "Bit 0: (Contact chip) Offline PIN supported (9F33: B2b7 & B2b4)"
      ];
      const labels2 = [
        "Bit 7: Issuer Update supported (DF1B: B3b5)",
        "Bit 6: RFU (must always be set to 0)",
        "Bit 5: RFU (must always be set to 0)",
        "Bit 4: RFU (must always be set to 0)",
        "Bit 3: RFU (must always be set to 0)",
        "Bit 2: RFU (must always be set to 0)",
        "Bit 1: RFU (must always be set to 0)",
        "Bit 0: RFU (must always be set to 0)"
      ];
      const labels3 = [
        "Bit 7: RFU (must always be set to 0)",
        "Bit 6: RFU (must always be set to 0)",
        "Bit 5: RFU (must always be set to 0)",
        "Bit 4: RFU (must always be set to 0)",
        "Bit 3: RFU (must always be set to 0)",
        "Bit 2: RFU (must always be set to 0)",
        "Bit 1: RFU (must always be set to 0)",
        "Bit 0: RFU (must always be set to 0)"
      ];

      let tooltipHtml = `<div style="font-family:monospace;font-size:12px;">`;
      tooltipHtml += `<strong>Byte 1 (${byte1}):</strong><br>`;
      for (let k = 0; k < bin1.length; k++) {
        tooltipHtml += `<div>
          <input type="checkbox" disabled ${bin1[k] === "1" ? "checked" : ""}>
          <label style="color: black; font-size:12px;">${labels1[k]}</label>
        </div>`;
      }
      tooltipHtml += `<br><strong>Byte 2 (${byte2}):</strong><br>`;
      for (let k = 0; k < bin2.length; k++) {
        tooltipHtml += `<div>
          <input type="checkbox" disabled ${bin2[k] === "1" ? "checked" : ""}>
          <label style="color: black; font-size:12px;">${labels2[k]}</label>
        </div>`;
      }
      tooltipHtml += `<br><strong>Byte 3 (${byte3}):</strong><br>`;
      for (let k = 0; k < bin3.length; k++) {
        tooltipHtml += `<div>
          <input type="checkbox" disabled ${bin3[k] === "1" ? "checked" : ""}>
          <label style="color: black; font-size:12px;">${labels3[k]}</label>
        </div>`;
      }
      tooltipHtml += `</div>`;

      valueDisplay = `<span class="cvm-tooltip" style="cursor:pointer;position:relative;" 
        onmouseover="showCVMTooltip(this, event)" 
        onmouseout="hideCVMTooltip(this)">
        ${value}
        <span class="cvm-tooltip-box" style="display:none;position:fixed;z-index:9999;background:#fff;border:1px solid #ccc;padding:8px;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.15);white-space:nowrap;">${tooltipHtml}</span>
      </span>`;
    }


    // Tooltip for 82 (AIP) with scheme-specific byte 2
    if (tag.toUpperCase() === "82" && value.length === 4) {
      const byte1 = value.slice(0, 2);
      const byte2 = value.slice(2, 4);
      const bin1 = parseInt(byte1, 16).toString(2).padStart(8, '0');
      const bin2 = parseInt(byte2, 16).toString(2).padStart(8, '0');

      // Scheme-specific bit labels for byte 1
      let bitLabels1;
      if (scheme === "paypass") {
        bitLabels1 = [
          "Bit 8: Reserved for Future Use (RFU)",
          "Bit 7: SDA Supported",
          "Bit 6: DDA Supported",
          "Bit 5: Cardholder Verification Supported",
          "Bit 4: Terminal Risk Management to be Performed",
          "Bit 3: Issuer Authentication Supported",
          "Bit 2: On-Device Cardholder Verification Supported",
          "Bit 1: Combined DDA/Application Cryptogram Generation (CDA) Supported"
        ];
      } else {
        bitLabels1 = [
          "Bit 8: Reserved for Future Use (RFU)",
          "Bit 7: Static Data Authentication (SDA) Supported",
          "Bit 6: Dynamic Data Authentication (DDA) Supported",
          "Bit 5: Cardholder Verification Supported",
          "Bit 4: Terminal Risk Management to be Performed",
          "Bit 3: Issuer Authentication Supported",
          "Bit 2: RFU",
          "Bit 1: Combined DDA/Application Cryptogram Generation (CDA) Supported"
        ];
      }

      // Scheme-specific bit labels for byte 2
      let bitLabels2;
      if (scheme === "paypass") {
        bitLabels2 = [
          "Bit 8: Magstripe Mode Supported",
          "Bit 7: EMV Mode Supported",
          "Bit 6: RFU",
          "Bit 5: RFU",
          "Bit 4: RFU",
          "Bit 3: RFU",
          "Bit 2: RFU",
          "Bit 1: Relay resistance protocol supported"
        ];
      } else if (scheme === "expresspay") {
        bitLabels2 = [
          "Bit 8: EMV Mode Supported",
          "Bit 7: Expresspay Mobile Supported",
          "Bit 6: Expresspay HCE (Host Card Emulation) Supported",
          "Bit 5: RFU",
          "Bit 4: RFU",
          "Bit 3: RFU",
          "Bit 2: RFU",
          "Bit 1: RFU"
        ];
      } else {
        bitLabels2 = [
          "Bit 8: RFU",
          "Bit 7: RFU",
          "Bit 6: RFU",
          "Bit 5: RFU",
          "Bit 4: RFU",
          "Bit 3: RFU",
          "Bit 2: RFU",
          "Bit 1: RFU"
        ];
      }

      let tooltipHtml = `<div style="font-family:monospace;font-size:12px;">`;

      // Byte 1
      tooltipHtml += `<strong>Byte 1 (${byte1}):</strong>
  <div style="height: 8px;"></div>
  <div style="display: grid; grid-template-columns: auto 1fr; gap: 6px; margin-bottom: 8px;">`;

      for (let k = 0; k < bin1.length; k++) {
        tooltipHtml += `
    <div style="display: contents;">
      <input type="checkbox" disabled ${bin1[k] === "1" ? "checked" : ""} style="accent-color: black;">
      <label style="color: black; font-size:12px;">${bitLabels1[k] || "RFU"}</label>
    </div>`;
      }

      tooltipHtml += `</div>`;

      // Byte 2
      tooltipHtml += `<strong>Byte 2 (${byte2}):</strong>
  <div style="height: 8px;"></div>
  <div style="display: grid; grid-template-columns: auto 1fr; gap: 6px;">`;

      for (let k = 0; k < bin2.length; k++) {
        tooltipHtml += `
    <div style="display: contents;">
      <input type="checkbox" disabled ${bin2[k] === "1" ? "checked" : ""} style="accent-color: black;">
      <label style="color: black; font-size:12px;">${bitLabels2[k] || "RFU"}</label>
    </div>`;
      }

      tooltipHtml += `</div></div>`;


      valueDisplay = `<span class="cvm-tooltip" style="cursor:pointer;position:relative;" 
  onmouseover="showCVMTooltip(this, event)" 
  onmouseout="hideCVMTooltip(this)">
  ${value}
  <span class="cvm-tooltip-box" style="display:none;position:fixed;z-index:9999;background:#fff;border:1px solid #ccc;padding:8px;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.15);white-space:nowrap;">${tooltipHtml}</span>
  </span>`;
    }
    table += `<tr><td>${tagDisplay}</td><td>${lengthDisplay}</td><td>${valueDisplay}</td></tr>`;
  }
  table += '</table>';
  return table;
}

// Helper function to convert hex string to ASCII
function hexToAscii(hex) {
  let ascii = '';
  for (let i = 0; i < hex.length; i += 2) {
    const part = hex.substr(i, 2);
    ascii += String.fromCharCode(parseInt(part, 16));
  }
  return ascii;
}

// CVM Parsing Functions Byte 1
function parseByte1(hex) {
  const bin = parseInt(hex, 16).toString(2).padStart(8, '0');
  const b8 = bin[0];
  const b7 = bin[1];
  const b6to1 = bin.slice(2);

  let method = "";
  let handling = b7 === "0"
    ? "Fail cardholder verification"
    : "Apply next CV Rule";

  switch (b6to1) {
    case "000000": method = "Fail CVM processing"; break;
    case "000001": method = "Plaintext PIN verification by ICC"; break;
    case "000010": method = "Enciphered PIN verified online"; break;
    case "000011": method = "Plaintext PIN by ICC + signature"; break;
    case "000100": method = "Enciphered PIN by ICC"; break;
    case "000101": method = "Enciphered PIN by ICC + signature"; break;
    case "011110": method = "Signature (paper)"; break;
    case "011111": method = "No CVM required"; break;
    default:
      if (b8 === "0" && parseInt(b6to1, 2) >= 6 && parseInt(b6to1, 2) <= 29) {
        method = "Reserved for future use by specification";
      } else if (b8 === "1" && parseInt(b6to1, 2) <= 31) {
        method = "Reserved for individual payment systems";
      } else if (b8 === "1" && parseInt(b6to1, 2) <= 62) {
        method = "Reserved for issuer use";
      } else if (bin === "11111111") {
        method = "Not available for use";
      } else {
        method = "Unknown or RFU";
      }
  }

  return { method, handling };
}

// CVM Parsing Functions Byte 2 
function parseByte2(hex) {
  const conditions = {
    "00": "Always",
    "01": "If unattended cash",
    "02": "If not unattended/manual cash or cashback",
    "03": "If terminal supports CVM",
    "04": "If manual cash",
    "05": "If purchase with cashback",
    "06": "If transaction is in the application currency and is under X value",
    "07": "If transaction is in the application currency and is over X value",
    "08": "If transaction is in the application currency and is under Y value",
    "09": "If transaction is in the application currency and is over Y value"
  };
  return conditions[hex] || "RFU or Reserved";
}

// CVM Parsing Functions Byte 3
function parseByte3(hex) {
  const results = {
    "00": "Unknown (e.g., signature)",
    "01": "Failed",
    "02": "Success"
  };
  return results[hex] || "Unknown";
}

// Parsing CVM from 6-digit hex code
function parseCVM(CVMR) {
  //const input = document.getElementById("cvmInput").value.toUpperCase();
  const output = document.getElementById("output");
  output.innerHTML = "";

  if (!/^[0-9A-F]{6}$/.test(CVMR)) {
    output.innerHTML = "Please enter a valid 6-digit hex code.";
    return;
  }

  const byte1 = input.slice(0, 2);
  const byte2 = input.slice(2, 4);
  const byte3 = input.slice(4, 6);

  const b1 = parseByte1(byte1);
  const b2 = parseByte2(byte2);
  const b3 = parseByte3(byte3);

  output.innerHTML = `
<span class="label">CVM</span>${b1.method}
<span class="label">If unsuccessful</span>${b1.handling}
<span class="label">Condition</span>${b2}
<span class="label">Result of CVM</span>${b3}
      `;
}


// Function to generate ISO 8583 table from JSON data
// This function generates an HTML table from a JSON object representing ISO 8583 data
function generateISOTable(json, isRequest) {
  let table = '<table><tr><th class="field-column-fixed">Field</th><th>Value</th></tr>';

  for (const key in json) {
    if (json.hasOwnProperty(key)) {
      let value = json[key];

      // If key is "002", remove the first two digits
      if (key === "002") {
        value = String(value);
        if (value.length >= 2) {
          value = value.substring(2);
        }
      }

      // Only convert to ASCII if it's a request and key is in the list
      const asciiKeys = ["037", "041", "042", "043", "047"];
      if (isRequest && asciiKeys.includes(key)) {
        value = hexToAscii(String(value));
      }

      // If key is DE55, include raw value first, then TLV table
      if (key === "055") {
        let rawValue = String(value);

        // Remove first six digits if it's a request message
        if (isRequest && rawValue.length >= 6) {
          rawValue = rawValue.substring(6);
        }

        // Parse TLV
        const tlvTable = parseTLV(rawValue);

        // Combine raw value and TLV table in one cell
        value = `<div><strong>Raw:</strong> ${String(value)}</div><div style="margin-top:8px; overflow:auto;">${tlvTable}</div>`;
      }
      table += `<tr><td>${key}</td><td>${value}</td></tr>`;
    }
  }

  table += '</table>';
  return table;
}

// Variable to track data MTI
let dataMTIwasPreviouslyFilled = false;

function rearrangeObject(obj, skipAsciiConversion = false) {
  if (!obj || typeof obj !== 'object') return obj;

  const reordered = {};
  const asciiKeys = ["037", "041", "042", "043", "047"];

  if ('MTI' in obj) {
    reordered['MTI'] = obj['MTI'];
  }

  Object.keys(obj)
    .filter(key => key !== 'MTI')
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach(key => {
      const value = obj[key];

      if (asciiKeys.includes(key) && !skipAsciiConversion) {
        reordered[key] = hexToAscii(value);
      } else {
        reordered[key] = value;
      }
    });

  return reordered;

}

function createTableFromObject(obj, isNested = false, isBreakdown = false) {

  // Use 75% for top-level, 100% for nested tables
  let tableWidth = isNested ? '100%' : '85%';
  // Set key column width based on nesting
  let keyColumnStyle = isNested ? 'width: 80px;' : 'width: 180px;';


  let table = `<table style="width: ${tableWidth}; border="1" cellpadding="5" cellspacing="0">`;
  table += `<thead><tr><th style="${keyColumnStyle}" class="field-column-fixed">Key</th><th>Value</th></tr></thead><tbody>`;

  for (const key in obj) {
    const value = obj[key];

    if (key === "055" && value !== null) {

      if (!isBreakdown) {
        const tlvTable = parseTLV(value.slice(6));
        const combinedValue = `<div><strong>Raw:</strong> ${value}</div><div style="margin-top:8px; overflow:auto;">${tlvTable}</div>`;
        table += `<tr><td>${key}</td><td>${combinedValue}</td></tr>`;
        console.warn(`Error in custom_field`, value);
      } else {
        const tlvTable = parseTLV(value);
        const combinedValue = `<div><strong>Raw:</strong> ${value}</div><div style="margin-top:8px; overflow:auto;">${tlvTable}</div>`;
        table += `<tr><td>${key}</td><td>${combinedValue}</td></tr>`;
        console.warn(`Error in breakdown`, value);
      }
    }
    else if (key === "035" && typeof value === "string" && value.length > 2) {
      const length = value.slice(0, 2);
      const track2 = value.slice(2);
      const formattedValue = `<div><strong>Length:</strong> ${length}</div><div><strong>Track2:</strong> ${track2}</div>`;
      table += `<tr><td>${key}</td><td>${formattedValue}</td></tr>`;
    }
    else if (key === "047" && typeof value === "string" && value.length > 3) {
      const length = value.slice(0, 3);
      const data = value.slice(3);

      // Check if length is a valid decimal number
      if (!isNaN(length) && /^\d+$/.test(length)) {
        const formattedValue = `
      <div><strong>Length:</strong> ${length}</div><div><strong>Data:</strong> ${data}</div>`;
        table += `<tr><td>${key}</td><td>${formattedValue}</td></tr>`;
      } else {
        // Just show the full value if length is not a valid number
        table += `<tr><td>${key}</td><td>${value}</td></tr>`;
      }
    }
    else if (key === "custom_field" || key === "breakdown") {

      if (key === "custom_field") {
        const subTable = createTableFromObject(value, true, false);
        table += `<tr><td>${key}</td><td>${subTable}</td></tr>`;
      }
      else {
        const subTable = createTableFromObject(value, true, true);
        table += `<tr><td>${key}</td><td>${subTable}</td></tr>`;
      }

    } else {
      table += `<tr><td>${key}</td><td>${value}</td></tr>`;
    }
  }

  table += '</tbody></table>';
  return table;
}

// new parseMTI function
function parseMTI() {
  const input = document.getElementById('mti-data-input');
  const requestOutput = document.getElementById('requestTable');
  const responseOutput = document.getElementById('responseTable');

  // Check for empty input
  if (!input.value.trim()) {
    if (!dataMTIwasPreviouslyFilled) {
      showAlert("JSON data is empty. Please enter the data.", 'warning');
    }
    requestOutput.innerHTML = '';
    responseOutput.innerHTML = '';
    input.value = '';
    document.getElementById('tabWrapper').style.display = 'none';
    showInfoAlert('JSON Data cleared. Please enter new data.');
    return;
  }
  dataMTIwasPreviouslyFilled = true;

  try {
    let raw = input.value.trim();
    let jsonArray;

    try {
      const parsed = JSON.parse(raw);
      jsonArray = Array.isArray(parsed) ? parsed : [parsed];
      document.getElementById('tabWrapper').style.display = 'block';
    } catch {
      const split = raw
        .replace(/}\s*{/g, '}|{')
        .split('|')
        .map(str => str.trim())
        .filter(Boolean);

      jsonArray = split.map(str => JSON.parse(str));
      document.getElementById('tabWrapper').style.display = 'block';
    }

    let requestHTML = '';
    let responseHTML = '';

    jsonArray.forEach(parsed => {
      if (parsed.custom_field) {
        parsed.custom_field = rearrangeObject(parsed.custom_field, !!parsed.breakdown);
        requestHTML += createTableFromObject(parsed);
        requestHTML += '<hr><div style="margin-top: 40px;"></div>';
      }

      if (parsed.breakdown) {
        parsed.breakdown = rearrangeObject(parsed.breakdown, true);
        responseHTML += createTableFromObject(parsed);
        responseHTML += '<hr><div style="margin-top: 40px;"></div>';
      }
    });

    requestOutput.innerHTML = requestHTML || '<p>No request data found.</p>';
    responseOutput.innerHTML = responseHTML || '<p>No response data found.</p>';

    // Show alert based on parsing result
    if (!requestHTML && !responseHTML) {
      showAlert('No valid request or response data found.', 'warning');
    } else if (!requestHTML) {
      showInfoAlert('Response data parsed successfully.');
    } else if (!responseHTML) {
      showInfoAlert('Request data parsed successfully.');
    } else {
      showInfoAlert('Request and response data parsed successfully!');
    }

  } catch (e) {
    requestOutput.textContent = 'Invalid JSON: ' + e.message;
    responseOutput.textContent = 'Invalid JSON: ' + e.message;
    document.getElementById('tabWrapper').style.display = 'none';
    showAlert('Invalid JSON: ' + e.message, 'error');
  }
}


// Function to parse MTI data from input and generate tables
// This function extracts request and response JSON from the input, parses them, and generates corresponding tables
// function parseMTI() {
//   const input = document.getElementById('mti-data-input').value;

//   if (!input) {
//     if (!dataMTIwasPreviouslyFilled) {
//       showAlert("MTI data is empty. Please enter the data.", 'warning');
//     }

//     const tableResponse = document.getElementById('responseTable');
//     const tableRequest = document.getElementById('requestTable');
//     if (tableResponse) {
//       tableResponse.innerHTML = '';
//     }
//     if (tableRequest) {
//       tableRequest.innerHTML = '';
//     }
//     document.getElementById('mti-data-input').value = '';
//     showInfoAlert('MTI Data cleared. Please enter new data.');
//     return;
//   }
//   dataMTIwasPreviouslyFilled = true;

//   const requestMatch = input.match(/Request\s*:\s*.*?Breakdown\s*:\s*(\{[\s\S]*?\})/i);
//   const responseMatch = input.match(/Response\s*:\s*.*?Breakdown\s*:\s*(\{[\s\S]*?\})/i);

//   const requestTable = document.getElementById('requestTable');
//   const responseTable = document.getElementById('responseTable');

//   requestTable.innerHTML = '';
//   responseTable.innerHTML = '';

//   let isRequestJSONvalid = true;
//   let isResponseJSONvalid = true;

//   let isRequestJSONparsedOK = true;
//   let isResponseJsonparsedOK = true;

//   try {
//     // Attempt to parse the request JSON from the matched string
//     const requestJSON = requestMatch ? JSON.parse(requestMatch[1]) : null;

//     // Check if the parsed JSON is valid and generate the table
//     if (requestJSON) {
//       requestTable.innerHTML = generateISOTable(requestJSON, true); // true indicates it's a request
//       document.getElementById('tabWrapper').style.display = 'block'
//     } else {
//       //showAlert('No valid request JSON found.', 'error');      
//       //requestTable.innerHTML = '<p>No valid request JSON found.</p>';
//       //requestTable.innerHTML = '';
//       isRequestJSONvalid = false;
//     }
//   } catch (error) {
//     // Handle any parsing errors
//     //requestTable.innerHTML = '<p>Invalid JSON in request.</p>';
//     isRequestJSONparsedOK = false;
//     console.error('Error parsing request JSON:', error);
//   }

//   try {
//     // Attempt to parse the response JSON from the matched string
//     const responseJSON = responseMatch ? JSON.parse(responseMatch[1]) : null;

//     // Check if the parsed JSON is valid and generate the table
//     if (responseJSON) {
//       responseTable.innerHTML = generateISOTable(responseJSON, false); // false indicates it's a response
//       document.getElementById('tabWrapper').style.display = 'block'
//     } else {
//       //responseTable.innerHTML = '<p>No valid response JSON found.</p>';
//       //responseTable.innerHTML = '';
//       isResponseJSONvalid = false;
//     }
//   } catch (error) {
//     // Handle any parsing errors
//     //responseTable.innerHTML = '<p>Invalid JSON in response.</p>';    
//     isResponseJsonparsedOK = false;
//     console.error('Error parsing response JSON:', error);
//   }

//   if ((!isRequestJSONvalid || !isRequestJSONparsedOK) && (!isResponseJSONvalid || !isResponseJsonparsedOK)) {
//     showAlert('Invalid or missing request and response JSON.', 'error');
//   } else {
//     if (!isRequestJSONvalid || !isRequestJSONparsedOK) {
//       showAlert(
//         'Invalid or missing request JSON.',
//         'warning',
//         () => showInfoAlert('Only Response data parsed successfully')
//       );
//     } else if (!isResponseJSONvalid || !isResponseJsonparsedOK) {
//       /*
//       showAlert(
//         'Invalid or missing response JSON.',
//         'warning',
//         () => showInfoAlert('Only Request data parsed successfully')
//       );
// `     */
//     } else {
//       showInfoAlert('Request and response data parsed successfully');
//     }
//   }

//   // Show all elements with class "table-box"
//   const tableBoxes = document.querySelectorAll('.table-box');
//   tableBoxes.forEach(box => {
//     box.style.display = 'block';
//   });
// }

// Paymark Host Record Parser code
const recordTagValues = {
  "A Record": {
    "defaultAccount": ["10", "20", "30"]
  },
  "X Record": {
    "defaultAccount": ["10", "20", "30"]
  },
  "C Record": {
    "cardSaleEnable": ["true", "false"],
    "cardCashEnable": ["true", "false"],
    "cardVoidCashEnable": ["true", "false"],
    "enabled": ["true", "false"],
    "emvEnabled": ["true", "false"],
    "clessEnabled": ["true", "false"],
    "manualEnabled": ["true", "false"],
    "swipeEnabled": ["true", "false"],
    "txnAuthorityRequirement": ["PIN_MANDATORY", "PIN_OR_SIGNATURE", "SIGNATURE_MANDATORY_NO_PIN"],
    "magstripePinRequired": ["true", "false"],
    "manualPinRequired": ["true", "false"],
    "cardPinBypassEnable": ["true", "false"],
    "cvcPrompt": ["OFF", "MANUAL_ENTRY", "MANUAL_AND_SWIPED", "CARD_NOT_PRESENT", "ECOMMERCE_PHONE_ORDER"],
    "cvvBypassCheck": ["NO_CHECK", "UNREADABLE_AND_NOT_PRESENT_OPTIONS", "UNREADABLE_AND_NOT_PRESENT_AND_BYPASS_OPTIONS"],
    "checkSvc": ["true", "false"],
    "luhnCheckMode": ["OFF", "MANUAL", "MANUAL_SWIPE", "SWIPE", "OFFLINE_ONLY"],
    "expDateCheckMode": ["OFF", "MANUAL", "MANUAL_SWIPE", "SWIPE", "ALL", "OFFLINE_ONLY"],
    "accountGroupingCodeOnline": ["1", "2", "3"],
    "accountGroupingCodeOffline": ["1", "2", "3"],
    "addressVerification": ["OFF", "ZIP_CODE", "ZIP_CODE_ADDRS", "ADDRS"],
    "addressVerificationSwipe": ["OFF", "ZIP_CODE", "ZIP_CODE_ADDRS", "ADDRS"]
  }
};

// Paymark Host Record Parser code
function populateDropdownsFromSections() {
  const recordSelect = document.getElementById('recordSelect');
  const tagSelect = document.getElementById('tagSelect');
  const valueSelect = document.getElementById('valueSelect');
  const selector = document.getElementById('recordSelect');

  if (selector) {
    // Clear existing options
    selector.innerHTML = '';

    // Add A, X, C Record options
    const options = [
      { value: 'A', text: 'A Record' },
      { value: 'X', text: 'X Record' },
      { value: 'C', text: 'C Record' }
    ];

    options.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.text;
      selector.appendChild(option);
    });
  }

  // Update Tags when Record changes
  recordSelect.addEventListener('change', () => {
    const selectedRecord = recordSelect.options[recordSelect.selectedIndex].textContent;
    const tags = Object.keys(recordTagValues[selectedRecord] || {});
    tagSelect.innerHTML = '';
    tags.forEach(tag => {
      const option = document.createElement('option');
      option.value = tag;
      option.textContent = tag;
      tagSelect.appendChild(option);
    });

    tagSelect.dispatchEvent(new Event('change'));
  });

  // Update Values when Tag changes
  tagSelect.addEventListener('change', () => {
    const selectedRecord = recordSelect.options[recordSelect.selectedIndex].textContent;
    const selectedTag = tagSelect.value;
    const values = recordTagValues[selectedRecord]?.[selectedTag] || [];

    valueSelect.innerHTML = '';
    values.forEach(val => {
      const option = document.createElement('option');
      option.value = val;
      option.textContent = val;
      valueSelect.appendChild(option);
    });
  });

  // Trigger initial population
  recordSelect.dispatchEvent(new Event('change'));
}

function toggleContentById(id) {
  const el = document.getElementById(id);
  if (el) {
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
  }
}

let hostRecordwasPreviouslyFilled = false;

//  Function to parse host record from input and display it
function parseHostRecord() {
  const raw = document.getElementById('inputRecord')?.value;

  if (!raw) {
    if (!hostRecordwasPreviouslyFilled) {
      showAlert("Host Record data is empty. Please enter the data.", 'warning');
    }
    document.getElementById('inputRecord').value = '';

    // Clear dropdown options
    const recordSelect = document.getElementById('recordSelect');
    const tagSelect = document.getElementById('tagSelect');
    const valueSelect = document.getElementById('valueSelect');

    if (recordSelect) recordSelect.innerHTML = '';
    if (tagSelect) tagSelect.innerHTML = '';
    if (valueSelect) valueSelect.innerHTML = '';

    const output = document.getElementById('host-record-output');

    // Remove output if not empty
    if (output && output.innerHTML.trim() !== '') {
      output.innerHTML = '';
    }
    showInfoAlert('Host Record Data cleared. Please enter new data.');
    return;
  }
  hostRecordwasPreviouslyFilled = true;

  const output = document.getElementById('host-record-output');
  if (!output) {
    console.error("Output container not found.");
    return;
  }

  output.innerHTML = '';

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    //output.innerHTML = '<p style="color:red;">Invalid JSON format.</p>';
    showAlert('Invalid format', 'error');
    return;
  }

  const sections = {
    'K Record': data.capkDataList || [],
    'A Record': data.hostAllCardConfigs?.contactConfigs || [],
    'X Record': data.hostAllCardConfigs?.clessConfigs || [],
    'C Record': Array.isArray(data.hostAllCardConfigs?.cardConfigs)
      ? data.hostAllCardConfigs.cardConfigs
      : []
  };

  let sectionCounter = 0;
  for (const [title, records] of Object.entries(sections)) {
    const sectionId = `section-${sectionCounter++}`;
    const section = document.createElement('div');
    section.className = 'section';

    const sectionHeader = document.createElement('div');
    sectionHeader.className = 'section-header';
    sectionHeader.textContent = title;

    const sectionContent = document.createElement('div');
    sectionContent.className = 'section-content';
    sectionContent.id = sectionId;

    sectionHeader.onclick = () => toggleContentById(sectionId);

    if (Array.isArray(records) && records.length > 0) {
      records.forEach((record, index) => {
        if (typeof record !== 'object' || record === null) return;

        const recordDiv = document.createElement('div');
        recordDiv.className = 'record';
        recordDiv.setAttribute('data-section', title);
        recordDiv.style.marginLeft = '30px';

        const recordId = `${sectionId}-record-${index}`;
        const header = document.createElement('div');
        header.className = 'record-header';

        if (title === 'K Record' && record.rid && record.ridIndex) {
          header.textContent = `${record.rid} (${record.ridIndex})`;
        } else if ((title === 'A Record' || title === 'X Record') && record.recommendedAppName && record.currencyLabel) {
          header.textContent = `${record.recommendedAppName} (${record.currencyLabel})`;
        } else if (
          title === 'C Record' &&
          record.binRangeLow != null &&
          record.binRangeHigh != null &&
          record.cardScheme
        ) {
          header.textContent = `${record.binRangeLow}-${record.binRangeHigh} (${record.cardScheme})`;
        } else {
          header.textContent = `${title} Record ${index + 1}`;
        }

        const content = document.createElement('div');
        content.className = 'record-content';
        content.id = recordId;

        const fieldContent = document.createElement('div');
        fieldContent.className = 'field-content';

        for (const [key, value] of Object.entries(record)) {
          const fieldDiv = document.createElement('div');
          fieldDiv.className = 'record-field';

          const keySpan = document.createElement('span');
          keySpan.className = 'key';
          keySpan.textContent = `${key}`;

          const colonSpan = document.createElement('span');
          colonSpan.className = 'colon';
          colonSpan.textContent = ': ';

          const valueSpan = document.createElement('span');
          valueSpan.className = 'value';
          valueSpan.textContent = value;

          fieldDiv.appendChild(keySpan);
          fieldDiv.appendChild(colonSpan);
          fieldDiv.appendChild(valueSpan);
          fieldContent.appendChild(fieldDiv);
        }

        content.appendChild(fieldContent);
        recordDiv.appendChild(header);
        recordDiv.appendChild(content);
        sectionContent.appendChild(recordDiv);
      });
      showInfoAlert(`Host Record parsed successfully!`);
    } else {
      //sectionContent.innerHTML = '<p>No valid records found.</p>';
      showAlert('No valid records found.', 'warning');
      const output = document.getElementById('host-record-output');
      // Remove output if not empty
      if (output && output.innerHTML.trim() !== '') {
        output.innerHTML = '';
      }

    }

    section.appendChild(sectionHeader);
    section.appendChild(sectionContent);
    output.appendChild(section);
  }

  populateDropdownsFromSections();
}

// Function to load file content into the textarea and parse the host record
// This function reads the content of a file selected by the user and populates the textarea with
function loadFileContent(event) {
  const file = event.target.files[0];
  if (!file) return;

  const allowedTypes = ['application/json', 'text/plain'];
  const isAllowed = allowedTypes.includes(file.type) || file.name.match(/\\.(json|txt)$/i);

  if (!isAllowed) {
    //alert("Only .txt or .json files are allowed.");
    showAlert("Only .txt or .json files are allowed.", "warning");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const content = e.target.result;
    const textarea = document.getElementById('inputRecord');
    if (textarea) {
      textarea.value = content;
      parseHostRecord();
    } else {
      console.error("Textarea with ID 'inputRecord' not found.");
    }
  };
  reader.readAsText(file);
}

// Funtion for finding a record based on user input
// This function searches through the records for a match based on user-selected tag and value
function findRecord() {
  resetView(); // Reset view before searching
  const inputRecord = document.getElementById('inputRecord')?.value?.trim();
  if (!inputRecord) {
    showAlert("Oops! Host Record data is empty", "warning");
    return; // Stop the function if input is empty
  }

  const tagSelect = document.getElementById('tagSelect')?.value;
  const valueSelect = document.getElementById('valueSelect')?.value;
  const recordSelect = document.getElementById('recordSelect')?.value + ' Record'; // The selected section-header
  const allRecords = document.querySelectorAll('.record');
  const allSectionHeaders = document.querySelectorAll('.section-header');

  let anyMatchFound = false; // Track if any match is found
  let matchCount = 0; // 🔢 Counter for matches

  // Reset all section header colors
  allSectionHeaders.forEach(header => {
    header.style.color = '';
  });

  allRecords.forEach(record => {
    const recordSection = record.getAttribute('data-section');
    const header = record.querySelector('.record-header');
    const fields = record.querySelectorAll('.record-field');
    let matchFound = false;

    // Reset header color first
    if (header) header.style.color = '';
    const section = record.closest('.section');
    const sectionHeader = section?.querySelector('.section-header');
    const sectionContent = section?.querySelector('.section-content');

    fields.forEach(field => {
      const keySpan = field.querySelector('.key');
      const valueSpan = field.querySelector('.value');
      if (!keySpan || !valueSpan) return;

      const key = keySpan.textContent.replace(':', '').trim();
      const value = valueSpan.textContent.trim();

      // Reset previous highlight
      valueSpan.style.color = '';

      // Highlight if key matches tagSelect
      if (key === tagSelect && value === valueSelect) {

        if (recordSection === recordSelect) {
          valueSpan.style.color = 'red';
          matchFound = true;
          anyMatchFound = true;
          matchCount++; // ✅ Increment match count
        }
      }
    });

    // Highlight header if any match found
    if (matchFound && header) {
      if (header) header.style.color = 'red';

      if (sectionHeader && recordSection === recordSelect) {
        sectionHeader.style.color = 'red';
      }

      if (sectionContent && recordSection === recordSelect) {
        sectionContent.style.display = 'block'; // Auto-expand the section
      }
    }
  });

  // Show alert if no match was found
  if (!anyMatchFound) {
    //alert(`No matching record found for: Tag:${tagSelect} Value:${valueSelect} in ${recordSelect}`);
    //showAlert(`No matching record found for: Tag:${tagSelect} Value:${valueSelect} in ${recordSelect}`);
    showAlert(`Oops!  We couldn't find ${tagSelect}:${valueSelect} in ${recordSelect}`, "warning");
  }
  else {
    showAlert(`Found ${matchCount} matching record(s) for ${tagSelect}:${valueSelect} in ${recordSelect}`, "success");
  }
}

// Function to show alert messages
function resetView() {
  const allSections = document.querySelectorAll('.section');
  const allRecords = document.querySelectorAll('.record');

  // Reset section headers and collapse content
  allSections.forEach(section => {
    const sectionHeader = section.querySelector('.section-header');
    const sectionContent = section.querySelector('.section-content');
    if (sectionHeader) sectionHeader.style.color = '';
    if (sectionContent) sectionContent.style.display = 'none';
  });

  // Reset record headers and field highlights
  allRecords.forEach(record => {
    const header = record.querySelector('.record-header');
    const fields = record.querySelectorAll('.record-field');
    if (header) header.style.color = '';
    fields.forEach(field => {
      const valueSpan = field.querySelector('.value');
      if (valueSpan) valueSpan.style.color = '';
    });
  });
}

// Funtion to validate JSON input and save it to a file
// This function checks the input for valid JSON, generates a timestamped filename, and triggers a
function validateAndSaveJSON() {
  const raw = document.getElementById('inputRecord')?.value;
  const output = document.getElementById('host-record-output');
  if (!output) {
    console.error("Output container not found.");
    return;
  }

  // Check for empty input
  if (!raw || raw.trim() === '') {
    showAlert('No host record data found', 'warning');
    return;
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    //output.innerHTML = '<p style="color:red;">Invalid JSON format.</p>';
    showAlert('Invalid format', 'error');
    return;
  }

  // Generate timestamp: YYYYMMDD_HHMMSS
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:]/g, '').replace('T', '_').split('.')[0];

  // Create file name with timestamp
  const filename = `host_record_${timestamp}.json`;

  // Trigger download
  const jsonStr = JSON.stringify(data, null, 4); // Beautify with 4-space indentation
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);

  showAlert(`Host record has been saved to file: <strong>${filename}</strong><br>It will be downloaded automatically.`, "success");

  const allSections = document.querySelectorAll('.section');
  const allRecords = document.querySelectorAll('.record');

  // Reset section headers and collapse content
  allSections.forEach(section => {
    const sectionHeader = section.querySelector('.section-header');
    const sectionContent = section.querySelector('.section-content');
    if (sectionHeader) sectionHeader.style.color = '';
    if (sectionContent) sectionContent.style.display = 'none';
  });

  // Reset record headers and field highlights
  allRecords.forEach(record => {
    const header = record.querySelector('.record-header');
    const fields = record.querySelectorAll('.record-field');
    if (header) header.style.color = '';
    fields.forEach(field => {
      const valueSpan = field.querySelector('.value');
      if (valueSpan) valueSpan.style.color = '';
    });
  });
}

// Add these helper functions at the end of your script.js
function showCVMTooltip(el, evt) {
  const box = el.querySelector('.cvm-tooltip-box');
  if (box) {
    box.style.display = 'block';
    // Position the tooltip near the mouse
    box.style.left = (evt.clientX + 10) + 'px';
    box.style.top = (evt.clientY + 10) + 'px';
  }
}
function hideCVMTooltip(el) {
  const box = el.querySelector('.cvm-tooltip-box');
  if (box) box.style.display = 'none';
}
window.showCVMTooltip = showCVMTooltip;
window.hideCVMTooltip = hideCVMTooltip;
