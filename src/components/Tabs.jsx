import { useId, useRef, useState } from 'react';
import { cx } from './utils.js';

/**
 * tabs = [{ id, label, content, icon?, badge? }]
 *   icon  -> slot before the label       badge -> slot after the label
 *   content -> what shows in the panel when the tab is active
 * end = slot at the right end of the tab row.
 * Uncontrolled by default (defaultValue); pass value + onChange to control it yourself.
 * Arrow keys, Home and End move between tabs.
 */
export default function Tabs({ tabs, value, defaultValue, onChange, end, className }) {
  const uid = useId();
  const [inner, setInner] = useState(defaultValue ?? tabs[0]?.id);
  const active = value ?? inner;
  const refs = useRef({});

  const select = (id) => {
    if (value === undefined) setInner(id);
    onChange?.(id);
  };

  const onKeyDown = (e) => {
    const i = tabs.findIndex((t) => t.id === active);
    let next = null;
    if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
    if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
    if (e.key === 'Home') next = tabs[0];
    if (e.key === 'End') next = tabs[tabs.length - 1];
    if (next) {
      e.preventDefault();
      select(next.id);
      refs.current[next.id]?.focus();
    }
  };

  const current = tabs.find((t) => t.id === active) || tabs[0];

  return (
    <div className={cx('ui-tabs', className)}>
      <div className="ui-tabs__list" role="tablist" onKeyDown={onKeyDown}>
        {tabs.map((t) => (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[t.id] = el;
            }}
            type="button"
            role="tab"
            className="ui-tab"
            id={`${uid}-tab-${t.id}`}
            aria-selected={t.id === active}
            aria-controls={`${uid}-panel-${t.id}`}
            tabIndex={t.id === active ? 0 : -1}
            onClick={() => select(t.id)}
          >
            {t.icon}
            {t.label}
            {t.badge}
          </button>
        ))}
        {end && <div className="ui-tabs__end">{end}</div>}
      </div>
      {current && (
        <div
          className="ui-tabs__panel"
          role="tabpanel"
          id={`${uid}-panel-${current.id}`}
          aria-labelledby={`${uid}-tab-${current.id}`}
        >
          {current.content}
        </div>
      )}
    </div>
  );
}
