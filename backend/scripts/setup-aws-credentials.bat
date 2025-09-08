@echo off
echo Setting up AWS credentials for CDK deployment...
echo.

REM Set AWS credentials as environment variables
set AWS_ACCESS_KEY_ID=AKIAZ6XDG6M5NRO3LJM3
set AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY_HERE
set AWS_DEFAULT_REGION=us-west-2

echo AWS credentials configured.
echo Access Key ID: %AWS_ACCESS_KEY_ID%
echo Region: %AWS_DEFAULT_REGION%
echo.

echo You can now run CDK commands in this session.
echo Example: cd ../cdk && npm run deploy
echo.

cmd /k