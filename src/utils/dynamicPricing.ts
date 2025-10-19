import { format, isWeekend, differenceInHours, differenceInDays } from 'date-fns';

interface PricingFactors {
  basePrice: number;
  appointmentDate: Date;
  clientVisitCount?: number;
  bookingLeadTime: number; // hours
}

interface PricingBreakdown {
  basePrice: number;
  peakTimeAdjustment: number;
  advanceBookingDiscount: number;
  lastMinuteSurcharge: number;
  vipDiscount: number;
  finalPrice: number;
  breakdown: string[];
}

export function calculateDynamicPrice({
  basePrice,
  appointmentDate,
  clientVisitCount = 0,
  bookingLeadTime
}: PricingFactors): PricingBreakdown {
  let adjustedPrice = basePrice;
  const breakdown: string[] = [`Base price: $${basePrice.toFixed(2)}`];

  // Peak time pricing (Friday/Saturday +20%)
  let peakTimeAdjustment = 0;
  if (isWeekend(appointmentDate)) {
    peakTimeAdjustment = basePrice * 0.2;
    adjustedPrice += peakTimeAdjustment;
    breakdown.push(`Weekend premium (+20%): +$${peakTimeAdjustment.toFixed(2)}`);
  }

  // Off-peak discount (Monday/Tuesday -15%)
  const dayOfWeek = appointmentDate.getDay();
  if (dayOfWeek === 1 || dayOfWeek === 2) {
    const discount = basePrice * 0.15;
    adjustedPrice -= discount;
    breakdown.push(`Off-peak discount (-15%): -$${discount.toFixed(2)}`);
  }

  // Last minute booking (<24h +30%)
  let lastMinuteSurcharge = 0;
  const hoursUntilAppointment = differenceInHours(appointmentDate, new Date());
  if (hoursUntilAppointment < 24 && hoursUntilAppointment > 0) {
    lastMinuteSurcharge = basePrice * 0.3;
    adjustedPrice += lastMinuteSurcharge;
    breakdown.push(`Last-minute booking (+30%): +$${lastMinuteSurcharge.toFixed(2)}`);
  }

  // Advance booking discount (>2 weeks -10%)
  let advanceBookingDiscount = 0;
  const daysUntilAppointment = differenceInDays(appointmentDate, new Date());
  if (daysUntilAppointment > 14) {
    advanceBookingDiscount = basePrice * 0.1;
    adjustedPrice -= advanceBookingDiscount;
    breakdown.push(`Early booking discount (-10%): -$${advanceBookingDiscount.toFixed(2)}`);
  }

  // VIP client discount (>10 visits -10%)
  let vipDiscount = 0;
  if (clientVisitCount >= 10) {
    vipDiscount = basePrice * 0.1;
    adjustedPrice -= vipDiscount;
    breakdown.push(`VIP client discount (-10%): -$${vipDiscount.toFixed(2)}`);
  }

  return {
    basePrice,
    peakTimeAdjustment,
    advanceBookingDiscount,
    lastMinuteSurcharge,
    vipDiscount,
    finalPrice: Math.max(adjustedPrice, basePrice * 0.5), // Never less than 50% of base
    breakdown
  };
}

export function formatPricingBreakdown(pricing: PricingBreakdown): string {
  return pricing.breakdown.join('\n');
}
