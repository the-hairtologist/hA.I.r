/**
 * Dashboard Section Renderer
 * Renders individual dashboard sections with memoization
 */

import { memo } from 'react';
import { DashboardSection } from '@/hooks/useDashboardLayout';
import { NextAppointmentWidget } from './NextAppointmentWidget';
import { LoyaltyProgressWidget } from './LoyaltyProgressWidget';
import { AppointmentTimerWidget } from '../AppointmentTimerWidget';
import { ProgressTracker } from '../ProgressTracker';
import { BirthdayAlertsWidget } from '../BirthdayAlertsWidget';
import { CommissionTrackerWidget } from './CommissionTrackerWidget';
import { LiveKPICards } from './LiveKPICards';
import { QuickActions } from './QuickActions';
import { WeeklyOverview } from './WeeklyOverview';
import { ClientSentimentTracker } from './ClientSentimentTracker';
import { RevenueTrends } from './RevenueTrends';
import { TopServices } from './TopServices';
import { ClientRetention } from './ClientRetention';
import { QuickNotes } from './QuickNotes';
import { ChurnRiskWidget } from '../ChurnRiskWidget';
import { ProactiveInsightsPanel } from '../ProactiveInsightsPanel';
import { PredictiveSuggestions } from '../PredictiveSuggestions';
import { RecentActivity } from './RecentActivity';
import { QuickTasks } from './QuickTasks';
import { FavoriteStylists } from './FavoriteStylists';
import { ClientMilestones } from './ClientMilestones';
import { SupportChatWidget } from './SupportChatWidget';
import { EmptyStateGuidance } from './EmptyStateGuidance';
import { FeatureErrorBoundary } from '../errors/FeatureErrorBoundary';
import { AIFeatureErrorBoundary } from '../AIFeatureErrorBoundary';
import { toast } from 'sonner';

interface DashboardSectionRendererProps {
  section: DashboardSection;
  userRole: string | null;
  isAdmin: boolean;
  profile: any;
  stats: any;
  recentActivities: any[];
  predictiveInsightsEnabled: boolean;
  predictiveInsights: any[];
  analytics: any;
}

export const DashboardSectionRenderer = memo(
  ({
    section,
    userRole,
    isAdmin,
    profile,
    stats,
    recentActivities,
    predictiveInsightsEnabled,
    predictiveInsights,
    analytics,
  }: DashboardSectionRendererProps) => {
    if (!section.enabled) return null;

    switch (section.component) {
      case 'NextAppointment':
        return userRole === 'client' || isAdmin ? (
          <NextAppointmentWidget />
        ) : null;

      case 'LoyaltyProgress':
        return userRole === 'client' || isAdmin ? (
          <LoyaltyProgressWidget />
        ) : null;

      case 'AppointmentTimer':
        return userRole === 'stylist' || isAdmin ? (
          <AppointmentTimerWidget />
        ) : null;

      case 'ProgressTracker':
        return userRole === 'stylist' || isAdmin ? <ProgressTracker /> : null;

      case 'BirthdayAlerts':
        return userRole === 'stylist' || isAdmin ? (
          <BirthdayAlertsWidget />
        ) : null;

      case 'CommissionTracker':
        return userRole === 'stylist' || isAdmin ? (
          <FeatureErrorBoundary featureName="Commission Tracker">
            <CommissionTrackerWidget />
          </FeatureErrorBoundary>
        ) : null;

      case 'LiveKPICards':
        return (userRole === 'stylist' || isAdmin) && profile?.id ? (
          <FeatureErrorBoundary featureName="Live KPIs">
            <LiveKPICards stylistId={profile.id} />
          </FeatureErrorBoundary>
        ) : null;

      case 'QuickActions':
        return <QuickActions userRole={userRole || ''} isAdmin={isAdmin} />;

      case 'WeeklyOverview':
        return userRole === 'stylist' || isAdmin ? (
          <FeatureErrorBoundary featureName="Weekly Overview">
            <WeeklyOverview />
          </FeatureErrorBoundary>
        ) : null;

      case 'ClientSentimentTracker':
        return (userRole === 'stylist' || isAdmin) && profile?.id ? (
          <FeatureErrorBoundary featureName="Client Sentiment">
            <ClientSentimentTracker stylistId={profile.id} />
          </FeatureErrorBoundary>
        ) : null;

      case 'RevenueTrends':
        return (userRole === 'stylist' || isAdmin) && profile?.id ? (
          <FeatureErrorBoundary featureName="Revenue Analytics">
            <RevenueTrends stylistId={profile.id} />
          </FeatureErrorBoundary>
        ) : null;

      case 'TopServices':
        return (userRole === 'stylist' || isAdmin) && profile?.id ? (
          <FeatureErrorBoundary featureName="Service Performance">
            <TopServices stylistId={profile.id} />
          </FeatureErrorBoundary>
        ) : null;

      case 'ClientRetention':
        return (userRole === 'stylist' || isAdmin) && profile?.id ? (
          <FeatureErrorBoundary featureName="Retention Metrics">
            <ClientRetention stylistId={profile.id} />
          </FeatureErrorBoundary>
        ) : null;

      case 'QuickNotes':
        return userRole === 'stylist' || isAdmin ? <QuickNotes /> : null;

      case 'ChurnRisk':
        return (userRole === 'stylist' || isAdmin) && profile?.id ? (
          <AIFeatureErrorBoundary featureName="Churn Prediction">
            <ChurnRiskWidget stylistId={profile.id} variant="full" />
          </AIFeatureErrorBoundary>
        ) : null;

      case 'ProactiveInsights':
        return (userRole === 'stylist' || isAdmin) && profile?.id ? (
          <AIFeatureErrorBoundary featureName="Proactive Insights">
            <ProactiveInsightsPanel stylistId={profile.id} />
          </AIFeatureErrorBoundary>
        ) : null;

      case 'PredictiveInsights':
        return (userRole === 'stylist' || isAdmin) &&
          predictiveInsightsEnabled &&
          predictiveInsights.length > 0 ? (
          <AIFeatureErrorBoundary featureName="Predictive Insights">
            <PredictiveSuggestions
              insights={predictiveInsights}
              onAction={insightId => {
                toast.success('Action taken on prediction');
                analytics.trackPrediction(predictiveInsights.length);
              }}
            />
          </AIFeatureErrorBoundary>
        ) : null;

      case 'RecentActivity':
        return (userRole === 'stylist' || userRole === 'client' || isAdmin) &&
          recentActivities.length > 0 ? (
          <RecentActivity activities={recentActivities} />
        ) : null;

      case 'QuickTasks':
        return userRole === 'stylist' || isAdmin ? <QuickTasks /> : null;

      case 'FavoriteStylists':
        return (userRole === 'client' || isAdmin) && profile?.id ? (
          <FavoriteStylists clientId={profile.id} />
        ) : null;

      case 'ClientMilestones':
        return (userRole === 'client' || isAdmin) && profile?.id ? (
          <ClientMilestones clientId={profile.id} />
        ) : null;

      case 'SupportChatWidget':
        return <SupportChatWidget />;

      case 'UpcomingAppointments':
        return (userRole === 'client' || isAdmin) && stats ? (
          stats.upcomingAppointments > 0 ? (
            <RecentActivity activities={recentActivities} />
          ) : (
            <EmptyStateGuidance type="appointments" />
          )
        ) : null;

      default:
        return null;
    }
  }
);

DashboardSectionRenderer.displayName = 'DashboardSectionRenderer';
