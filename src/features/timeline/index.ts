import { getStarredMessages, toggleStarMessage } from "../../storage";
import { SELECTORS, getAllMessages, getCurrentConversationId } from "../../content/chatgpt-selectors";

let timelinePanel: HTMLElement | null = null;
let observer: MutationObserver | null = null;
let currentConvId: string | null = null;

export async function initTimeline(): Promise<void> {
    currentConvId = getCurrentConversationId();
    if (!currentConvId) return;

    createTimelinePanel();
    await renderTimeline();

    // Watch for new messages
    const container = document.querySelector("main");
    if (container) {
        observer = new MutationObserver(() => renderTimeline());
        observer.observe(container, { childList: true, subtree: true });
    }
}

export function destroyTimeline(): void {
    observer?.disconnect();
    observer = null;
    timelinePanel?.remove();
    timelinePanel = null;
}

function createTimelinePanel(): void {
    if (document.getElementById("cvoy-timeline")) return;

    timelinePanel = document.createElement("div");
    timelinePanel.id = "cvoy-timeline";
    timelinePanel.className = "cvoy-timeline-panel";
    timelinePanel.setAttribute("title", "ChatGPT Voyager Timeline - Click a node to jump to a message");

    document.body.appendChild(timelinePanel);
}

async function renderTimeline(): Promise<void> {
    if (!timelinePanel) return;

    const messages = getAllMessages();
    if (messages.length === 0) {
        timelinePanel.style.opacity = "0";
        return;
    }
    timelinePanel.style.opacity = "1";

    const convId = getCurrentConversationId() ?? "";
    const starred = await getStarredMessages();
    const starredSet = new Set(
        starred
            .filter((s) => s.conversationId === convId)
            .map((s) => s.messageIndex)
    );

    timelinePanel.innerHTML = "";

    messages.forEach((msg, index) => {
        const isUser = msg.getAttribute("data-message-author-role") === "user";
        const isStarred = starredSet.has(index);

        // Connector line
        if (index > 0) {
            const connector = document.createElement("div");
            connector.className = "cvoy-timeline-connector";
            timelinePanel!.appendChild(connector);
        }

        // Node
        const node = document.createElement("div");
        node.className = `cvoy-timeline-node${isUser ? " user-node" : ""}${isStarred ? " starred" : ""}`;
        node.title = isUser ? `User message ${Math.ceil((index + 1) / 2)}` : `AI response ${Math.ceil(index / 2)}`;
        node.textContent = isUser ? "U" : "A";
        node.dataset.msgIndex = String(index);

        node.addEventListener("click", (e) => {
            e.stopPropagation();
            msg.scrollIntoView({ behavior: "smooth", block: "start" });
        });

        node.addEventListener("dblclick", async (e) => {
            e.stopPropagation();
            const convId2 = getCurrentConversationId() ?? "";
            const nowStarred = await toggleStarMessage(convId2, index);
            node.classList.toggle("starred", nowStarred);
            node.classList.toggle("user-node", isUser && !nowStarred);
        });

        // Tooltip with message preview
        const previewText = (msg.textContent ?? "").trim().slice(0, 60);
        if (previewText) {
            node.title = `${isUser ? "You" : "ChatGPT"}: ${previewText}${previewText.length >= 60 ? "..." : ""}`;
        }

        timelinePanel!.appendChild(node);
    });
}
