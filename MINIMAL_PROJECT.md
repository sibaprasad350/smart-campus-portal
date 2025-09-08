# Minimal Smart Campus Portal

## 📦 Essential Files Only (Reduced from 1.4GB)

### Core Application
- `src/` - React frontend source code
- `backend/lambda/` - AWS Lambda functions
- `backend/cdk/` - Infrastructure as code
- `public/index.html` - HTML template

### Configuration
- `package.json` - Dependencies (main + 7 lambda functions)
- `docker-compose.yml` - Container orchestration
- `Dockerfile` - Container definition
- `.env.template` - Environment variables template

### Documentation
- `README.md` - Main documentation
- `SECURITY_FIXES.md` - Security improvements
- `AWS_DEPLOYMENT_GUIDE.txt` - Deployment guide

### Deployment
- `deploy-from-zip.sh` - Deploy from ZIP
- `deploy-to-ec2.sh` - EC2 deployment
- `quick-deploy.sh` - Quick deployment
- `simple-deploy.sh` - Simple deployment

## 🚀 To Restore Dependencies
```bash
npm install
cd backend/cdk && npm install
```

## 📊 Space Savings
- Removed: node_modules folders (~1GB+)
- Removed: package-lock.json files (~200MB)
- Removed: Compiled TypeScript files
- Removed: Redundant documentation
- Removed: Test and cleanup scripts

## ✅ Login Credentials
- Admin: admin001 / Pass123!
- Student: student001 / Pass123!
- Student: student002 / Pass123!