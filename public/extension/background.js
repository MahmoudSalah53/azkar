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
  if (playing) return; // block duplicate triggers
  playing = true;

  await ensureOffscreenDocument();
  chrome.runtime.sendMessage({ play: true });

  setTimeout(() => playing = false, 3000); // unlock after 3 seconds
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
