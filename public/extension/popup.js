import { getSetting, setSetting } from './modules/storage/sync.js';
import { audios } from './modules/audio/list.js';

document.addEventListener('DOMContentLoaded', async () => {
    const slider = document.getElementById('vol');
    const volIcon = document.getElementById('volIcon');
    const timerSelect = document.getElementById('timer');
    const customTimerWrap = document.getElementById('customTimerWrap');
    const customMinutesInput = document.getElementById('customMinutes');
    const checkbox = document.getElementById('playNewTab');
    const audioSelectText = document.getElementById('audioSelectText');
    const audioSelectOptions = document.getElementById('audioSelectOptions');
    const audioSelectWrap = document.getElementById('audioSelectWrap');
    const countValue = document.getElementById('countValue');
    const resetBtn = document.getElementById('resetBtn');

    let lastVol = 1.0;
    let resetTimeout = null;

    function updateUI(val) {
        volIcon.textContent = val === 0 ? '🔇' : val < 0.4 ? '🔉' : '🔊';
        slider.style.setProperty('--pct', Math.round(val * 100));
        slider.value = val;
    }

    const timerValue = await getSetting('timer');
    const volumeValue = await getSetting('volume');
    const playNewTabValue = await getSetting('playNewTab');
    const selectedAudioValue = await getSetting('selectedAudio');
    const dhikrCountValue = await getSetting('dhikrCount');

    countValue.textContent = dhikrCountValue.toLocaleString('ar-EG');

    // ── Custom Audio Select ──
    audios.forEach(audio => {
        const opt = document.createElement('div');
        opt.className = 'custom-select__option' + (audio.id === selectedAudioValue ? ' selected' : '');
        opt.textContent = audio.name;
        opt.dataset.value = audio.id;
        if (audio.id === selectedAudioValue) audioSelectText.textContent = audio.name;
        opt.addEventListener('click', async () => {
            audioSelectOptions.querySelectorAll('.custom-select__option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            audioSelectText.textContent = audio.name;
            audioSelectWrap.classList.remove('open');
            await setSetting('selectedAudio', audio.id);
        });
        audioSelectOptions.appendChild(opt);
    });

    document.getElementById('audioSelectTrigger').addEventListener('click', () => {
        audioSelectWrap.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
        if (!audioSelectWrap.contains(e.target)) audioSelectWrap.classList.remove('open');
    });

    // ── Timer ──
    const isStandardOption = [...timerSelect.options].some(opt => opt.value === String(timerValue));
    if (isStandardOption) {
        timerSelect.value = timerValue;
        customTimerWrap.style.display = 'none';
    } else if (timerValue > 0) {
        timerSelect.value = 'custom';
        customTimerWrap.style.display = 'block';
        customMinutesInput.value = Math.round(timerValue / 60000);
    }

    checkbox.checked = playNewTabValue;
    if (volumeValue > 0) lastVol = volumeValue;
    updateUI(volumeValue);

    // ── Volume ──
    slider.addEventListener('input', async (e) => {
        const val = parseFloat(e.target.value);
        if (val > 0) lastVol = val;
        updateUI(val);
        await setSetting('volume', val);
    });

    volIcon.addEventListener('click', async () => {
        const newVal = parseFloat(slider.value) > 0 ? 0 : lastVol;
        updateUI(newVal);
        await setSetting('volume', newVal);
    });

    // ── Timer Select ──
    timerSelect.addEventListener('change', async (e) => {
        const val = e.target.value;
        if (val === 'custom') {
            customTimerWrap.style.display = 'block';
            customMinutesInput.focus();
        } else {
            customTimerWrap.style.display = 'none';
            const time = Number(val);
            await setSetting('timer', time);
            chrome.runtime.sendMessage({ setTimer: true, duration: time });
        }
    });

    customMinutesInput.addEventListener('input', async (e) => {
        const mins = Number(e.target.value);
        if (mins > 0) {
            const time = mins * 60000;
            await setSetting('timer', time);
            chrome.runtime.sendMessage({ setTimer: true, duration: time });
        }
    });

    // ── New Tab Checkbox ──
    checkbox.addEventListener('change', async (e) => {
        await setSetting('playNewTab', e.target.checked);
    });

    // ── Reset Button ──
    resetBtn.addEventListener('click', async () => {
        if (resetBtn.classList.contains('confirm')) {
            clearTimeout(resetTimeout);
            resetBtn.classList.remove('confirm');
            resetBtn.textContent = '↺';
            resetBtn.style.width = '26px';
            await chrome.storage.local.set({ dhikrCount: 0 });
            countValue.textContent = (0).toLocaleString('ar-EG');
        } else {
            resetBtn.classList.add('confirm');
            resetBtn.textContent = 'تأكيد؟';
            resetBtn.style.width = 'auto';
            resetTimeout = setTimeout(() => {
                resetBtn.classList.remove('confirm');
                resetBtn.textContent = '↺';
                resetBtn.style.width = '26px';
            }, 3000);
        }
    });

    // ── Storage Listener ──
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes.dhikrCount) {
            countValue.textContent = changes.dhikrCount.newValue.toLocaleString('ar-EG');
        }
    });
});