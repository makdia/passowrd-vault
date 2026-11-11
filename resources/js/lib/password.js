const CHARACTER_SETS = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    symbols: '!@#$%^&*()-_=+[]{};:,.?/~',
};
const AMBIGUOUS = /[O0oIl1|]/g;

export const DEFAULT_GENERATOR_OPTIONS = {
    length: 20,
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: false,
};

// Unbiased index from crypto.getRandomValues (no modulo bias).
function randomIndex(max) {
    const limit = Math.floor(0x100000000 / max) * max;
    const buffer = new Uint32Array(1);
    do {
        window.crypto.getRandomValues(buffer);
    } while (buffer[0] >= limit);
    return buffer[0] % max;
}

export function generatePassword(options = DEFAULT_GENERATOR_OPTIONS) {
    const { length, excludeAmbiguous } = { ...DEFAULT_GENERATOR_OPTIONS, ...options };
    const pools = Object.keys(CHARACTER_SETS)
        .filter((set) => options[set] ?? DEFAULT_GENERATOR_OPTIONS[set])
        .map((set) => (excludeAmbiguous ? CHARACTER_SETS[set].replace(AMBIGUOUS, '') : CHARACTER_SETS[set]));

    if (pools.length === 0) return '';

    // One character from every chosen set, then fill and shuffle.
    const all = pools.join('');
    const characters = pools.map((pool) => pool[randomIndex(pool.length)]);
    while (characters.length < length) {
        characters.push(all[randomIndex(all.length)]);
    }
    for (let i = characters.length - 1; i > 0; i--) {
        const j = randomIndex(i + 1);
        [characters[i], characters[j]] = [characters[j], characters[i]];
    }
    return characters.slice(0, length).join('');
}

// Same "weak" rule as App\Services\PasswordHealth, so the UI and dashboard agree.
export function passwordStrength(password = '') {
    if (!password) return { level: 0, label: '', percent: 0, status: 'normal' };

    const sets = [/[a-z]/, /[A-Z]/, /\d/, /[^a-zA-Z\d]/].filter((rule) => rule.test(password)).length;
    const length = [...password].length;

    if (length < 10 || sets < 3) return { level: 1, label: 'Weak', percent: 25, status: 'exception' };
    if (length < 14) return { level: 2, label: 'Fair', percent: 50, status: 'normal' };
    if (length < 20 || sets < 4) return { level: 3, label: 'Good', percent: 75, status: 'active' };
    return { level: 4, label: 'Strong', percent: 100, status: 'success' };
}
