  const audio = new Audio(chrome.runtime.getURL("audio.mp3"));
  audio.volume = 1.0;
  audio.play().catch((err) => {
    console.log("Autoplay failed: ", err);
  });