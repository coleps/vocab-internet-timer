const settingsLink = document.querySelector("#settings-link");
const wordListLink = document.querySelector("#word-list-link");
const siteListLink = document.querySelector("#site-list-link");

if(settingsLink != null){
  settingsLink.addEventListener("click", ()=>{
    chrome.tabs.update({url:"../settings/settings.html"});
  });
}
if(wordListLink != null){
  wordListLink.addEventListener("click", ()=>{
    chrome.tabs.update({url:"../settings/word-list.html"});
  });
}
if(siteListLink != null){
  siteListLink.addEventListener("click", ()=>{
    chrome.tabs.update({url:"../settings/site-list.html"});
  });
}