# ============================================
# CloudWatchX Local Development Stopper
# ============================================

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "        CloudWatchX Local Stopper" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/3] Stopping CloudWatchX application..." -ForegroundColor Yellow

Get-CimInstance Win32_Process |
    Where-Object {
        $_.CommandLine -match "node.*server\.js" -or
        $_.CommandLine -match "vite"
    } |
    ForEach-Object {
        try {
            Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
        }
        catch {}
    }

Write-Host "      Backend and frontend stopped." -ForegroundColor Green

Write-Host "[2/3] Stopping Prometheus port-forward..." -ForegroundColor Yellow

Get-CimInstance Win32_Process |
    Where-Object {
        $_.CommandLine -match "kubectl.*port-forward.*9091:9090"
    } |
    ForEach-Object {
        try {
            Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
        }
        catch {}
    }

Write-Host "      Prometheus port-forward stopped." -ForegroundColor Green

Write-Host "[3/3] Keeping Minikube running..." -ForegroundColor Yellow
Write-Host "      Minikube remains available for faster next startup." -ForegroundColor Green

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "       CloudWatchX has been stopped" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""