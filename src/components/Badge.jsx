import { cx } from './utils.js';

/**
 * Slots: icon (before the text), children (the text). `dot` adds a small status dot.
 * variant: neutral | accent | outline | success | warning | danger
 */
export default function Badge({ variant = 'neutral', dot = false, icon, className, children, ...rest }) {
  return (
    <span className={cx('ui-badge', `ui-badge--${variant}`, className)} {...rest}>
      {dot && <i className="ui-badge__dot" aria-hidden="true" />}
      {icon && <span className="ui-badge__icon" aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}
