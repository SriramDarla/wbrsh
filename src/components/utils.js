// Joins class names, skipping anything falsy: cx('a', false && 'b', 'c') -> 'a c'
export const cx = (...parts) => parts.filter(Boolean).join(' ');
