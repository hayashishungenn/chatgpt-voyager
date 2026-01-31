import { AdapterConfig } from '../types';

export const ADAPTERS: Record<string, AdapterConfig> = {
  // chatgpt
  'chatgpt.com': {
    user_selector: ['article[data-turn="user"]', '[data-message-author-role="user"]'],
    ai_selector: ['article[data-turn="assistant"]', '[data-message-author-role="assistant"]'],
  },
  'chat.openai.com': {
    user_selector: ['article[data-turn="user"]', '[data-message-author-role="user"]'],
    ai_selector: ['article[data-turn="assistant"]', '[data-message-author-role="assistant"]'],
  },
  // default
  default: {
    selectors: ['div', 'p'],
    aiMarkers: ['ai', 'assistant'],
    userMarkers: ['user', 'human'],
  },
};

export function getMatchedAdapter(host: string): AdapterConfig {
  for (const key of Object.keys(ADAPTERS)) {
    if (host.includes(key)) {
      return ADAPTERS[key];
    }
  }
  return ADAPTERS.default;
}
