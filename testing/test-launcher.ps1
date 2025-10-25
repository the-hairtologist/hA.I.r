# PHASE 11: QUICK TEST LAUNCHER
# ============================

Write-Host ""
Write-Host " AI HAIR GENIUS - PHASE 11 TESTING" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Available Test Options:" -ForegroundColor Yellow
Write-Host "1.  Complete User Flow Testing"
Write-Host "2.  Mobile Responsiveness Testing"
Write-Host "3.  Payment System Testing"
Write-Host "4.  Notification Testing"
Write-Host "5.  Performance Testing"
Write-Host "6.  Run ALL Tests"
Write-Host "7.  View Test Report"
Write-Host "0. Exit"
Write-Host ""

do {
    $choice = Read-Host "Select test option (0-7)"
    
    switch ($choice) {
        "1" { 
            Write-Host " Starting User Flow Testing..." -ForegroundColor Green
            & "testing/scripts/phase-11-testing.ps1" -TestType "flow"
        }
        "2" { 
            Write-Host " Starting Mobile Testing..." -ForegroundColor Green
            & "testing/scripts/phase-11-testing.ps1" -TestType "mobile"
        }
        "3" { 
            Write-Host " Starting Payment Testing..." -ForegroundColor Green
            & "testing/scripts/phase-11-testing.ps1" -TestType "payment"
        }
        "4" { 
            Write-Host " Starting Notification Testing..." -ForegroundColor Green
            & "testing/scripts/phase-11-testing.ps1" -TestType "notifications"
        }
        "5" { 
            Write-Host " Starting Performance Testing..." -ForegroundColor Green
            & "testing/scripts/phase-11-testing.ps1" -TestType "performance"
        }
        "6" { 
            Write-Host " Starting ALL Tests..." -ForegroundColor Green
            & "testing/scripts/phase-11-testing.ps1" -TestType "all"
        }
        "7" { 
            if (Test-Path "testing/phase-11-test-report.md") {
                Write-Host " Opening Test Report..." -ForegroundColor Green
                Start-Process "testing/phase-11-test-report.md"
            } else {
                Write-Host " No test report found. Run tests first." -ForegroundColor Red
            }
        }
        "0" { 
            Write-Host " Goodbye!" -ForegroundColor Green
            break
        }
        default { 
            Write-Host " Invalid choice. Please select 0-7." -ForegroundColor Red
        }
    }
    
    if ($choice -ne "0") {
        Write-Host ""
        Read-Host "Press Enter to return to menu"
        Write-Host ""
    }
    
} while ($choice -ne "0")
