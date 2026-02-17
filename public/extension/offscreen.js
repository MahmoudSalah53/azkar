chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.play) {
    try {
      const audioUrl = chrome.runtime.getURL("modules/audio/audio.mp3");
      const audio = new Audio(audioUrl);

      // Use the volume from the message, setting 1.0 as a fallback value
      audio.volume = msg.volume !== undefined ? msg.volume : 1.0;

      await audio.play();
      console.log("Audio played successfully with volume:", audio.volume);
    } catch (err) {
      console.log("Error playing audio:", err);
    }
  }
});