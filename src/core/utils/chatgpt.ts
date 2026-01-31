const ENTERPRISE_HINTS = [
  'enterprise',
  'workspace',
  'workspaces',
  'business',
  'team',
  'organization',
  'org',
] as const;

const CHATGPT_HOSTS = new Set(['chatgpt.com', 'chat.openai.com']);

type UrlParts = {
  hostname: string;
  pathname?: string;
  search?: string;
  hash?: string;
};

function includesEnterpriseHint(value: string): boolean {
  const haystack = value.toLowerCase();
  return ENTERPRISE_HINTS.some((hint) => haystack.includes(hint));
}

export function isChatGPTEnterpriseUrl({
  hostname,
  pathname = '',
  search = '',
  hash = '',
}: UrlParts): boolean {
  const normalizedHost = hostname.toLowerCase();
  if (!CHATGPT_HOSTS.has(normalizedHost)) return false;
  return includesEnterpriseHint(`${pathname}${search}${hash}`);
}

export function hasChatGPTEnterpriseDomHints(doc: Document): boolean {
  const root = doc.documentElement;
  const body = doc.body;

  const classNames = `${root?.className ?? ''} ${body?.className ?? ''}`.trim();
  if (classNames && includesEnterpriseHint(classNames)) return true;

  const datasetValues = [
    ...Object.values(root?.dataset ?? {}),
    ...Object.values(body?.dataset ?? {}),
  ].filter((value): value is string => typeof value === 'string' && value.length > 0);

  if (datasetValues.length && includesEnterpriseHint(datasetValues.join(' '))) return true;

  return false;
}

export function isChatGPTEnterpriseEnvironment(parts: UrlParts, doc?: Document): boolean {
  if (isChatGPTEnterpriseUrl(parts)) return true;
  const normalizedHost = parts.hostname.toLowerCase();
  if (!CHATGPT_HOSTS.has(normalizedHost)) return false;
  return doc ? hasChatGPTEnterpriseDomHints(doc) : false;
}
