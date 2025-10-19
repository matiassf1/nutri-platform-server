#!/bin/bash

# Script to initialize LocalStack with S3 bucket
echo "Initializing LocalStack..."

# Wait for LocalStack to be ready
echo "Waiting for LocalStack to be ready..."
until curl -s http://localhost:4566/health > /dev/null; do
  echo "Waiting for LocalStack..."
  sleep 2
done

echo "LocalStack is ready!"

# Create S3 bucket
echo "Creating S3 bucket..."
aws --endpoint-url=http://localhost:4566 s3 mb s3://nutrition-platform

# Set bucket policy for public read access
echo "Setting bucket policy..."
aws --endpoint-url=http://localhost:4566 s3api put-bucket-policy --bucket nutrition-platform --policy '{
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
}'

echo "LocalStack initialization complete!"
echo "S3 bucket 'nutrition-platform' created and configured for public read access."
