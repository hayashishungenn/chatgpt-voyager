import {
    assignConversationToFolder,
    generateId,
    getFolderAssignments,
    getFolders,
    saveFolders,
} from "../../storage";
import type { Folder } from "../../types";
import { SELECTORS, getCurrentConversationId } from "../../content/chatgpt-selectors";

const FOLDER_COLORS = [
    "#10a37f", "#3b82f6", "#8b5cf6", "#ec4899",
    "#f59e0b", "#ef4444", "#06b6d4", "#84cc16",
];

let foldersContainer: HTMLElement | null = null;
let contextMenu: HTMLElement | null = null;
let folders: Folder[] = [];
let assignments: { conversationId: string; folderId: string }[] = [];
let expandedFolders = new Set<string>();
let batchMode = false;
let selectedConvIds = new Set<string>();

export async function initFolders(): Promise<void> {
    folders = await getFolders();
    assignments = await getFolderAssignments();
    injectFolderUI();
    setupFolderDragDrop();
}

export async function refreshFolders(): Promise<void> {
    folders = await getFolders();
    assignments = await getFolderAssignments();
    renderFolderList();
}

function injectFolderUI(): void {
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

    header.querySelector("#cvoy-add-folder")!.addEventListener("click", (e) => {
        e.stopPropagation();
        showCreateFolderDialog(null);
    });

    header.querySelector("#cvoy-toggle-batch")!.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleBatchMode();
    });

    renderFolderList();
}

function renderFolderList(): void {
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

    // If in batch mode, show batch toolbar
    if (batchMode) {
        const sidebar = document.querySelector(SELECTORS.sidebar);
        renderBatchToolbar(sidebar as HTMLElement);
        addBatchCheckboxes();
    }
}

