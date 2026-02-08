chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.play) {
    try {
      const audioUrl = chrome.runtime.getURL("audio.mp3");
      const audio = new Audio(audioUrl);
      audio.volume = 1.0;
      await audio.play();
      console.log("Audio played successfully");
    } catch (err) {
      console.log("Error playing audio:", err);
    }
  }
});
