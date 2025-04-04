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
const textArea = document.querySelector("#word-area");
textArea.addEventListener("keypress", async ()=>{
  // if(textArea.hasAttribute("readonly")) return;
  makeButtonClickable(saveWordsButton)
});
textArea.addEventListener("paste", async ()=>{
  // if(textArea.hasAttribute("readonly")) return;
  makeButtonClickable(saveWordsButton)
});
textArea.addEventListener("cut", async (e)=>{
  // if(textArea.hasAttribute("readonly")) return;
  makeButtonClickable(saveWordsButton)
});
textArea.addEventListener("keydown", async (e)=>{
  // if(textArea.hasAttribute("readonly")) return;
  if(e.keyCode === 8 || e.keyCode === 46){
    makeButtonClickable(saveWordsButton)
  }
});

const saveWordsButton = document.querySelector("#save-words");
saveWordsButton.addEventListener("click", () =>{

  // textArea.value = "";
  const words = textArea.value.replace(/\r\n/g,"\n").split("\n").filter(line => line);
  words.forEach((word, index) =>{
    words[index] = word.toLowerCase();
  });
  // make words unique
  chrome.storage.local.get("wordList", (result) => {
    var wordList = Object.values(result)[0] || [];
    const wordsRemoved = wordList.filter((word) => !words.includes(word));


    chrome.storage.local.get("wordQueue", (result) => {
      var wordQueue = Object.values(result)[0] || [];
      wordQueue = wordQueue.filter((word) => !wordsRemoved.includes(word));
      chrome.storage.local.set({"wordQueue" : wordQueue});
    });

    chrome.storage.local.set({"wordList":[...new Set(words)]}, ()=>{
      makeButtonNotClickable(saveWordsButton);
      // fillTextArea();
    });
  });
});


window.onbeforeunload = () =>{
  if(saveWordsButton.classList.contains("button-clickable")){
    return "Do you want to exit without saving words?"
  }
  else return;
};

function fillTextArea(){
  chrome.storage.local.get("wordList", (result) => {
    var wordList = Object.values(result)[0] || [];
    var wordString = "";
    wordList.forEach(element => {
      wordString += element + "\n";
    });
    textArea.value = wordString;
    textArea.scrollTop = textArea.scrollHeight;

  fillNumbers();


    // textArea.textContent = wordString;
  });
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.action === "delete" || request.action === "add"){
      saveWordsButton.classList.add("uninteractable");
      fillTextArea();
      saveWordsButton.classList.remove("uninteractable");
    }
  }
);

const numbers = document.querySelector(".numbers");
// numbers.style.width = numbers.scrollWidth +  "px";
// numbers.style.width = "";
textArea.addEventListener("keyup", (e) => {
  const num = e.target.value.split("\n").length;
  var str = "";
  for (let i = 1; i <= num; i++) {
    str += i + "\n";
  }
  numbers.value = str;
  
});
textArea.addEventListener("keydown", (event) => {
  if (event.keyCode === 9) {
    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;

    textArea.value =
      textArea.value.substring(0, start) +
      "\t" +
      textArea.value.substring(end);

    event.preventDefault();
  }
});

function fillNumbers(){
  const num = textArea.value.split("\n").length;
  var str = "";
  for (let i = 1; i <= num; i++) {
    if(i < num) str += i + "\n";
    else str += i;
  }
  numbers.value = str;
}
const multiElementScroll = ( elem1, elem2 ) => {
  elem1.onscroll = function() {
    elem2.scrollTop = this.scrollTop;
  };
}

multiElementScroll( textArea, numbers )

