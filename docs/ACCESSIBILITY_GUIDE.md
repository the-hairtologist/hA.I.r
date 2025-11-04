# Accessibility Guide

## Overview

This guide covers accessibility (a11y) implementation across the hA.I.r app, ensuring WCAG 2.2 AA compliance and support for assistive technologies.

## Core Principles

### 1. **Perceivable**
- Provide text alternatives for non-text content
- Create content that can be presented in different ways
- Make it easier to see and hear content

### 2. **Operable**
- Make all functionality keyboard accessible
- Give users enough time to read and use content
- Don't design content that causes seizures
- Help users navigate and find content

### 3. **Understandable**
- Make text readable and understandable
- Make content appear and operate in predictable ways
- Help users avoid and correct mistakes

### 4. **Robust**
- Maximize compatibility with assistive technologies

---

## Keyboard Navigation

### Global Keyboard Shortcuts

The app uses `useKeyboardShortcuts` hook for global shortcuts:

```tsx
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

useKeyboardShortcuts([
  {
    key: 'n',
    ctrlKey: true,
    description: 'Create new item',
    action: () => setDialogOpen(true),
  },
  {
    key: '/',
    description: 'Focus search',
    action: () => searchRef.current?.focus(),
  },
]);
```

### Component-Level Navigation

Use `useKeyboardNavigation` for lists, menus, and complex UI:

```tsx
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';

const { currentIndex, handleKeyDown } = useKeyboardNavigation(items.length, {
  arrows: true,
  homeEnd: true,
  typeAhead: true,
  wrap: true,
  orientation: 'vertical',
  onActivate: (index) => selectItem(items[index]),
  onFocusChange: (index) => setFocusedIndex(index),
});
```

**Supported Keys:**
- `Arrow Up/Down` - Navigate items vertically
- `Arrow Left/Right` - Navigate items horizontally
- `Home` - Jump to first item
- `End` - Jump to last item
- `Enter/Space` - Activate current item
- `Type-ahead` - Type letters to jump to items

### Focus Management

**Focus Trap** for modals and dialogs:

```tsx
import { FocusTrap } from '@/components/accessibility/FocusTrap';

<FocusTrap
  active={dialogOpen}
  onEscape={() => setDialogOpen(false)}
  restoreFocus={true}
>
  <Dialog>
    {/* Modal content */}
  </Dialog>
</FocusTrap>
```

**Focus Utilities:**

```tsx
import {
  saveFocus,
  focusFirstElement,
  moveFocus,
  FocusTrap,
} from '@/lib/accessibility/focusManagement';

// Save and restore focus
const restoreFocus = saveFocus();
// ... do something
restoreFocus(); // Returns focus to original element

// Focus first focusable element
focusFirstElement(containerRef.current);

// Move focus programmatically
moveFocus('next'); // or 'previous'
```

---

## ARIA Labels and Descriptions

### Form Fields

Use `getFormFieldLabel` utility:

```tsx
import { getFormFieldLabel } from '@/lib/accessibility/ariaLabels';

const { ariaLabel, ariaDescribedBy, ariaInvalid } = getFormFieldLabel(
  'Email address',
  true, // required
  errors.email,
  'We will never share your email'
);

<input
  aria-label={ariaLabel}
  aria-describedby={ariaDescribedBy}
  aria-invalid={ariaInvalid}
  aria-required={true}
/>
```

### Status Messages

```tsx
import { getStatusLabel } from '@/lib/accessibility/ariaLabels';

<Badge aria-label={getStatusLabel(appointment.status, 'appointment')}>
  {appointment.status}
</Badge>
```

### Interactive Elements

**Buttons:**
```tsx
<button
  aria-label="Delete client John Doe"
  aria-describedby="delete-warning"
>
  <TrashIcon aria-hidden="true" />
</button>
<span id="delete-warning" className="sr-only">
  This action cannot be undone
</span>
```

**Icons:**
```tsx
import { AccessibleIcon } from '@/components/accessibility/AccessibleIcon';

// Decorative icon (no label)
<AccessibleIcon icon={CheckIcon} label="" decorative />

// Meaningful icon (with label)
<AccessibleIcon icon={AlertIcon} label="Warning" />
```

### Dynamic Content

**Progress:**
```tsx
import { getProgressLabel } from '@/lib/accessibility/ariaLabels';

const progress = getProgressLabel(currentStep, totalSteps, 'onboarding');

<div
  role="progressbar"
  aria-label={progress.ariaLabel}
  aria-valuenow={progress.ariaValueNow}
  aria-valuemin={progress.ariaValueMin}
  aria-valuemax={progress.ariaValueMax}
  aria-valuetext={progress.ariaValueText}
/>
```

**Notifications:**
```tsx
import { getNotificationLabel } from '@/lib/accessibility/ariaLabels';

const notif = getNotificationLabel(message, 'success');

<div
  role={notif.role}
  aria-live={notif.ariaLive}
  aria-atomic={notif.ariaAtomic}
  aria-label={notif.ariaLabel}
>
  {message}
</div>
```

