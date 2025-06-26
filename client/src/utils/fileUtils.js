// src/utils/fileUtils.js

export const readFileAsText = (fileObject) => {
  return new Promise((resolve, reject) => {
    if (!fileObject) {
      return reject(new Error("No file object provided to readFileAsText."));
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target.result);
    };
    reader.onerror = (errorEvent) => {
      console.error("Error reading file:", errorEvent);
      reject(new Error(`Error reading file: ${fileObject.name}`));
    };
    reader.readAsText(fileObject);
  });
};

export const createJsonFile = (jsonData, filename) => {
  if (typeof jsonData !== 'object' || jsonData === null) {
    throw new Error("Invalid jsonData: Must be an object.");
  }
  if (typeof filename !== 'string' || filename.trim() === '') {
    throw new Error("Invalid filename: Must be a non-empty string.");
  }
  const jsonString = JSON.stringify(jsonData, null, 2); 
  const blob = new Blob([jsonString], { type: 'application/json' });
  return new File([blob], filename, { type: 'application/json' });
};

export const downloadFile = (content, fileName, contentType) => { // <<< EXPORTED HERE
  const a = document.createElement("a");
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
  // console.log(`File "${fileName}" download initiated locally (from util).`); // Optional logging
};
