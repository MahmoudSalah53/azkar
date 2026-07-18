export const DEFAULTS = {
    volume: 0.5, // 50%
    timer: 300000, // 5 minutes
    playNewTab: false, // false = disabled, true = enabled
    reminderType: { sound: true, notification: false },
    selectedAudio: "default",
    dhikrCount: 0,
    bubbleEnabled: true,
};

/**
 * Normalize reminderType (supports legacy string values).
 * @param {any} value
 * @returns {{ sound: boolean, notification: boolean }}
 */
export function normalizeReminderType(value) {
    let sound = false;
    let notification = false;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
        sound = !!value.sound;
        notification = !!value.notification;
    } else if (value === 'notification') {
        notification = true;
    } else if (value === 'both') {
        sound = true;
        notification = true;
    } else {
        // 'sound' or unknown → default to sound
        sound = true;
    }

    if (!sound && !notification) sound = true;
    return { sound, notification };
}

/**
 * Get a setting from local storage with a default fallback
 * @param {string} key 
 * @returns {Promise<any>}
 */
export async function getSetting(key) {
    const defaultValue = DEFAULTS[key];
    const result = await chrome.storage.local.get({ [key]: defaultValue });
    if (key === 'reminderType') return normalizeReminderType(result[key]);
    return result[key];
}

/**
 * Save a setting to local storage
 * @param {string} key 
 * @param {any} value 
 */
export async function setSetting(key, value) {
    await chrome.storage.local.set({ [key]: value });
}
