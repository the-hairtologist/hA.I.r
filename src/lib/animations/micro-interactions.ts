/**
 * Micro-interaction Utilities
 * Smooth animations and transitions for better UX
 */

/**
 * Page transition variants for framer-motion or CSS
 */
export const pageTransitions = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: 'easeOut' },
};

/**
 * Stagger children animation
 */
export const staggerChildren = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

/**
 * Button click feedback
 */
export const buttonFeedback = (element: HTMLElement) => {
  element.style.transform = 'scale(0.95)';
  setTimeout(() => {
    element.style.transform = 'scale(1)';
  }, 100);
};

/**
 * Success pulse animation
 */
export const successPulse = (element: HTMLElement) => {
  element.classList.add('animate-scale-in');
  setTimeout(() => {
    element.classList.remove('animate-scale-in');
  }, 500);
};

/**
 * Smooth scroll to element
 */
export const smoothScrollTo = (
  element: HTMLElement | null,
  offset: number = 80
) => {
  if (!element) return;
  
  const top = element.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: 'smooth' });
};

/**
 * Toast animation classes
 */
export const toastAnimations = {
  enter: 'animate-fade-in animate-slide-in-right',
  exit: 'animate-fade-out animate-slide-out-right',
};

/**
 * Card hover effect
 */
export const cardHoverEffect = 'hover:shadow-brutal-md hover:-translate-y-1 transition-all duration-200';

/**
 * Interactive element classes
 */
export const interactiveClasses = {
  button: 'active:scale-95 transition-transform duration-100',
  card: 'hover:shadow-brutal-sm hover:scale-[1.02] transition-all duration-200',
  link: 'hover:text-primary transition-colors duration-200',
  icon: 'hover:rotate-12 transition-transform duration-200',
};

/**
 * Loading shimmer effect
 */
export const shimmerEffect = `
  relative overflow-hidden before:absolute before:inset-0 
  before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent 
  before:-translate-x-full before:animate-[shimmer_2s_infinite]
`;
