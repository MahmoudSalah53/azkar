(function () {
    if (window.__azkarToastReady) return;
    window.__azkarToastReady = true;

    const TOAST_DURATION = 6000;
    const MIN_GAP_MS = 2000;

    let host = null;
    let shadow = null;
    let hideTimer = null;
    let progressAnim = null;
    let lastShownAt = 0;

    const STYLES = `
        :host { all: initial; }
        .toast-wrap {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 2147483647;
            pointer-events: none;
            font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
        }
        .toast {
            pointer-events: auto;
            direction: rtl;
            width: min(340px, calc(100vw - 40px));
            background: linear-gradient(135deg, #F7F2E8 0%, #EDE6D3 100%);
            border: 1px solid rgba(201, 168, 76, 0.45);
            border-radius: 10px;
            box-shadow: 0 10px 28px rgba(15, 61, 58, 0.2), 0 4px 10px rgba(0, 0, 0, 0.07);
            overflow: hidden;
            transform: translateX(calc(100% + 28px));
            opacity: 0;
            transition: transform 0.42s cubic-bezier(0.21, 1.02, 0.73, 1), opacity 0.32s ease;
        }
        .toast.show {
            transform: translateX(0);
            opacity: 1;
        }
        .toast.hide {
            transform: translateX(calc(100% + 28px));
            opacity: 0;
        }
        .toast-inner {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            padding: 12px 12px 10px;
        }
        .toast-message {
            flex: 1;
            min-width: 0;
            font-size: 14px;
            font-weight: 500;
            color: #1C1C1C;
            line-height: 1.6;
            word-break: break-word;
        }
        .toast-close {
            flex-shrink: 0;
            border: none;
            background: rgba(26, 95, 90, 0.08);
            color: #1A5F5A;
            width: 22px;
            height: 22px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 15px;
            line-height: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
            margin-top: 1px;
        }
        .toast-close:hover {
            background: rgba(26, 95, 90, 0.16);
        }
        .toast-progress {
            height: 3px;
            background: rgba(201, 168, 76, 0.25);
        }
        .toast-progress-bar {
            height: 100%;
            width: 100%;
            background: linear-gradient(90deg, #C9A84C, #E2C97A);
            transform-origin: right center;
        }
    `;

    function ensureHost() {
        if (host) return;

        host = document.createElement('div');
        host.id = 'azkar-toast-root';
        host.style.cssText = 'all:initial;position:fixed;inset:0;pointer-events:none;z-index:2147483647;';
        document.documentElement.appendChild(host);

        shadow = host.attachShadow({ mode: 'closed' });

        const style = document.createElement('style');
        style.textContent = STYLES;
        shadow.appendChild(style);

        const wrap = document.createElement('div');
        wrap.className = 'toast-wrap';
        wrap.innerHTML = `
            <div class="toast" id="toast" role="status" aria-live="polite">
                <div class="toast-inner">
                    <div class="toast-message" id="toastMessage"></div>
                    <button class="toast-close" id="toastClose" type="button" aria-label="إغلاق">×</button>
                </div>
                <div class="toast-progress">
                    <div class="toast-progress-bar" id="toastProgress"></div>
                </div>
            </div>
        `;
        shadow.appendChild(wrap);

        shadow.getElementById('toastClose').addEventListener('click', hideToast);
    }

    function hideToast() {
        const toast = shadow?.getElementById('toast');
        if (!toast) return;

        clearTimeout(hideTimer);
        if (progressAnim) progressAnim.cancel();

        toast.classList.remove('show');
        toast.classList.add('hide');
    }

    function resetHideTimer(duration) {
        clearTimeout(hideTimer);
        if (progressAnim) progressAnim.cancel();

        const progress = shadow.getElementById('toastProgress');
        progress.style.transform = 'scaleX(1)';
        progressAnim = progress.animate(
            [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }],
            { duration, easing: 'linear', fill: 'forwards' }
        );

        hideTimer = setTimeout(hideToast, duration);
    }

    function showToast({ message, duration = TOAST_DURATION }) {
        const now = Date.now();
        const toast = shadow?.getElementById('toast');

        if (now - lastShownAt < MIN_GAP_MS && toast?.classList.contains('show')) {
            shadow.getElementById('toastMessage').textContent = message;
            resetHideTimer(duration);
            return;
        }

        lastShownAt = now;
        ensureHost();

        const toastEl = shadow.getElementById('toast');
        shadow.getElementById('toastMessage').textContent = message;

        toastEl.classList.remove('hide');
        requestAnimationFrame(() => {
            toastEl.classList.add('show');
            resetHideTimer(duration);
        });
    }

    chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
        if (msg.type !== 'AZKAR_TOAST') return;

        showToast({
            message: msg.message,
            duration: msg.duration || TOAST_DURATION,
        });
        sendResponse({ ok: true });
        return true;
    });
})();
