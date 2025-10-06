/**
 * AI Client Retention System
 * Predicts client churn risk and suggests retention actions
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface ClientRiskScore {
  clientId: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  reasons: string[];
  recommendations: string[];
  lastAppointment?: Date;
  appointmentGap?: number;
  totalVisits: number;
}

class ClientRetentionAISystem {
  /**
   * Analyze all clients and predict churn risk
   */
  async analyzeClientRetention(stylistId: string): Promise<ClientRiskScore[]> {
    try {
      // Get all appointments for stylist
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('client_id, appointment_date, status')
        .eq('stylist_id', stylistId)
        .order('appointment_date', { ascending: false });

      if (error) throw error;

      // Group by client
      const clientMap = new Map<string, any[]>();
      appointments?.forEach(apt => {
        if (!clientMap.has(apt.client_id)) {
          clientMap.set(apt.client_id, []);
        }
        clientMap.get(apt.client_id)?.push(apt);
      });

      const riskScores: ClientRiskScore[] = [];

      // Analyze each client
      for (const [clientId, clientAppointments] of clientMap.entries()) {
        const score = this.calculateRiskScore(clientAppointments);
        riskScores.push(score);
      }

      // Sort by risk (highest first)
      riskScores.sort((a, b) => b.score - a.score);

      logger.info('Client retention analysis complete', 'ClientRetentionAI', {
        totalClients: riskScores.length,
        atRisk: riskScores.filter(s => s.riskLevel !== 'low').length
      });

      return riskScores;
    } catch (error) {
      logger.error('Failed to analyze client retention', 'ClientRetentionAI', error);
      return [];
    }
  }

  /**
   * Calculate risk score for a client
   */
  private calculateRiskScore(appointments: any[]): ClientRiskScore {
    const now = new Date();
    const lastAppointment = appointments[0] ? new Date(appointments[0].appointment_date) : null;
    const totalVisits = appointments.length;
    
    // Calculate days since last appointment
    const daysSinceLastVisit = lastAppointment 
      ? Math.floor((now.getTime() - lastAppointment.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    // Calculate average gap between appointments
    let avgGap = 0;
    if (appointments.length > 1) {
      const gaps = [];
      for (let i = 0; i < appointments.length - 1; i++) {
        const date1 = new Date(appointments[i].appointment_date);
        const date2 = new Date(appointments[i + 1].appointment_date);
        gaps.push((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
      }
      avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    }

    // Risk factors
    const reasons: string[] = [];
    let score = 0;

    // Factor 1: Time since last visit (0-40 points)
    if (daysSinceLastVisit > 90) {
      score += 40;
      reasons.push(`${daysSinceLastVisit} days since last visit`);
    } else if (daysSinceLastVisit > 60) {
      score += 25;
      reasons.push(`${daysSinceLastVisit} days since last visit`);
    } else if (daysSinceLastVisit > 45) {
      score += 15;
      reasons.push('Approaching typical visit window');
    }

    // Factor 2: Gap longer than average (0-30 points)
    if (avgGap > 0 && daysSinceLastVisit > avgGap * 1.5) {
      score += 30;
      reasons.push('Visit gap longer than usual pattern');
    } else if (avgGap > 0 && daysSinceLastVisit > avgGap * 1.2) {
      score += 15;
      reasons.push('Slightly delayed compared to usual');
    }

    // Factor 3: New client (0-20 points)
    if (totalVisits <= 2) {
      score += 20;
      reasons.push('New client - building relationship');
    }

    // Factor 4: Visit frequency declining (0-10 points)
    if (appointments.length >= 3) {
      const recentGap = appointments[0] && appointments[1] 
        ? (new Date(appointments[0].appointment_date).getTime() - 
           new Date(appointments[1].appointment_date).getTime()) / (1000 * 60 * 60 * 24)
        : 0;
      
      if (recentGap > avgGap * 1.3) {
        score += 10;
        reasons.push('Visit frequency declining');
      }
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (score >= 70) riskLevel = 'critical';
    else if (score >= 50) riskLevel = 'high';
    else if (score >= 30) riskLevel = 'medium';
    else riskLevel = 'low';

    // Generate recommendations
    const recommendations = this.generateRecommendations(riskLevel, reasons, daysSinceLastVisit);

    return {
      clientId: appointments[0]?.client_id,
      riskLevel,
      score,
      reasons,
      recommendations,
      lastAppointment: lastAppointment || undefined,
      appointmentGap: daysSinceLastVisit,
      totalVisits
    };
  }

  /**
   * Generate AI recommendations for retention
   */
  private generateRecommendations(
    riskLevel: string,
    reasons: string[],
    daysSinceLastVisit: number
  ): string[] {
    const recommendations: string[] = [];

    if (riskLevel === 'critical' || riskLevel === 'high') {
      recommendations.push('📧 Send personalized check-in message');
      recommendations.push('🎁 Offer special comeback discount (15-20%)');
      recommendations.push('📞 Consider personal phone call');
    }

    if (daysSinceLastVisit > 60) {
      recommendations.push('⏰ Send appointment reminder with booking link');
      recommendations.push('✨ Highlight new services or products');
    }

    if (riskLevel === 'medium') {
      recommendations.push('💌 Send friendly reminder about next appointment');
      recommendations.push('📸 Share relevant hair inspiration');
    }

    if (reasons.some(r => r.includes('New client'))) {
      recommendations.push('🌟 Request feedback on first experience');
      recommendations.push('📚 Share hair care tips for their specific needs');
    }

    recommendations.push('📊 Track engagement with communications');

    return recommendations;
  }

  /**
   * Get AI retention insights via edge function
   */
  async getAIRetentionInsights(riskScores: ClientRiskScore[]): Promise<string> {
    try {
      const highRiskClients = riskScores.filter(s => 
        s.riskLevel === 'high' || s.riskLevel === 'critical'
      );

      const { data, error } = await supabase.functions.invoke('hair-assistant-chat', {
        body: {
          messages: [
            {
              role: 'system',
              content: 'You are a client retention expert for hair stylists. Provide actionable insights and strategies.'
            },
            {
              role: 'user',
              content: `Analyze client retention data: ${highRiskClients.length} high-risk clients out of ${riskScores.length} total. Provide top 3 retention strategies.`
            }
          ]
        }
      });

      if (error) throw error;
      return data.response || 'AI insights unavailable';
    } catch (error) {
      logger.error('Failed to get AI retention insights', 'ClientRetentionAI', error);
      return 'Unable to generate AI insights';
    }
  }

  /**
   * Auto-send retention messages to at-risk clients
   */
  async sendRetentionMessages(stylistId: string, riskScores: ClientRiskScore[]): Promise<number> {
    let sentCount = 0;

    const highRiskClients = riskScores.filter(s => 
      s.riskLevel === 'high' || s.riskLevel === 'critical'
    );

    for (const client of highRiskClients.slice(0, 5)) { // Limit to 5 at a time
      try {
        // Get client profile
        const { data: profile } = await supabase
          .from('client_profiles')
          .select('*, user:profiles(full_name, email)')
          .eq('id', client.clientId)
          .single();

        if (!profile) continue;

        // Create personalized message
        const message = this.generateRetentionMessage(client, profile);

        // Send message (this would integrate with your messaging system)
        await supabase.from('messages').insert({
          sender_id: stylistId,
          recipient_id: profile.user_id,
          message_text: message
        });

        sentCount++;
        logger.info('Sent retention message', 'ClientRetentionAI', { clientId: client.clientId });
      } catch (error) {
        logger.error('Failed to send retention message', 'ClientRetentionAI', error);
      }
    }

    return sentCount;
  }

  /**
   * Generate personalized retention message
   */
  private generateRetentionMessage(client: ClientRiskScore, profile: any): string {
    const name = profile.user?.full_name || 'there';
    const daysSince = client.appointmentGap || 0;

    if (client.riskLevel === 'critical') {
      return `Hi ${name}! 👋 We've missed you! It's been ${daysSince} days since your last visit. I'd love to see you again and catch up! ✨ How about booking your next appointment? I have some exciting new techniques I think you'd love! 💇‍♀️`;
    } else if (client.riskLevel === 'high') {
      return `Hey ${name}! 🌟 Hope you're doing well! Just wanted to check in - it's been a while since I've seen you. Your hair must be ready for some TLC! When works best for your next appointment? 💕`;
    }

    return `Hi ${name}! Just a friendly reminder that it's been about ${daysSince} days since your last visit. Time to book your next appointment? I'm here whenever you're ready! 😊`;
  }
}

export const clientRetentionAI = new ClientRetentionAISystem();
