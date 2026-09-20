# Loader to marquee (React + Vite)

    npm install
    npm run dev

Open the local URL Vite prints.

The intro effect lives in `src/LoaderMarquee.jsx` + `src/LoaderMarquee.css`.
The page it turns into lives in `src/StudioPage.jsx` + `src/StudioPage.css` (edit the placeholder
content at the top of `StudioPage.jsx`).
To use it in an existing project, copy the four files, add the Bricolage Grotesque
link from `index.html` (or swap the font in the CSS), and render `<LoaderMarquee page={<StudioPage />} />`.

Props (all optional): `headline`, `brand` (company name in the nav), `hint` (cursor label text),
`items` (array of marquee strings), `loadMs`, `speed`, `page` (element shown after the click, e.g.
`<StudioPage />`), `onInfo` (overrides "+ Info"; by default it scrolls to the `#info` section).

## UI components

Eight reusable components live in `src/components/` (Navbar, Button, Card, Badge, Input,
Modal, Tabs, Toast). See `src/components/README.md` for how to add or remove slots, and
open `http://localhost:5173/#components` (then refresh) to see them all.
