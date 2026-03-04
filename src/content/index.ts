import { initDeepResearch } from "../features/deep-research";
import { initExport } from "../features/export";
import { initFolders, refreshFolders } from "../features/folders";
import { initFormulaCopy } from "../features/formula-copy";
import { initDefaultModel, initHideRecents, initInputCollapse, initMermaidRendering, initPreventAutoScroll, initQuoteReply, initTabTitleSync, disableHideRecents } from "../features/power-tools";
import { initPromptVault } from "../features/prompts";
import { destroyTimeline, initTimeline } from "../features/timeline";
import { getSettings } from "../storage";
import { SELECTORS, getCurrentConversationId } from "./chatgpt-selectors";

let lastConvId: string | null = null;
let initialized = false;

async function main(): Promise<void> {
    if (initialized) return;
    initialized = true;

    const settings = await getSettings();

    // Apply body classes for active settings
    if (settings.enableHideRecents) initHideRecents();

    // Core features
    if (settings.enableFolders) await initFolders();
    if (settings.enablePromptVault) await initPromptVault();
    if (settings.enableExport) initExport();
    if (settings.enableFormulaCopy) initFormulaCopy();
    if (settings.enableDeepResearch) initDeepResearch();

    // Power tools
    if (settings.enableQuoteReply) initQuoteReply();
    if (settings.enableTabTitleSync) initTabTitleSync();
    if (settings.enablePreventAutoScroll) initPreventAutoScroll();
    if (settings.enableInputCollapse) initInputCollapse();
    if (settings.enableMermaid) await initMermaidRendering();
    if (settings.defaultModel) await initDefaultModel();

    // Timeline: init per-conversation
    await handleRouteChange(settings);

    // SPA navigation detection
    observeRouteChanges(settings);
}

async function handleRouteChange(settings: Awaited<ReturnType<typeof getSettings>>): Promise<void> {
    const convId = getCurrentConversationId();
    if (convId === lastConvId) return;
    lastConvId = convId;

    // Re-init per-page features
    if (settings.enableTimeline) {
        destroyTimeline();
        if (convId) await initTimeline();
    }

    if (settings.enableExport) {
        // Re-inject export button if it was removed
        document.getElementById("cvoy-export-btn-container")?.remove();
        if (convId) initExport();
    }

    if (settings.enableFolders) {
        await refreshFolders();
    }
}

function observeRouteChanges(settings: Awaited<ReturnType<typeof getSettings>>): void {
    // MutationObserver on the main content area
    const main = document.querySelector("main") ?? document.body;
    const obs = new MutationObserver(() => {
        handleRouteChange(settings);
        reinjectIfMissing(settings);
    });
    obs.observe(main, { childList: true, subtree: true });

    // Also watch for URL changes via history API
    const origPushState = history.pushState.bind(history);
    history.pushState = function (...args) {
        origPushState(...args);
        setTimeout(() => handleRouteChange(settings), 300);
    };
    window.addEventListener("popstate", () =>
        setTimeout(() => handleRouteChange(settings), 300)
    );
}

function reinjectIfMissing(settings: Awaited<ReturnType<typeof getSettings>>): void {
    if (settings.enableFolders && !document.getElementById("cvoy-folders")) {
        initFolders();
    }
    if (settings.enablePromptVault && !document.getElementById("cvoy-prompt-btn")) {
        initPromptVault();
    }
    if (settings.enableExport && !document.getElementById("cvoy-export-btn-container")) {
        initExport();
    }
}

// Listen for settings changes from popup
chrome.storage.onChanged.addListener(async (changes) => {
    if (!changes.settings) return;
    const newSettings = changes.settings.newValue;
    const oldSettings = changes.settings.oldValue;

    if (newSettings.enableHideRecents !== oldSettings?.enableHideRecents) {
        if (newSettings.enableHideRecents) initHideRecents();
        else disableHideRecents();
    }
});

// Wait for page to be ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
} else {
    main();
}
