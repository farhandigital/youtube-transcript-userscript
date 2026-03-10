import { createButton } from '../core/button';
import { hasCopied } from '../services/storage';

const INJECTED_ATTR = 'data-transcript-btn-injected';

export function extractVideoId(card: Element): string | null {
  const anchors = card.querySelectorAll('a[href*="/watch?v="]');
  for (const a of anchors) {
    try {
      const url = new URL((a as HTMLAnchorElement).href, 'https://www.youtube.com');
      const videoId = url.searchParams.get('v');
      if (videoId) return videoId;
    } catch {
      // skip malformed hrefs
    }
  }

  // Fallback: content-id class e.g. content-id-wmP3MBjsx20
  const el = card.querySelector('[class*="content-id-"]');
  if (el) {
    const match = el.className.match(/content-id-([A-Za-z0-9_-]{11})/);
    if (match?.[1]) return match[1];
  }

  return null;
}

function isWatchPage(): boolean {
  return window.location.pathname === '/watch';
}

export function injectIntoCard(card: Element): void {
  const videoId = extractVideoId(card);
  if (!videoId) return;

  const metadataVM = card.querySelector('yt-lockup-metadata-view-model');
  if (!metadataVM) return;

  // Guard on the actual injection target to handle re-used card shells
  if (metadataVM.hasAttribute(INJECTED_ATTR)) return;
  metadataVM.setAttribute(INJECTED_ATTR, '1');

  const initialState = hasCopied(videoId) ? 'copied' : 'idle';
  const btn = createButton(videoId, initialState);

  if (isWatchPage()) {
    // Sidebar: append as a 4th row inside the text container so the title isn't squeezed
    const textContainer = metadataVM.querySelector('.yt-lockup-metadata-view-model__text-container');
    if (!textContainer) return;
    btn.classList.add('yt-transcript-btn--stacked');
    textContainer.appendChild(btn);
  } else {
    // Homepage: sit beside the menu button at the metadataVM level
    const menuBtn = metadataVM.querySelector('.yt-lockup-metadata-view-model__menu-button');
    if (menuBtn) {
      metadataVM.insertBefore(btn, menuBtn);
    } else {
      metadataVM.appendChild(btn);
    }
  }

  card.setAttribute(INJECTED_ATTR, '1');
}

export function injectAll(): void {
  const selector = [
    `ytd-rich-item-renderer:not([${INJECTED_ATTR}])`,
    `ytd-video-renderer:not([${INJECTED_ATTR}])`,
    `ytd-compact-video-renderer:not([${INJECTED_ATTR}])`,
    `ytd-grid-video-renderer:not([${INJECTED_ATTR}])`,
    `yt-lockup-view-model:not([${INJECTED_ATTR}])`,
  ].join(',');

  document.querySelectorAll(selector).forEach(injectIntoCard);
}