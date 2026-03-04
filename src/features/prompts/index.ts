import {
  deletePrompt,
  generateId,
  getPrompts,
  savePrompt,
} from "../../storage";
import type { Prompt } from "../../types";
import { SELECTORS, insertIntoTextarea } from "../../content/chatgpt-selectors";

let vaultModal: HTMLElement | null = null;
let prompts: Prompt[] = [];
let searchQuery = "";
let editingPrompt: Prompt | null = null;

export async function initPromptVault(): Promise<void> {
  prompts = await getPrompts();
  injectPromptButton();
}

function injectPromptButton(): void {
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

  // Try to insert before the submit button
  const submitBtn = form.querySelector('[data-testid="send-button"], button[aria-label="Send prompt"]');
  if (submitBtn) {
    submitBtn.parentElement?.insertBefore(btn, submitBtn);
  } else {
    form.appendChild(btn);
  }
}

function openVaultModal(): void {
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

function renderVaultModal(): void {
  document.getElementById("cvoy-vault-modal")?.remove();

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

  modal.querySelector("#cvoy-vault-close")!.addEventListener("click", closeVaultModal);
  modal.querySelector("#cvoy-vault-new")!.addEventListener("click", () => showEditForm(null));

  const searchInput = modal.querySelector("#cvoy-vault-search") as HTMLInputElement;
  searchInput.addEventListener("input", () => {
    searchQuery = searchInput.value;
    const list = document.getElementById("cvoy-vault-list");
    if (list) list.innerHTML = renderPromptList();
    bindPromptListEvents();
  });

  bindPromptListEvents();
}

function renderPromptList(): string {
  const filtered = prompts.filter(
    (p) =>
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filtered.length === 0) {
    return `<div style="text-align:center;color:var(--cvoy-text-muted);padding:40px 0">
      ${searchQuery ? "No prompts found" : 'No prompts yet. Click "+ New Prompt" to create one.'}
    </div>`;
  }

  return filtered
    .map(
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
    )
    .join("");
}

function bindPromptListEvents(): void {
  document.querySelectorAll(".cvoy-prompt-use").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = (btn as HTMLElement).dataset.promptId!;
      const prompt = prompts.find((p) => p.id === id);
      if (prompt) {
        insertIntoTextarea(prompt.content);
        closeVaultModal();
      }
    });
  });

  document.querySelectorAll(".cvoy-prompt-edit").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = (btn as HTMLElement).dataset.promptId!;
      const prompt = prompts.find((p) => p.id === id);
      if (prompt) showEditForm(prompt);
    });
  });

  document.querySelectorAll(".cvoy-prompt-del").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const id = (btn as HTMLElement).dataset.promptId!;
      if (!confirm("Delete this prompt?")) return;
      await deletePrompt(id);
      prompts = await getPrompts();
      const list = document.getElementById("cvoy-vault-list");
      if (list) list.innerHTML = renderPromptList();
      bindPromptListEvents();
    });
  });
}

function showEditForm(prompt: Prompt | null): void {
  editingPrompt = prompt;
  document.getElementById("cvoy-vault-modal")?.remove();

  const overlay = document.createElement("div");
  overlay.id = "cvoy-vault-modal";
  overlay.className = "cvoy-modal-overlay";

  const modal = document.createElement("div");
  modal.className = "cvoy-modal";
  modal.innerHTML = `
    <div class="cvoy-modal-header">
      <span class="cvoy-modal-title">${prompt ? "Edit Prompt" : "New Prompt"}</span>
      <button id="cvoy-vault-back" class="cvoy-btn cvoy-btn-secondary" style="font-size:12px;padding:4px 10px">← Back</button>
    </div>
    <div class="cvoy-modal-body">
      <label style="display:block;margin-bottom:4px;font-size:13px;font-weight:500">Title</label>
      <input id="cvoy-prompt-title" class="cvoy-input" style="margin-bottom:12px" placeholder="My Prompt" value="${escapeHtml(prompt?.title ?? "")}" />
      <label style="display:block;margin-bottom:4px;font-size:13px;font-weight:500">Content</label>
      <textarea id="cvoy-prompt-content" class="cvoy-input cvoy-textarea" style="min-height:120px;margin-bottom:12px" placeholder="Enter your prompt here…">${escapeHtml(prompt?.content ?? "")}</textarea>
      <label style="display:block;margin-bottom:4px;font-size:13px;font-weight:500">Tags (comma-separated)</label>
      <input id="cvoy-prompt-tags" class="cvoy-input" placeholder="coding, writing, analysis" value="${escapeHtml((prompt?.tags ?? []).join(", "))}" />
    </div>
    <div class="cvoy-modal-footer">
      <button id="cvoy-prompt-save" class="cvoy-btn cvoy-btn-primary">Save Prompt</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  modal.querySelector("#cvoy-vault-back")!.addEventListener("click", () => {
    openVaultModal();
  });

  modal.querySelector("#cvoy-prompt-save")!.addEventListener("click", async () => {
    const title = (modal.querySelector("#cvoy-prompt-title") as HTMLInputElement).value.trim();
    const content = (modal.querySelector("#cvoy-prompt-content") as HTMLTextAreaElement).value.trim();
    const tagsRaw = (modal.querySelector("#cvoy-prompt-tags") as HTMLInputElement).value;
    const tags = tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);

    if (!title || !content) {
      alert("Please fill in both title and content.");
      return;
    }

    const now = Date.now();
    const saved: Prompt = {
      id: editingPrompt?.id ?? generateId(),
      title,
      content,
      tags,
      createdAt: editingPrompt?.createdAt ?? now,
      updatedAt: now,
    };

    await savePrompt(saved);
    prompts = await getPrompts();
    openVaultModal();
  });
}

function closeVaultModal(): void {
  document.getElementById("cvoy-vault-modal")?.remove();
  searchQuery = "";
  editingPrompt = null;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
