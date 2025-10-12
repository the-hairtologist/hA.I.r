# Hair AI Design System

## Spacing Scale
Use these standardized spacing values across all components:

### Component Spacing
- **Card padding**: `p-4 sm:p-5 md:p-6` (16px → 20px → 24px)
- **Card gap between elements**: `space-y-4` (16px)
- **Section gap**: `space-y-6` (24px)
- **Grid gaps**: `gap-3 sm:gap-4` (12px → 16px)

### Text Spacing
- **Heading margin bottom**: `mb-2` (8px) for subtitles, `mb-4` (16px) for sections
- **Paragraph margin bottom**: `mb-3` (12px)
- **List item spacing**: `space-y-2` (8px) for compact, `space-y-3` (12px) for comfortable

### Icon + Text Gaps
- **Icon with text**: `gap-2` (8px)
- **Button icon**: `gap-1.5` (6px)
- **Flex items**: `gap-3` (12px)

## Typography Scale

### Responsive Text Sizing
```tsx
// Headings
- Hero: "text-2xl sm:text-3xl lg:text-4xl"
- H1: "text-xl sm:text-2xl lg:text-3xl"
- H2: "text-lg sm:text-xl lg:text-2xl"
- H3: "text-base sm:text-lg"

// Body
- Large body: "text-sm sm:text-base"
- Normal body: "text-xs sm:text-sm"
- Small text: "text-[11px] sm:text-xs"
- Tiny text: "text-[10px]"
```

### Font Weights
- **Headings**: `font-bold` or `font-black` for hero
- **Subheadings**: `font-semibold`
- **Body**: `font-medium` for emphasis, `font-normal` for regular
- **Muted**: `font-normal` or `font-light`

## Component Sizing

### Cards
```tsx
// Standard card
<Card className="p-4 sm:p-5 md:p-6">

// Compact card (dashboard widgets)
<Card className="p-3 sm:p-4">

// Large card (forms, modals)
<Card className="p-6 sm:p-8">
```

### Buttons
```tsx
// Size variants
- xs: "h-7 px-2 text-[11px]"
- sm: "h-8 px-3 text-xs"
- default: "h-9 px-4 text-sm"
- lg: "h-10 px-6 text-base"
```

### Icons
```tsx
// Icon sizes
- Tiny: "h-3 w-3"
- Small: "h-4 w-4"
- Default: "h-5 w-5"
- Large: "h-6 w-6"
- XL: "h-8 w-8"
```

### Containers
```tsx
// Max widths
- Narrow: "max-w-sm" (384px)
- Medium: "max-w-md" (448px)
- Standard: "max-w-lg" (512px)
- Wide: "max-w-2xl" (672px)
- Full dashboard: "max-w-7xl" (1280px)

// Heights
- Compact scroll: "max-h-[300px]"
- Medium scroll: "max-h-[400px]"
- Tall scroll: "max-h-[500px]"
```

## Mobile-First Breakpoints

### Screen Sizes
- **Mobile**: 0-640px (sm)
- **Tablet**: 641-1024px (md/lg)
- **Desktop**: 1025px+ (xl/2xl)

### Touch Targets (Mobile)
- **Minimum**: 44px x 44px (11 units / h-11 w-11)
- **Comfortable**: 48px x 48px (12 units / h-12 w-12)
- **Button height**: minimum `h-9` (36px) with padding

### Mobile Adjustments
```tsx
// Grid columns responsive
"grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"

// Padding responsive
"p-3 sm:p-4 lg:p-6"

// Text responsive
"text-xs sm:text-sm lg:text-base"

// Gap responsive
"gap-2 sm:gap-3 lg:gap-4"
```

## Layout Patterns

### Dashboard Grid
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
  {/* Cards */}
</div>
```

### Stats Grid
```tsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
  {/* Stat cards */}
</div>
```

### Form Layout
```tsx
<div className="space-y-4 sm:space-y-6">
  {/* Form fields */}
</div>
```

## Animation Standards

### Timing
- **Fast**: 150ms (hover states)
- **Normal**: 300ms (transitions)
- **Slow**: 500ms (page transitions)

### Easing
- **UI**: `ease-in-out`
- **Entrances**: `ease-out`
- **Exits**: `ease-in`

## Common Patterns

### Card with Icon Header
```tsx
<Card className="p-4 sm:p-5">
  <CardHeader className="p-0 mb-4">
    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
      <div className="p-2 rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      Title
    </CardTitle>
  </CardHeader>
  <CardContent className="p-0 space-y-3">
    {/* Content */}
  </CardContent>
</Card>
```

### Empty State
```tsx
<div className="p-6 sm:p-8 text-center">
  <div className="mb-3 sm:mb-4">
    <Icon className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground" />
  </div>
  <h3 className="text-base sm:text-lg font-semibold mb-2">Title</h3>
  <p className="text-xs sm:text-sm text-muted-foreground mb-4">Description</p>
  <Button size="sm">Action</Button>
</div>
```

### List Item
```tsx
<div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
  <Icon className="h-5 w-5 text-muted-foreground" />
  <div className="flex-1 min-w-0">
    <p className="text-sm font-medium truncate">Title</p>
    <p className="text-xs text-muted-foreground">Subtitle</p>
  </div>
  <Button size="sm" variant="ghost">Action</Button>
</div>
```

## Accessibility

### Color Contrast
- Minimum: 4.5:1 for normal text
- Large text: 3:1
- UI components: 3:1

### Focus States
- All interactive elements must have visible focus rings
- Use `focus-visible:ring-2 focus-visible:ring-primary`

### Touch Targets
- Minimum 44x44px for mobile
- Adequate spacing between clickable elements (min 8px gap)
