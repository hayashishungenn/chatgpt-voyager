export function initDeepResearch(): void {
  processThinkingBlocks();

  const main = document.querySelector("main");
  if (main) {
    const obs = new MutationObserver(() => processThinkingBlocks());
    obs.observe(main, { childList: true, subtree: true });
  }
}

function processThinkingBlocks(): void {
  // ChatGPT wraps reasoning in a <details> element or div with specific attributes
  const selectors = [
    "details:not([data-cvoy-processed])",
    '[data-testid="thinking-block"]:not([data-cvoy-processed])',
    '.thinking-block:not([data-cvoy-processed])',
    '[class*="thinking"]:not([data-cvoy-processed])',
  ];

  const elements = document.querySelectorAll(selectors.join(", "));
  elements.forEach((el) => {
    el.setAttribute("data-cvoy-processed", "1");

    // Only process if it looks like a thinking block (has summary "Thought for..." or "Thinking...")
    const summary = el.querySelector("summary");
    const summaryText = summary?.textContent ?? "";
    if (!summaryText.match(/think|reason|thought/i) && el.tagName !== "DETAILS") return;

    injectExtractButton(el as HTMLElement);
  });
}

function injectExtractButton(el: HTMLElement): void {
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

function extractResearch(el: HTMLElement): void {
  // Get all text from the thinking block
  const clone = el.cloneNode(true) as HTMLElement;
  clone.querySelector(".cvoy-research-extract-btn")?.remove();

  const text = clone.textContent?.trim() ?? "";

  // Extract URLs from the block
  const urls: string[] = [];
  el.querySelectorAll("a[href]").forEach((a) => {
    const href = (a as HTMLAnchorElement).href;
    if (href.startsWith("http")) urls.push(href);
  });

  showExtractModal(text, urls);
}

function showExtractModal(text: string, urls: string[]): void {
  document.getElementById("cvoy-research-modal")?.remove();

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
      <textarea class="cvoy-input cvoy-textarea" style="min-height:200px;font-size:12px;font-family:monospace" readonly>${escapeHtml(text)}</textarea>
      ${urls.length ? `
        <div style="margin-top:16px">
          <div style="font-size:12px;font-weight:600;margin-bottom:8px;color:var(--cvoy-text-muted)">REFERENCED URLS (${urls.length})</div>
          <div style="max-height:160px;overflow-y:auto">
            ${urls.map((url, i) => `
              <div style="padding:4px 0;font-size:12px;display:flex;gap:6px;align-items:center">
                <span style="color:var(--cvoy-text-muted);width:20px;text-align:right;flex-shrink:0">${i + 1}.</span>
                <a href="${url}" target="_blank" style="color:var(--cvoy-primary);text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(url)}</a>
              </div>
            `).join("")}
          </div>
        </div>
      ` : ""}
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  modal.querySelector("#cvoy-research-close")!.addEventListener("click", () => overlay.remove());
  modal.querySelector("#cvoy-research-copy-text")!.addEventListener("click", async () => {
    await navigator.clipboard.writeText(text);
    (modal.querySelector("#cvoy-research-copy-text") as HTMLButtonElement).textContent = "✓ Copied!";
  });

  const copyUrlsBtn = modal.querySelector("#cvoy-research-copy-urls");
  if (copyUrlsBtn) {
    copyUrlsBtn.addEventListener("click", async () => {
      await navigator.clipboard.writeText(urls.join("\n"));
      (copyUrlsBtn as HTMLButtonElement).textContent = "✓ Copied!";
    });
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
