import { playOnce } from '../audio/player.js';
import { getSetting } from '../storage/sync.js';

/**
 * Initialize tab-related event listeners
 */
export function initTabListeners() {
    // Play audio immediately when a new tab is opened
    chrome.tabs.onCreated.addListener(async () => {
        const isEnabled = await getSetting('playNewTab');
        if (isEnabled) {
            playOnce();
        }
    });
}
