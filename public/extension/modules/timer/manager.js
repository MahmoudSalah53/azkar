/**
 * Start or update the timer using chrome.alarms (Reliable for Manifest V3)
 * @param {number} durationMs - The duration in milliseconds
 */
export async function startTimer(durationMs) {
    // 1. Clear any existing alarm
    await chrome.alarms.clear("azkarReminderAlarm");
    await chrome.alarms.clear("azkarAudioAlarm"); // legacy cleanup

    // 2. If duration is 0 → stop
    if (durationMs <= 0) return;

    // 3. Create a periodic alarm
    // Note: chrome.alarms takes minutes as a unit
    const periodInMinutes = durationMs / 60000;

    chrome.alarms.create("azkarReminderAlarm", {
        periodInMinutes: periodInMinutes,
        delayInMinutes: periodInMinutes
    });

    console.log(`Alarm set for every ${periodInMinutes} minutes`);
}
