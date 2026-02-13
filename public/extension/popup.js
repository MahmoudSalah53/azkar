document.addEventListener('DOMContentLoaded', () => {
    const slider = document.getElementById('vol');
    const label = document.getElementById('volVal');
    const timerSelect = document.getElementById('timer');
    const checkbox = document.getElementById('playNewTab');

    // Load stored volume when the popup opens
    chrome.storage.local.get(['volume'], (result) => {
        const vol = result.volume !== undefined ? result.volume : 1.0;
        slider.value = vol;
        label.textContent = Math.round(vol * 100) + '%';
    });

    // Save volume when slider changes
    slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        label.textContent = Math.round(val * 100) + '%';

        // Save value in storage for background usage
        chrome.storage.local.set({ volume: val });
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