# Script to initialize LocalStack with S3 bucket
Write-Host "Initializing LocalStack..." -ForegroundColor Green

# Wait for LocalStack to be ready
Write-Host "Waiting for LocalStack to be ready..." -ForegroundColor Yellow
do {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:4566/health" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            break
        }
    }
    catch {
        Write-Host "Waiting for LocalStack..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
} while ($true)

Write-Host "LocalStack is ready!" -ForegroundColor Green

# Create S3 bucket using AWS CLI
Write-Host "Creating S3 bucket..." -ForegroundColor Yellow
try {
    aws --endpoint-url=http://localhost:4566 s3 mb s3://nutrition-platform
    Write-Host "S3 bucket 'nutrition-platform' created successfully!" -ForegroundColor Green
}
catch {
    Write-Host "Error creating S3 bucket: $_" -ForegroundColor Red
}

# Set bucket policy for public read access
Write-Host "Setting bucket policy..." -ForegroundColor Yellow
$policy = @'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::nutrition-platform/*"
    }
  ]
}
'@

try {
    $policy | aws --endpoint-url=http://localhost:4566 s3api put-bucket-policy --bucket nutrition-platform --policy file:///dev/stdin
    Write-Host "Bucket policy set successfully!" -ForegroundColor Green
}
catch {
    Write-Host "Error setting bucket policy: $_" -ForegroundColor Red
}

Write-Host "LocalStack initialization complete!" -ForegroundColor Green
Write-Host "S3 bucket 'nutrition-platform' created and configured for public read access." -ForegroundColor Green
