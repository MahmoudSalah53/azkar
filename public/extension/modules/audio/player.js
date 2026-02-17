import { getSetting } from '../storage/sync.js';

let playing = false;

/**
 * Ensure the offscreen document exists for playing audio
 */
export async function ensureOffscreenDocument() {
    const existing = await chrome.offscreen.hasDocument();
    if (existing) return;

    await chrome.offscreen.createDocument({
        url: "offscreen.html",
        reasons: ["AUDIO_PLAYBACK"],
        justification: "Play sound when navigation happens",
    });
}

/**
 * Play the audio once
 */
export async function playOnce() {
    if (playing) return; // Prevent rapid repetition
    playing = true;

    // Fetch the current volume from storage
    const currentVolume = await getSetting('volume');

    await ensureOffscreenDocument();

    // Send the play command to the offscreen page with volume
    chrome.runtime.sendMessage({ play: true, volume: currentVolume });

    // Allow playing again after 3 seconds
    setTimeout(() => playing = false, 3000);
}
