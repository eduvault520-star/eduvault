# EduVault Render Backend Deployment Guide

## 🚀 **Deploying Backend to Render**

### **Step 1: Prepare Your Code**
Your server code is ready in the `server/` directory with all environment variables configured.

### **Step 2: Deploy to Render**

1. **Go to Render**: https://dashboard.render.com
2. **New Service** → **Web Service**
3. **Connect GitHub**: Link your `aurafix3-tech/eduvault` repository
4. **Service Configuration**:
   - **Name**: `eduvault-api`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: `Production`

### **Step 3: Environment Variables for Render**
Copy these to Render dashboard:

```env
NODE_ENV=production
PORT=10000

# Database
MONGODB_URI=mongodb+srv://eduvault:honeywellT55$@cluster0.udsslk9.mongodb.net/eduvault?retryWrites=true&w=majority&appName=Cluster0&ssl=true&tlsAllowInvalidCertificates=true

# JWT
JWT_SECRET=eduvault_super_secret_jwt_key_for_development_2024
JWT_EXPIRE=7d

# Frontend URLs (update with your Netlify URLs)
FRONTEND_URL=https://eduvault-students.netlify.app

# M-Pesa Production
MPESA_CONSUMER_KEY=4CNyZAAlMSslZzGGA9QME5XlXpcviHbSC7uTD5Z3mgIrqUOl
MPESA_CONSUMER_SECRET=ecaJR4OMDZlrAoqG6WmQgZG5gvr4gS20w6qrfGZyAYadjp5IevUcO5OGOAuw8pdE
MPESA_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_CALLBACK_URL=https://eduvault-api.onrender.com/api/subscription/callback

# Cloudinary
CLOUDINARY_CLOUD_NAME=dmatqsg8a
CLOUDINARY_API_KEY=741113318755745
CLOUDINARY_API_SECRET=tqVVCItXUeuM6GMu2TXi_RlACd8

# AI Chatbot
GROK_API_KEY=your_grok_api_key
GROK_API_URL=https://api.x.ai/v1

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### **Step 4: Deploy**
1. **Create Web Service** with the above configuration
2. **Render will automatically build and deploy** your backend
3. **Your API will be available at**: `https://eduvault-api.onrender.com`

### **Step 5: Update Frontend Environment Variables**
Update your Netlify sites with the correct API URL:

```env
REACT_APP_API_URL=https://eduvault-api.onrender.com
REACT_APP_ENVIRONMENT=production
```

## 🔧 **Render Deployment Commands (Alternative)**

If you prefer command line deployment:

```bash
# Install Render CLI (optional)
npm install -g @render/cli

# Deploy to Render
render deploy

# Or use their web interface (recommended for first time)
```

## 🌐 **Expected URLs After Render Deployment:**

### **Backend API:**
- **Render**: `https://eduvault-api.onrender.com`

### **Frontend Applications (Netlify):**
- **Student Portal**: `https://eduvault-students.netlify.app`
- **Admin Portal**: `https://eduvault-admin.netlify.app`
- **Super Admin Portal**: `https://eduvault-superadmin.netlify.app`

## 📋 **Render-Specific Configuration:**

### **1. Package.json Scripts** (already configured):
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build": "echo 'No build step required'"
  }
}
```

### **2. Render Service Settings:**
- **Auto-Deploy**: ✅ Enabled (from GitHub)
- **Health Check Path**: `/api/health` (add this endpoint)
- **Environment Variables**: ✅ Set all from above
- **Free Tier**: 512MB RAM, 0.1 CPU (sufficient for EduVault)

### **3. Database Connection:**
Your MongoDB connection is already configured and working.

## 🧪 **Testing Render Deployment:**

### **1. Backend Health Check:**
```bash
curl https://eduvault-api.onrender.com/api/health
```

### **2. API Endpoints:**
```bash
curl https://eduvault-api.onrender.com/api/courses
curl https://eduvault-api.onrender.com/api/institutions
```

### **3. M-Pesa Integration:**
```bash
curl -X POST https://eduvault-api.onrender.com/api/subscription/test
```

## 🚨 **Important Render Notes:**

### **1. Cold Start:**
- Render services sleep after inactivity
- First request may take 20-30 seconds
- Subsequent requests are fast

### **2. Free Tier Limitations:**
- 512MB RAM, 0.1 CPU
- 100GB bandwidth/month
- Perfect for EduVault MVP

### **3. Environment Variables:**
- Add all variables in Render dashboard
- Use "Secret" for sensitive values like API keys
- Restart service after adding variables

### **4. Database Connection:**
- Your MongoDB URI is already configured
- Connection pooling is handled automatically

## 🎯 **Quick Deployment Checklist:**

- [ ] **Connect GitHub to Render**
- [ ] **Create Web Service** with correct settings
- [ ] **Add all environment variables**
- [ ] **Deploy and test API endpoints**
- [ ] **Update Netlify frontend URLs**
- [ ] **Test complete application flow**

## 🚀 **You're Ready for Render Deployment!**

**Next Steps:**
1. **Deploy backend to Render** (5-10 minutes)
2. **Get your API URL** (e.g., `https://eduvault-api.onrender.com`)
3. **Update Netlify environment variables** with the Render URL
4. **Test the complete application**

**Render is perfect for EduVault** - it's reliable, has good free tier, and handles Node.js applications excellently!

Would you like me to help you with any specific part of the Render deployment process? 🚀
