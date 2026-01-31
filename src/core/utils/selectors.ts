/**
 * DOM selector utilities
 * Centralized selectors (was duplicated in multiple files)
 */

/**
 * Get selectors for user query elements
 */
export function getUserTurnSelectors(): string[] {
  return [
    // ChatGPT user turns
    'article[data-turn="user"]',
    'article[data-turn-id][data-turn="user"]',
    '[data-message-author-role="user"]',
    // Attribute-based fallbacks
    'div[aria-label="User message"]',
    'article[data-author="user"]',
    'article[data-turn="user"]',
    '[data-message-author-role="user"]',
    'div[role="listitem"][data-user="true"]',
    // Legacy Gemini selectors (kept as fallback for shared components)
    '.user-query-bubble-with-background',
    '.user-query-bubble-container',
    '.user-query-container',
    'user-query-content .user-query-bubble-with-background',
    'user-query-content',
    'user-query',
  ];
}

/**
 * Get selectors for assistant/model response elements
 */
export function getAssistantTurnSelectors(): string[] {
  return [
    // Attribute-based roles (most reliable)
    '[aria-label="ChatGPT response"]',
    '[data-message-author-role="assistant"]',
    '[data-message-author-role="model"]',
    'article[data-author="assistant"]',
    'article[data-turn="assistant"]',
    'article[data-turn="model"]',
    'article[data-turn-id][data-turn="assistant"]',
    // Common Gemini containers
    'model-response',
    '.model-response',
    'response-container',
    '.response-container',
    '.presented-response-container',
    'div[role="listitem"]:not([data-user="true"])',
  ];
}

/**
 * Get conversation selectors
 */
export function getConversationSelectors(): string[] {
  return [
    '[data-testid^="history-item"]',
    '[data-testid="conversation"]',
    '[data-test-id="conversation"]',
    '[data-test-id^="history-item"]',
    '.conversation-card',
    'a[href^="/c/"]',
    'a[href*="/c/"]',
  ];
}

/**
 * Get conversation link selectors
 */
export function getConversationLinkSelectors(): string[] {
  return ['a[href^="/c/"]', 'a[href*="/c/"]'];
}

/**
 * Build combined selector string
 */
export function combineSelectors(selectors: string[]): string {
  return selectors.join(', ');
}
