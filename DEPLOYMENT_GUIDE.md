# EduVault Deployment Guide

## Prerequisites

### System Requirements
- Node.js 18+ and npm
- MongoDB 5.0+
- Git
- Domain name (for production)
- SSL certificate (for production)

### Required Services
- **Cloudinary Account** - For file storage
- **M-Pesa Developer Account** - For payments
- **xAI Grok API Key** - For AI chatbot (optional fallback to OpenAI)

## Environment Setup

### Backend Environment Variables

Create `.env` file in `/backend` directory:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eduvault?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here_minimum_32_characters
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

# M-Pesa API Configuration (Safaricom Daraja)
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_SHORTCODE=your_business_shortcode
MPESA_PASSKEY=your_mpesa_passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa/callback

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# AI Chatbot Configuration
GROK_API_KEY=your_grok_api_key
GROK_API_URL=https://api.x.ai/v1

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Security
ENCRYPTION_KEY=your_32_character_encryption_key_here
```

### Frontend Environment Variables

Create `.env` file in `/frontend` directory:

```env
REACT_APP_BACKEND_URL=https://api.yourdomain.com
REACT_APP_FRONTEND_URL=https://yourdomain.com
```

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
# Clone repository
git clone <repository-url>
cd EduVault

# Install root dependencies
npm install

# Install all dependencies (frontend + backend)
npm run install:all
```

### 2. Database Setup

```bash
# Start MongoDB locally or use MongoDB Atlas
# Seed the database with initial data
cd backend
npm run seed
```

### 3. Start Development Servers

```bash
# From root directory - starts both frontend and backend
npm run dev

# Or start individually:
# Backend only
npm run dev:backend

# Frontend only  
npm run dev:frontend
```

### 4. Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/api/health

## Production Deployment

### Option 1: Heroku Deployment

#### Backend Deployment

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create Heroku app for backend
heroku create eduvault-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
# ... set all other environment variables

# Deploy backend
git subtree push --prefix backend heroku main

# Run database seeding (one time)
heroku run npm run seed
```

#### Frontend Deployment

```bash
# Create Heroku app for frontend
heroku create eduvault-app

# Set build pack
heroku buildpacks:set mars/create-react-app

# Set environment variables
heroku config:set REACT_APP_BACKEND_URL=https://eduvault-api.herokuapp.com

# Deploy frontend
git subtree push --prefix frontend heroku main
```

### Option 2: AWS Deployment

#### Backend (AWS Elastic Beanstalk)

```bash
# Install EB CLI
pip install awsebcli

# Initialize EB application
cd backend
eb init

# Create environment
eb create eduvault-api-prod

# Set environment variables in EB console
# Deploy
eb deploy
```

#### Frontend (AWS S3 + CloudFront)

```bash
# Build frontend
cd frontend
npm run build

# Install AWS CLI
# Configure AWS credentials
aws configure

# Create S3 bucket
aws s3 mb s3://eduvault-frontend

# Upload build files
aws s3 sync build/ s3://eduvault-frontend --delete

# Set up CloudFront distribution (via AWS Console)
```

### Option 3: Digital Ocean Droplet

#### Server Setup

```bash
# Connect to droplet
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Install Nginx
apt install nginx -y

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
apt-get update
apt-get install -y mongodb-org
systemctl start mongod
systemctl enable mongod
```

#### Application Deployment

```bash
# Clone repository
git clone <repository-url> /var/www/eduvault
cd /var/www/eduvault

# Install dependencies
npm run install:all

# Build frontend
cd frontend
npm run build

# Setup PM2 for backend
cd ../backend
pm2 start server.js --name "eduvault-api"
pm2 startup
pm2 save

# Configure Nginx
# Create /etc/nginx/sites-available/eduvault
```

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend
    location / {
        root /var/www/eduvault/frontend/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### SSL Setup with Let's Encrypt

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Database Seeding

### Initial Data Setup

```bash
# Run seeding script
cd backend
npm run seed
```

This creates:
- 4 Kenyan institutions (KMTC, UON, KU, TUK)
- Sample courses for each institution
- Admin user: admin@eduvault.co.ke / admin123
- Student user: student@example.com / student123
- Sample job listings

## Monitoring and Maintenance

### Health Checks

- API Health: `GET /api/health`
- Database connection status
- Socket.IO connection status

### Logging

```bash
# PM2 logs
pm2 logs eduvault-api

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Backup Strategy

```bash
# MongoDB backup
mongodump --uri="your_mongodb_uri" --out=/backup/$(date +%Y%m%d)

# Automate with cron
0 2 * * * mongodump --uri="your_mongodb_uri" --out=/backup/$(date +\%Y\%m\%d)
```

## Security Checklist

- [ ] Environment variables are set correctly
- [ ] MongoDB is secured with authentication
- [ ] SSL certificates are installed
- [ ] Rate limiting is enabled
- [ ] CORS is properly configured
- [ ] File upload limits are set
- [ ] API endpoints are properly authenticated
- [ ] Sensitive data is encrypted
- [ ] Regular security updates

## Performance Optimization

### Frontend
- Lazy loading implemented ✅
- Image optimization with Cloudinary
- CDN for static assets
- Service worker for caching

### Backend
- Database indexing ✅
- API response caching ✅
- File compression ✅
- Connection pooling

### Database
- Proper indexing on frequently queried fields
- Regular performance monitoring
- Connection pooling

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check FRONTEND_URL in backend .env
   - Verify CORS configuration

2. **Database Connection**
   - Check MONGODB_URI format
   - Verify network access to MongoDB

3. **File Upload Issues**
   - Check Cloudinary credentials
   - Verify file size limits

4. **M-Pesa Integration**
   - Use sandbox for testing
   - Check callback URL accessibility
   - Verify credentials

5. **Socket.IO Connection**
   - Check proxy configuration
   - Verify WebSocket support

## Support

For deployment issues:
1. Check logs first
2. Verify environment variables
3. Test API endpoints individually
4. Check database connectivity

## Scaling Considerations

### Horizontal Scaling
- Load balancer setup
- Multiple backend instances
- Database clustering
- CDN implementation

### Monitoring
- Application performance monitoring
- Error tracking
- User analytics
- Resource usage monitoring
