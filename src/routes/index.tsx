/**
 * Route Configuration
 * Centralized routing with advanced lazy loading and retry logic
 */

import { Route } from 'react-router-dom';
import { lazy } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SubscriptionGate } from '@/components/SubscriptionGate';
import { DashboardErrorBoundary } from '@/components/DashboardErrorBoundary';
import { lazyWithRetry } from '@/lib/performance/ReactOptimizations';

// Lazy load pages with retry logic for failed chunks
const Index = lazyWithRetry(() => import('@/pages/Index'));
const Auth = lazyWithRetry(() => import('@/pages/Auth'));
const Dashboard = lazyWithRetry(() => import('@/pages/Dashboard'));
const StylistDiscovery = lazyWithRetry(() => import('@/pages/StylistDiscovery'));
const Formulas = lazyWithRetry(() => import('@/pages/Formulas'));
const Appointments = lazyWithRetry(() => import('@/pages/Appointments'));
const BookAppointment = lazyWithRetry(() => import('@/pages/BookAppointment'));
const StylistProfile = lazyWithRetry(() => import('@/pages/StylistProfile'));
const ClientRequests = lazyWithRetry(() => import('@/pages/ClientRequests'));
const ClientDiscovery = lazyWithRetry(() => import('@/pages/ClientDiscovery'));
const Reviews = lazyWithRetry(() => import('@/pages/Reviews'));
const Messages = lazyWithRetry(() => import('@/pages/Messages'));
const ScheduleManagement = lazyWithRetry(() => import('@/pages/ScheduleManagement'));
const Services = lazyWithRetry(() => import('@/pages/Services'));
const Settings = lazyWithRetry(() => import('@/pages/Settings'));
const Finance = lazyWithRetry(() => import('@/pages/Finance'));
const Products = lazyWithRetry(() => import('@/pages/Products'));
const Resources = lazyWithRetry(() => import('@/pages/Resources'));
const Knowledge = lazyWithRetry(() => import('@/pages/Knowledge'));
const QuickFormula = lazyWithRetry(() => import('@/pages/QuickFormula'));
const AIKnowledge = lazyWithRetry(() => import('@/pages/AIAssistant'));
const Portfolio = lazyWithRetry(() => import('@/pages/Portfolio'));
const Clients = lazyWithRetry(() => import('@/pages/Clients'));
const AccessCodes = lazyWithRetry(() => import('@/pages/AccessCodes'));
const Integrations = lazyWithRetry(() => import('@/pages/Integrations'));
const DeepLinkAppointment = lazyWithRetry(() => import('@/pages/DeepLinkAppointment'));
const DeepLinkTransformation = lazyWithRetry(() => import('@/pages/DeepLinkTransformation'));
const Privacy = lazyWithRetry(() => import('@/pages/Privacy'));
const Terms = lazyWithRetry(() => import('@/pages/Terms'));
const CookiePolicy = lazyWithRetry(() => import('@/pages/CookiePolicy'));
const NotFound = lazyWithRetry(() => import('@/pages/NotFound'));
const ServerError = lazyWithRetry(() => import('@/pages/ServerError'));
const Referrals = lazyWithRetry(() => import('@/pages/Referrals'));
const SystemHealth = lazyWithRetry(() => import('@/pages/SystemHealth'));
const SecurityDashboard = lazy(() => import('@/pages/admin/SecurityDashboard'));
const AdminCommandCenter = lazyWithRetry(() => import('@/pages/AdminCommandCenter'));
const AdminUsers = lazyWithRetry(() => import('@/pages/AdminUsers'));
const AuditLogs = lazyWithRetry(() => import('@/pages/AuditLogs'));
const ActivityLog = lazyWithRetry(() => import('@/pages/admin/ActivityLog'));
const AppDirectory = lazyWithRetry(() => import('@/pages/AppDirectory'));
const DMCA = lazyWithRetry(() => import('@/pages/DMCA'));
const Accessibility = lazyWithRetry(() => import('@/pages/Accessibility'));
const Notifications = lazyWithRetry(() => import('@/pages/Notifications'));
const ClientReviews = lazyWithRetry(() => import('@/pages/ClientReviews'));
const BookingPage = lazyWithRetry(() => import('@/pages/BookingPage'));
const AdminRevenue = lazyWithRetry(() => import('@/pages/AdminRevenue'));
const Profile = lazyWithRetry(() => import('@/pages/Profile'));
const Help = lazyWithRetry(() => import('@/pages/Help'));
const ComingSoon = lazyWithRetry(() => import('@/pages/ComingSoon'));
const Unsubscribe = lazyWithRetry(() => import('@/pages/Unsubscribe'));
const EmailCampaigns = lazyWithRetry(() => import('@/pages/EmailCampaigns'));
const EmailSettings = lazyWithRetry(() => import('@/pages/EmailSettings'));
const EmailSequences = lazyWithRetry(() => import('@/pages/EmailSequences'));
const ClientIntakeForms = lazyWithRetry(() => import('@/pages/ClientIntakeForms'));
const AftercareGuides = lazyWithRetry(() => import('@/pages/AftercareGuides'));
const ShowcaseDemo = lazyWithRetry(() => import('@/pages/ShowcaseDemo'));
const AdGenerator = lazyWithRetry(() => import('@/pages/AdGenerator'));
const FavoriteStylistsPage = lazyWithRetry(() => import('@/pages/FavoriteStylistsPage'));
const PaymentMethodsPage = lazyWithRetry(() => import('@/pages/PaymentMethodsPage'));
const ClientReviewsPage = lazyWithRetry(() => import('@/pages/ClientReviewsPage'));
const BookingHistoryPage = lazyWithRetry(() => import('@/pages/BookingHistoryPage'));
const GrowthAnalytics = lazyWithRetry(() => import('@/pages/GrowthAnalytics'));
const CommissionTracking = lazyWithRetry(() => import('@/pages/CommissionTracking'));
const FeedbackBoard = lazyWithRetry(() => import('@/pages/FeedbackBoard'));
const ClientFormulas = lazyWithRetry(() => import('@/pages/ClientFormulas'));
const InstallPWA = lazyWithRetry(() => import('@/pages/InstallPWA'));
const ZapierIntegration = lazyWithRetry(() => import('@/pages/ZapierIntegration'));
const AuditReport = lazyWithRetry(() => import('@/pages/AuditReport'));
const ClientRetention = lazyWithRetry(() => import('@/pages/ClientRetention'));
const DesignSystem = lazyWithRetry(() => import('@/pages/DesignSystem'));