function createFolderElement(folder: Folder, depth: number): HTMLElement {
    const item = document.createElement("div");
    item.className = `cvoy-folder-item${depth > 0 ? " cvoy-subfolder" : ""}`;
    item.dataset.folderId = folder.id;
    item.draggable = true;

    const convCount = assignments.filter((a) => a.folderId === folder.id).length;
    const hasChildren = folders.some((f) => f.parentId === folder.id);
    const isExpanded = expandedFolders.has(folder.id);

    item.innerHTML = `
    <span style="font-size:10px;color:var(--cvoy-text-muted);width:12px">${hasChildren ? (isExpanded ? "▾" : "▸") : ""
        }</span>
    <span class="cvoy-folder-color-dot" style="background:${folder.color}"></span>
    <span class="cvoy-folder-name">${escapeHtml(folder.name)}</span>
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

    // Drop target
    item.addEventListener("dragover", (e) => {
        e.preventDefault();
        item.classList.add("cvoy-drop-target");
    });
    item.addEventListener("dragleave", () => item.classList.remove("cvoy-drop-target"));
    item.addEventListener("drop", async (e) => {
        e.preventDefault();
        item.classList.remove("cvoy-drop-target");
        const convId = e.dataTransfer?.getData("text/conversationId");
        const childFolderId = e.dataTransfer?.getData("text/folderId");

        if (convId) {
            await assignConversationToFolder(convId, folder.id);
            assignments = await getFolderAssignments();
            renderFolderList();
        } else if (childFolderId && childFolderId !== folder.id) {
            // Reorganize folders
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

function filterSidebarByFolder(folderId: string): void {
    const assignedConvIds = assignments
        .filter((a) => a.folderId === folderId)
        .map((a) => a.conversationId);

    const items = document.querySelectorAll(`${SELECTORS.sidebar} li`);
    items.forEach((item) => {
        const link = item.querySelector("a");
        const href = link?.getAttribute("href") ?? "";
        const convId = href.match(/\/c\/([a-f0-9-]+)/)?.[1];
        if (convId) {
            (item as HTMLElement).style.display =
                assignedConvIds.includes(convId) ? "" : "none";
        }
    });
}

function showFolderContextMenu(folder: Folder, x: number, y: number): void {
    removeContextMenu();
    contextMenu = document.createElement("div");
    contextMenu.className = "cvoy-context-menu";
    contextMenu.style.left = x + "px";
    contextMenu.style.top = y + "px";

    const menuItems = [
        { label: "✏️ Rename", action: () => renameFolderDialog(folder) },
        { label: "📁 Add Subfolder", action: () => showCreateFolderDialog(folder.id) },
        { label: "🎨 Change Color", action: () => changeColorMenu(folder, contextMenu!) },
        {
            label: "🔗 Move to Root", action: async () => {
                folder.parentId = null;
                await saveFolders(folders);
                renderFolderList();
            }, hidden: !folder.parentId
        },
        { label: "🗑️ Delete Folder", action: () => deleteFolderDialog(folder), danger: true },
    ];

    menuItems
        .filter((i) => !i.hidden)
        .forEach(({ label, action, danger }) => {
            const item = document.createElement("div");
            item.className = `cvoy-context-item${danger ? " danger" : ""}`;
            item.textContent = label;
            item.addEventListener("click", () => { action(); removeContextMenu(); });
            contextMenu!.appendChild(item);
        });

    document.body.appendChild(contextMenu);
    setTimeout(() => document.addEventListener("click", removeContextMenu, { once: true }), 0);
}

function changeColorMenu(folder: Folder, parent: HTMLElement): void {
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

function renameFolderDialog(folder: Folder): void {
    const name = prompt("Rename folder:", folder.name);
    if (name === null || !name.trim()) return;
    folder.name = name.trim();
    saveFolders(folders).then(renderFolderList);
}

function deleteFolderDialog(folder: Folder): void {
    if (!confirm(`Delete folder "${folder.name}"? Conversations will not be deleted.`)) return;
    const idx = folders.findIndex((f) => f.id === folder.id);
    if (idx >= 0) folders.splice(idx, 1);
    // Remove child folders
    const children = folders.filter((f) => f.parentId === folder.id);
    children.forEach((child) => {
        const ci = folders.findIndex((f) => f.id === child.id);
        if (ci >= 0) folders.splice(ci, 1);
    });
    saveFolders(folders).then(renderFolderList);
}

function removeContextMenu(): void {
    if (contextMenu) {
        contextMenu.remove();
        contextMenu = null;
    }
}

function showCreateFolderDialog(parentId: string | null): void {
    const name = prompt("New folder name:");
    if (!name || !name.trim()) return;
    const newFolder: Folder = {
        id: generateId(),
        name: name.trim(),
        color: FOLDER_COLORS[Math.floor(Math.random() * FOLDER_COLORS.length)],
        parentId,
        createdAt: Date.now(),
        order: folders.length,
    };
    folders.push(newFolder);
    saveFolders(folders).then(renderFolderList);
}

function setupFolderDragDrop(): void {
    // Make conversation sidebar items draggable
    document.addEventListener("dragstart", (e) => {
        const item = (e.target as Element)?.closest?.(`${SELECTORS.sidebar} li`);
        if (!item) return;
        const link = item.querySelector("a");
        const href = link?.getAttribute("href") ?? "";
        const convId = href.match(/\/c\/([a-f0-9-]+)/)?.[1];
        if (convId) {
            e.dataTransfer?.setData("text/conversationId", convId);
        }

        const folderItem = (e.target as Element)?.closest?.(".cvoy-folder-item");
        if (folderItem) {
            const fid = (folderItem as HTMLElement).dataset.folderId;
            if (fid) e.dataTransfer?.setData("text/folderId", fid);
        }
    });
}

// Batch delete mode
function toggleBatchMode(): void {
    batchMode = !batchMode;
    selectedConvIds.clear();

    if (!batchMode) {
        // Reset visibility and remove checkboxes
        document.querySelectorAll(`${SELECTORS.sidebar} li`).forEach((li) => {
            (li as HTMLElement).style.display = "";
            li.querySelector(".cvoy-batch-checkbox")?.remove();
        });
        document.getElementById("cvoy-batch-toolbar")?.remove();
    } else {
        renderFolderList();
    }
}

function addBatchCheckboxes(): void {
    const items = document.querySelectorAll(`${SELECTORS.sidebar} li`);
    items.forEach((item) => {
        if (item.querySelector(".cvoy-batch-checkbox")) return;
        const link = item.querySelector("a");
        const href = link?.getAttribute("href") ?? "";
        const convId = href.match(/\/c\/([a-f0-9-]+)/)?.[1];
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

function renderBatchToolbar(parent: HTMLElement): void {
    document.getElementById("cvoy-batch-toolbar")?.remove();
    const toolbar = document.createElement("div");
    toolbar.id = "cvoy-batch-toolbar";
    toolbar.className = "cvoy-batch-toolbar";
    toolbar.innerHTML = `
    <span id="cvoy-batch-count">0 selected</span>
    <button id="cvoy-batch-delete" class="cvoy-btn cvoy-btn-danger" style="font-size:11px;padding:2px 8px">Delete Selected</button>
    <button id="cvoy-batch-cancel" class="cvoy-btn cvoy-btn-ghost" style="font-size:11px;padding:2px 8px">Cancel</button>
  `;
    parent.appendChild(toolbar);

    toolbar.querySelector("#cvoy-batch-delete")!.addEventListener("click", batchDeleteSelected);
    toolbar.querySelector("#cvoy-batch-cancel")!.addEventListener("click", toggleBatchMode);
}

function updateBatchToolbar(): void {
    const countEl = document.getElementById("cvoy-batch-count");
    if (countEl) countEl.textContent = `${selectedConvIds.size} selected`;
}

async function batchDeleteSelected(): Promise<void> {
    if (selectedConvIds.size === 0) return;
    if (!confirm(`Delete ${selectedConvIds.size} conversation(s)? This cannot be undone.`)) return;

    for (const convId of selectedConvIds) {
        const item = document.querySelector(`${SELECTORS.sidebar} li a[href="/c/${convId}"]`)?.closest("li");
        if (item) {
            // Right-click menu → delete via ChatGPT's UI
            const moreBtn = item.querySelector('button[aria-label*="options" i], button[aria-label*="more" i]') as HTMLButtonElement | null;
            if (moreBtn) {
                moreBtn.click();
                await sleep(300);
                const deleteBtn = document.querySelector('[role="menuitem"]:last-child, [data-testid="delete-chat"]') as HTMLElement | null;
                if (deleteBtn) {
                    deleteBtn.click();
                    await sleep(200);
                    const confirmBtn = document.querySelector('button[data-testid="delete-conversation-confirm-button"], button.btn-danger') as HTMLElement | null;
                    confirmBtn?.click();
                    await sleep(500);
                }
            }
        }
    }

    selectedConvIds.clear();
    toggleBatchMode();
}

function sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
}

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

// Export for content script
export { batchMode, selectedConvIds };
