# Smart Campus Portal - AWS S3 + CloudFront Deployment Guide

## 🚀 COMPLETE DEPLOYMENT PROCESS

### STEP 1: BUILD THE REACT APPLICATION

```bash
# Navigate to project directory
cd smart-campus-portal

# Install dependencies (if not already done)
npm install

# Create production build
npm run build
```

This creates a `build/` folder with optimized static files.

---

## 🪣 STEP 2: CREATE S3 BUCKET FOR HOSTING

### 2.1 Create S3 Bucket
```bash
# Using AWS CLI
aws s3 mb s3://smart-campus-portal-app-$(date +%s) --region us-west-2
```

### 2.2 Configure S3 for Static Website Hosting

**Via AWS Console:**
1. Go to S3 Console → Select your bucket
2. Properties tab → Static website hosting → Enable
3. Index document: `index.html`
4. Error document: `index.html` (for React Router)

**Via AWS CLI:**
```bash
aws s3 website s3://smart-campus-portal-app-$(date +%s) --index-document index.html --error-document index.html
```

### 2.3 Upload Build Files
```bash
# Upload all build files
aws s3 sync build/ s3://smart-campus-portal-app-$(date +%s) --delete

# Set public read permissions
aws s3api put-bucket-policy --bucket smart-campus-portal-app-$(date +%s) --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::smart-campus-portal-app-$(date +%s)/*"
    }
  ]
}'
```

---

## 🌐 STEP 3: SETUP CLOUDFRONT DISTRIBUTION

### 3.1 Create CloudFront Distribution

**Via AWS Console:**
1. CloudFront Console → Create Distribution
2. Origin Domain: `smart-campus-portal-app.s3-website-us-west-2.amazonaws.com`
3. Default Root Object: `index.html`
4. Error Pages: Add custom error response
   - HTTP Error Code: 403, 404
   - Response Page Path: `/index.html`
   - HTTP Response Code: 200

**Via AWS CLI:**
```bash
aws cloudfront create-distribution --distribution-config '{
  "CallerReference": "smart-campus-'$(date +%s)'",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-smart-campus-portal-app",
        "DomainName": "smart-campus-portal-app.s3-website-us-west-2.amazonaws.com",
        "CustomOriginConfig": {
          "HTTPPort": 80,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "http-only"
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-smart-campus-portal-app",
    "ViewerProtocolPolicy": "redirect-to-https",
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {"Forward": "none"}
    }
  },
  "Comment": "Smart Campus Portal Distribution",
  "Enabled": true,
  "DefaultRootObject": "index.html"
}'
```

---

## 🆓 STEP 4: GET FREE CUSTOM DOMAIN

### Option 1: Freenom (Free .tk, .ml, .ga, .cf domains)

1. **Register Domain:**
   - Go to freenom.com
   - Search for available domain (e.g., `smartcampus.tk`)
   - Register for free (12 months)

2. **Get CloudFront Domain:**
   - Note your CloudFront distribution domain (e.g., `d1234567890.cloudfront.net`)

### Option 2: GitHub Pages Custom Domain (Alternative)

1. **Create GitHub Repository:**
   - Create public repo: `username.github.io`
   - Upload build files
   - Enable GitHub Pages

2. **Free Subdomain Options:**
   - `smartcampus.github.io`
   - Use services like `netlify.app` or `vercel.app`

---

## 🔗 STEP 5: CONFIGURE CUSTOM DOMAIN WITH CLOUDFRONT

### 5.1 Add Custom Domain to CloudFront

**Via AWS Console:**
1. CloudFront → Your Distribution → Edit
2. Alternate Domain Names (CNAMEs): Add your domain
3. SSL Certificate: Request new certificate via ACM

### 5.2 Request SSL Certificate (ACM)

```bash
# Request certificate
aws acm request-certificate \
  --domain-name smartcampus.tk \
  --domain-name www.smartcampus.tk \
  --validation-method DNS \
  --region us-east-1
```

**Important:** SSL certificates for CloudFront must be in `us-east-1` region.

### 5.3 Configure DNS Records

**At your domain provider (Freenom):**
1. DNS Management → Add Records
2. Add CNAME record:
   - Name: `www`
   - Target: `d1234567890.cloudfront.net`
