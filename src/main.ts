import './core/button.css';
import { initStorage } from './services/storage';
import { injectAll } from './utils/dom';

const POLL_INTERVAL_MS = 100;

async function main(): Promise<void> {
  // Storage must be ready before buttons are created so hasCopied() is accurate
  await initStorage();
  setInterval(injectAll, POLL_INTERVAL_MS);
}

void main();