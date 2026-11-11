// Makes a non-button element reachable and usable from the keyboard.
export function activatable(onActivate, label) {
    return {
        role: 'link',
        tabIndex: 0,
        'aria-label': label,
        onClick: onActivate,
        onKeyDown: (event) => {
            if (event.target !== event.currentTarget) return;
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onActivate();
            }
        },
    };
}
