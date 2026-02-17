export const DEFAULTS = {
    volume: 1.0,
    timer: 0, // 0 means off
    playNewTab: true
};

/**
 * Get a setting from local storage with a default fallback
 * @param {string} key 
 * @returns {Promise<any>}
 */
export async function getSetting(key) {
    const defaultValue = DEFAULTS[key];
    const result = await chrome.storage.local.get({ [key]: defaultValue });
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
