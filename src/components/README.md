# UI components

Eight reusable components, all in this folder. Import what you need:

    import { Navbar, Button, Card, Badge, Input, Modal, Tabs, ToastProvider, useToast } from './components';

See every one with its slots filled in by running the app and opening
`http://localhost:5173/#components` (see `Showcase.jsx`).

Restyle everything at once by editing the `--ui-*` variables at the top of `ui.css`.
On a dark background, wrap things in `<div className="ui-dark">`.

## What a "slot" is here

A slot is a prop that takes any JSX (text, icons, other components). The component
places it in a fixed spot. Every slot is optional and guarded, so if you leave the
prop out, nothing renders for it.

| Component | Slots |
|-----------|-------|
| Navbar | `left`, `center`, `right` |
| Button | `icon`, children (the label), `iconEnd` |
| Card | `media`, `meta`, `title`, children (the body), `footer` |
| Badge | `icon`, children (the text) |
| Input | `label`, `prefix`, `suffix`, `hint`, `error` |
| Modal | `title`, children (the body), `footer` |
| Tabs | per tab: `icon`, `label`, `badge`, `content`; plus `end` on the tab row |
| Toast | per toast: `icon`, `title`, `description`, `action` |

## Adding to a slot (no component code touched)

Pass the prop. Put several things in one slot by wrapping them in a fragment.

    <Navbar
      left={<a href="/">Boc Studio</a>}
      center={<>
        <a href="/work">Work</a>
        <a href="/about">About</a>      {/* add a link: add a line here */}
      </>}
      right={<Button size="sm">Contact</Button>}
    />

## Removing from a slot

Delete the prop (or one item inside a fragment). The area disappears with it.

    <Navbar left={<a href="/">Boc Studio</a>} />     // center and right are gone

    <Card title="Just a title" />                    // no media, meta, body or footer

## Adding a brand-new slot to a component

Three edits, all in that component's files. Example: a `subtitle` slot on Card.

1. `Card.jsx`: add the name to the destructured props:
   `{ as: Tag = 'article', ..., title, subtitle, footer, ... }`
2. `Card.jsx`: render it where you want it, guarded so it's optional:
   `{subtitle && <p className="ui-card__subtitle">{subtitle}</p>}`
3. `ui.css`: style the new class (skip this if you don't need any styling):
   `.ui-card__subtitle { margin: 0; color: var(--ui-muted); }`

Use it: `<Card title="Hello" subtitle="A line under the title" />`

For Tabs, per-tab slots work the same way: add the field to the objects in your
`tabs` array (`{ id, label, content, subtitle }`) and render `{t.subtitle}` inside the
`<button>` in `Tabs.jsx`. For Toast, add the field to your `toast({ ... })` call and
render `{t.yourField}` inside the toast markup in `Toast.jsx`.

## Removing a slot from a component permanently

1. Delete its name from the destructured props.
2. Delete the JSX line that renders it.
3. Delete its rules from `ui.css`.

Anywhere you still pass that prop, React will just ignore it (or hand it to the
underlying element via `...rest`, which is harmless for JSX values but worth removing).

## Notes per component

- **Navbar**: three-column grid, so `center` stays centred even when left and right differ in width.
- **Button**: `variant` solid | accent | outline | ghost; `size` sm | md | lg; add `href` to render a link.
- **Badge**: `variant` neutral | accent | outline | success | warning | danger; `dot` adds a status dot.
- **Input**: any other prop (`value`, `onChange`, `type`, `placeholder`) goes straight to the input. `multiline` makes it a textarea.
- **Modal**: you control `open` and pass `onClose`. Esc, the backdrop and the × all call it. Focus is trapped inside and returned afterwards.
- **Tabs**: uncontrolled by default. Pass `value` + `onChange` to control it. Arrow keys, Home and End work.
- **Toast**: wrap the app in `<ToastProvider>` once, then `const { toast } = useToast()` anywhere below it.
  `toast('Saved')` or `toast({ title, description, variant: 'success' | 'error', icon, action, duration })`.
