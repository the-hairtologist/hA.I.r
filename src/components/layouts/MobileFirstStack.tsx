/**
 * Mobile-First Stack Component
 * Defaults to vertical stack on mobile, adapts for larger screens
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Spacing = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type Direction = 'vertical' | 'horizontal' | 'responsive';
type Alignment = 'start' | 'center' | 'end' | 'stretch';

interface MobileFirstStackProps {
  children: ReactNode;
  spacing?: Spacing;
  direction?: Direction;
  align?: Alignment;
  justify?: Alignment;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'main' | 'aside';
}

const spacingMap: Record<Spacing, string> = {
  xs: 'gap-2 md:gap-3',
  sm: 'gap-3 md:gap-4',
  md: 'gap-4 md:gap-6',
  lg: 'gap-6 md:gap-8',
  xl: 'gap-8 md:gap-12',
};

const alignmentMap: Record<Alignment, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const justifyMap: Record<Alignment, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  stretch: 'justify-stretch',
};

const directionMap: Record<Direction, string> = {
  vertical: 'flex-col',
  horizontal: 'flex-row',
  responsive: 'flex-col md:flex-row',
};

/**
 * MobileFirstStack - Layout primitive that stacks elements
 * 
 * @example
 * // Vertical on mobile, horizontal on desktop
 * <MobileFirstStack spacing="md" direction="responsive">
 *   <Button>Action 1</Button>
 *   <Button>Action 2</Button>
 * </MobileFirstStack>
 * 
 * @example
 * // Always vertical with large spacing
 * <MobileFirstStack spacing="lg" direction="vertical" align="center">
 *   <Heading>Title</Heading>
 *   <Text>Description</Text>
 * </MobileFirstStack>
 */
export function MobileFirstStack({
  children,
  spacing = 'md',
  direction = 'vertical',
  align = 'stretch',
  justify = 'start',
  className,
  as: Component = 'div',
}: MobileFirstStackProps) {
  return (
    <Component
      className={cn(
        'flex',
        directionMap[direction],
        spacingMap[spacing],
        alignmentMap[align],
        justifyMap[justify],
        className
      )}
    >
      {children}
    </Component>
  );
}

/**
 * Preset Stacks for common patterns
 */

// Form fields stack
export function FormStack({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <MobileFirstStack
      spacing="md"
      direction="vertical"
      align="stretch"
      className={className}
    >
      {children}
    </MobileFirstStack>
  );
}

// Button group stack
export function ButtonStack({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <MobileFirstStack
      spacing="sm"
      direction="responsive"
      align="stretch"
      className={cn('w-full md:w-auto', className)}
    >
      {children}
    </MobileFirstStack>
  );
}

// Card grid stack
export function CardStack({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        'gap-4 md:gap-6',
        className
      )}
    >
      {children}
    </div>
  );
}

// Content section stack
export function SectionStack({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <MobileFirstStack
      spacing="xl"
      direction="vertical"
      align="stretch"
      className={cn('py-8 md:py-12', className)}
      as="section"
    >
      {children}
    </MobileFirstStack>
  );
}
