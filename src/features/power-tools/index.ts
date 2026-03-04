import { getSettings } from "../../storage";
import { SELECTORS, insertIntoTextarea } from "../../content/chatgpt-selectors";

let quoteBtn: HTMLElement | null = null;

export function initQuoteReply(): void {
    document.addEventListener("mouseup", onSelectionChange);
    document.addEventListener("keyup", onSelectionChange);
}

function onSelectionChange(): void {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (!text || text.length < 5) {
        quoteBtn?.remove();
        quoteBtn = null;
        return;
    }

    // Only activate if selection is inside an assistant message
    const range = selection!.getRangeAt(0);
    const ancestor = range.commonAncestorContainer;
    const msgEl = (ancestor as Element)?.closest?.(SELECTORS.assistantMessage) ??
        (ancestor.parentElement?.closest(SELECTORS.assistantMessage));
    if (!msgEl) {
        quoteBtn?.remove();
        quoteBtn = null;
        return;
    }

    if (!quoteBtn) {
        quoteBtn = document.createElement("button");
        quoteBtn.setAttribute("type", "button");
        quoteBtn.className = "cvoy-quote-btn";
        quoteBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
      Quote Reply
    `;
        document.body.appendChild(quoteBtn);
    }

    // Position near the selection
    const rect = range.getBoundingClientRect();
    quoteBtn.style.left = `${rect.left + window.scrollX}px`;
    quoteBtn.style.top = `${rect.bottom + window.scrollY + 6}px`;

    // Capture text in closure before selection is lost
    const captured = text;
    quoteBtn.onclick = () => {
        const quoted = captured
            .split("\n")
            .map((line) => `> ${line}`)
            .join("\n");
        insertIntoTextarea(`${quoted}\n\n`);
        quoteBtn?.remove();
        quoteBtn = null;
        window.getSelection()?.removeAllRanges();
    };
}

export function initTabTitleSync(): void {
    syncTitleOnce();
    // Navigation changes
    const obs = new MutationObserver(syncTitleOnce);
    obs.observe(document.querySelector("title") ?? document.documentElement, {
        subtree: true,
        characterData: true,
        childList: true,
    });
}

function syncTitleOnce(): void {
    const h1 = document.querySelector("h1");
    if (h1?.textContent?.trim()) {
        const title = h1.textContent.trim();
        if (document.title !== `${title} - ChatGPT`) {
            document.title = `${title} - ChatGPT`;
        }
    }
}

export function initPreventAutoScroll(): void {
    // Intercept scroll-to-bottom when Enter is pressed
    const textarea = document.querySelector(SELECTORS.promptTextarea) as HTMLElement | null;
    if (!textarea) return;

    textarea.addEventListener("keydown", (e: Event) => {
        const ke = e as KeyboardEvent;
        if (ke.key === "Enter" && !ke.shiftKey) {
            // Store the scroll position
            const main = document.querySelector("main");
            if (!main) return;
            const scrollPos = main.scrollTop;
            requestAnimationFrame(() => {
                // Only restore if we're not already at the bottom
                if (main.scrollHeight - main.scrollTop - main.clientHeight > 200) {
                    main.scrollTop = scrollPos;
                }
            });
        }
    });
}

export function initInputCollapse(): void {
    const textarea = document.querySelector(SELECTORS.promptTextarea) as HTMLElement | null;
    if (!textarea) return;

    document.body.classList.add("cvoy-input-collapsed");

    textarea.addEventListener("focus", () => {
        document.body.classList.remove("cvoy-input-collapsed");
    });

    textarea.addEventListener("blur", () => {
        setTimeout(() => {
            if (!document.activeElement?.closest(SELECTORS.composerForm)) {
                document.body.classList.add("cvoy-input-collapsed");
            }
        }, 200);
    });
}

export async function initDefaultModel(): Promise<void> {
    const settings = await getSettings();
    if (!settings.defaultModel) return;

    // Only on a new chat page (no conversation ID in URL)
    if (!location.pathname.match(/\/c\/[a-f0-9-]+/)) {
        // Wait a bit for the page to settle, then click the model selector
        await sleep(1500);
        selectModel(settings.defaultModel);
    }
}

function selectModel(modelName: string): void {
    const modelBtn = document.querySelector(SELECTORS.modelSelector) as HTMLButtonElement | null;
    if (!modelBtn) return;

    modelBtn.click();
    setTimeout(() => {
        const items = document.querySelectorAll(SELECTORS.modelMenuItems);
        for (const item of Array.from(items)) {
            if (item.textContent?.toLowerCase().includes(modelName.toLowerCase())) {
                (item as HTMLElement).click();
                break;
            }
        }
    }, 400);
}

export function initHideRecents(): void {
    document.body.classList.add("cvoy-hide-recents");
    // Also inject CSS to target "Today / Yesterday / Previous 7 Days" headings
    const style = document.createElement("style");
    style.id = "cvoy-hide-recents-style";
    style.textContent = `
    /* Hide date-grouped sections in sidebar */
    nav[aria-label="Chat history"] h3,
    nav[aria-label="Chat history"] [class*="sticky"] {
      display: none !important;
    }
  `;
    document.head.appendChild(style);
}

export function disableHideRecents(): void {
    document.body.classList.remove("cvoy-hide-recents");
    document.getElementById("cvoy-hide-recents-style")?.remove();
}

export async function initMermaidRendering(): Promise<void> {
    // Lazily import mermaid to keep the content script small
    const { default: mermaid } = await import("mermaid");
    mermaid.initialize({ startOnLoad: false, theme: "neutral" });

    processMermaidBlocks(mermaid);

    const main = document.querySelector("main");
    if (main) {
        const obs = new MutationObserver(() => processMermaidBlocks(mermaid));
        obs.observe(main, { childList: true, subtree: true });
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function processMermaidBlocks(mermaid: any): void {
    document.querySelectorAll("code.language-mermaid:not([data-cvoy-rendered])").forEach(async (codeEl) => {
        codeEl.setAttribute("data-cvoy-rendered", "1");
        const pre = codeEl.parentElement;
        if (!pre) return;

        const code = codeEl.textContent ?? "";
        try {
            const id = `cvoy-mermaid-${Math.random().toString(36).slice(2)}`;
            const { svg } = await mermaid.render(id, code);
            const container = document.createElement("div");
            container.className = "cvoy-mermaid-rendered";
            container.style.cssText = "margin:8px 0;overflow-x:auto;background:var(--cvoy-bg-secondary);padding:16px;border-radius:8px";
            container.innerHTML = svg;
            pre.parentNode?.insertBefore(container, pre.nextSibling);
        } catch {
            // Leave original code block intact
        }
    });
}

function sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
}
