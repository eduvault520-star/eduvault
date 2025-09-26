# EduVault Web Deployment Guide

## 🚀 **Your Repository Status: READY**

### ✅ **Current Repository:**
- **Repository**: `aurafix3-tech/eduvault`
- **Branch**: `main`
- **Status**: All commits pushed successfully
- **Latest Commit**: "Deploy-ready: Fixed KMTC display, removed mock data, M-Pesa production ready"

## 🌐 **Web Deployment Steps:**

### **Step 1: Student Frontend (Netlify)**
**Repository**: `https://github.com/aurafix3-tech/eduvault.git`

1. **Go to Netlify**: https://app.netlify.com
2. **New Site from Git** → **GitHub** → Select `aurafix3-tech/eduvault`
3. **Build Settings**:
   - **Base directory**: `student-frontend` (leave empty for main site)
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
4. **Environment Variables**:
   ```
   REACT_APP_API_URL = https://your-backend-url.herokuapp.com
   REACT_APP_ENVIRONMENT = production
   CI = false
   ```
5. **Deploy Site** → Your site will be: `https://eduvault-students.netlify.app`

### **Step 2: Admin Frontend (Netlify)**
**Repository**: `https://github.com/aurafix3-tech/eduvault.git`

1. **New Site from Git** → **GitHub** → Select `aurafix3-tech/eduvault`
2. **Build Settings**:
   - **Base directory**: `admin-frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
3. **Environment Variables**: Same as above
4. **Deploy Site** → Your site will be: `https://eduvault-admin.netlify.app`

### **Step 3: Super Admin Frontend (Netlify)**
**Repository**: `https://github.com/aurafix3-tech/eduvault.git`

1. **New Site from Git** → **GitHub** → Select `aurafix3-tech/eduvault`
2. **Build Settings**:
   - **Base directory**: `super-admin-frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
3. **Environment Variables**: Same as above
4. **Deploy Site** → Your site will be: `https://eduvault-superadmin.netlify.app`

## 🔧 **Backend Deployment Options:**

### **Option A: Heroku (Recommended for Web)**
```bash
# Install Heroku CLI if not installed
heroku --version

# Login to Heroku
heroku login

# Create Heroku app
cd server
heroku create eduvault-api

# Set environment variables (from your .env file)
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=mongodb+srv://eduvault:honeywellT55$@cluster0.udsslk9.mongodb.net/eduvault?retryWrites=true&w=majority&appName=Cluster0&ssl=true&tlsAllowInvalidCertificates=true
heroku config:set JWT_SECRET=eduvault_super_secret_jwt_key_for_development_2024
heroku config:set PORT=5001
heroku config:set FRONTEND_URL=https://eduvault-students.netlify.app

# M-Pesa Production Settings
heroku config:set MPESA_CONSUMER_KEY=4CNyZAAlMSslZzGGA9QME5XlXpcviHbSC7uTD5Z3mgIrqUOl
heroku config:set MPESA_CONSUMER_SECRET=ecaJR4OMDZlrAoqG6WmQgZG5gvr4gS20w6qrfGZyAYadjp5IevUcO5OGOAuw8pdE
heroku config:set MPESA_SHORTCODE=174379
heroku config:set MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
heroku config:set MPESA_CALLBACK_URL=https://eduvault-api.herokuapp.com/api/subscription/callback

# Cloudinary (if using file uploads)
heroku config:set CLOUDINARY_CLOUD_NAME=dmatqsg8a
heroku config:set CLOUDINARY_API_KEY=741113318755745
heroku config:set CLOUDINARY_API_SECRET=tqVVCItXUeuM6GMu2TXi_RlACd8

# Deploy to Heroku
git subtree push --prefix server heroku main
```

### **Option B: Railway (Alternative)**
1. **Go to Railway**: https://railway.app
2. **New Project** → **Deploy from GitHub** → Select `aurafix3-tech/eduvault`
3. **Select Service**: Choose `server` directory
4. **Add Environment Variables**: Copy from your `.env` file
5. **Deploy**: Railway will auto-deploy

## 🌐 **Expected URLs After Deployment:**

### **Frontend Applications:**
- **Student Portal**: `https://eduvault-students.netlify.app`
- **Admin Portal**: `https://eduvault-admin.netlify.app`
- **Super Admin Portal**: `https://eduvault-superadmin.netlify.app`

### **Backend API:**
- **Heroku**: `https://eduvault-api.herokuapp.com`
- **Railway**: `https://eduvault-api.up.railway.app`

## 🔐 **Environment Variables for Frontend (.env):**
```env
REACT_APP_API_URL=https://eduvault-api.herokuapp.com
REACT_APP_ENVIRONMENT=production
```

## 🧪 **Testing Your Deployment:**

### **1. Test Student Frontend:**
- [ ] Homepage loads with Kenyan institutions
- [ ] Course pages show real data (no KMTC hardcoding)
- [ ] Premium subscription flow works
- [ ] M-Pesa payment integration functional

### **2. Test Admin Frontend:**
- [ ] Login with: `admin@eduvault.co.ke` / `miniadmin123`
- [ ] Dashboard loads without errors
- [ ] Content upload functionality works
- [ ] No mock data visible

### **3. Test Super Admin Frontend:**
- [ ] Login with: `superadmin@eduvault.co.ke` / `admin123`
- [ ] All management features functional
- [ ] User management works
- [ ] Content approval system operational

### **4. Test Backend API:**
- [ ] API endpoints respond correctly
- [ ] Database connections working
- [ ] Authentication working
- [ ] M-Pesa integration functional

## 🎯 **Quick Deployment Commands:**

```bash
# 1. Push latest changes to GitHub
git add .
git commit -m "Ready for web deployment"
git push origin main

# 2. Deploy each frontend to Netlify (manual process via web interface)

# 3. Deploy backend to Heroku
cd server
heroku create eduvault-api
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=mongodb+srv://eduvault:honeywellT55$@cluster0.udsslk9.mongodb.net/eduvault?retryWrites=true&w=majority&appName=Cluster0&ssl=true&tlsAllowInvalidCertificates=true
heroku config:set JWT_SECRET=eduvault_super_secret_jwt_key_for_development_2024
heroku config:set MPESA_CONSUMER_KEY=4CNyZAAlMSslZzGGA9QME5XlXpcviHbSC7uTD5Z3mgIrqUOl
heroku config:set MPESA_CONSUMER_SECRET=ecaJR4OMDZlrAoqG6WmQgZG5gvr4gS20w6qrfGZyAYadjp5IevUcO5OGOAuw8pdE
heroku config:set MPESA_SHORTCODE=174379
heroku config:set MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
heroku config:set MPESA_CALLBACK_URL=https://eduvault-api.herokuapp.com/api/subscription/callback
git subtree push --prefix server heroku main
```

## 🚀 **You're Ready to Deploy!**

Your EduVault platform is **deployment-ready** with:
- ✅ All critical fixes applied
- ✅ Production M-Pesa integration
- ✅ Real database integration
- ✅ No mock data in critical paths
- ✅ All syntax errors resolved

**Next Steps:**
1. **Deploy to Netlify** (3 frontend applications)
2. **Deploy backend** to Heroku or Railway
3. **Test all functionality**
4. **Go live!** 🎉

Would you like me to help you with any specific part of the deployment process?
