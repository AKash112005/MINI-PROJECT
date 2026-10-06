# ============================================
# CloudWatchX Local Development Launcher
# ============================================

$ProjectRoot = "D:\My projects\Mini Project 2"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "        CloudWatchX Local Launcher" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# --------------------------------------------
# Step 1 - Check Docker
# --------------------------------------------

Write-Host "[1/6] Checking Docker Desktop..." -ForegroundColor Yellow

try {
    docker info | Out-Null

    if ($LASTEXITCODE -ne 0) {
        throw "Docker is not running"
    }

    Write-Host "      Docker is running." -ForegroundColor Green
}
catch {
    Write-Host ""
    Write-Host "Docker Desktop is not running." -ForegroundColor Red
    Write-Host "Please open Docker Desktop and try again." -ForegroundColor Red
    Write-Host ""
    exit 1
}

# --------------------------------------------
# Step 2 - Start / Check Minikube
# --------------------------------------------

Write-Host "[2/6] Checking Minikube..." -ForegroundColor Yellow

$minikubeStatus = minikube status --output=json 2>$null

if ($LASTEXITCODE -ne 0) {

    Write-Host "      Starting Minikube..." -ForegroundColor Yellow

    minikube start --driver=docker

    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "Failed to start Minikube." -ForegroundColor Red
        exit 1
    }

}
else {

    $statusObject = $minikubeStatus | ConvertFrom-Json

    if ($statusObject.Host -ne "Running") {

        Write-Host "      Minikube is stopped. Starting..." -ForegroundColor Yellow

        minikube start --driver=docker

        if ($LASTEXITCODE -ne 0) {
            Write-Host ""
            Write-Host "Failed to start Minikube." -ForegroundColor Red
            exit 1
        }

    }
    else {

        Write-Host "      Minikube is already running." -ForegroundColor Green

    }
}

# --------------------------------------------
# Step 3 - Check Prometheus Pod
# --------------------------------------------

Write-Host "[3/6] Checking Prometheus..." -ForegroundColor Yellow

$prometheusPod = kubectl get pods `
    -n monitoring `
    -l app=prometheus `
    -o jsonpath="{.items[0].status.phase}" 2>$null

if ($prometheusPod -ne "Running") {

    Write-Host "      Prometheus is not running." -ForegroundColor Red
    Write-Host "      Checking monitoring namespace..." -ForegroundColor Yellow

    kubectl get pods -n monitoring

    Write-Host ""
    Write-Host "Please verify the Prometheus deployment." -ForegroundColor Red
    exit 1
}

Write-Host "      Prometheus is running." -ForegroundColor Green

# --------------------------------------------
# Step 4 - Start Prometheus Port Forward
# --------------------------------------------

Write-Host "[4/6] Checking Prometheus port-forward..." -ForegroundColor Yellow

$prometheusReady = $false

try {

    $response = Invoke-WebRequest `
        -Uri "http://127.0.0.1:9091/-/ready" `
        -UseBasicParsing `
        -TimeoutSec 2

    if ($response.StatusCode -eq 200) {
        $prometheusReady = $true
    }

}
catch {
    $prometheusReady = $false
}

if ($prometheusReady) {

    Write-Host "      Prometheus port-forward already active." -ForegroundColor Green

}
else {

    Write-Host "      Starting Prometheus port-forward..." -ForegroundColor Yellow

    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "kubectl port-forward -n monitoring svc/prometheus 9091:9090"
    )

    Write-Host "      Waiting for Prometheus..." -ForegroundColor Yellow

    $ready = $false

    for ($i = 1; $i -le 20; $i++) {

        Start-Sleep -Seconds 1

        try {

            $response = Invoke-WebRequest `
                -Uri "http://127.0.0.1:9091/-/ready" `
                -UseBasicParsing `
                -TimeoutSec 2

            if ($response.StatusCode -eq 200) {
                $ready = $true
                break
            }

        }
        catch {
        }
    }

    if (-not $ready) {

        Write-Host ""
        Write-Host "Prometheus port-forward failed." -ForegroundColor Red
        exit 1
    }

    Write-Host "      Prometheus is ready." -ForegroundColor Green
}

# --------------------------------------------
# Step 5 - Start Backend
# --------------------------------------------

Write-Host "[5/6] Starting CloudWatchX backend..." -ForegroundColor Yellow

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$ProjectRoot\backend'; npm run dev"
)

Write-Host "      Backend terminal opened." -ForegroundColor Green

# --------------------------------------------
# Step 6 - Start Frontend
# --------------------------------------------

Write-Host "[6/6] Starting CloudWatchX frontend..." -ForegroundColor Yellow

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$ProjectRoot\frontend'; npm run dev"
)

Write-Host "      Frontend terminal opened." -ForegroundColor Green

# --------------------------------------------
# Final
# --------------------------------------------

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "       CloudWatchX is starting..." -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""

Write-Host "Prometheus : http://127.0.0.1:9091" -ForegroundColor Cyan
Write-Host "Backend    : http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend   : http://localhost:5173" -ForegroundColor Cyan

Write-Host ""
Write-Host "Backend and Frontend are running in separate terminals." -ForegroundColor Gray
Write-Host ""