---

## Screen Reader Support

### Screen Reader Only Content

```tsx
import { ScreenReaderOnly } from '@/components/accessibility/ScreenReaderOnly';

<ScreenReaderOnly>
  This content is only announced to screen readers
</ScreenReaderOnly>
```

### Live Regions

For dynamic content updates:

```tsx
import { LiveRegion } from '@/components/accessibility/ScreenReaderOnly';

<LiveRegion politeness="polite" atomic={true}>
  {loadingMessage}
</LiveRegion>
```

**Politeness levels:**
- `polite` - Announce when user is idle (default)
- `assertive` - Interrupt user immediately (errors, alerts)
- `off` - Don't announce

### Announcements

```tsx
import { useAnnouncement } from '@/hooks/useAnnouncement';

const { announce } = useAnnouncement();

// Announce to screen readers
announce('Form submitted successfully', { politeness: 'polite' });

// Error announcement (interrupts)
announce('Error: Invalid email address', { politeness: 'assertive' });
```

### Skip Links

Provide skip navigation for keyboard users:

```tsx
import { SkipLink } from '@/components/accessibility/ScreenReaderOnly';

<SkipLink href="#main-content">
  Skip to main content
</SkipLink>

// Add id to main content
<main id="main-content" tabIndex={-1}>
  {/* Content */}
</main>
```

---

## Color and Contrast

### Minimum Requirements (WCAG AA)
- **Normal text**: 4.5:1 contrast ratio
- **Large text** (18pt+ or 14pt+ bold): 3:1 contrast ratio
- **UI components** (buttons, form inputs): 3:1 contrast ratio

### Implementation

**Use Semantic Tokens:**
```tsx
// ❌ BAD: Direct colors with poor contrast
className="text-gray-300 bg-gray-100"

// ✅ GOOD: Semantic tokens with proper contrast
className="text-foreground bg-background"
className="text-muted-foreground bg-muted"
```

**Check Contrast:**
- Use browser DevTools Accessibility panel
- Use online tools: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Design system tokens in `index.css` already meet WCAG AA

---

## Touch Targets

### Mobile-First Touch Target Sizes

**Minimum**: 44x44px (WCAG 2.2 AA Level 2.5.8)

```tsx
import { touchButton } from '@/lib/responsive/mobile-first-utils';

// Automatically applies proper touch target size
<button className={touchButton}>
  Click me
</button>
```

### Spacing

Ensure adequate spacing between interactive elements:

```tsx
// ✅ GOOD: Proper spacing
<div className="flex gap-3">
  <button className={touchButton}>Action 1</button>
  <button className={touchButton}>Action 2</button>
</div>

// ❌ BAD: Buttons too close together
<div className="flex gap-1">
  <button className="p-1">Action 1</button>
  <button className="p-1">Action 2</button>
</div>
```

---

## Forms

### Required Fields

```tsx
<label htmlFor="email">
  Email address
  <span aria-hidden="true"> *</span>
  <ScreenReaderOnly>(required)</ScreenReaderOnly>
</label>
<input
  id="email"
  type="email"
  required
  aria-required="true"
/>
```

### Error Messages

```tsx
<label htmlFor="password">Password</label>
<input
  id="password"
  type="password"
  aria-invalid={!!error}
  aria-describedby={error ? 'password-error' : undefined}
/>
{error && (
  <span id="password-error" role="alert" className="text-destructive">
    {error}
  </span>
)}
```

### Form Validation

Use `StandardFormField` component:

```tsx
import { StandardFormField } from '@/components/forms/StandardFormField';

<StandardFormField
  name="email"
  label="Email"
  type="email"
  value={email}
  onChange={setEmail}
  error={errors.email}
  required
  hint="We'll never share your email"
/>
```

---

## Tables

### Accessible Data Tables

```tsx
<table role="table" aria-label="Client appointments">
  <thead>
    <tr>
      <th scope="col" aria-sort={sortColumn === 'name' ? sortDirection : 'none'}>
        <button
          onClick={() => handleSort('name')}
          aria-label={getSortLabel('Name', sortColumn === 'name' ? sortDirection : null).ariaLabel}
        >
          Name
        </button>
      </th>
      <th scope="col">Date</th>
      <th scope="col">Status</th>
    </tr>
  </thead>
  <tbody>
    {data.map((row) => (
      <tr key={row.id}>
        <th scope="row">{row.name}</th>
        <td>{row.date}</td>
        <td>
          <Badge aria-label={getStatusLabel(row.status)}>
            {row.status}
          </Badge>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

---

## Modals and Dialogs

### Accessible Modal Pattern

```tsx
import { FocusTrap } from '@/components/accessibility/FocusTrap';
import { getDialogLabel } from '@/lib/accessibility/ariaLabels';

