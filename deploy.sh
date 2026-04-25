#!/bin/bash

# ABA Child Management System - Deployment Script
# Usage: ./deploy.sh [environment] [options]

set -e

ENVIRONMENT=${1:-staging}
DRY_RUN=${2:-false}
CURRENT_DATE=$(date '+%Y-%m-%d %H:%M:%S')
PROJECT_NAME="aba-child"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Validation functions
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    log_success "Node.js $(node --version) found"

    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    log_success "npm $(npm --version) found"

    # Check Git
    if ! command -v git &> /dev/null; then
        log_error "Git is not installed"
        exit 1
    fi
    log_success "Git $(git --version | cut -d' ' -f3) found"

    # Check Wrangler for Cloudflare deployment
    if [ "$ENVIRONMENT" = "production" ] || [ "$ENVIRONMENT" = "staging" ]; then
        if ! command -v wrangler &> /dev/null; then
            log_warn "Wrangler (Cloudflare CLI) not found. Installing..."
            npm install -g @cloudflare/wrangler
        fi
        log_success "Wrangler CLI ready"
    fi
}

# Build frontend
build_frontend() {
    log_info "Building frontend..."

    cd frontend

    # Install dependencies
    log_info "Installing frontend dependencies..."
    npm install

    # Build
    log_info "Building for $ENVIRONMENT..."
    if [ "$ENVIRONMENT" = "production" ]; then
        npm run build
    else
        npm run build
    fi

    log_success "Frontend built successfully"
    cd ..
}

# Build backend
build_backend() {
    log_info "Building backend..."

    cd backend

    # Install dependencies
    log_info "Installing backend dependencies..."
    npm install

    # Build
    log_info "Compiling TypeScript..."
    npm run build

    log_success "Backend built successfully"
    cd ..
}

# Validate build
validate_build() {
    log_info "Validating build outputs..."

    # Check frontend dist
    if [ ! -d "frontend/dist" ]; then
        log_error "Frontend dist directory not found"
        exit 1
    fi
    log_success "Frontend dist directory found ($(du -sh frontend/dist | cut -f1))"

    # Check backend dist
    if [ ! -d "backend/dist" ]; then
        log_error "Backend dist directory not found"
        exit 1
    fi
    log_success "Backend dist directory found"

    # Check index.html
    if [ ! -f "frontend/dist/index.html" ]; then
        log_error "index.html not found in frontend/dist"
        exit 1
    fi
    log_success "index.html found"
}

# Security checks
security_check() {
    log_info "Running security checks..."

    # Check for sensitive files
    if grep -r "BACKUP_PASSWORD\|DATABASE_URL\|JWT_SECRET" frontend/dist/ 2>/dev/null; then
        log_error "Sensitive information found in build output!"
        exit 1
    fi
    log_success "No sensitive information in build output"

    # Check npm vulnerabilities
    log_info "Checking npm vulnerabilities..."
    cd frontend
    npm audit --production || log_warn "Some vulnerabilities found (non-critical)"
    cd ..
}

# Deploy to Cloudflare Pages
deploy_cloudflare() {
    log_info "Deploying to Cloudflare Pages ($ENVIRONMENT)..."

    if [ "$DRY_RUN" = "true" ]; then
        log_warn "DRY RUN - Not actually deploying"
        return
    fi

    # Check Cloudflare auth
    if ! wrangler whoami &> /dev/null; then
        log_error "Not authenticated with Cloudflare. Run: wrangler login"
        exit 1
    fi

    log_info "Starting deployment..."
    wrangler pages deploy frontend/dist --project-name $PROJECT_NAME

    log_success "Deployment initiated"
}

# Post-deployment checks
post_deploy_checks() {
    log_info "Running post-deployment checks..."

    if [ "$DRY_RUN" = "true" ]; then
        log_warn "DRY RUN - Skipping post-deployment checks"
        return
    fi

    sleep 30  # Wait for deployment to propagate

    # Health check
    log_info "Checking deployment health..."
    if command -v curl &> /dev/null; then
        DOMAIN="aba-child.pages.dev"
        if [ "$ENVIRONMENT" = "staging" ]; then
            DOMAIN="aba-child-staging.pages.dev"
        fi

        RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/")
        if [ "$RESPONSE" = "200" ]; then
            log_success "Health check passed (HTTP $RESPONSE)"
        else
            log_warn "Unexpected response code: $RESPONSE"
        fi
    fi

    log_success "Post-deployment checks completed"
}

# Create deployment record
record_deployment() {
    log_info "Recording deployment..."

    DEPLOYMENT_LOG="deployments.log"
    COMMIT_HASH=$(git rev-parse --short HEAD)
    BRANCH=$(git rev-parse --abbrev-ref HEAD)

    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Environment: $ENVIRONMENT | Commit: $COMMIT_HASH | Branch: $BRANCH" >> "$DEPLOYMENT_LOG"

    log_success "Deployment recorded in $DEPLOYMENT_LOG"
}

# Rollback function
rollback() {
    log_warn "Rolling back last deployment..."

    wrangler pages deployment rollback --project-name $PROJECT_NAME

    log_success "Rollback completed"
}

# Main execution
main() {
    clear

    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║   ABA Child Management System - Deployment Script              ║"
    echo "║   Project: $PROJECT_NAME                                        ║"
    echo "║   Environment: $ENVIRONMENT                                     ║"
    echo "║   Time: $CURRENT_DATE                                   ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    if [ "$DRY_RUN" = "true" ]; then
        log_warn "Running in DRY RUN mode - no changes will be made"
    fi

    echo ""

    # Execution flow
    check_prerequisites
    echo ""

    build_frontend
    echo ""

    build_backend
    echo ""

    validate_build
    echo ""

    security_check
    echo ""

    deploy_cloudflare
    echo ""

    post_deploy_checks
    echo ""

    record_deployment
    echo ""

    # Success message
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║              Deployment Completed Successfully! ✨              ║"
    if [ "$ENVIRONMENT" = "production" ]; then
        echo "║        Live URL: https://aba-child.pages.dev                 ║"
    elif [ "$ENVIRONMENT" = "staging" ]; then
        echo "║        Staging URL: https://aba-child-staging.pages.dev      ║"
    fi
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Show help
show_help() {
    cat << EOF
ABA Child Management System - Deployment Script

Usage: ./deploy.sh [ENVIRONMENT] [OPTIONS]

Arguments:
    ENVIRONMENT     Target environment (staging, production)
                   Default: staging

Options:
    --dry-run      Run without making actual changes
    --rollback     Rollback to previous deployment
    --help         Show this help message

Examples:
    ./deploy.sh staging
    ./deploy.sh production --dry-run
    ./deploy.sh production --rollback

Environment Variables:
    CLOUDFLARE_API_TOKEN    Your Cloudflare API token
    CLOUDFLARE_ACCOUNT_ID   Your Cloudflare account ID

EOF
}

# Parse command line arguments
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    show_help
    exit 0
fi

if [ "$2" = "--dry-run" ]; then
    DRY_RUN="true"
fi

if [ "$2" = "--rollback" ]; then
    rollback
    exit $?
fi

# Run main function
main
