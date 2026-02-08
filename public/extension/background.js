async function ensureOffscreenDocument() {
  const existing = await chrome.offscreen.hasDocument();
  if (existing) return;

  await chrome.offscreen.createDocument({
    url: "offscreen.html",
    reasons: ["AUDIO_PLAYBACK"],
    justification: "Play sound when new tab opens",
  });
}

chrome.tabs.onCreated.addListener(async (tab) => {
  await ensureOffscreenDocument();
  chrome.runtime.sendMessage({ play: true });
});
