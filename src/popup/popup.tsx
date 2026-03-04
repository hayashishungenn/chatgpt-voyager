import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import { getSettings, updateSettings } from "../storage";
import type { VoyagerSettings } from "../types";
import "./popup.css";

type SettingKey = keyof VoyagerSettings;

interface ToggleRowProps {
    icon: string;
    label: string;
    desc?: string;
    settingKey: SettingKey;
    settings: VoyagerSettings;
    onChange: (key: SettingKey, value: boolean) => void;
}

function ToggleRow({ icon, label, desc, settingKey, settings, onChange }: ToggleRowProps) {
    const value = settings[settingKey] as boolean;
    return (
        <label className="setting-row">
            <span className="setting-label">
                <span className="setting-icon">{icon}</span>
                <span>
                    {label}
                    {desc && <span className="setting-desc">{desc}</span>}
                </span>
            </span>
            <span className="toggle">
                <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => onChange(settingKey, e.target.checked)}
                />
                <span className="toggle-track" />
                <span className="toggle-thumb" />
            </span>
        </label>
    );
}

function App() {
    const [settings, setSettings] = useState<VoyagerSettings | null>(null);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        getSettings().then(setSettings);
    }, []);

    const handleToggle = async (key: SettingKey, value: boolean) => {
        if (!settings) return;
        const updated = await updateSettings({ [key]: value });
        setSettings(updated);
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
    };

    const handleSelectChange = async (key: SettingKey, value: string) => {
        if (!settings) return;
        const updated = await updateSettings({ [key]: value });
        setSettings(updated);
    };

    if (!settings) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: "var(--text-muted)" }}>
                Loading…
            </div>
        );
    }

    return (
        <>
            {/* Header */}
            <div className="popup-header">
                <div className="popup-logo">🚀</div>
                <div>
                    <div className="popup-title">ChatGPT Voyager</div>
                    <div className="popup-version">v1.0.0 • Active on chatgpt.com</div>
                </div>
                {saved && <span className="status-badge" style={{ marginLeft: "auto" }}>Saved ✓</span>}
            </div>

            <div className="popup-body">
                {/* Core features */}
                <div className="section-title">Core Features</div>
                <ToggleRow icon="📂" label="Folder Organization" desc="Two-level folder hierarchy with drag-drop" settingKey="enableFolders" settings={settings} onChange={handleToggle} />
                <ToggleRow icon="💡" label="Prompt Vault" desc="Save & reuse prompts" settingKey="enablePromptVault" settings={settings} onChange={handleToggle} />
                <ToggleRow icon="📍" label="Timeline Navigation" desc="Visual message scroll nodes on the right" settingKey="enableTimeline" settings={settings} onChange={handleToggle} />
                <ToggleRow icon="💾" label="Chat Export" desc="Export as JSON, Markdown, or PDF" settingKey="enableExport" settings={settings} onChange={handleToggle} />

                <div className="divider" />
                <div className="section-title">AI Enhancements</div>
                <ToggleRow icon="📐" label="Formula Copy" desc="One-click LaTeX / MathML copy" settingKey="enableFormulaCopy" settings={settings} onChange={handleToggle} />
                <ToggleRow icon="🔬" label="Deep Research" desc="Extract reasoning & cited URLs" settingKey="enableDeepResearch" settings={settings} onChange={handleToggle} />
                <ToggleRow icon="🧜" label="Mermaid Rendering" desc="Auto-render Mermaid diagrams" settingKey="enableMermaid" settings={settings} onChange={handleToggle} />

                <div className="divider" />
                <div className="section-title">Power Tools</div>
                <ToggleRow icon="🗑️" label="Batch Delete" desc="Bulk delete conversations" settingKey="enableBatchDelete" settings={settings} onChange={handleToggle} />
                <ToggleRow icon="💬" label="Quote Reply" desc="Select text → Reply with context" settingKey="enableQuoteReply" settings={settings} onChange={handleToggle} />
                <ToggleRow icon="🔖" label="Tab Title Sync" desc="Sync tab title to conversation name" settingKey="enableTabTitleSync" settings={settings} onChange={handleToggle} />
                <ToggleRow icon="🛑" label="Prevent Auto Scroll" desc="Don't jump to bottom on Enter" settingKey="enablePreventAutoScroll" settings={settings} onChange={handleToggle} />
                <ToggleRow icon="📏" label="Input Collapse" desc="Auto-shrink textarea when idle" settingKey="enableInputCollapse" settings={settings} onChange={handleToggle} />
                <ToggleRow icon="👁️" label="Hide Recents" desc="Hide date-grouped Recent items" settingKey="enableHideRecents" settings={settings} onChange={handleToggle} />

                <div className="divider" />
                <div className="section-title">Preferences</div>

                {/* Default Model */}
                <div className="setting-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
                    <span className="setting-label">
                        <span className="setting-icon">🤖</span>
                        <span>
                            Default Model
                            <span className="setting-desc">Auto-select on new chats</span>
                        </span>
                    </span>
                    <input
                        className="setting-select"
                        style={{ width: "100%", maxWidth: "none", fontFamily: "inherit" }}
                        placeholder="e.g. o1, GPT-4o"
                        value={settings.defaultModel}
                        onChange={(e) => handleSelectChange("defaultModel", e.target.value)}
                    />
                </div>

                {/* Export Format */}
                <div className="setting-row">
                    <span className="setting-label">
                        <span className="setting-icon">📤</span>
                        <span>
                            Default Export Format
                        </span>
                    </span>
                    <select
                        className="setting-select"
                        value={settings.exportFormat}
                        onChange={(e) => handleSelectChange("exportFormat", e.target.value as "json" | "markdown" | "pdf")}
                    >
                        <option value="markdown">Markdown</option>
                        <option value="json">JSON</option>
                        <option value="pdf">PDF</option>
                    </select>
                </div>
            </div>

            {/* Footer */}
            <div className="popup-footer">
                <span>ChatGPT Voyager</span>
                <a className="footer-link" href="https://github.com/Nagi-ovo/gemini-voyager" target="_blank" rel="noopener noreferrer">
                    Inspired by gemini-voyager ↗
                </a>
            </div>
        </>
    );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
