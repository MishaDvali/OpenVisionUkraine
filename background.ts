chrome.commands.onCommand.addListener((command: string) => {
  console.log("Received command:", command);

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
    if (tabs.length === 0 || !tabs[0].id) {
      console.error("No active tabs found.");
      return;
    }

    console.log("Executing script on tab:", tabs[0].id);
    const tabId: number = tabs[0].id;

    if (command === "speak_page") {
      chrome.scripting.executeScript({
        target: { tabId },
        files: ["content.js"]
      }, () => {
        if (chrome.runtime.lastError) {
          console.error("Script injection error:", chrome.runtime.lastError.message);
        } else {
          console.log("Script injected successfully.");
          chrome.tabs.sendMessage(tabId, { action: "toggle_speaking" });
        }
      });
    } else if (command === "stop_speaking") {
      chrome.tabs.sendMessage(tabId, { action: "stop_speaking" });
    }
  });
});

