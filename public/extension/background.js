import { startTimer } from './modules/timer/manager.js';
import { initTabListeners } from './modules/tabs/listener.js';
import { getSetting } from './modules/storage/sync.js';
import { playOnce } from './modules/audio/player.js';

// ======================
// INITIALIZATION
// ======================

// Initialize Tab Listeners
initTabListeners();

// Handle Periodic Alarms
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "azkarAudioAlarm") {
    playOnce();
  }
});

// ======================
// POPUP MESSAGES
// ======================

// Listen for messages from popup to change timer duration
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.setTimer) {
    startTimer(msg.duration); // Update timer immediately
  }
});

// ======================
// LIFECYCLE
// ======================

/**
 * Synchronize the timer with saved settings
 */
async function syncTimer() {
  const duration = await getSetting('timer');
  startTimer(duration);
}

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Try to open the popup automatically (Supported in Chrome 127+)
    if (chrome.action && chrome.action.openPopup) {
      chrome.action.openPopup().catch(() => {
        // Fallback to opening in a tab if popup cannot be opened (e.g. not pinned)
        chrome.tabs.create({ url: 'popup.html' });
      });
    } else {
      chrome.tabs.create({ url: 'popup.html' });
    }
  }
  syncTimer();
});

// Start on extension startup
chrome.runtime.onStartup.addListener(syncTimer);

// Initial sync in case the worker just started
syncTimer();

