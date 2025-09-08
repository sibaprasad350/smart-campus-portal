

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


## 📸 Screenshots
### 🙋‍♀️ Admain Account:
<img width="1920" height="1080" alt="Screenshot (88)" src="https://github.com/user-attachments/assets/ada974b0-d36b-49ed-95c6-a886ec7121dc" />
<img width="1920" height="1080" alt="Screenshot (43)" src="https://github.com/user-attachments/assets/0ff89d58-f935-4bef-ae08-ba947480761e" />
<img width="1920" height="1080" alt="Screenshot (44)" src="https://github.com/user-attachments/assets/f2f9afae-9a5d-4776-98c4-2de137a40866" />
<img width="1920" height="1080" alt="Screenshot (45)" src="https://github.com/user-attachments/assets/159112db-ba42-4ded-aa09-0f7092a50ecb" />
<img width="1920" height="1080" alt="Screenshot (47)" src="https://github.com/user-attachments/assets/c08122cc-5bfa-46ca-9629-bc52ba46b5b5" />
<img width="1920" height="1080" alt="Screenshot (48)" src="https://github.com/user-attachments/assets/ab3a8393-aa92-4d7e-90f6-a1ca9c13130a" />
<img width="1920" height="1080" alt="Screenshot (49)" src="https://github.com/user-attachments/assets/c643a148-de63-4c19-b904-4b3e31a34e91" />
<img width="1920" height="1080" alt="Screenshot (50)" src="https://github.com/user-attachments/assets/38e43c67-073c-4463-b592-48e386f328ac" />
<img width="1920" height="1080" alt="Screenshot (51)" src="https://github.com/user-attachments/assets/1a98ab7b-45ec-4e7e-b273-847d2b19280e" />
<img width="1920" height="1080" alt="Screenshot (60)" src="https://github.com/user-attachments/assets/89d9b0cf-5987-4473-9d8f-ee4d4170249b" />
<img width="1920" height="1080" alt="Screenshot (63)" src="https://github.com/user-attachments/assets/96aede48-9ecf-4a24-a405-1d516818e9c5" />
<img width="1920" height="1080" alt="Screenshot (66)" src="https://github.com/user-attachments/assets/20dd0a0d-08fd-4008-8f55-ece88742bda1" />

### 👨‍🎓 Student Account:
<img width="1920" height="1080" alt="Screenshot (70)" src="https://github.com/user-attachments/assets/c9df8c62-3c91-4744-a384-b7ec30c2f889" />
<img width="1920" height="1080" alt="Screenshot (73)" src="https://github.com/user-attachments/assets/112d8c9a-824c-46c5-b70f-98a76ed8d44a" />
<img width="1920" height="1080" alt="Screenshot (74)" src="https://github.com/user-attachments/assets/954b8f1d-918d-42c5-b31e-7ecc7f90bc80" />
<img width="1920" height="1080" alt="Screenshot (75)" src="https://github.com/user-attachments/assets/f1f3bb1c-8f54-4086-9224-1a250006ff00" />
<img width="1920" height="1080" alt="Screenshot (77)" src="https://github.com/user-attachments/assets/12f1a3a4-e644-4389-a2df-fe267e85faa4" />
<img width="1920" height="1080" alt="Screenshot (79)" src="https://github.com/user-attachments/assets/17bccddc-2975-4e64-9f85-0a0fb48fe233" />
<img width="1920" height="1080" alt="Screenshot (81)" src="https://github.com/user-attachments/assets/47829b97-d02c-4592-97fc-32c52588a903" />
<img width="1920" height="1080" alt="Screenshot (82)" src="https://github.com/user-attachments/assets/aa053284-f13a-4fee-add4-4554d763ca95" />
<img width="1920" height="1080" alt="Screenshot (84)" src="https://github.com/user-attachments/assets/6cb3e3ec-5a51-4e15-91e9-6268df31016e" />
