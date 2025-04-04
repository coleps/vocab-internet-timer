fillTextArea();

function makeButtonClickable(element){
  element.classList.add("button-clickable");
  element.classList.remove("button-not-clickable");
}
function makeButtonNotClickable(element){
  element.classList.remove("button-clickable");
  element.classList.add("button-not-clickable");
}
// document.querySelector("#save-words").addEventListener("click", async ()=>{
//   makeButtonClickable("#save-words")
// })
const saveWordsButton = document.querySelector("#save-words");
saveWordsButton.addEventListener("click", () =>{

  // textArea.value = "";
  const sites = textArea.value.replace(/\r\n/g,"\n").split("\n").filter(line => line);
  // make words unique
  chrome.storage.local.set({"siteList":[...new Set(sites)]}, ()=>{
    makeButtonNotClickable(saveWordsButton);
    // fillTextArea();
  });
});

const textArea = document.querySelector("#word-area");
textArea.addEventListener("keypress", async ()=>{
  // if(textArea.hasAttribute("readonly")) return;
  makeButtonClickable(saveWordsButton)
});
textArea.addEventListener("paste", async ()=>{
  // if(textArea.hasAttribute("readonly")) return;
  makeButtonClickable(saveWordsButton)
});
textArea.addEventListener("keydown", async (e)=>{
  // if(textArea.hasAttribute("readonly")) return;
  if(e.keyCode === 8 || e.keyCode === 46){
    makeButtonClickable(saveWordsButton)
  }
});

window.onbeforeunload = () =>{
  if(saveWordsButton.classList.contains("button-clickable")){
    return "Do you want to exit without saving sites?"
  }
  else return;
};

function fillTextArea(){
  chrome.storage.local.get("siteList", (result) => {
    var wordList = Object.values(result)[0] || [];
    var wordString = "";
    wordList.forEach(element => {
      wordString += element + "\n";
    });
    textArea.textContent = wordString;
  });
}
