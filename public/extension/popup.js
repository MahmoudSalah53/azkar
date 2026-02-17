import { getSetting, setSetting } from './modules/storage/sync.js';

document.addEventListener('DOMContentLoaded', async () => {
    const slider = document.getElementById('vol');
    const volIcon = document.getElementById('volIcon');
    const timerSelect = document.getElementById('timer');
    const checkbox = document.getElementById('playNewTab');

    let lastVol = 1.0;

    // Update icon and track based on volume
    function updateUI(val) {
        volIcon.textContent = val === 0 ? '🔇' : val < 0.4 ? '🔉' : '🔊';
        slider.style.setProperty('--pct', Math.round(val * 100));
        slider.value = val;
    }

    // Load stored values
    const timerValue = await getSetting('timer');
    const volumeValue = await getSetting('volume');
    const playNewTabValue = await getSetting('playNewTab');

    timerSelect.value = timerValue;
    checkbox.checked = playNewTabValue;

    if (volumeValue > 0) lastVol = volumeValue;
    updateUI(volumeValue);

    // Save volume when slider changes
    slider.addEventListener('input', async (e) => {
        const val = parseFloat(e.target.value);
        if (val > 0) lastVol = val;
        updateUI(val);
        await setSetting('volume', val);
    });

    // Mute/Unmute volume
    volIcon.addEventListener('click', async () => {
        const currentVal = parseFloat(slider.value);
        const newVal = currentVal > 0 ? 0 : lastVol;

        updateUI(newVal);
        await setSetting('volume', newVal);
    });

    // Update and start the timer when the user selects a new duration
    timerSelect.addEventListener('change', async (e) => {
        const time = Number(e.target.value);
        await setSetting('timer', time);

        chrome.runtime.sendMessage({
            setTimer: true,
            duration: time
        });
    });

    // Save value when checkbox changed
    checkbox.addEventListener('change', async (e) => {
        await setSetting('playNewTab', e.target.checked);
    });
});
