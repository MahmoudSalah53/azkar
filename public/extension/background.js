let playing = false;
let timerInterval = null; // Holds the current timer so we can clear or update it

// Ensure the offscreen document exists for playing audio
async function ensureOffscreenDocument() {
  const existing = await chrome.offscreen.hasDocument();
  if (existing) return;

  await chrome.offscreen.createDocument({
    url: "offscreen.html",
    reasons: ["AUDIO_PLAYBACK"],
    justification: "Play sound when navigation happens",
  });
}

// Play the audio once
async function playOnce() {
  if (playing) return; // Prevent rapid repetition
  playing = true;

  // Fetch the current volume from storage (default 1.0)
  const data = await chrome.storage.local.get({ volume: 1.0 });
  const currentVolume = data.volume;

  await ensureOffscreenDocument();

  // Send the play command to the offscreen page with volume
  chrome.runtime.sendMessage({ play: true, volume: currentVolume });

  // Allow playing again after 3 seconds
  setTimeout(() => playing = false, 3000);
}


// ======================
// TIMER
// ======================

// Start or update the timer with a given duration
function startTimer(duration) {
  // If a timer already exists, clear it first
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  // If duration is 0 → stop the timer
  if (duration === 0) return;

  // Start a new timer: call playOnce every "duration" milliseconds
  timerInterval = setInterval(() => {
    playOnce();
  }, duration);
}


// ======================
// TAB EVENTS
// ======================

// Play audio immediately when a new tab is opened
chrome.tabs.onCreated.addListener(async () => {
  const data = await chrome.storage.local.get({ playNewTab: true });
  if (data.playNewTab) {
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
// AUTOMATIC TIMER ON STARTUP
// ======================

// Retrieve last saved timer duration and start automatically
chrome.runtime.onStartup.addListener(async () => {
  const data = await chrome.storage.local.get({ timer: 0 });
  startTimer(data.timer);
});


// ======================
// OPTIONAL: URL CHANGE
// ======================
// chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
//   if (changeInfo.url) {
//     playOnce();
//   }
// });
