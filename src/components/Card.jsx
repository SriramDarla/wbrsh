import { cx } from './utils.js';

/**
 * Slots, top to bottom: media, meta, title, children (the body), footer.
 * Every slot is optional: leave the prop out and that part isn't rendered.
 */
export default function Card({
  as: Tag = 'article',
  titleAs: Title = 'h3',
  media,
  meta,
  title,
  footer,
  className,
  children,
  ...rest
}) {
  return (
    <Tag className={cx('ui-card', className)} {...rest}>
      {media && <div className="ui-card__media">{media}</div>}
      <div className="ui-card__body">
        {meta && <div className="ui-card__meta">{meta}</div>}
        {title && <Title className="ui-card__title">{title}</Title>}
        {children}
      </div>
      {footer && <div className="ui-card__footer">{footer}</div>}
    </Tag>
  );
}
