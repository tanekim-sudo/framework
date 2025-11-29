# Fix Refresh Icon - PowerShell Script
# Run this script to fix the Refresh icon import issue

Write-Host "Step 1: Checking current file content..." -ForegroundColor Cyan
Select-String -Path "pages/Outputs.tsx" -Pattern "Refresh" -Context 1

Write-Host "`nStep 2: Staging the file..." -ForegroundColor Cyan
git add pages/Outputs.tsx

Write-Host "`nStep 3: Committing the fix..." -ForegroundColor Cyan
git commit -m "fix: replace Refresh with RefreshCw icon"

Write-Host "`nStep 4: Pushing to remote..." -ForegroundColor Cyan
git push

Write-Host "`nStep 5: Showing latest commit..." -ForegroundColor Cyan
git log -1

Write-Host "`nDone! Vercel should now rebuild with the fix." -ForegroundColor Green

