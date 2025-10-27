const fs = require('fs');
const path = 'c:/Users/tomto/OneDrive/Documents/GitHub/ai-hair-genius/src/lib/monitoring.ts';
let text = fs.readFileSync(path, 'utf8');

const replacements = [
  {
    old: import * as Sentry from " @sentry/react\;
import type { ReactNode } from 'react';
import { logger } from '@/lib/logger';,
 new: import * as Sentry from \@sentry/react\;
import type { ComponentType } from 'react';
import type { Event as SentryEvent, EventHint, Transaction } from \@sentry/types\;
import { logger } from '@/lib/logger';
 },
 { old: 'beforeSend(event: any, hint: any)', new: 'beforeSend(event: SentryEvent, hint?: EventHint)' },
 { old: /Record<string, any>/g, new: 'Record<string, unknown>' },
 {
 old: export const withSentryRouting = (component: any) => {
 if (!sentryInitialized) return component;
 return Sentry.withSentryRouting?.(component) || component;
};,
 new: export const withSentryRouting = <T extends ComponentType<unknown>>(component: T): T => {
 if (!sentryInitialized || !Sentry.withSentryRouting) {
 return component;
 }

 return Sentry.withSentryRouting(component) as T;
};
 },
 {
 old: export const startTransaction = (name: string, operation: string) => {
 if (!sentryInitialized) return null;

 return Sentry.startSpan({ name, op: operation }, (span) => span);
};,
 new: export const startTransaction = (name: string, operation: string): Transaction | null => {
 if (!sentryInitialized) {
 return null;
 }

 const transaction = Sentry.getCurrentHub().startTransaction({ name, op: operation });
 return transaction ?? null;
};
 }
];

replacements.forEach(({ old, new: replacement }) => {
 if (old instanceof RegExp) {
 text = text.replace(old, replacement);
 } else {
 if (!text.includes(old)) {
 throw new Error(Pattern not found:\n);
 }
 text = text.replace(old, replacement);
 }
});

fs.writeFileSync(path, text, 'utf8');
