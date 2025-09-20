# PrimaryReading Tailwind Theme Guide

## Overview
This guide explains how to use the custom Tailwind theme for PrimaryReading. The theme provides semantic color naming that aligns with our user journey design (Parent/Teacher = Blue, Student = Orange).

## Core Brand Colors

### Primary Colors
- `primary-orange` - #EF7722 (Primary brand orange)
- `secondary-orange` - #FAA533 (Secondary/accent orange)
- `primary-blue` - #0BA6DF (Primary blue)
- `light-gray` - #EBEBEB (Background gray)

## Semantic User Journey Colors

### Parent/Teacher Theme (Blue)
Use these classes for all Parent/Teacher related components:

```html
<!-- Backgrounds -->
<div class="bg-parent">Primary blue background</div>
<div class="bg-parent-light">Light blue background (10% opacity)</div>

<!-- Text -->
<span class="text-parent">Blue text</span>

<!-- Borders -->
<div class="border-parent-border">Blue border (20% opacity)</div>

<!-- Interactive States -->
<button class="bg-parent hover:bg-parent-hover active:bg-parent-active">
  Blue button with hover/active states
</button>
```

### Student Theme (Orange)
Use these classes for all Student related components:

```html
<!-- Backgrounds -->
<div class="bg-student">Primary orange background</div>
<div class="bg-student-light">Light orange background (10% opacity)</div>

<!-- Text -->
<span class="text-student">Orange text</span>

<!-- Borders -->
<div class="border-student-border">Orange border (20% opacity)</div>

<!-- Interactive States -->
<button class="bg-student hover:bg-student-hover active:bg-student-active">
  Orange button with hover/active states
</button>

<!-- Secondary orange for accents -->
<span class="text-student-secondary">Secondary orange text</span>
```

## Common Patterns

### Role Selection Cards
```html
<!-- Parent/Teacher Card -->
<div class="border-2 hover:border-parent bg-white/95">
  <div class="bg-parent-light rounded-full">
    <Icon class="text-parent" />
  </div>
  <h3 class="text-parent">Parent/Teacher</h3>
</div>

<!-- Student Card -->
<div class="border-2 hover:border-student bg-white/95">
  <div class="bg-student-light rounded-full">
    <Icon class="text-student" />
  </div>
  <h3 class="text-student">Student</h3>
</div>
```

### Action Buttons
```html
<!-- Parent/Teacher Action -->
<button class="bg-parent hover:bg-parent-hover active:bg-parent-active focus:ring-parent/50 text-white">
  Continue Setup
</button>

<!-- Student Action -->
<button class="bg-student hover:bg-student-hover active:bg-student-active focus:ring-student/50 text-white">
  Start Reading!
</button>
```

### Content Highlight Boxes
```html
<!-- Parent/Teacher Information Box -->
<div class="bg-parent-light border border-parent-border">
  <h3 class="text-parent">Professional Features:</h3>
  <p class="text-gray-700">Content here...</p>
</div>

<!-- Student Information Box -->
<div class="bg-student-light border border-student-border">
  <h3 class="text-student">What's waiting for you:</h3>
  <p class="text-gray-700">Content here...</p>
</div>
```

## Migration Examples

### Before (Manual Colors)
```html
<!-- OLD WAY -->
<div class="bg-[#0BA6DF]/10 border border-[#0BA6DF]/20">
  <h3 class="text-[#0BA6DF]">Professional Features</h3>
  <button class="bg-[#0BA6DF] hover:bg-[#0BA6DF]/90 active:bg-[#0BA6DF]/80">
    Continue
  </button>
</div>
```

### After (Theme Colors)
```html
<!-- NEW WAY -->
<div class="bg-parent-light border border-parent-border">
  <h3 class="text-parent">Professional Features</h3>
  <button class="bg-parent hover:bg-parent-hover active:bg-parent-active">
    Continue
  </button>
</div>
```

## Benefits

1. **Semantic Naming**: Clear intent (parent vs student)
2. **Consistency**: Guaranteed color consistency across the app
3. **Maintainability**: Change colors in one place (CSS variables)
4. **Developer Experience**: Autocomplete and easier to remember
5. **Design System**: Enforces proper usage patterns

## Text and Neutral Colors

### Text Hierarchy
- `text-primary` - Primary text (highest contrast)
- `text-secondary` - Secondary text (good contrast)
- `text-muted` - Muted text (subtle)
- `placeholder` - Placeholder text

### Backgrounds
- `background` - Main page background
- `card` - Card backgrounds
- `card-hover` - Card hover state

### Semantic States
- `success` - Success messages/states
- `warning` - Warning messages/states
- `error` - Error messages/states

## Usage Guidelines

1. **Always use semantic colors** for user journey components
2. **Use theme colors instead of manual hex codes**
3. **Follow the Parent=Blue, Student=Orange pattern**
4. **Test in both light and dark modes** (if implemented)
5. **Maintain WCAG AA contrast ratios** with provided text colors

## Next Steps

1. Gradually migrate existing components to use theme colors
2. Add theme color usage to component documentation
3. Create theme-aware component variants
4. Implement dark mode support using the same semantic structure