3. Add A record (if supported):
   - Name: `@` (root domain)
   - Target: CloudFront IP (use ALIAS if available)

---

## 📝 STEP 6: AUTOMATED DEPLOYMENT SCRIPT

Create deployment script for easy updates:

### deploy.bat (Windows)
```batch
@echo off
echo Building React application...
npm run build

echo Uploading to S3...
aws s3 sync build/ s3://smart-campus-portal-app --delete

echo Creating CloudFront invalidation...
aws cloudfront create-invalidation --distribution-id E1234567890ABC --paths "/*"

echo Deployment complete!
echo Your site: https://smartcampus.tk
```

### deploy.sh (Linux/Mac)
```bash
#!/bin/bash
echo "Building React application..."
npm run build

echo "Uploading to S3..."
aws s3 sync build/ s3://smart-campus-portal-app --delete

echo "Creating CloudFront invalidation..."
aws cloudfront create-invalidation --distribution-id E1234567890ABC --paths "/*"

echo "Deployment complete!"
echo "Your site: https://smartcampus.tk"
```

---

## 🔧 STEP 7: ENVIRONMENT CONFIGURATION

### Update .env for production:
```env
# Production Environment Variables
REACT_APP_API_URL=https://4jifheiwy3.execute-api.us-west-2.amazonaws.com/prod
REACT_APP_USER_POOL_ID=us-west-2_jN5XqMmUQ
REACT_APP_USER_POOL_CLIENT_ID=1qiqc2e2lhg5h9e0qrafm9nuv
REACT_APP_S3_BUCKET=smartcampusstack-smartcampusimagescb625ec1-ngjklnx0vexw
REACT_APP_AWS_REGION=us-west-2
REACT_APP_ENV=production
```

---

## 🌟 ALTERNATIVE FREE HOSTING OPTIONS

### Option 1: Netlify (Recommended for simplicity)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=build

# Custom domain: yoursite.netlify.app
```

### Option 2: Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Custom domain: yoursite.vercel.app
```

### Option 3: Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize and deploy
firebase init hosting
npm run build
firebase deploy

# Custom domain: yoursite.web.app
```

---

## 📊 COST BREAKDOWN (AWS)

### Free Tier Eligible:
- **S3**: 5GB storage, 20,000 GET requests
- **CloudFront**: 50GB data transfer, 2,000,000 requests
- **Route 53**: First hosted zone (if using AWS DNS)

### Estimated Monthly Cost (after free tier):
- **S3**: ~$0.10-0.50 (for small app)
- **CloudFront**: ~$0.50-2.00 (depending on traffic)
- **Domain**: Free (Freenom) or $10-15/year (premium)

---

## 🔍 TROUBLESHOOTING

### Common Issues:

1. **404 Errors on Refresh:**
   - Ensure error document is set to `index.html`
   - Add CloudFront custom error pages

2. **CORS Issues:**
   - Check API Gateway CORS settings
   - Verify S3 bucket CORS configuration

3. **SSL Certificate Issues:**
   - Certificate must be in us-east-1 for CloudFront
   - DNS validation required

4. **Caching Issues:**
   - Create CloudFront invalidation after updates
   - Set appropriate cache headers

### Verification Commands:
```bash
# Test S3 website
curl -I http://smart-campus-portal-app.s3-website-us-west-2.amazonaws.com

# Test CloudFront
curl -I https://d1234567890.cloudfront.net

# Test custom domain
curl -I https://smartcampus.tk
```

---

## 🚀 QUICK DEPLOYMENT CHECKLIST

□ Build React app (`npm run build`)
□ Create S3 bucket with static hosting
□ Upload build files to S3
□ Create CloudFront distribution
□ Register free domain (Freenom)
□ Request SSL certificate (ACM)
□ Configure DNS records
□ Test deployment
□ Set up automated deployment script

**Final URLs:**
- S3 Direct: `http://smart-campus-portal-app.s3-website-us-west-2.amazonaws.com`
- CloudFront: `https://d1234567890.cloudfront.net`
- Custom Domain: `https://smartcampus.tk`

Your Smart Campus Portal will be live and accessible worldwide with HTTPS, CDN acceleration, and a custom domain - all using AWS free tier resources!