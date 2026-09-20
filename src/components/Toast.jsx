import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cx } from './utils.js';

const ToastContext = createContext(null);
let nextId = 0;

/**
 * Wrap your app once:   <ToastProvider> ... </ToastProvider>
 * Then anywhere inside: const { toast } = useToast();
 *   toast('Saved')                                   // just a title
 *   toast({ title, description, variant, icon, action, duration })
 *     variant: default | success | error     icon / action -> slots (any JSX)
 *     duration: ms before it disappears (0 = stays until dismissed)
 */
export function ToastProvider({ children, duration = 4500, max = 4, className }) {
  const [items, setItems] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setItems((list) => list.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (input) => {
      const opts = typeof input === 'string' ? { title: input } : input;
      const id = ++nextId;
      setItems((list) => [...list, { id, variant: 'default', ...opts }].slice(-max));
      const ms = opts.duration ?? duration;
      if (ms > 0) timers.current.set(id, setTimeout(() => dismiss(id), ms));
      return id;
    },
    [duration, max, dismiss]
  );

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => clearTimeout(t));
  }, []);

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className={cx('ui-toasts', className)} role="region" aria-label="Notifications" aria-live="polite">
          {items.map((t) => (
            <div
              key={t.id}
              className={cx('ui-toast', `ui-toast--${t.variant}`)}
              role={t.variant === 'error' ? 'alert' : 'status'}
            >
              {t.icon && <span className="ui-toast__icon">{t.icon}</span>}
              <div className="ui-toast__text">
                <strong>{t.title}</strong>
                {t.description && <p>{t.description}</p>}
              </div>
              {t.action && <div className="ui-toast__action">{t.action}</div>}
              <button type="button" className="ui-toast__close" aria-label="Dismiss" onClick={() => dismiss(t.id)}>
                ×
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
