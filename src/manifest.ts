import type { ManifestV3Export } from "@crxjs/vite-plugin";

const manifest: ManifestV3Export = {
    manifest_version: 3,
    name: "ChatGPT Voyager",
    version: "1.0.3",
    description: "An all-in-one enhancement suite for ChatGPT - timeline navigation, folder management, prompt library, and chat export.",
    icons: {
        "16": "icons/icon16.png",
        "32": "icons/icon32.png",
        "48": "icons/icon48.png",
        "128": "icons/icon128.png",
    },
    action: {
        default_popup: "src/popup/popup.html",
        default_icon: {
            "16": "icons/icon16.png",
            "32": "icons/icon32.png",
            "48": "icons/icon48.png",
            "128": "icons/icon128.png",
        },
    },
    background: {
        service_worker: "src/background/index.ts",
        type: "module",
    },
    content_scripts: [
        {
            matches: ["https://chatgpt.com/*"],
            js: ["src/content/index.ts"],
            run_at: "document_idle",
        },
    ],
    permissions: [
        "storage",
        "tabs",
        "scripting",
    ],
    host_permissions: [
        "https://chatgpt.com/*",
    ],
    web_accessible_resources: [
        {
            resources: ["icons/*", "assets/*"],
            matches: ["https://chatgpt.com/*"],
        },
    ],
};

export default manifest;
