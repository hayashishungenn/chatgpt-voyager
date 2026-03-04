import type {
    Folder,
    FolderAssignment,
    Prompt,
    StarredMessage,
    StorageData,
    VoyagerSettings,
} from "./types";
import { DEFAULT_SETTINGS } from "./types";

export async function getStorage(): Promise<StorageData> {
    return new Promise((resolve) => {
        chrome.storage.local.get(
            ["folders", "folderAssignments", "prompts", "starredMessages", "settings"],
            (result) => {
                resolve({
                    folders: result.folders ?? [],
                    folderAssignments: result.folderAssignments ?? [],
                    prompts: result.prompts ?? [],
                    starredMessages: result.starredMessages ?? [],
                    settings: { ...DEFAULT_SETTINGS, ...(result.settings ?? {}) },
                });
            }
        );
    });
}

export async function setStorage(data: Partial<StorageData>): Promise<void> {
    return new Promise((resolve) => {
        chrome.storage.local.set(data, resolve);
    });
}

export async function getSettings(): Promise<VoyagerSettings> {
    const data = await getStorage();
    return data.settings;
}

export async function updateSettings(
    partial: Partial<VoyagerSettings>
): Promise<VoyagerSettings> {
    const current = await getSettings();
    const updated = { ...current, ...partial };
    await setStorage({ settings: updated });
    return updated;
}

export async function getFolders(): Promise<Folder[]> {
    const data = await getStorage();
    return data.folders.sort((a, b) => a.order - b.order);
}

export async function saveFolders(folders: Folder[]): Promise<void> {
    await setStorage({ folders });
}

export async function getFolderAssignments(): Promise<FolderAssignment[]> {
    const data = await getStorage();
    return data.folderAssignments;
}

export async function assignConversationToFolder(
    conversationId: string,
    folderId: string | null
): Promise<void> {
    const assignments = await getFolderAssignments();
    const filtered = assignments.filter((a) => a.conversationId !== conversationId);
    if (folderId) {
        filtered.push({ conversationId, folderId });
    }
    await setStorage({ folderAssignments: filtered });
}

export async function getPrompts(): Promise<Prompt[]> {
    const data = await getStorage();
    return data.prompts.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function savePrompt(prompt: Prompt): Promise<void> {
    const prompts = await getPrompts();
    const idx = prompts.findIndex((p) => p.id === prompt.id);
    if (idx >= 0) {
        prompts[idx] = prompt;
    } else {
        prompts.unshift(prompt);
    }
    await setStorage({ prompts });
}

export async function deletePrompt(id: string): Promise<void> {
    const prompts = await getPrompts();
    await setStorage({ prompts: prompts.filter((p) => p.id !== id) });
}

export async function getStarredMessages(): Promise<StarredMessage[]> {
    const data = await getStorage();
    return data.starredMessages;
}

export async function toggleStarMessage(
    conversationId: string,
    messageIndex: number
): Promise<boolean> {
    const starred = await getStarredMessages();
    const existing = starred.find(
        (s) => s.conversationId === conversationId && s.messageIndex === messageIndex
    );
    if (existing) {
        await setStorage({
            starredMessages: starred.filter(
                (s) => !(s.conversationId === conversationId && s.messageIndex === messageIndex)
            ),
        });
        return false;
    } else {
        starred.push({ conversationId, messageIndex, note: "", createdAt: Date.now() });
        await setStorage({ starredMessages: starred });
        return true;
    }
}

export function generateId(): string {
    return crypto.randomUUID();
}
