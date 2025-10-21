#!/bin/bash
# Bulk import path updater for Phase 2 component reorganization

echo "Updating component imports across codebase..."

# Update layout components
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i \
  -e "s|from ['\"]@/components/DashboardLayout['\"]|from '@/components/layout'|g" \
  -e "s|from ['\"]@/components/PageHeader['\"]|from '@/components/layout'|g" \
  -e "s|from ['\"]@/components/AppSidebar['\"]|from '@/components/layout'|g" \
  -e "s|from ['\"]@/components/MobileBottomNav['\"]|from '@/components/layout'|g" \
  -e "s|from ['\"]@/components/MobileHeader['\"]|from '@/components/layout'|g" \
  {} \;

# Update shared components  
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i \
  -e "s|from ['\"]@/components/EmptyState['\"]|from '@/components/shared'|g" \
  -e "s|from ['\"]@/components/Breadcrumbs['\"]|from '@/components/shared'|g" \
  -e "s|from ['\"]@/components/HelpTooltip['\"]|from '@/components/shared'|g" \
  -e "s|from ['\"]@/components/HelpButton['\"]|from '@/components/shared'|g" \
  -e "s|from ['\"]@/components/BottomSheet['\"]|from '@/components/shared'|g" \
  -e "s|from ['\"]@/components/SaveIndicator['\"]|from '@/components/shared'|g" \
  -e "s|from ['\"]@/components/OfflineIndicator['\"]|from '@/components/shared'|g" \
  -e "s|from ['\"]@/components/BugReporter['\"]|from '@/components/shared'|g" \
  -e "s|from ['\"]@/components/CelebrationAnimation['\"]|from '@/components/shared'|g" \
  -e "s|from ['\"]@/components/InteractiveCard['\"]|from '@/components/shared'|g" \
  {} \;

# Update client components
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i \
  -e "s|from ['\"]@/components/AddClientDialog['\"]|from '@/components/clients'|g" \
  -e "s|from ['\"]@/components/ClientCard['\"]|from '@/components/clients'|g" \
  -e "s|from ['\"]@/components/ClientHistoryTimeline['\"]|from '@/components/clients'|g" \
  -e "s|from ['\"]@/components/ClientCSVImport['\"]|from '@/components/clients'|g" \
  -e "s|from ['\"]@/components/ClientRiskIndicator['\"]|from '@/components/clients'|g" \
  -e "s|from ['\"]@/components/ClientActivityIndicator['\"]|from '@/components/clients'|g" \
  -e "s|from ['\"]@/components/InviteClientDialog['\"]|from '@/components/clients'|g" \
  -e "s|from ['\"]@/components/ReEngagementDialog['\"]|from '@/components/clients'|g" \
  -e "s|from ['\"]@/components/PredictiveClientInsights['\"]|from '@/components/clients'|g" \
  {} \;

echo "✅ Import paths updated successfully!"
