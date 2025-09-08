

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


## Screenshots

<img width="1920" height="1080" alt="Screenshot (88)" src="https://github.com/user-attachments/assets/5b66f0a2-7653-48f5-82b6-5ca88e2b3b94" />
<img width="1920" height="1080" alt="Screenshot (79)" src="https://github.com/user-attachments/assets/2267feaa-10d4-49d1-b9dd-67487579bfcd" />
<img width="1920" height="1080" alt="Screenshot (77)" src="https://github.com/user-attachments/assets/5243a2c2-b7fc-42e2-9449-924b7223b814" />
<img width="1920" height="1080" alt="Screenshot (75)" src="https://github.com/user-attachments/assets/ae2faeb6-2cea-44a9-b294-a2edd96c5c50" />
<img width="1920" height="1080" alt="Screenshot (73)" src="https://github.com/user-attachments/assets/1e946734-9438-4776-b7b0-43cf0313dd4f" />
<img width="1920" height="1080" alt="Screenshot (71)" src="https://github.com/user-attachments/assets/fa2dd5d5-fb35-4d55-82f4-c98193c2209e" />
<img width="1920" height="1080" alt="Screenshot (70)" src="https://github.com/user-attachments/assets/d9ad3067-f947-41c8-81ae-47078a6fe5e3" />
<img width="1920" height="1080" alt="Screenshot (66)" src="https://github.com/user-attachments/assets/4e4487d1-1962-4cd4-898f-9834d6ff8d91" />
<img width="1920" height="1080" alt="Screenshot (63)" src="https://github.com/user-attachments/assets/4d878139-8811-4903-b2d2-be5c3c5ea8b8" />
<img width="1920" height="1080" alt="Screenshot (60)" src="https://github.com/user-attachments/assets/895c2170-a9ee-4048-bc85-769a880a8054" />
<img width="1920" height="1080" alt="Screenshot (58)" src="https://github.com/user-attachments/assets/35ed5fb4-d3d3-4ee9-b8ff-33bdb3336ce8" />
<img width="1920" height="1080" alt="Screenshot (51)" src="https://github.com/user-attachments/assets/797f51a8-38d2-4359-bf94-fcf9e8b93495" />
<img width="1920" height="1080" alt="Screenshot (48)" src="https://github.com/user-attachments/assets/0d680099-bf3f-405f-81b8-000954867f85" />
<img width="1920" height="1080" alt="Screenshot (47)" src="https://github.com/user-attachments/assets/d053bcee-da03-4c2f-b662-40a4f72c72b0" />
<img width="1920" height="1080" alt="Screenshot (45)" src="https://github.com/user-attachments/assets/6f80e066-99c2-49f9-8bb7-5cc9b6c23c24" />
<img width="1920" height="1080" alt="Screenshot (44)" src="https://github.com/user-attachments/assets/b1e742c5-ca3d-4d3b-86aa-3170d6b11e4f" />
<img width="1920" height="1080" alt="Screenshot (43)" src="https://github.com/user-attachments/assets/7f521bb2-fe45-428a-8e1c-19eae40a3bed" />
<img width="1920" height="1080" alt="Screenshot (84)" src="https://github.com/user-attachments/assets/3bab5991-a4b2-4d59-933f-6c1ab9dda973" />
<img width="1920" height="1080" alt="Screenshot (82)" src="https://github.com/user-attachments/assets/0196419e-9219-490c-8790-173eafd39924" />
<img width="1920" height="1080" alt="Screenshot (81)" src="https://github.com/user-attachments/assets/7cceb38c-bd82-4c38-ac31-f5d964f755be" />

