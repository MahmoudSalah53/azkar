import { startTimer } from './modules/timer/manager.js';
import { initTabListeners } from './modules/tabs/listener.js';
import { getSetting } from './modules/storage/sync.js';
import { dispatchReminder } from './modules/reminder/dispatch.js';

// ======================
// INITIALIZATION
// ======================

// Initialize Tab Listeners
initTabListeners();

// Handle Periodic Alarms
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "azkarReminderAlarm") {
    dispatchReminder();
  }
});

// ======================
// POPUP MESSAGES
// ======================

// Listen for messages from popup / content scripts
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.setTimer) {
    startTimer(msg.duration); // Update timer immediately
    return;
  }

  if (msg.type === 'OPEN_POPUP') {
    if (chrome.action?.openPopup) {
      chrome.action.openPopup()
        .then(() => sendResponse({ ok: true }))
        .catch((err) => sendResponse({ ok: false, error: String(err?.message || err) }));
      return true;
    }
    sendResponse({ ok: false, error: 'openPopup unavailable' });
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

