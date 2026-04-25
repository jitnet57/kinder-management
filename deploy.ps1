# ABA Child Management System - Deployment Script (PowerShell)
# Usage: .\deploy.ps1 -Environment staging -DryRun $true

param(
    [Parameter(Mandatory = $false)]
    [ValidateSet("staging", "production")]
    [string]$Environment = "staging",

    [Parameter(Mandatory = $false)]
    [bool]$DryRun = $false,

    [Parameter(Mandatory = $false)]
    [switch]$Rollback,

    [Parameter(Mandatory = $false)]
    [switch]$Help
)

# Configuration
$ProjectName = "aba-child"
$CurrentDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# Color functions
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Show help
function Show-Help {
    @"
ABA Child Management System - Deployment Script (PowerShell)

Usage: .\deploy.ps1 [Options]

Options:
    -Environment    Target environment (staging, production) - Default: staging
    -DryRun         Run without making actual changes - Default: false
    -Rollback       Rollback to previous deployment
    -Help           Show this help message

Examples:
    .\deploy.ps1 -Environment staging
    .\deploy.ps1 -Environment production -DryRun `$true
    .\deploy.ps1 -Rollback

Environment Variables:
    CLOUDFLARE_API_TOKEN    Your Cloudflare API token
    CLOUDFLARE_ACCOUNT_ID   Your Cloudflare account ID

"@ | Write-Host
}

# Check prerequisites
function Check-Prerequisites {
    Write-Info "Checking prerequisites..."

    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Success "Node.js $nodeVersion found"
    }
    catch {
        Write-Error "Node.js is not installed"
        exit 1
    }

    # Check npm
    try {
        $npmVersion = npm --version
        Write-Success "npm $npmVersion found"
    }
    catch {
        Write-Error "npm is not installed"
        exit 1
    }

    # Check Git
    try {
        $gitVersion = git --version
        Write-Success "Git found"
    }
    catch {
        Write-Error "Git is not installed"
        exit 1
    }

    # Check Wrangler
    if ($Environment -eq "production" -or $Environment -eq "staging") {
        try {
            wrangler whoami | Out-Null
            Write-Success "Wrangler CLI ready"
        }
        catch {
            Write-Warn "Wrangler not authenticated. Run: wrangler login"
        }
    }
}

# Build frontend
function Build-Frontend {
    Write-Info "Building frontend..."

    Push-Location frontend

    Write-Info "Installing frontend dependencies..."
    npm install

    Write-Info "Building for $Environment..."
    npm run build

    Write-Success "Frontend built successfully"
    Pop-Location
}

# Build backend
function Build-Backend {
    Write-Info "Building backend..."

    Push-Location backend

    Write-Info "Installing backend dependencies..."
    npm install

    Write-Info "Compiling TypeScript..."
    npm run build

    Write-Success "Backend built successfully"
    Pop-Location
}

# Validate build
function Validate-Build {
    Write-Info "Validating build outputs..."

    if (-not (Test-Path "frontend/dist")) {
        Write-Error "Frontend dist directory not found"
        exit 1
    }
    Write-Success "Frontend dist directory found"

    if (-not (Test-Path "backend/dist")) {
        Write-Error "Backend dist directory not found"
        exit 1
    }
    Write-Success "Backend dist directory found"

    if (-not (Test-Path "frontend/dist/index.html")) {
        Write-Error "index.html not found"
        exit 1
    }
    Write-Success "index.html found"
}

# Security check
function Security-Check {
    Write-Info "Running security checks..."

    # Check for sensitive files in dist
    $sensitivePatterns = @("BACKUP_PASSWORD", "DATABASE_URL", "JWT_SECRET")
    $foundSensitive = $false

    foreach ($pattern in $sensitivePatterns) {
        $results = Get-ChildItem -Path "frontend/dist" -Recurse | Select-String -Pattern $pattern
        if ($results) {
            Write-Error "Sensitive pattern '$pattern' found in dist!"
            $foundSensitive = $true
        }
    }

    if ($foundSensitive) {
        exit 1
    }

    Write-Success "No sensitive information in build output"

    # Check npm vulnerabilities
    Write-Info "Checking npm vulnerabilities..."
    Push-Location frontend
    npm audit --production
    Pop-Location
}

# Deploy to Cloudflare
function Deploy-Cloudflare {
    Write-Info "Deploying to Cloudflare Pages ($Environment)..."

    if ($DryRun) {
        Write-Warn "DRY RUN - Not actually deploying"
        return
    }

    try {
        wrangler pages deploy frontend/dist --project-name $ProjectName
        Write-Success "Deployment initiated"
    }
    catch {
        Write-Error "Deployment failed: $_"
        exit 1
    }
}

# Post-deployment checks
function Post-Deploy-Checks {
    Write-Info "Running post-deployment checks..."

    if ($DryRun) {
        Write-Warn "DRY RUN - Skipping post-deployment checks"
        return
    }

    Start-Sleep -Seconds 30  # Wait for propagation

    $domain = "aba-child.pages.dev"
    if ($Environment -eq "staging") {
        $domain = "aba-child-staging.pages.dev"
    }

    Write-Info "Checking deployment health..."
    try {
        $response = Invoke-WebRequest -Uri "https://$domain/" -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Success "Health check passed (HTTP $($response.StatusCode))"
        }
    }
    catch {
        Write-Warn "Could not reach deployment: $_"
    }
}

# Record deployment
function Record-Deployment {
    Write-Info "Recording deployment..."

    $logFile = "deployments.log"
    $commitHash = git rev-parse --short HEAD
    $branch = git rev-parse --abbrev-ref HEAD

    $logEntry = "[$CurrentDate] Environment: $Environment | Commit: $commitHash | Branch: $branch"
    Add-Content -Path $logFile -Value $logEntry

    Write-Success "Deployment recorded in $logFile"
}

# Rollback function
function Invoke-Rollback {
    Write-Warn "Rolling back last deployment..."

    try {
        wrangler pages deployment rollback --project-name $ProjectName
        Write-Success "Rollback completed"
    }
    catch {
        Write-Error "Rollback failed: $_"
        exit 1
    }
}

# Main execution
function Main {
    Clear-Host

    Write-Host @"
╔════════════════════════════════════════════════════════════════╗
║   ABA Child Management System - Deployment Script              ║
║   Project: $ProjectName
║   Environment: $Environment
║   Time: $CurrentDate
╚════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Blue

    if ($DryRun) {
        Write-Warn "Running in DRY RUN mode - no changes will be made"
    }

    Write-Host ""

    # Execution flow
    Check-Prerequisites
    Write-Host ""

    Build-Frontend
    Write-Host ""

    Build-Backend
    Write-Host ""

    Validate-Build
    Write-Host ""

    Security-Check
    Write-Host ""

    Deploy-Cloudflare
    Write-Host ""

    Post-Deploy-Checks
    Write-Host ""

    Record-Deployment
    Write-Host ""

    # Success message
    Write-Host @"
╔════════════════════════════════════════════════════════════════╗
║              Deployment Completed Successfully! ✨              ║
║        Live URL: https://aba-child.pages.dev                   ║
╚════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Green
}

# Entry point
if ($Help) {
    Show-Help
    exit 0
}

if ($Rollback) {
    Invoke-Rollback
    exit 0
}

Main
