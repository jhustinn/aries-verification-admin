// ─── Discord API Service ──────────────────────────────────────────────────────
const BOT_API_URL = 'https://f31abf2a-3472-4eb6-ada0-131201065074-00-3ese77mjsce3q.sisko.replit.dev';
const API_KEY = 'aries-admin-2024';

export interface DiscordMember {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  joinedAt: string;
  roles: { id: string; name: string; color: string }[];
  isBot: boolean;
}

export interface DiscordRole {
  id: string;
  name: string;
  color: string;
  position: number;
  memberCount: number;
  permissions: string[];
}

export interface DiscordChannel {
  id: string;
  name: string;
  type: number;
  parent: string | null;
  position: number;
}

export interface DiscordStats {
  guild: {
    id: string;
    name: string;
    icon: string;
    createdAt: string;
  };
  members: {
    total: number;
    online: number;
    humans: number;
    bots: number;
  };
  channels: {
    total: number;
    text: number;
    voice: number;
    categories: number;
  };
  roles: number;
}

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${BOT_API_URL}/api/discord${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export async function getGuildInfo() {
  return apiFetch('/guild');
}

export async function getMembers(): Promise<{ total: number; members: DiscordMember[] }> {
  return apiFetch('/members');
}

export async function getMember(userId: string): Promise<DiscordMember> {
  return apiFetch(`/members/${userId}`);
}

export async function assignRole(userId: string, roleId: string) {
  return apiFetch(`/members/${userId}/roles`, {
    method: 'POST',
    body: JSON.stringify({ roleId }),
  });
}

export async function removeRole(userId: string, roleId: string) {
  return apiFetch(`/members/${userId}/roles/${roleId}`, {
    method: 'DELETE',
  });
}

export async function kickMember(userId: string, reason?: string) {
  return apiFetch(`/members/${userId}/kick`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export async function banMember(userId: string, reason?: string) {
  return apiFetch(`/members/${userId}/ban`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export async function unbanMember(userId: string) {
  return apiFetch(`/members/${userId}/unban`, {
    method: 'POST',
  });
}

export async function getRoles(): Promise<{ total: number; roles: DiscordRole[] }> {
  return apiFetch('/roles');
}

export async function getChannels(): Promise<{ total: number; channels: DiscordChannel[] }> {
  return apiFetch('/channels');
}

export async function getServerStats(): Promise<DiscordStats> {
  return apiFetch('/stats');
}
