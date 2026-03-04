export function initFormulaCopy(): void {
    processFormulas();

    const main = document.querySelector("main");
    if (main) {
        const obs = new MutationObserver(() => processFormulas());
        obs.observe(main, { childList: true, subtree: true });
    }
}

function processFormulas(): void {
    // KaTeX rendered formulas
    document.querySelectorAll(".katex:not([data-cvoy-processed])").forEach((el) => {
        el.setAttribute("data-cvoy-processed", "1");
        const annotation = el.querySelector("annotation[encoding='application/x-tex']");
        const latex = annotation?.textContent?.trim();
        if (!latex) return;

        const wrapper = document.createElement("span");
        wrapper.style.cssText = "display:inline-flex;align-items:center;gap:4px";
        el.parentNode?.insertBefore(wrapper, el);
        wrapper.appendChild(el);

        const copyLatexBtn = createCopyBtn("LaTeX", () => copyText(latex, copyLatexBtn));
        const mathml = el.querySelector("math");
        wrapper.appendChild(copyLatexBtn);
        if (mathml) {
            const copyMathmlBtn = createCopyBtn("MathML", () =>
                copyText(mathml.outerHTML, copyMathmlBtn)
            );
            wrapper.appendChild(copyMathmlBtn);
        }
    });

    // MathJax rendered formulas
    document.querySelectorAll("mjx-container:not([data-cvoy-processed])").forEach((el) => {
        el.setAttribute("data-cvoy-processed", "1");
        const script = el.previousElementSibling;
        if (script?.tagName === "SCRIPT" && script.getAttribute("type")?.includes("math")) {
            const latex = script.textContent?.trim();
            if (latex) {
                const btn = createCopyBtn("LaTeX", () => copyText(latex, btn));
                el.parentNode?.insertBefore(btn, el.nextSibling);
            }
        }
    });
}

function createCopyBtn(label: string, onClick: () => void): HTMLButtonElement {
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

async function copyText(text: string, btn: HTMLButtonElement): Promise<void> {
    try {
        await navigator.clipboard.writeText(text);
        const original = btn.textContent;
        btn.textContent = "✓ Copied!";
        btn.style.color = "var(--cvoy-primary)";
        setTimeout(() => {
            btn.textContent = original;
            btn.style.color = "";
        }, 2000);
    } catch {
        // Fallback
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
    }
}
