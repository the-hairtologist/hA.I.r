# Component Catalog
## Hair AI Design System - Token Usage Guide

**Version:** 3.0.0  
**Last Updated:** 2025-10-04

---

## Table of Contents
1. [Introduction](#introduction)
2. [Token System Overview](#token-system-overview)
3. [Component Library](#component-library)
4. [Usage Examples](#usage-examples)
5. [Best Practices](#best-practices)

---

## Introduction

This catalog documents all UI components in the Hair AI application, demonstrating proper usage of design tokens. Every example uses semantic tokens only—no raw color values, off-scale spacing, or inline styles.

### Design Principles
- **Semantic over literal** - Use `bg-primary` not `bg-[#3B82F6]`
- **Scale adherence** - Use spacing scale (4, 8, 12, 16, 24, 32px)
- **State completeness** - Define hover, active, focus, disabled states
- **Accessibility first** - Minimum 44×44px tap targets, AA contrast
- **Theme agnostic** - Components adapt to all 4 theme modes

---

## Token System Overview

### Color Tokens
```tsx
// Semantic Colors
bg-primary              // Main brand color
bg-secondary            // Supporting brand color
bg-accent              // Highlight/CTA color
bg-success             // Positive feedback
bg-warning             // Caution/alert
bg-danger              // Errors/destructive
bg-info                // Informational

// Context Colors
bg-background          // Page background
bg-surface             // Card/panel background
bg-muted               // Subtle backgrounds
border-border          // Border color
text-foreground        // Main text color
text-muted-foreground  // Secondary text
```

### Spacing Tokens (4px base)
```tsx
// Padding/Margin Scale
p-1  // 4px
p-2  // 8px
p-3  // 12px
p-4  // 16px
p-6  // 24px
p-8  // 40px

// Gaps
gap-2  // 8px
gap-4  // 16px
gap-6  // 24px
```

### Typography Tokens
```tsx
// Font Families
font-sans      // DM Sans (body text)
font-display   // Space Grotesk (headings)

// Font Sizes
text-xs   // 12px
text-sm   // 14px
text-md   // 16px (default)
text-lg   // 18px
text-h3   // 40px
text-h1   // 60px

// Weights
font-regular   // 400
font-medium    // 500
font-semibold  // 600
font-bold      // 700
```

---

## Component Library

### 1. Buttons

#### Primary Button
```tsx
<Button 
  variant="default"
  size="default"
  className="min-h-[44px]"
>
  Primary Action
</Button>
```

**Token Breakdown:**
- Background: `bg-primary`
- Text: `text-primary-foreground`
- Border: `border-2 border-foreground`
- Shadow: `shadow-[3px_3px_0px_0px_hsl(var(--foreground))]`
- Focus: `focus-visible:ring-primary`

**States:**
- Hover: Translate + shadow reduction
- Active: Full translation + no shadow
- Disabled: `opacity-50 pointer-events-none`
- Focus: 4px primary ring with 2px offset

#### Secondary Button
```tsx
<Button 
  variant="outline"
  size="default"
>
  Secondary Action
</Button>
```

**Token Breakdown:**
- Background: `bg-background`
- Text: `text-foreground`
- Border: `border-2 border-foreground`
- Hover: `bg-accent text-accent-foreground`

#### Ghost Button
```tsx
<Button 
  variant="ghost"
  size="sm"
>
  Tertiary Action
</Button>
```

**Token Breakdown:**
- Background: Transparent
- Text: `text-foreground`
- Hover: `bg-accent text-accent-foreground`

#### Destructive Button
```tsx
<Button 
  variant="destructive"
  size="default"
>
  Delete Item
</Button>
```

**Token Breakdown:**
- Background: `bg-destructive`
- Text: `text-destructive-foreground`
- Border: `border-2 border-foreground`

#### Icon Button
```tsx
<Button 
  variant="ghost"
  size="icon"
  className="min-h-[44px] min-w-[44px]"
>
  <Icon className="h-5 w-5" />
</Button>
```

**Accessibility:**
- Minimum 44×44px tap target
- Aria-label required for screen readers

---

### 2. Input Fields

#### Text Input
```tsx
<Input 
  type="text"
  placeholder="Enter text..."
  className="min-h-[44px] border-2 border-foreground"
/>
```

**Token Breakdown:**
- Background: `bg-background`
- Text: `text-foreground`
- Border: `border-2 border-foreground`
- Placeholder: `placeholder:text-muted-foreground`
- Focus: `focus-visible:ring-2 focus-visible:ring-primary`

**States:**
- Default: 2px border
- Focus: 2px ring with primary color
- Error: `border-destructive focus-visible:ring-destructive`
- Disabled: `opacity-50 cursor-not-allowed`

#### Textarea
```tsx
<Textarea 
  placeholder="Enter longer text..."
  className="min-h-[80px] border-2 border-foreground"
/>
```

**Token Breakdown:**
- Same as text input
- Min height: 80px (5 lines)

#### Select Dropdown
```tsx
<Select>
  <SelectTrigger className="min-h-[44px] border-2 border-foreground">
    <SelectValue placeholder="Choose option" />
  </SelectTrigger>
  <SelectContent className="bg-popover border-2 border-border">
    <SelectItem value="1">Option 1</SelectItem>
    <SelectItem value="2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

**Token Breakdown:**
- Trigger: Same as input
- Dropdown: `bg-popover` with `elevation-2`
- Item hover: `bg-accent text-accent-foreground`

---

### 3. Cards

#### Basic Card
```tsx
<Card className="border-2 border-border bg-card">
  <CardHeader>
    <CardTitle className="text-h4 font-display font-bold">
      Card Title
    </CardTitle>
    <CardDescription className="text-muted-foreground">
      Card description text
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    Content goes here
  </CardContent>
  <CardFooter className="gap-4">
    <Button variant="default">Action</Button>
  </CardFooter>
</Card>
```

**Token Breakdown:**
- Background: `bg-card`
- Border: `border-2 border-border`
- Shadow: `shadow-[4px_4px_0px_0px_hsl(var(--foreground)_/_0.1)]`
- Hover: Enhanced shadow and translate

#### Interactive Card
```tsx
<Card className="cursor-pointer transition-all hover:-translate-y-1">
  {/* Same structure as basic card */}
</Card>
```

**States:**
- Hover: Lift effect + shadow enhancement
- Active: Scale down slightly
- Focus: Primary ring on keyboard navigation

---

### 4. Navigation

#### Sidebar Navigation Item
```tsx
<SidebarMenuItem>
  <SidebarMenuButton 
    asChild
    className="h-11 gap-3 px-4 hover:bg-accent"
  >
    <NavLink to="/dashboard">
      <Icon className="h-5 w-5" />
      <span>Dashboard</span>
    </NavLink>
  </SidebarMenuButton>
</SidebarMenuItem>
```

**Token Breakdown:**
- Height: `h-11` (44px minimum)
- Gap: `gap-3` (12px)
- Padding: `px-4` (16px)
- Hover: `bg-accent text-accent-foreground`
- Active: Same as hover with font-medium

#### Mobile Nav Item
```tsx
<Button 
  variant="ghost"
  size="sm"
  className="min-h-[44px] gap-2"
>
  <Icon className="h-5 w-5" />
  <span className="text-sm">Label</span>
</Button>
```

**Accessibility:**
- Minimum 44×44px tap target
- Clear focus indicators
- High contrast icons

---

### 5. Modals & Dialogs

#### Dialog
```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent className="bg-background border-2 border-border">
    <DialogHeader>
      <DialogTitle className="text-h4 font-display">
        Dialog Title
      </DialogTitle>
      <DialogDescription className="text-muted-foreground">
        Description text
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4 py-4">
      {/* Content */}
    </div>
    <DialogFooter className="gap-4">
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Token Breakdown:**
- Overlay: `bg-background/80 backdrop-blur-sm`
- Content: `bg-background elevation-3`
- Close button: 44×44px minimum

---

### 6. Forms

#### Complete Form Example
```tsx
<form className="space-y-6">
  <div className="space-y-2">
    <Label htmlFor="name" className="text-sm font-semibold">
      Full Name
    </Label>
    <Input 
      id="name"
      type="text"
      placeholder="John Doe"
      className="min-h-[44px]"
    />
    <p className="text-xs text-muted-foreground">
      Enter your full legal name
    </p>
  </div>

  <div className="space-y-2">
    <Label htmlFor="email">Email Address</Label>
    <Input 
      id="email"
      type="email"
      placeholder="john@example.com"
      className="min-h-[44px]"
    />
  </div>

  <div className="flex gap-4">
    <Button type="button" variant="outline">
      Cancel
    </Button>
    <Button type="submit">
      Submit
    </Button>
  </div>
</form>
```

**Token Breakdown:**
- Vertical spacing: `space-y-6` (24px)
- Label: `text-sm font-semibold`
- Helper text: `text-xs text-muted-foreground`
- Button gap: `gap-4` (16px)

---

### 7. Data Tables

#### Table Component
```tsx
<Table>
  <TableHeader>
    <TableRow className="border-b-2 border-border">
      <TableHead className="font-semibold">Name</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="border-b border-border hover:bg-muted">
      <TableCell className="font-medium">John Doe</TableCell>
      <TableCell>
        <Badge variant="success">Active</Badge>
      </TableCell>
      <TableCell>
        <Button variant="ghost" size="sm">Edit</Button>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

**Token Breakdown:**
- Border: `border-2 border-border` (header), `border border-border` (rows)
- Hover: `bg-muted`
- Cell padding: `p-4` (16px)

---

### 8. Badges & Tags

#### Status Badges
```tsx
// Success
<Badge className="bg-success text-success-foreground">
  Active
</Badge>

// Warning
<Badge className="bg-warning text-warning-foreground">
  Pending
</Badge>

// Danger
<Badge className="bg-destructive text-destructive-foreground">
  Inactive
</Badge>

// Info
<Badge className="bg-info text-info-foreground">
  New
</Badge>
```

**Token Breakdown:**
- Padding: `px-3 py-1` (12px × 4px)
- Border radius: `rounded-lg` (12px)
- Font: `text-xs font-semibold`

---

### 9. Empty States

#### Empty State Component
```tsx
<div className="flex flex-col items-center justify-center py-12 space-y-4">
  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
    <Icon className="h-8 w-8 text-muted-foreground" />
  </div>
  <div className="text-center space-y-2">
    <h3 className="text-h5 font-display font-bold">
      No items found
    </h3>
    <p className="text-muted-foreground max-w-sm">
      Get started by creating your first item
    </p>
  </div>
  <Button size="lg">
    Create Item
  </Button>
</div>
```

**Token Breakdown:**
- Vertical spacing: `space-y-4` (16px)
- Icon container: `bg-muted` 64×64px circle
- Max text width: `max-w-sm` (384px)

---

### 10. Loading States

#### Skeleton Loader
```tsx
<div className="space-y-4">
  <Skeleton className="h-12 w-full" />
  <Skeleton className="h-24 w-full" />
  <Skeleton className="h-8 w-3/4" />
</div>
```

**Token Breakdown:**
- Background: `bg-muted`
- Animation: `animate-pulse`
- Border radius: `rounded-md` (8px)

#### Loading Spinner
```tsx
<div className="flex items-center justify-center p-8">
  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
</div>
```

---

## Usage Examples

### Example 1: Dashboard Card with Stats
```tsx
<Card>
  <CardHeader>
    <CardTitle className="text-h5 font-display">
      Total Users
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-h2 font-display font-bold text-primary">
      1,234
    </div>
    <p className="text-sm text-success flex items-center gap-2 mt-2">
      <TrendingUp className="h-4 w-4" />
      <span>+12% from last month</span>
    </p>
  </CardContent>
</Card>
```

### Example 2: Form with Validation
```tsx
<form className="space-y-6">
  <div className="space-y-2">
    <Label htmlFor="email">Email</Label>
    <Input 
      id="email"
      type="email"
      className={cn(
        "min-h-[44px]",
        error && "border-destructive focus-visible:ring-destructive"
      )}
    />
    {error && (
      <p className="text-xs text-destructive flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        {error.message}
      </p>
    )}
  </div>
</form>
```

### Example 3: Mobile Navigation
```tsx
<nav className="fixed bottom-0 left-0 right-0 bg-background border-t-2 border-border">
  <div className="flex items-center justify-around p-2">
    <Button 
      variant="ghost" 
      size="sm"
      className="flex-col min-h-[48px] gap-1"
    >
      <Home className="h-5 w-5" />
      <span className="text-xs">Home</span>
    </Button>
    {/* More nav items */}
  </div>
</nav>
```

---

## Best Practices

### ✅ DO

1. **Use semantic tokens everywhere**
   ```tsx
   <div className="bg-primary text-primary-foreground" />
   ```

2. **Respect spacing scale**
   ```tsx
   <div className="p-6 gap-4" /> // 24px padding, 16px gap
   ```

3. **Define all interactive states**
   ```tsx
   <Button className="hover:bg-primary-dark active:scale-95 disabled:opacity-50" />
   ```

4. **Ensure minimum tap targets (44×44px)**
   ```tsx
   <Button className="min-h-[44px] min-w-[44px]" />
   ```

5. **Use proper heading hierarchy**
   ```tsx
   <h1 className="text-h1 font-display font-bold">
   <h2 className="text-h2 font-display font-bold">
   ```

6. **Add focus indicators**
   ```tsx
   <Button className="focus-visible:ring-4 focus-visible:ring-primary" />
   ```

### ❌ DON'T

1. **Use raw color values**
   ```tsx
   // ❌ WRONG
   <div className="bg-[#3B82F6]" />
   <span style={{ color: '#fff' }} />
   
   // ✅ CORRECT
   <div className="bg-primary text-primary-foreground" />
   ```

2. **Use off-scale spacing**
   ```tsx
   // ❌ WRONG
   <div className="p-[15px] gap-[13px]" />
   
   // ✅ CORRECT
   <div className="p-4 gap-3" /> // 16px, 12px
   ```

3. **Forget accessibility**
   ```tsx
   // ❌ WRONG - Icon button without label
   <button><Icon /></button>
   
   // ✅ CORRECT
   <button aria-label="Close"><Icon /></button>
   ```

4. **Rely on color alone**
   ```tsx
   // ❌ WRONG
   <span className="text-success">Success</span>
   
   // ✅ CORRECT
   <span className="text-success flex items-center gap-2">
     <CheckCircle className="h-4 w-4" />
     Success
   </span>
   ```

5. **Ignore theme modes**
   ```tsx
   // ❌ WRONG - Hardcoded for light mode
   <div className="bg-white text-black" />
   
   // ✅ CORRECT - Adapts to all themes
   <div className="bg-background text-foreground" />
   ```

---

## Migration Guide

### Converting Existing Components

**Step 1: Identify raw values**
```bash
# Search for raw colors
grep -r "bg-\[#" src/
grep -r "text-white\|text-black" src/

# Search for inline styles
grep -r "style={{" src/
```

**Step 2: Replace with tokens**
```tsx
// Before
<div className="bg-[#3B82F6] text-white p-[20px]" />

// After
<div className="bg-primary text-primary-foreground p-5" />
```

**Step 3: Add missing states**
```tsx
// Before
<Button className="bg-primary" />

// After
<Button 
  className="bg-primary hover:bg-primary/90 active:scale-95 disabled:opacity-50"
/>
```

**Step 4: Validate accessibility**
- Check contrast ratios
- Test keyboard navigation
- Verify tap target sizes
- Test with screen readers

---

## Quick Reference

### Common Patterns

**Primary CTA:**
```tsx
<Button variant="default" size="lg" className="w-full sm:w-auto">
  Get Started
</Button>
```

**Form Group:**
```tsx
<div className="space-y-2">
  <Label>Label</Label>
  <Input className="min-h-[44px]" />
  <p className="text-xs text-muted-foreground">Helper text</p>
</div>
```

**Card Grid:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>
```

**Modal Actions:**
```tsx
<DialogFooter className="gap-4 flex-col sm:flex-row">
  <Button variant="outline" className="w-full sm:w-auto">Cancel</Button>
  <Button className="w-full sm:w-auto">Confirm</Button>
</DialogFooter>
```

---

**Last Updated:** 2025-10-04  
**Maintained By:** Hair AI Design Team  
**Questions?** Refer to `VISUAL_PERFECTION_REPORT.md`
