/* global chrome */

const minutesInput = document.getElementById("minutes");
const sitesInput = document.getElementById("sites");

chrome.storage.sync.get(
    {
        maxMinutes: 7,
        watchSites: []
    },
    (settings) => {
        minutesInput.value = settings.maxMinutes;
        sitesInput.value = settings.watchSites.join(", ");
    }
);

document.getElementById("save").addEventListener("click", () => {
    const sites = sitesInput.value
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);

    chrome.storage.sync.set({
        maxMinutes: Number(minutesInput.value),
        watchSites: sites
    });

    alert("Settings saved!");
});
