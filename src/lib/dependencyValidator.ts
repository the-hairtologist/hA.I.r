/**
 * CEO-Level Dependency Validation System
 * Prevents circular dependencies and import issues
 */

interface DependencyNode {
  path: string;
  imports: string[];
  exports: string[];
}

class DependencyValidator {
  private dependencyGraph: Map<string, DependencyNode> = new Map();
  private validated: boolean = false;

  /**
   * Register a module and its dependencies
   */
  registerModule(path: string, imports: string[], exports: string[] = []): void {
    this.dependencyGraph.set(path, { path, imports, exports });
  }

  /**
   * Detect circular dependencies
   */
  detectCircularDependencies(): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (node: string, path: string[]): void => {
      if (recursionStack.has(node)) {
        // Found a cycle
        const cycleStart = path.indexOf(node);
        cycles.push(path.slice(cycleStart).concat(node));
        return;
      }

      if (visited.has(node)) return;

      visited.add(node);
      recursionStack.add(node);

      const moduleNode = this.dependencyGraph.get(node);
      if (moduleNode) {
        for (const imported of moduleNode.imports) {
          dfs(imported, [...path, node]);
        }
      }

      recursionStack.delete(node);
    };

    for (const [modulePath] of this.dependencyGraph) {
      if (!visited.has(modulePath)) {
        dfs(modulePath, []);
      }
    }

    return cycles;
  }

  /**
   * Validate all dependencies
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for circular dependencies
    const cycles = this.detectCircularDependencies();
    if (cycles.length > 0) {
      cycles.forEach((cycle) => {
        errors.push(`Circular dependency: ${cycle.join(' → ')}`);
      });
    }

    // Check for missing exports
    for (const [modulePath, node] of this.dependencyGraph) {
      for (const imported of node.imports) {
        const importedNode = this.dependencyGraph.get(imported);
        if (!importedNode) {
          errors.push(`Module ${modulePath} imports ${imported} which doesn't exist`);
        }
      }
    }

    this.validated = true;
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get dependency tree for a module
   */
  getDependencyTree(modulePath: string, depth: number = 0, visited: Set<string> = new Set()): string {
    if (visited.has(modulePath) || depth > 10) {
      return `${'  '.repeat(depth)}${modulePath} (circular or max depth)`;
    }

    visited.add(modulePath);
    const node = this.dependencyGraph.get(modulePath);
    
    if (!node) {
      return `${'  '.repeat(depth)}${modulePath} (not found)`;
    }

    let tree = `${'  '.repeat(depth)}${modulePath}`;
    
    if (node.imports.length > 0) {
      tree += '\n' + node.imports
        .map(imp => this.getDependencyTree(imp, depth + 1, new Set(visited)))
        .join('\n');
    }

    return tree;
  }

  /**
   * Export validation report
   */
  getReport(): string {
    const validation = this.validate();
    const totalModules = this.dependencyGraph.size;
    
    let report = '=== Dependency Validation Report ===\n\n';
    report += `Total Modules: ${totalModules}\n`;
    report += `Status: ${validation.valid ? '✅ VALID' : '❌ INVALID'}\n\n`;

    if (!validation.valid) {
      report += 'Errors:\n';
      validation.errors.forEach((error, i) => {
        report += `${i + 1}. ${error}\n`;
      });
    }

    return report;
  }
}

export const dependencyValidator = new DependencyValidator();

/**
 * Auto-register common modules to detect issues early
 */
export function registerCoreModules(): { valid: boolean; errors: string[] } {
  // Register key modules that actually exist
  dependencyValidator.registerModule('src/App.tsx', [
    'src/contexts/EnhancedAuthContext.tsx',
    'src/contexts/SubscriptionContext.tsx',
    'src/routes/index.tsx',
  ]);

  dependencyValidator.registerModule('src/lib/mobileOptimizations.ts', [
    'src/platform/index.ts',
  ]);

  // Validate
  return dependencyValidator.validate();
}