const dialogAttrs = getDialogLabel('Delete Confirmation', 'alert');

<FocusTrap active={isOpen} onEscape={handleClose}>
  <div
    role={dialogAttrs.role}
    aria-modal={dialogAttrs.ariaModal}
    aria-labelledby="dialog-title"
    aria-describedby="dialog-description"
  >
    <h2 id="dialog-title">Delete Confirmation</h2>
    <p id="dialog-description">
      Are you sure you want to delete this item?
    </p>
    <button onClick={handleConfirm}>Confirm</button>
    <button onClick={handleClose}>Cancel</button>
  </div>
</FocusTrap>
```

### Dialog Checklist
- [ ] Focus trapped within dialog
- [ ] Escape key closes dialog
- [ ] Focus returns to trigger element on close
- [ ] Background content is inert (aria-hidden)
- [ ] Descriptive title and description
- [ ] Clear close button

---

## Loading States

### Accessible Loading Indicators

```tsx
import { getLoadingLabel } from '@/lib/accessibility/ariaLabels';

<div
  role="status"
  aria-live="polite"
  aria-label={getLoadingLabel('client data')}
>
  <Loader2 className="animate-spin" aria-hidden="true" />
  <ScreenReaderOnly>Loading client data</ScreenReaderOnly>
</div>
```

---

## Testing

### Manual Testing Checklist

**Keyboard Navigation:**
- [ ] All interactive elements reachable by Tab
- [ ] Logical tab order (left to right, top to bottom)
- [ ] Focus visible on all elements
- [ ] No keyboard traps
- [ ] Shortcuts don't conflict with browser/OS

**Screen Reader:**
- [ ] All images have alt text
- [ ] Form labels properly associated
- [ ] Error messages announced
- [ ] Dynamic content changes announced
- [ ] Page structure clear (headings, landmarks)

**Visual:**
- [ ] Sufficient color contrast (4.5:1 minimum)
- [ ] UI still usable at 200% zoom
- [ ] No information conveyed by color alone
- [ ] Touch targets ≥44px

**Mobile:**
- [ ] All features accessible on touch devices
- [ ] Proper touch target sizes
- [ ] No hover-only interactions
- [ ] Orientation changes handled

### Automated Testing

Use browser DevTools:
1. **Chrome DevTools** → Lighthouse → Accessibility audit
2. **Firefox DevTools** → Accessibility panel
3. **axe DevTools** extension

### Screen Reader Testing

**Tools:**
- **macOS**: VoiceOver (Cmd + F5)
- **Windows**: NVDA (free), JAWS (paid)
- **iOS**: VoiceOver (Settings → Accessibility)
- **Android**: TalkBack (Settings → Accessibility)

**Common Commands:**

| Action | VoiceOver (Mac) | NVDA (Windows) |
|--------|----------------|----------------|
| Start/Stop | Cmd+F5 | Ctrl+Alt+N |
| Next item | VO+Right | Down Arrow |
| Previous item | VO+Left | Up Arrow |
| Activate | VO+Space | Enter/Space |
| Read all | VO+A | Insert+Down |

---

## Common Patterns

### Card with Actions

```tsx
<article
  aria-labelledby={`client-${client.id}-name`}
  className="card"
>
  <h3 id={`client-${client.id}-name`}>{client.name}</h3>
  <p>{client.email}</p>
  <div role="group" aria-label="Client actions">
    <button aria-label={`Edit ${client.name}`}>
      <EditIcon aria-hidden="true" />
    </button>
    <button aria-label={`Delete ${client.name}`}>
      <TrashIcon aria-hidden="true" />
    </button>
  </div>
</article>
```

### Expandable Section (Accordion)

```tsx
<div>
  <button
    id="section-header"
    aria-expanded={isOpen}
    aria-controls="section-content"
    onClick={() => setIsOpen(!isOpen)}
  >
    Section Title
    <ChevronIcon aria-hidden="true" />
  </button>
  <div
    id="section-content"
    role="region"
    aria-labelledby="section-header"
    hidden={!isOpen}
  >
    {content}
  </div>
</div>
```

### Search with Live Results

```tsx
const { announce } = useAnnouncement();

const handleSearch = (query: string) => {
  const results = performSearch(query);
  announce(`${results.length} results found for ${query}`);
  setResults(results);
};

<LiveRegion>
  {results.length > 0 && `${results.length} search results`}
</LiveRegion>
```

---

## Resources

### WCAG Guidelines
- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [WebAIM WCAG 2 Checklist](https://webaim.org/standards/wcag/checklist)

### Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Testing
- [Screen Reader Testing Guide](https://webaim.org/articles/screenreader_testing/)
- [Keyboard Testing Guide](https://webaim.org/articles/keyboard/)

### Patterns
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Inclusive Components](https://inclusive-components.design/)

---

**Last Updated:** 2025-01-01  
**Maintained By:** Development Team  
**WCAG Level:** AA (2.2)
