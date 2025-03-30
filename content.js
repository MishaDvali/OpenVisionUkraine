// content.js
let utterance;
let pausedText = "";
let isSpeaking = false;
let lastSpokenButton = null;

function speakText(text, startPos = 0) {
  console.log("Speaking text from position:", startPos);
  utterance = new SpeechSynthesisUtterance(text.slice(startPos));
  utterance.lang = "en-US";
  utterance.onboundary = (event) => {
    pausedText = text.slice(event.charIndex);
  };
  utterance.onend = () => {
    isSpeaking = false;
    pausedText = "";
  };
  speechSynthesis.speak(utterance);
  isSpeaking = true;
}

function stopSpeaking() {
  console.log("Stopping speech.");
  speechSynthesis.cancel();
  isSpeaking = false;
}

function toggleSpeaking() {
  if (isSpeaking) {
    stopSpeaking();
  } else {
    if (pausedText) {
      speakText(pausedText);
    } else {
      let text = document.body.innerText.trim();
      text = text.length > 500 ? text.slice(0, 500) + "..." : text;
      console.log("Extracted text:", text);
      pausedText = text;
      speakText(text);
    }
  }
}

function announceFocusedButton() {
  const activeElement = document.activeElement;
  if (activeElement.tagName === "BUTTON" || activeElement.tagName === "A") {
    if (activeElement !== lastSpokenButton) {
      lastSpokenButton = activeElement;
      let text = activeElement.innerText.trim();
      if (!text) {
        text = activeElement.getAttribute("aria-label") ||
               activeElement.getAttribute("title") ||
               activeElement.getAttribute("value") ||
               "Button";
      }
      speakText(text);
    }
  }
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Tab") {
    setTimeout(announceFocusedButton, 100);
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received message in content script:", request);

  if (request.action === "toggle_speaking") {
    toggleSpeaking();
  } else if (request.action === "stop_speaking") {
    stopSpeaking();
  }
});

