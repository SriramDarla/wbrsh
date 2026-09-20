import { cx } from './utils.js';

/**
 * Three slots: left, center, right. Pass any JSX to a slot to fill it;
 * leave a prop out and that slot is simply empty.
 */
export default function Navbar({ left, center, right, label = 'Main', className }) {
  return (
    <nav className={cx('ui-navbar', className)} aria-label={label}>
      <div className="ui-navbar__left">{left}</div>
      {center ? <div className="ui-navbar__center">{center}</div> : <div />}
      <div className="ui-navbar__right">{right}</div>
    </nav>
  );
}
