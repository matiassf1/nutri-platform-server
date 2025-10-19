# Copy email templates from src to dist directory
# This ensures templates are available in production builds

Write-Host "📧 Copying email templates..." -ForegroundColor Green

$srcTemplatesDir = Join-Path $PSScriptRoot "..\src\messaging\email-templates"
$distTemplatesDir = Join-Path $PSScriptRoot "..\dist\src\messaging\email-templates"

Write-Host "Source: $srcTemplatesDir" -ForegroundColor Yellow
Write-Host "Destination: $distTemplatesDir" -ForegroundColor Yellow

try {
    # Create destination directory if it doesn't exist
    if (-not (Test-Path $distTemplatesDir)) {
        New-Item -ItemType Directory -Path $distTemplatesDir -Force | Out-Null
        Write-Host "✅ Created destination directory" -ForegroundColor Green
    }

    # Copy the entire email-templates directory
    Copy-Item -Path $srcTemplatesDir -Destination $distTemplatesDir -Recurse -Force
    
    Write-Host "✅ Email templates copied successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Error copying email templates: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
