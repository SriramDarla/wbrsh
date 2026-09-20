import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cx } from './utils.js';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Slots: title (header), children (body), footer (usually buttons).
 * Controlled: you own `open` and pass `onClose`. Esc, the backdrop and the × all call onClose.
 * Focus is trapped inside while open and returned to the trigger on close.
 */
export default function Modal({ open, onClose, title, footer, children, className, closeOnBackdrop = true }) {
  const panelRef = useRef(null);
  const titleId = useId();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const panel = panelRef.current;
    (panel?.querySelector(FOCUSABLE) || panel)?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e) => {
      if (e.key === 'Escape') {
        onCloseRef.current?.();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;
      const items = [...panel.querySelectorAll(FOCUSABLE)];
      if (!items.length) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      previous?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className={cx('ui-modal', className)}
      onMouseDown={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className="ui-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        ref={panelRef}
        tabIndex={-1}
      >
        {(title || onClose) && (
          <div className="ui-modal__header">
            {title && (
              <h2 className="ui-modal__title" id={titleId}>
                {title}
              </h2>
            )}
            {onClose && (
              <button type="button" className="ui-modal__close" aria-label="Close" onClick={onClose}>
                ×
              </button>
            )}
          </div>
        )}
        <div className="ui-modal__body">{children}</div>
        {footer && <div className="ui-modal__footer">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
