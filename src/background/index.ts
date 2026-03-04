chrome.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === "install") {
        console.log("[ChatGPT Voyager] Installed");
    }
});