export const AppRoutes = () => (
  <>
    {/* Public Routes */}
    <Route path="/" element={<Index />} />
    <Route path="/auth" element={<Auth />} />
    <Route path="/privacy" element={<Privacy />} />
    <Route path="/terms" element={<Terms />} />
    <Route path="/cookie-policy" element={<CookiePolicy />} />
    <Route path="/dmca" element={<DMCA />} />
    <Route path="/accessibility" element={<Accessibility />} />
    <Route path="/unsubscribe" element={<Unsubscribe />} />
    <Route path="/showcase" element={<ShowcaseDemo />} />
    <Route path="/install" element={<InstallPWA />} />

    {/* Deep Link Routes */}
    <Route path="/appointment/:id" element={<DeepLinkAppointment />} />
    <Route path="/transformation/:id" element={<DeepLinkTransformation />} />

    {/* Shared Protected Routes */}
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <DashboardErrorBoundary>
            <Dashboard />
          </DashboardErrorBoundary>
        </ProtectedRoute>
      }
    />
    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
    <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
    <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
    <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
    <Route path="/feedback" element={<ProtectedRoute><FeedbackBoard /></ProtectedRoute>} />

    {/* Stylist Routes */}
    <Route
      path="/resources"
      element={<ProtectedRoute allowedRoles={['stylist', 'admin']}><Resources /></ProtectedRoute>}
    />
    <Route
      path="/knowledge"
      element={<ProtectedRoute allowedRoles={['stylist', 'admin', 'client']}><Knowledge /></ProtectedRoute>}
    />
    <Route
      path="/ai-assistant"
      element={<ProtectedRoute allowedRoles={['stylist', 'admin']}><AIKnowledge /></ProtectedRoute>}
    />
    <Route
      path="/quick-formula"
      element={<ProtectedRoute allowedRoles={['stylist', 'admin']}><QuickFormula /></ProtectedRoute>}
    />
    <Route
      path="/integrations"
      element={<ProtectedRoute allowedRoles={['stylist', 'admin']}><Integrations /></ProtectedRoute>}
    />
    <Route
      path="/integrations/zapier"
      element={<ProtectedRoute allowedRoles={['stylist', 'admin']}><ZapierIntegration /></ProtectedRoute>}
    />
    <Route
      path="/formulas"
      element={<ProtectedRoute allowedRoles={['stylist', 'admin']}><Formulas /></ProtectedRoute>}
    />
    <Route
      path="/schedule"
      element={
        <ProtectedRoute allowedRoles={['stylist', 'admin']}>
          <SubscriptionGate feature="schedule"><ScheduleManagement /></SubscriptionGate>
        </ProtectedRoute>
      }
    />
    <Route
      path="/client-discovery"
      element={<ProtectedRoute allowedRoles={['stylist', 'admin']}><ClientDiscovery /></ProtectedRoute>}
    />
    <Route
      path="/finance"
      element={
        <ProtectedRoute allowedRoles={['stylist', 'admin']}>
          <SubscriptionGate feature="payments"><Finance /></SubscriptionGate>
        </ProtectedRoute>
      }
    />
    <Route
      path="/products"
      element={<ProtectedRoute allowedRoles={['stylist', 'admin']}><Products /></ProtectedRoute>}
    />
    <Route
      path="/portfolio"
      element={
        <ProtectedRoute allowedRoles={['stylist', 'admin']}>
          <SubscriptionGate feature="portfolio"><Portfolio /></SubscriptionGate>
        </ProtectedRoute>
      }
    />
    <Route
      path="/clients"
      element={
        <ProtectedRoute allowedRoles={['stylist', 'admin']}>
          <SubscriptionGate feature="clients"><Clients /></SubscriptionGate>
        </ProtectedRoute>
      }
    />
    <Route
      path="/services"
      element={
        <ProtectedRoute allowedRoles={['stylist', 'admin']}>
          <SubscriptionGate feature="services"><Services /></SubscriptionGate>
        </ProtectedRoute>
      }
    />
    <Route
      path="/referrals"
      element={<ProtectedRoute allowedRoles={['stylist', 'admin']}><Referrals /></ProtectedRoute>}
    />
    <Route
      path="/analytics"
      element={<ProtectedRoute allowedRoles={['stylist', 'admin']}><GrowthAnalytics /></ProtectedRoute>}
    />
    <Route
      path="/commissions"
      element={<ProtectedRoute allowedRoles={['stylist', 'admin']}><CommissionTracking /></ProtectedRoute>}
    />
    <Route
      path="/admin/revenue"
      element={<ProtectedRoute allowedRoles={['admin']}><AdminRevenue /></ProtectedRoute>}
    />
    <Route
      path="/ad-generator"
      element={<ProtectedRoute allowedRoles={['stylist', 'admin']}><AdGenerator /></ProtectedRoute>}
    />
    <Route
      path="/stylist/reviews"
      element={<ProtectedRoute allowedRoles={['stylist', 'admin']}><ClientReviews /></ProtectedRoute>}
    />
    <Route
      path="/booking-page"
      element={<ProtectedRoute allowedRoles={['stylist', 'admin']}><BookingPage /></ProtectedRoute>}
    />
    <Route
      path="/email-campaigns"
      element={<ProtectedRoute allowedRoles={['admin', 'stylist']}><EmailCampaigns /></ProtectedRoute>}
    />
    <Route
      path="/email-settings"
      element={<ProtectedRoute allowedRoles={['stylist', 'admin']}><EmailSettings /></ProtectedRoute>}
    />
    <Route
      path="/email-sequences"
      element={<ProtectedRoute allowedRoles={['stylist', 'admin']}><EmailSequences /></ProtectedRoute>}
    />
    <Route
      path="/intake-forms"
      element={<ProtectedRoute allowedRoles={['stylist', 'admin']}><ClientIntakeForms /></ProtectedRoute>}
    />
    <Route
      path="/aftercare-guides"
      element={<ProtectedRoute allowedRoles={['stylist', 'admin']}><AftercareGuides /></ProtectedRoute>}
    />
    <Route
      path="/client-retention"
      element={<ProtectedRoute allowedRoles={['stylist', 'admin']}><ClientRetention /></ProtectedRoute>}
    />

    {/* Client Routes */}
    <Route
      path="/stylist-discovery"
      element={<ProtectedRoute><StylistDiscovery /></ProtectedRoute>}
    />
    <Route
      path="/client-requests"
      element={<ProtectedRoute allowedRoles={['client']}><ClientRequests /></ProtectedRoute>}
    />
    <Route
      path="/book-appointment"
      element={<ProtectedRoute allowedRoles={['client']}><BookAppointment /></ProtectedRoute>}
    />
    <Route
      path="/stylist/:id"
      element={<ProtectedRoute><StylistProfile /></ProtectedRoute>}
    />
    <Route
      path="/favorites"
      element={<ProtectedRoute allowedRoles={['client', 'admin']}><FavoriteStylistsPage /></ProtectedRoute>}
    />
    <Route
      path="/booking-history"
      element={<ProtectedRoute allowedRoles={['client', 'admin']}><BookingHistoryPage /></ProtectedRoute>}
    />
    <Route
      path="/client-reviews"
      element={<ProtectedRoute allowedRoles={['client', 'admin']}><ClientReviewsPage /></ProtectedRoute>}
    />
    <Route
      path="/payment-methods"
      element={<ProtectedRoute allowedRoles={['client', 'admin']}><PaymentMethodsPage /></ProtectedRoute>}
    />
    <Route
      path="/reviews"
      element={<ProtectedRoute allowedRoles={['client']}><Reviews /></ProtectedRoute>}
    />
    <Route
      path="/reviews/new"
      element={<ProtectedRoute allowedRoles={['client']}><Reviews /></ProtectedRoute>}
    />
    <Route
      path="/client-formulas"
      element={<ProtectedRoute allowedRoles={['client', 'admin']}><ClientFormulas /></ProtectedRoute>}
    />

    {/* Admin Routes */}
    <Route
      path="/admin/security"
      element={<ProtectedRoute allowedRoles={['admin']}><SecurityDashboard /></ProtectedRoute>}
    />
    <Route
      path="/access-codes"
      element={<ProtectedRoute allowedRoles={['admin']}><AccessCodes /></ProtectedRoute>}
    />
    <Route
      path="/app-directory"
      element={<ProtectedRoute allowedRoles={['admin']}><AppDirectory /></ProtectedRoute>}
    />
    <Route
      path="/admin/command"
      element={<ProtectedRoute allowedRoles={['admin']}><AdminCommandCenter /></ProtectedRoute>}
    />
    <Route
      path="/admin/users"
      element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>}
    />
    <Route
      path="/admin/audit-logs"
      element={<ProtectedRoute allowedRoles={['admin']}><AuditLogs /></ProtectedRoute>}
    />
    <Route
      path="/admin/activity"
      element={<ProtectedRoute allowedRoles={['admin']}><ActivityLog /></ProtectedRoute>}
    />
    <Route
      path="/admin/audit-report"
      element={<ProtectedRoute allowedRoles={['admin']}><AuditReport /></ProtectedRoute>}
    />
    <Route
      path="/system-health"
      element={<ProtectedRoute allowedRoles={['admin']}><SystemHealth /></ProtectedRoute>}
    />
    <Route
      path="/design-system"
      element={<ProtectedRoute allowedRoles={['admin']}><DesignSystem /></ProtectedRoute>}
    />

    {/* Error Routes */}
    <Route path="/500" element={<ServerError />} />
    <Route path="*" element={<NotFound />} />
  </>
);
