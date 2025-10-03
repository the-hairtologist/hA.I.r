// Animation utilities and helpers

export const staggerDelay = (index: number, baseDelay: number = 50) => {
  return `${index * baseDelay}ms`;
};

export const fadeInUp = "animate-fade-in";
export const scaleIn = "animate-scale-in";
export const slideInRight = "animate-slide-in-right";

export const hoverScale = "hover-scale";
export const smoothTransition = "transition-all duration-300 ease-out";

// CSS animation utilities
export const animations = {
  fadeIn: "animate-fade-in",
  fadeOut: "animate-fade-out",
  scaleIn: "animate-scale-in",
  scaleOut: "animate-scale-out",
  slideInRight: "animate-slide-in-right",
  slideOutRight: "animate-slide-out-right",
  pulse: "animate-pulse",
  spin: "animate-spin",
};

// Stagger children animations
export const staggerChildren = (count: number, baseDelay: number = 50) => {
  return Array.from({ length: count }, (_, i) => ({
    style: { animationDelay: staggerDelay(i, baseDelay) },
    className: fadeInUp,
  }));
};
