

# Smart Campus Portal
### 👥 Development Team-4
Siba Prasad Maharana
  ---- Adarsh Chandmare
  ---- Sahil Bhatode


A unified platform for all campus services including timetables, cafeteria, events, lost & found, and academic queries.

## 🚀 Quick Deploy

### Option 1: Local Development
```bash
npm install
npm start
```
Access at: http://localhost:3000

### Option 3: AWS CDK Deployment
```bash
# Install AWS CLI and CDK
npm install -g aws-cdk
aws configure

# Deploy infrastructure
cd backend/cdk
npm install
cdk bootstrap
cdk deploy
```

### Option 4: AWS S3 + CloudFront (Static)
```bash
# Build React app
npm run build

# Create S3 bucket and deploy
aws s3 mb s3://smart-campus-$(date +%s)
aws s3 sync build/ s3://smart-campus-$(date +%s) --delete
aws s3 website s3://smart-campus-$(date +%s) --index-document index.html

# Create CloudFront distribution (optional)
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

```

## 🔑 Login Credentials

| User Type | Username | Password |
|-----------|----------|----------|
| Admin | admin001 | Pass123! |
| Student | student001 | Pass123! |
| Student | student002 | Pass123! |

## 📋 Features

- **Authentication** - Secure login system
- **Timetable Management** - Class schedules
- **Cafeteria** - Menu & ordering system
- **Events** - Campus event management
- **Lost & Found** - Item tracking
- **Academic Queries** - Student support system
- **User Management** - Admin panel

## 🛠️ Tech Stack

- **Frontend**: React, Material-UI
- **Backend**: AWS Lambda, API Gateway
- **Database**: DynamoDB, RDS MySQL
- **Auth**: AWS Cognito
- **Infrastructure**: AWS CDK
- **Deployment**: Docker, EC2, S3 + CloudFront

## 📁 Project Structure

```
smart-campus-portal/
├── src/                    # React frontend
├── backend/
│   ├── lambda/            # AWS Lambda functions
│   └── cdk/               # Infrastructure code
├── docker-compose.yml     # Container setup
└── deploy-*.sh           # Deployment scripts
```

## 🔧 AWS Prerequisites

### 1. Install AWS CLI
```bash
# Windows
choco install awscli
# macOS
brew install awscli
# Linux
sudo apt install awscli
```

### 2. Configure AWS Credentials
```bash
aws configure
# Enter: Access Key ID, Secret Access Key, Region (us-west-2), Output format (json)
```

### 3. Install AWS CDK
```bash
npm install -g aws-cdk
```

### 4. Environment Setup
1. Copy `.env.template` to `.env`
2. Update AWS credentials and region
3. Configure API endpoints after deployment

## 📖 Documentation

- [Security Fixes](SECURITY_FIXES.md)
- [AWS Deployment Guide](AWS_DEPLOYMENT_GUIDE.txt)
- [Minimal Project Info](MINIMAL_PROJECT.md)

## 🚀 AWS Deployment Steps

### Full Stack Deployment (CDK)
1. `aws configure` - Set up credentials
2. `cd backend/cdk && npm install` - Install dependencies
3. `cdk bootstrap` - Initialize CDK
4. `cdk deploy` - Deploy infrastructure
5. Update frontend API URLs with deployed endpoints
6. `npm run build && aws s3 sync build/ s3://your-bucket`

### Static Site Deployment (S3)
1. `npm run build` - Build React app
2. `aws s3 mb s3://smart-campus-$(date +%s)` - Create bucket
3. `aws s3 sync build/ s3://your-bucket` - Upload files
4. Enable static website hosting in S3 console

## 🚀 One-Click Deploy

Choose your preferred deployment method. The application will be ready in minutes!