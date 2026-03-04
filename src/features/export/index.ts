import { getAllMessages, getConversationTitle, getCurrentConversationId } from "../../content/chatgpt-selectors";

interface Message {
    role: "user" | "assistant";
    content: string;
    index: number;
}

export function initExport(): void {
    injectExportButton();
}

function injectExportButton(): void {
    if (document.getElementById("cvoy-export-btn-container")) return;

    const titleArea = document.querySelector("header") ?? document.querySelector("main > div:first-child");
    if (!titleArea) return;

    const container = document.createElement("div");
    container.id = "cvoy-export-btn-container";
    container.style.cssText = "display:flex;align-items:center;gap:6px;position:fixed;top:10px;right:48px;z-index:999";

    const btn = document.createElement("button");
    btn.className = "cvoy-export-btn";
    btn.title = "Export Conversation - ChatGPT Voyager";
    btn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    Export
  `;

    btn.addEventListener("click", showExportMenu);
    container.appendChild(btn);
    document.body.appendChild(container);
}

function showExportMenu(): void {
    const existing = document.getElementById("cvoy-export-menu");
    if (existing) { existing.remove(); return; }

    const menu = document.createElement("div");
    menu.id = "cvoy-export-menu";
    menu.className = "cvoy-context-menu";
    menu.style.cssText = "position:fixed;top:48px;right:48px;z-index:9999";

    const formats = [
        { label: "Export as JSON", action: () => exportJson() },
        { label: "Export as Markdown", action: () => exportMarkdown() },
        { label: "Print or Save as PDF", action: () => exportPdf() },
    ];

    formats.forEach(({ label, action }) => {
        const item = document.createElement("div");
        item.className = "cvoy-context-item";
        item.textContent = label;
        item.addEventListener("click", () => { menu.remove(); action(); });
        menu.appendChild(item);
    });

    document.body.appendChild(menu);
    setTimeout(() => document.addEventListener("click", () => menu.remove(), { once: true }), 0);
}

function getMessages(): Message[] {
    const elements = getAllMessages();
    return elements.map((el, index) => ({
        role: (el.getAttribute("data-message-author-role") ?? "assistant") as "user" | "assistant",
        content: extractMessageContent(el),
        index,
    }));
}

function extractMessageContent(el: Element): string {
    // Get the prose/text content, preserving code blocks
    const proseEl = el.querySelector(".prose, .markdown, [class*='prose']") ?? el;

    // Replace code blocks with markdown fences
    const clone = proseEl.cloneNode(true) as HTMLElement;
    clone.querySelectorAll("pre code").forEach((code) => {
        const lang = code.className.match(/language-(\w+)/)?.[1] ?? "";
        code.parentElement!.replaceWith(`\`\`\`${lang}\n${code.textContent}\n\`\`\``);
    });

    return clone.textContent?.trim() ?? "";
}

function exportJson(): void {
    const messages = getMessages();
    const title = getConversationTitle();
    const convId = getCurrentConversationId();

    const data = {
        id: convId,
        title,
        exportedAt: new Date().toISOString(),
        messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
        })),
    };

    downloadFile(
        `${sanitizeFilename(title)}.json`,
        JSON.stringify(data, null, 2),
        "application/json"
    );
}

function exportMarkdown(): void {
    const messages = getMessages();
    const title = getConversationTitle();

    const lines: string[] = [
        `# ${title}`,
        ``,
        `> Exported from ChatGPT on ${new Date().toLocaleDateString()}`,
        ``,
    ];

    messages.forEach((m) => {
        lines.push(`## ${m.role === "user" ? "You" : "ChatGPT"}`);
        lines.push("");
        lines.push(m.content);
        lines.push("");
        lines.push("---");
        lines.push("");
    });

    downloadFile(
        `${sanitizeFilename(title)}.md`,
        lines.join("\n"),
        "text/markdown"
    );
}

function exportPdf(): void {
    // Use browser's print dialog for PDF export
    const messages = getMessages();
    const title = getConversationTitle();

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #0d0d0d; line-height: 1.6; }
    h1 { font-size: 24px; border-bottom: 2px solid #e5e5e5; padding-bottom: 12px; }
    .message { margin: 16px 0; padding: 16px; border-radius: 8px; }
    .user { background: #f7f7f8; border-left: 3px solid #10a37f; }
    .assistant { background: #fff; border-left: 3px solid #e5e5e5; }
    .role { font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
    pre { background: #1e1e1e; color: #d4d4d4; padding: 12px; border-radius: 6px; overflow-x: auto; }
    code { font-family: 'Consolas', monospace; font-size: 13px; }
    @media print { body { margin: 20px; } }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p style="color:#9b9b9b;font-size:12px">Exported from ChatGPT on ${new Date().toLocaleString()}</p>
  ${messages
            .map(
                (m) => `
    <div class="message ${m.role}">
      <div class="role">${m.role === "user" ? "You" : "ChatGPT"}</div>
      <div>${escapeHtml(m.content).replace(/\n/g, "<br>")}</div>
    </div>
  `
            )
            .join("")}
</body>
</html>`;

    const win = window.open("", "_blank");
    if (win) {
        win.document.write(html);
        win.document.close();
        setTimeout(() => win.print(), 500);
    }
}

function downloadFile(filename: string, content: string, type: string): void {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function sanitizeFilename(name: string): string {
    return name.replace(/[<>:"/\\|?*]/g, "-").slice(0, 100) || "chat-export";
}

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
