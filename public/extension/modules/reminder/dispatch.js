import { getSetting } from '../storage/sync.js';
import { playOnce } from '../audio/player.js';
import { showReminderNotification } from '../notifications/reminder.js';

/**
 * Trigger the configured reminder (sound and/or notification).
 */
export async function dispatchReminder() {
    const reminderType = await getSetting('reminderType');
    const tasks = [];

    if (reminderType.sound) tasks.push(playOnce());
    if (reminderType.notification) tasks.push(showReminderNotification());

    if (!tasks.length) {
        await playOnce();
        return;
    }

    await Promise.allSettled(tasks);
}
