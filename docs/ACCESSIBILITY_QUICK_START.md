# Accessibility Quick Start Guide

## 🚀 Quick Reference

### Keyboard Shortcuts (Already Working!)

Press these key combinations anywhere in the app:

| Shortcut | Action |
|----------|--------|
| `?` | Show all shortcuts |
| `G` + `D` | Go to Dashboard |
| `G` + `C` | Go to Clients |
| `G` + `A` | Go to Appointments |
| `G` + `M` | Go to Messages |
| `G` + `P` | Go to Portfolio |
| `G` + `F` | Go to Finance |
| `Cmd/Ctrl` + `K` | Search |
| `Tab` | Navigate forward |
| `Shift` + `Tab` | Navigate backward |
| `Esc` | Close dialogs |

## 🛠️ For Developers

### Using Accessible Components

#### 1. Accessible Button with Loading State
```tsx
import { AccessibleButton } from '@/components/accessibility/AccessibleButton';

<AccessibleButton
  ariaLabel="Save changes"
  loading={isSaving}
  loadingText="Saving..."
  onClick={handleSave}
>
  Save
</AccessibleButton>
```

#### 2. Accessible Icon
```tsx
import { AccessibleIcon } from '@/components/accessibility/AccessibleIcon';
import { Search } from 'lucide-react';

<AccessibleIcon icon={Search} label="Search" />
```

#### 3. Screen Reader Only Text
```tsx
import { ScreenReaderOnly } from '@/components/accessibility/ScreenReaderOnly';

<button>
  <TrashIcon />
  <ScreenReaderOnly>Delete item</ScreenReaderOnly>
</button>
```

#### 4. Announce to Screen Readers
```tsx
import { useAccessibility } from '@/components/accessibility/AccessibilityProvider';

function MyComponent() {
  const { announceToScreenReader } = useAccessibility();
  
  const handleSave = () => {
    // Save logic...
    announceToScreenReader('Changes saved successfully', 'polite');
  };
}
```

#### 5. Focus Trap in Modals
```tsx
import { FocusTrap } from '@/components/accessibility/FocusTrap';

<FocusTrap onEscape={handleClose}>
  <div>
    <h2>Modal Content</h2>
    <button onClick={handleClose}>Close</button>
  </div>
</FocusTrap>
```

### Accessibility Checklist for New Components

- [ ] All interactive elements have min 44x44px tap target
- [ ] Buttons have descriptive `aria-label` or visible text
- [ ] Icons have `aria-hidden="true"` or accessible labels
- [ ] Form inputs have associated labels
- [ ] Error messages use `aria-invalid` and `aria-describedby`
- [ ] Dialogs have proper ARIA labeling (`aria-labelledby`, `aria-describedby`)
- [ ] Focus rings are visible (4px ring on focus-visible)
- [ ] Color contrast meets AA standards (4.5:1 for normal text)
- [ ] Keyboard navigation works (Tab, Enter, Space, Arrow keys)
- [ ] Screen reader announcements for dynamic content

### Common Patterns

#### Form with Validation
```tsx
<Input
  id="email"
  type="email"
  aria-label="Email address"
  aria-required="true"
  aria-invalid={!!error}
  aria-describedby={error ? "email-error" : undefined}
  error={error}
/>
{error && (
  <span id="email-error" className="text-destructive text-sm">
    {error}
  </span>
)}
```

#### Icon Button
```tsx
<Button
  size="icon"
  variant="ghost"
  aria-label="Open settings"
  onClick={openSettings}
>
  <Settings className="h-4 w-4" aria-hidden="true" />
</Button>
```

#### Tab Navigation with ARIA
```tsx
<Tabs defaultValue="overview">
  <TabsList role="tablist" aria-label="Account sections">
    <TabsTrigger value="overview" role="tab">
      Overview
    </TabsTrigger>
    <TabsTrigger value="settings" role="tab">
      Settings
    </TabsTrigger>
  </TabsList>
  <TabsContent value="overview" role="tabpanel">
    Content
  </TabsContent>
</Tabs>
```

## 🧪 Testing Accessibility

### Manual Testing Steps

1. **Keyboard Navigation**
   - Tab through all interactive elements
   - Verify focus is always visible
   - Test keyboard shortcuts
   - Ensure Tab wraps in modals

2. **Screen Reader (NVDA/VoiceOver)**
   - Navigate with Tab
   - Listen to button/link announcements
   - Check form label associations
   - Verify dynamic content announcements

3. **High Contrast Mode**
   - Enable system high contrast
   - Verify all text is visible
   - Check focus indicators

### Automated Testing
```bash
# Run accessibility tests
npm run test:e2e -- accessibility.spec.ts

# Run tap target tests
npm run test:e2e -- tap-targets.spec.ts
```

## 📖 Full Documentation

- `docs/ACCESSIBILITY_GUIDE.md` - Complete implementation guide
- `docs/ACCESSIBILITY_IMPLEMENTATION.md` - Technical details
- `docs/PHASE_7_SUMMARY.md` - Phase 7 summary

## ⚡ Quick Fixes

### Missing Focus Ring?
Add to your component:
```tsx
className="focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-2"
```

### Button Too Small?
Ensure minimum size:
```tsx
className="min-h-[44px] min-w-[44px]"
```

### Icon Not Accessible?
Make it decorative or add label:
```tsx
<Icon className="h-4 w-4" aria-hidden="true" />
// OR
<AccessibleIcon icon={Icon} label="Descriptive text" />
```

## 🎯 Goals Achieved

✅ WCAG 2.2 Level AA compliant  
✅ Full keyboard navigation  
✅ Screen reader support  
✅ 44x44px tap targets  
✅ Visible focus indicators  
✅ Skip links  
✅ Error identification  
✅ Consistent navigation

---

**Need Help?** See full documentation in `docs/ACCESSIBILITY_GUIDE.md`
