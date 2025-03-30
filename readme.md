# OpenVision Chrome Extension

## Introduction
OpenVision is a Chrome extension designed to make web navigation accessible for blind and visually impaired users. It provides voice feedback for text and interactive elements on a webpage, allowing users to browse the internet seamlessly using voice commands and hotkeys.

## Features
- **Voice Over Support**: Reads webpage content aloud, including headings, paragraphs, links, and buttons.
- **Hotkey Navigation**: Users can navigate through elements using customizable keyboard shortcuts.
- **Voice Command Control**: Allows users to interact with web pages hands-free by issuing simple voice commands.
- **Structural Content Reading**: Reads content in the logical order.
- **Multilingual Support**: Provides voice output in multiple languages.

## Basic Navigation

- **Start Reading**: Press Ctrl + Shift + S to begin reading the page aloud.
- **Stop Reading**: Press Ctrl + Shift + X to stop speech output.
- **Resume Reading**: If stopped, speech can be resumed with Ctrl + Shift + S.
- **Navigate with Tab**: Use the Tab key to move through interactive elements, and the extension will announce them. (You should stop reading the page with Ctrl + Shift + X before switching between buttons)
- **Voice Commands**: Say "Start" to begin reading, "Stop" to halt speech, and "Resume" to continue from where it stopped. (However not all devices support voice command "Stop" out of the box, due to the fact that extension can't always use microphone and dynamics at the same time, wait for further guides to be dropped regarding this issue)


## Technology Stack
- **JavaScript**: The core language for building the extension.
- **Typescript**: Language used to provide clarity into our codebase.
- **Web Speech API**: Handles text-to-speech and speech recognition using Chrome's default AI model.

## Privacy & Ethics
- No user data is stored, shared, or used for AI training.
- All processing happens locally or through trusted APIs.

## Future Plans
- **Mobile App**: Extend accessibility features to smartphones.
- **Improved Speech Recognition**: Enhance accuracy and responsiveness of voice commands.
- **More Accessible Navigation**: Improve keyboard and voice-based navigation.

## Get Involved
We are looking for contributors and feedback to make OpenVision even better. Join us in making the web truly accessible for everyone!

# Code Documentation

## Background Script (`background.js`)
Handles hotkey commands and script injection.
```javascript
chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) return;
    
    if (command === "speak_page") {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ["content.js"]
      });
      chrome.tabs.sendMessage(tabs[0].id, { action: "toggle_speaking" });
    } else if (command === "stop_speaking") {
      chrome.tabs.sendMessage(tabs[0].id, { action: "stop_speaking" });
    }
  });
});
```

## Content Script (`content.js`)
Manages speech synthesis and recognition.
```javascript
let utterance;
let isSpeaking = false;

function speakText(text) {
  utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.onend = () => { isSpeaking = false; };
  speechSynthesis.speak(utterance);
  isSpeaking = true;
}

function stopSpeaking() {
  speechSynthesis.cancel();
  isSpeaking = false;
}

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "toggle_speaking") {
    if (isSpeaking) stopSpeaking();
    else speakText(document.body.innerText);
  } else if (request.action === "stop_speaking") {
    stopSpeaking();
  }
});
```


**Contact us at: mykhailo.dvali@gmail.com**

