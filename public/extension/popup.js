document.addEventListener('DOMContentLoaded', () => {
    const slider = document.getElementById('vol');
    const label = document.getElementById('volVal');
    const timerSelect = document.getElementById('timer');
    const checkbox = document.getElementById('playNewTab');

    let lastVol = 1.0; // last volume value

    // Load stored timer value (default 10 minutes)
    chrome.storage.local.get({ timer: 600000 }, (result) => {
        timerSelect.value = result.timer;
    });

    // Update icon based on volume
    function updateIcon(val) {
        volIcon.textContent = val === 0 ? '🔇' : val < 0.4 ? '🔉' : '🔊';
        slider.style.setProperty('--pct', Math.round(val * 100));
    }

    // Load stored volume when the popup opens
    chrome.storage.local.get(['volume'], (result) => {
        const vol = result.volume !== undefined ? result.volume : 1.0;
        slider.value = vol;
        if (vol > 0) lastVol = vol;
        updateIcon(vol);
    });

    // Save volume when slider changes
    slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (val > 0) lastVol = val;
        updateIcon(val);
        chrome.storage.local.set({ volume: val });
    });

    // Mute/Unmute volume
    volIcon.addEventListener('click', () => {
        if (parseFloat(slider.value) > 0) {
            lastVol = parseFloat(slider.value);
            slider.value = 0;
        } else {
            slider.value = lastVol;
        }
        updateIcon(parseFloat(slider.value));
        chrome.storage.local.set({ volume: parseFloat(slider.value) });
    });

    // Update and start the timer when the user selects a new duration
    timerSelect.addEventListener('change', (e) => {
        const time = Number(e.target.value);
        chrome.storage.local.set({ timer: time });

        chrome.runtime.sendMessage({
            setTimer: true,
            duration: time
        });
    });

    // Load saved value
    chrome.storage.local.get({ playNewTab: true }, (result) => {
        checkbox.checked = result.playNewTab;
    });

    // Save value when changed
    checkbox.addEventListener('change', (e) => {
        chrome.storage.local.set({ playNewTab: e.target.checked });
    });
});