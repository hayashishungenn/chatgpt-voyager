const DEFAULT_SETTINGS = {
  enableTimeline: true,
  enableFolders: true,
  enablePromptVault: true,
  enableExport: true,
  enableBatchDelete: true,
  enableQuoteReply: true,
  enableTabTitleSync: true,
  enablePreventAutoScroll: true,
  enableInputCollapse: false,
  enableFormulaCopy: true,
  enableDeepResearch: true,
  enableHideRecents: false,
  enableMermaid: true,
  defaultModel: "",
  exportFormat: "markdown"
};
async function getStorage() {
  return new Promise((resolve) => {
    chrome.storage.local.get(
      ["folders", "folderAssignments", "prompts", "starredMessages", "settings"],
      (result) => {
        resolve({
          folders: result.folders ?? [],
          folderAssignments: result.folderAssignments ?? [],
          prompts: result.prompts ?? [],
          starredMessages: result.starredMessages ?? [],
          settings: { ...DEFAULT_SETTINGS, ...result.settings ?? {} }
        });
      }
    );
  });
}
async function setStorage(data) {
  return new Promise((resolve) => {
    chrome.storage.local.set(data, resolve);
  });
}
async function getSettings() {
  const data = await getStorage();
  return data.settings;
}
async function updateSettings(partial) {
  const current = await getSettings();
  const updated = { ...current, ...partial };
  await setStorage({ settings: updated });
  return updated;
}
async function getFolders() {
  const data = await getStorage();
  return data.folders.sort((a, b) => a.order - b.order);
}
async function saveFolders(folders) {
  await setStorage({ folders });
}
async function getFolderAssignments() {
  const data = await getStorage();
  return data.folderAssignments;
}
async function assignConversationToFolder(conversationId, folderId) {
  const assignments = await getFolderAssignments();
  const filtered = assignments.filter((a) => a.conversationId !== conversationId);
  if (folderId) {
    filtered.push({ conversationId, folderId });
  }
  await setStorage({ folderAssignments: filtered });
}
async function getPrompts() {
  const data = await getStorage();
  return data.prompts.sort((a, b) => b.updatedAt - a.updatedAt);
}
async function savePrompt(prompt) {
  const prompts = await getPrompts();
  const idx = prompts.findIndex((p) => p.id === prompt.id);
  if (idx >= 0) {
    prompts[idx] = prompt;
  } else {
    prompts.unshift(prompt);
  }
  await setStorage({ prompts });
}
async function deletePrompt(id) {
  const prompts = await getPrompts();
  await setStorage({ prompts: prompts.filter((p) => p.id !== id) });
}
async function getStarredMessages() {
  const data = await getStorage();
  return data.starredMessages;
}
async function toggleStarMessage(conversationId, messageIndex) {
  const starred = await getStarredMessages();
  const existing = starred.find(
    (s) => s.conversationId === conversationId && s.messageIndex === messageIndex
  );
  if (existing) {
    await setStorage({
      starredMessages: starred.filter(
        (s) => !(s.conversationId === conversationId && s.messageIndex === messageIndex)
      )
    });
    return false;
  } else {
    starred.push({ conversationId, messageIndex, note: "", createdAt: Date.now() });
    await setStorage({ starredMessages: starred });
    return true;
  }
}
function generateId() {
  return crypto.randomUUID();
}
export {
  getFolderAssignments as a,
  generateId as b,
  assignConversationToFolder as c,
  getSettings as d,
  getPrompts as e,
  savePrompt as f,
  getFolders as g,
  deletePrompt as h,
  getStarredMessages as i,
  saveFolders as s,
  toggleStarMessage as t,
  updateSettings as u
};
//# sourceMappingURL=storage-G_NSCLrW.js.map
