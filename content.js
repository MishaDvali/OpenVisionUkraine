let utterance;
let pausedText = "";
let isSpeaking = false;

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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received message in content script:", request);

  if (request.action === "toggle_speaking") {
    toggleSpeaking();
  } else if (request.action === "stop_speaking") {
    stopSpeaking();
  }
});

