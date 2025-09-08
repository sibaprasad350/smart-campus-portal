@echo off
echo Creating Cognito users with environment variables...
echo.

REM Replace these with your actual AWS credentials
set AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_HERE
set AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY_HERE
set AWS_DEFAULT_REGION=us-west-2

echo Running user creation script...
node setup-cognito-users.js

pause