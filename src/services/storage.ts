import { GM_getValue, GM_setValue } from '$';

const STORAGE_KEY = 'yt-transcript-copied-ids';

// In-memory set, populated once at boot via initStorage()
let copiedIds: Set<string> = new Set();

/** Load persisted IDs from GM storage into memory. Call once before polling starts. */
export async function initStorage(): Promise<void> {
  const raw = GM_getValue<string>(STORAGE_KEY, '[]');
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      copiedIds = new Set(parsed.filter((x): x is string => typeof x === 'string'));
    }
  } catch {
    // Corrupted storage — start fresh
    copiedIds = new Set();
  }
}

/** Synchronous after initStorage() has resolved. */
export function hasCopied(videoId: string): boolean {
  return copiedIds.has(videoId);
}

/** Persist a newly copied video ID. */
export async function markCopied(videoId: string): Promise<void> {
  copiedIds.add(videoId);
  await GM_setValue(STORAGE_KEY, JSON.stringify([...copiedIds]));
}