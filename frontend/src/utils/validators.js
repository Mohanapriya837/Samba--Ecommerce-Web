export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '');
export const isPhone = (v) => /^\+?[0-9\s-]{7,20}$/.test(v || '');

/** Mirrors the backend rule: 8-64 characters, at least one letter and one number. */
export const isStrongPassword = (v) => /^(?=.*[A-Za-z])(?=.*\d).{8,64}$/.test(v || '');
export const PASSWORD_HINT = 'At least 8 characters, with a letter and a number';
