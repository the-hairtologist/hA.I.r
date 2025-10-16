/**
 * Data Integrity Checker
 * 
 * Validates data consistency, detects corruption, and auto-repairs issues.
 */

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from '@/lib/logger';

interface IntegrityIssue {
  table: string;
  recordId: string;
  issueType: 'missing_required' | 'invalid_format' | 'broken_reference' | 'duplicate';
  field: string;
  currentValue: any;
  expectedValue?: any;
  autoFixable: boolean;
}

class DataIntegrityChecker {
  private readonly VALIDATION_RULES = {
    profiles: [
      { field: 'email', required: true, format: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
      { field: 'full_name', required: false, maxLength: 255 },
    ],
    stylist_profiles: [
      { field: 'business_name', required: true, maxLength: 255 },
      { field: 'user_id', required: true, type: 'uuid' },
    ],
    client_profiles: [
      { field: 'full_name', required: true, maxLength: 255 },
      { field: 'user_id', required: true, type: 'uuid' },
      { field: 'email', required: true, format: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    ],
    appointments: [
      { field: 'stylist_id', required: true, type: 'uuid' },
      { field: 'client_id', required: true, type: 'uuid' },
      { field: 'appointment_date', required: true, type: 'timestamp' },
      { field: 'status', required: true, enum: ['scheduled', 'completed', 'cancelled', 'no_show'] },
    ],
  };

  /**
   * Run full integrity check
   */
  async runFullCheck(): Promise<IntegrityIssue[]> {
    // Check if user is authenticated before running checks
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      logger.debug('Skipping data integrity check - user not authenticated');
      return [];
    }

    logger.info('Starting full data integrity check');
    const issues: IntegrityIssue[] = [];

    for (const [table, rules] of Object.entries(this.VALIDATION_RULES)) {
      try {
        const tableIssues = await this.checkTable(table, rules);
        issues.push(...tableIssues);
      } catch (error) {
        logger.error(`Failed to check table ${table}`, 'DataIntegrityChecker', error);
      }
    }

    logger.info(`Integrity check complete: ${issues.length} issues found`);
    
    // Don't show toast to users - this is a background system check
    // Issues are logged and can be viewed in admin tools

    return issues;
  }

  /**
   * Check specific table
   */
  private async checkTable(table: string, rules: any[]): Promise<IntegrityIssue[]> {
    const issues: IntegrityIssue[] = [];

    try {
      const { data: records, error } = await (supabase as any)
        .from(table)
        .select('*')
        .limit(1000);

      if (error) {
        // Permission denied errors are expected for RLS-protected tables when not authenticated
        if (error.code === '42501') {
          logger.info(`Skipping ${table} check - RLS protected (expected)`, 'DataIntegrityChecker');
          return issues;
        }
        logger.error(`Error fetching ${table}`, 'DataIntegrityChecker', error);
        return issues;
      }

      if (!records) return issues;

      for (const record of records) {
        for (const rule of rules) {
          const issue = this.validateField(table, record, rule);
          if (issue) {
            issues.push(issue);
          }
        }
      }
    } catch (error) {
      logger.error(`Error checking table ${table}`, 'DataIntegrityChecker', error);
    }

    return issues;
  }

  /**
   * Validate individual field
   */
  private validateField(table: string, record: any, rule: any): IntegrityIssue | null {
    const value = record[rule.field];

    // Required check
    if (rule.required && (value === null || value === undefined || value === '')) {
      return {
        table,
        recordId: record.id,
        issueType: 'missing_required',
        field: rule.field,
        currentValue: value,
        autoFixable: false,
      };
    }

    // Format check
    if (value && rule.format && !rule.format.test(String(value))) {
      return {
        table,
        recordId: record.id,
        issueType: 'invalid_format',
        field: rule.field,
        currentValue: value,
        autoFixable: false,
      };
    }

    // Enum check
    if (value && rule.enum && !rule.enum.includes(value)) {
      return {
        table,
        recordId: record.id,
        issueType: 'invalid_format',
        field: rule.field,
        currentValue: value,
        expectedValue: rule.enum[0],
        autoFixable: true,
      };
    }

    // Length check
    if (value && rule.maxLength && String(value).length > rule.maxLength) {
      return {
        table,
        recordId: record.id,
        issueType: 'invalid_format',
        field: rule.field,
        currentValue: value,
        autoFixable: false,
      };
    }

    return null;
  }

  /**
   * Auto-fix issues where possible
   */
  async autoFix(issues: IntegrityIssue[]): Promise<number> {
    let fixedCount = 0;
    const fixableIssues = issues.filter(issue => issue.autoFixable);

    logger.info(`Attempting to fix ${fixableIssues.length} issues`);

    for (const issue of fixableIssues) {
      try {
        const success = await this.fixIssue(issue);
        if (success) {
          fixedCount++;
        }
      } catch (error) {
        logger.error(`Failed to fix issue in ${issue.table}`, 'DataIntegrityChecker', error);
      }
    }

    logger.info(`Auto-fixed ${fixedCount} issues`);
    
    if (fixedCount > 0) {
      toast.success(`Auto-fixed ${fixedCount} data issues`);
    }

    return fixedCount;
  }

  /**
   * Fix individual issue
   */
  private async fixIssue(issue: IntegrityIssue): Promise<boolean> {
    if (!issue.autoFixable || !issue.expectedValue) {
      return false;
    }

    try {
      const { error } = await (supabase as any)
        .from(issue.table)
        .update({ [issue.field]: issue.expectedValue })
        .eq('id', issue.recordId);

      if (error) {
        logger.error(`Failed to fix ${issue.table}.${issue.field}`, 'DataIntegrityChecker', error);
        return false;
      }

      logger.info(`Fixed ${issue.table}.${issue.field} for record ${issue.recordId}`);
      return true;
    } catch (error) {
      logger.error(`Exception fixing ${issue.table}`, 'DataIntegrityChecker', error);
      return false;
    }
  }

  /**
   * Check for orphaned records
   */
  async checkOrphanedRecords(): Promise<IntegrityIssue[]> {
    const issues: IntegrityIssue[] = [];

    try {
      // Check appointments with missing clients
      const { data: orphanedAppointments } = await supabase
        .from('appointments')
        .select('id, client_id')
        .is('client_profiles.id', null);

      if (orphanedAppointments) {
        orphanedAppointments.forEach(apt => {
          issues.push({
            table: 'appointments',
            recordId: apt.id,
            issueType: 'broken_reference',
            field: 'client_id',
            currentValue: apt.client_id,
            autoFixable: false,
          });
        });
      }

      // Check formulas with missing clients
      const { data: orphanedFormulas } = await supabase
        .from('formulas')
        .select('id, client_id')
        .is('client_profiles.id', null);

      if (orphanedFormulas) {
        orphanedFormulas.forEach(formula => {
          issues.push({
            table: 'formulas',
            recordId: formula.id,
            issueType: 'broken_reference',
            field: 'client_id',
            currentValue: formula.client_id,
            autoFixable: false,
          });
        });
      }
    } catch (error) {
      logger.error('Failed to check orphaned records', 'DataIntegrityChecker', error);
    }

    return issues;
  }

  /**
   * Check for duplicate records
   */
  async checkDuplicates(table: string, uniqueFields: string[]): Promise<IntegrityIssue[]> {
    const issues: IntegrityIssue[] = [];

    try {
      const { data: records } = await (supabase as any).from(table).select('*');

      if (!records) return issues;

      const seen = new Map<string, string>();

      for (const record of records) {
        const key = uniqueFields.map(field => record[field]).join('|');
        
        if (seen.has(key)) {
          issues.push({
            table,
            recordId: record.id,
            issueType: 'duplicate',
            field: uniqueFields.join('+'),
            currentValue: key,
            autoFixable: false,
          });
        } else {
          seen.set(key, record.id);
        }
      }
    } catch (error) {
      logger.error(`Failed to check duplicates in ${table}`, 'DataIntegrityChecker', error);
    }

    return issues;
  }

  /**
   * Generate integrity report
   */
  async generateReport(): Promise<string> {
    const issues = await this.runFullCheck();
    const orphans = await this.checkOrphanedRecords();
    
    const allIssues = [...issues, ...orphans];
    const fixableCount = allIssues.filter(i => i.autoFixable).length;

    return `
Data Integrity Report
Generated: ${new Date().toISOString()}

Total Issues: ${allIssues.length}
Auto-fixable: ${fixableCount}
Critical: ${allIssues.filter(i => i.issueType === 'broken_reference').length}

Issues by Type:
- Missing Required Fields: ${allIssues.filter(i => i.issueType === 'missing_required').length}
- Invalid Format: ${allIssues.filter(i => i.issueType === 'invalid_format').length}
- Broken References: ${allIssues.filter(i => i.issueType === 'broken_reference').length}
- Duplicates: ${allIssues.filter(i => i.issueType === 'duplicate').length}

Issues by Table:
${this.groupByTable(allIssues)}
    `.trim();
  }

  private groupByTable(issues: IntegrityIssue[]): string {
    const grouped = issues.reduce((acc, issue) => {
      acc[issue.table] = (acc[issue.table] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return Object.entries(grouped)
      .map(([table, count]) => `- ${table}: ${count}`)
      .join('\n');
  }
}

// Singleton instance
export const dataIntegrity = new DataIntegrityChecker();
