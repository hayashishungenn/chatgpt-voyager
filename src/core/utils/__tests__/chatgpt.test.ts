import { describe, expect, it } from 'vitest';

import {
  hasChatGPTEnterpriseDomHints,
  isChatGPTEnterpriseEnvironment,
  isChatGPTEnterpriseUrl,
} from '../chatgpt';

describe('chatgpt enterprise detection', () => {
  it('returns false for non-chatgpt hosts', () => {
    expect(isChatGPTEnterpriseUrl({ hostname: 'example.com', pathname: '/enterprise' })).toBe(
      false,
    );
    expect(
      isChatGPTEnterpriseEnvironment({ hostname: 'platform.openai.com', pathname: '/enterprise' }),
    ).toBe(false);
  });

  it('detects enterprise hints in URL parts', () => {
    expect(isChatGPTEnterpriseUrl({ hostname: 'chatgpt.com', pathname: '/enterprise' })).toBe(
      true,
    );
    expect(isChatGPTEnterpriseUrl({ hostname: 'chatgpt.com', search: '?workspace=true' })).toBe(
      true,
    );
    expect(isChatGPTEnterpriseUrl({ hostname: 'chatgpt.com', hash: '#enterprise=acme' })).toBe(
      true,
    );
  });

  it('returns false for standard ChatGPT URLs', () => {
    expect(isChatGPTEnterpriseUrl({ hostname: 'chatgpt.com', pathname: '/' })).toBe(false);
    expect(isChatGPTEnterpriseUrl({ hostname: 'chatgpt.com', pathname: '/c/abc123' })).toBe(false);
    expect(isChatGPTEnterpriseUrl({ hostname: 'chat.openai.com', pathname: '/c/abc123' })).toBe(
      false,
    );
  });

  it('detects DOM hints on chatgpt host', () => {
    const doc = document.implementation.createHTMLDocument('test');
    doc.documentElement.className = 'gv-enterprise-shell';
    expect(hasChatGPTEnterpriseDomHints(doc)).toBe(true);
    expect(isChatGPTEnterpriseEnvironment({ hostname: 'chatgpt.com' }, doc)).toBe(true);
  });
});
