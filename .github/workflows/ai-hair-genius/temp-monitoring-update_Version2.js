/**
 * temp-monitoring-update.js
 *
 * Safe, robust updater for src/lib/monitoring.ts:
 * - uses regex-based matching for larger import / function blocks
 * - creates a .bak backup before writing
 * - warns (not throws) when a pattern isn't found
 *
 * Usage from VS Code:
 * - Put this file at the repo root
 * - Configure the VS Code task/launch (see .vscode files below)
 * - Run the task or debug configuration
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src', 'lib', 'monitoring.ts');

if (!fs.existsSync(filePath)) {
  console.error('Target file not found:', filePath);
  process.exitCode = 1;
}

let text = fs.readFileSync(filePath, 'utf8');

const replacements = [
  {
    // Replace grouped imports (Sentry + React types + logger) with desired imports
    old: /import\s+\*\s+as\s+Sentry\s+from\s*['"][^'"]*@sentry\/react[^'"]*['"];?\s*import\s+type\s*\{[^}]*\}\s+from\s*['"][^'"]*react[^'"]*['"];?\s*import\s+\{\s*logger\s*\}\s+from\s*['"][^'"]*[^'"]*['"];?/m,
    newText: `import * as Sentry from '@sentry/react';
import type { ComponentType } from 'react';
import type { Event as SentryEvent, EventHint, Transaction } from '@sentry/types';
import { logger } from '@/lib/logger';`
  },

  {
    // update beforeSend signature to use Sentry types
    old: /beforeSend\s*\(\s*event\s*:\s*any\s*,\s*hint\s*:\s*any\s*\)/,
    newText: 'beforeSend(event: SentryEvent, hint?: EventHint)'
  },

  {
    // change Record<string, any> -> Record<string, unknown> globally
    old: /Record<string,\s*any>/g,
    newText: 'Record<string, unknown>'
  },

  {
    // Replace withSentryRouting implementation with a typed generic version
    old: /export\s+const\s+withSentryRouting\s*=\s*\(\s*component\s*:\s*any\s*\)\s*=>\s*\{\s*if\s*\(\s*!sentryInitialized\s*\)\s*return\s+component;\s*return\s+Sentry\.withSentryRouting\?\.\(component\)\s*\|\|\s*component;\s*};?/m,
    newText: `export const withSentryRouting = <T extends ComponentType<unknown>>(component: T): T => {
  if (!sentryInitialized || !Sentry.withSentryRouting) {
    return component;
  }

  return (Sentry.withSentryRouting(component) as unknown) as T;
};`
  },

  {
    // Replace startTransaction implementation with a typed version that uses the current hub
    old: /export\s+const\s+startTransaction\s*=\s*\(\s*name\s*:\s*string\s*,\s*operation\s*:\s*string\s*\)\s*=>\s*\{\s*if\s*\(\s*!sentryInitialized\s*\)\s*return\s+null;\s*[\s\S]*?\};/m,
    newText: `export const startTransaction = (name: string, operation: string): Transaction | null => {
  if (!sentryInitialized) {
    return null;
  }

  const transaction = Sentry.getCurrentHub().startTransaction({ name, op: operation });
  return transaction ?? null;
};`
  }
];

// create backup
const backupPath = filePath + '.bak';
fs.writeFileSync(backupPath, text, 'utf8');
console.log('Backup created at:', backupPath);

// apply replacements
replacements.forEach(({ old, newText }) => {
  if (old instanceof RegExp) {
    if (!old.test(text)) {
      console.warn('Pattern not found (regex):', String(old));
      return;
    }
    text = text.replace(old, newText);
  } else {
    if (!text.includes(old)) {
      console.warn('Pattern not found (string):', old);
      return;
    }
    text = text.replace(old, newText);
  }
});

fs.writeFileSync(filePath, text, 'utf8');
console.log('File updated:', filePath);