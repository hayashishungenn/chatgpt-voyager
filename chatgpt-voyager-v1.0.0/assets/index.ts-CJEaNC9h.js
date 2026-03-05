import { g as getFolders, a as getFolderAssignments, b as generateId, s as saveFolders, c as assignConversationToFolder, d as getSettings, e as getPrompts, f as savePrompt, h as deletePrompt, i as getStarredMessages, t as toggleStarMessage } from "./storage-G_NSCLrW.js";
function initDeepResearch() {
  processThinkingBlocks();
  const main2 = document.querySelector("main");
  if (main2) {
    const obs = new MutationObserver(() => processThinkingBlocks());
    obs.observe(main2, { childList: true, subtree: true });
  }
}
function processThinkingBlocks() {
  const selectors = [
    "details:not([data-cvoy-processed])",
    '[data-testid="thinking-block"]:not([data-cvoy-processed])',
    ".thinking-block:not([data-cvoy-processed])",
    '[class*="thinking"]:not([data-cvoy-processed])'
  ];
  const elements = document.querySelectorAll(selectors.join(", "));
  elements.forEach((el) => {
    el.setAttribute("data-cvoy-processed", "1");
    const summary = el.querySelector("summary");
    const summaryText = (summary == null ? void 0 : summary.textContent) ?? "";
    if (!summaryText.match(/think|reason|thought/i) && el.tagName !== "DETAILS") return;
    injectExtractButton(el);
  });
}
function injectExtractButton(el) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "cvoy-research-extract-btn";
  btn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
    Extract
  `;
  btn.addEventListener("click", () => extractResearch(el));
  el.appendChild(btn);
}
function extractResearch(el) {
  var _a, _b;
  const clone = el.cloneNode(true);
  (_a = clone.querySelector(".cvoy-research-extract-btn")) == null ? void 0 : _a.remove();
  const text = ((_b = clone.textContent) == null ? void 0 : _b.trim()) ?? "";
  const urls = [];
  el.querySelectorAll("a[href]").forEach((a) => {
    const href = a.href;
    if (href.startsWith("http")) urls.push(href);
  });
  showExtractModal(text, urls);
}
function showExtractModal(text, urls) {
  var _a;
  (_a = document.getElementById("cvoy-research-modal")) == null ? void 0 : _a.remove();
  const overlay = document.createElement("div");
  overlay.id = "cvoy-research-modal";
  overlay.className = "cvoy-modal-overlay";
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });
  const modal = document.createElement("div");
  modal.className = "cvoy-modal";
  modal.innerHTML = `
    <div class="cvoy-modal-header">
      <span class="cvoy-modal-title">🔬 Deep Research Extract</span>
      <button class="cvoy-btn cvoy-btn-ghost" id="cvoy-research-close" style="font-size:18px;padding:0 6px;border:none;cursor:pointer;background:none">×</button>
    </div>
    <div class="cvoy-modal-body">
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <button id="cvoy-research-copy-text" class="cvoy-btn cvoy-btn-secondary" style="font-size:12px;padding:4px 10px">Copy Thinking Text</button>
        ${urls.length ? `<button id="cvoy-research-copy-urls" class="cvoy-btn cvoy-btn-secondary" style="font-size:12px;padding:4px 10px">Copy ${urls.length} URLs</button>` : ""}
      </div>
      <textarea class="cvoy-input cvoy-textarea" style="min-height:200px;font-size:12px;font-family:monospace" readonly>${escapeHtml$3(text)}</textarea>
      ${urls.length ? `
        <div style="margin-top:16px">
          <div style="font-size:12px;font-weight:600;margin-bottom:8px;color:var(--cvoy-text-muted)">REFERENCED URLS (${urls.length})</div>
          <div style="max-height:160px;overflow-y:auto">
            ${urls.map((url, i) => `
              <div style="padding:4px 0;font-size:12px;display:flex;gap:6px;align-items:center">
                <span style="color:var(--cvoy-text-muted);width:20px;text-align:right;flex-shrink:0">${i + 1}.</span>
                <a href="${url}" target="_blank" style="color:var(--cvoy-primary);text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml$3(url)}</a>
              </div>
            `).join("")}
          </div>
        </div>
      ` : ""}
    </div>
  `;
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  modal.querySelector("#cvoy-research-close").addEventListener("click", () => overlay.remove());
  modal.querySelector("#cvoy-research-copy-text").addEventListener("click", async () => {
    await navigator.clipboard.writeText(text);
    modal.querySelector("#cvoy-research-copy-text").textContent = "✓ Copied!";
  });
  const copyUrlsBtn = modal.querySelector("#cvoy-research-copy-urls");
  if (copyUrlsBtn) {
    copyUrlsBtn.addEventListener("click", async () => {
      await navigator.clipboard.writeText(urls.join("\n"));
      copyUrlsBtn.textContent = "✓ Copied!";
    });
  }
}
function escapeHtml$3(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
const SELECTORS = {
  // Sidebar
  sidebar: 'nav[aria-label="Chat history"]',
  userMessage: '[data-message-author-role="user"]',
  assistantMessage: '[data-message-author-role="assistant"]',
  // Input area
  promptTextarea: "#prompt-textarea",
  composerForm: "form",
  // Model selector
  modelSelector: 'button[aria-label="Model selector"], button[aria-haspopup="menu"][aria-label*="model" i], button[class*="model-selector"]',
  modelMenuItems: '[role="menuitem"], [role="option"]',
  // Conversation title in header
  conversationTitle: 'h1[class*="title"], [data-testid="conversation-title"]'
};
function getCurrentConversationId() {
  const match = location.pathname.match(/\/c\/([a-f0-9-]+)/);
  return match ? match[1] : null;
}
function getConversationTitle() {
  const h1 = document.querySelector(SELECTORS.conversationTitle);
  if (h1 == null ? void 0 : h1.textContent) return h1.textContent.trim();
  return document.title.replace(" - ChatGPT", "").trim();
}
function getAllMessages() {
  return Array.from(document.querySelectorAll(SELECTORS.userMessage + ", " + SELECTORS.assistantMessage));
}
function insertIntoTextarea(text) {
  const editor = document.querySelector(SELECTORS.promptTextarea);
  if (!editor) return;
  editor.focus();
  const selection = window.getSelection();
  if (selection) {
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }
  document.execCommand("insertText", false, text);
  editor.dispatchEvent(new InputEvent("input", { bubbles: true }));
}
function initExport() {
  injectExportButton();
}
function injectExportButton() {
  if (document.getElementById("cvoy-export-btn-container")) return;
  const titleArea = document.querySelector("header") ?? document.querySelector("main > div:first-child");
  if (!titleArea) return;
  const container = document.createElement("div");
  container.id = "cvoy-export-btn-container";
  container.style.cssText = "display:flex;align-items:center;gap:6px;position:fixed;top:10px;right:48px;z-index:999";
  const btn = document.createElement("button");
  btn.className = "cvoy-export-btn";
  btn.title = "Export Conversation — ChatGPT Voyager";
  btn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    Export
  `;
  btn.addEventListener("click", showExportMenu);
  container.appendChild(btn);
  document.body.appendChild(container);
}
function showExportMenu() {
  const existing = document.getElementById("cvoy-export-menu");
  if (existing) {
    existing.remove();
    return;
  }
  const menu = document.createElement("div");
  menu.id = "cvoy-export-menu";
  menu.className = "cvoy-context-menu";
  menu.style.cssText = "position:fixed;top:48px;right:48px;z-index:9999";
  const formats = [
    { label: "📋 Export as JSON", action: () => exportJson() },
    { label: "📝 Export as Markdown", action: () => exportMarkdown() },
    { label: "🖨️ Print / Save as PDF", action: () => exportPdf() }
  ];
  formats.forEach(({ label, action }) => {
    const item = document.createElement("div");
    item.className = "cvoy-context-item";
    item.textContent = label;
    item.addEventListener("click", () => {
      menu.remove();
      action();
    });
    menu.appendChild(item);
  });
  document.body.appendChild(menu);
  setTimeout(() => document.addEventListener("click", () => menu.remove(), { once: true }), 0);
}
function getMessages() {
  const elements = getAllMessages();
  return elements.map((el, index) => ({
    role: el.getAttribute("data-message-author-role") ?? "assistant",
    content: extractMessageContent(el),
    index
  }));
}
function extractMessageContent(el) {
  var _a;
  const proseEl = el.querySelector(".prose, .markdown, [class*='prose']") ?? el;
  const clone = proseEl.cloneNode(true);
  clone.querySelectorAll("pre code").forEach((code) => {
    var _a2;
    const lang = ((_a2 = code.className.match(/language-(\w+)/)) == null ? void 0 : _a2[1]) ?? "";
    code.parentElement.replaceWith(`\`\`\`${lang}
${code.textContent}
\`\`\``);
  });
  return ((_a = clone.textContent) == null ? void 0 : _a.trim()) ?? "";
}
function exportJson() {
  const messages = getMessages();
  const title = getConversationTitle();
  const convId = getCurrentConversationId();
  const data = {
    id: convId,
    title,
    exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content
    }))
  };
  downloadFile(
    `${sanitizeFilename(title)}.json`,
    JSON.stringify(data, null, 2),
    "application/json"
  );
}
function exportMarkdown() {
  const messages = getMessages();
  const title = getConversationTitle();
  const lines = [
    `# ${title}`,
    ``,
    `> Exported from ChatGPT on ${(/* @__PURE__ */ new Date()).toLocaleDateString()}`,
    ``
  ];
  messages.forEach((m) => {
    lines.push(`## ${m.role === "user" ? "🧑 You" : "🤖 ChatGPT"}`);
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
function exportPdf() {
  const messages = getMessages();
  const title = getConversationTitle();
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml$2(title)}</title>
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
  <h1>${escapeHtml$2(title)}</h1>
  <p style="color:#9b9b9b;font-size:12px">Exported from ChatGPT on ${(/* @__PURE__ */ new Date()).toLocaleString()}</p>
  ${messages.map(
    (m) => `
    <div class="message ${m.role}">
      <div class="role">${m.role === "user" ? "You" : "ChatGPT"}</div>
      <div>${escapeHtml$2(m.content).replace(/\n/g, "<br>")}</div>
    </div>
  `
  ).join("")}
</body>
</html>`;
  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  }
}
function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
function sanitizeFilename(name) {
  return name.replace(/[<>:"/\\|?*]/g, "-").slice(0, 100) || "chat-export";
}
function escapeHtml$2(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
const FOLDER_COLORS = [
  "#10a37f",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#84cc16"
];
let foldersContainer = null;
let contextMenu = null;
let folders = [];
let assignments = [];
let expandedFolders = /* @__PURE__ */ new Set();
let batchMode = false;
let selectedConvIds = /* @__PURE__ */ new Set();
async function initFolders() {
  folders = await getFolders();
  assignments = await getFolderAssignments();
  injectFolderUI();
  setupFolderDragDrop();
}
async function refreshFolders() {
  folders = await getFolders();
  assignments = await getFolderAssignments();
  renderFolderList();
}
function injectFolderUI() {
  const sidebar = document.querySelector(SELECTORS.sidebar);
  if (!sidebar || document.getElementById("cvoy-folders")) return;
  foldersContainer = document.createElement("div");
  foldersContainer.id = "cvoy-folders";
  foldersContainer.className = "cvoy-folder-section";
  const header = document.createElement("div");
  header.className = "cvoy-folder-header";
  header.innerHTML = `
    <span>📂 Folders</span>
    <div style="display:flex;gap:4px">
      <button id="cvoy-add-folder" title="New Folder" style="background:none;border:none;cursor:pointer;padding:0 4px;font-size:14px;color:inherit">+</button>
      <button id="cvoy-toggle-batch" title="Batch Delete" style="background:none;border:none;cursor:pointer;padding:0 4px;font-size:12px;color:inherit" title="Batch delete">✓</button>
    </div>
  `;
  const folderList = document.createElement("div");
  folderList.id = "cvoy-folder-list";
  foldersContainer.appendChild(header);
  foldersContainer.appendChild(folderList);
  sidebar.insertBefore(foldersContainer, sidebar.firstChild);
  header.querySelector("#cvoy-add-folder").addEventListener("click", (e) => {
    e.stopPropagation();
    showCreateFolderDialog(null);
  });
  header.querySelector("#cvoy-toggle-batch").addEventListener("click", (e) => {
    e.stopPropagation();
    toggleBatchMode();
  });
  renderFolderList();
}
function renderFolderList() {
  const list = document.getElementById("cvoy-folder-list");
  if (!list) return;
  list.innerHTML = "";
  const topLevelFolders = folders.filter((f) => !f.parentId);
  topLevelFolders.forEach((folder) => {
    list.appendChild(createFolderElement(folder, 0));
    if (expandedFolders.has(folder.id)) {
      const children = folders.filter((f) => f.parentId === folder.id);
      children.forEach((child) => {
        list.appendChild(createFolderElement(child, 1));
      });
    }
  });
  if (batchMode) {
    const sidebar = document.querySelector(SELECTORS.sidebar);
    renderBatchToolbar(sidebar);
    addBatchCheckboxes();
  }
}
function createFolderElement(folder, depth) {
  const item = document.createElement("div");
  item.className = `cvoy-folder-item${depth > 0 ? " cvoy-subfolder" : ""}`;
  item.dataset.folderId = folder.id;
  item.draggable = true;
  const convCount = assignments.filter((a) => a.folderId === folder.id).length;
  const hasChildren = folders.some((f) => f.parentId === folder.id);
  const isExpanded = expandedFolders.has(folder.id);
  item.innerHTML = `
    <span style="font-size:10px;color:var(--cvoy-text-muted);width:12px">${hasChildren ? isExpanded ? "▾" : "▸" : ""}</span>
    <span class="cvoy-folder-color-dot" style="background:${folder.color}"></span>
    <span class="cvoy-folder-name">${escapeHtml$1(folder.name)}</span>
    <span class="cvoy-folder-count">${convCount || ""}</span>
  `;
  item.addEventListener("click", () => {
    if (hasChildren) {
      if (expandedFolders.has(folder.id)) {
        expandedFolders.delete(folder.id);
      } else {
        expandedFolders.add(folder.id);
      }
    }
    filterSidebarByFolder(folder.id);
    renderFolderList();
  });
  item.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    showFolderContextMenu(folder, e.clientX, e.clientY);
  });
  item.addEventListener("dragover", (e) => {
    e.preventDefault();
    item.classList.add("cvoy-drop-target");
  });
  item.addEventListener("dragleave", () => item.classList.remove("cvoy-drop-target"));
  item.addEventListener("drop", async (e) => {
    var _a, _b;
    e.preventDefault();
    item.classList.remove("cvoy-drop-target");
    const convId = (_a = e.dataTransfer) == null ? void 0 : _a.getData("text/conversationId");
    const childFolderId = (_b = e.dataTransfer) == null ? void 0 : _b.getData("text/folderId");
    if (convId) {
      await assignConversationToFolder(convId, folder.id);
      assignments = await getFolderAssignments();
      renderFolderList();
    } else if (childFolderId && childFolderId !== folder.id) {
      const draggedFolder = folders.find((f) => f.id === childFolderId);
      if (draggedFolder && !draggedFolder.parentId) {
        draggedFolder.parentId = folder.id;
        await saveFolders(folders);
        renderFolderList();
      }
    }
  });
  return item;
}
function filterSidebarByFolder(folderId) {
  const assignedConvIds = assignments.filter((a) => a.folderId === folderId).map((a) => a.conversationId);
  const items = document.querySelectorAll(`${SELECTORS.sidebar} li`);
  items.forEach((item) => {
    var _a;
    const link = item.querySelector("a");
    const href = (link == null ? void 0 : link.getAttribute("href")) ?? "";
    const convId = (_a = href.match(/\/c\/([a-f0-9-]+)/)) == null ? void 0 : _a[1];
    if (convId) {
      item.style.display = assignedConvIds.includes(convId) ? "" : "none";
    }
  });
}
function showFolderContextMenu(folder, x, y) {
  removeContextMenu();
  contextMenu = document.createElement("div");
  contextMenu.className = "cvoy-context-menu";
  contextMenu.style.left = x + "px";
  contextMenu.style.top = y + "px";
  const menuItems = [
    { label: "✏️ Rename", action: () => renameFolderDialog(folder) },
    { label: "📁 Add Subfolder", action: () => showCreateFolderDialog(folder.id) },
    { label: "🎨 Change Color", action: () => changeColorMenu(folder, contextMenu) },
    {
      label: "🔗 Move to Root",
      action: async () => {
        folder.parentId = null;
        await saveFolders(folders);
        renderFolderList();
      },
      hidden: !folder.parentId
    },
    { label: "🗑️ Delete Folder", action: () => deleteFolderDialog(folder), danger: true }
  ];
  menuItems.filter((i) => !i.hidden).forEach(({ label, action, danger }) => {
    const item = document.createElement("div");
    item.className = `cvoy-context-item${danger ? " danger" : ""}`;
    item.textContent = label;
    item.addEventListener("click", () => {
      action();
      removeContextMenu();
    });
    contextMenu.appendChild(item);
  });
  document.body.appendChild(contextMenu);
  setTimeout(() => document.addEventListener("click", removeContextMenu, { once: true }), 0);
}
function changeColorMenu(folder, parent) {
  const colorPicker = document.createElement("div");
  colorPicker.style.cssText = "display:flex;flex-wrap:wrap;gap:6px;padding:8px;max-width:160px";
  FOLDER_COLORS.forEach((color) => {
    const dot = document.createElement("div");
    dot.style.cssText = `width:20px;height:20px;border-radius:50%;background:${color};cursor:pointer;border:2px solid ${folder.color === color ? "#fff" : "transparent"};box-shadow:0 0 0 1px ${color}`;
    dot.addEventListener("click", async () => {
      folder.color = color;
      await saveFolders(folders);
      renderFolderList();
      removeContextMenu();
    });
    colorPicker.appendChild(dot);
  });
  parent.appendChild(colorPicker);
}
function renameFolderDialog(folder) {
  const name = prompt("Rename folder:", folder.name);
  if (name === null || !name.trim()) return;
  folder.name = name.trim();
  saveFolders(folders).then(renderFolderList);
}
function deleteFolderDialog(folder) {
  if (!confirm(`Delete folder "${folder.name}"? Conversations will not be deleted.`)) return;
  const idx = folders.findIndex((f) => f.id === folder.id);
  if (idx >= 0) folders.splice(idx, 1);
  const children = folders.filter((f) => f.parentId === folder.id);
  children.forEach((child) => {
    const ci = folders.findIndex((f) => f.id === child.id);
    if (ci >= 0) folders.splice(ci, 1);
  });
  saveFolders(folders).then(renderFolderList);
}
function removeContextMenu() {
  if (contextMenu) {
    contextMenu.remove();
    contextMenu = null;
  }
}
function showCreateFolderDialog(parentId) {
  const name = prompt("New folder name:");
  if (!name || !name.trim()) return;
  const newFolder = {
    id: generateId(),
    name: name.trim(),
    color: FOLDER_COLORS[Math.floor(Math.random() * FOLDER_COLORS.length)],
    parentId,
    createdAt: Date.now(),
    order: folders.length
  };
  folders.push(newFolder);
  saveFolders(folders).then(renderFolderList);
}
function setupFolderDragDrop() {
  document.addEventListener("dragstart", (e) => {
    var _a, _b, _c, _d, _e, _f, _g;
    const item = (_b = (_a = e.target) == null ? void 0 : _a.closest) == null ? void 0 : _b.call(_a, `${SELECTORS.sidebar} li`);
    if (!item) return;
    const link = item.querySelector("a");
    const href = (link == null ? void 0 : link.getAttribute("href")) ?? "";
    const convId = (_c = href.match(/\/c\/([a-f0-9-]+)/)) == null ? void 0 : _c[1];
    if (convId) {
      (_d = e.dataTransfer) == null ? void 0 : _d.setData("text/conversationId", convId);
    }
    const folderItem = (_f = (_e = e.target) == null ? void 0 : _e.closest) == null ? void 0 : _f.call(_e, ".cvoy-folder-item");
    if (folderItem) {
      const fid = folderItem.dataset.folderId;
      if (fid) (_g = e.dataTransfer) == null ? void 0 : _g.setData("text/folderId", fid);
    }
  });
}
function toggleBatchMode() {
  var _a;
  batchMode = !batchMode;
  selectedConvIds.clear();
  if (!batchMode) {
    document.querySelectorAll(`${SELECTORS.sidebar} li`).forEach((li) => {
      var _a2;
      li.style.display = "";
      (_a2 = li.querySelector(".cvoy-batch-checkbox")) == null ? void 0 : _a2.remove();
    });
    (_a = document.getElementById("cvoy-batch-toolbar")) == null ? void 0 : _a.remove();
  } else {
    renderFolderList();
  }
}
function addBatchCheckboxes() {
  const items = document.querySelectorAll(`${SELECTORS.sidebar} li`);
  items.forEach((item) => {
    var _a;
    if (item.querySelector(".cvoy-batch-checkbox")) return;
    const link = item.querySelector("a");
    const href = (link == null ? void 0 : link.getAttribute("href")) ?? "";
    const convId = (_a = href.match(/\/c\/([a-f0-9-]+)/)) == null ? void 0 : _a[1];
    if (!convId) return;
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.className = "cvoy-batch-checkbox";
    cb.checked = selectedConvIds.has(convId);
    cb.addEventListener("change", () => {
      if (cb.checked) selectedConvIds.add(convId);
      else selectedConvIds.delete(convId);
      updateBatchToolbar();
    });
    item.insertBefore(cb, item.firstChild);
  });
}
function renderBatchToolbar(parent) {
  var _a;
  (_a = document.getElementById("cvoy-batch-toolbar")) == null ? void 0 : _a.remove();
  const toolbar = document.createElement("div");
  toolbar.id = "cvoy-batch-toolbar";
  toolbar.className = "cvoy-batch-toolbar";
  toolbar.innerHTML = `
    <span id="cvoy-batch-count">0 selected</span>
    <button id="cvoy-batch-delete" class="cvoy-btn cvoy-btn-danger" style="font-size:11px;padding:2px 8px">Delete Selected</button>
    <button id="cvoy-batch-cancel" class="cvoy-btn cvoy-btn-ghost" style="font-size:11px;padding:2px 8px">Cancel</button>
  `;
  parent.appendChild(toolbar);
  toolbar.querySelector("#cvoy-batch-delete").addEventListener("click", batchDeleteSelected);
  toolbar.querySelector("#cvoy-batch-cancel").addEventListener("click", toggleBatchMode);
}
function updateBatchToolbar() {
  const countEl = document.getElementById("cvoy-batch-count");
  if (countEl) countEl.textContent = `${selectedConvIds.size} selected`;
}
async function batchDeleteSelected() {
  var _a;
  if (selectedConvIds.size === 0) return;
  if (!confirm(`Delete ${selectedConvIds.size} conversation(s)? This cannot be undone.`)) return;
  for (const convId of selectedConvIds) {
    const item = (_a = document.querySelector(`${SELECTORS.sidebar} li a[href="/c/${convId}"]`)) == null ? void 0 : _a.closest("li");
    if (item) {
      const moreBtn = item.querySelector('button[aria-label*="options" i], button[aria-label*="more" i]');
      if (moreBtn) {
        moreBtn.click();
        await sleep$1(300);
        const deleteBtn = document.querySelector('[role="menuitem"]:last-child, [data-testid="delete-chat"]');
        if (deleteBtn) {
          deleteBtn.click();
          await sleep$1(200);
          const confirmBtn = document.querySelector('button[data-testid="delete-conversation-confirm-button"], button.btn-danger');
          confirmBtn == null ? void 0 : confirmBtn.click();
          await sleep$1(500);
        }
      }
    }
  }
  selectedConvIds.clear();
  toggleBatchMode();
}
function sleep$1(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
function escapeHtml$1(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function initFormulaCopy() {
  processFormulas();
  const main2 = document.querySelector("main");
  if (main2) {
    const obs = new MutationObserver(() => processFormulas());
    obs.observe(main2, { childList: true, subtree: true });
  }
}
function processFormulas() {
  document.querySelectorAll(".katex:not([data-cvoy-processed])").forEach((el) => {
    var _a, _b;
    el.setAttribute("data-cvoy-processed", "1");
    const annotation = el.querySelector("annotation[encoding='application/x-tex']");
    const latex = (_a = annotation == null ? void 0 : annotation.textContent) == null ? void 0 : _a.trim();
    if (!latex) return;
    const wrapper = document.createElement("span");
    wrapper.style.cssText = "display:inline-flex;align-items:center;gap:4px";
    (_b = el.parentNode) == null ? void 0 : _b.insertBefore(wrapper, el);
    wrapper.appendChild(el);
    const copyLatexBtn = createCopyBtn("LaTeX", () => copyText(latex, copyLatexBtn));
    const mathml = el.querySelector("math");
    wrapper.appendChild(copyLatexBtn);
    if (mathml) {
      const copyMathmlBtn = createCopyBtn(
        "MathML",
        () => copyText(mathml.outerHTML, copyMathmlBtn)
      );
      wrapper.appendChild(copyMathmlBtn);
    }
  });
  document.querySelectorAll("mjx-container:not([data-cvoy-processed])").forEach((el) => {
    var _a, _b, _c;
    el.setAttribute("data-cvoy-processed", "1");
    const script = el.previousElementSibling;
    if ((script == null ? void 0 : script.tagName) === "SCRIPT" && ((_a = script.getAttribute("type")) == null ? void 0 : _a.includes("math"))) {
      const latex = (_b = script.textContent) == null ? void 0 : _b.trim();
      if (latex) {
        const btn = createCopyBtn("LaTeX", () => copyText(latex, btn));
        (_c = el.parentNode) == null ? void 0 : _c.insertBefore(btn, el.nextSibling);
      }
    }
  });
}
function createCopyBtn(label, onClick) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "cvoy-formula-copy-btn";
  btn.textContent = `Copy ${label}`;
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    onClick();
  });
  return btn;
}
async function copyText(text, btn) {
  try {
    await navigator.clipboard.writeText(text);
    const original = btn.textContent;
    btn.textContent = "✓ Copied!";
    btn.style.color = "var(--cvoy-primary)";
    setTimeout(() => {
      btn.textContent = original;
      btn.style.color = "";
    }, 2e3);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
}
const scriptRel = "modulepreload";
const assetsURL = function(dep) {
  return "/" + dep;
};
const seen = {};
const __vitePreload = function preload(baseModule, deps, importerUrl) {
  let promise = Promise.resolve();
  if (deps && deps.length > 0) {
    let allSettled2 = function(promises) {
      return Promise.all(
        promises.map(
          (p) => Promise.resolve(p).then(
            (value) => ({ status: "fulfilled", value }),
            (reason) => ({ status: "rejected", reason })
          )
        )
      );
    };
    document.getElementsByTagName("link");
    const cspNonceMeta = document.querySelector(
      "meta[property=csp-nonce]"
    );
    const cspNonce = (cspNonceMeta == null ? void 0 : cspNonceMeta.nonce) || (cspNonceMeta == null ? void 0 : cspNonceMeta.getAttribute("nonce"));
    promise = allSettled2(
      deps.map((dep) => {
        dep = assetsURL(dep);
        if (dep in seen) return;
        seen[dep] = true;
        const isCss = dep.endsWith(".css");
        const cssSelector = isCss ? '[rel="stylesheet"]' : "";
        if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
          return;
        }
        const link = document.createElement("link");
        link.rel = isCss ? "stylesheet" : scriptRel;
        if (!isCss) {
          link.as = "script";
        }
        link.crossOrigin = "";
        link.href = dep;
        if (cspNonce) {
          link.setAttribute("nonce", cspNonce);
        }
        document.head.appendChild(link);
        if (isCss) {
          return new Promise((res, rej) => {
            link.addEventListener("load", res);
            link.addEventListener(
              "error",
              () => rej(new Error(`Unable to preload CSS for ${dep}`))
            );
          });
        }
      })
    );
  }
  function handlePreloadError(err) {
    const e = new Event("vite:preloadError", {
      cancelable: true
    });
    e.payload = err;
    window.dispatchEvent(e);
    if (!e.defaultPrevented) {
      throw err;
    }
  }
  return promise.then((res) => {
    for (const item of res || []) {
      if (item.status !== "rejected") continue;
      handlePreloadError(item.reason);
    }
    return baseModule().catch(handlePreloadError);
  });
};
let quoteBtn = null;
function initQuoteReply() {
  document.addEventListener("mouseup", onSelectionChange);
  document.addEventListener("keyup", onSelectionChange);
}
function onSelectionChange() {
  var _a, _b;
  const selection = window.getSelection();
  const text = selection == null ? void 0 : selection.toString().trim();
  if (!text || text.length < 5) {
    quoteBtn == null ? void 0 : quoteBtn.remove();
    quoteBtn = null;
    return;
  }
  const range = selection.getRangeAt(0);
  const ancestor = range.commonAncestorContainer;
  const msgEl = ((_a = ancestor == null ? void 0 : ancestor.closest) == null ? void 0 : _a.call(ancestor, SELECTORS.assistantMessage)) ?? ((_b = ancestor.parentElement) == null ? void 0 : _b.closest(SELECTORS.assistantMessage));
  if (!msgEl) {
    quoteBtn == null ? void 0 : quoteBtn.remove();
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
  const rect = range.getBoundingClientRect();
  quoteBtn.style.left = `${rect.left + window.scrollX}px`;
  quoteBtn.style.top = `${rect.bottom + window.scrollY + 6}px`;
  const captured = text;
  quoteBtn.onclick = () => {
    var _a2;
    const quoted = captured.split("\n").map((line) => `> ${line}`).join("\n");
    insertIntoTextarea(`${quoted}

`);
    quoteBtn == null ? void 0 : quoteBtn.remove();
    quoteBtn = null;
    (_a2 = window.getSelection()) == null ? void 0 : _a2.removeAllRanges();
  };
}
function initTabTitleSync() {
  syncTitleOnce();
  const obs = new MutationObserver(syncTitleOnce);
  obs.observe(document.querySelector("title") ?? document.documentElement, {
    subtree: true,
    characterData: true,
    childList: true
  });
}
function syncTitleOnce() {
  var _a;
  const h1 = document.querySelector("h1");
  if ((_a = h1 == null ? void 0 : h1.textContent) == null ? void 0 : _a.trim()) {
    const title = h1.textContent.trim();
    if (document.title !== `${title} - ChatGPT`) {
      document.title = `${title} - ChatGPT`;
    }
  }
}
function initPreventAutoScroll() {
  const textarea = document.querySelector(SELECTORS.promptTextarea);
  if (!textarea) return;
  textarea.addEventListener("keydown", (e) => {
    const ke = e;
    if (ke.key === "Enter" && !ke.shiftKey) {
      const main2 = document.querySelector("main");
      if (!main2) return;
      const scrollPos = main2.scrollTop;
      requestAnimationFrame(() => {
        if (main2.scrollHeight - main2.scrollTop - main2.clientHeight > 200) {
          main2.scrollTop = scrollPos;
        }
      });
    }
  });
}
function initInputCollapse() {
  const textarea = document.querySelector(SELECTORS.promptTextarea);
  if (!textarea) return;
  document.body.classList.add("cvoy-input-collapsed");
  textarea.addEventListener("focus", () => {
    document.body.classList.remove("cvoy-input-collapsed");
  });
  textarea.addEventListener("blur", () => {
    setTimeout(() => {
      var _a;
      if (!((_a = document.activeElement) == null ? void 0 : _a.closest(SELECTORS.composerForm))) {
        document.body.classList.add("cvoy-input-collapsed");
      }
    }, 200);
  });
}
async function initDefaultModel() {
  const settings = await getSettings();
  if (!settings.defaultModel) return;
  if (!location.pathname.match(/\/c\/[a-f0-9-]+/)) {
    await sleep(1500);
    selectModel(settings.defaultModel);
  }
}
function selectModel(modelName) {
  const modelBtn = document.querySelector(SELECTORS.modelSelector);
  if (!modelBtn) return;
  modelBtn.click();
  setTimeout(() => {
    var _a;
    const items = document.querySelectorAll(SELECTORS.modelMenuItems);
    for (const item of Array.from(items)) {
      if ((_a = item.textContent) == null ? void 0 : _a.toLowerCase().includes(modelName.toLowerCase())) {
        item.click();
        break;
      }
    }
  }, 400);
}
function initHideRecents() {
  document.body.classList.add("cvoy-hide-recents");
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
function disableHideRecents() {
  var _a;
  document.body.classList.remove("cvoy-hide-recents");
  (_a = document.getElementById("cvoy-hide-recents-style")) == null ? void 0 : _a.remove();
}
async function initMermaidRendering() {
  const { default: mermaid } = await __vitePreload(async () => {
    const { default: mermaid2 } = await import("./mermaid.core-mHttblf5.js").then((n) => n.bE);
    return { default: mermaid2 };
  }, true ? [] : void 0);
  mermaid.initialize({ startOnLoad: false, theme: "neutral" });
  processMermaidBlocks(mermaid);
  const main2 = document.querySelector("main");
  if (main2) {
    const obs = new MutationObserver(() => processMermaidBlocks(mermaid));
    obs.observe(main2, { childList: true, subtree: true });
  }
}
function processMermaidBlocks(mermaid) {
  document.querySelectorAll("code.language-mermaid:not([data-cvoy-rendered])").forEach(async (codeEl) => {
    var _a;
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
      (_a = pre.parentNode) == null ? void 0 : _a.insertBefore(container, pre.nextSibling);
    } catch {
    }
  });
}
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
let prompts = [];
let searchQuery = "";
let editingPrompt = null;
async function initPromptVault() {
  prompts = await getPrompts();
  injectPromptButton();
}
function injectPromptButton() {
  var _a;
  if (document.getElementById("cvoy-prompt-btn")) return;
  const form = document.querySelector(SELECTORS.composerForm);
  if (!form) return;
  const btn = document.createElement("button");
  btn.id = "cvoy-prompt-btn";
  btn.type = "button";
  btn.className = "cvoy-prompt-btn";
  btn.title = "Prompt Vault — ChatGPT Voyager";
  btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
  btn.addEventListener("click", openVaultModal);
  const submitBtn = form.querySelector('[data-testid="send-button"], button[aria-label="Send prompt"]');
  if (submitBtn) {
    (_a = submitBtn.parentElement) == null ? void 0 : _a.insertBefore(btn, submitBtn);
  } else {
    form.appendChild(btn);
  }
}
function openVaultModal() {
  if (document.getElementById("cvoy-vault-modal")) {
    closeVaultModal();
    return;
  }
  prompts = [];
  getPrompts().then((p) => {
    prompts = p;
    renderVaultModal();
  });
  renderVaultModal();
}
function renderVaultModal() {
  var _a;
  (_a = document.getElementById("cvoy-vault-modal")) == null ? void 0 : _a.remove();
  const overlay = document.createElement("div");
  overlay.id = "cvoy-vault-modal";
  overlay.className = "cvoy-modal-overlay";
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeVaultModal();
  });
  const modal = document.createElement("div");
  modal.className = "cvoy-modal";
  modal.innerHTML = `
    <div class="cvoy-modal-header">
      <span class="cvoy-modal-title">💡 Prompt Vault</span>
      <div style="display:flex;gap:8px">
        <button id="cvoy-vault-new" class="cvoy-btn cvoy-btn-primary" style="font-size:12px;padding:4px 10px">+ New Prompt</button>
        <button id="cvoy-vault-close" class="cvoy-btn-ghost" style="width:28px;height:28px;padding:0;display:flex;align-items:center;justify-content:center;border:none;cursor:pointer;background:none;font-size:18px;color:var(--cvoy-text-muted)">×</button>
      </div>
    </div>
    <div style="padding:12px 20px 0">
      <input id="cvoy-vault-search" class="cvoy-input" placeholder="Search prompts…" value="${escapeHtml(searchQuery)}" />
    </div>
    <div class="cvoy-modal-body" id="cvoy-vault-list">
      ${renderPromptList()}
    </div>
  `;
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  modal.querySelector("#cvoy-vault-close").addEventListener("click", closeVaultModal);
  modal.querySelector("#cvoy-vault-new").addEventListener("click", () => showEditForm(null));
  const searchInput = modal.querySelector("#cvoy-vault-search");
  searchInput.addEventListener("input", () => {
    searchQuery = searchInput.value;
    const list = document.getElementById("cvoy-vault-list");
    if (list) list.innerHTML = renderPromptList();
    bindPromptListEvents();
  });
  bindPromptListEvents();
}
function renderPromptList() {
  const filtered = prompts.filter(
    (p) => !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.content.toLowerCase().includes(searchQuery.toLowerCase())
  );
  if (filtered.length === 0) {
    return `<div style="text-align:center;color:var(--cvoy-text-muted);padding:40px 0">
      ${searchQuery ? "No prompts found" : 'No prompts yet. Click "+ New Prompt" to create one.'}
    </div>`;
  }
  return filtered.map(
    (p) => `
    <div class="cvoy-prompt-card" data-prompt-id="${p.id}" style="border:1px solid var(--cvoy-border);border-radius:8px;padding:12px;margin-bottom:8px;cursor:pointer;transition:border-color 0.15s">
      <div style="display:flex;align-items:flex-start;gap:8px">
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;font-size:14px;color:var(--cvoy-text);margin-bottom:4px">${escapeHtml(p.title)}</div>
          <div style="font-size:12px;color:var(--cvoy-text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(p.content.slice(0, 100))}${p.content.length > 100 ? "…" : ""}</div>
          ${p.tags.length ? `<div style="margin-top:6px;display:flex;gap:4px;flex-wrap:wrap">${p.tags.map((t) => `<span style="background:var(--cvoy-bg-secondary);padding:1px 6px;border-radius:4px;font-size:10px;color:var(--cvoy-text-muted)">${escapeHtml(t)}</span>`).join("")}</div>` : ""}
        </div>
        <div style="display:flex;gap:4px;flex-shrink:0">
          <button class="cvoy-btn-ghost cvoy-prompt-use" data-prompt-id="${p.id}" title="Use prompt" style="font-size:11px;padding:3px 7px;border:1px solid var(--cvoy-border);border-radius:6px;cursor:pointer;background:none;color:var(--cvoy-text)">Use ↵</button>
          <button class="cvoy-btn-ghost cvoy-prompt-edit" data-prompt-id="${p.id}" title="Edit" style="font-size:11px;padding:3px 7px;border:1px solid var(--cvoy-border);border-radius:6px;cursor:pointer;background:none;color:var(--cvoy-text)">✏️</button>
          <button class="cvoy-btn-ghost cvoy-prompt-del" data-prompt-id="${p.id}" title="Delete" style="font-size:11px;padding:3px 7px;border:1px solid #ef4444;border-radius:6px;cursor:pointer;background:none;color:#ef4444">✕</button>
        </div>
      </div>
    </div>
  `
  ).join("");
}
function bindPromptListEvents() {
  document.querySelectorAll(".cvoy-prompt-use").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.dataset.promptId;
      const prompt2 = prompts.find((p) => p.id === id);
      if (prompt2) {
        insertIntoTextarea(prompt2.content);
        closeVaultModal();
      }
    });
  });
  document.querySelectorAll(".cvoy-prompt-edit").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.dataset.promptId;
      const prompt2 = prompts.find((p) => p.id === id);
      if (prompt2) showEditForm(prompt2);
    });
  });
  document.querySelectorAll(".cvoy-prompt-del").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const id = btn.dataset.promptId;
      if (!confirm("Delete this prompt?")) return;
      await deletePrompt(id);
      prompts = await getPrompts();
      const list = document.getElementById("cvoy-vault-list");
      if (list) list.innerHTML = renderPromptList();
      bindPromptListEvents();
    });
  });
}
function showEditForm(prompt2) {
  var _a;
  editingPrompt = prompt2;
  (_a = document.getElementById("cvoy-vault-modal")) == null ? void 0 : _a.remove();
  const overlay = document.createElement("div");
  overlay.id = "cvoy-vault-modal";
  overlay.className = "cvoy-modal-overlay";
  const modal = document.createElement("div");
  modal.className = "cvoy-modal";
  modal.innerHTML = `
    <div class="cvoy-modal-header">
      <span class="cvoy-modal-title">${prompt2 ? "Edit Prompt" : "New Prompt"}</span>
      <button id="cvoy-vault-back" class="cvoy-btn cvoy-btn-secondary" style="font-size:12px;padding:4px 10px">← Back</button>
    </div>
    <div class="cvoy-modal-body">
      <label style="display:block;margin-bottom:4px;font-size:13px;font-weight:500">Title</label>
      <input id="cvoy-prompt-title" class="cvoy-input" style="margin-bottom:12px" placeholder="My Prompt" value="${escapeHtml((prompt2 == null ? void 0 : prompt2.title) ?? "")}" />
      <label style="display:block;margin-bottom:4px;font-size:13px;font-weight:500">Content</label>
      <textarea id="cvoy-prompt-content" class="cvoy-input cvoy-textarea" style="min-height:120px;margin-bottom:12px" placeholder="Enter your prompt here…">${escapeHtml((prompt2 == null ? void 0 : prompt2.content) ?? "")}</textarea>
      <label style="display:block;margin-bottom:4px;font-size:13px;font-weight:500">Tags (comma-separated)</label>
      <input id="cvoy-prompt-tags" class="cvoy-input" placeholder="coding, writing, analysis" value="${escapeHtml(((prompt2 == null ? void 0 : prompt2.tags) ?? []).join(", "))}" />
    </div>
    <div class="cvoy-modal-footer">
      <button id="cvoy-prompt-save" class="cvoy-btn cvoy-btn-primary">Save Prompt</button>
    </div>
  `;
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  modal.querySelector("#cvoy-vault-back").addEventListener("click", () => {
    openVaultModal();
  });
  modal.querySelector("#cvoy-prompt-save").addEventListener("click", async () => {
    const title = modal.querySelector("#cvoy-prompt-title").value.trim();
    const content = modal.querySelector("#cvoy-prompt-content").value.trim();
    const tagsRaw = modal.querySelector("#cvoy-prompt-tags").value;
    const tags = tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);
    if (!title || !content) {
      alert("Please fill in both title and content.");
      return;
    }
    const now = Date.now();
    const saved = {
      id: (editingPrompt == null ? void 0 : editingPrompt.id) ?? generateId(),
      title,
      content,
      tags,
      createdAt: (editingPrompt == null ? void 0 : editingPrompt.createdAt) ?? now,
      updatedAt: now
    };
    await savePrompt(saved);
    prompts = await getPrompts();
    openVaultModal();
  });
}
function closeVaultModal() {
  var _a;
  (_a = document.getElementById("cvoy-vault-modal")) == null ? void 0 : _a.remove();
  searchQuery = "";
  editingPrompt = null;
}
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
let timelinePanel = null;
let observer = null;
let currentConvId = null;
async function initTimeline() {
  currentConvId = getCurrentConversationId();
  if (!currentConvId) return;
  createTimelinePanel();
  await renderTimeline();
  const container = document.querySelector("main");
  if (container) {
    observer = new MutationObserver(() => renderTimeline());
    observer.observe(container, { childList: true, subtree: true });
  }
}
function destroyTimeline() {
  observer == null ? void 0 : observer.disconnect();
  observer = null;
  timelinePanel == null ? void 0 : timelinePanel.remove();
  timelinePanel = null;
}
function createTimelinePanel() {
  if (document.getElementById("cvoy-timeline")) return;
  timelinePanel = document.createElement("div");
  timelinePanel.id = "cvoy-timeline";
  timelinePanel.className = "cvoy-timeline-panel";
  timelinePanel.setAttribute("title", "ChatGPT Voyager Timeline — Click a node to jump to message");
  document.body.appendChild(timelinePanel);
}
async function renderTimeline() {
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
    starred.filter((s) => s.conversationId === convId).map((s) => s.messageIndex)
  );
  timelinePanel.innerHTML = "";
  messages.forEach((msg, index) => {
    const isUser = msg.getAttribute("data-message-author-role") === "user";
    const isStarred = starredSet.has(index);
    if (index > 0) {
      const connector = document.createElement("div");
      connector.className = "cvoy-timeline-connector";
      timelinePanel.appendChild(connector);
    }
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
    const previewText = (msg.textContent ?? "").trim().slice(0, 60);
    if (previewText) {
      node.title = `${isUser ? "You" : "ChatGPT"}: ${previewText}${previewText.length >= 60 ? "…" : ""}`;
    }
    timelinePanel.appendChild(node);
  });
}
let lastConvId = null;
let initialized = false;
async function main() {
  if (initialized) return;
  initialized = true;
  const settings = await getSettings();
  if (settings.enableHideRecents) initHideRecents();
  if (settings.enableFolders) await initFolders();
  if (settings.enablePromptVault) await initPromptVault();
  if (settings.enableExport) initExport();
  if (settings.enableFormulaCopy) initFormulaCopy();
  if (settings.enableDeepResearch) initDeepResearch();
  if (settings.enableQuoteReply) initQuoteReply();
  if (settings.enableTabTitleSync) initTabTitleSync();
  if (settings.enablePreventAutoScroll) initPreventAutoScroll();
  if (settings.enableInputCollapse) initInputCollapse();
  if (settings.enableMermaid) await initMermaidRendering();
  if (settings.defaultModel) await initDefaultModel();
  await handleRouteChange(settings);
  observeRouteChanges(settings);
}
async function handleRouteChange(settings) {
  var _a;
  const convId = getCurrentConversationId();
  if (convId === lastConvId) return;
  lastConvId = convId;
  if (settings.enableTimeline) {
    destroyTimeline();
    if (convId) await initTimeline();
  }
  if (settings.enableExport) {
    (_a = document.getElementById("cvoy-export-btn-container")) == null ? void 0 : _a.remove();
    if (convId) initExport();
  }
  if (settings.enableFolders) {
    await refreshFolders();
  }
}
function observeRouteChanges(settings) {
  const main2 = document.querySelector("main") ?? document.body;
  const obs = new MutationObserver(() => {
    handleRouteChange(settings);
    reinjectIfMissing(settings);
  });
  obs.observe(main2, { childList: true, subtree: true });
  const origPushState = history.pushState.bind(history);
  history.pushState = function(...args) {
    origPushState(...args);
    setTimeout(() => handleRouteChange(settings), 300);
  };
  window.addEventListener(
    "popstate",
    () => setTimeout(() => handleRouteChange(settings), 300)
  );
}
function reinjectIfMissing(settings) {
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
chrome.storage.onChanged.addListener(async (changes) => {
  if (!changes.settings) return;
  const newSettings = changes.settings.newValue;
  const oldSettings = changes.settings.oldValue;
  if (newSettings.enableHideRecents !== (oldSettings == null ? void 0 : oldSettings.enableHideRecents)) {
    if (newSettings.enableHideRecents) initHideRecents();
    else disableHideRecents();
  }
});
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
export {
  __vitePreload as _
};
//# sourceMappingURL=index.ts-CJEaNC9h.js.map
