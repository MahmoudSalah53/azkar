import { getSetting, setSetting } from '../storage/sync.js';
import { audios } from '../audio/list.js';

const TOAST_MESSAGE = 'AZKAR_TOAST';
let lastShownAt = 0;

const RESTRICTED_URL = /^(chrome|chrome-extension|edge|about|devtools|chrome-search|chrome-untrusted):/i;

/**
 * Send toast to a tab, injecting the content script if needed.
 */
async function sendToastToTab(tabId, payload) {
    try {
        await chrome.tabs.sendMessage(tabId, payload);
        return true;
    } catch {
        try {
            await chrome.scripting.executeScript({
                target: { tabId },
                files: ['modules/toast/content.js'],
            });
            await chrome.tabs.sendMessage(tabId, payload);
            return true;
        } catch {
            return false;
        }
    }
}

/**
 * Show an in-browser toast on the active tab(s).
 */
export async function showReminderNotification() {
    const timerMs = await getSetting('timer');
    const minGapMs = Math.max(2000, Math.floor(timerMs * 0.8));
    const now = Date.now();

    if (now - lastShownAt < minGapMs) return;
    lastShownAt = now;

    const selectedAudioId = await getSetting('selectedAudio');
    const audioObj = audios.find((a) => a.id === selectedAudioId) || audios[0];

    const count = await getSetting('dhikrCount');
    await setSetting('dhikrCount', count + 1);

    const payload = {
        type: TOAST_MESSAGE,
        message: audioObj.name,
        duration: 6000,
    };

    const windows = await chrome.windows.getAll({ populate: true });
    const focusedWindows = windows.filter((w) => w.focused);
    const targetWindows = focusedWindows.length ? focusedWindows : windows;

    const sent = [];

    for (const win of targetWindows) {
        const activeTab = win.tabs?.find((tab) => tab.active);
        if (!activeTab?.id || !activeTab.url || RESTRICTED_URL.test(activeTab.url)) continue;
        sent.push(sendToastToTab(activeTab.id, payload));
    }

    if (!sent.length) {
        const tabs = await chrome.tabs.query({ active: true });
        for (const tab of tabs) {
            if (!tab.id || !tab.url || RESTRICTED_URL.test(tab.url)) continue;
            sent.push(sendToastToTab(tab.id, payload));
        }
    }

    await Promise.allSettled(sent);
}
