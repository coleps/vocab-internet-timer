import {defaultSettings} from "./defaultSettings.js";

const timerLengthInput = document.querySelector("#timer-length");
const fixedNumWordsCheckbox = document.querySelector("#show-fixed-num");
const numWordsToShowInput = document.querySelector("#num-words");
const defCoverCheckbox = document.querySelector("#hide-def-checkbox");

chrome.storage.local.get("settings", (result) => {
  var settings = Object.values(result)[0] || defaultSettings.settings;
  const timerLength = settings.timerLength;
  const showFixedNumWords = settings.showFixedNumWords;
  const fixedNumWords = settings.fixedNumWords;
  const hideDefs = settings.hideDefinition;
  
  timerLengthInput.value = timerLength;
  if(showFixedNumWords === "true") fixedNumWordsCheckbox.checked = true;
  else fixedNumWordsCheckbox.checked = false;
  numWordsToShowInput.value = fixedNumWords;
  if(hideDefs === "true") defCoverCheckbox.checked = true;
  else defCoverCheckbox.checked = false;
});

timerLengthInput.addEventListener("input", (event) => {
  // console.log("num:", parseInt(event.target.value) || -1);
  const length = parseInt(event.target.value) || -1;

  if(length < 1) return;

  chrome.storage.local.get("settings", (result) => {
    var settings = Object.values(result)[0] || defaultSettings.settings;
    settings.timerLength = length;
    chrome.storage.local.set({settings : settings});
  });
});

fixedNumWordsCheckbox.addEventListener("change", (event)=>{
  chrome.storage.local.get("settings", (result) => {
    var settings = Object.values(result)[0] || defaultSettings.settings;
    if(event.target.checked){
      settings.showFixedNumWords = "true";
    }
    else settings.showFixedNumWords = "false";
    chrome.storage.local.set({settings : settings});
  });
});

numWordsToShowInput.addEventListener("input", (event) => {
  // console.log("num:", parseInt(event.target.value) || -1);
  const num = parseInt(event.target.value) || -1;

  if(num < 1) return;

  chrome.storage.local.get("settings", (result) => {
    var settings = Object.values(result)[0] || defaultSettings.settings;
    settings.fixedNumWords = num;
    chrome.storage.local.set({settings : settings});
  });
});

defCoverCheckbox.addEventListener("change", (event)=>{
  chrome.storage.local.get("settings", (result) => {
    var settings = Object.values(result)[0] || defaultSettings.settings;
    if(event.target.checked){
      settings.hideDefinition = "true";
    }
    else settings.hideDefinition = "false";
    chrome.storage.local.set({settings : settings});
  });
});