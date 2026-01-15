/* global chrome */

let scrollStartTime = null;
let lastScrollTime = null;
let warned = false;

const SCROLL_IDLE_RESET = 3000;
const CHECK_INTERVAL = 1000;

function isFrequentScrolling() {
    return lastScrollTime && Date.now() - lastScrollTime < SCROLL_IDLE_RESET;
}

chrome.storage.sync.get(
    {
        watchSites: [],
        maxMinutes: 7
    },
    (settings) => {
        const hostname = location.hostname;
        const shouldWatch = settings.watchSites.some(site =>
            hostname.includes(site)
        );

        if (!shouldWatch) return;

        window.addEventListener("scroll", () => {
            const now = Date.now();

            if (!scrollStartTime) {
                scrollStartTime = now;
            }

            lastScrollTime = now;
        });

        setInterval(() => {
            if (!scrollStartTime || warned) return;

            if (!isFrequentScrolling()) {
                scrollStartTime = null;
                return;
            }

            const elapsedMinutes =
                (Date.now() - scrollStartTime) / 1000 / 60;

            if (elapsedMinutes >= settings.maxMinutes) {
                warned = true;
                chrome.runtime.sendMessage({ type: "DOOMSCROLL_WARNING" });
            }
        }, CHECK_INTERVAL);
    }
);

chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "SHOW_WARNING") {
        const overlay = document.createElement("div");

        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100vw";
        overlay.style.height = "100vh";
        overlay.style.background = "rgba(0,0,0,0.75)";
        overlay.style.color = "white";
        overlay.style.zIndex = "999999";
        overlay.style.display = "flex";
        overlay.style.flexDirection = "column";
        overlay.style.justifyContent = "center";
        overlay.style.alignItems = "center";
        overlay.style.fontSize = "1.5rem";

        overlay.innerHTML = `
      <p>You've been scrolling for a while.</p>
      <button id="closeWarning">Okay, I’ll stop</button>
    `;

        document.body.appendChild(overlay);

        document
            .getElementById("closeWarning")
            .addEventListener("click", () => {
                overlay.remove();
            });
    }
});
