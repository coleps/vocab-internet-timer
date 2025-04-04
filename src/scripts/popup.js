import {defaultSettings} from "./defaultSettings.js";

// chrome.storage.local.set({"wordList" : ["one","two","three","four","five"]});
chrome.storage.local.set({"numPopupWords" : -1});
chrome.storage.local.get(console.log)
// console.log(chrome.runtime.id);


const title = document.querySelector("#title");
const definition = document.querySelector("#definition");
const defArea = document.querySelector("#definition-area");
const wordNum = document.querySelector("#word-number");
const defCover = document.querySelector("#def-cover");

var data = {
  numWordsShown: 0,
  wordDeleted: false
}

generateCard();

function generateCard(){
  data.wordDeleted = false;
  title.style.setProperty("text-decoration", "none");
  definition.style.setProperty("text-decoration", "none");

  data.numWordsShown++;

  chrome.storage.local.get("wordList", (result) => {
    var wordList = Object.values(result)[0] || [];
    
    if(wordList.length === 0){
      title.textContent = "...";
      definition.textContent = "There are no words in your word list yet. Add words in settings or by right-clicking on a word and selecting this extension's menu option.";
    }
    else{
      chrome.storage.local.get("wordQueue", (result) => {
        var wordQueue = Object.values(result)[0] || [];
        // console.log(wordQueue.length);
        // console.log(Object.values(result)[0]);
        chrome.storage.local.get(console.log);
        if(wordQueue.length === 0){
          wordQueue = shuffleArray(wordList);
        }
        var word = wordQueue.pop();
        console.log(word);
        title.textContent = word.split(":")[0];
        if(!generateUserDefinition(word)) generateDefinition(word);
        chrome.storage.local.set({"wordQueue" : wordQueue});
      });
    }
    
    chrome.storage.local.get("settings", (result) => {
      var settings = Object.values(result)[0] || defaultSettings.settings;
      if(settings.showFixedNumWords === "false" || wordList.length === 0) wordNum.style.opacity = 0;
      else{
        wordNum.textContent = data.numWordsShown + "/" + settings.fixedNumWords;
      }
      if(settings.showFixedNumWords === "true" && settings.fixedNumWords === data.numWordsShown){
        nextButton.classList.add("invisible-button");
      }
      
      if(settings.hideDefinition === "true"){
        defCover.classList.remove("hidden");
        defArea.classList.add("hidden");
      }
      else{
        defCover.classList.add("hidden");
        defArea.classList.remove("hidden");
      }
    });
  });
  

}

const nextButton = document.querySelector("#next-button");
nextButton.addEventListener("click", async ()=>{
  console.log("clicked");
  generateCard();
});


defCover.addEventListener("click", async ()=>{
  defCover.classList.add("hidden");
  defArea.classList.remove("hidden");
});

chrome.storage.local.get("timerOn", async (result) => {
  const img = timerButton.querySelector("img");
  const timerOn = Object.values(result)[0] || "true";
  if(timerOn === "true"){
    img.style.opacity = "1";
  }
  else{
    img.style.opacity = "0.3";
  }
});

const timerButton = document.querySelector("#timer-button");
timerButton.addEventListener("click", async ()=>{
  chrome.storage.local.get("timerOn", (result) => {
    const timerOn = Object.values(result)[0] || "true";
    const img = timerButton.querySelector("img");
    if(timerOn === "true"){
      img.style.opacity = "0.3";
      chrome.storage.local.set({"timerOn" : "false"});
    }
    else{
      img.style.opacity = "1";
      chrome.storage.local.set({"timerOn" : "true"});
    }
  })
});

const deleteButton = document.querySelector("#delete-button");
deleteButton.addEventListener("click", async ()=>{
  // if(wordDeleted || wordList.length === 0) return;
  const word = title.textContent;
  if(data.wordDeleted) return;

  const dialogTemplate = document.querySelector("#dialog-template");
  const clone = dialogTemplate.content.cloneNode(true);
  document.body.appendChild(clone);
  
  const confirmDeleteButton = document.querySelector("#no-button");
  confirmDeleteButton.addEventListener("click", async ()=>{
    console.log("no pressed");
    const dialog = document.querySelector("#dialog");
    dialog.remove();
  });
  
  const denyDeleteButton = document.querySelector("#yes-button");
  denyDeleteButton.addEventListener("click", async ()=>{
    data.wordDeleted = true;
    console.log("yes pressed");
    const dialog = document.querySelector("#dialog");
    dialog.remove();
    
    title.style.setProperty("text-decoration", "line-through");
    
    definition.style.setProperty("text-decoration", "line-through");

    chrome.storage.local.get("wordList", (result) => {
      var wordList = Object.values(result)[0] || [];
      const index = wordList.indexOf(word);
      if(index > -1) wordList.splice(index,1);
  
      chrome.storage.local.get("wordQueue", (result) => {
        var wordQueue = Object.values(result)[0] || [];
        const index = wordQueue.indexOf(word);
        if(index > -1) wordQueue.splice(index,1);
        chrome.storage.local.set({"wordQueue" : wordQueue});
      });
  
      chrome.storage.local.set({"wordList": wordList}, async ()=>{
        const url = "chrome-extension://" + chrome.runtime.id + "/settings/word-list.html";
        const [tab] = await chrome.tabs.query({url: url});
        if (tab != null){
          const response = await chrome.tabs.sendMessage(tab.id, {action: "delete", word: word});
          console.log(response);
        }
      });
    });

  });
});

