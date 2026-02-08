let playing = false;

async function ensureOffscreenDocument() {
  const existing = await chrome.offscreen.hasDocument();
  if (existing) return;

  await chrome.offscreen.createDocument({
    url: "offscreen.html",
    reasons: ["AUDIO_PLAYBACK"],
    justification: "Play sound when navigation happens",
  });
}

async function playOnce() {
  if (playing) return; // Prevent rapid repetition
  playing = true;

  // 1. Fetch current volume level from storage (Default 1.0 if not set)
  const data = await chrome.storage.local.get({ volume: 1.0 });
  const currentVolume = data.volume;

  await ensureOffscreenDocument();

  // 2. Send play command with volume value
  chrome.runtime.sendMessage({ play: true, volume: currentVolume });

  setTimeout(() => playing = false, 3000);
}

// new tab opened
chrome.tabs.onCreated.addListener(() => {
  playOnce();
});

// change url
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url) {
    playOnce();
  }
});