export interface Folder {
    id: string;
    name: string;
    color: string;
    parentId: string | null;
    createdAt: number;
    order: number;
}

export interface FolderAssignment {
    conversationId: string;
    folderId: string;
}

export interface Prompt {
    id: string;
    title: string;
    content: string;
    tags: string[];
    createdAt: number;
    updatedAt: number;
}

export interface StarredMessage {
    conversationId: string;
    messageIndex: number;
    note: string;
    createdAt: number;
}

export interface VoyagerSettings {
    // Power tools
    enableTimeline: boolean;
    enableFolders: boolean;
    enablePromptVault: boolean;
    enableExport: boolean;
    enableBatchDelete: boolean;
    enableQuoteReply: boolean;
    enableTabTitleSync: boolean;
    enablePreventAutoScroll: boolean;
    enableInputCollapse: boolean;
    enableFormulaCopy: boolean;
    enableDeepResearch: boolean;
    enableHideRecents: boolean;
    enableMermaid: boolean;
    // Preferences
    defaultModel: string;
    exportFormat: "json" | "markdown" | "pdf";
}

export const DEFAULT_SETTINGS: VoyagerSettings = {
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
    exportFormat: "markdown",
};

export interface StorageData {
    folders: Folder[];
    folderAssignments: FolderAssignment[];
    prompts: Prompt[];
    starredMessages: StarredMessage[];
    settings: VoyagerSettings;
}
