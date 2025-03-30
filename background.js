chrome.commands.onCommand.addListener((command) => {
  console.log("Received command:", command);

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) {
      console.error("No active tabs found.");
      return;
    }

    console.log("Executing script on tab:", tabs[0].id);

    if (command === "speak_page") {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ["content.js"]
      }, () => {
        if (chrome.runtime.lastError) {
          console.error("Script injection error:", chrome.runtime.lastError.message);
        } else {
          console.log("Script injected successfully.");
          chrome.tabs.sendMessage(tabs[0].id, { action: "toggle_speaking" });
        }
      });
    } else if (command === "stop_speaking") {
      chrome.tabs.sendMessage(tabs[0].id, { action: "stop_speaking" });
    }
  });
});

