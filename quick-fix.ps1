# TypeScript Fixes Script
Write-Host "Starting TypeScript fixes..." -ForegroundColor Green

# Fix 1: SystemHealth.tsx
Write-Host "Fixing SystemHealth.tsx..." -ForegroundColor Yellow
$file = "src/pages/SystemHealth.tsx"
if (Test-Path $file) {
    $content = Get-Content $file -Raw
    $content = $content -replace "const \[status, setStatus\] = useState<any>\(null\);", "const [status, setStatus] = useState<SystemStatus | null>(null);"
    $content = $content -replace "import \{ LoadingSpinner \} from ""@/components/LoadingSpinner"";", @"
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface SystemStatus {
  initialized: boolean;
  health: {
    status: 'healthy' | 'degraded' | 'unhealthy';
  };
  errorRecovery: {
    openCircuits: string[];
  };
}
"@
    Set-Content $file $content -Encoding UTF8
    Write-Host " SystemHealth.tsx fixed" -ForegroundColor Green
}

# Fix 2: validation.ts
Write-Host "Fixing validation.ts..." -ForegroundColor Yellow
$file = "src/lib/validation.ts"
if (Test-Path $file) {
    $content = Get-Content $file -Raw
    $content = $content -replace "/\(--\|\\;\|", "/(--|;"
    Set-Content $file $content -Encoding UTF8
    Write-Host " validation.ts fixed" -ForegroundColor Green
}

Write-Host "Basic fixes completed!" -ForegroundColor Green
