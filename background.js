chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log("tab", tab);
    if (changeInfo.status === 'complete' && /^http/.test(tab.url)) {
        chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
            console.log("message", message);
            if (message.value) {
                chrome.storage.local.set({
                    "postsCount": message.value
                }); 
              chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ["./foreground.js"]
                }).then(() => {
                        console.log("INJECTED THE FOREGROUND SCRIPT.");
                });
            }
          });
    }
});