const settingsButton = document.querySelector("#settings-button");
settingsButton.addEventListener("click", async ()=>{
  const url = "chrome-extension://" + chrome.runtime.id + "/*";
  const tabs = await chrome.tabs.query({url : url});
  if(tabs.length > 0){
    await chrome.tabs.update(tabs[0].id, { active: true });
    await chrome.windows.update(tabs[0].windowId, { focused: true });
  }
  else{
    chrome.tabs.create({url: "../settings/settings.html"});
  }

  // if (chrome.runtime.openOptionsPage) {
  //   chrome.runtime.openOptionsPage();
  // } else {
  //   window.open(chrome.runtime.getURL('../settings/settings.html'));
  // }
});

defArea.addEventListener("scroll", ()=>{
  let element = defArea;
  if (Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 1)
    {
        defArea.classList.remove("shadow");
    }else{
        defArea.classList.add("shadow");
    }
});

async function generateDefinition(word){
  while (defArea.firstChild) {
    defArea.removeChild(defArea.firstChild);
  }

  try{
    const url = "https://api.dictionaryapi.dev/api/v2/entries/en/" + word;
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);
    var defList = [];
    data.forEach((word)=>{

      word.meanings.forEach((meaning)=>{
        const partOfSpeech = meaning.partOfSpeech;

        var definitions = [];

        meaning.definitions.forEach((definition)=>{
          definitions.push(definition.definition);
        })
        var hasPartOfSpeech = false;
        defList.forEach((element)=>{
          if(element.partOfSpeech === partOfSpeech){
            element.definitions.push(...definitions);
            hasPartOfSpeech = true;
          }
        });
        if(!hasPartOfSpeech) defList.push({partOfSpeech : partOfSpeech, definitions : definitions});

      })
    });

    console.log(defList);
    defList.forEach((elem)=>{
      const dialogTemplate = document.querySelector("#definition-section-template");
      const clone = dialogTemplate.content.cloneNode(true);
      const partOfSpeech = elem.partOfSpeech;
      const defs = elem.definitions;
      const partOfSpeechText = clone.children[0];
      partOfSpeechText.classList.add("part-of-speech");
      const ul = document.createElement('ul');
      ul.classList.add("def-ul");
      partOfSpeechText.textContent = partOfSpeech;
      defs.forEach((def)=>{
        const li = document.createElement('li');
        li.appendChild(document.createTextNode(def));
        ul.appendChild(li);
      });
      clone.appendChild(ul);
      defArea.appendChild(clone);
    });    

  } catch(error){
    console.log(error);
    const text = document.createElement('p');
    text.classList.add("def-ul");
    // text.classList.add("def-ul");
    text.textContent = "Sorry we couldn't find a definition for this word. \n You can add your own definition in the settings.";
    defArea.appendChild(text);
  }

  if(defArea.scrollHeight > defArea.clientHeight) defArea.classList.add("shadow");
  else defArea.classList.remove("shadow");
}

function generateUserDefinition(word){
  const contents = word.split(":");
  const wordOnly = contents[0];
  const definition = contents[1] || "";
  console.log("user def:", definition);
  if(definition === "") return false;

  while (defArea.firstChild) {
    defArea.removeChild(defArea.firstChild);
  }
  const text = document.createElement('p');
  text.classList.add("def-ul");
  // text.classList.add("def-ul");
  text.textContent = definition;
  defArea.appendChild(text);

  if(defArea.scrollHeight > defArea.clientHeight) defArea.classList.add("shadow");
  else defArea.classList.remove("shadow");

  return true;
}


function random(min,max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
function shuffleArray(a){
  for(let i = 0; i < a.length-1; i++){
    let j = random(i,a.length-1);
    let num = a[i];
    a[i] = a[j];
    a[j] = num;
  }
  return a;
}

