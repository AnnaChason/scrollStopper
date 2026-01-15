/* global chrome */
chrome.runtime.onMessage.addListener((msg, sender) => {
    if (msg.type === "DOOMSCROLL_WARNING") {
        chrome.tabs.sendMessage(sender.tab.id, {
            type: "SHOW_WARNING"
        });
    }
});
