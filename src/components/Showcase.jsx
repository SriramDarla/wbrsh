import { useState } from 'react';
import { Badge, Button, Card, Input, Modal, Navbar, Tabs, useToast } from './index.js';
import './Showcase.css';

const Plus = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true">
    <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" fill="none" />
  </svg>
);

/** Every component with its slots filled in. Open it at  http://localhost:5173/#components */
export default function Showcase() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const { toast } = useToast();
  const invalid = email !== '' && !email.includes('@');

  return (
    <div className="showcase">
      <Navbar
        left={<strong>Boc Studio</strong>}
        center={
          <>
            <a href="#components">Work</a>
            <a href="#components">About</a>
            <a href="#components">Lab</a>
          </>
        }
        right={
          <Button size="sm" variant="outline">
            Contact
          </Button>
        }
      />

      <main className="showcase__main">
        <h1>Components</h1>

        <section>
          <h2>Button</h2>
          <div className="row">
            <Button>Solid</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button size="sm" icon={<Plus />}>Icon slot</Button>
            <Button size="sm" variant="outline" iconEnd={<Plus />}>Icon end slot</Button>
            <Button href="#components" variant="outline">As a link</Button>
            <Button disabled>Disabled</Button>
          </div>
        </section>

        <section>
          <h2>Badge</h2>
          <div className="row">
            <Badge>Neutral</Badge>
            <Badge variant="accent">Accent</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="success" dot>Live</Badge>
            <Badge variant="warning" dot>Pending</Badge>
            <Badge variant="danger" icon={<Plus />}>Icon slot</Badge>
          </div>
        </section>

        <section>
          <h2>Card</h2>
          <div className="grid">
            <Card
              media={<div style={{ background: 'linear-gradient(135deg, #C7B8F5, #2532F5)' }} />}
              meta={<Badge variant="accent">Branding</Badge>}
              title="Media, meta, title, body and footer"
              footer={
                <>
                  <span>2026</span>
                  <Button size="sm" variant="outline">View</Button>
                </>
              }
            >
              <p>Anything you put between the tags is the body slot.</p>
            </Card>
            <Card title="Only a title and a body">
              <p>Slots you leave out simply aren't rendered.</p>
            </Card>
          </div>
        </section>

        <section>
          <h2>Input</h2>
          <div className="grid">
            <Input
              label="Email"
              type="email"
              placeholder="you@studio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              hint="We'll only use it to reply."
              error={invalid ? 'That doesn’t look like an email.' : undefined}
            />
            <Input label="Website" prefix="https://" suffix=".com" placeholder="yourstudio" />
            <Input label="Message" multiline placeholder="Tell us about the project" />
          </div>
        </section>

        <section>
          <h2>Tabs</h2>
          <Tabs
            tabs={[
              { id: 'overview', label: 'Overview', content: <p>The first panel.</p> },
              {
                id: 'activity',
                label: 'Activity',
                badge: <Badge variant="accent">3</Badge>,
                content: <p>The tab above has a badge slot.</p>,
              },
              { id: 'settings', label: 'Settings', icon: <Plus />, content: <p>This one has an icon slot.</p> },
            ]}
            end={<Button size="sm" variant="ghost">End slot</Button>}
          />
        </section>

        <section>
          <h2>Modal and Toast</h2>
          <div className="row">
            <Button onClick={() => setOpen(true)}>Open modal</Button>
            <Button variant="outline" onClick={() => toast('Just a title')}>Toast</Button>
            <Button
              variant="outline"
              onClick={() => toast({ title: 'Saved', description: 'Your changes are live.', variant: 'success' })}
            >
              Success toast
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                toast({
                  title: 'Something went wrong',
                  description: 'This one has an action slot.',
                  variant: 'error',
                  action: <Button size="sm" variant="ghost">Retry</Button>,
                })
              }
            >
              Error toast with action
            </Button>
          </div>
        </section>
      </main>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Modal title slot"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                setOpen(false);
                toast({ title: 'Confirmed', variant: 'success' });
              }}
            >
              Confirm
            </Button>
          </>
        }
      >
        <p>This is the body slot. Press Esc, click outside, or use the buttons in the footer slot.</p>
        <Input label="Focus moves in here first" placeholder="Type something" />
      </Modal>
    </div>
  );
}
