'use client';

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writePersistedState(name: string, state: unknown, version: number) {
  if (typeof window === 'undefined') return;
  try {
    if (window.localStorage.getItem(name)) return;
    window.localStorage.setItem(name, JSON.stringify({ state, version }));
  } catch {
    // Migration is best-effort; in-memory defaults remain usable.
  }
}

export function migrateLegacyShellStore() {
  writePersistedState(
    'uw-next-shell',
    {
      theme: read('uw-next-theme', 'dark'),
      sidebarCollapsed: read('uw-next-sidebar-collapsed', false),
      sidebarWidth: read('uw-next-sidebar-width', 168),
    },
    2,
  );
}

export function migrateLegacyWorkspaceStore() {
  writePersistedState(
    'uw-next-workspace-domain',
    {
      workspaces: read('uw-next-workspaces', []),
      selectedWorkspaceId: read('uw-next-selected-workspace', null),
      projects: read('uw-next-projects', []),
    },
    2,
  );
}

export function migrateLegacyChatStore() {
  writePersistedState(
    'uw-next-chat-domain',
    {
      conversations: read('uw-next-conversations', []),
      activeConversationId: read('uw-next-active-conversation', null),
      agentMode: read('uw-next-agent-mode', 'standard'),
      accessMode: read('uw-next-access-mode', 'view'),
      reasoning: read('uw-next-reasoning', 'medium'),
      selectedModel: read('uw-next-selected-model', 'DeepSeek Flash'),
    },
    2,
  );
}

export function migrateLegacySkillsStore() {
  writePersistedState('uw-next-skills-domain', { skills: read('uw-next-skills', []) }, 2);
}

export function migrateLegacyPluginsStore() {
  writePersistedState('uw-next-plugins-domain', { plugins: read('uw-next-plugins', []) }, 2);
}

export function migrateLegacyAutomationsStore() {
  writePersistedState(
    'uw-next-automations-domain',
    { automations: read('uw-next-automations', []) },
    2,
  );
}

export function migrateLegacySettingsStore() {
  writePersistedState('uw-next-settings-domain', read('uw-next-settings', {}), 2);
}

