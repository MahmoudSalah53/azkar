import { startTimer } from './modules/timer/manager.js';
import { initTabListeners } from './modules/tabs/listener.js';
import { getSetting } from './modules/storage/sync.js';

// ======================
// INITIALIZATION
// ======================

// Initialize Tab Listeners
initTabListeners();

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
// AUTOMATIC TIMER ON STARTUP/INSTALL
// ======================

/**
 * Sync timer from storage
 */
async function syncTimer() {
  const timerDuration = await getSetting('timer');
  startTimer(timerDuration);
}

// Start on extension startup
chrome.runtime.onStartup.addListener(syncTimer);

// Also start on install or reload for better dev/user experience
chrome.runtime.onInstalled.addListener(syncTimer);

// Initial sync in case the worker just started
syncTimer();

