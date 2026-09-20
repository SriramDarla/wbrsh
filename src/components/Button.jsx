import { forwardRef } from 'react';
import { cx } from './utils.js';

/**
 * Slots: icon (before the label), children (the label), iconEnd (after it).
 * variant: solid | accent | outline | ghost      size: sm | md | lg
 * Pass `href` and it renders as a link instead of a button.
 */
const Button = forwardRef(function Button(
  { variant = 'solid', size = 'md', icon, iconEnd, href, disabled, className, children, ...rest },
  ref
) {
  const classes = cx('ui-btn', `ui-btn--${variant}`, `ui-btn--${size}`, className);
  const content = (
    <>
      {icon && <span className="ui-btn__icon" aria-hidden="true">{icon}</span>}
      {children}
      {iconEnd && <span className="ui-btn__icon" aria-hidden="true">{iconEnd}</span>}
    </>
  );

  if (href) {
    return (
      <a ref={ref} className={classes} href={href} aria-disabled={disabled || undefined} {...rest}>
        {content}
      </a>
    );
  }
  return (
    <button ref={ref} className={classes} type="button" disabled={disabled} {...rest}>
      {content}
    </button>
  );
});

export default Button;
