import { playOnce } from '../audio/player.js';

let timerInterval = null; // Holds the current timer so we can clear or update it

/**
 * Start or update the timer with a given duration
 * @param {number} duration - The duration in milliseconds
 */
export function startTimer(duration) {
    // If a timer already exists, clear it first
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    // If duration is 0 → stop the timer
    if (duration === 0) return;

    // Start a new timer: call playOnce every "duration" milliseconds
    timerInterval = setInterval(() => {
        playOnce();
    }, duration);
}
