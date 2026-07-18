(function () {
    if (window.__azkarBubbleReady) return;
    window.__azkarBubbleReady = true;

    const SIZE = 40;
    const EDGE_PAD = 12;
    const DRAG_THRESHOLD = 6;
    const STORAGE_KEY = 'bubblePos';
    const ENABLED_KEY = 'bubbleEnabled';
    const LOGO_URL = chrome.runtime.getURL('icon.png');

    let host = null;
    let shadow = null;
    let bubble = null;
    let enabled = true;

    let pos = { side: 'right', y: null };
    let dragging = false;
    let didDrag = false;
    let startX = 0;
    let startY = 0;
    let originLeft = 0;
    let originTop = 0;
    let currentLeft = 0;
    let currentTop = 0;
    let activePointerId = null;

    const STYLES = `
        :host { all: initial; }
        .bubble {
            position: fixed;
            width: ${SIZE}px;
            height: ${SIZE}px;
            border-radius: 50%;
            z-index: 2147483646;
            cursor: grab;
            touch-action: none;
            user-select: none;
            -webkit-user-select: none;
            box-shadow:
                0 4px 14px rgba(15, 61, 58, 0.26),
                0 1px 4px rgba(0, 0, 0, 0.1);
            background: linear-gradient(145deg, #1A5F5A 0%, #0F3D3A 100%);
            border: 1.5px solid rgba(201, 168, 76, 0.65);
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: left 0.38s cubic-bezier(0.22, 1, 0.36, 1),
                        top 0.38s cubic-bezier(0.22, 1, 0.36, 1);
            will-change: left, top;
            padding: 0;
            margin: 0;
            appearance: none;
            -webkit-appearance: none;
        }
        .bubble.is-dragging {
            cursor: grabbing;
            transition: none;
        }
        .bubble img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            pointer-events: none;
            display: block;
        }
        .bubble:focus {
            outline: none;
        }
        .bubble:focus-visible {
            outline: 2px solid rgba(201, 168, 76, 0.9);
            outline-offset: 2px;
        }
    `;

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    function maxY() {
        return Math.max(EDGE_PAD, window.innerHeight - SIZE - EDGE_PAD);
    }

    function resolveCoords(side, y) {
        const left = side === 'left'
            ? EDGE_PAD
            : window.innerWidth - SIZE - EDGE_PAD;
        const top = clamp(
            y == null ? window.innerHeight * 0.55 : y,
            EDGE_PAD,
            maxY()
        );
        return { left, top };
    }

    function applyPosition(left, top, animate) {
        currentLeft = left;
        currentTop = top;
        if (!bubble) return;

        if (!animate) {
            bubble.style.transition = 'none';
        } else {
            bubble.style.transition = '';
        }

        bubble.style.left = `${left}px`;
        bubble.style.top = `${top}px`;

        if (!animate) {
            void bubble.offsetWidth;
            bubble.style.transition = '';
        }
    }

    function snapFromPoint(left, top) {
        const centerX = left + SIZE / 2;
        const side = centerX < window.innerWidth / 2 ? 'left' : 'right';
        const snapped = resolveCoords(side, top);
        pos = { side, y: snapped.top };
        applyPosition(snapped.left, snapped.top, true);
        persistPosition();
    }

    function persistPosition() {
        try {
            chrome.storage.local.set({ [STORAGE_KEY]: pos });
        } catch (_) {
            /* extension context may be invalidated */
        }
    }

    function loadPosition(cb) {
        try {
            chrome.storage.local.get(STORAGE_KEY, (data) => {
                if (chrome.runtime.lastError) {
                    cb(null);
                    return;
                }
                cb(data?.[STORAGE_KEY] || null);
            });
        } catch (_) {
            cb(null);
        }
    }

    function setVisible(isEnabled) {
        enabled = isEnabled !== false;
        if (!host) return;
        host.style.display = enabled ? '' : 'none';
    }

    function loadEnabled(cb) {
        try {
            chrome.storage.local.get({ [ENABLED_KEY]: true }, (data) => {
                if (chrome.runtime.lastError) {
                    cb(true);
                    return;
                }
                cb(data?.[ENABLED_KEY] !== false);
            });
        } catch (_) {
            cb(true);
        }
    }

    function openExtensionPopup() {
        try {
            chrome.runtime.sendMessage({ type: 'OPEN_POPUP' }, () => {
                void chrome.runtime.lastError;
            });
        } catch (_) {
            /* ignore */
        }
    }

    function onPointerDown(e) {
        if (e.button != null && e.button !== 0) return;

        dragging = true;
        didDrag = false;
        activePointerId = e.pointerId;
        startX = e.clientX;
        startY = e.clientY;
        originLeft = currentLeft;
        originTop = currentTop;

        bubble.classList.add('is-dragging');
        bubble.setPointerCapture(e.pointerId);
        e.preventDefault();
    }

    function onPointerMove(e) {
        if (!dragging || e.pointerId !== activePointerId) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        if (!didDrag && Math.hypot(dx, dy) >= DRAG_THRESHOLD) {
            didDrag = true;
        }

        if (!didDrag) return;

        const nextLeft = clamp(
            originLeft + dx,
            EDGE_PAD,
            window.innerWidth - SIZE - EDGE_PAD
        );
        const nextTop = clamp(originTop + dy, EDGE_PAD, maxY());
        applyPosition(nextLeft, nextTop, false);
    }

    function onPointerUp(e) {
        if (!dragging || e.pointerId !== activePointerId) return;

        dragging = false;
        activePointerId = null;
        bubble.classList.remove('is-dragging');

        try {
            bubble.releasePointerCapture(e.pointerId);
        } catch (_) {
            /* already released */
        }

        if (didDrag) {
            snapFromPoint(currentLeft, currentTop);
            return;
        }

        openExtensionPopup();
    }

    function onPointerCancel(e) {
        if (!dragging || e.pointerId !== activePointerId) return;

        dragging = false;
        activePointerId = null;
        bubble.classList.remove('is-dragging');
        snapFromPoint(currentLeft, currentTop);
    }

    function onResize() {
        const snapped = resolveCoords(pos.side, pos.y);
        pos.y = snapped.top;
        applyPosition(snapped.left, snapped.top, false);
    }

    function mount() {
        if (host) return;

        host = document.createElement('div');
        host.id = 'azkar-bubble-root';
        host.style.cssText = 'all:initial;position:fixed;inset:0;pointer-events:none;z-index:2147483646;';
        document.documentElement.appendChild(host);

        shadow = host.attachShadow({ mode: 'closed' });

        const style = document.createElement('style');
        style.textContent = STYLES;
        shadow.appendChild(style);

        bubble = document.createElement('button');
        bubble.type = 'button';
        bubble.className = 'bubble';
        bubble.setAttribute('aria-label', 'SALLI');
        bubble.title = 'SALLI';
        bubble.style.pointerEvents = 'auto';

        const img = document.createElement('img');
        img.src = LOGO_URL;
        img.alt = 'SALLI';
        img.draggable = false;
        bubble.appendChild(img);

        shadow.appendChild(bubble);

        bubble.addEventListener('pointerdown', onPointerDown);
        bubble.addEventListener('pointermove', onPointerMove);
        bubble.addEventListener('pointerup', onPointerUp);
        bubble.addEventListener('pointercancel', onPointerCancel);
        bubble.addEventListener('click', (e) => {
            if (didDrag) e.preventDefault();
        });

        window.addEventListener('resize', onResize);

        try {
            chrome.storage.onChanged.addListener((changes, namespace) => {
                if (namespace !== 'local' || !changes[ENABLED_KEY]) return;
                setVisible(changes[ENABLED_KEY].newValue !== false);
            });
        } catch (_) {
            /* ignore */
        }

        loadEnabled((isEnabled) => {
            setVisible(isEnabled);
        });

        loadPosition((saved) => {
            if (saved?.side) {
                pos = {
                    side: saved.side === 'left' ? 'left' : 'right',
                    y: typeof saved.y === 'number' ? saved.y : null,
                };
            }
            const coords = resolveCoords(pos.side, pos.y);
            pos.y = coords.top;
            applyPosition(coords.left, coords.top, false);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mount, { once: true });
    } else {
        mount();
    }
})();
