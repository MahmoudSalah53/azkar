document.addEventListener('DOMContentLoaded', () => {
    const slider = document.getElementById('vol');
    const label = document.getElementById('volVal');

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
});