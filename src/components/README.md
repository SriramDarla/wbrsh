# Reusable UI Components

Eight reusable frontend components for **Your Life, In Receipts**:

```javascript
import { Navbar, Button, Card, Badge, Input, Modal, Tabs, ToastProvider, useToast } from './components';
```

Restyle tokens by editing the `--ui-*` variables at the top of `ui.css`.
On dark backgrounds, wrap containers in `<div className="ui-dark">`.

## Components Summary

| Component | Slots & Props | Purpose |
|---|---|---|
| **Navbar** | `left`, `center`, `right` | Sticky/fixed application navigation header |
| **Button** | `icon`, children, `iconEnd`, `variant`, `size`, `href` | Multi-variant buttons and links |
| **Card** | `media`, `meta`, `title`, children, `footer` | Structured content cards |
| **Badge** | `icon`, children, `variant`, `dot` | Status tags and score pills |
| **Input** | `label`, `prefix`, `suffix`, `hint`, `error`, `multiline` | Accessible form controls |
| **Modal** | `open`, `onClose`, `title`, children, `footer` | Accessible dialogs with focus trapping |
| **Tabs** | `tabs` (`id`, `label`, `badge`, `content`), `value`, `onChange` | Accessible tab switcher |
| **Toast** | `ToastProvider`, `useToast()` hook | Lightweight ephemeral notifications |
