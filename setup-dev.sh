#!/bin/bash

# InflaMed Affiliates - Zero-Config Development Setup
echo "🚀 Setting up InflaMed Affiliates development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Check if PostgreSQL container already exists
if docker ps -a --format 'table {{.Names}}' | grep -q "inflamed-postgres"; then
    echo "📦 PostgreSQL container already exists. Starting it..."
    docker start inflamed-postgres
else
    echo "🐘 Creating PostgreSQL container..."
    docker run --name inflamed-postgres \
        -e POSTGRES_DB=inflamed_affiliates \
        -e POSTGRES_USER=inflamed \
        -e POSTGRES_PASSWORD=dev_password_123 \
        -p 5432:5432 \
        -d postgres:15
    
    echo "⏳ Waiting for PostgreSQL to start..."
    sleep 5
fi

# Update environment file with correct database URL
echo "🔧 Updating environment configuration..."
cat > apps/admin/.env.local << 'ENVEOF'
# Development Environment Variables
# Database - PostgreSQL via Docker
DATABASE_URL="postgresql://inflamed:dev_password_123@localhost:5432/inflamed_affiliates"

# Authentication
BETTER_AUTH_SECRET="dev-secret-key-change-in-production-12345"
BETTER_AUTH_URL="http://localhost:3001"

# Email (Resend) - Optional for development
RESEND_API_KEY="test_key"

# Google OAuth (optional for development)
GOOGLE_CLIENT_ID="google_client_id"
GOOGLE_CLIENT_SECRET="google_client_secret"

# Referral Program
REFERRAL_PROGRAM_CLIENT_ID="referral_program_client_id"
REFERRAL_PROGRAM_CLIENT_SECRET="referral_program_client_secret"

# Public URLs
NEXT_PUBLIC_APP_URL="http://localhost:3001"
NEXT_PUBLIC_REFREF_PROJECT_ID="refref_project_id"
NEXT_PUBLIC_REFREF_PROGRAM_ID="refref_program_id"
ENVEOF

echo "✅ Development environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Run: pnpm install"
echo "   2. Run: pnpm dev"
echo ""
echo "🌐 Your apps will be available at:"
echo "   • Marketing site: http://localhost:3000"
echo "   • Admin dashboard: http://localhost:3001"
echo "   • Attribution script demo: http://localhost:5173"
echo "   • Referral widget demo: http://localhost:5174"
echo ""
echo "🗄️ Database: PostgreSQL running in Docker container 'inflamed-postgres'"
