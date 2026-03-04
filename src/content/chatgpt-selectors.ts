/**
 * Centralized selectors for ChatGPT DOM elements.
 * Update here when ChatGPT changes their DOM.
 */

export const SELECTORS = {
    // Sidebar
    sidebar: 'nav[aria-label="Chat history"]',
    sidebarHistoryList: 'nav[aria-label="Chat history"] ol',
    conversationItem: 'nav[aria-label="Chat history"] li',
    newChatLink: 'a[href="/"]',

    // Message containers
    messageContainer: '[data-message-id]',
    userMessage: '[data-message-author-role="user"]',
    assistantMessage: '[data-message-author-role="assistant"]',
    articleMessages: 'article[data-testid^="conversation-turn"]',

    // Input area
    promptTextarea: '#prompt-textarea',
    submitButton: '[data-testid="send-button"], button[aria-label="Send prompt"]',
    composerForm: 'form',

    // Model selector
    modelSelector: 'button[aria-label="Model selector"], button[aria-haspopup="menu"][aria-label*="model" i], button[class*="model-selector"]',
    modelMenu: '[role="menu"], [role="listbox"]',
    modelMenuItems: '[role="menuitem"], [role="option"]',

    // Deep research / thinking
    thinkingBlock: '[data-testid="thinking-block"], .thinking-block, details summary',

    // Math formulas
    mathExpression: '.katex, .MathJax, mjx-container',

    // Code blocks
    codeBlock: 'pre code',

    // Conversation title in header
    conversationTitle: 'h1[class*="title"], [data-testid="conversation-title"]',
} as const;

/** Get the current conversation ID from the URL */
export function getCurrentConversationId(): string | null {
    const match = location.pathname.match(/\/c\/([a-f0-9-]+)/);
    return match ? match[1] : null;
}

/** Get the current page title as conversation name */
export function getConversationTitle(): string {
    const h1 = document.querySelector(SELECTORS.conversationTitle);
    if (h1?.textContent) return h1.textContent.trim();
    return document.title.replace(" - ChatGPT", "").trim();
}

/** Get all message elements in order */
export function getAllMessages(): Element[] {
    return Array.from(document.querySelectorAll(SELECTORS.userMessage + ", " + SELECTORS.assistantMessage));
}

/** Insert text at the end of the ProseMirror textarea */
export function insertIntoTextarea(text: string): void {
    const editor = document.querySelector(SELECTORS.promptTextarea) as HTMLElement | null;
    if (!editor) return;

    editor.focus();
    // Use execCommand for contenteditable divs (ProseMirror)
    const selection = window.getSelection();
    if (selection) {
        const range = document.createRange();
        range.selectNodeContents(editor);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    // Trigger input event so React/ProseMirror detects the change
    document.execCommand("insertText", false, text);
    editor.dispatchEvent(new InputEvent("input", { bubbles: true }));
}

/** Detect dark mode */
export function isDarkMode(): boolean {
    return (
        document.documentElement.classList.contains("dark") ||
        document.body.classList.contains("dark") ||
        window.matchMedia("(prefers-color-scheme: dark)").matches
    );
}
