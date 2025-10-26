# Additional TypeScript Fixes
Write-Host "Applying additional fixes..." -ForegroundColor Green

# Fix AdminUsers.tsx
Write-Host "Fixing AdminUsers.tsx..." -ForegroundColor Yellow
$file = "src/pages/AdminUsers.tsx"
if (Test-Path $file) {
    $content = Get-Content $file -Raw
    $content = $content -replace "const \[users, setUsers\] = useState<any\[\]>\(\[\]\);", "const [users, setUsers] = useState<AdminUser[]>([]);"
    $content = $content -replace "const \[selectedUser, setSelectedUser\] = useState<any>\(null\);", "const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);"
    $content = $content -replace "\(ur: any\)", "(ur)"
    
    # Add interfaces
    $content = $content -replace "} from ""@/components/ui/select"";", @"
} from "@/components/ui/select";

interface UserRole {
  role: string;
}

interface AdminUser {
  id: string;
  full_name?: string;
  email: string;
  created_at: string;
  user_roles?: UserRole[];
}
"@
    Set-Content $file $content -Encoding UTF8
    Write-Host " AdminUsers.tsx fixed" -ForegroundColor Green
}

# Fix MobileBottomNav.tsx
Write-Host "Fixing MobileBottomNav.tsx..." -ForegroundColor Yellow
$file = "src/components/MobileBottomNav.tsx"
if (Test-Path $file) {
    $content = Get-Content $file -Raw
    $content = $content -replace "icon: any;", "icon: React.ComponentType<{ className?: string }>;"
    Set-Content $file $content -Encoding UTF8
    Write-Host " MobileBottomNav.tsx fixed" -ForegroundColor Green
}

Write-Host "All fixes completed!" -ForegroundColor Green
