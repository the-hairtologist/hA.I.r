import * as fs from 'fs';
import * as path from 'path';

// Map of old import paths to new ones
const importMappings: Record<string, string> = {
  // Layout components
  "@/components/DashboardLayout": "@/components/layout",
  "@/components/PageHeader": "@/components/layout",
  "@/components/AppSidebar": "@/components/layout",
  "@/components/MobileBottomNav": "@/components/layout",
  "@/components/MobileHeader": "@/components/layout",
  
  // Shared components
  "@/components/EmptyState": "@/components/shared",
  "@/components/Breadcrumbs": "@/components/shared",
  "@/components/HelpTooltip": "@/components/shared",
  "@/components/HelpButton": "@/components/shared",
  "@/components/BottomSheet": "@/components/shared",
  "@/components/SaveIndicator": "@/components/shared",
  "@/components/OfflineIndicator": "@/components/shared",
  "@/components/BugReporter": "@/components/shared",
  "@/components/CelebrationAnimation": "@/components/shared",
  "@/components/InteractiveCard": "@/components/shared",
  "@/components/NotificationDot": "@/components/shared",
  "@/components/HelpfulEmptyState": "@/components/shared",
  
  // Client components
  "@/components/AddClientDialog": "@/components/clients",
  "@/components/ClientCard": "@/components/clients",
  "@/components/ClientHistoryTimeline": "@/components/clients",
  "@/components/ClientCSVImport": "@/components/clients",
  "@/components/ClientRiskIndicator": "@/components/clients",
  "@/components/ClientActivityIndicator": "@/components/clients",
  "@/components/InviteClientDialog": "@/components/clients",
  "@/components/ReEngagementDialog": "@/components/clients",
  "@/components/PredictiveClientInsights": "@/components/clients",
};

function updateImportsInFile(filePath: string): boolean {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  for (const [oldPath, newPath] of Object.entries(importMappings)) {
    const regex = new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    if (regex.test(content)) {
      content = content.replace(regex, newPath);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  }
  return false;
}

function walkDirectory(dir: string): string[] {
  const files: string[] = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && item !== 'node_modules' && item !== '.git') {
      files.push(...walkDirectory(fullPath));
    } else if (stat.isFile() && (item.endsWith('.tsx') || item.endsWith('.ts'))) {
      files.push(fullPath);
    }
  }

  return files;
}

// Main execution
const srcDir = path.join(process.cwd(), 'src');
const files = walkDirectory(srcDir);
let updatedCount = 0;

for (const file of files) {
  if (updateImportsInFile(file)) {
    updatedCount++;
    console.log(`✓ Updated: ${path.relative(process.cwd(), file)}`);
  }
}

console.log(`\n✅ Migration complete! Updated ${updatedCount} files.`);
