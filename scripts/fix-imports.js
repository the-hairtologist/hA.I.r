#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const replacements = [
  // Layout components
  [/@\/components\/DashboardLayout/g, '@/components/layout'],
  [/@\/components\/PageHeader/g, '@/components/layout'],
  [/@\/components\/AppSidebar/g, '@/components/layout'],
  [/@\/components\/MobileBottomNav/g, '@/components/layout'],
  [/@\/components\/MobileHeader/g, '@/components/layout'],
  
  // Shared components
  [/@\/components\/EmptyState/g, '@/components/shared'],
  [/@\/components\/Breadcrumbs/g, '@/components/shared'],
  [/@\/components\/HelpTooltip/g, '@/components/shared'],
  [/@\/components\/HelpButton/g, '@/components/shared'],
  [/@\/components\/BottomSheet/g, '@/components/shared'],
  [/@\/components\/SaveIndicator/g, '@/components/shared'],
  [/@\/components\/OfflineIndicator/g, '@/components/shared'],
  [/@\/components\/BugReporter/g, '@/components/shared'],
  [/@\/components\/CelebrationAnimation/g, '@/components/shared'],
  [/@\/components\/InteractiveCard/g, '@/components/shared'],
  [/@\/components\/NotificationDot/g, '@/components/shared'],
  [/@\/components\/HelpfulEmptyState/g, '@/components/shared'],
  
  // Client components
  [/@\/components\/AddClientDialog/g, '@/components/clients'],
  [/@\/components\/ClientCard/g, '@/components/clients'],
  [/@\/components\/ClientHistoryTimeline/g, '@/components/clients'],
  [/@\/components\/ClientCSVImport/g, '@/components/clients'],
  [/@\/components\/ClientRiskIndicator/g, '@/components/clients'],
  [/@\/components\/ClientActivityIndicator/g, '@/components/clients'],
  [/@\/components\/InviteClientDialog/g, '@/components/clients'],
  [/@\/components\/ReEngagementDialog/g, '@/components/clients'],
  [/@\/components\/PredictiveClientInsights/g, '@/components/clients'],
];

async function main() {
  const files = await glob('src/**/*.{ts,tsx}', { ignore: 'node_modules/**' });
  
  let totalChanges = 0;
  
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    
    for (const [pattern, replacement] of replacements) {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        changed = true;
      }
    }
    
    if (changed) {
      fs.writeFileSync(file, content, 'utf8');
      totalChanges++;
    }
  }
  
  console.log(`✅ Updated ${totalChanges} files`);
}

main().catch(console.error);
