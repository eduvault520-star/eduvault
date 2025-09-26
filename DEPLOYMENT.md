# EduVault Deployment Guide

## Prerequisites

- Node.js 18+ and npm
- MongoDB 6.0+
- Docker and Docker Compose (for containerized deployment)
- Git

## Environment Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd EduVault

# Install root dependencies
npm run install:all
```

### 2. Environment Configuration

Copy the environment file and configure:

```bash
# Backend environment
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your configuration:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/eduvault

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# M-Pesa API (Sandbox/Production)
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_SHORTCODE=your_business_shortcode
MPESA_PASSKEY=your_mpesa_passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa/callback

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AI Chatbot
GROK_API_KEY=your_grok_api_key
GROK_API_URL=https://api.x.ai/v1

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## Development Deployment

### 1. Start MongoDB

```bash
# Using Docker
docker run -d --name mongodb -p 27017:27017 mongo:6.0

# Or install MongoDB locally
```

### 2. Seed Database

```bash
cd backend
npm run seed
```

### 3. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run dev:backend  # Backend on port 5000
npm run dev:frontend # Frontend on port 3000
```

## Production Deployment

### Option 1: Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 2: Manual Deployment

#### Backend Deployment

```bash
cd backend

# Install production dependencies
npm ci --only=production

# Build if needed
npm run build

# Start with PM2 (recommended)
npm install -g pm2
pm2 start server.js --name "eduvault-backend"

# Or start directly
npm start
```

#### Frontend Deployment

```bash
cd frontend

# Install dependencies
npm ci

# Build for production
npm run build

# Serve with nginx or serve
npm install -g serve
serve -s build -l 3000
```

## Cloud Deployment

### AWS Deployment

1. **EC2 Instance Setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install Docker
   sudo apt-get install docker.io docker-compose -y
   sudo usermod -aG docker $USER
   ```

2. **MongoDB Atlas Setup**
   - Create MongoDB Atlas cluster
   - Update MONGODB_URI in environment variables
   - Whitelist EC2 IP address

3. **Deploy Application**
   ```bash
   # Clone repository
   git clone <repository-url>
   cd EduVault
   
   # Configure environment
   cp backend/.env.example backend/.env
   # Edit .env with production values
   
   # Deploy with Docker Compose
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Heroku Deployment

1. **Backend Deployment**
   ```bash
   # Install Heroku CLI
   npm install -g heroku
   
   # Login and create app
   heroku login
   heroku create eduvault-api
   
   # Set environment variables
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set JWT_SECRET=your_jwt_secret
   
   # Deploy
   git subtree push --prefix backend heroku main
   ```

2. **Frontend Deployment (Netlify)**
   ```bash
   # Build frontend
   cd frontend
   npm run build
   
   # Deploy to Netlify
   npm install -g netlify-cli
   netlify deploy --prod --dir=build
   ```

## Database Setup

### Initial Data Seeding

```bash
cd backend
npm run seed
```

This creates:
- Sample institutions (KMTC, UON, KU, TUK)
- Sample courses for each institution
- Admin user: `admin@eduvault.co.ke` / `admin123`
- Student user: `student@example.com` / `student123`
- Sample job postings

### Backup and Restore

```bash
# Backup
mongodump --uri="mongodb://localhost:27017/eduvault" --out=./backup

# Restore
mongorestore --uri="mongodb://localhost:27017/eduvault" ./backup/eduvault
```

## Security Checklist

- [ ] Change default JWT secret
- [ ] Use strong MongoDB credentials
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable MongoDB authentication
- [ ] Use environment variables for secrets
- [ ] Set up monitoring and logging
- [ ] Configure firewall rules
- [ ] Regular security updates

## Monitoring and Maintenance

### Health Checks

- Backend: `GET /api/health`
- Database: Monitor MongoDB connection
- Frontend: Check application loading

### Logging

```bash
# View application logs
docker-compose logs -f backend
docker-compose logs -f frontend

# PM2 logs
pm2 logs eduvault-backend
```

### Performance Monitoring

- Set up application monitoring (e.g., New Relic, DataDog)
- Monitor database performance
- Set up alerts for critical metrics

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check MongoDB service status
   - Verify connection string
   - Check network connectivity

2. **M-Pesa Integration Issues**
   - Verify API credentials
   - Check callback URL accessibility
   - Review M-Pesa documentation

3. **File Upload Problems**
   - Check Cloudinary configuration
   - Verify file size limits
   - Check disk space

4. **Frontend Build Errors**
   - Clear node_modules and reinstall
   - Check for dependency conflicts
   - Verify environment variables

### Support

For technical support:
- Email: support@eduvault.co.ke
- Documentation: Check README.md files
- Issues: Create GitHub issues for bugs

## Scaling Considerations

### Horizontal Scaling

- Use load balancer (nginx, AWS ALB)
- Deploy multiple backend instances
- Use Redis for session management
- Implement database sharding

### Performance Optimization

- Enable gzip compression
- Use CDN for static assets
- Implement caching strategies
- Optimize database queries
- Use connection pooling

## Backup Strategy

1. **Database Backups**
   - Daily automated backups
   - Weekly full backups
   - Monthly archive backups

2. **File Backups**
   - Backup uploaded files to cloud storage
   - Regular sync with backup storage

3. **Code Backups**
   - Use Git for version control
   - Regular pushes to remote repository
   - Tag releases for rollback capability
