# EduVault Netlify Deployment Guide

## 🚀 **Deployment Status: READY**

### ✅ **Pre-Deployment Checklist Completed:**
- [x] KMTC display issue fixed
- [x] All mock data removed from critical components
- [x] Syntax errors fixed
- [x] M-Pesa production ready
- [x] Git repository initialized and pushed
- [x] Netlify configuration files created

## 📋 **Deployment Steps:**

### **1. Student Frontend Deployment**
**Repository**: https://github.com/eduvault520-star/eduvault.git
**Subdirectory**: `student-frontend/`

1. **Login to Netlify**: https://app.netlify.com
2. **New Site from Git** → **GitHub** → Select `eduvault` repository
3. **Build Settings**:
   - **Base directory**: `student-frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `student-frontend/build`
4. **Environment Variables**:
   ```
   REACT_APP_API_URL = https://your-backend-url.herokuapp.com
   REACT_APP_ENVIRONMENT = production
   CI = false
   ```
5. **Deploy Site**

### **2. Admin Frontend Deployment**
**Subdirectory**: `admin-frontend/`

1. **New Site from Git** → **GitHub** → Select `eduvault` repository
2. **Build Settings**:
   - **Base directory**: `admin-frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `admin-frontend/build`
3. **Environment Variables**: Same as student frontend
4. **Deploy Site**

### **3. Super Admin Frontend Deployment**
**Subdirectory**: `super-admin-frontend/`

1. **New Site from Git** → **GitHub** → Select `eduvault` repository
2. **Build Settings**:
   - **Base directory**: `super-admin-frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `super-admin-frontend/build`
3. **Environment Variables**: Same as above
4. **Deploy Site**

## 🔧 **Backend Deployment (Heroku/Railway)**

### **Option 1: Heroku Deployment**
```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create Heroku app
cd server
heroku create eduvault-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_connection_string
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set MPESA_CONSUMER_KEY=your_mpesa_key
heroku config:set MPESA_CONSUMER_SECRET=your_mpesa_secret
heroku config:set MPESA_SHORTCODE=your_shortcode
heroku config:set MPESA_PASSKEY=your_passkey
heroku config:set MPESA_CALLBACK_URL=https://eduvault-api.herokuapp.com/api/subscription/callback

# Deploy
git subtree push --prefix server heroku main
```

### **Option 2: Railway Deployment**
1. **Connect GitHub**: Link your repository
2. **Select Service**: Choose `server` directory
3. **Environment Variables**: Add all required variables
4. **Deploy**: Railway will auto-deploy

## 🌐 **Expected URLs:**

### **Frontend Applications:**
- **Student Frontend**: `https://eduvault-students.netlify.app`
- **Admin Frontend**: `https://eduvault-admin.netlify.app`
- **Super Admin Frontend**: `https://eduvault-superadmin.netlify.app`

### **Backend API:**
- **Heroku**: `https://eduvault-api.herokuapp.com`
- **Railway**: `https://eduvault-api.up.railway.app`

## 🔐 **Environment Variables Required:**

### **Frontend (.env)**:
```env
REACT_APP_API_URL=https://your-backend-url.herokuapp.com
REACT_APP_ENVIRONMENT=production
```

### **Backend (.env)**:
```env
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eduvault
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
FRONTEND_URL=https://eduvault-students.netlify.app

# M-Pesa Production
MPESA_CONSUMER_KEY=your_production_consumer_key
MPESA_CONSUMER_SECRET=your_production_consumer_secret
MPESA_SHORTCODE=your_production_shortcode
MPESA_PASSKEY=your_production_passkey
MPESA_CALLBACK_URL=https://your-backend-url.herokuapp.com/api/subscription/callback

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 🧪 **Post-Deployment Testing:**

### **1. Student Frontend Testing:**
- [ ] Homepage loads correctly
- [ ] Institution selection works
- [ ] Course pages display real data (no KMTC hardcoding)
- [ ] Premium subscription flow works
- [ ] M-Pesa payment integration functional

### **2. Admin Frontend Testing:**
- [ ] Login with: admin@eduvault.co.ke / miniadmin123
- [ ] Dashboard loads without errors
- [ ] Content upload functionality works
- [ ] No mock data visible

### **3. Super Admin Frontend Testing:**
- [ ] Login with: superadmin@eduvault.co.ke / admin123
- [ ] All management features functional
- [ ] User management works
- [ ] Content approval system operational

## 🔧 **Troubleshooting:**

### **Build Failures:**
- Check Node.js version compatibility
- Verify all dependencies are installed
- Check for syntax errors in code

### **Runtime Errors:**
- Verify API URL is correct
- Check CORS settings on backend
- Verify environment variables are set

### **Payment Issues:**
- Verify M-Pesa credentials are production-ready
- Check callback URL is accessible
- Test with real phone numbers

## 📊 **Success Metrics:**

- [ ] All three frontends deploy successfully
- [ ] Backend API is accessible
- [ ] Database connections working
- [ ] Payment system functional
- [ ] No console errors in browser
- [ ] Mobile responsive (basic functionality)

## 🎯 **Next Steps After Deployment:**

1. **Domain Setup**: Configure custom domains
2. **SSL Certificates**: Ensure HTTPS everywhere
3. **Mobile Optimization**: Apply responsive patterns
4. **Performance Optimization**: Bundle size optimization
5. **Monitoring**: Set up error tracking and analytics

Your EduVault platform is ready for production deployment! 🚀
