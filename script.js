document.addEventListener("DOMContentLoaded", function () {

  // Application version
  const appVersion = "3.8";
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
  // tab.addEventListener('click', () => {
  //   modal.classList.add('show');
  //   hexInput.focus();
  // });

  // Close modal
  /*
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('show');
      asciiResult.textContent = '';
      hexInput.value = '';
    });
  */
  // Close modal when clicking outside
  /*
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
      asciiResult.textContent = '';
      hexInput.value = '';
    }
  });
*/

  // Generic side-tab/modal handler
  document.body.addEventListener('click', function (e) {
    // Open modal on tab click
    const tab = e.target.closest('.side-tab[data-modal]');
    if (tab) {
      const modalId = tab.getAttribute('data-modal');
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add('show');
        const input = modal.querySelector('textarea, input[type="text"]');
        if (input) input.focus();
      }
      return;
    }

    // Close modal when clicking outside modal-content
    const modal = e.target.closest('.modal-overlay');
    if (modal && e.target === modal) {
      modal.classList.remove('show');
      const result = modal.querySelector('div[id$="Result"]');
      if (result) result.textContent = '';
      const input = modal.querySelector('textarea, input[type="text"]');
      if (input) input.value = '';
    }

    // Close modal on close button
    if (e.target.classList.contains('close-btn')) {
      const modal = e.target.closest('.modal-overlay');
      if (modal) modal.classList.remove('show');
    }
  });

  // Convert hex to ASCII
  convertBtn.addEventListener('click', () => {
    const hexLines = hexInput.value.trim().split(/\r?\n/); // Split input by lines
    const isMultiline = hexLines.length > 1;

    let output = '<strong>Result:</strong><br>';
    hexLines.forEach((hex, index) => {
      const cleanedHex = hex.replace(/\s+/g, ''); // Remove all spaces

      if (!/^[0-9a-fA-F]+$/.test(cleanedHex) || cleanedHex.length % 2 !== 0) {
        output += `<blockquote>${isMultiline ? `Line ${index + 1}: ` : ''}Invalid hex string.</blockquote>`;
        return;
      }

      let ascii = '';
      for (let i = 0; i < cleanedHex.length; i += 2) {
        const byte = cleanedHex.substr(i, 2);
        ascii += String.fromCharCode(parseInt(byte, 16));
      }

      output += `<blockquote>${isMultiline ? `Line ${index + 1}: ` : ''}${ascii}</blockquote>`;
    });

    asciiResult.innerHTML = output;
  });

  // Decode Bitmap
  const decodeBtn = document.getElementById('decodeBtn');
  if (decodeBtn) {
    decodeBtn.addEventListener('click', renderBitmap);
  }

  function renderBitmap() {
    const input = document.getElementById('bitmapInput').value.trim();
    if (!/^[0-9A-Fa-f]+$/.test(input)) {
      alert('Please enter a valid hex string.');
      return;
    }

    // Convert hex to binary
    let binary = '';
    for (let i = 0; i < input.length; i++) {
      binary += parseInt(input[i], 16).toString(2).padStart(4, '0');
    }

    const hasSecondary = binary[0] === '1';
    const primaryBits = binary.slice(0, 64);
    const secondaryBits = hasSecondary ? binary.slice(64, 128) : '';

    // Show/hide titles and tables
    const primaryTitle = document.getElementById('primaryTitle');
    const secondaryTitle = document.getElementById('secondaryTitle');
    const secondaryTable = document.getElementById('secondaryTable');
    if (primaryTitle) primaryTitle.style.display = 'block';
    if (secondaryTitle) secondaryTitle.style.display = hasSecondary ? 'block' : 'none';
    if (secondaryTable) secondaryTable.style.display = hasSecondary ? 'table' : 'none';

    renderBitmapTable('primaryTable', primaryBits, 1);
    if (hasSecondary) {
      renderBitmapTable('secondaryTable', secondaryBits, 65);
    }

    // Explanation section
    const explanationDiv = document.getElementById('explanation');
    if (explanationDiv) {
      explanationDiv.style.display = 'block';
      explanationDiv.innerHTML = `
        <blockquote style="text-align:left; font-size: 11px;">
          <strong>Hexadecimal:</strong> ${input}<br>
          <strong>Binary:</strong> <span class="binary-string">${binary}</span><br>
          <strong>Bit 1:</strong> ${binary[0]} (Secondary bitmap ${hasSecondary ? 'present' : 'not present'})<br>
          <strong>Total bits:</strong> ${binary.length}
        </blockquote>
      `;
    }

    const modalContent = document.querySelector('#modal-bitmap .modal-content');
    if (modalContent) {
      modalContent.style.width = 'max-content';
      modalContent.style.maxWidth = '60vw';  // prevents overflow
      modalContent.style.overflow = 'auto';
    }

  }

  function renderBitmapTable(tableId, bits, startIndex) {
    const table = document.getElementById(tableId);
    if (!table) return;
    table.innerHTML = '';

    // Header row
    const headerRow = document.createElement('tr');
    const byteHeader = document.createElement('th');
    byteHeader.textContent = 'Byte';
    headerRow.appendChild(byteHeader);
    for (let col = 0; col < 8; col++) {
      const th = document.createElement('th');
      th.textContent = 'Bit ' + (7 - col);
      headerRow.appendChild(th);
    }
    const binaryHeader = document.createElement('th');
    binaryHeader.textContent = 'Binary';
    headerRow.appendChild(binaryHeader);
    const hexHeader = document.createElement('th');
    hexHeader.textContent = 'Hex';
    headerRow.appendChild(hexHeader);
    table.appendChild(headerRow);

    // Rows
    for (let row = 0; row < 8; row++) {
      const tr = document.createElement('tr');
      const byteCell = document.createElement('td');
      byteCell.className = 'byte-col';
      byteCell.textContent = 'Byte ' + (row + 1);
      tr.appendChild(byteCell);

      let binaryRow = '';
      for (let col = 0; col < 8; col++) {
        const bitIndex = row * 8 + col;
        const td = document.createElement('td');
        td.textContent = 'DE ' + (startIndex + bitIndex);
        if (bits[bitIndex] === '1') {
          td.classList.add('active');
        }
        binaryRow += bits[bitIndex];
        tr.appendChild(td);
      }

      const binaryCell = document.createElement('td');
      binaryCell.className = 'binary-col';
      binaryCell.textContent = binaryRow;
      tr.appendChild(binaryCell);

      const hexCell = document.createElement('td');
      hexCell.className = 'hex-col';
      hexCell.textContent = parseInt(binaryRow, 2).toString(16).toUpperCase().padStart(2, '0');
      tr.appendChild(hexCell);

      table.appendChild(tr);
    }
  }

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

// Country Code Lookup Table
let countryCodeLookup = {
  "004": { name: "Afghanistan", alpha2: "AF", alpha3: "AFG" },
  "008": { name: "Albania", alpha2: "AL", alpha3: "ALB" },
  "012": { name: "Algeria", alpha2: "DZ", alpha3: "DZA" },
  "016": { name: "American Samoa", alpha2: "AS", alpha3: "ASM" },
  "020": { name: "Andorra", alpha2: "AD", alpha3: "AND" },
  "024": { name: "Angola", alpha2: "AO", alpha3: "AGO" },
  "660": { name: "Anguilla", alpha2: "AI", alpha3: "AIA" },
  "010": { name: "Antarctica", alpha2: "AQ", alpha3: "ATA" },
  "028": { name: "Antigua and Barbuda", alpha2: "AG", alpha3: "ATG" },
  "032": { name: "Argentina", alpha2: "AR", alpha3: "ARG" },
  "051": { name: "Armenia", alpha2: "AM", alpha3: "ARM" },
  "533": { name: "Aruba", alpha2: "AW", alpha3: "ABW" },
  "036": { name: "Australia", alpha2: "AU", alpha3: "AUS" },
  "040": { name: "Austria", alpha2: "AT", alpha3: "AUT" },
  "031": { name: "Azerbaijan", alpha2: "AZ", alpha3: "AZE" },
  "044": { name: "Bahamas (The)", alpha2: "BS", alpha3: "BHS" },
  "048": { name: "Bahrain", alpha2: "BH", alpha3: "BHR" },
  "050": { name: "Bangladesh", alpha2: "BD", alpha3: "BGD" },
  "052": { name: "Barbados", alpha2: "BB", alpha3: "BRB" },
  "112": { name: "Belarus", alpha2: "BY", alpha3: "BLR" },
  "056": { name: "Belgium", alpha2: "BE", alpha3: "BEL" },
  "084": { name: "Belize", alpha2: "BZ", alpha3: "BLZ" },
  "204": { name: "Benin", alpha2: "BJ", alpha3: "BEN" },
  "060": { name: "Bermuda", alpha2: "BM", alpha3: "BMU" },
  "064": { name: "Bhutan", alpha2: "BT", alpha3: "BTN" },
  "068": { name: "Bolivia (Plurinational State of)", alpha2: "BO", alpha3: "BOL" },
  "535": { name: "Bonaire, Sint Eustatius and Saba", alpha2: "BQ", alpha3: "BES" },
  "070": { name: "Bosnia and Herzegovina", alpha2: "BA", alpha3: "BIH" },
  "072": { name: "Botswana", alpha2: "BW", alpha3: "BWA" },
  "074": { name: "Bouvet Island", alpha2: "BV", alpha3: "BVT" },
  "076": { name: "Brazil", alpha2: "BR", alpha3: "BRA" },
  "086": { name: "British Indian Ocean Territory (the)", alpha2: "IO", alpha3: "IOT" },
  "096": { name: "Brunei Darussalam", alpha2: "BN", alpha3: "BRN" },
  "100": { name: "Bulgaria", alpha2: "BG", alpha3: "BGR" },
  "854": { name: "Burkina Faso", alpha2: "BF", alpha3: "BFA" },
  "108": { name: "Burundi", alpha2: "BI", alpha3: "BDI" },
  "132": { name: "Cabo Verde", alpha2: "CV", alpha3: "CPV" },
  "116": { name: "Cambodia", alpha2: "KH", alpha3: "KHM" },
  "120": { name: "Cameroon", alpha2: "CM", alpha3: "CMR" },
  "124": { name: "Canada", alpha2: "CA", alpha3: "CAN" },
  "136": { name: "Cayman Islands (the)", alpha2: "KY", alpha3: "CYM" },
  "140": { name: "Central African Republic (the)", alpha2: "CF", alpha3: "CAF" },
  "148": { name: "Chad", alpha2: "TD", alpha3: "TCD" },
  "152": { name: "Chile", alpha2: "CL", alpha3: "CHL" },
  "156": { name: "China", alpha2: "CN", alpha3: "CHN" },
  "162": { name: "Christmas Island", alpha2: "CX", alpha3: "CXR" },
  "166": { name: "Cocos (Keeling) Islands (the)", alpha2: "CC", alpha3: "CCK" },
  "170": { name: "Colombia", alpha2: "CO", alpha3: "COL" },
  "174": { name: "Comoros (the)", alpha2: "KM", alpha3: "COM" },
  "180": { name: "Congo (the Democratic Republic of the)", alpha2: "CD", alpha3: "COD" },
  "178": { name: "Congo (the)", alpha2: "CG", alpha3: "COG" },
  "184": { name: "Cook Islands (the)", alpha2: "CK", alpha3: "COK" },
  "188": { name: "Costa Rica", alpha2: "CR", alpha3: "CRI" },
  "191": { name: "Croatia", alpha2: "HR", alpha3: "HRV" },
  "192": { name: "Cuba", alpha2: "CU", alpha3: "CUB" },
  "531": { name: "Curaçao", alpha2: "CW", alpha3: "CUW" },
  "196": { name: "Cyprus", alpha2: "CY", alpha3: "CYP" },
  "203": { name: "Czechia", alpha2: "CZ", alpha3: "CZE" },
  "384": { name: "Côte d'Ivoire", alpha2: "CI", alpha3: "CIV" },
  "208": { name: "Denmark", alpha2: "DK", alpha3: "DNK" },
  "262": { name: "Djibouti", alpha2: "DJ", alpha3: "DJI" },
  "212": { name: "Dominica", alpha2: "DM", alpha3: "DMA" },
  "214": { name: "Dominican Republic (the)", alpha2: "DO", alpha3: "DOM" },
  "218": { name: "Ecuador", alpha2: "EC", alpha3: "ECU" },
  "818": { name: "Egypt", alpha2: "EG", alpha3: "EGY" },
  "222": { name: "El Salvador", alpha2: "SV", alpha3: "SLV" },
  "226": { name: "Equatorial Guinea", alpha2: "GQ", alpha3: "GNQ" },
  "232": { name: "Eritrea", alpha2: "ER", alpha3: "ERI" },
  "233": { name: "Estonia", alpha2: "EE", alpha3: "EST" },
  "748": { name: "Eswatini", alpha2: "SZ", alpha3: "SWZ" },
  "231": { name: "Ethiopia", alpha2: "ET", alpha3: "ETH" },
  "238": { name: "Falkland Islands (the) [Malvinas]", alpha2: "FK", alpha3: "FLK" },
  "234": { name: "Faroe Islands (the)", alpha2: "FO", alpha3: "FRO" },
  "242": { name: "Fiji", alpha2: "FJ", alpha3: "FJI" },
  "246": { name: "Finland", alpha2: "FI", alpha3: "FIN" },
  "250": { name: "France", alpha2: "FR", alpha3: "FRA" },
  "254": { name: "French Guiana", alpha2: "GF", alpha3: "GUF" },
  "258": { name: "French Polynesia", alpha2: "PF", alpha3: "PYF" },
  "260": { name: "French Southern Territories (the)", alpha2: "TF", alpha3: "ATF" },
  "266": { name: "Gabon", alpha2: "GA", alpha3: "GAB" },
  "270": { name: "Gambia (the)", alpha2: "GM", alpha3: "GMB" },
  "268": { name: "Georgia", alpha2: "GE", alpha3: "GEO" },
  "276": { name: "Germany", alpha2: "DE", alpha3: "DEU" },
  "288": { name: "Ghana", alpha2: "GH", alpha3: "GHA" },
  "292": { name: "Gibraltar", alpha2: "GI", alpha3: "GIB" },
  "300": { name: "Greece", alpha2: "GR", alpha3: "GRC" },
  "304": { name: "Greenland", alpha2: "GL", alpha3: "GRL" },
  "308": { name: "Grenada", alpha2: "GD", alpha3: "GRD" },
  "312": { name: "Guadeloupe", alpha2: "GP", alpha3: "GLP" },
  "316": { name: "Guam", alpha2: "GU", alpha3: "GUM" },
  "320": { name: "Guatemala", alpha2: "GT", alpha3: "GTM" },
  "831": { name: "Guernsey", alpha2: "GG", alpha3: "GGY" },
  "324": { name: "Guinea", alpha2: "GN", alpha3: "GIN" },
  "624": { name: "Guinea-Bissau", alpha2: "GW", alpha3: "GNB" },
  "328": { name: "Guyana", alpha2: "GY", alpha3: "GUY" },
  "332": { name: "Haiti", alpha2: "HT", alpha3: "HTI" },
  "334": { name: "Heard Island and McDonald Islands", alpha2: "HM", alpha3: "HMD" },
  "336": { name: "Holy See (the)", alpha2: "VA", alpha3: "VAT" },
  "340": { name: "Honduras", alpha2: "HN", alpha3: "HND" },
  "344": { name: "Hong Kong", alpha2: "HK", alpha3: "HKG" },
  "348": { name: "Hungary", alpha2: "HU", alpha3: "HUN" },
  "352": { name: "Iceland", alpha2: "IS", alpha3: "ISL" },
  "356": { name: "India", alpha2: "IN", alpha3: "IND" },
  "360": { name: "Indonesia", alpha2: "ID", alpha3: "IDN" },
  "364": { name: "Iran (Islamic Republic of)", alpha2: "IR", alpha3: "IRN" },
  "368": { name: "Iraq", alpha2: "IQ", alpha3: "IRQ" },
  "372": { name: "Ireland", alpha2: "IE", alpha3: "IRL" },
  "833": { name: "Isle of Man", alpha2: "IM", alpha3: "IMN" },
  "376": { name: "Israel", alpha2: "IL", alpha3: "ISR" },
  "380": { name: "Italy", alpha2: "IT", alpha3: "ITA" },
  "388": { name: "Jamaica", alpha2: "JM", alpha3: "JAM" },
  "392": { name: "Japan", alpha2: "JP", alpha3: "JPN" },
  "832": { name: "Jersey", alpha2: "JE", alpha3: "JEY" },
  "400": { name: "Jordan", alpha2: "JO", alpha3: "JOR" },
  "398": { name: "Kazakhstan", alpha2: "KZ", alpha3: "KAZ" },
  "404": { name: "Kenya", alpha2: "KE", alpha3: "KEN" },
  "296": { name: "Kiribati", alpha2: "KI", alpha3: "KIR" },
  "408": { name: "Korea (the Democratic People's Republic of)", alpha2: "KP", alpha3: "PRK" },
  "410": { name: "Korea (the Republic of)", alpha2: "KR", alpha3: "KOR" },
  "414": { name: "Kuwait", alpha2: "KW", alpha3: "KWT" },
  "417": { name: "Kyrgyzstan", alpha2: "KG", alpha3: "KGZ" },
  "418": { name: "Lao People's Democratic Republic (the)", alpha2: "LA", alpha3: "LAO" },
  "428": { name: "Latvia", alpha2: "LV", alpha3: "LVA" },
  "422": { name: "Lebanon", alpha2: "LB", alpha3: "LBN" },
  "426": { name: "Lesotho", alpha2: "LS", alpha3: "LSO" },
  "430": { name: "Liberia", alpha2: "LR", alpha3: "LBR" },
  "434": { name: "Libya", alpha2: "LY", alpha3: "LBY" },
  "438": { name: "Liechtenstein", alpha2: "LI", alpha3: "LIE" },
  "440": { name: "Lithuania", alpha2: "LT", alpha3: "LTU" },
  "442": { name: "Luxembourg", alpha2: "LU", alpha3: "LUX" },
  "446": { name: "Macao", alpha2: "MO", alpha3: "MAC" },
  "450": { name: "Madagascar", alpha2: "MG", alpha3: "MDG" },
  "454": { name: "Malawi", alpha2: "MW", alpha3: "MWI" },
  "458": { name: "Malaysia", alpha2: "MY", alpha3: "MYS" },
  "462": { name: "Maldives", alpha2: "MV", alpha3: "MDV" },
  "466": { name: "Mali", alpha2: "ML", alpha3: "MLI" },
  "470": { name: "Malta", alpha2: "MT", alpha3: "MLT" },
  "584": { name: "Marshall Islands (the)", alpha2: "MH", alpha3: "MHL" },
  "474": { name: "Martinique", alpha2: "MQ", alpha3: "MTQ" },
  "478": { name: "Mauritania", alpha2: "MR", alpha3: "MRT" },
  "480": { name: "Mauritius", alpha2: "MU", alpha3: "MUS" },
  "175": { name: "Mayotte", alpha2: "YT", alpha3: "MYT" },
  "484": { name: "Mexico", alpha2: "MX", alpha3: "MEX" },
  "583": { name: "Micronesia (Federated States of)", alpha2: "FM", alpha3: "FSM" },
  "498": { name: "Moldova (the Republic of)", alpha2: "MD", alpha3: "MDA" },
  "492": { name: "Monaco", alpha2: "MC", alpha3: "MCO" },
  "496": { name: "Mongolia", alpha2: "MN", alpha3: "MNG" },
  "499": { name: "Montenegro", alpha2: "ME", alpha3: "MNE" },
  "500": { name: "Montserrat", alpha2: "MS", alpha3: "MSR" },
  "504": { name: "Morocco", alpha2: "MA", alpha3: "MAR" },
  "508": { name: "Mozambique", alpha2: "MZ", alpha3: "MOZ" },
  "104": { name: "Myanmar", alpha2: "MM", alpha3: "MMR" },
  "516": { name: "Namibia", alpha2: "nan", alpha3: "NAM" },
  "520": { name: "Nauru", alpha2: "NR", alpha3: "NRU" },
  "524": { name: "Nepal", alpha2: "NP", alpha3: "NPL" },
  "528": { name: "Netherlands (Kingdom of the)", alpha2: "NL", alpha3: "NLD" },
  "540": { name: "New Caledonia", alpha2: "NC", alpha3: "NCL" },
  "554": { name: "New Zealand", alpha2: "NZ", alpha3: "NZL" },
  "558": { name: "Nicaragua", alpha2: "NI", alpha3: "NIC" },
  "562": { name: "Niger (the)", alpha2: "NE", alpha3: "NER" },
  "566": { name: "Nigeria", alpha2: "NG", alpha3: "NGA" },
  "570": { name: "Niue", alpha2: "NU", alpha3: "NIU" },
  "574": { name: "Norfolk Island", alpha2: "NF", alpha3: "NFK" },
  "807": { name: "North Macedonia", alpha2: "MK", alpha3: "MKD" },
  "580": { name: "Northern Mariana Islands (the)", alpha2: "MP", alpha3: "MNP" },
  "578": { name: "Norway", alpha2: "NO", alpha3: "NOR" },
  "512": { name: "Oman", alpha2: "OM", alpha3: "OMN" },
  "586": { name: "Pakistan", alpha2: "PK", alpha3: "PAK" },
  "585": { name: "Palau", alpha2: "PW", alpha3: "PLW" },
  "275": { name: "Palestine, State of", alpha2: "PS", alpha3: "PSE" },
  "591": { name: "Panama", alpha2: "PA", alpha3: "PAN" },
  "598": { name: "Papua New Guinea", alpha2: "PG", alpha3: "PNG" },
  "600": { name: "Paraguay", alpha2: "PY", alpha3: "PRY" },
  "604": { name: "Peru", alpha2: "PE", alpha3: "PER" },
  "608": { name: "Philippines (the)", alpha2: "PH", alpha3: "PHL" },
  "612": { name: "Pitcairn", alpha2: "PN", alpha3: "PCN" },
  "616": { name: "Poland", alpha2: "PL", alpha3: "POL" },
  "620": { name: "Portugal", alpha2: "PT", alpha3: "PRT" },
  "630": { name: "Puerto Rico", alpha2: "PR", alpha3: "PRI" },
  "634": { name: "Qatar", alpha2: "QA", alpha3: "QAT" },
  "642": { name: "Romania", alpha2: "RO", alpha3: "ROU" },
  "643": { name: "Russian Federation (the)", alpha2: "RU", alpha3: "RUS" },
  "646": { name: "Rwanda", alpha2: "RW", alpha3: "RWA" },
  "638": { name: "Réunion", alpha2: "RE", alpha3: "REU" },
  "652": { name: "Saint Barthélemy", alpha2: "BL", alpha3: "BLM" },
  "654": { name: "Saint Helena, Ascension and Tristan da Cunha", alpha2: "SH", alpha3: "SHN" },
  "659": { name: "Saint Kitts and Nevis", alpha2: "KN", alpha3: "KNA" },
  "662": { name: "Saint Lucia", alpha2: "LC", alpha3: "LCA" },
  "663": { name: "Saint Martin (French part)", alpha2: "MF", alpha3: "MAF" },
  "666": { name: "Saint Pierre and Miquelon", alpha2: "PM", alpha3: "SPM" },
  "670": { name: "Saint Vincent and the Grenadines", alpha2: "VC", alpha3: "VCT" },
  "882": { name: "Samoa", alpha2: "WS", alpha3: "WSM" },
  "674": { name: "San Marino", alpha2: "SM", alpha3: "SMR" },
  "678": { name: "Sao Tome and Principe", alpha2: "ST", alpha3: "STP" },
  "682": { name: "Saudi Arabia", alpha2: "SA", alpha3: "SAU" },
  "686": { name: "Senegal", alpha2: "SN", alpha3: "SEN" },
  "688": { name: "Serbia", alpha2: "RS", alpha3: "SRB" },
  "690": { name: "Seychelles", alpha2: "SC", alpha3: "SYC" },
  "694": { name: "Sierra Leone", alpha2: "SL", alpha3: "SLE" },
  "702": { name: "Singapore", alpha2: "SG", alpha3: "SGP" },
  "534": { name: "Sint Maarten (Dutch part)", alpha2: "SX", alpha3: "SXM" },
  "703": { name: "Slovakia", alpha2: "SK", alpha3: "SVK" },
  "705": { name: "Slovenia", alpha2: "SI", alpha3: "SVN" },
  "090": { name: "Solomon Islands", alpha2: "SB", alpha3: "SLB" },
  "706": { name: "Somalia", alpha2: "SO", alpha3: "SOM" },
  "710": { name: "South Africa", alpha2: "ZA", alpha3: "ZAF" },
  "239": { name: "South Georgia and the South Sandwich Islands", alpha2: "GS", alpha3: "SGS" },
  "728": { name: "South Sudan", alpha2: "SS", alpha3: "SSD" },
  "724": { name: "Spain", alpha2: "ES", alpha3: "ESP" },
  "144": { name: "Sri Lanka", alpha2: "LK", alpha3: "LKA" },
  "729": { name: "Sudan (the)", alpha2: "SD", alpha3: "SDN" },
  "740": { name: "Suriname", alpha2: "SR", alpha3: "SUR" },
  "744": { name: "Svalbard and Jan Mayen", alpha2: "SJ", alpha3: "SJM" },
  "752": { name: "Sweden", alpha2: "SE", alpha3: "SWE" },
  "756": { name: "Switzerland", alpha2: "CH", alpha3: "CHE" },
  "760": { name: "Syrian Arab Republic (the)", alpha2: "SY", alpha3: "SYR" },
  "158": { name: "Taiwan (Province of China)", alpha2: "TW", alpha3: "TWN" },
  "762": { name: "Tajikistan", alpha2: "TJ", alpha3: "TJK" },
  "834": { name: "Tanzania, the United Republic of", alpha2: "TZ", alpha3: "TZA" },
  "764": { name: "Thailand", alpha2: "TH", alpha3: "THA" },
  "626": { name: "Timor-Leste", alpha2: "TL", alpha3: "TLS" },
  "768": { name: "Togo", alpha2: "TG", alpha3: "TGO" },
  "772": { name: "Tokelau", alpha2: "TK", alpha3: "TKL" },
  "776": { name: "Tonga", alpha2: "TO", alpha3: "TON" },
  "780": { name: "Trinidad and Tobago", alpha2: "TT", alpha3: "TTO" },
  "788": { name: "Tunisia", alpha2: "TN", alpha3: "TUN" },
  "795": { name: "Turkmenistan", alpha2: "TM", alpha3: "TKM" },
  "796": { name: "Turks and Caicos Islands (the)", alpha2: "TC", alpha3: "TCA" },
  "798": { name: "Tuvalu", alpha2: "TV", alpha3: "TUV" },
  "792": { name: "Türkiye", alpha2: "TR", alpha3: "TUR" },
  "800": { name: "Uganda", alpha2: "UG", alpha3: "UGA" },
  "804": { name: "Ukraine", alpha2: "UA", alpha3: "UKR" },
  "784": { name: "United Arab Emirates (the)", alpha2: "AE", alpha3: "ARE" },
  "826": { name: "United Kingdom of Great Britain and Northern Ireland (the)", alpha2: "GB", alpha3: "GBR" },
  "581": { name: "United States Minor Outlying Islands (the)", alpha2: "UM", alpha3: "UMI" },
  "840": { name: "United States of America (the)", alpha2: "US", alpha3: "USA" },
  "858": { name: "Uruguay", alpha2: "UY", alpha3: "URY" },
  "860": { name: "Uzbekistan", alpha2: "UZ", alpha3: "UZB" },
  "548": { name: "Vanuatu", alpha2: "VU", alpha3: "VUT" },
  "862": { name: "Venezuela (Bolivarian Republic of)", alpha2: "VE", alpha3: "VEN" },
  "704": { name: "Viet Nam", alpha2: "VN", alpha3: "VNM" },
  "092": { name: "Virgin Islands (British)", alpha2: "VG", alpha3: "VGB" },
  "850": { name: "Virgin Islands (U.S.)", alpha2: "VI", alpha3: "VIR" },
  "876": { name: "Wallis and Futuna", alpha2: "WF", alpha3: "WLF" },
  "732": { name: "Western Sahara*", alpha2: "EH", alpha3: "ESH" },
  "887": { name: "Yemen", alpha2: "YE", alpha3: "YEM" },
  "894": { name: "Zambia", alpha2: "ZM", alpha3: "ZMB" },
  "716": { name: "Zimbabwe", alpha2: "ZW", alpha3: "ZWE" },
  "248": { name: "Åland Islands", alpha2: "AX", alpha3: "ALA" },
};

// Tooltip for 5F2A (Transaction Currency Code), 9F1A (Terminal Country Code), 5F28 (Issuer Country Code)
// Uses the existing countryCodeLookup table (numeric ISO 3166 keys as strings, e.g. "840", "826")
// Helper: find country by numeric hex value without numeric conversion.
// If ignoreFirstDigit is true and hex is 4 chars (e.g. "0036"), drop the first hex digit
// and use the remaining 3 chars directly as the lookup key (e.g. "036").
function lookupCountryByNumericHex(hexValue, ignoreFirstDigit = false) {
  if (!hexValue) return null;
  const raw = hexValue.toUpperCase();
  const keyRaw = (ignoreFirstDigit && raw.length === 4) ? raw.slice(1) : raw;
  // ensure 3-character key (preserve leading zeros from source)
  const key = keyRaw.padStart(3, '0');
  return countryCodeLookup[key] || null;
}

// --- AID lookup (use this fixed mapping) ---
let aidLookup = {
  "A0000000031010": { vendor: "VISA", name: "VISA Debit/Credit (Classic)" },
  "A0000000032010": { vendor: "VISA", name: "VISA Electron" },
  "A0000000032020": { vendor: "VISA", name: "VISA V PAY" },
  "A0000000033010": { vendor: "VISA", name: "VISA Interlink" },
  "A0000000036010": { vendor: "VISA", name: "Domestic Visa Cash Stored Value" },
  "A0000000036020": { vendor: "VISA", name: "International Visa Cash Stored Value" },
  "A0000000041010": { vendor: "MASTERCARD", name: "MasterCard Credit/Debit (Global)" },
  "A0000000043060": { vendor: "MASTERCARD", name: "Maestro (Debit)" },
  "A0000000046010": { vendor: "MASTERCARD", name: "Cirrus" },
  "A000000025010701": { vendor: "AMEX", name: "ExpressPay" },
  "A000000025": { vendor: "AMEX", name: "American Express" },
  "A0000000651010": { vendor: "JCB", name: "JCB J Smart Credit" },
  "A00000006510": { vendor: "JCB", name: "JCB" },
  "A0000001524010": { vendor: "DINERS", name: "Discover Debit Common Card" },
  "A0000001523010": { vendor: "DINERS", name: "Discover Card" },
  "A000000152": { vendor: "DISCOVER", name: "Discover Base AID" },
  "A000000333010101": { vendor: "UnionPay", name: "UnionPay Debit" },
  "A000000333010102": { vendor: "UnionPay", name: "UnionPay Credit" },
  "A000000333010103": { vendor: "UnionPay", name: "UnionPay Quasi Credit" },
  "A00000038410": { vendor: "EFTPOS", name: "Savings (debit card)" },
  "A00000038420": { vendor: "EFTPOS", name: "Cheque (debit card)" }
};

// longest-prefix AID lookup helper
function findAidInfo(aidHex) {
  if (!aidHex) return null;
  const hex = aidHex.toUpperCase();
  if (aidLookup[hex]) return { key: hex, info: aidLookup[hex] };
  // longest-prefix match
  const keys = Object.keys(aidLookup).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    if (hex.startsWith(k)) return { key: k, info: aidLookup[k] };
  }
  return null;
}

