// chrome.tabs.onCreated.addListener(() => {
  //   var views = chrome.runtime.getContexts({contextTypes:["BACKGROUND"]});
  //   console.log(views);
  
  // });
import {defaultSettings} from "./scripts/defaultSettings.js";
  
const alarmPeriod = 0.5;
// const vocabUrls = ["youtube.com","twitch.tv","reddit.com","chrome"];
const vocabUrls = [];
// const timeLimit = 1;
  

// To ensure a non-persistent script wakes up, call this code at its start synchronously
chrome.alarms.onAlarm.addListener(async (alarm) => {
  const windowResult = await chrome.windows.getLastFocused();
  // console.log(windowResult);
  if(!windowResult.focused) return;

  if (alarm.name === "alarm") {
    // if(popupOpen) return;
    
    const result = await chrome.storage.local.get("timerOn");
    const on = Object.values(result)[0] || "false";
    if(on === "false"){
      chrome.storage.local.set({"timeElapsed" : 0});
      return;
    }

    chrome.tabs.query({currentWindow:true,active:true}, async (tabs)=>{
      if(tabs[0] === undefined) return;
      const currUrl = tabs[0].url;

      var timeCounted = false;

      const sitesResult = await chrome.storage.local.get("siteList");
      const sites = Object.values(sitesResult)[0] || [];
      if(sites.length === 0) timeCounted = true;
      for(const url of sites){
        if(currUrl.includes(url)){
          timeCounted = true;
        }
      }

      if(timeCounted){
        chrome.storage.local.get("timeElapsed", (result) => {
          var time = Object.values(result)[0] || 0;
          time += alarmPeriod;
          console.log("time elapsed: " + time);
          
          chrome.storage.local.get("settings", (result) => {
            var settings = Object.values(result)[0] || defaultSettings.settings;
            const timeLimit = settings.timerLength;
            
            if(time >= timeLimit){
              time = 0;
              chrome.action.openPopup();
              try{
              } catch (exception){
                chrome.storage.local.set({"timeElapsed" : 0});
              }
            }
            chrome.storage.local.set({"timeElapsed" : time});
          });
        });
      }
    });
  }
});
  
  
// chrome.alarms.create("alarm", {
//   delayInMinutes: alarmPeriod,
//   periodInMinutes: alarmPeriod
// });


chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason !== 'install') {
    return;
  }

  // Create an alarm so we have something to look at in the demo
  await chrome.alarms.create("alarm", {
    delayInMinutes: alarmPeriod,
    periodInMinutes: alarmPeriod
  });

  await chrome.storage.local.set({"timerOn" : "true"});

  await chrome.storage.local.set({settings : defaultSettings.settings});
});

chrome.runtime.onInstalled.addListener(async () => {
  chrome.contextMenus.create({
    id: 'addVocabWord',
    title: 'Add to Word List',
    type: 'normal',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener((item, tab) => {
  const id = item.menuItemId;
  if(!item.selectionText) return; 
  const word = item.selectionText.toLowerCase() || "";
  if(word === "") return;

  chrome.storage.local.get("wordList", (result) => {
    var wordList = Object.values(result)[0] || [];
    if(wordList.includes(word)) return;
    wordList.push(word);

    chrome.storage.local.set({"wordList":  wordList}, async ()=>{
      const url = "chrome-extension://" + chrome.runtime.id + "/settings/word-list.html";
      const [tab] = await chrome.tabs.query({url: url});
      if (tab != null){
        const response = await chrome.tabs.sendMessage(tab.id, {action: "add", word: word});
        console.log(response);
      }
    });
  });
});

function popupOpen(){
  let views = chrome.extension.getViews({ type: "popup" });
  return views.length > 0;
}




async function resetStopwatch(){
  await chrome.storage.local.set({"vocabStopwatch" : 0});
  console.log("reset stopwatch");
}

// chrome.webNavigation.onCompleted.addListener(
  // async () => {
  //   chrome.action.openPopup();
  //   // console.log("yes");
  // }
// );

// chrome.tabs.onHighlighted.addListener((tabId, changeInfo, tab)=>{
//   chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
//     chrome.storage.local.set({"vocabLastActiveTab" : tabs[0].url}, ()=>{
//       chrome.storage.local.get("vocabLastActiveTab", (result)=>{
//         console.log(Object.values(result)[0]);
//       });  
//     });

//   });
// })

// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   if (changeInfo.url && changeInfo.url.includes("youtube.com")) {
//       console.log("You visited example.com!");
//   }
// });


//get current tab
async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}