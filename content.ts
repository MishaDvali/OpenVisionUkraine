let utterance: SpeechSynthesisUtterance;
let pausedText: string = "";
let isSpeaking: boolean = false;
let lastSpokenButton: HTMLElement | null = null;

function speakText(text: string, startPos: number = 0): void {
  console.log("Speaking text from position:", startPos);
  utterance = new SpeechSynthesisUtterance(text.slice(startPos));
  utterance.lang = "en-US";
  utterance.onboundary = (event: SpeechSynthesisEvent) => {
    pausedText = text.slice(event.charIndex);
  };
  utterance.onend = () => {
    isSpeaking = false;
    pausedText = "";
  };
  speechSynthesis.speak(utterance);
  isSpeaking = true;
}

function stopSpeaking(): void {
  console.log("Stopping speech.");
  speechSynthesis.cancel();
  isSpeaking = false;
}

function toggleSpeaking(): void {
  if (isSpeaking) {
    stopSpeaking();
  } else {
    if (pausedText) {
      speakText(pausedText);
    } else {
      let text: string = document.body.innerText.trim();
      text = text.length > 500 ? text.slice(0, 500) + "..." : text;
      console.log("Extracted text:", text);
      pausedText = text;
      speakText(text);
    }
  }
}

function announceFocusedButton(): void {
  const activeElement: HTMLElement | null = document.activeElement as HTMLElement;
  if (activeElement && (activeElement.tagName === "BUTTON" || activeElement.tagName === "A")) {
    if (activeElement !== lastSpokenButton) {
      lastSpokenButton = activeElement;
      let text: string = activeElement.innerText.trim();
      if (!text) {
        text = activeElement.getAttribute("aria-label") ||
               activeElement.getAttribute("title") ||
               activeElement.getAttribute("value") ||
               "Button" || "";
      }
      speakText(text);
    }
  }
}

document.addEventListener("keydown", (event: KeyboardEvent) => {
  if (event.key === "Tab") {
    setTimeout(announceFocusedButton, 100);
  }
});

chrome.runtime.onMessage.addListener((request: { action: string }) => {
  console.log("Received message in content script:", request);

  if (request.action === "toggle_speaking") {
    toggleSpeaking();
  } else if (request.action === "stop_speaking") {
    stopSpeaking();
  }
});

if (!('webkitSpeechRecognition' in window)) {
  console.error('Web Speech API is not supported in this browser.');
} else {
  const recognition: SpeechRecognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onstart = (): void => {
    console.log('Speech recognition started. Speak into the microphone.');
  };

  recognition.onerror = (event: SpeechRecognitionErrorEvent): void => {
    console.error('Speech recognition error:', event.error);
  };

  recognition.onend = (): void => {
    console.log('Speech recognition ended.');
  };

  recognition.onresult = (event: SpeechRecognitionEvent): void => {
    const transcript: string = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
    console.log('Recognized:', transcript);

    if (transcript === 'start') {
      startReading();
    } else if (transcript === 'stop') {
      stopReading();
    } else if (transcript === 'resume') {
      resumeReading();
    }
  };

  function startReading(): void {
    const text: string = document.body.innerText.trim();
    if (text.length > 0) {
      const utterance: SpeechSynthesisUtterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
      console.log('Reading started.');
    } else {
      console.log('No text available to read.');
    }
  }

  function stopReading(): void {
    speechSynthesis.cancel();
    console.log('Reading stopped.');
  }

  function resumeReading(): void {
    speechSynthesis.resume();
    console.log('Reading resumed.');
  }

  recognition.start();
}

