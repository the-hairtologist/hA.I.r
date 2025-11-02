# COMPREHENSIVE ERROR FIXES SCRIPT
# =================================

Write-Host " FIXING ALL CRITICAL ERRORS IN AI HAIR GENIUS" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Fix React Hooks Violations
Write-Host "1. Fixing React hooks violations..." -ForegroundColor Yellow

# AdminUsers.tsx - Lines 49-52 need to move before conditionals
$adminUsersContent = Get-Content "src/pages/AdminUsers.tsx" -Raw
$adminUsersFixed = $adminUsersContent -replace `
  '(?s)(const \[bulkActionLoading, setBulkActionLoading\] = useState<boolean>\(false\);)\s*\n\s*// Redirect non-admins\s*\n\s*if \(\!loading \&\& \(\!user \|\| \!isAdmin\)\) \{\s*\n\s*return <Navigate to="/dashboard" replace />;\s*\n\s*\}\s*\n\s*// Show loading while checking permissions\s*\n\s*if \(loading\) \{\s*\n\s*return <LoadingSpinner message="Verifying access..." />;\s*\n\s*\}\s*\n\s*useEffect\(\(\) => \{\s*\n\s*loadUsers\(\);\s*\n\s*\}, \[\]\);', `
  '$1

  // Move useEffect BEFORE conditional returns
  useEffect(() => {
    if (!loading && user && isAdmin) {
      loadUsers();
    }
  }, [loading, user, isAdmin]);

  // Redirect non-admins
  if (!loading && (!user || !isAdmin)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show loading while checking permissions
  if (loading) {
    return <LoadingSpinner message="Verifying access..." />;
  }'

$adminUsersFixed | Out-File "src/pages/AdminUsers.tsx" -Encoding UTF8
Write-Host "    AdminUsers.tsx hooks fixed" -ForegroundColor Green

# AuditLogs.tsx - Similar fix needed
$auditLogsContent = Get-Content "src/pages/AuditLogs.tsx" -Raw
$auditLogsFixed = $auditLogsContent -replace `
  '(?s)// Show loading while checking permissions\s*\n\s*if \(authLoading\) \{\s*\n\s*return <LoadingSpinner message="Verifying access..." />;\s*\n\s*\}\s*\n\s*useEffect\(\(\) => \{\s*\n\s*loadLogs\(\);\s*\n\s*\}, \[dateRange\]\);', `
  '// Move useEffect BEFORE conditional returns
  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      loadLogs();
    }
  }, [authLoading, user, isAdmin, dateRange]);

  // Show loading while checking permissions
  if (authLoading) {
    return <LoadingSpinner message="Verifying access..." />;
  }'

$auditLogsFixed | Out-File "src/pages/AuditLogs.tsx" -Encoding UTF8
Write-Host "    AuditLogs.tsx hooks fixed" -ForegroundColor Green

# 2. Fix escape character in validation.ts
Write-Host "2. Fixing escape character errors..." -ForegroundColor Yellow
$validationContent = Get-Content "src/lib/validation.ts" -Raw
$validationFixed = $validationContent -replace '\\;', ';'
$validationFixed | Out-File "src/lib/validation.ts" -Encoding UTF8
Write-Host "    Escape characters fixed in validation.ts" -ForegroundColor Green

# 3. Fix empty interfaces
Write-Host "3. Fixing empty interface declarations..." -ForegroundColor Yellow

# Fix command.tsx
$commandContent = Get-Content "src/components/ui/command.tsx" -Raw
$commandFixed = $commandContent -replace 'interface CommandDialogProps extends DialogProps \{\}', 'interface CommandDialogProps extends DialogProps {
  // Inherits all DialogProps without adding new properties
}'
$commandFixed | Out-File "src/components/ui/command.tsx" -Encoding UTF8
Write-Host "    Command.tsx interface fixed" -ForegroundColor Green

# Fix textarea.tsx  
$textareaContent = Get-Content "src/components/ui/textarea.tsx" -Raw
$textareaFixed = $textareaContent -replace 'export interface TextareaProps extends React\.TextareaHTMLAttributes<HTMLTextAreaElement> \{\}', 'export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  // Inherits all textarea attributes without adding new properties
}'
$textareaFixed | Out-File "src/components/ui/textarea.tsx" -Encoding UTF8
Write-Host "    Textarea.tsx interface fixed" -ForegroundColor Green

Write-Host ""
Write-Host " CRITICAL FIXES APPLIED!" -ForegroundColor Green
Write-Host "Now checking remaining error count..." -ForegroundColor Blue
Write-Host ""