// --- Currency Code lookup (use this fixed mapping) ---
let currencyCodeLookup = {
  "978": { currency: "Euro", alpha: "EUR" },
  "008": { currency: "Lek", alpha: "ALL" },
  "012": { currency: "Algerian Dinar", alpha: "DZD" },
  "840": { currency: "US Dollar", alpha: "USD" },
  "973": { currency: "Kwanza", alpha: "AOA" },
  "951": { currency: "East Caribbean Dollar", alpha: "XCD" },
  "396": { currency: "Arab Accounting Dinar", alpha: "XAD" },
  "032": { currency: "Argentine Peso", alpha: "ARS" },
  "051": { currency: "Armenian Dram", alpha: "AMD" },
  "533": { currency: "Aruban Florin", alpha: "AWG" },
  "036": { currency: "Australian Dollar", alpha: "AUD" },
  "944": { currency: "Azerbaijan Manat", alpha: "AZN" },
  "044": { currency: "Bahamian Dollar", alpha: "BSD" },
  "048": { currency: "Bahraini Dinar", alpha: "BHD" },
  "050": { currency: "Taka", alpha: "BDT" },
  "052": { currency: "Barbados Dollar", alpha: "BBD" },
  "933": { currency: "Belarusian Ruble", alpha: "BYN" },
  "084": { currency: "Belize Dollar", alpha: "BZD" },
  "952": { currency: "CFA Franc BCEAO", alpha: "XOF" },
  "060": { currency: "Bermudian Dollar", alpha: "BMD" },
  "356": { currency: "Indian Rupee", alpha: "INR" },
  "064": { currency: "Ngultrum", alpha: "BTN" },
  "068": { currency: "Boliviano", alpha: "BOB" },
  "984": { currency: "Mvdol", alpha: "BOV" },
  "977": { currency: "Convertible Mark", alpha: "BAM" },
  "072": { currency: "Pula", alpha: "BWP" },
  "578": { currency: "Norwegian Krone", alpha: "NOK" },
  "986": { currency: "Brazilian Real", alpha: "BRL" },
  "096": { currency: "Brunei Dollar", alpha: "BND" },
  "975": { currency: "Bulgarian Lev", alpha: "BGN" },
  "108": { currency: "Burundi Franc", alpha: "BIF" },
  "132": { currency: "Cabo Verde Escudo", alpha: "CVE" },
  "116": { currency: "Riel", alpha: "KHR" },
  "950": { currency: "CFA Franc BEAC", alpha: "XAF" },
  "124": { currency: "Canadian Dollar", alpha: "CAD" },
  "136": { currency: "Cayman Islands Dollar", alpha: "KYD" },
  "152": { currency: "Chilean Peso", alpha: "CLP" },
  "990": { currency: "Unidad de Fomento", alpha: "CLF" },
  "156": { currency: "Yuan Renminbi", alpha: "CNY" },
  "170": { currency: "Colombian Peso", alpha: "COP" },
  "970": { currency: "Unidad de Valor Real", alpha: "COU" },
  "174": { currency: "Comorian Franc", alpha: "KMF" },
  "976": { currency: "Congolese Franc", alpha: "CDF" },
  "554": { currency: "New Zealand Dollar", alpha: "NZD" },
  "188": { currency: "Costa Rican Colon", alpha: "CRC" },
  "192": { currency: "Cuban Peso", alpha: "CUP" },
  "532": { currency: "Caribbean Guilder", alpha: "XCG" },
  "203": { currency: "Czech Koruna", alpha: "CZK" },
  "208": { currency: "Danish Krone", alpha: "DKK" },
  "262": { currency: "Djibouti Franc", alpha: "DJF" },
  "214": { currency: "Dominican Peso", alpha: "DOP" },
  "818": { currency: "Egyptian Pound", alpha: "EGP" },
  "222": { currency: "El Salvador Colon", alpha: "SVC" },
  "232": { currency: "Nakfa", alpha: "ERN" },
  "748": { currency: "Lilangeni", alpha: "SZL" },
  "230": { currency: "Ethiopian Birr", alpha: "ETB" },
  "238": { currency: "Falkland Islands Pound", alpha: "FKP" },
  "242": { currency: "Fiji Dollar", alpha: "FJD" },
  "953": { currency: "CFP Franc", alpha: "XPF" },
  "270": { currency: "Dalasi", alpha: "GMD" },
  "981": { currency: "Lari", alpha: "GEL" },
  "936": { currency: "Ghana Cedi", alpha: "GHS" },
  "292": { currency: "Gibraltar Pound", alpha: "GIP" },
  "320": { currency: "Quetzal", alpha: "GTQ" },
  "826": { currency: "Pound Sterling", alpha: "GBP" },
  "324": { currency: "Guinean Franc", alpha: "GNF" },
  "328": { currency: "Guyana Dollar", alpha: "GYD" },
  "332": { currency: "Gourde", alpha: "HTG" },
  "340": { currency: "Lempira", alpha: "HNL" },
  "344": { currency: "Hong Kong Dollar", alpha: "HKD" },
  "348": { currency: "Forint", alpha: "HUF" },
  "352": { currency: "Iceland Krona", alpha: "ISK" },
  "360": { currency: "Rupiah", alpha: "IDR" },
  "960": { currency: "SDR (Special Drawing Right)", alpha: "XDR" },
  "364": { currency: "Iranian Rial", alpha: "IRR" },
  "368": { currency: "Iraqi Dinar", alpha: "IQD" },
  "376": { currency: "New Israeli Sheqel", alpha: "ILS" },
  "388": { currency: "Jamaican Dollar", alpha: "JMD" },
  "392": { currency: "Yen", alpha: "JPY" },
  "400": { currency: "Jordanian Dinar", alpha: "JOD" },
  "398": { currency: "Tenge", alpha: "KZT" },
  "404": { currency: "Kenyan Shilling", alpha: "KES" },
  "408": { currency: "North Korean Won", alpha: "KPW" },
  "410": { currency: "Won", alpha: "KRW" },
  "414": { currency: "Kuwaiti Dinar", alpha: "KWD" },
  "417": { currency: "Som", alpha: "KGS" },
  "418": { currency: "Lao Kip", alpha: "LAK" },
  "422": { currency: "Lebanese Pound", alpha: "LBP" },
  "426": { currency: "Loti", alpha: "LSL" },
  "710": { currency: "Rand", alpha: "ZAR" },
  "430": { currency: "Liberian Dollar", alpha: "LRD" },
  "434": { currency: "Libyan Dinar", alpha: "LYD" },
  "756": { currency: "Swiss Franc", alpha: "CHF" },
  "446": { currency: "Pataca", alpha: "MOP" },
  "969": { currency: "Malagasy Ariary", alpha: "MGA" },
  "454": { currency: "Malawi Kwacha", alpha: "MWK" },
  "458": { currency: "Malaysian Ringgit", alpha: "MYR" },
  "462": { currency: "Rufiyaa", alpha: "MVR" },
  "929": { currency: "Ouguiya", alpha: "MRU" },
  "480": { currency: "Mauritius Rupee", alpha: "MUR" },
  "965": { currency: "ADB Unit of Account", alpha: "XUA" },
  "484": { currency: "Mexican Peso", alpha: "MXN" },
  "979": { currency: "Mexican Unidad de Inversion (UDI)", alpha: "MXV" },
  "498": { currency: "Moldovan Leu", alpha: "MDL" },
  "496": { currency: "Tugrik", alpha: "MNT" },
  "504": { currency: "Moroccan Dirham", alpha: "MAD" },
  "943": { currency: "Mozambique Metical", alpha: "MZN" },
  "104": { currency: "Kyat", alpha: "MMK" },
  "516": { currency: "Namibia Dollar", alpha: "NAD" },
  "524": { currency: "Nepalese Rupee", alpha: "NPR" },
  "558": { currency: "Cordoba Oro", alpha: "NIO" },
  "566": { currency: "Naira", alpha: "NGN" },
  "807": { currency: "Denar", alpha: "MKD" },
  "512": { currency: "Rial Omani", alpha: "OMR" },
  "586": { currency: "Pakistan Rupee", alpha: "PKR" },
  "590": { currency: "Balboa", alpha: "PAB" },
  "598": { currency: "Kina", alpha: "PGK" },
  "600": { currency: "Guarani", alpha: "PYG" },
  "604": { currency: "Sol", alpha: "PEN" },
  "608": { currency: "Philippine Peso", alpha: "PHP" },
  "985": { currency: "Zloty", alpha: "PLN" },
  "634": { currency: "Qatari Rial", alpha: "QAR" },
  "946": { currency: "Romanian Leu", alpha: "RON" },
  "643": { currency: "Russian Ruble", alpha: "RUB" },
  "646": { currency: "Rwanda Franc", alpha: "RWF" },
  "654": { currency: "Saint Helena Pound", alpha: "SHP" },
  "882": { currency: "Tala", alpha: "WST" },
  "930": { currency: "Dobra", alpha: "STN" },
  "682": { currency: "Saudi Riyal", alpha: "SAR" },
  "941": { currency: "Serbian Dinar", alpha: "RSD" },
  "690": { currency: "Seychelles Rupee", alpha: "SCR" },
  "925": { currency: "Leone", alpha: "SLE" },
  "702": { currency: "Singapore Dollar", alpha: "SGD" },
  "994": { currency: "Sucre", alpha: "XSU" },
  "090": { currency: "Solomon Islands Dollar", alpha: "SBD" },
  "706": { currency: "Somali Shilling", alpha: "SOS" },
  "728": { currency: "South Sudanese Pound", alpha: "SSP" },
  "144": { currency: "Sri Lanka Rupee", alpha: "LKR" },
  "938": { currency: "Sudanese Pound", alpha: "SDG" },
  "968": { currency: "Surinam Dollar", alpha: "SRD" },
  "752": { currency: "Swedish Krona", alpha: "SEK" },
  "947": { currency: "WIR Euro", alpha: "CHE" },
  "948": { currency: "WIR Franc", alpha: "CHW" },
  "760": { currency: "Syrian Pound", alpha: "SYP" },
  "901": { currency: "New Taiwan Dollar", alpha: "TWD" },
  "972": { currency: "Somoni", alpha: "TJS" },
  "834": { currency: "Tanzanian Shilling", alpha: "TZS" },
  "764": { currency: "Baht", alpha: "THB" },
  "776": { currency: "Pa’anga", alpha: "TOP" },
  "780": { currency: "Trinidad and Tobago Dollar", alpha: "TTD" },
  "788": { currency: "Tunisian Dinar", alpha: "TND" },
  "949": { currency: "Turkish Lira", alpha: "TRY" },
  "934": { currency: "Turkmenistan New Manat", alpha: "TMT" },
  "800": { currency: "Uganda Shilling", alpha: "UGX" },
  "980": { currency: "Hryvnia", alpha: "UAH" },
  "784": { currency: "UAE Dirham", alpha: "AED" },
  "997": { currency: "US Dollar (Next day)", alpha: "USN" },
  "858": { currency: "Peso Uruguayo", alpha: "UYU" },
  "940": { currency: "Uruguay Peso en Unidades Indexadas (UI)", alpha: "UYI" },
  "927": { currency: "Unidad Previsional", alpha: "UYW" },
  "860": { currency: "Uzbekistan Sum", alpha: "UZS" },
  "548": { currency: "Vatu", alpha: "VUV" },
  "928": { currency: "Bolívar Soberano", alpha: "VES" },
  "926": { currency: "Bolívar Soberano", alpha: "VED" },
  "704": { currency: "Dong", alpha: "VND" },
  "886": { currency: "Yemeni Rial", alpha: "YER" },
  "967": { currency: "Zambian Kwacha", alpha: "ZMW" },
  "924": { currency: "Zimbabwe Gold", alpha: "ZWG" },
  "955": { currency: "Bond Markets Unit European Composite Unit (EURCO)", alpha: "XBA" },
  "956": { currency: "Bond Markets Unit European Monetary Unit (E.M.U.-6)", alpha: "XBB" },
  "957": { currency: "Bond Markets Unit European Unit of Account 9 (E.U.A.-9)", alpha: "XBC" },
  "958": { currency: "Bond Markets Unit European Unit of Account 17 (E.U.A.-17)", alpha: "XBD" },
  "963": { currency: "Codes specifically reserved for testing purposes", alpha: "XTS" },
  "999": { currency: "The codes assigned for transactions where no currency is involved", alpha: "XXX" },
  "959": { currency: "Gold", alpha: "XAU" },
  "964": { currency: "Palladium", alpha: "XPD" },
  "962": { currency: "Platinum", alpha: "XPT" },
  "961": { currency: "Silver", alpha: "XAG" },
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

    // 9F1A - Terminal Country Code (ISO 3166 numeric, value often encoded as 2 or 4 hex chars)
    if (tag.toUpperCase() === "9F1A" && (value.length === 2 || value.length === 4)) {
      const raw = value.toUpperCase();
      // per request: if 4-hex chars like "0036" -> use "036" as lookup key
      const country = lookupCountryByNumericHex(raw, true);
      const details = country
        ? `<div><strong>Country:</strong> ${country.name}</div><div><strong>Alpha-2 / Alpha-3:</strong> ${country.alpha2} / ${country.alpha3}</div>`
        : `<div style="color:#666"><em>Country code not found in lookup table</em></div>`;
      const tooltipHtml = `<div style="font-family:monospace; font-size:12px; color:black; max-width:360px;">
        <strong>Terminal Country Code (ISO 3166 numeric)</strong><br>
        Raw hex: ${raw}<br>
        ${details}
      </div>`;

      valueDisplay = `<span class="cvm-tooltip" style="cursor:pointer;position:relative;"
        onmouseover="showCVMTooltip(this, event)" onmouseout="hideCVMTooltip(this, event)">
        ${value}
        <span class="cvm-tooltip-box" style="display:none;position:fixed;z-index:9999;background:#fff;border:1px solid #ccc;padding:8px;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.15);white-space:nowrap;color:black;">${tooltipHtml}</span>
      </span>`;
    }

    // 5F28 - Issuer Country Code (ISO 3166 numeric)
    if (tag.toUpperCase() === "5F28" && (value.length === 2 || value.length === 4)) {
      const raw = value.toUpperCase();
      // per request: if 4-hex chars like "0036" -> use "036" as lookup key
      const country = lookupCountryByNumericHex(raw, true);
      const details = country
        ? `<div><strong>Country:</strong> ${country.name}</div><div><strong>Alpha-2 / Alpha-3:</strong> ${country.alpha2} / ${country.alpha3}</div>`
        : `<div style="color:#666"><em>Country code not found in lookup table</em></div>`;
      const tooltipHtml = `<div style="font-family:monospace; font-size:12px; color:black; max-width:360px;">
        <strong>Issuer Country Code (ISO 3166 numeric)</strong><br>
        Raw hex: ${raw}<br>
        ${details}
      </div>`;

      valueDisplay = `<span class="cvm-tooltip" style="cursor:pointer;position:relative;"
        onmouseover="showCVMTooltip(this, event)" onmouseout="hideCVMTooltip(this, event)">
        ${value}
        <span class="cvm-tooltip-box" style="display:none;position:fixed;z-index:9999;background:#fff;border:1px solid #ccc;padding:8px;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.15);white-space:nowrap;color:black;">${tooltipHtml}</span>
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

    // Tooltip for 9F06 (Application Identifier - AID)
    if (tag.toUpperCase() === "9F06") {
      const aidHex = value.toUpperCase();
      const match = findAidInfo(aidHex);
      let detailsHtml = "";
      if (match && match.info) {
        detailsHtml += `<div><strong>Vendor:</strong> ${match.info.vendor}</div>`;
        detailsHtml += `<div><strong>Name:</strong> ${match.info.name}</div>`;
        if (match.key !== aidHex) {
          detailsHtml += `<div style="font-size:11px;color:#666;margin-top:6px;">Matched AID prefix: ${match.key}</div>`;
        }
      } else {
        detailsHtml = `<div style="color:#666;"><em>Vendor / name not found in local lookup</em></div>`;
      }

      const tooltipHtml = `<div style="font-family:monospace; font-size:12px; color:black; max-width:360px;">
        <strong>AID</strong><br>
        ${aidHex}
        <div style="height:8px;"></div>
        ${detailsHtml}
      </div>`;

      valueDisplay = `<span class="cvm-tooltip" style="cursor:pointer;position:relative;"
        onmouseover="showCVMTooltip(this, event)"
        onmouseout="hideCVMTooltip(this)">
        ${value}
        <span class="cvm-tooltip-box" style="display:none;position:fixed;z-index:9999;background:#fff;border:1px solid #ccc;padding:8px;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.15);white-space:nowrap;color:black;">${tooltipHtml}</span>
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

    // Tooltip for 9F33 (Terminal Capabilities) - checklist using EMV Table mappings
    if (tag.toUpperCase() === "9F33" && value.length === 6) {
      const byte1 = value.slice(0, 2).toUpperCase();
      const byte2 = value.slice(2, 4).toUpperCase();
      const byte3 = value.slice(4, 6).toUpperCase();
      const bin1 = parseInt(byte1, 16).toString(2).padStart(8, '0');
      const bin2 = parseInt(byte2, 16).toString(2).padStart(8, '0');
      const bin3 = parseInt(byte3, 16).toString(2).padStart(8, '0');

      // EMV Table mappings (Table 25-27) - per-bit checklist labels
      const tcapByte1 = [
        "Bit 8: Manual key entry",
        "Bit 7: Magnetic stripe",
        "Bit 6: IC with contacts (contact ICC)",
        "Bit 5: RFU",
        "Bit 4: RFU",
        "Bit 3: RFU",
        "Bit 2: RFU",
        "Bit 1: RFU"
      ];

      const tcapByte2 = [
        "Bit 8: Plaintext PIN for ICC verification",
        "Bit 7: Enciphered PIN for online verification",
        "Bit 6: Signature (paper)",
        "Bit 5: Enciphered PIN for offline verification",
        "Bit 4: No CVM required",
        "Bit 3: RFU",
        "Bit 2: RFU",
        "Bit 1: RFU"
      ];

      const tcapByte3 = [
        "Bit 8: SDA supported",
        "Bit 7: DDA supported",
        "Bit 6: Card capture (cardholder capture capability)",
        "Bit 5: RFU",
        "Bit 4: CDA supported",
        "Bit 3: RFU",
        "Bit 2: RFU",
        "Bit 1: RFU"
      ];

      // Build tooltip as two columns: left = byte1 + byte2, right = byte3
      let tooltipHtml = `<div style="font-family:monospace; font-size:12px; color:black; max-width:600px;">`;
      tooltipHtml += `<div style="display:flex; gap:12px; align-items:flex-start;">`;

      // Left column (Byte1 + Byte2)
      tooltipHtml += `<div style="flex:1; min-width:260px;">`;
      tooltipHtml += `<strong>Byte 1 (${byte1}) — Card data input capability:</strong>
        <div style="height:6px;"></div>
        <div style="display:grid; grid-template-columns: auto 1fr; gap:6px; margin-bottom:10px;">`;
      for (let k = 0; k < 8; k++) {
        tooltipHtml += `<div style="display:contents;">
            <input type="checkbox" disabled ${bin1[k] === "1" ? "checked" : ""} style="accent-color:black;margin-right:6px;">
            <label style="color:black;">${tcapByte1[k]}</label>
          </div>`;
      }
      tooltipHtml += `</div>`;

      tooltipHtml += `<strong>Byte 2 (${byte2}) — CVM capability:</strong>
        <div style="height:6px;"></div>
        <div style="display:grid; grid-template-columns: auto 1fr; gap:6px; margin-bottom:6px;">`;
      for (let k = 0; k < 8; k++) {
        tooltipHtml += `<div style="display:contents;">
            <input type="checkbox" disabled ${bin2[k] === "1" ? "checked" : ""} style="accent-color:black;margin-right:6px;">
            <label style="color:black;">${tcapByte2[k]}</label>
          </div>`;
      }
      tooltipHtml += `</div></div>`; // end left column

      // Right column (Byte3)
      tooltipHtml += `<div style="flex:1; min-width:200px;">`;
      tooltipHtml += `<strong>Byte 3 (${byte3}) — Security capability:</strong>
        <div style="height:6px;"></div>
        <div style="display:grid; grid-template-columns: auto 1fr; gap:6px;">`;
      for (let k = 0; k < 8; k++) {
        tooltipHtml += `<div style="display:contents;">
            <input type="checkbox" disabled ${bin3[k] === "1" ? "checked" : ""} style="accent-color:black;margin-right:6px;">
            <label style="color:black;">${tcapByte3[k]}</label>
          </div>`;
      }
      tooltipHtml += `</div></div>`; // end right column

      tooltipHtml += `</div></div>`; // end columns and tooltip container

      valueDisplay = `<span class="cvm-tooltip" style="cursor:pointer;position:relative;"
        onmouseover="showCVMTooltip(this, event)"
        onmouseout="hideCVMTooltip(this)">
          ${value}
          <span class="cvm-tooltip-box" style="display:none;position:fixed;z-index:9999;background:#fff;border:1px solid #ccc;padding:10px;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.15);white-space:normal;max-width:600px;color:black;">${tooltipHtml}</span>
      </span>`;
    }

    // Tooltip for 9F40 (Additional Terminal Capabilities) - 3 columns:
    // col1 = Byte1 + Byte2, col2 = Byte3 + Byte4, col3 = Byte5
    if (tag.toUpperCase() === "9F40" && value.length === 10) {
      const bytes = [
        value.slice(0, 2),
        value.slice(2, 4),
        value.slice(4, 6),
        value.slice(6, 8),
        value.slice(8, 10)
      ];
      const bins = bytes.map(b => parseInt(b, 16).toString(2).padStart(8, '0'));

      // EMV A3 Additional Terminal Capabilities - per‑bit labels (Table 28..32)
      const atcLabels = [
        // Byte 1: Transaction Type Capability
        [
          "Bit 8: Cash",
          "Bit 7: Goods",
          "Bit 6: Services",
          "Bit 5: Cashback",
          "Bit 4: Inquiry",
          "Bit 3: Transfer",
          "Bit 2: Payment",
          "Bit 1: Administrative"
        ],
        // Byte 2: Transaction Type Capability (additional)
        [
          "Bit 8: Cash deposit",
          "Bit 7: RFU",
          "Bit 6: RFU",
          "Bit 5: RFU",
          "Bit 4: RFU",
          "Bit 3: RFU",
          "Bit 2: RFU",
          "Bit 1: RFU"
        ],
        // Byte 3: Terminal Data Input Capability
        [
          "Bit 8: Numeric keys",
          "Bit 7: Alphabetic & special characters keys",
          "Bit 6: Command keys",
          "Bit 5: Function keys",
          "Bit 4: RFU",
          "Bit 3: RFU",
          "Bit 2: RFU",
          "Bit 1: RFU"
        ],
        // Byte 4: Terminal Data Output Capability (print/display/code table flags)
        [
          "Bit 8: Print, attendant",
          "Bit 7: Print, cardholder",
          "Bit 6: Display, attendant",
          "Bit 5: Display, cardholder",
          "Bit 4: RFU",
          "Bit 3: RFU",
          "Bit 2: Code table 10",
          "Bit 1: Code table 9"
        ],
        // Byte 5: Terminal Data Output Capability - code table selection
        [
          "Bit 8: Code table 8",
          "Bit 7: Code table 7",
          "Bit 6: Code table 6",
          "Bit 5: Code table 5",
          "Bit 4: Code table 4",
          "Bit 3: Code table 3",
          "Bit 2: Code table 2",
          "Bit 1: Code table 1"
        ]
      ];

      // Build tooltipHtml with three columns
      let tooltipHtml = `<div style="font-family:monospace; font-size:12px; color:black; max-width:760px;">`;
      tooltipHtml += `<div style="display:flex; gap:12px; align-items:flex-start;">`;

      // Column 1: Byte1 + Byte2
      tooltipHtml += `<div style="flex:1; min-width:220px;">`;
      // Byte1
      tooltipHtml += `<strong>Byte 1 (${bytes[0]}) — Transaction type:</strong>
        <div style="height:6px;"></div>
        <div style="display:grid; grid-template-columns: auto 1fr; gap:6px; margin-bottom:10px;">`;
      for (let k = 0; k < 8; k++) {
        tooltipHtml += `<div style="display:contents;">
          <input type="checkbox" disabled ${bins[0][k] === "1" ? "checked" : ""} style="accent-color:black;margin-right:6px;">
          <label style="color:black;">${atcLabels[0][k]}</label>
        </div>`;
      }
      tooltipHtml += `</div>`;
      // Byte2
      tooltipHtml += `<strong>Byte 2 (${bytes[1]}) — Transaction type (cont):</strong>
        <div style="height:6px;"></div>
        <div style="display:grid; grid-template-columns: auto 1fr; gap:6px;">`;
      for (let k = 0; k < 8; k++) {
        tooltipHtml += `<div style="display:contents;">
          <input type="checkbox" disabled ${bins[1][k] === "1" ? "checked" : ""} style="accent-color:black;margin-right:6px;">
          <label style="color:black;">${atcLabels[1][k]}</label>
        </div>`;
      }
      tooltipHtml += `</div></div>`; // end column 1

      // Column 2: Byte3 + Byte4
      tooltipHtml += `<div style="flex:1; min-width:220px;">`;
      // Byte3
      tooltipHtml += `<strong>Byte 3 (${bytes[2]}) — Terminal data input capability:</strong>
        <div style="height:6px;"></div>
        <div style="display:grid; grid-template-columns: auto 1fr; gap:6px; margin-bottom:10px;">`;
      for (let k = 0; k < 8; k++) {
        tooltipHtml += `<div style="display:contents;">
          <input type="checkbox" disabled ${bins[2][k] === "1" ? "checked" : ""} style="accent-color:black;margin-right:6px;">
          <label style="color:black;">${atcLabels[2][k]}</label>
        </div>`;
      }
      tooltipHtml += `</div>`;
      // Byte4
      tooltipHtml += `<strong>Byte 4 (${bytes[3]}) — Terminal data output capability:</strong>
        <div style="height:6px;"></div>
        <div style="display:grid; grid-template-columns: auto 1fr; gap:6px;">`;
      for (let k = 0; k < 8; k++) {
        tooltipHtml += `<div style="display:contents;">
          <input type="checkbox" disabled ${bins[3][k] === "1" ? "checked" : ""} style="accent-color:black;margin-right:6px;">
          <label style="color:black;">${atcLabels[3][k]}</label>
        </div>`;
      }
      tooltipHtml += `</div></div>`; // end column 2

      // Column 3: Byte5
      tooltipHtml += `<div style="flex:0 0 200px; min-width:200px;">`;
      tooltipHtml += `<strong>Byte 5 (${bytes[4]}) — Output code table selection:</strong>
        <div style="height:6px;"></div>
        <div style="display:grid; grid-template-columns: auto 1fr; gap:6px;">`;
      for (let k = 0; k < 8; k++) {
        tooltipHtml += `<div style="display:contents;">
          <input type="checkbox" disabled ${bins[4][k] === "1" ? "checked" : ""} style="accent-color:black;margin-right:6px;">
          <label style="color:black;">${atcLabels[4][k]}</label>
        </div>`;
      }
      tooltipHtml += `</div></div>`; // end column 3

      tooltipHtml += `</div></div>`; // end flex container and outer

      valueDisplay = `<span class="cvm-tooltip" style="cursor:pointer;position:relative;"
        onmouseover="showCVMTooltip(this, event)"
        onmouseout="hideCVMTooltip(this)">
        ${value}
        <span class="cvm-tooltip-box" style="display:none;position:fixed;z-index:9999;background:#fff;border:1px solid #ccc;padding:10px;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.15);white-space:normal;max-width:760px;color:black;">${tooltipHtml}</span>
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
