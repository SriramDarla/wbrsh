import { forwardRef, useId } from 'react';
import { cx } from './utils.js';

/**
 * Slots: label (above), prefix (inside, before the text), suffix (inside, after it),
 * hint (helper text below), error (replaces the hint and turns the field red).
 * Add `multiline` for a textarea. Any other prop (value, onChange, type...) goes to the input.
 */
const Input = forwardRef(function Input(
  { label, hint, error, prefix, suffix, multiline = false, id, className, ...rest },
  ref
) {
  const autoId = useId();
  const inputId = id || autoId;
  const describedBy = hint || error ? `${inputId}-desc` : undefined;
  const Control = multiline ? 'textarea' : 'input';

  return (
    <div className={cx('ui-field', error && 'ui-field--error', className)}>
      {label && (
        <label className="ui-field__label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className="ui-field__control">
        {prefix && <span className="ui-field__affix">{prefix}</span>}
        <Control
          ref={ref}
          id={inputId}
          className="ui-field__input"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...rest}
        />
        {suffix && <span className="ui-field__affix">{suffix}</span>}
      </div>
      {(error || hint) && (
        <p className="ui-field__hint" id={`${inputId}-desc`}>
          {error || hint}
        </p>
      )}
    </div>
  );
});

export default Input;
