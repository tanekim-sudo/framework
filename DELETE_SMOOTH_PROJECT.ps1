# Script to delete Smooth project folder after stopping all processes
# Run this AFTER stopping the backend API server

Write-Host "Deleting Smooth project folder..." -ForegroundColor Yellow
Write-Host "Make sure the backend API server is stopped first!" -ForegroundColor Red
Write-Host ""

$smoothPath = "C:\Users\tanek\Downloads\smoothproto\smoothv1"

if (Test-Path $smoothPath) {
    # Try to stop any Python processes that might be using files
    Write-Host "Checking for running Python processes..." -ForegroundColor Yellow
    $pythonProcs = Get-Process python -ErrorAction SilentlyContinue | Where-Object {
        $_.Path -like "*smoothv1*" -or $_.CommandLine -like "*smoothv1*"
    }
    
    if ($pythonProcs) {
        Write-Host "Found Python processes. Please stop the backend server first." -ForegroundColor Red
        $pythonProcs | Format-Table Id, ProcessName, Path
        Write-Host ""
        Write-Host "Press Ctrl+C to cancel, or close the backend server and run this script again."
        Read-Host "Press Enter to continue anyway (may fail if files are locked)"
    }
    
    Write-Host "Attempting to delete folder..." -ForegroundColor Yellow
    try {
        Remove-Item -Path $smoothPath -Recurse -Force
        Write-Host "✓ Smooth project folder deleted successfully!" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to delete: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "The folder may be in use. Please:" -ForegroundColor Yellow
        Write-Host "1. Stop the backend API server (if running)" -ForegroundColor Yellow
        Write-Host "2. Close any file explorers or editors with files open" -ForegroundColor Yellow
        Write-Host "3. Run this script again" -ForegroundColor Yellow
    }
} else {
    Write-Host "✓ Smooth project folder already deleted or doesn't exist!" -ForegroundColor Green
}

Write-Host ""
Write-Host "All Smooth functionality is now in Framework!" -ForegroundColor Green
Write-Host "Framework location: C:\Users\tanek\Downloads\framework (1)\" -ForegroundColor Cyan

