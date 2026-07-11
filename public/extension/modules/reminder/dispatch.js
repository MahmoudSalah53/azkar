import { getSetting } from '../storage/sync.js';
import { playOnce } from '../audio/player.js';
import { showReminderNotification } from '../notifications/reminder.js';

/**
 * Trigger the configured reminder (sound or notification).
 */
export async function dispatchReminder() {
    const reminderType = await getSetting('reminderType');

    if (reminderType === 'notification') {
        await showReminderNotification();
        return;
    }

    await playOnce();
}
