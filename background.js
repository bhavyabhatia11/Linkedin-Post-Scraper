chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({
        name: "Jack"
    });
});

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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'get_name') {
        chrome.storage.local.get('name', data => {
            if (chrome.runtime.lastError) {
                sendResponse({
                    message: 'fail'
                });

                return;
            }

            sendResponse({
                message: 'success',
                payload: data.name
            });
        });

        return true;
    } else if (request.message === 'change_name') {
        chrome.storage.local.set({
            name: request.payload
        }, () => {
            if (chrome.runtime.lastError) {
                sendResponse({ message: 'fail' });
                return;
            }

            sendResponse({ message: 'success' });
        })

        return true;
    }
});