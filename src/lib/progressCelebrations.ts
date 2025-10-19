/**
 * Progress Celebrations
 * Triggers confetti and toasts for milestones
 */

import confetti from "canvas-confetti";
import { toast } from "sonner";
import { haptic } from "@/platform/haptics";

interface MilestoneConfig {
  threshold: number;
  message: string;
  confettiIntensity?: "light" | "medium" | "heavy";
}

const appointmentMilestones: MilestoneConfig[] = [
  { threshold: 1, message: "🎉 First appointment booked!", confettiIntensity: "medium" },
  { threshold: 10, message: "🎊 10 appointments! You're on fire!", confettiIntensity: "medium" },
  { threshold: 25, message: "⭐ 25 appointments milestone!", confettiIntensity: "heavy" },
  { threshold: 50, message: "🏆 50 appointments! Incredible work!", confettiIntensity: "heavy" },
  { threshold: 100, message: "💎 100 appointments! You're a pro!", confettiIntensity: "heavy" },
];

const clientMilestones: MilestoneConfig[] = [
  { threshold: 1, message: "✨ First client added!", confettiIntensity: "light" },
  { threshold: 5, message: "👥 5 clients! Building your base!", confettiIntensity: "light" },
  { threshold: 10, message: "🎯 10 clients! You're growing!", confettiIntensity: "medium" },
  { threshold: 25, message: "🌟 25 clients! Amazing growth!", confettiIntensity: "medium" },
  { threshold: 50, message: "🚀 50 clients! You're unstoppable!", confettiIntensity: "heavy" },
  { threshold: 100, message: "👑 100 clients! Legendary status!", confettiIntensity: "heavy" },
];

const formulaMilestones: MilestoneConfig[] = [
  { threshold: 1, message: "🧪 First formula created!", confettiIntensity: "light" },
  { threshold: 10, message: "🎨 10 formulas! Master mixer!", confettiIntensity: "medium" },
  { threshold: 25, message: "🌈 25 formulas! Color genius!", confettiIntensity: "heavy" },
];

export async function celebrateAppointmentMilestone(count: number) {
  const milestone = appointmentMilestones.find(m => m.threshold === count);
  if (milestone) {
    await triggerCelebration(milestone);
  }
}

export async function celebrateClientMilestone(count: number) {
  const milestone = clientMilestones.find(m => m.threshold === count);
  if (milestone) {
    await triggerCelebration(milestone);
  }
}

export async function celebrateFormulaMilestone(count: number) {
  const milestone = formulaMilestones.find(m => m.threshold === count);
  if (milestone) {
    await triggerCelebration(milestone);
  }
}

export async function celebratePerfectWeek() {
  await triggerCelebration({
    threshold: 0,
    message: "🎯 Perfect week! All appointments completed!",
    confettiIntensity: "heavy",
  });
}

export async function celebrateFiveStarStreak(count: number) {
  await triggerCelebration({
    threshold: count,
    message: `⭐ ${count} five-star reviews in a row!`,
    confettiIntensity: "heavy",
  });
}

async function triggerCelebration(config: MilestoneConfig) {
  // Haptic feedback
  await haptic.success();

  // Confetti
  const intensity = config.confettiIntensity || "medium";
  triggerConfetti(intensity);

  // Toast notification
  toast.success(config.message, {
    duration: 5000,
    position: "top-center",
  });
}

function triggerConfetti(intensity: "light" | "medium" | "heavy") {
  const configs = {
    light: {
      particleCount: 50,
      spread: 50,
      origin: { y: 0.6 },
    },
    medium: {
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    },
    heavy: {
      particleCount: 200,
      spread: 90,
      origin: { y: 0.6 },
    },
  };

  const config = configs[intensity];

  confetti({
    ...config,
    colors: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8"],
  });

  // For heavy, add side confetti
  if (intensity === "heavy") {
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
    }, 200);
  }
}

// Easter egg: Konami code confetti explosion
let konamiSequence = "";
const konamiCode = "ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightba";

export function setupKonamiCode() {
  document.addEventListener("keydown", (e: KeyboardEvent) => {
    konamiSequence += e.key;
    
    if (konamiSequence.length > konamiCode.length) {
      konamiSequence = konamiSequence.slice(-konamiCode.length);
    }
    
    if (konamiSequence === konamiCode) {
      triggerKonamiExplosion();
      konamiSequence = "";
    }
  });
}

async function triggerKonamiExplosion() {
  await haptic.success();
  
  toast.success("🎮 Konami Code Activated!", {
    duration: 3000,
    position: "top-center",
  });

  // Massive confetti explosion
  const duration = 3000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8"],
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8"],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}
